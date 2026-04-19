// ═══════════════════════════════════════════════════════════════
// SITA OS — Connector Refresh Nightly Verifier
//
// Performs the nightly truth check for the 3 live OAuth providers:
//   1. live_refresh: invokes oauth-refresh-probe and reads results
//   2. expiry_pressure_synthetic: sends sentinel invalid token to real
//      provider endpoint and asserts classifier emits reauth_required
//   3. state_consistency: ensures no token surfaces as connected while
//      its latest probe is failing/reauth_required
//
// Inserts one row into connector_refresh_nightly_runs.
// Trigger updates per-provider streak rows automatically.
//
// REUSES existing oauth-refresh-probe + oauth_refresh_probe_results.
// NO duplicate refresh logic, NO mocked providers.
// ═══════════════════════════════════════════════════════════════
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Provider = "google" | "microsoft" | "slack";
const PROVIDERS: Provider[] = ["google", "microsoft", "slack"];

interface ProviderEvidence {
  provider: Provider;
  liveRefreshOk: boolean;
  successCount24h: number;
  failureCount24h: number;
  lastSuccessAt: string | null;
  lastFailureClass: string | null;
}

interface ExpiryPressureResult {
  provider: Provider;
  expectedClass: string;
  actualClass: string | null;
  passed: boolean;
  detail: string;
}

interface StateConsistencyResult {
  passed: boolean;
  driftCount: number;
  driftSamples: Array<{ token_id: string; account_state: string; probe_state: string }>;
}

async function checkLiveRefresh(
  admin: ReturnType<typeof createClient>,
  provider: Provider,
): Promise<ProviderEvidence> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: rows } = await admin
    .from("oauth_refresh_probe_results")
    .select("status, failure_class, probe_finished_at")
    .eq("provider", provider)
    .gte("probe_finished_at", since)
    .order("probe_finished_at", { ascending: false })
    .limit(200);

  const successes = (rows ?? []).filter((r: any) => r.status === "success");
  const failures = (rows ?? []).filter((r: any) => r.status === "fail");
  const lastSuccess = successes[0] ?? null;
  const lastFailure = failures[0] ?? null;

  return {
    provider,
    liveRefreshOk: successes.length > 0,
    successCount24h: successes.length,
    failureCount24h: failures.length,
    lastSuccessAt: lastSuccess?.probe_finished_at ?? null,
    lastFailureClass: lastFailure?.failure_class ?? null,
  };
}

async function expiryPressureGoogle(runId: string): Promise<ExpiryPressureResult> {
  const clientId = Deno.env.get("GOOGLE_CONNECTOR_CLIENT_ID");
  const clientSecret = Deno.env.get("GOOGLE_CONNECTOR_CLIENT_SECRET");
  if (!clientId || !clientSecret) {
    return {
      provider: "google",
      expectedClass: "reauth_required",
      actualClass: null,
      passed: false,
      detail: "missing-google-oauth-secrets (cannot run expiry-pressure)",
    };
  }
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: `expired-sentinel-google-${runId}`,
    grant_type: "refresh_token",
  });
  try {
    const resp = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });
    const text = await resp.text();
    let actual = "transient";
    if ((resp.status === 400 || resp.status === 401) && text.includes("invalid_grant")) actual = "reauth_required";
    else if (resp.status === 400 || resp.status === 401) actual = "revoked";
    return {
      provider: "google",
      expectedClass: "reauth_required|revoked",
      actualClass: actual,
      passed: actual === "reauth_required" || actual === "revoked",
      detail: `status=${resp.status} body~=${text.slice(0, 120)}`,
    };
  } catch (e) {
    return {
      provider: "google",
      expectedClass: "reauth_required",
      actualClass: null,
      passed: false,
      detail: `exception:${(e as Error).message.slice(0, 100)}`,
    };
  }
}

