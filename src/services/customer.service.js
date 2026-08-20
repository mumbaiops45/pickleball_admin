import { api, unwrap } from "@/lib/api";



export async function listCustomers(options) {
  return unwrap(await api.get("/auth/users", options), []);
}

export async function getCustomer(id, options) {
  return unwrap(await api.get(`/auth/users/${id}`, options));
}


export async function createCustomer({ role, ...payload }) {
  const created = unwrap(await api.post("/auth/register", payload));

  if (role !== "ADMIN") return created;

  return unwrap(await api.put(`/auth/users/${created.id}`, { role }));
}

export async function updateCustomer(id, payload) {
  return unwrap(await api.put(`/auth/users/${id}`, payload));
}

export async function setCustomerBlocked(id, isBlocked) {
  return unwrap(await api.put(`/auth/users/${id}`, { isBlocked }));
}

export async function setCustomerRole(id, role) {
  return unwrap(await api.put(`/auth/users/${id}`, { role }));
}

export async function deleteCustomer(id) {
  return api.delete(`/auth/users/${id}`);
}
