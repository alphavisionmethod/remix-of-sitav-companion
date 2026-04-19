// ═══════════════════════════════════════════════════════════════
// alert-route (Phase 20.D)
// Reads alert_routes config and fans out new alerts to channels:
// ui (always-on), push (via push-dispatch), webhook (Slack-shape).
// Structured logging via canonical EdgeLogger (Phase 33 cleanup).
// ═══════════════════════════════════════════════════════════════

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { EdgeLogger } from "../_shared/logger.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SEVERITY_RANK: Record<string, number> = {
  info: 0, low: 1, medium: 2, high: 3, critical: 4,
};

function matchesPattern(pattern: string, source: string): boolean {
  if (pattern === "*") return true;
  if (pattern.endsWith("*")) return source.startsWith(pattern.slice(0, -1));
  return pattern === source;
}

Deno.serve(async (req) => {
  const correlationId = req.headers.get("x-correlation-id") ?? crypto.randomUUID();
  const log = new EdgeLogger("alert-route", correlationId);
  const t0 = performance.now();

  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    log.warn("method_not_allowed", { method: req.method, failure_class: "bad_method" });
    return new Response("method-not-allowed", { status: 405, headers: corsHeaders });
  }

  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) {
    return new Response("server-not-configured", { status: 500, headers: corsHeaders });
  }

  let body: { alert_ids?: string[] };
  try { body = await req.json(); } catch {
    return new Response("invalid-json", { status: 400, headers: corsHeaders });
  }
  const ids = (body.alert_ids ?? []).slice(0, 50);
  if (ids.length === 0) {
    return new Response(JSON.stringify({ ok: true, dispatched: 0 }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const admin = createClient(url, key, { auth: { persistSession: false } });

  const [{ data: alerts }, { data: routes }] = await Promise.all([
    admin.from("alerts").select("*").in("id", ids),
    admin.from("alert_routes").select("*").eq("enabled", true),
  ]);

  if (!alerts || !routes) {
    return new Response(JSON.stringify({ ok: true, dispatched: 0 }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let dispatched = 0;
  for (const alert of alerts) {
    const sev = String(alert.severity);
    const sevRank = SEVERITY_RANK[sev] ?? 0;

    for (const route of routes) {
      if (!matchesPattern(String(route.source_pattern), String(alert.source))) continue;
      const minRank = SEVERITY_RANK[String(route.severity_min)] ?? 0;
      if (sevRank < minRank) continue;

      const channel = String(route.channel);
      const target = String(route.target);

      try {
        if (channel === "ui") {
          // UI is read directly from the alerts table — nothing to push, but mark as dispatched.
          dispatched++;
        } else if (channel === "webhook") {
          await fetch(target, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              text: `[${sev.toUpperCase()}] ${alert.title}`,
              attachments: [{
                color: sev === "critical" ? "#dc2626" : sev === "high" ? "#ea580c" : "#0ea5e9",
                fields: [
                  { title: "Subsystem", value: String(alert.subsystem), short: true },
                  { title: "Source", value: String(alert.source), short: true },
                  { title: "Description", value: String(alert.description ?? ""), short: false },
                ],
                footer: `alert:${alert.id}`,
                ts: Math.floor(Date.now() / 1000),
              }],
            }),
          }).catch(() => {});
          dispatched++;
        } else if (channel === "push") {
          await admin.functions.invoke("push-dispatch", {
            body: {
              audience: target === "admins" ? "admins" : "user",
              title: `[${sev.toUpperCase()}] ${alert.title}`,
              body: String(alert.description ?? ""),
              data: { alert_id: alert.id, subsystem: alert.subsystem },
            },
          }).catch(() => {});
          dispatched++;
        } else if (channel === "email" || channel === "sms") {
          // Queue for notifications worker
          await admin.from("notifications_queue" as never).insert({
            channel,
            target,
            payload: {
              subject: `[${sev.toUpperCase()}] ${alert.title}`,
              body: String(alert.description ?? ""),
              alert_id: alert.id,
            },
          } as never).then(() => { dispatched++; }, () => {});
        }
      } catch {
        // continue on dispatch errors
      }
    }
  }

  log.complete(200, Math.round(performance.now() - t0), {
    event_type: "alerts_dispatched", target: `${ids.length}_alerts`, result: "success", dispatched,
  });
  return new Response(JSON.stringify({ ok: true, dispatched }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
