import { readToken } from "@/store/session";

/**
 * The single fetch wrapper every service goes through.
 *
 * The Express API answers with an envelope — `{ success, message, data }` —
 * so `request` hands the whole envelope back and each service picks the part
 * it needs. Errors always surface as `ApiError`, including the two cases the
 * backend does not format itself: a dead/blocked connection (status 0) and
 * the HTML page Express' default error handler returns when a controller
 * calls `next(error)` (see API-REVIEW.md).
 */

export const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
).replace(/\/+$/, "");

const TIMEOUT_MS = 20_000;

export class ApiError extends Error {
  constructor(message, { status = 0, data = null, cause } = {}) {
    super(message, { cause });
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }

  /** Token missing, expired or rejected — the session is no longer usable. */
  get isUnauthorized() {
    return this.status === 401;
  }

  /** Authenticated but not allowed (the API blocks users this way). */
  get isForbidden() {
    return this.status === 403;
  }

  /** Never reached the server: backend down, wrong port, or CORS refused. */
  get isNetworkError() {
    return this.status === 0;
  }
}

/**
 * A 401 can arrive from any screen, so the session teardown is registered
 * once by <AuthProvider> instead of being handled at every call site.
 */
let unauthorizedHandler = null;

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
  return () => {
    if (unauthorizedHandler === handler) unauthorizedHandler = null;
  };
}

function buildUrl(path, query) {
  const url = `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;
  if (!query) return url;

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue;
    params.set(key, String(value));
  }

  const search = params.toString();
  return search ? `${url}?${search}` : url;
}

const STATUS_FALLBACK = {
  400: "The request was rejected. Check the values and try again.",
  401: "Your session has expired. Sign in again.",
  403: "You do not have permission to do that.",
  404: "Not found.",
  409: "That already exists.",
  500: "The server hit an error. Check the API logs.",
};

async function readBody(response) {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    // Express' default error handler returns an HTML stack trace, which is
    // unreadable in a toast — keep it off screen and let the status speak.
    return { __raw: text };
  }
}

export async function request(
  path,
  { method = "GET", body, query, signal, auth = true, headers } = {},
) {
  const token = auth ? readToken() : null;

  let response;
  try {
    response = await fetch(buildUrl(path, query), {
      method,
      signal: signal ?? AbortSignal.timeout(TIMEOUT_MS),
      headers: {
        Accept: "application/json",
        ...(body === undefined
          ? null
          : { "Content-Type": "application/json" }),
        ...(token ? { Authorization: `Bearer ${token}` } : null),
        ...headers,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (error) {
    // Let deliberate cancellation (unmount, re-run) bubble as-is so hooks can
    // ignore it; everything else is a connection problem worth explaining.
    if (error?.name === "AbortError") throw error;

    throw new ApiError(
      `Could not reach the API at ${API_URL}. Check that the server is running and that it allows requests from ${
        typeof window === "undefined" ? "this origin" : window.location.origin
      }.`,
      { cause: error },
    );
  }

  const payload = await readBody(response);

  if (!response.ok) {
    if (response.status === 401 && auth) unauthorizedHandler?.();

    throw new ApiError(
      payload?.message ||
        STATUS_FALLBACK[response.status] ||
        `Request failed with status ${response.status}.`,
      { status: response.status, data: payload },
    );
  }

  return payload ?? { success: true, data: null };
}

/**
 * A download rather than an envelope — the report routes answer `?format=csv`
 * with a text/csv body and a `Content-Disposition` filename.
 *
 * Those routes are admin-only, so the file cannot be fetched by pointing an
 * `<a download>` at the URL: the Authorization header would be missing. The
 * response is read as a Blob here and handed to the caller to save.
 */
export async function requestBlob(path, { query, signal } = {}) {
  const token = readToken();

  let response;
  try {
    response = await fetch(buildUrl(path, query), {
      signal: signal ?? AbortSignal.timeout(TIMEOUT_MS),
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
  } catch (error) {
    if (error?.name === "AbortError") throw error;
    throw new ApiError(`Could not reach the API at ${API_URL}.`, {
      cause: error,
    });
  }

  if (!response.ok) {
    if (response.status === 401) unauthorizedHandler?.();

    // The error path answers JSON even when the success path answers CSV.
    const payload = await readBody(response);
    throw new ApiError(
      payload?.message ||
        STATUS_FALLBACK[response.status] ||
        `Download failed with status ${response.status}.`,
      { status: response.status, data: payload },
    );
  }

  const disposition = response.headers.get("Content-Disposition") ?? "";
  const named = /filename="?([^";]+)"?/i.exec(disposition);

  return { blob: await response.blob(), filename: named?.[1] ?? null };
}

/** Pulls the payload out of the envelope, with a fallback for empty bodies. */
export const unwrap = (envelope, fallback = null) =>
  envelope?.data ?? fallback;

/**
 * For admin screens whose endpoint does not exist on the API yet. Rejecting
 * with a recognisable 501 lets <DataState> render an explanatory panel
 * instead of the 404 HTML the server would otherwise return.
 */
export function notImplemented(what, hint) {
  return Promise.reject(
    new ApiError(`${what} is not available yet.`, {
      status: 501,
      data: { hint },
    }),
  );
}

export const api = {
  get: (path, options) => request(path, { ...options, method: "GET" }),
  post: (path, body, options) =>
    request(path, { ...options, method: "POST", body }),
  put: (path, body, options) =>
    request(path, { ...options, method: "PUT", body }),
  patch: (path, body, options) =>
    request(path, { ...options, method: "PATCH", body }),
  delete: (path, options) => request(path, { ...options, method: "DELETE" }),
};
