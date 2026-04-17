// ═══════════════════════════════════════════════════════════════
// SITA OS — Alert Client (Phase 20.D + Phase 28.B)
// Typed front-end client for raising alerts. Auto-resolves a
// `runbookId` from `subsystem` / `source` / `severity` when the
// caller does not supply one, so every alert ships with a recovery
// pointer.
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import { resolveRunbookForAlert, describeResolution } from "@/lib/support/runbook-resolver";

export type AlertSeverity = "critical" | "high" | "medium" | "low" | "info";

export interface RaiseAlertInput {
  source: string;
  severity: AlertSeverity;
  subsystem: string;
  title: string;
  description?: string;
  fingerprint?: string;
  /** Optional explicit override; auto-resolved from subsystem if omitted. */
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
 *
 * If `runbookId` is not provided, auto-resolves via the runbook resolver
 * so operators can always navigate from alert → recovery procedure.
 */
export async function raiseAlert(input: RaiseAlertInput): Promise<{ ok: boolean; alertId?: string; error?: string; runbookId?: string | null }> {
  // Phase 28.B — auto-resolve runbook if not explicitly passed
  let resolvedRunbookId: string | null = input.runbookId ?? null;
  let resolutionMatched: "subsystem" | "source" | "severity" | "none" | "explicit" = input.runbookId ? "explicit" : "none";

  if (!resolvedRunbookId) {
    const sev = input.severity === "info" ? null : input.severity;
    const desc = describeResolution({ subsystem: input.subsystem, source: input.source, severity: sev });
    resolvedRunbookId = desc.runbookId;
    resolutionMatched = desc.matchedBy;
  }

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
            runbook_id: resolvedRunbookId,
            metadata: {
              ...(input.metadata ?? {}),
              _runbookResolution: resolutionMatched,
            },
            related_incident_id: input.relatedIncidentId ?? null,
          },
        ],
      },
    });
    if (error) return { ok: false, error: error.message, runbookId: resolvedRunbookId };
    const id = (data as { ids?: string[] } | null)?.ids?.[0];
    return { ok: true, alertId: id, runbookId: resolvedRunbookId };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err), runbookId: resolvedRunbookId };
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
