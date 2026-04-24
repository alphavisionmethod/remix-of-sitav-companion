// ═══════════════════════════════════════════════════════════════
// SITA OS — Dream Consolidator (Phase J)
// ═══════════════════════════════════════════════════════════════
// Client-callable wrapper around the `sita-dream-consolidate` edge
// function. Triggered nightly by pg_cron, but also exposed here so
// the user can manually "consolidate now" from settings or the
// continuum panel.
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";

export interface ConsolidationReport {
  episodes_processed: number;
  affect_events_processed: number;
  nodes_promoted: number;
  nodes_decayed: number;
  personality_patches: Array<{ field: string; from: number; to: number; reason: string }>;
}

export async function runDreamConsolidation(): Promise<ConsolidationReport | null> {
  try {
    const { data, error } = await supabase.functions.invoke("sita-dream-consolidate", {
      body: { manual: true },
    });
    if (error) throw error;
    return (data as { report?: ConsolidationReport })?.report ?? null;
  } catch (err) {
    console.warn("[dream] consolidation failed", err);
    return null;
  }
}