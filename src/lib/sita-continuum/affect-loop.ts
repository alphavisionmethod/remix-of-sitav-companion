// ═══════════════════════════════════════════════════════════════
// SITA OS — Affect Loop (Phase J)
// ═══════════════════════════════════════════════════════════════
// Captures lightweight reactions (thumbs, dismissals, replays,
// corrections) from any Sita surface and persists them to
// `sita_affect_events`. Listens to a single `sita-affect` window
// event so any component can fire-and-forget without imports.
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";

export type AffectSignal =
  | "thumbs_up" | "thumbs_down"
  | "dismiss" | "replay"
  | "correct" | "accept" | "reject";

export type AffectTargetKind =
  | "whisper" | "briefing" | "agent_plan"
  | "voice_reply" | "persona" | "knowledge_node";

export interface AffectInput {
  signal: AffectSignal;
  target_kind: AffectTargetKind;
  target_ref?: string;
  weight?: number;
  metadata?: Record<string, unknown>;
}

let userId: string | null = null;
let attached = false;

export function startAffectLoop(uid: string) {
  userId = uid;
  if (attached || typeof window === "undefined") return;
  window.addEventListener("sita-affect", onWindowAffect as EventListener);
  attached = true;
}

export function stopAffectLoop() {
  if (!attached || typeof window === "undefined") return;
  window.removeEventListener("sita-affect", onWindowAffect as EventListener);
  attached = false;
  userId = null;
}

function onWindowAffect(ev: Event) {
  const detail = (ev as CustomEvent<AffectInput>).detail;
  if (!detail) return;
  void recordAffect(detail);
}

export async function recordAffect(input: AffectInput): Promise<void> {
  if (!userId) return;
  try {
    await supabase.from("sita_affect_events" as never).insert({
      user_id: userId,
      signal: input.signal,
      target_kind: input.target_kind,
      target_ref: input.target_ref ?? null,
      weight: input.weight ?? 1.0,
      metadata: input.metadata ?? {},
    } as never);
  } catch (err) {
    console.warn("[affect] insert failed", err);
  }
}

/** Convenience helper for any UI to fire affect without imports. */
export function fireAffect(input: AffectInput) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("sita-affect", { detail: input }));
}

/** Aggregate recent affect into a per-target sentiment delta in [-1, 1]. */
export async function summarizeAffect(uid: string, hours = 72): Promise<{
  byKind: Record<string, { positive: number; negative: number; net: number }>;
  total: number;
}> {
  const since = new Date(Date.now() - hours * 3600_000).toISOString();
  const { data } = await supabase
    .from("sita_affect_events" as never)
    .select("signal, target_kind, weight")
    .eq("user_id", uid)
    .gte("created_at", since);
  const rows = (data ?? []) as Array<{ signal: string; target_kind: string; weight: number }>;
  const out: Record<string, { positive: number; negative: number; net: number }> = {};
  for (const r of rows) {
    const bucket = (out[r.target_kind] ||= { positive: 0, negative: 0, net: 0 });
    const w = Number(r.weight) || 1;
    if (r.signal === "thumbs_up" || r.signal === "accept" || r.signal === "replay") bucket.positive += w;
    else if (r.signal === "thumbs_down" || r.signal === "reject" || r.signal === "dismiss" || r.signal === "correct") bucket.negative += w;
    bucket.net = bucket.positive - bucket.negative;
  }
  return { byKind: out, total: rows.length };
}