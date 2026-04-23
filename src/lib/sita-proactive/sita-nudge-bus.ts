// ═══════════════════════════════════════════════════════════════
// SITA OS — Proactive Nudge Bus (Phase D)
// ═══════════════════════════════════════════════════════════════
// Tiny pub/sub for proactive Sita whispers. Signal sources push
// candidate nudges; the HUD (`SitaWhisper`) and any future
// surfaces subscribe. Centralised throttling, dedupe, quiet-hours
// and dismissal memory live here so signal sources stay dumb.
//
// No React. No deps. SSR-safe.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState } from "react";

export type SitaNudgeKind =
  | "suggestion"   // soft ambient idea
  | "followup"     // continues a recent action
  | "reminder"     // time/context based
  | "insight"      // ambient awareness ("you've been here 12m")
  | "wellness";    // breaks, end-of-day, hydration

export type SitaNudgePriority = "low" | "normal" | "high";

export interface SitaNudgeAction {
  /** Stable id used for analytics + dedupe of action choice. */
  id: string;
  label: string;
  /** Optional voice intent string — runs through the voice intent router. */
  intent?: string;
  /** Or arbitrary handler dispatched on the window bus. */
  event?: { name: string; detail?: unknown };
}

export interface SitaNudge {
  /** Stable id used for dismissal memory + dedupe. */
  id: string;
  kind: SitaNudgeKind;
  priority: SitaNudgePriority;
  /** One short sentence Sita "whispers". Keep under ~90 chars. */
  text: string;
  /** Optional richer secondary line. */
  detail?: string;
  /** Up to 3 quick actions. */
  actions?: SitaNudgeAction[];
  /** When the nudge was created (ms epoch). */
  createdAt: number;
  /** When the nudge auto-expires (ms epoch). */
  expiresAt: number;
  /** Optional source tag for debugging / analytics. */
  source?: string;
}

const DEFAULT_TTL_MS = 45_000;
const MAX_QUEUE = 6;
const MIN_GAP_MS = 25_000;            // global cool-down between whispers
const DISMISS_MEMORY_MS = 6 * 60 * 60 * 1000; // 6h "don't show again"
const STORE_KEY = "sita_nudge_dismissed_v1";

let queue: SitaNudge[] = [];
let active: SitaNudge | null = null;
let lastShownAt = 0;
const listeners = new Set<(active: SitaNudge | null, queue: SitaNudge[]) => void>();

// ── Dismissal memory (per-id, persisted) ────────────────────────
function readDismissed(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, number>;
    const cutoff = Date.now() - DISMISS_MEMORY_MS;
    const out: Record<string, number> = {};
    for (const [k, v] of Object.entries(parsed)) {
      if (typeof v === "number" && v >= cutoff) out[k] = v;
    }
    return out;
  } catch {
    return {};
  }
}

function writeDismissed(map: Record<string, number>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORE_KEY, JSON.stringify(map));
  } catch {
    /* ignore quota */
  }
}

// ── Quiet hours (pulled from sentinel prefs if available) ───────
function isQuietHours(now = new Date()): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = window.localStorage.getItem("sita_sentinel_prefs_v1");
    if (!raw) return false;
    const prefs = JSON.parse(raw) as { quietStart?: string; quietEnd?: string };
    if (!prefs.quietStart || !prefs.quietEnd) return false;
    const [sh, sm] = prefs.quietStart.split(":").map(Number);
    const [eh, em] = prefs.quietEnd.split(":").map(Number);
    if ([sh, sm, eh, em].some((n) => Number.isNaN(n))) return false;
    const cur = now.getHours() * 60 + now.getMinutes();
    const start = sh * 60 + sm;
    const end = eh * 60 + em;
    if (start === end) return false;
    return start < end ? cur >= start && cur < end : cur >= start || cur < end;
  } catch {
    return false;
  }
}

function emit() {
  for (const l of listeners) l(active, queue);
}

function maybePromote(force = false) {
  if (active) return;
  if (queue.length === 0) return;
  const now = Date.now();
  if (!force && now - lastShownAt < MIN_GAP_MS) return;
  // Drop expired
  while (queue.length > 0 && queue[0].expiresAt < now) queue.shift();
  if (queue.length === 0) return;
  // Highest priority first, then FIFO
  queue.sort((a, b) => priorityRank(b.priority) - priorityRank(a.priority) || a.createdAt - b.createdAt);
  const next = queue.shift()!;
  active = next;
  lastShownAt = now;
  emit();
}

function priorityRank(p: SitaNudgePriority): number {
  return p === "high" ? 2 : p === "normal" ? 1 : 0;
}

/** Public: enqueue a nudge. Respects dedupe, dismissal memory, quiet hours. */
export function publishNudge(input: Omit<SitaNudge, "createdAt" | "expiresAt"> & { ttlMs?: number }): boolean {
  const dismissed = readDismissed();
  if (dismissed[input.id]) return false;
  if (input.priority !== "high" && isQuietHours()) return false;
  // Dedupe by id across active+queue
  if (active?.id === input.id) return false;
  if (queue.some((n) => n.id === input.id)) return false;
  if (queue.length >= MAX_QUEUE) queue.shift();

  const now = Date.now();
  const nudge: SitaNudge = {
    ...input,
    createdAt: now,
    expiresAt: now + (input.ttlMs ?? DEFAULT_TTL_MS),
  };
  queue.push(nudge);
  maybePromote(input.priority === "high");
  if (!active) emit();
  return true;
}

/** Public: user dismissed (or auto-expired) the active nudge. */
export function dismissActiveNudge(remember = true) {
  if (!active) return;
  if (remember) {
    const map = readDismissed();
    map[active.id] = Date.now();
    writeDismissed(map);
  }
  active = null;
  emit();
  // Allow the next one in shortly so we don't spam.
  window.setTimeout(() => maybePromote(), 1200);
}

/** Public: forget all dismissals (e.g. settings reset). */
export function clearNudgeDismissals() {
  writeDismissed({});
}

/** Subscribe to active+queue updates. */
export function subscribeNudges(fn: (active: SitaNudge | null, queue: SitaNudge[]) => void): () => void {
  listeners.add(fn);
  fn(active, queue);
  return () => { listeners.delete(fn); };
}

/** React hook — returns the currently shown nudge, or null. */
export function useActiveNudge(): SitaNudge | null {
  const [n, setN] = useState<SitaNudge | null>(active);
  useEffect(() => subscribeNudges((a) => setN(a)), []);
  return n;
}

// ── Auto-expiry sweeper ─────────────────────────────────────────
if (typeof window !== "undefined") {
  window.setInterval(() => {
    const now = Date.now();
    if (active && active.expiresAt < now) {
      // Expired without interaction — soft dismiss without long-term memory
      active = null;
      emit();
      maybePromote();
      return;
    }
    if (queue.some((n) => n.expiresAt < now)) {
      queue = queue.filter((n) => n.expiresAt >= now);
      emit();
    }
    maybePromote();
  }, 5_000);
}