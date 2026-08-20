"use client";

import { useCallback, useMemo, useState, useEffect } from "react";


export function useApiQuery(fetcher, { enabled = true } = {}) {
  const [nonce, setNonce] = useState(0);
  const [settled, setSettled] = useState({
    attempt: null,
    data: null,
    error: null,
  });

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
