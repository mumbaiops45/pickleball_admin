"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Reads a media query without a hydration mismatch: the server snapshot is
 * always `false`, so the prerendered HTML is the small-screen layout and the
 * client corrects it on the first commit.
 */
export function useMediaQuery(query) {
  const subscribe = useCallback(
    (listener) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", listener);
      return () => list.removeEventListener("change", listener);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** Tailwind's `lg` breakpoint — where the sidebar stops being a drawer. */
export const useIsDesktop = () => useMediaQuery("(min-width: 1024px)");
