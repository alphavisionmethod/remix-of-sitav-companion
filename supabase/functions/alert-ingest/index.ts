// ═══════════════════════════════════════════════════════════════
// alert-ingest (Phase 20.D)
// Single ingest endpoint for alerts from any source.
// Dedupes by fingerprint, increments count on collision,
// triggers fan-out via alert-route on new alerts.
// ═══════════════════════════════════════════════════════════════

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-correlation-id, traceparent",
};

type Severity = "critical" | "high" | "medium" | "low" | "info";

interface IncomingAlert {
  source: string;
  severity: Severity;
  subsystem: string;
  title: string;
  description?: string;
  fingerprint?: string;
  runbook_id?: string | null;
  metadata?: Record<string, unknown>;
  related_incident_id?: string | null;
  dedup_key?: string | null;
}

function fp(a: IncomingAlert): string {
  return (a.fingerprint || `${a.source}:${a.subsystem}:${a.title}`).slice(0, 240);
}

const VALID_SEVERITY = new Set(["critical", "high", "medium", "low", "info"]);

const DEDUP_WINDOW_MS = 5 * 60_000;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method-not-allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) {
    return new Response(JSON.stringify({ error: "server-not-configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let body: { alerts?: IncomingAlert[] };
  try { body = await req.json(); } catch {
    return new Response(JSON.stringify({ error: "invalid-json" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const alerts = Array.isArray(body.alerts) ? body.alerts.slice(0, 50) : [];
  const valid = alerts.filter((a) =>
    a?.source && a?.subsystem && a?.title && VALID_SEVERITY.has(a?.severity)
  );

  if (valid.length === 0) {
    return new Response(JSON.stringify({ ok: true, inserted: 0, ids: [] }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const admin = createClient(url, key, { auth: { persistSession: false } });
  const ids: string[] = [];
  const newIds: string[] = [];
  const since = new Date(Date.now() - DEDUP_WINDOW_MS).toISOString();

  for (const a of valid) {
    const fingerprint = fp(a);

    const { data: existing } = await admin
      .from("alerts")
      .select("id, count, severity, status")
      .eq("fingerprint", fingerprint)
      .neq("status", "resolved")
      .gte("last_seen_at", since)
      .order("last_seen_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing) {
      // escalate severity on burst
      const newCount = (existing.count as number) + 1;
      let nextSeverity = existing.severity as Severity;
      if (newCount > 25 && nextSeverity !== "critical") nextSeverity = "critical";
      else if (newCount > 10 && (nextSeverity === "low" || nextSeverity === "medium")) nextSeverity = "high";

      const { data: u } = await admin
        .from("alerts")
        .update({
          count: newCount,
          last_seen_at: new Date().toISOString(),
          severity: nextSeverity,
          // Re-activate if previously acked
          status: existing.status === "acknowledged" ? "active" : existing.status,
        })
        .eq("id", existing.id as string)
        .select("id")
        .maybeSingle();
      if (u?.id) ids.push(u.id as string);
    } else {
      const { data: ins } = await admin
        .from("alerts")
        .insert({
          fingerprint,
          source: a.source,
          severity: a.severity,
          subsystem: a.subsystem,
          title: a.title.slice(0, 240),
          description: (a.description ?? "").slice(0, 2048),
          runbook_id: a.runbook_id ?? null,
          metadata: a.metadata ?? {},
          related_incident_id: a.related_incident_id ?? null,
          dedup_key: a.dedup_key ?? fingerprint,
          status: "active",
        })
        .select("id")
        .maybeSingle();
      if (ins?.id) {
        ids.push(ins.id as string);
        newIds.push(ins.id as string);
      }
    }
  }

  // Fan out new alerts (fire-and-forget)
  if (newIds.length > 0) {
    admin.functions.invoke("alert-route", { body: { alert_ids: newIds } })
      .catch(() => {});
  }

  return new Response(JSON.stringify({ ok: true, inserted: newIds.length, total: ids.length, ids }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
