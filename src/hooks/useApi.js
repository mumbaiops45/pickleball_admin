"use client";

import { useCallback, useMemo, useState, useEffect } from "react";

/**
 * The two primitives every data hook is built from.
 *
 * There is no cache and no request dedupe: the panel has a handful of screens,
 * each fetches when it mounts and refetches after a mutation. If that stops
 * being enough, this is the file to replace with SWR or React Query — nothing
 * above it calls `fetch` directly.
 */

/**
 * Runs `fetcher(signal)` on mount and whenever the fetcher's identity changes,
 * so callers control re-running by wrapping it in `useCallback` with the right
 * dependencies (`useProduct` keys on the id, for instance).
 *
 * `loading` is derived rather than stored: a request is in flight whenever the
 * settled result does not belong to the current attempt. That keeps every
 * setState inside a promise callback, so a re-render never cascades out of the
 * effect body.
 */
export function useApiQuery(fetcher, { enabled = true } = {}) {
  const [nonce, setNonce] = useState(0);
  const [settled, setSettled] = useState({
    attempt: null,
    data: null,
    error: null,
  });

  // Fresh identity per (fetcher, refetch) pair — the token *is* the attempt.
  const attempt = useMemo(() => ({ fetcher, nonce }), [fetcher, nonce]);

  useEffect(() => {
    if (!enabled) return;

    const controller = new AbortController();
    let active = true;

    attempt
      .fetcher(controller.signal)
      .then((data) => {
        if (active) setSettled({ attempt, data, error: null });
      })
      .catch((error) => {
        // an aborted request was replaced by a newer one — not a failure
        if (!active || error?.name === "AbortError") return;
        setSettled({ attempt, data: null, error });
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [enabled, attempt]);

  const current = settled.attempt === attempt;
  const refetch = useCallback(() => setNonce((n) => n + 1), []);

  return {
    data: current ? settled.data : null,
    error: current ? settled.error : null,
    loading: enabled && !current,
    refetch,
  };
}

/**
 * Wraps a write. `mutate` never throws — it resolves to the result, or to
 * `null` after storing the error — so forms can `await` it without a
 * try/catch and read `error` for the message.
 *
 * `mutator` has to be stable (a module-level service function, or wrapped in
 * `useCallback`), since it is a dependency of `mutate`.
 */
export function useApiMutation(mutator) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);

      try {
        return await mutator(...args);
      } catch (cause) {
        setError(cause);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [mutator],
  );

  const reset = useCallback(() => setError(null), []);

  return { mutate, loading, error, reset };
}
