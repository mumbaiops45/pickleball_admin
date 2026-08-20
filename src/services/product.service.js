import { api, unwrap } from "@/lib/api";



export async function listProducts(options) {
  return unwrap(await api.get("/products", options), []);
}

export async function getProduct(id, options) {
  return unwrap(await api.get(`/products/${id}`, options));
}

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


function normalise(payload) {
  const out = { ...payload };
  const blank = (value) => value === "" || value === null;

  if ("discountPrice" in out) {
    out.discountPrice = blank(out.discountPrice) ? null : Number(out.discountPrice);
  }

  for (const key of ["badge", "skill", "type", "optionLabel"]) {
    if (key in out && blank(out[key])) out[key] = null;
  }

  for (const key of ["rating", "reviewCount"]) {
    if (key in out) out[key] = blank(out[key]) ? 0 : Number(out[key]);
  }


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
