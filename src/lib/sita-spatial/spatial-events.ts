// ═══════════════════════════════════════════════════════════════
// SITA OS — Phase F: Spatial Events Logger
// Cross-modal memory: logs gesture/gaze/handoff/spatial events
// for the agent to learn modality preferences over time.
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";

export type SpatialEventKind =
  | "gesture_air_tap"
  | "gesture_pinch"
  | "gesture_palm_up"
  | "gesture_swipe_away"
  | "gaze_focus"
  | "spatial_enter"
  | "spatial_exit"
  | "spatial_move"
  | "handoff_offered"
  | "handoff_received"
  | "handoff_accepted"
  | "handoff_declined"
  | "boardroom_convened"
  | "boardroom_dismissed";

let lastFlushAt = 0;
const buffer: Array<{ kind: SpatialEventKind; payload: Record<string, unknown> }> = [];

export async function logSpatialEvent(kind: SpatialEventKind, payload: Record<string, unknown> = {}): Promise<void> {
  buffer.push({ kind, payload });
  const now = Date.now();
  // Throttle to 1 flush / 2s
  if (now - lastFlushAt < 2000) return;
  lastFlushAt = now;
  await flush();
}

async function flush(): Promise<void> {
  if (buffer.length === 0) return;
  const items = buffer.splice(0, buffer.length);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("sita_spatial_events").insert(
    items.map((it) => ({
      user_id: user.id,
      kind: it.kind,
      payload: it.payload as never,
    }))
  );
}
