import { api, unwrap } from "@/lib/api";

/**
 * POST /api/auth — the only public routes on the API.
 *
 * `login` accepts either an e-mail or a phone number in the same field, so
 * the form asks for one "identifier" and this layer decides which key the
 * backend gets. The response carries `{ token, user }`; the panel checks the
 * role itself because the API signs a token for CUSTOMER accounts too.
 */

/** Anything with an "@" is treated as an e-mail, everything else as a phone. */
export function identifierPayload(identifier) {
  const value = identifier.trim();
  return value.includes("@")
    ? { email: value.toLowerCase() }
    : { phone: value.replace(/[\s-]/g, "") };
}

export async function login({ identifier, password }) {
  const envelope = await api.post(
    "/auth/login",
    { ...identifierPayload(identifier), password },
    { auth: false },
  );

  return unwrap(envelope);
}

export async function register({ name, email, phone, password }) {
  // Always creates a CUSTOMER — the API hardcodes the role. Kept here so the
  // panel can create shopper accounts, not admins.
  const envelope = await api.post(
    "/auth/register",
    { name, email, phone, password },
    { auth: false },
  );

  return unwrap(envelope);
}

export async function sendOtp(phone) {
  return api.post("/auth/send-otp", { phone }, { auth: false });
}

export async function verifyOtp({ phone, otp }) {
  return api.post("/auth/verify-otp", { phone, otp }, { auth: false });
}
