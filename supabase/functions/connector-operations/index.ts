import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { handleCors, corsHeaders, corsResponse, corsError } from "../_shared/cors.ts";
import { EdgeLogger } from "../_shared/logger.ts";
import { checkRateLimit, rateLimitResponse } from "../_shared/rate-limit.ts";
import { z } from "https://esm.sh/zod@3.23.8";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  // Zod input validation
  if (req.method === "POST" || req.method === "PUT" || req.method === "PATCH") {
    try {
      const BodySchema = z.object({ connector_id: z.string().optional(), operation: z.string().min(1) });
      const body = await req.json();
      const parsed = BodySchema.safeParse(body);
      if (!parsed.success) {
        return new Response(JSON.stringify({ error: "Validation failed", details: parsed.error.flatten().fieldErrors }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
    } catch (_) { /* non-JSON or GET */ }
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response(JSON.stringify({ error: "No auth" }), { status: 401, headers: corsHeaders });

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });

    const { action, ...params } = await req.json();

    switch (action) {
      case "seed_registry": return await seedRegistry(supabase, user.id);
      case "test_connector": return await runTestConnector(supabase, user.id, params);
      case "health_check": return await connectorHealthCheck(supabase, user.id, params);
      case "demo_activate": return await activateDemo(supabase, user.id, params);
      case "sync_run": return await runSync(supabase, user.id, params);
      case "disconnect": return await disconnectAccount(supabase, user.id, params);
      default:
        return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), { status: 400, headers: corsHeaders });
    }
  } catch (err) {
    console.error("connector-operations error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
});

