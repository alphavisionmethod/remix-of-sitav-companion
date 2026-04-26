// ═══════════════════════════════════════════════════════════════
// SITA OS — Business OS Service: Business Profile persistence
//
// Owns all side effects related to persisting the user's adapted
// Business Profile. Lifted out of
// `src/domains/engines/business-profile-engine.ts` during the
// Business OS canonical architecture reorganization so the engine
// stays a pure, deterministic computation.
//
// Storage today: localStorage (single-device, fast restore).
// Future: this is the chokepoint to swap in Supabase, idb, or a
// hybrid sync model without touching the engine or the UI.
// ═══════════════════════════════════════════════════════════════

import type { BusinessProfileResult } from "@/domains/business";

const STORAGE_KEY = "sita-business-profile";

/** Persist an adapted business profile. Fails silently on quota errors. */
export function saveBusinessProfile(profile: BusinessProfileResult): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {
    /* quota exceeded or storage disabled — fail silently */
  }
}

/** Restore a previously saved business profile, or null if none. */
export function loadBusinessProfile(): BusinessProfileResult | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as BusinessProfileResult) : null;
  } catch {
    return null;
  }
}

/** Remove any persisted business profile. */
export function clearBusinessProfile(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* fail silently */
  }
}