// ═══════════════════════════════════════════════════════════════
// SITA OS — Alert Router
// Receives signals from observability + incident classifier and
// fans out to Slack / PagerDuty / email per severity. Honest about
// disabled channels: returns "skipped: <reason>" instead of pretending.
// ═══════════════════════════════════════════════════════════════
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AlertPayload {
  source: string;
  severity: "info" | "warning" | "error" | "critical";
  title: string;
  summary: string;
  runbook?: string | null;
  killSwitchSuggested?: string | null;
  evidence?: Record<string, unknown>;
  incidentId?: string | null;
}

interface ChannelResult {
  channel: string;
  status: "delivered" | "skipped" | "failed";
  reason?: string;
}

async function postSlack(p: AlertPayload): Promise<ChannelResult> {
  const webhook = Deno.env.get("SLACK_INCIDENT_WEBHOOK");
  if (!webhook) return { channel: "slack", status: "skipped", reason: "SLACK_INCIDENT_WEBHOOK not set" };
  const emoji =
    p.severity === "critical" ? "🚨" :
    p.severity === "error" ? "⛔" :
    p.severity === "warning" ? "⚠️" : "ℹ️";
  const lines = [
    `${emoji} *${p.severity.toUpperCase()}* — ${p.title}`,
    p.summary,
    p.runbook ? `📘 Runbook: ${p.runbook}` : null,
    p.killSwitchSuggested ? `🛑 Suggested switch: \`${p.killSwitchSuggested}\`` : null,
    p.incidentId ? `🆔 Incident: ${p.incidentId}` : null,
    `📡 Source: ${p.source}`,
  ].filter(Boolean);
  try {
    const r = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: lines.join("\n") }),
    });
    return r.ok
      ? { channel: "slack", status: "delivered" }
      : { channel: "slack", status: "failed", reason: `HTTP ${r.status}` };
  } catch (e) {
    return { channel: "slack", status: "failed", reason: String(e instanceof Error ? e.message : e) };
  }
}

async function postPagerDuty(p: AlertPayload): Promise<ChannelResult> {
  const routingKey = Deno.env.get("PAGERDUTY_ROUTING_KEY");
  if (!routingKey) return { channel: "pagerduty", status: "skipped", reason: "PAGERDUTY_ROUTING_KEY not set" };
  if (p.severity !== "critical" && p.severity !== "error") {
    return { channel: "pagerduty", status: "skipped", reason: "below paging threshold" };
  }
  try {
    const r = await fetch("https://events.pagerduty.com/v2/enqueue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        routing_key: routingKey,
        event_action: "trigger",
        dedup_key: p.incidentId ?? `${p.source}:${p.title}`,
        payload: {
          summary: p.title,
          severity: p.severity === "critical" ? "critical" : "error",
          source: p.source,
          custom_details: {
            summary: p.summary,
            runbook: p.runbook,
            killSwitchSuggested: p.killSwitchSuggested,
            evidence: p.evidence,
          },
        },
      }),
    });
    return r.ok
      ? { channel: "pagerduty", status: "delivered" }
      : { channel: "pagerduty", status: "failed", reason: `HTTP ${r.status}` };
  } catch (e) {
    return { channel: "pagerduty", status: "failed", reason: String(e instanceof Error ? e.message : e) };
  }
}

async function recordReceipt(supa: ReturnType<typeof createClient>, p: AlertPayload, results: ChannelResult[]) {
  try {
    await supa.from("notification_delivery_receipts").insert({
      channel: "alert-router",
      status: results.some((r) => r.status === "delivered") ? "delivered" : "skipped",
      payload: { alert: p, results },
      created_at: new Date().toISOString(),
    });
  } catch {
    // table may not be writable from edge — non-fatal
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "POST required" }), {
      status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let body: AlertPayload;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (!body?.source || !body?.severity || !body?.title || !body?.summary) {
    return new Response(JSON.stringify({ error: "source, severity, title, summary required" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supa = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  const results = await Promise.all([postSlack(body), postPagerDuty(body)]);
  await recordReceipt(supa, body, results);

  return new Response(
    JSON.stringify({
      ok: true,
      delivered: results.filter((r) => r.status === "delivered").length,
      skipped: results.filter((r) => r.status === "skipped").length,
      failed: results.filter((r) => r.status === "failed").length,
      results,
    }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
