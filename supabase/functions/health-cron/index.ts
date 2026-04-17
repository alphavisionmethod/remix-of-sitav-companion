// ═══════════════════════════════════════════════════════════════
// health-cron (Phase 20.C)
// Always-on uptime probe runner. Runs all internal probes and
// writes results to uptime_heartbeats with source='cron'.
// Scheduled via pg_cron.
// ═══════════════════════════════════════════════════════════════

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Probe {
  subsystem: string;
  fn: (admin: ReturnType<typeof createClient>) => Promise<{ status: "healthy" | "degraded" | "down"; latency_ms: number; detail?: string }>;
}

async function timed<T>(fn: () => Promise<T>) {
  const t = performance.now();
  try { const v = await fn(); return { ok: true, value: v, ms: Math.round(performance.now() - t), error: null as string | null }; }
  catch (e) { return { ok: false, value: null, ms: Math.round(performance.now() - t), error: e instanceof Error ? e.message : String(e) }; }
}

const PROBES: Probe[] = [
  {
    subsystem: "db",
    fn: async (admin) => {
      const r = await timed(async () => {
        const { error } = await admin.from("error_events").select("id", { head: true, count: "exact" }).limit(1);
        if (error) throw new Error(error.message);
      });
      return { status: r.ok ? (r.ms > 1500 ? "degraded" : "healthy") : "down", latency_ms: r.ms, detail: r.error ?? undefined };
    },
  },
  {
    subsystem: "auth",
    fn: async (admin) => {
      const r = await timed(async () => {
        const { error } = await admin.from("profiles").select("id", { head: true, count: "exact" }).limit(1);
        if (error) throw new Error(error.message);
      });
      return { status: r.ok ? (r.ms > 1500 ? "degraded" : "healthy") : "down", latency_ms: r.ms };
    },
  },
  {
    subsystem: "storage",
    fn: async (admin) => {
      const r = await timed(async () => {
        const { error } = await admin.storage.listBuckets();
        if (error) throw new Error(error.message);
      });
      return { status: r.ok ? (r.ms > 2000 ? "degraded" : "healthy") : "down", latency_ms: r.ms };
    },
  },
  {
    subsystem: "alerts",
    fn: async (admin) => {
      const r = await timed(async () => {
        const { error } = await admin.from("alerts").select("id", { head: true, count: "exact" }).limit(1);
        if (error) throw new Error(error.message);
      });
      return { status: r.ok ? "healthy" : "down", latency_ms: r.ms };
    },
  },
  {
    subsystem: "trace_spans",
    fn: async (admin) => {
      const r = await timed(async () => {
        const { error } = await admin.from("trace_spans").select("id", { head: true, count: "exact" }).limit(1);
        if (error) throw new Error(error.message);
      });
      return { status: r.ok ? "healthy" : "down", latency_ms: r.ms };
    },
  },
  {
    subsystem: "ai_gateway",
    fn: async () => {
      const r = await timed(async () => {
        const key = Deno.env.get("LOVABLE_API_KEY") || Deno.env.get("OPENAI_API_KEY") || Deno.env.get("ANTHROPIC_API_KEY");
        if (!key) throw new Error("no AI key");
      });
      return { status: r.ok ? "healthy" : "degraded", latency_ms: r.ms, detail: r.error ?? undefined };
    },
  },
  {
    subsystem: "push",
    fn: async () => {
      const r = await timed(async () => {
        if (!Deno.env.get("VAPID_PRIVATE_KEY") || !Deno.env.get("VAPID_PUBLIC_KEY")) throw new Error("no VAPID");
      });
      return { status: r.ok ? "healthy" : "degraded", latency_ms: r.ms, detail: r.error ?? undefined };
    },
  },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) {
    return new Response(JSON.stringify({ ok: false, error: "server-not-configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const admin = createClient(url, key, { auth: { persistSession: false } });
  const results: Array<{ subsystem: string; status: string; latency_ms: number; detail?: string }> = [];
  const rows: Array<Record<string, unknown>> = [];
  const alertsToRaise: Array<{ subsystem: string; status: string; detail?: string }> = [];

  for (const p of PROBES) {
    try {
      const r = await p.fn(admin);
      results.push({ subsystem: p.subsystem, status: r.status, latency_ms: r.latency_ms, detail: r.detail });
      rows.push({
        subsystem: p.subsystem,
        status: r.status,
        latency_ms: r.latency_ms,
        source: "cron",
        metadata: r.detail ? { detail: r.detail } : {},
      });
      if (r.status === "down" || r.status === "degraded") {
        alertsToRaise.push({ subsystem: p.subsystem, status: r.status, detail: r.detail });
      }
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      results.push({ subsystem: p.subsystem, status: "down", latency_ms: 0, detail });
      rows.push({ subsystem: p.subsystem, status: "down", latency_ms: 0, source: "cron", metadata: { detail } });
      alertsToRaise.push({ subsystem: p.subsystem, status: "down", detail });
    }
  }

  if (rows.length > 0) {
    await admin.from("uptime_heartbeats").insert(rows);
  }

  // Raise alerts for downed/degraded subsystems
  if (alertsToRaise.length > 0) {
    try {
      await admin.functions.invoke("alert-ingest", {
        body: {
          alerts: alertsToRaise.map((a) => ({
            source: "uptime-cron",
            severity: a.status === "down" ? "critical" : "medium",
            subsystem: a.subsystem,
            fingerprint: `uptime:${a.subsystem}:${a.status}`,
            title: `Uptime probe ${a.status}: ${a.subsystem}`,
            description: a.detail ?? `${a.subsystem} probe returned ${a.status}`,
            metadata: { probed_at: new Date().toISOString(), detail: a.detail },
          })),
        },
      });
    } catch { /* best-effort */ }
  }

  return new Response(JSON.stringify({ ok: true, results }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
