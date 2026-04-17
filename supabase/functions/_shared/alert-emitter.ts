// ═══════════════════════════════════════════════════════════════
// SITA OS — Shared Alert Emitter (Phase 20.1.B)
// One client used by every edge fn that needs to raise alerts
// into the central `alerts` table via `alert-ingest`.
// Best-effort: never throws, never blocks the caller.
// ═══════════════════════════════════════════════════════════════

export type AlertSeverity = "critical" | "high" | "medium" | "low" | "info";

export interface EmitAlertInput {
  source: string;
  severity: AlertSeverity;
  subsystem: string;
  title: string;
  description?: string;
  fingerprint?: string;
  runbook_id?: string | null;
  metadata?: Record<string, unknown>;
  related_incident_id?: string | null;
}

function defaultFingerprint(input: EmitAlertInput): string {
  return `${input.source}:${input.subsystem}:${input.title}`.slice(0, 240);
}

/**
 * Best-effort fire-and-forget alert emission.
 * Calls the alert-ingest edge function directly via HTTP using the
 * service role key. Returns ok:false on any failure but never throws.
 */
export async function emitAlert(input: EmitAlertInput): Promise<{ ok: boolean; error?: string }> {
  try {
    const url = Deno.env.get("SUPABASE_URL");
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !key) return { ok: false, error: "supabase-env-missing" };

    const res = await fetch(`${url}/functions/v1/alert-ingest`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
        apikey: key,
      },
      body: JSON.stringify({
        alerts: [
          {
            source: input.source,
            severity: input.severity,
            subsystem: input.subsystem,
            title: input.title,
            description: input.description ?? "",
            fingerprint: input.fingerprint ?? defaultFingerprint(input),
            runbook_id: input.runbook_id ?? null,
            metadata: input.metadata ?? {},
            related_incident_id: input.related_incident_id ?? null,
          },
        ],
      }),
    });
    if (!res.ok) return { ok: false, error: `alert-ingest-${res.status}` };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
