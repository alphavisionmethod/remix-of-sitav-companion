// ═══════════════════════════════════════════════════════════════
// SITA OS — OAuth Refresh Probe (Phase R3)
// Scheduled probe for Google / Microsoft / Slack token health.
// Records durable receipts in oauth_refresh_probe_results.
// ═══════════════════════════════════════════════════════════════
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Provider = "google" | "microsoft" | "slack";
const SUPPORTED: Provider[] = ["google", "microsoft", "slack"];

interface ProbeOutcome {
  ok: boolean;
  failureClass?: "transient" | "reauth_required" | "permission_drift" | "revoked" | "provider_outage" | "config";
  failureReason?: string;
  evidence: Record<string, unknown>;
}

async function probeGoogle(refreshToken: string): Promise<ProbeOutcome> {
  const clientId = Deno.env.get("GOOGLE_CONNECTOR_CLIENT_ID");
  const clientSecret = Deno.env.get("GOOGLE_CONNECTOR_CLIENT_SECRET");
  if (!clientId || !clientSecret) {
    return { ok: false, failureClass: "config", failureReason: "missing-google-oauth-secrets", evidence: {} };
  }
  const body = new URLSearchParams({
    client_id: clientId, client_secret: clientSecret,
    refresh_token: refreshToken, grant_type: "refresh_token",
  });
  const t0 = Date.now();
  const resp = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  const latency = Date.now() - t0;
  const text = await resp.text();
  if (resp.ok) {
    return { ok: true, evidence: { latencyMs: latency, status: resp.status } };
  }
  let cls: ProbeOutcome["failureClass"] = "transient";
  if (resp.status === 400 || resp.status === 401) cls = text.includes("invalid_grant") ? "reauth_required" : "revoked";
  if (resp.status >= 500) cls = "provider_outage";
  return { ok: false, failureClass: cls, failureReason: `google:${resp.status}:${text.slice(0, 120)}`, evidence: { latencyMs: latency, status: resp.status } };
}

