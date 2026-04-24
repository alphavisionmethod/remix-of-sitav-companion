// ═══════════════════════════════════════════════════════════════
// SITA OS — Multimodal Perception (Phase H)
// ═══════════════════════════════════════════════════════════════
// Captures lightweight, opt-in perception signals (clipboard
// snippets, screen-context summaries, focus changes) and writes
// them to `sita_perception_events` with a 1-day TTL so the cortex
// has more grounded "what's happening" context. Nothing leaves
// the device unless the user explicitly enables it.
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";

export type PerceptionSource = "screen" | "clipboard" | "vision" | "mic_meta";

export interface PerceptionEvent {
  id?: string;
  user_id: string;
  source: PerceptionSource;
  payload: Record<string, unknown>;
  ttl_seconds?: number;
}

let enabled = false;
let userId: string | null = null;

export function isPerceptionEnabled() { return enabled; }

export function enablePerception(uid: string) {
  enabled = true;
  userId = uid;
  attachClipboardListener();
}

export function disablePerception() {
  enabled = false;
  userId = null;
  detachClipboardListener();
}

export async function recordPerception(ev: Omit<PerceptionEvent, "user_id">) {
  if (!enabled || !userId) return;
  try {
    await supabase.from("sita_perception_events" as never).insert({
      user_id: userId,
      source: ev.source,
      payload: ev.payload,
      ttl_seconds: ev.ttl_seconds ?? 86400,
    } as never);
  } catch (err) {
    console.warn("[perception] insert failed", err);
  }
}

let clipboardHandler: ((e: ClipboardEvent) => void) | null = null;

function attachClipboardListener() {
  if (typeof window === "undefined") return;
  if (clipboardHandler) return;
  clipboardHandler = (e: ClipboardEvent) => {
    const text = e.clipboardData?.getData("text/plain") ?? "";
    if (!text || text.length > 500) return;
    void recordPerception({ source: "clipboard", payload: { len: text.length, preview: text.slice(0, 80) } });
  };
  window.addEventListener("copy", clipboardHandler);
}

function detachClipboardListener() {
  if (typeof window === "undefined" || !clipboardHandler) return;
  window.removeEventListener("copy", clipboardHandler);
  clipboardHandler = null;
}

/** Reads recent perception events for the cortex / agent. */
export async function listRecentPerception(uid: string, limit = 20): Promise<PerceptionEvent[]> {
  const { data } = await supabase
    .from("sita_perception_events" as never)
    .select("*")
    .eq("user_id", uid)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as unknown as PerceptionEvent[];
}