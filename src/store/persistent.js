"use client";

import { useSyncExternalStore } from "react";


export function createPersistentStore(key, initial) {
  let snapshot = initial;
  let rawCache = null;
  const listeners = new Set();

  const readRaw = () => {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  };

  const parse = (raw) => {
    if (!raw) return initial;
    try {
      return JSON.parse(raw);
    } catch {
      return initial;
    }
  };

  const emit = () => {
    for (const listener of listeners) listener();
  };

  const syncFromStorage = () => {
    const raw = readRaw();
    if (raw === rawCache) return;
    rawCache = raw;
    snapshot = parse(raw);
    emit();
  };

  // pull the stored value in before React ever renders on the client
  if (typeof window !== "undefined") syncFromStorage();

  const write = (next) => {
    snapshot = next;
    try {
      if (next === null || next === undefined) {
        rawCache = null;
        window.localStorage.removeItem(key);
      } else {
        rawCache = JSON.stringify(next);
        window.localStorage.setItem(key, rawCache);
      }
    } catch {
    }
    emit();
  };

  return {
    subscribe(listener) {
      listeners.add(listener);
      const onStorage = (event) => {
        if (event.key === key || event.key === null) syncFromStorage();
      };
      window.addEventListener("storage", onStorage);
      return () => {
        listeners.delete(listener);
        window.removeEventListener("storage", onStorage);
      };
    },
    getSnapshot: () => snapshot,
    getServerSnapshot: () => initial,
    read: () => snapshot,
    set: write,
    update(updater) {
      write(updater(snapshot));
    },
  };
}

export function usePersistentStore(store) {
  return useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot,
  );
}

const noopSubscribe = () => () => {};

export function useHydrated() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}
