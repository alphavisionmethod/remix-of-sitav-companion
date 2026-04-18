// ═══════════════════════════════════════════════════════════════
// SITA OS — Incident Classifier (Section B.4)
// Maps (subsystem, symptom_code) → recommended runbook + kill switch
// + severity + escalation owner. DB-backed via incident_classifications.
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";

export type IncidentSeverity = "low" | "medium" | "high" | "critical";

export interface IncidentClassification {
  subsystem: string;
  symptomCode: string;
  displayName: string;
  severity: IncidentSeverity;
  recommendedRunbookId: string;
  recommendedSwitchId: string | null;
  escalationOwner: string;
  description: string | null;
}

// 30 s in-memory cache so admin/observability views don't hammer the DB
let cache: { rows: IncidentClassification[]; expiresAt: number } | null = null;
const CACHE_MS = 30_000;

function rowToClassification(r: Record<string, unknown>): IncidentClassification {
  return {
    subsystem: String(r.subsystem),
    symptomCode: String(r.symptom_code),
    displayName: String(r.display_name),
    severity: String(r.severity) as IncidentSeverity,
    recommendedRunbookId: String(r.recommended_runbook_id),
    recommendedSwitchId: (r.recommended_switch_id as string | null) ?? null,
    escalationOwner: String(r.escalation_owner ?? "platform"),
    description: (r.description as string | null) ?? null,
  };
}

export async function loadIncidentClassifications(forceRefresh = false): Promise<IncidentClassification[]> {
  if (!forceRefresh && cache && cache.expiresAt > Date.now()) return cache.rows;
  const { data, error } = await supabase
    .from("incident_classifications")
    .select("*")
    .eq("is_active", true);
  if (error) {
    console.warn("[incident-classifier] load failed:", error.message);
    return cache?.rows ?? [];
  }
  const rows = (data ?? []).map(rowToClassification);
  cache = { rows, expiresAt: Date.now() + CACHE_MS };
  return rows;
}

export async function classifyIncident(
  subsystem: string,
  symptomCode?: string,
): Promise<IncidentClassification | null> {
  const rows = await loadIncidentClassifications();
  // 1. exact match
  if (symptomCode) {
    const exact = rows.find((r) => r.subsystem === subsystem && r.symptomCode === symptomCode);
    if (exact) return exact;
  }
  // 2. any classification for the subsystem (highest severity wins)
  const sevOrder: Record<IncidentSeverity, number> = { critical: 4, high: 3, medium: 2, low: 1 };
  const candidates = rows.filter((r) => r.subsystem === subsystem);
  if (candidates.length === 0) return null;
  return candidates.reduce((best, r) =>
    sevOrder[r.severity] > sevOrder[best.severity] ? r : best,
  );
}

export function clearIncidentClassifierCache() {
  cache = null;
}
