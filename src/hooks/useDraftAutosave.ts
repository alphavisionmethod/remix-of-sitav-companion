// ═══════════════════════════════════════════════════════════════
// SITA OS — Draft Autosave System (Phase Q hardened)
// Dual-layer persistence:
//   • localStorage  — synchronous, immediate, survives reload
//   • IndexedDB     — durable backup via offline-db (survives storage pressure)
// localStorage is authoritative for fast restore; IndexedDB is the
// long-term durability layer used when localStorage is evicted/full.
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useRef } from "react";
import { cacheGet, cacheSet } from "@/data/persistence/offline-db";

const DRAFT_PREFIX = "sita-draft:";
const DRAFT_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days
const DRAFT_BACKUP_TTL_DAYS = 7;

export interface DraftMeta {
  key: string;
  savedAt: number;
  appId: string;
  label?: string;
}

/** Prune expired drafts on load */
function pruneExpired() {
  const now = Date.now();
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const k = localStorage.key(i);
    if (!k?.startsWith(DRAFT_PREFIX)) continue;
    try {
      const meta = JSON.parse(localStorage.getItem(k) || "{}");
      if (now - (meta._savedAt ?? 0) > DRAFT_MAX_AGE) localStorage.removeItem(k);
    } catch { localStorage.removeItem(k!); }
  }
}

pruneExpired();

/**
 * useDraftAutosave — persists form state with debounced saves to BOTH
 * localStorage (fast) and IndexedDB (durable). On mount, if localStorage
 * has no draft but IndexedDB does, restores from IndexedDB.
 *
 * @param draftKey   Unique key like "business:invoice:new"
 * @param appId      App shell ID for grouping
 * @param debounceMs Debounce interval (default 1500ms)
 */
export function useDraftAutosave<T extends Record<string, any>>(
  draftKey: string,
  appId: string,
  debounceMs = 1500
) {
  const storageKey = `${DRAFT_PREFIX}${draftKey}`;

  // Load existing draft from localStorage (sync)
  const [draft, setDraft] = useState<Partial<T>>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      delete parsed._savedAt;
      delete parsed._appId;
      delete parsed._draftKey;
      return parsed as Partial<T>;
    } catch { return {}; }
  });

  const [hasDraft, setHasDraft] = useState(() => {
    return localStorage.getItem(storageKey) !== null;
  });

  // Async fallback: if localStorage was empty, try IndexedDB
  useEffect(() => {
    if (hasDraft) return;
    let cancelled = false;
    (async () => {
      try {
        const backup = await cacheGet<Record<string, unknown>>(storageKey);
        if (cancelled || !backup) return;
        const { _savedAt, _appId, _draftKey, ...rest } = backup;
        if (Object.keys(rest).length === 0) return;
        setDraft(rest as Partial<T>);
        setHasDraft(true);
        // re-hydrate localStorage for fast next-load
        try { localStorage.setItem(storageKey, JSON.stringify(backup)); } catch { /* ignore */ }
      } catch { /* indexedDB unavailable — non-fatal */ }
    })();
    return () => { cancelled = true; };
  }, [storageKey, hasDraft]);

  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const draftRef = useRef(draft);
  draftRef.current = draft;

  // Debounced persist to BOTH layers
  const persist = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const toSave = { ...draftRef.current, _savedAt: Date.now(), _appId: appId, _draftKey: draftKey };
      try {
        localStorage.setItem(storageKey, JSON.stringify(toSave));
        setHasDraft(true);
      } catch { /* localStorage full — IndexedDB backup still attempted below */ }
      // IndexedDB durable backup (fire-and-forget)
      cacheSet(storageKey, toSave, DRAFT_BACKUP_TTL_DAYS * 24 * 60).catch(() => {/* non-fatal */});
    }, debounceMs);
  }, [storageKey, appId, draftKey, debounceMs]);

  // Update a field or merge partial
  const updateDraft = useCallback((partial: Partial<T>) => {
    setDraft(prev => ({ ...prev, ...partial }));
  }, []);

  // Auto-persist on draft changes
  useEffect(() => {
    if (Object.keys(draft).length > 0) persist();
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [draft, persist]);

  // Clear draft (after successful save)
  const clearDraft = useCallback(() => {
    localStorage.removeItem(storageKey);
    setDraft({});
    setHasDraft(false);
    // Best-effort IndexedDB clear
    import("@/data/persistence/offline-db")
      .then(({ cacheDelete }) => cacheDelete(storageKey))
      .catch(() => {/* non-fatal */});
  }, [storageKey]);

  // Restore notification
  const draftAge = hasDraft ? (() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed._savedAt ? Date.now() - parsed._savedAt : null;
    } catch { return null; }
  })() : null;

  return { draft, updateDraft, clearDraft, hasDraft, draftAge };
}

/** List all saved drafts for an app */
export function listDrafts(appId?: string): DraftMeta[] {
  const drafts: DraftMeta[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (!k?.startsWith(DRAFT_PREFIX)) continue;
    try {
      const raw = JSON.parse(localStorage.getItem(k) || "{}");
      if (appId && raw._appId !== appId) continue;
      drafts.push({
        key: k.replace(DRAFT_PREFIX, ""),
        savedAt: raw._savedAt ?? 0,
        appId: raw._appId ?? "unknown",
        label: raw._draftKey,
      });
    } catch { continue; }
  }
  return drafts.sort((a, b) => b.savedAt - a.savedAt);
}

/** Clear all drafts for an app */
export function clearAllDrafts(appId: string) {
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const k = localStorage.key(i);
    if (!k?.startsWith(DRAFT_PREFIX)) continue;
    try {
      const raw = JSON.parse(localStorage.getItem(k) || "{}");
      if (raw._appId === appId) localStorage.removeItem(k);
    } catch { localStorage.removeItem(k!); }
  }
}
