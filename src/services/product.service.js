import { api, unwrap } from "@/lib/api";

/**
 * /api/products — full CRUD, unauthenticated on the server side (see
 * API-REVIEW.md).
 *
 * `GET /products` returns every product, newest first, with `category`
 * populated down to `{ _id, name }`. There is no pagination, search or filter
 * on the API, so the list screen does that work in the browser.
 */

export async function listProducts(options) {
  return unwrap(await api.get("/products", options), []);
}

export async function getProduct(id, options) {
  return unwrap(await api.get(`/products/${id}`, options));
}

/**
 * `slug` and `sku` are required and unique; the API rejects duplicates. The
 * form derives both from the name unless they are typed in.
 */
export async function createProduct(payload) {
  return unwrap(await api.post("/products", normalise(payload)));
}

export async function updateProduct(id, payload) {
  return unwrap(await api.put(`/products/${id}`, normalise(payload)));
}

export async function deleteProduct(id) {
  return api.delete(`/products/${id}`);
}

export function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Mongoose rejects "" where it wants a number. `discountPrice` is nullable in
 * the schema; `price` and `stock` are not, so an empty stock means zero rather
 * than an unexplained 500 from the server.
 */
function normalise(payload) {
  const out = { ...payload };
  const blank = (value) => value === "" || value === null;

  if ("discountPrice" in out) {
    out.discountPrice = blank(out.discountPrice) ? null : Number(out.discountPrice);
  }

  // Nullable strings: "" would be stored as an empty string otherwise.
  for (const key of ["badge", "skill", "type", "optionLabel"]) {
    if (key in out && blank(out[key])) out[key] = null;
  }

  // Both default to 0 in the schema, so a blank means zero, not null.
  for (const key of ["rating", "reviewCount"]) {
    if (key in out) out[key] = blank(out[key]) ? 0 : Number(out[key]);
  }

  // A half-filled repeatable row fails schema validation with a 400, so drop
  // the rows the user added and never completed.
  if (Array.isArray(out.colorways)) {
    out.colorways = out.colorways
      .map((row) => ({ name: row.name?.trim(), hex: row.hex?.trim() }))
      .filter((row) => row.name && row.hex);
  }

  if (Array.isArray(out.specs)) {
    out.specs = out.specs
      .map((row) => ({ label: row.label?.trim(), value: row.value?.trim() }))
      .filter((row) => row.label && row.value);
  }

  for (const key of ["options", "highlights"]) {
    if (Array.isArray(out[key])) {
      out[key] = out[key].map((entry) => entry.trim()).filter(Boolean);
    }
  }

  if ("stock" in out) out.stock = blank(out.stock) ? 0 : Number(out.stock);
  if ("price" in out && !blank(out.price)) out.price = Number(out.price);

  if (out.name && !out.slug) out.slug = slugify(out.name);
  if (out.sku) out.sku = out.sku.toUpperCase();

  return out;
}
