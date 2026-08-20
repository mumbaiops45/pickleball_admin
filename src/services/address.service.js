import { api, unwrap } from "@/lib/api";



export async function listAddresses(options) {
  return unwrap(await api.get("/addresses", options), []);
}

export async function getAddress(id, options) {
  return unwrap(await api.get(`/addresses/${id}`, options));
}

export async function createAddress(payload) {
  return unwrap(await api.post("/addresses", payload));
}

export async function updateAddress(id, payload) {
  return unwrap(await api.put(`/addresses/${id}`, payload));
}

export async function deleteAddress(id) {
  return api.delete(`/addresses/${id}`);
}

export async function setDefaultAddress(id) {
  return unwrap(await api.patch(`/addresses/${id}/default`));
}
