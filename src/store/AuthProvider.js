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

/**
 * The admin session.
 *
 * `POST /api/auth/login` signs a token for *any* account, CUSTOMER included,
 * so the role check lives here: a non-ADMIN login is rejected and nothing is
 * stored. That is a UI gate, not a security boundary — the API still has to
 * enforce the role on its own write routes (see API-REVIEW.md).
 *
 * `hydrated` matters: the token lives in localStorage, so during SSR and the
 * first client render the panel does not yet know whether anyone is signed in.
 * Guards must wait for it instead of bouncing everyone to /login.
 */
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

  // Any 401 from any screen means the 24h token is spent — drop the session
  // once, centrally, rather than at each call site.
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
