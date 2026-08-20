import { api, unwrap } from "@/lib/api";



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