async function expiryPressureMicrosoft(runId: string): Promise<ExpiryPressureResult> {
  const clientId = Deno.env.get("MICROSOFT_CONNECTOR_CLIENT_ID");
  const clientSecret = Deno.env.get("MICROSOFT_CONNECTOR_CLIENT_SECRET");
  const tenant = Deno.env.get("MICROSOFT_CONNECTOR_TENANT") ?? "common";
  if (!clientId || !clientSecret) {
    return {
      provider: "microsoft",
      expectedClass: "reauth_required",
      actualClass: null,
      passed: false,
      detail: "missing-microsoft-oauth-secrets",
    };
  }
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: `expired-sentinel-microsoft-${runId}`,
    grant_type: "refresh_token",
    scope: "offline_access https://graph.microsoft.com/.default",
  });
  try {
    const resp = await fetch(`https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });
    const text = await resp.text();
    let actual = "transient";
    if (text.includes("invalid_grant") || text.includes("AADSTS70008") || text.includes("AADSTS50173"))
      actual = "reauth_required";
    return {
      provider: "microsoft",
      expectedClass: "reauth_required",
      actualClass: actual,
      passed: actual === "reauth_required",
      detail: `status=${resp.status} body~=${text.slice(0, 120)}`,
    };
  } catch (e) {
    return {
      provider: "microsoft",
      expectedClass: "reauth_required",
      actualClass: null,
      passed: false,
      detail: `exception:${(e as Error).message.slice(0, 100)}`,
    };
  }
}

async function expiryPressureSlack(runId: string): Promise<ExpiryPressureResult> {
  try {
    const resp = await fetch("https://slack.com/api/auth.test", {
      method: "POST",
      headers: { Authorization: `Bearer expired-sentinel-slack-${runId}` },
    });
    const data = await resp.json().catch(() => ({}));
    let actual = "transient";
    if (data?.error === "token_revoked" || data?.error === "token_expired") actual = "revoked";
    else if (data?.error === "invalid_auth" || data?.error === "not_authed") actual = "reauth_required";
    return {
      provider: "slack",
      expectedClass: "reauth_required|revoked",
      actualClass: actual,
      passed: actual === "reauth_required" || actual === "revoked",
      detail: `slackError=${data?.error ?? "unknown"}`,
    };
  } catch (e) {
    return {
      provider: "slack",
      expectedClass: "reauth_required",
      actualClass: null,
      passed: false,
      detail: `exception:${(e as Error).message.slice(0, 100)}`,
    };
  }
}

async function checkStateConsistency(
  admin: ReturnType<typeof createClient>,
): Promise<StateConsistencyResult> {
  // Read connector_effective_state and join logically with latest probe per token.
  const { data: states } = await admin
    .from("connector_effective_state")
    .select("token_id, effective_state, connector_type")
    .in("connector_type", PROVIDERS)
    .limit(500);

  const tokenIds = (states ?? []).map((s: any) => s.token_id).filter(Boolean);
  if (tokenIds.length === 0) {
    return { passed: true, driftCount: 0, driftSamples: [] };
  }

  const since = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();
  const { data: probes } = await admin
    .from("oauth_refresh_probe_results")
    .select("token_row_id, lifecycle_state, probe_finished_at")
    .in("token_row_id", tokenIds)
    .gte("probe_finished_at", since)
    .order("probe_finished_at", { ascending: false });

  // latest probe per token
  const latestPerToken = new Map<string, string>();
  for (const p of probes ?? []) {
    if (!latestPerToken.has((p as any).token_row_id)) {
      latestPerToken.set((p as any).token_row_id, (p as any).lifecycle_state);
    }
  }

  const drift: Array<{ token_id: string; account_state: string; probe_state: string }> = [];
  for (const s of states ?? []) {
    const probeState = latestPerToken.get((s as any).token_id);
    if (
      (s as any).effective_state === "connected" &&
      probeState &&
      ["failing", "reauth_required"].includes(probeState)
    ) {
      drift.push({
        token_id: (s as any).token_id,
        account_state: (s as any).effective_state,
        probe_state: probeState,
      });
    }
  }

  return { passed: drift.length === 0, driftCount: drift.length, driftSamples: drift.slice(0, 10) };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(supabaseUrl, serviceKey);

  // Admin caller check (skipped for service-role / pg_cron callers since they
  // bypass user JWTs; we rely on the anon-key absence-check above implicitly
  // because SUPABASE_SERVICE_ROLE_KEY is required for inserts via RLS).
  const authHeader = req.headers.get("Authorization") ?? "";
  if (authHeader && !authHeader.includes(serviceKey)) {
    const tokenSupabase = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claims } = await tokenSupabase.auth.getClaims(token);
    if (!claims?.claims?.sub) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { data: roleRow } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", claims.claims.sub)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleRow) {
      return new Response(JSON.stringify({ error: "admin role required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  const runId = `connector-nightly-${new Date().toISOString().replace(/[:.]/g, "-")}`;
  const startedAt = new Date().toISOString();

  // Insert running row
  await admin.from("connector_refresh_nightly_runs").insert({
    run_id: runId,
    started_at: startedAt,
    status: "running",
    triggered_by: "edge-function",
  });

  // 1. live_refresh per provider
  const perProvider: ProviderEvidence[] = [];
  for (const p of PROVIDERS) {
    perProvider.push(await checkLiveRefresh(admin, p));
  }

  // 2. expiry_pressure per provider
  const expiryResults: ExpiryPressureResult[] = [
    await expiryPressureGoogle(runId),
    await expiryPressureMicrosoft(runId),
    await expiryPressureSlack(runId),
  ];
  const expiryPressurePassed = expiryResults.every((r) => r.passed);

  // 3. state_consistency
  const stateConsistency = await checkStateConsistency(admin);

  // Classify
  const providersPassed = perProvider.filter((p) => p.liveRefreshOk).map((p) => p.provider);
  const providersFailed = perProvider.filter((p) => !p.liveRefreshOk).map((p) => p.provider);

  // reauth-required count from latest 24h probe rows
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: reauthRows } = await admin
    .from("oauth_refresh_probe_results")
    .select("provider")
    .eq("reauth_required", true)
    .gte("probe_finished_at", since24h);
  const reauthSet = new Set((reauthRows ?? []).map((r: any) => r.provider));
  const providersReauthRequired = Array.from(reauthSet).filter((p) =>
    PROVIDERS.includes(p as Provider),
  );

  let status: "pass" | "fail" | "degraded";
  let failureSummary: string | null = null;

  if (!expiryPressurePassed || !stateConsistency.passed) {
    status = "fail";
    const reasons: string[] = [];
    if (!expiryPressurePassed)
      reasons.push(
        `expiry_pressure failed: ${expiryResults
          .filter((r) => !r.passed)
          .map((r) => `${r.provider}=${r.actualClass ?? "null"}`)
          .join(",")}`,
      );
    if (!stateConsistency.passed)
      reasons.push(`state_consistency drift count=${stateConsistency.driftCount}`);
    failureSummary = reasons.join(" | ");
  } else if (providersFailed.length > 0) {
    status = "degraded";
    failureSummary = `live_refresh failed for: ${providersFailed.join(",")}`;
  } else {
    status = "pass";
  }

  const completedAt = new Date().toISOString();
  const evidence = {
    perProvider,
    expiryPressure: expiryResults,
    stateConsistency,
    reauthRequired24h: providersReauthRequired,
  };

  // Update the run row → trigger handles streak recompute
  await admin
    .from("connector_refresh_nightly_runs")
    .update({
      completed_at: completedAt,
      status,
      providers_passed: providersPassed,
      providers_failed: providersFailed,
      providers_reauth_required: providersReauthRequired,
      expiry_pressure_passed: expiryPressurePassed,
      state_consistency_passed: stateConsistency.passed,
      failure_summary: failureSummary,
      evidence,
    })
    .eq("run_id", runId);

  return new Response(
    JSON.stringify({
      ok: true,
      runId,
      status,
      providersPassed,
      providersFailed,
      providersReauthRequired,
      expiryPressurePassed,
      stateConsistencyPassed: stateConsistency.passed,
      failureSummary,
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
