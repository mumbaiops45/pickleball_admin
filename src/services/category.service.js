import { api, unwrap } from "@/lib/api";

/**
 * /api/categories — full CRUD.
 *
 * Note these routes carry no auth middleware on the server, so they answer to
 * anyone. The panel still sends the bearer token (harmless) and the API-REVIEW
 * notes track the fix.
 */

export async function listCategories(options) {
  return unwrap(await api.get("/categories", options), []);
}

export async function getCategory(id, options) {
  return unwrap(await api.get(`/categories/${id}`, options));
}

export async function createCategory(payload) {
  return unwrap(await api.post("/categories", payload));
}

export async function updateCategory(id, payload) {
  return unwrap(await api.put(`/categories/${id}`, payload));
}

export async function deleteCategory(id) {
  return api.delete(`/categories/${id}`);
}
