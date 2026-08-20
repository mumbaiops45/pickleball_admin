"use client";

import { createPersistentStore } from "@/store/persistent";


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
