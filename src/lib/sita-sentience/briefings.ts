// ═══════════════════════════════════════════════════════════════
// SITA OS — Proactive Briefings (Phase H)
// ═══════════════════════════════════════════════════════════════
// Reads queued `sita_proactive_briefings`, surfaces them through
// the same `sita-whisper` event channel the HUD already listens to,
// and respects the user's quiet-hours + proactivity settings.
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import { isQuietHours, readPersonality } from "./personality";

export type BriefingKind = "morning" | "midday" | "evening" | "weekly" | "mission" | "risk";

export interface SitaBriefing {
  id: string;
  user_id: string;
  kind: BriefingKind;
  headline: string;
  body: string | null;
  evidence: unknown[];
  scheduled_for: string;
  delivered_at: string | null;
  acknowledged_at: string | null;
  status: "queued" | "delivered" | "acknowledged" | "expired";
  priority: number;
  expires_at: string;
  created_at: string;
}

export async function listDueBriefings(userId: string, limit = 5): Promise<SitaBriefing[]> {
  const nowIso = new Date().toISOString();
  const { data, error } = await supabase
    .from("sita_proactive_briefings" as never)
    .select("*")
    .eq("user_id", userId)
    .eq("status", "queued")
    .lte("scheduled_for", nowIso)
    .gt("expires_at", nowIso)
    .order("priority", { ascending: false })
    .order("scheduled_for", { ascending: true })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as unknown as SitaBriefing[];
}

export async function markDelivered(id: string): Promise<void> {
  await supabase.from("sita_proactive_briefings" as never)
    .update({ status: "delivered", delivered_at: new Date().toISOString() } as never)
    .eq("id", id);
}

export async function acknowledgeBriefing(id: string): Promise<void> {
  await supabase.from("sita_proactive_briefings" as never)
    .update({ status: "acknowledged", acknowledged_at: new Date().toISOString() } as never)
    .eq("id", id);
}

/** Push a one-off briefing into the queue (e.g. from agent reflection). */
export async function queueBriefing(input: {
  user_id: string;
  kind: BriefingKind;
  headline: string;
  body?: string;
  scheduled_for?: string;
  priority?: number;
  evidence?: unknown[];
}): Promise<void> {
  await supabase.from("sita_proactive_briefings" as never).insert({
    user_id: input.user_id,
    kind: input.kind,
    headline: input.headline,
    body: input.body ?? null,
    scheduled_for: input.scheduled_for ?? new Date().toISOString(),
    priority: input.priority ?? 3,
    evidence: input.evidence ?? [],
  } as never);
}

/** Surface a briefing through the existing whisper channel. */
export function whisperBriefing(b: SitaBriefing) {
  if (typeof window === "undefined") return;
  const personality = readPersonality();
  if (isQuietHours()) return;
  if (personality.proactivity < 0.2 && b.priority < 4) return;
  window.dispatchEvent(new CustomEvent("sita-whisper", {
    detail: {
      id: b.id,
      mood: b.kind === "risk" ? "alert" : "calm",
      title: b.headline,
      body: b.body ?? undefined,
      kind: "briefing",
    },
  }));
}