// ═══════════════════════════════════════════════════════════════
// SITA OS — Surface Portability Service
// Tracks capability readiness across web/mobile/desktop/watch
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";

export interface SurfacePortabilityRecord {
  id: string;
  capability_key: string;
  capability_name: string;
  web_ready: boolean;
  mobile_ready: boolean;
  desktop_ready: boolean;
  watch_ready: boolean;
  tablet_ready: boolean;
  response_envelope_neutral: boolean;
  surface_adapter_exists: boolean;
  portability_score: number;
  notes: string | null;
}

export async function getSurfacePortability(): Promise<SurfacePortabilityRecord[]> {
  const { data, error } = await supabase
    .from("surface_portability_registry")
    .select("*")
    .order("capability_key");

  if (error) {
    console.error("[SurfacePortability] Error:", error);
    return [];
  }
  return (data ?? []) as unknown as SurfacePortabilityRecord[];
}

export async function upsertSurfacePortability(
  userId: string,
  record: Omit<SurfacePortabilityRecord, "id">
): Promise<void> {
  const score = calculatePortabilityScore(record);
  const { error } = await supabase
    .from("surface_portability_registry")
    .upsert({
      user_id: userId,
      capability_key: record.capability_key,
      capability_name: record.capability_name,
      web_ready: record.web_ready,
      mobile_ready: record.mobile_ready,
      desktop_ready: record.desktop_ready,
      watch_ready: record.watch_ready,
      tablet_ready: record.tablet_ready,
      response_envelope_neutral: record.response_envelope_neutral,
      surface_adapter_exists: record.surface_adapter_exists,
      portability_score: score,
      notes: record.notes,
    }, { onConflict: "user_id,capability_key" });

  if (error) console.error("[SurfacePortability] Upsert error:", error);
}

function calculatePortabilityScore(r: Partial<SurfacePortabilityRecord>): number {
  let score = 0;
  if (r.web_ready) score += 20;
  if (r.mobile_ready) score += 20;
  if (r.desktop_ready) score += 15;
  if (r.tablet_ready) score += 10;
  if (r.watch_ready) score += 10;
  if (r.response_envelope_neutral) score += 15;
  if (r.surface_adapter_exists) score += 10;
  return Math.min(score, 100);
}

export function getSurfacePortabilityIndex(records: SurfacePortabilityRecord[]): number {
  if (records.length === 0) return 0;
  const total = records.reduce((sum, r) => sum + r.portability_score, 0);
  return Math.round(total / records.length);
}
