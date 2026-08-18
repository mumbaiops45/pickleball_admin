"use client";

import { createPersistentStore } from "@/store/persistent";

/**
 * The signed-in admin, kept apart from <AuthProvider> so that `lib/api` can
 * read the bearer token without importing React.
 *
 * Shape: `{ token, user: { id, name, email, phone, role } }`, or null.
 *
 * The API has no `/auth/me`, so the profile shown in the UI is the copy
 * returned at login rather than something revalidated on each load. The token
 * expires after 24h (JWT_EXPIRES_IN) and the first 401 tears the session down
 * — see `setUnauthorizedHandler` in lib/api.js.
 */
export const SESSION_KEY = "pickleball.admin.session";

export const sessionStore = createPersistentStore(SESSION_KEY, null);

export const readSession = () => sessionStore.read();

export const readToken = () => sessionStore.read()?.token ?? null;

export function saveSession({ token, user }) {
  sessionStore.set({ token, user });
}

export function clearSession() {
  sessionStore.set(null);
}
