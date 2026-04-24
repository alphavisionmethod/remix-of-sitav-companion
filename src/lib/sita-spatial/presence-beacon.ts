// ═══════════════════════════════════════════════════════════════
// SITA OS — Phase F: Presence Beacon
// Periodically updates a heartbeat row in sita_handoff_sessions
// (status=presence) so other devices can show "Sita is active here".
// Graceful no-op when offline / unauth.
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import { getDeviceLabel } from "./handoff-bus";

let timer: ReturnType<typeof setInterval> | null = null;

const BEAT_KEY = "sita_presence_last_beat";
const BEAT_INTERVAL_MS = 30_000;

async function beat(): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  const last = Number(localStorage.getItem(BEAT_KEY) ?? "0");
  const now = Date.now();
  if (now - last < BEAT_INTERVAL_MS - 1000) return;
  localStorage.setItem(BEAT_KEY, String(now));

  // We piggy-back on sita_handoff_sessions with a synthetic intent
  // to avoid a new table. Each beat expires in 2 minutes.
  const expiresAt = new Date(now + 2 * 60_000).toISOString();
  await supabase.from("sita_handoff_sessions").insert({
    user_id: user.id,
    source_device: getDeviceLabel(),
    intent: "__presence__",
    status: "presence",
    expires_at: expiresAt,
    payload: { kind: "beacon" } as never,
  });
}

export function startPresenceBeacon(): void {
  if (timer) return;
  void beat();
  timer = setInterval(() => void beat(), BEAT_INTERVAL_MS);
}

export function stopPresenceBeacon(): void {
  if (timer) clearInterval(timer);
  timer = null;
}
