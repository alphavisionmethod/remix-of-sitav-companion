// ═══════════════════════════════════════════════════════════════
// SITA OS — Phase F: Multi-Device Handoff Bus
// Per-user Realtime channel + Postgres-backed handoff sessions.
// On-device only logic; payloads are user-scoped via RLS.
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

export type HandoffStatus = "offered" | "accepted" | "declined" | "expired" | "completed";

export interface HandoffPayload {
  intent: string;
  planId?: string | null;
  cursor?: { x: number; y: number } | null;
  contextRef?: string | null;
  note?: string | null;
}

export interface HandoffSession {
  id: string;
  user_id: string;
  source_device: string;
  target_device: string | null;
  intent: string;
  plan_id: string | null;
  status: HandoffStatus;
  payload: HandoffPayload;
  created_at: string;
  accepted_at: string | null;
  expires_at: string;
}

const DEVICE_KEY = "sita_device_label_v1";

export function getDeviceLabel(): string {
  if (typeof window === "undefined") return "unknown";
  let label = localStorage.getItem(DEVICE_KEY);
  if (label) return label;

  const ua = navigator.userAgent.toLowerCase();
  const isMobile = /iphone|ipad|android|mobile/.test(ua);
  const isMac = /macintosh|mac os/.test(ua);
  const isWin = /windows/.test(ua);
  const base = isMobile ? "Phone" : isMac ? "Mac" : isWin ? "PC" : "Device";
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  label = `${base}-${suffix}`;
  localStorage.setItem(DEVICE_KEY, label);
  return label;
}

export async function offerHandoff(payload: HandoffPayload): Promise<HandoffSession | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("sita_handoff_sessions")
    .insert({
      user_id: user.id,
      source_device: getDeviceLabel(),
      intent: payload.intent,
      plan_id: payload.planId ?? null,
      payload: payload as never,
      status: "offered",
    })
    .select()
    .single();

  if (error) {
    console.warn("[sita-handoff] offer failed", error);
    return null;
  }
  return data as HandoffSession;
}

export async function acceptHandoff(id: string): Promise<boolean> {
  const { error } = await supabase
    .from("sita_handoff_sessions")
    .update({
      status: "accepted",
      target_device: getDeviceLabel(),
      accepted_at: new Date().toISOString(),
    })
    .eq("id", id);
  return !error;
}

export async function declineHandoff(id: string): Promise<boolean> {
  const { error } = await supabase
    .from("sita_handoff_sessions")
    .update({ status: "declined" })
    .eq("id", id);
  return !error;
}

export type HandoffListener = (session: HandoffSession) => void;

export async function subscribeIncomingHandoffs(listener: HandoffListener): Promise<RealtimeChannel | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const channel = supabase
    .channel(`sita_handoff:${user.id}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "sita_handoff_sessions",
        filter: `user_id=eq.${user.id}`,
      },
      (payload) => {
        const row = payload.new as HandoffSession;
        if (row.source_device === getDeviceLabel()) return; // skip own
        if (row.status !== "offered") return;
        listener(row);
      }
    )
    .subscribe();

  return channel;
}
