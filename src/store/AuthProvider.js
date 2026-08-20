"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from "react";
import { useRouter } from "next/navigation";
import { ApiError, setUnauthorizedHandler } from "@/lib/api";
import * as authService from "@/services/auth.service";
import {
  clearSession,
  readSession,
  saveSession,
  sessionStore,
} from "@/store/session";
import { useHydrated, usePersistentStore } from "@/store/persistent";

const AuthContext = createContext(null);


export function AuthProvider({ children }) {
  const session = usePersistentStore(sessionStore);
  const hydrated = useHydrated();
  const router = useRouter();

  const signOut = useCallback(
    ({ redirect = true } = {}) => {
      clearSession();
      if (redirect) router.replace("/login");
    },
    [router],
  );


  useEffect(
    () =>
      setUnauthorizedHandler(() => {
        if (readSession()) clearSession();
      }),
    [],
  );

  const signIn = useCallback(async ({ identifier, password }) => {
    const result = await authService.login({ identifier, password });

    if (!result?.token || !result?.user) {
      throw new ApiError("The API did not return a session token.", {
        status: 500,
      });
    }

    if (result.user.role !== "ADMIN") {
      throw new ApiError(
        "That account is not an administrator. Use an ADMIN account to reach the panel.",
        { status: 403 },
      );
    }

    saveSession({ token: result.token, user: result.user });
    return result.user;
  }, []);

  const value = useMemo(
    () => ({
      user: session?.user ?? null,
      token: session?.token ?? null,
      isAuthenticated: Boolean(session?.token),
      hydrated,
      signIn,
      signOut,
    }),
    [session, hydrated, signIn, signOut],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside <AuthProvider>");
  return context;
}
