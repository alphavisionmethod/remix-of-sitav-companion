// ═══════════════════════════════════════════════════════════════
// SITA OS — Alert Client (Phase 20.D)
// Typed front-end client for raising alerts into the central
// `alerts` table via the alert-ingest edge function.
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";

export type AlertSeverity = "critical" | "high" | "medium" | "low" | "info";

export interface RaiseAlertInput {
  source: string;
  severity: AlertSeverity;
  subsystem: string;
  title: string;
  description?: string;
  fingerprint?: string;
  runbookId?: string;
  metadata?: Record<string, unknown>;
  relatedIncidentId?: string;
}

function defaultFingerprint(input: RaiseAlertInput): string {
  return `${input.source}:${input.subsystem}:${input.title}`.slice(0, 240);
}

/**
 * Raise (or increment) an alert. Idempotent for the same fingerprint
 * within the rolling window enforced by the edge function.
 */
export async function raiseAlert(input: RaiseAlertInput): Promise<{ ok: boolean; alertId?: string; error?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke("alert-ingest", {
      body: {
        alerts: [
          {
            source: input.source,
            severity: input.severity,
            subsystem: input.subsystem,
            title: input.title,
            description: input.description ?? "",
            fingerprint: input.fingerprint ?? defaultFingerprint(input),
            runbook_id: input.runbookId ?? null,
            metadata: input.metadata ?? {},
            related_incident_id: input.relatedIncidentId ?? null,
          },
        ],
      },
    });
    if (error) return { ok: false, error: error.message };
    const id = (data as { ids?: string[] } | null)?.ids?.[0];
    return { ok: true, alertId: id };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export async function ackAlert(alertId: string, note?: string) {
  return supabase.functions.invoke("alert-actions", {
    body: { action: "ack", alert_id: alertId, note },
  });
}

export async function suppressAlert(alertId: string, untilIso: string, note?: string) {
  return supabase.functions.invoke("alert-actions", {
    body: { action: "suppress", alert_id: alertId, suppress_until: untilIso, note },
  });
}

export async function assignAlert(alertId: string, userId: string) {
  return supabase.functions.invoke("alert-actions", {
    body: { action: "assign", alert_id: alertId, assignee_user_id: userId },
  });
}

export async function resolveAlert(alertId: string, note?: string) {
  return supabase.functions.invoke("alert-actions", {
    body: { action: "resolve", alert_id: alertId, note },
  });
}
