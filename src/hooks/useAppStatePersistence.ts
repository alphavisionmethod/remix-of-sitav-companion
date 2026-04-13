// ═══════════════════════════════════════════════════════════════
// SITA OS — App State Persistence Engine
// Preserves sub-page, scroll position, and filters across app switches
// ═══════════════════════════════════════════════════════════════

import { useCallback, useEffect, useRef } from "react";

export interface AppState {
  activePage: string;
  scrollY: number;
  filters?: Record<string, string>;
  selectedRecord?: string;
  timestamp: number;
}

const STORAGE_KEY = "sita-app-state";
const RUNNING_KEY = "sita-running-apps";

function getStore(): Record<string, AppState> {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function setStore(store: Record<string, AppState>) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch { /* noop */ }
}

/** Mark a domain as running this session */
export function markRunning(domain: string) {
  try {
    const set = getRunningApps();
    set.add(domain);
    sessionStorage.setItem(RUNNING_KEY, JSON.stringify([...set]));
  } catch { /* noop */ }
}

/** Get all running domain apps */
export function getRunningApps(): Set<string> {
  try {
    const raw = sessionStorage.getItem(RUNNING_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

/** Clear a domain from running apps */
export function clearRunningApp(domain: string) {
  try {
    const set = getRunningApps();
    set.delete(domain);
    sessionStorage.setItem(RUNNING_KEY, JSON.stringify([...set]));
  } catch { /* noop */ }
}

/** Save app state for a domain */
export function saveAppState(domain: string, state: Partial<AppState>) {
  const store = getStore();
  store[domain] = {
    ...(store[domain] || { activePage: "overview", scrollY: 0, timestamp: 0 }),
    ...state,
    timestamp: Date.now(),
  };
  setStore(store);
}

/** Restore app state for a domain */
export function restoreAppState(domain: string): AppState | null {
  const store = getStore();
  return store[domain] || null;
}

/** Hook for domain center components to auto-persist and restore state */
export function useAppStatePersistence(domain: string, activePage: string) {
  const scrollRef = useRef(0);
  const mounted = useRef(true);

  // Mark domain as running on mount
  useEffect(() => {
    markRunning(domain);
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, [domain]);

  // Persist active page on change
  useEffect(() => {
    saveAppState(domain, { activePage });
  }, [domain, activePage]);

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      scrollRef.current = window.scrollY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      // Persist scroll on unmount
      saveAppState(domain, { scrollY: scrollRef.current });
    };
  }, [domain]);

  // Restore scroll on mount
  const restoreScroll = useCallback(() => {
    const state = restoreAppState(domain);
    if (state && state.scrollY > 0) {
      requestAnimationFrame(() => {
        window.scrollTo({ top: state.scrollY, behavior: "instant" as ScrollBehavior });
      });
    }
  }, [domain]);

  return { restoreScroll };
}
