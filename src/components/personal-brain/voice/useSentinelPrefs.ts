// ═══════════════════════════════════════════════════════════════
// Personal Brain — Sentinel preferences (client-side, localStorage)
// ═══════════════════════════════════════════════════════════════
// Persists user-customizable wake phrases and voice sensitivity for
// the always-on Sentinel mode. Lives client-side because these are
// recognizer-tuning knobs, not security-relevant data. Synced across
// tabs via the `storage` event.
// ═══════════════════════════════════════════════════════════════

import { useCallback, useEffect, useState } from "react";

export interface SentinelPrefs {
  /** Wake phrases (lowercase, no punctuation). */
  phrases: string[];
  /** Cooldown in ms between two wakes. Higher = fewer false triggers. */
  cooldownMs: number;
  /** Minimum spoken-word length that may match (1-5). Higher = stricter. */
  minMatchWords: number;
  /** Whether to show the live transcript chip in the Sentinel orb. */
  showLiveTranscript: boolean;
  schema: 1;
}

const KEY = "pb_sentinel_prefs_v1";

export const SENTINEL_DEFAULTS: SentinelPrefs = {
  phrases: ["hey sita", "hey sentinel", "hey jarvis"],
  cooldownMs: 2500,
  minMatchWords: 2,
  showLiveTranscript: true,
  schema: 1,
};

function readPrefs(): SentinelPrefs {
  if (typeof window === "undefined") return SENTINEL_DEFAULTS;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return SENTINEL_DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<SentinelPrefs>;
    if (parsed?.schema !== 1) return SENTINEL_DEFAULTS;
    return {
      ...SENTINEL_DEFAULTS,
      ...parsed,
      phrases: Array.isArray(parsed.phrases) && parsed.phrases.length > 0
        ? parsed.phrases.filter((p) => typeof p === "string" && p.trim().length > 0)
        : SENTINEL_DEFAULTS.phrases,
    };
  } catch {
    return SENTINEL_DEFAULTS;
  }
}

function writePrefs(next: SentinelPrefs) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch { /* quota / privacy-mode — ignore */ }
}

export function normalizePhrase(text: string): string {
  return text.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();
}

export function useSentinelPrefs() {
  const [prefs, setPrefs] = useState<SentinelPrefs>(() => readPrefs());

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) setPrefs(readPrefs());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const update = useCallback((patch: Partial<SentinelPrefs>) => {
    setPrefs((cur) => {
      const next: SentinelPrefs = { ...cur, ...patch, schema: 1 };
      if (patch.phrases) {
        const seen = new Set<string>();
        next.phrases = patch.phrases
          .map((p) => normalizePhrase(p))
          .filter((p) => {
            if (!p || p.length < 2 || seen.has(p)) return false;
            seen.add(p);
            return true;
          });
        if (next.phrases.length === 0) next.phrases = SENTINEL_DEFAULTS.phrases;
      }
      next.cooldownMs = Math.min(8000, Math.max(500, Math.round(next.cooldownMs)));
      next.minMatchWords = Math.min(5, Math.max(1, Math.round(next.minMatchWords)));
      writePrefs(next);
      return next;
    });
  }, []);

  const addPhrase = useCallback((raw: string) => {
    const phrase = normalizePhrase(raw);
    if (!phrase || phrase.length < 2) return false;
    let added = false;
    setPrefs((cur) => {
      if (cur.phrases.includes(phrase)) return cur;
      const next = { ...cur, phrases: [...cur.phrases, phrase] };
      writePrefs(next);
      added = true;
      return next;
    });
    return added;
  }, []);

  const removePhrase = useCallback((phrase: string) => {
    setPrefs((cur) => {
      const filtered = cur.phrases.filter((p) => p !== phrase);
      const next = { ...cur, phrases: filtered.length ? filtered : SENTINEL_DEFAULTS.phrases };
      writePrefs(next);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    writePrefs(SENTINEL_DEFAULTS);
    setPrefs(SENTINEL_DEFAULTS);
  }, []);

  return { prefs, update, addPhrase, removePhrase, reset };
}
