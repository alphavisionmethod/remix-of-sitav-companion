// ═══════════════════════════════════════════════════════════════
// SITA OS — Draft Autosave System
// Automatic draft persistence for in-progress forms across apps
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useRef } from "react";

const DRAFT_PREFIX = "sita-draft:";
const DRAFT_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

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
 * useDraftAutosave — persists form state to localStorage with debounced saves.
 *
 * @param draftKey   Unique key like "business:invoice:new"
 * @param appId      App shell ID for grouping
 * @param debounceMs Debounce interval (default 1500ms)
 *
 * @example
 * const { draft, updateDraft, clearDraft, hasDraft } = useDraftAutosave<InvoiceForm>(
 *   "business:invoice:new", "business"
 * );
 */
export function useDraftAutosave<T extends Record<string, any>>(
  draftKey: string,
  appId: string,
  debounceMs = 1500
) {
  const storageKey = `${DRAFT_PREFIX}${draftKey}`;

  // Load existing draft
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

  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const draftRef = useRef(draft);
  draftRef.current = draft;

  // Debounced persist
  const persist = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const toSave = { ...draftRef.current, _savedAt: Date.now(), _appId: appId, _draftKey: draftKey };
      try {
        localStorage.setItem(storageKey, JSON.stringify(toSave));
        setHasDraft(true);
      } catch { /* storage full — silently fail */ }
    }, debounceMs);
  }, [storageKey, appId, draftKey, debounceMs]);

  // Update a field or merge partial
  const updateDraft = useCallback((partial: Partial<T>) => {
    setDraft(prev => {
      const next = { ...prev, ...partial };
      return next;
    });
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