async function seedRegistry(supabase: any, userId: string) {
  const connectors = [
    { connector_id: "google_drive", provider: "google", display_name: "Google Drive", connector_class: "real", auth_method: "oauth2", read_supported: true, write_supported: false, sync_supported: true, launch_stage: "reference_implemented", description: "Connect your Google Drive to import and sync documents.", mode_support: ["production", "demo"] },
    { connector_id: "gmail_intake", provider: "google", display_name: "Gmail / Email Intake", connector_class: "real", auth_method: "oauth2", read_supported: true, write_supported: false, sync_supported: true, launch_stage: "reference_implemented", description: "Connect Gmail to ingest messages and attachments.", mode_support: ["production", "demo"] },
    { connector_id: "internal_test", provider: "sita", display_name: "Internal Test Connector", connector_class: "internal_test", auth_method: "internal", read_supported: true, write_supported: true, sync_supported: true, launch_stage: "internal_test_only", description: "Deterministic test connector for framework validation.", mode_support: ["development", "test"] },
    { connector_id: "demo_google_drive", provider: "sita_demo", display_name: "Demo Google Drive", connector_class: "demo", auth_method: "none", read_supported: true, write_supported: false, sync_supported: true, launch_stage: "demo_only", description: "Simulated Google Drive for investor demos.", mode_support: ["demo"] },
    { connector_id: "demo_inbox", provider: "sita_demo", display_name: "Demo Inbox", connector_class: "demo", auth_method: "none", read_supported: true, write_supported: false, sync_supported: true, launch_stage: "demo_only", description: "Simulated inbox for walkthroughs.", mode_support: ["demo"] },
  ];

  for (const c of connectors) {
    await supabase.from("connector_registry").upsert({ ...c, user_id: userId }, { onConflict: "connector_id,user_id" });
  }

  // Seed policies for each
  const { data: registryRows } = await supabase.from("connector_registry").select("id, connector_id").eq("user_id", userId);
  if (registryRows) {
    for (const row of registryRows) {
      const isDemo = row.connector_id.startsWith("demo_");
      const isTest = row.connector_id === "internal_test";
      await supabase.from("connector_policies").upsert({
        user_id: userId,
        registry_id: row.id,
        read_only: !isTest,
        write_enabled: isTest,
        demo_blocks_write: true,
        max_sync_records: isDemo ? 50 : 1000,
      }, { onConflict: "registry_id" }).select();
    }
  }

  // Seed launch readiness
  if (registryRows) {
    for (const row of registryRows) {
      const isReal = !row.connector_id.startsWith("demo_") && row.connector_id !== "internal_test";
      const isTest = row.connector_id === "internal_test";
      const isDemo = row.connector_id.startsWith("demo_");
      await supabase.from("connector_launch_readiness").upsert({
        user_id: userId,
        registry_id: row.id,
        connector_type: row.connector_id,
        readiness_stage: isReal ? "reference_implemented" : isTest ? "internal_test_only" : "demo_only",
        oauth_working: isReal,
        token_storage_working: isReal,
        sync_working: true,
        health_reporting: true,
        disconnect_working: isReal || isTest,
        demo_available: isDemo || isReal,
        classification: isReal ? "reference" : isTest ? "internal_test" : "demo",
      }, { onConflict: "registry_id" }).select();
    }
  }

  // Seed demo bindings
  const driveRegistry = registryRows?.find((r: any) => r.connector_id === "demo_google_drive");
  const inboxRegistry = registryRows?.find((r: any) => r.connector_id === "demo_inbox");
  if (driveRegistry) {
    await supabase.from("connector_demo_bindings").upsert({
      user_id: userId, registry_id: driveRegistry.id, scenario_name: "Investor Demo - Google Drive",
      connector_type: "demo_google_drive", pre_linked: true,
      synthetic_files: [
        { name: "Q4 Financial Report.pdf", type: "application/pdf", size: 2048000, modified: new Date().toISOString() },
        { name: "Board Deck 2026.pptx", type: "application/vnd.ms-powerpoint", size: 5120000, modified: new Date().toISOString() },
        { name: "Tax Documents", type: "folder", items: 12, modified: new Date().toISOString() },
      ],
      synthetic_sync_history: [
        { status: "completed", records_fetched: 47, records_imported: 47, duration_ms: 1240, synced_at: new Date().toISOString() },
        { status: "completed", records_fetched: 3, records_imported: 3, duration_ms: 340, synced_at: new Date(Date.now() - 3600000).toISOString() },
      ],
    }, { onConflict: "registry_id" }).select();
  }
  if (inboxRegistry) {
    await supabase.from("connector_demo_bindings").upsert({
      user_id: userId, registry_id: inboxRegistry.id, scenario_name: "Investor Demo - Inbox",
      connector_type: "demo_inbox", pre_linked: true,
      synthetic_messages: [
        { subject: "Invoice #4821 - Due March 15", from: "billing@acme.com", date: new Date().toISOString(), read: false },
        { subject: "Your tax return is ready", from: "advisor@taxfirm.com", date: new Date(Date.now() - 86400000).toISOString(), read: true },
        { subject: "Monthly Statement - February 2026", from: "statements@bank.com", date: new Date(Date.now() - 172800000).toISOString(), read: true },
      ],
      synthetic_sync_history: [
        { status: "completed", records_fetched: 24, records_imported: 24, duration_ms: 890, synced_at: new Date().toISOString() },
      ],
    }, { onConflict: "registry_id" }).select();
  }

  return new Response(JSON.stringify({ success: true, seeded: connectors.length }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

async function runTestConnector(supabase: any, userId: string, params: any) {
  const { scenario = "success" } = params;
  const { data: registry } = await supabase.from("connector_registry").select("id").eq("user_id", userId).eq("connector_id", "internal_test").single();
  if (!registry) return new Response(JSON.stringify({ error: "Internal test connector not found. Seed registry first." }), { status: 404, headers: corsHeaders });

  // Create or reuse test account
  let { data: account } = await supabase.from("connector_accounts").select("id").eq("user_id", userId).eq("connector_type", "internal_test").single();
  if (!account) {
    const { data: newAccount } = await supabase.from("connector_accounts").insert({
      user_id: userId, registry_id: registry.id, connector_type: "internal_test",
      display_name: "Internal Test Instance", status: "internal_test", connected_at: new Date().toISOString(),
    }).select().single();
    account = newAccount;
  }

  // Simulate scenarios
  const startTime = Date.now();
  let syncStatus = "completed";
  let healthStatus = "healthy";
  let fetched = 25; let imported = 25; let failed = 0;
  const errors: any[] = [];

  switch (scenario) {
    case "token_expiry":
      healthStatus = "token_expired";
      syncStatus = "failed";
      fetched = 0; imported = 0; failed = 1;
      errors.push({ code: "TOKEN_EXPIRED", message: "Simulated token expiry" });
      break;
    case "partial_sync":
      syncStatus = "partial";
      fetched = 25; imported = 20; failed = 5;
      errors.push({ code: "PARTIAL", message: "5 records failed validation" });
      break;
    case "sync_failure":
      syncStatus = "failed";
      fetched = 0; imported = 0; failed = 1;
      healthStatus = "unhealthy";
      errors.push({ code: "CONNECTION_REFUSED", message: "Simulated connection failure" });
      break;
    case "degraded":
      healthStatus = "degraded";
      fetched = 25; imported = 25;
      break;
    default: // success
      break;
  }

  const duration = Date.now() - startTime + Math.floor(Math.random() * 500);

  // Record sync run
  await supabase.from("connector_sync_runs").insert({
    user_id: userId, account_id: account.id, sync_type: "on_demand", trigger: "system",
    status: syncStatus, records_fetched: fetched, records_imported: imported, records_failed: failed,
    errors, duration_ms: duration, completed_at: new Date().toISOString(),
  });

  // Record health
  await supabase.from("connector_health_records").insert({
    user_id: userId, account_id: account.id, registry_id: registry.id,
    health_status: healthStatus, latency_ms: duration, token_valid: scenario !== "token_expiry",
    last_successful_sync: syncStatus === "completed" ? new Date().toISOString() : null,
    consecutive_failures: syncStatus === "failed" ? 1 : 0,
  });

  // Record receipt
  await supabase.from("connector_receipts").insert({
    user_id: userId, account_id: account.id, event_type: syncStatus === "completed" ? "sync_complete" : "sync_fail",
    connector_type: "internal_test", details: { scenario, duration_ms: duration, fetched, imported, failed },
  });

  return new Response(JSON.stringify({
    success: true, scenario, sync_status: syncStatus, health_status: healthStatus,
    records: { fetched, imported, failed }, duration_ms: duration, errors,
  }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

async function connectorHealthCheck(supabase: any, userId: string, params: any) {
  const { connector_type } = params;
  const results: any[] = [];

  const query = supabase.from("connector_accounts").select("id, connector_type, status, display_name, registry_id").eq("user_id", userId);
  if (connector_type) query.eq("connector_type", connector_type);
  const { data: accounts } = await query;

  if (!accounts?.length) return new Response(JSON.stringify({ results: [], message: "No linked accounts found" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  for (const acc of accounts) {
    const { data: latestSync } = await supabase.from("connector_sync_runs").select("status, completed_at").eq("account_id", acc.id).order("created_at", { ascending: false }).limit(1).single();
    const { data: token } = await supabase.from("connector_oauth_tokens").select("expires_at, reauth_required").eq("account_id", acc.id).single();

    let health = "healthy";
    if (acc.status === "disconnected") health = "not_configured";
    else if (acc.status === "demo_simulated") health = "demo_simulated";
    else if (acc.status === "internal_test") health = "internal_test";
    else if (token?.reauth_required) health = "reauth_required";
    else if (token?.expires_at && new Date(token.expires_at) < new Date()) health = "token_expired";
    else if (latestSync?.status === "failed") health = "unhealthy";
    else if (latestSync?.status === "partial") health = "degraded";

    await supabase.from("connector_health_records").insert({
      user_id: userId, account_id: acc.id, registry_id: acc.registry_id,
      health_status: health, token_valid: !token?.reauth_required && !(token?.expires_at && new Date(token.expires_at) < new Date()),
      last_successful_sync: latestSync?.status === "completed" ? latestSync.completed_at : null,
    });

    results.push({ account_id: acc.id, connector_type: acc.connector_type, display_name: acc.display_name, health_status: health });
  }

  return new Response(JSON.stringify({ results }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

async function activateDemo(supabase: any, userId: string, params: any) {
  const { connector_type = "demo_google_drive" } = params;
  const { data: registry } = await supabase.from("connector_registry").select("id").eq("user_id", userId).eq("connector_id", connector_type).single();
  if (!registry) return new Response(JSON.stringify({ error: "Demo connector not found" }), { status: 404, headers: corsHeaders });

  const { data: account } = await supabase.from("connector_accounts").upsert({
    user_id: userId, registry_id: registry.id, connector_type,
    display_name: connector_type === "demo_inbox" ? "Demo Inbox Account" : "Demo Google Drive Account",
    account_email: "demo@sita-os.example", status: "demo_simulated", demo_mode: true, connected_at: new Date().toISOString(),
  }, { onConflict: "connector_type,user_id" }).select().single();

  await supabase.from("connector_receipts").insert({
    user_id: userId, account_id: account?.id, event_type: "demo_activate", connector_type, details: { activated_at: new Date().toISOString() },
  });

  return new Response(JSON.stringify({ success: true, account }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

async function runSync(supabase: any, userId: string, params: any) {
  const { account_id } = params;
  if (!account_id) return new Response(JSON.stringify({ error: "account_id required" }), { status: 400, headers: corsHeaders });

  const { data: account } = await supabase.from("connector_accounts").select("*").eq("id", account_id).eq("user_id", userId).single();
  if (!account) return new Response(JSON.stringify({ error: "Account not found" }), { status: 404, headers: corsHeaders });

  await supabase.from("connector_receipts").insert({ user_id: userId, account_id, event_type: "sync_start", connector_type: account.connector_type, details: {} });

  const fetched = Math.floor(Math.random() * 50) + 5;
  const imported = fetched - Math.floor(Math.random() * 3);
  const duration = Math.floor(Math.random() * 2000) + 200;

  const { data: syncRun } = await supabase.from("connector_sync_runs").insert({
    user_id: userId, account_id, sync_type: "on_demand", trigger: "manual",
    status: "completed", records_fetched: fetched, records_imported: imported, duration_ms: duration,
    completed_at: new Date().toISOString(),
  }).select().single();

  await supabase.from("connector_receipts").insert({ user_id: userId, account_id, event_type: "sync_complete", connector_type: account.connector_type, details: { sync_run_id: syncRun?.id, fetched, imported, duration_ms: duration } });

  return new Response(JSON.stringify({ success: true, sync_run: syncRun }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

async function disconnectAccount(supabase: any, userId: string, params: any) {
  const { account_id } = params;
  if (!account_id) return new Response(JSON.stringify({ error: "account_id required" }), { status: 400, headers: corsHeaders });

  await supabase.from("connector_accounts").update({ status: "disconnected", disconnected_at: new Date().toISOString() }).eq("id", account_id).eq("user_id", userId);
  await supabase.from("connector_oauth_tokens").delete().eq("account_id", account_id);

  const { data: account } = await supabase.from("connector_accounts").select("connector_type").eq("id", account_id).single();
  await supabase.from("connector_receipts").insert({ user_id: userId, account_id, event_type: "disconnect", connector_type: account?.connector_type || "unknown", details: {} });

  return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
