import { api, unwrap } from "@/lib/api";

/**
 * Customer administration — `/api/auth/users`, admin-only on the server
 * (`authMiddleware` + `adminMiddleware`).
 *
 * The routes hang off the auth router rather than a `/users` one, so the paths
 * read a little oddly; that is the API's shape, not a mistake here.
 *
 * `updateUser` is a single PUT that accepts any subset of
 * `{ name, email, phone, role, isBlocked }`, so blocking and role changes are
 * both just partial updates.
 */

export async function listCustomers(options) {
  return unwrap(await api.get("/auth/users", options), []);
}

export async function getCustomer(id, options) {
  return unwrap(await api.get(`/auth/users/${id}`, options));
}

/**
 * There is no admin "create user" route, so a new account goes through the
 * public `POST /auth/register` — which always writes role CUSTOMER and does
 * not issue a token, so the admin's own session is untouched.
 *
 * An admin account therefore takes two calls: register, then PUT the role.
 * If the second one fails the account still exists as a customer, which the
 * form reports rather than pretending nothing was created.
 */
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

/** The API refuses to delete the account making the request. */
export async function deleteCustomer(id) {
  return api.delete(`/auth/users/${id}`);
}
