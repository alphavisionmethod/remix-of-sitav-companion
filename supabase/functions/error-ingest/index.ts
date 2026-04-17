// ═══════════════════════════════════════════════════════════════
// error-ingest (Phase 20.A)
// Receives batched error reports from the frontend, deduplicates
// by fingerprint within 5min window, writes error_events rows.
// ═══════════════════════════════════════════════════════════════

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-correlation-id, traceparent",
};

interface IncomingError {
  fingerprint?: string;
  message: string;
  stack?: string;
  severity?: "fatal" | "error" | "warning" | "info" | "debug";
  source?: "frontend" | "edge" | "cron" | "worker" | "external";
  route?: string;
  correlation_id?: string | null;
  release?: string;
  environment?: string;
  user_agent?: string;
  metadata?: Record<string, unknown>;
  sentry_event_id?: string;
  surface?: string;
  feature_flags?: Record<string, boolean>;
}

function fingerprintFor(e: IncomingError): string {
  if (e.fingerprint) return e.fingerprint.slice(0, 240);
  const head = (e.message || "").slice(0, 100).replace(/\s+/g, " ").trim();
  const firstFrame = e.stack
    ?.split("\n")
    .map((l) => l.trim())
    .find((l) => l.startsWith("at "))
    ?.replace(/:\d+:\d+\)?$/g, "") || "";
  return `${e.source ?? "frontend"}|${head}|${firstFrame}`.slice(0, 240);
}

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

  // Identify caller (best-effort; anonymous reports allowed for crashes pre-auth)
  let userId: string | null = null;
  const authHeader = req.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    try {
      const userClient = createClient(url, Deno.env.get("SUPABASE_ANON_KEY") ?? "", {
        global: { headers: { Authorization: authHeader } },
        auth: { persistSession: false },
      });
      const { data: u } = await userClient.auth.getUser();
      userId = u?.user?.id ?? null;
    } catch {
      // anonymous OK
    }
  }

  let body: { errors?: IncomingError[] };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "invalid-json" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const errors = Array.isArray(body.errors) ? body.errors.slice(0, 50) : [];
  if (errors.length === 0) {
    return new Response(JSON.stringify({ ok: true, processed: 0 }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const admin = createClient(url, key, { auth: { persistSession: false } });
  const since = new Date(Date.now() - 5 * 60_000).toISOString();
  let inserted = 0;
  let merged = 0;
  const ids: string[] = [];

  for (const e of errors) {
    if (!e?.message) continue;
    const fingerprint = fingerprintFor(e);

    const { data: existing } = await admin
      .from("error_events")
      .select("id, count")
      .eq("fingerprint", fingerprint)
      .gte("last_seen_at", since)
      .maybeSingle();

    if (existing) {
      const { data: updated } = await admin
        .from("error_events")
        .update({
          count: (existing.count as number) + 1,
          last_seen_at: new Date().toISOString(),
        })
        .eq("id", existing.id as string)
        .select("id")
        .maybeSingle();
      merged++;
      if (updated?.id) ids.push(updated.id as string);
    } else {
      const { data: ins } = await admin
        .from("error_events")
        .insert({
          fingerprint,
          message: String(e.message).slice(0, 2048),
          stack: e.stack ? String(e.stack).slice(0, 8192) : null,
          severity: e.severity ?? "error",
          source: e.source ?? "frontend",
          route: e.route ?? null,
          user_id: userId,
          correlation_id: e.correlation_id ?? null,
          release: e.release ?? null,
          environment: e.environment ?? "production",
          user_agent: e.user_agent ?? req.headers.get("user-agent") ?? null,
          sentry_event_id: e.sentry_event_id ?? null,
          metadata: {
            ...(e.metadata ?? {}),
            ...(e.surface ? { surface: e.surface } : {}),
            ...(e.feature_flags ? { feature_flags: e.feature_flags } : {}),
          },
        })
        .select("id")
        .maybeSingle();
      inserted++;
      if (ins?.id) ids.push(ins.id as string);
    }
  }

  // Auto-raise alert when fatal errors arrive
  const fatalCount = errors.filter((e) => e.severity === "fatal").length;
  if (fatalCount > 0) {
    try {
      await admin.functions.invoke("alert-ingest", {
        body: {
          alerts: [
            {
              source: "error-events",
              severity: "high",
              subsystem: "frontend",
              fingerprint: `fatal-batch:${fatalCount}`,
              title: `${fatalCount} fatal error(s) reported`,
              description: errors.find((e) => e.severity === "fatal")?.message ?? "",
              metadata: { fatalCount, route: errors[0]?.route ?? null },
            },
          ],
        },
      });
    } catch {
      // best-effort
    }
  }

  return new Response(JSON.stringify({ ok: true, inserted, merged, ids }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