async function probeMicrosoft(refreshToken: string): Promise<ProbeOutcome> {
  const clientId = Deno.env.get("MICROSOFT_CONNECTOR_CLIENT_ID");
  const clientSecret = Deno.env.get("MICROSOFT_CONNECTOR_CLIENT_SECRET");
  const tenant = Deno.env.get("MICROSOFT_CONNECTOR_TENANT") ?? "common";
  if (!clientId || !clientSecret) {
    return { ok: false, failureClass: "config", failureReason: "missing-microsoft-oauth-secrets", evidence: {} };
  }
  const body = new URLSearchParams({
    client_id: clientId, client_secret: clientSecret,
    refresh_token: refreshToken, grant_type: "refresh_token",
    scope: "offline_access https://graph.microsoft.com/.default",
  });
  const t0 = Date.now();
  const resp = await fetch(`https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  const latency = Date.now() - t0;
  const text = await resp.text();
  if (resp.ok) return { ok: true, evidence: { latencyMs: latency, status: resp.status } };
  let cls: ProbeOutcome["failureClass"] = "transient";
  if (text.includes("AADSTS70008") || text.includes("AADSTS700082")) cls = "reauth_required";
  if (text.includes("AADSTS50173") || text.includes("invalid_grant")) cls = "reauth_required";
  if (text.includes("AADSTS65001")) cls = "permission_drift";
  if (resp.status >= 500) cls = "provider_outage";
  return { ok: false, failureClass: cls, failureReason: `ms:${resp.status}:${text.slice(0, 120)}`, evidence: { latencyMs: latency, status: resp.status } };
}

async function probeSlack(accessToken: string): Promise<ProbeOutcome> {
  // Slack uses long-lived tokens; we probe via auth.test as the refresh-equivalent.
  const t0 = Date.now();
  const resp = await fetch("https://slack.com/api/auth.test", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const latency = Date.now() - t0;
  const data = await resp.json().catch(() => ({}));
  if (resp.ok && data?.ok === true) return { ok: true, evidence: { latencyMs: latency, team: data.team } };
  let cls: ProbeOutcome["failureClass"] = "transient";
  if (data?.error === "token_revoked" || data?.error === "token_expired") cls = "revoked";
  if (data?.error === "missing_scope") cls = "permission_drift";
  if (data?.error === "not_authed" || data?.error === "invalid_auth") cls = "reauth_required";
  return { ok: false, failureClass: cls, failureReason: `slack:${data?.error ?? resp.status}`, evidence: { latencyMs: latency, slackError: data?.error } };
}

function classifyLifecycle(outcome: ProbeOutcome, retryCount: number): { lifecycle: string; alert: string; reauth: boolean } {
  if (outcome.ok) return { lifecycle: "healthy", alert: "ok", reauth: false };
  if (outcome.failureClass === "reauth_required" || outcome.failureClass === "revoked") {
    return { lifecycle: "reauth_required", alert: "critical", reauth: true };
  }
  if (outcome.failureClass === "permission_drift") return { lifecycle: "degraded", alert: "warning", reauth: true };
  if (outcome.failureClass === "config") return { lifecycle: "blocked", alert: "warning", reauth: false };
  if (retryCount >= 3) return { lifecycle: "failing", alert: "critical", reauth: false };
  return { lifecycle: "degraded", alert: "warning", reauth: false };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(supabaseUrl, serviceKey);

  const probeId = `probe-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
  const summary = { probeId, providers: {} as Record<string, { attempted: number; healthy: number; degraded: number; failing: number; reauth: number }> };

  for (const provider of SUPPORTED) {
    summary.providers[provider] = { attempted: 0, healthy: 0, degraded: 0, failing: 0, reauth: 0 };

    const { data: tokens, error } = await admin
      .from("connector_tokens")
      .select("id, user_id, account_id, provider, refresh_token, access_token")
      .eq("provider", provider)
      .limit(50);

    if (error || !tokens) continue;

    for (const t of tokens as Array<Record<string, string>>) {
      summary.providers[provider].attempted++;
      const startedAt = new Date().toISOString();
      const t0 = Date.now();
      let outcome: ProbeOutcome;
      try {
        if (provider === "google") outcome = await probeGoogle(t.refresh_token);
        else if (provider === "microsoft") outcome = await probeMicrosoft(t.refresh_token);
        else outcome = await probeSlack(t.access_token);
      } catch (e) {
        outcome = { ok: false, failureClass: "transient", failureReason: `exception:${(e as Error).message.slice(0, 100)}`, evidence: {} };
      }
      const durationMs = Date.now() - t0;

      const { count: prevCount } = await admin
        .from("oauth_refresh_probe_results")
        .select("*", { count: "exact", head: true })
        .eq("user_id", t.user_id).eq("provider", provider).eq("status", "fail");
      const retryCount = outcome.ok ? 0 : (prevCount ?? 0) + 1;

      const { lifecycle, alert, reauth } = classifyLifecycle(outcome, retryCount);
      if (outcome.ok) summary.providers[provider].healthy++;
      else if (lifecycle === "reauth_required") { summary.providers[provider].reauth++; summary.providers[provider].failing++; }
      else if (lifecycle === "failing") summary.providers[provider].failing++;
      else summary.providers[provider].degraded++;

      await admin.from("oauth_refresh_probe_results").insert({
        probe_id: probeId,
        user_id: t.user_id,
        provider,
        account_id: t.account_id,
        token_row_id: t.id,
        probe_started_at: startedAt,
        probe_finished_at: new Date().toISOString(),
        duration_ms: durationMs,
        status: outcome.ok ? "success" : "fail",
        failure_class: outcome.failureClass ?? null,
        failure_reason: outcome.failureReason ?? null,
        retry_count: retryCount,
        lifecycle_state: lifecycle,
        alert_state: alert,
        reauth_required: reauth,
        next_probe_due_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        evidence: outcome.evidence,
      });
    }
  }

  // Update cadence registry last_run for each provider
  for (const p of SUPPORTED) {
    await admin.from("drill_cadence_registry").update({
      last_run_at: new Date().toISOString(),
      last_status: summary.providers[p].failing > 0 ? "failed" : "ok",
      next_due_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    }).eq("drill_key", `oauth-refresh-probe-${p}`);
  }

  return new Response(JSON.stringify({ ok: true, summary }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
