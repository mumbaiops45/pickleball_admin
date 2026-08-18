"use client";

import { useEffect } from "react";

/**
 * Closes a popover on an outside click or on Escape.
 *
 * Listens on `pointerdown` rather than `click` so the menu closes before a
 * button underneath it fires, and only attaches while `active` — an always-on
 * document listener per menu adds up.
 */
export function useClickOutside(ref, onClose, active = true) {
  useEffect(() => {
    if (!active) return;

    const onPointerDown = (event) => {
      if (!ref.current || ref.current.contains(event.target)) return;
      onClose();
    };

    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [ref, onClose, active]);
}
