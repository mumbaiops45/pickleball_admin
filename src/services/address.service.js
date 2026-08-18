import { api, unwrap } from "@/lib/api";

/**
 * /api/addresses — scoped to `req.user`, so this is the signed-in admin's own
 * address book. Included for completeness: there is no route that reads a
 * customer's addresses, and the order payload embeds a copy of the shipping
 * address anyway.
 */

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
