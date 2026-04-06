import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { handleCors, corsHeaders, corsResponse, corsError } from "../_shared/cors.ts";
import { EdgeLogger } from "../_shared/logger.ts";
import { checkRateLimit, rateLimitResponse } from "../_shared/rate-limit.ts";
import { z } from "https://esm.sh/zod@3.23.8";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response(JSON.stringify({ error: "No auth" }), { status: 401, headers: corsHeaders });

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });

    const { action } = await req.json();

    switch (action) {
      case "seed_provider_families": return await seedProviderFamilies(supabase, user.id);
      case "seed_google_family": return await seedGoogleFamily(supabase, user.id);
      case "seed_scope_policies": return await seedScopePolicies(supabase, user.id);
      case "check_permission_drift": return await checkPermissionDrift(supabase, user.id);
      case "generate_scope_recommendation": return await generateScopeRecommendation(supabase, user.id);
      case "account_graph_report": return await accountGraphReport(supabase, user.id);
      default:
        return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), { status: 400, headers: corsHeaders });
    }
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
});

function jsonRes(body: unknown) {
  return new Response(JSON.stringify(body), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

async function seedProviderFamilies(supabase: any, userId: string) {
  const families = [
    { provider_key: "google", name: "Google", description: "Google Workspace & Cloud services", categories: ["identity","storage","email","calendar","docs"], auth_types_supported: ["oauth2"], identity_support: true, connector_support: true, launch_stage: "alpha" },
    { provider_key: "microsoft", name: "Microsoft", description: "Microsoft 365 & Azure services", categories: ["identity","storage","email","calendar","docs"], auth_types_supported: ["oauth2"], identity_support: true, connector_support: true, launch_stage: "planned" },
    { provider_key: "apple", name: "Apple", description: "Apple identity & services", categories: ["identity"], auth_types_supported: ["oauth2","sign_in_with_apple"], identity_support: true, connector_support: false, launch_stage: "planned" },
    { provider_key: "stripe", name: "Stripe", description: "Payment processing & billing", categories: ["finance","billing"], auth_types_supported: ["api_key","oauth2"], identity_support: false, connector_support: true, launch_stage: "planned" },
    { provider_key: "slack", name: "Slack", description: "Team communications", categories: ["communications","collaboration"], auth_types_supported: ["oauth2"], identity_support: false, connector_support: true, launch_stage: "planned" },
    { provider_key: "dropbox", name: "Dropbox", description: "Cloud file storage", categories: ["storage"], auth_types_supported: ["oauth2"], identity_support: false, connector_support: true, launch_stage: "planned" },
    { provider_key: "notion", name: "Notion", description: "Workspace & knowledge management", categories: ["docs","collaboration"], auth_types_supported: ["oauth2"], identity_support: false, connector_support: true, launch_stage: "planned" },
    { provider_key: "plaid", name: "Plaid", description: "Financial account linking", categories: ["finance"], auth_types_supported: ["plaid_link"], identity_support: false, connector_support: true, launch_stage: "planned" },
    { provider_key: "hubspot", name: "HubSpot", description: "CRM & marketing", categories: ["crm","communications"], auth_types_supported: ["oauth2"], identity_support: false, connector_support: true, launch_stage: "planned" },
    { provider_key: "quickbooks", name: "QuickBooks", description: "Accounting & bookkeeping", categories: ["finance","billing"], auth_types_supported: ["oauth2"], identity_support: false, connector_support: true, launch_stage: "planned" },
  ];

  let count = 0;
  for (const f of families) {
    const { error } = await supabase.from("provider_families").upsert({ ...f, user_id: userId }, { onConflict: "provider_key,user_id" });
    if (!error) count++;
  }

  // Also seed launch honesty for each family
  const { data: allFamilies } = await supabase.from("provider_families").select("id, provider_key, launch_stage").eq("user_id", userId);
  for (const fam of (allFamilies || [])) {
    const label = fam.launch_stage === "alpha" ? "identity_only" : "shell_only";
    await supabase.from("integration_launch_honesty").upsert({
      user_id: userId, provider_family_id: fam.id, launch_label: label,
      blockers: fam.launch_stage === "planned" ? ["Not yet implemented"] : [],
      evidence: { seeded: true, stage: fam.launch_stage },
    }, { onConflict: "provider_family_id,user_id" }).select();
  }

  return jsonRes({ success: true, families_seeded: count });
}

async function seedGoogleFamily(supabase: any, userId: string) {
  // Get Google family
  const { data: google } = await supabase.from("provider_families").select("id").eq("user_id", userId).eq("provider_key", "google").single();
  if (!google) return jsonRes({ success: false, error: "Seed provider families first" });

  const capabilities = [
    { capability_key: "google_identity", display_name: "Google Sign-In", category: "identity", minimum_scopes: ["openid","profile","email"], read_write: "read", sync_support: false, health_support: false, upgrade_path_support: false, launch_stage: "alpha" },
    { capability_key: "google_drive", display_name: "Google Drive", category: "storage", minimum_scopes: ["https://www.googleapis.com/auth/drive.metadata.readonly"], optional_scopes: ["https://www.googleapis.com/auth/drive.readonly","https://www.googleapis.com/auth/drive.file","https://www.googleapis.com/auth/drive"], read_write: "read", sync_support: true, health_support: true, upgrade_path_support: true, launch_stage: "planned" },
    { capability_key: "google_gmail", display_name: "Gmail", category: "email", minimum_scopes: ["https://www.googleapis.com/auth/gmail.metadata"], optional_scopes: ["https://www.googleapis.com/auth/gmail.readonly","https://www.googleapis.com/auth/gmail.send","https://www.googleapis.com/auth/gmail.modify"], read_write: "read", sync_support: true, health_support: true, upgrade_path_support: true, launch_stage: "planned" },
    { capability_key: "google_calendar", display_name: "Google Calendar", category: "calendar", minimum_scopes: ["https://www.googleapis.com/auth/calendar.readonly"], optional_scopes: ["https://www.googleapis.com/auth/calendar","https://www.googleapis.com/auth/calendar.events"], read_write: "read", sync_support: true, health_support: true, upgrade_path_support: true, launch_stage: "planned" },
  ];

  const capIds: Record<string, string> = {};
  for (const c of capabilities) {
    const { data } = await supabase.from("provider_capabilities").upsert({ ...c, provider_family_id: google.id, user_id: userId }, { onConflict: "capability_key,user_id" }).select().single();
    if (data) capIds[c.capability_key] = data.id;
  }

  // OAuth Clients
  const clients = [
    { client_name: "SITA Web Auth", client_purpose: "identity_web", allowed_capabilities: ["google_identity"], environment: "production", launch_stage: "alpha", notes: "Supabase Auth Google provider — openid, profile, email only" },
    { client_name: "SITA Connector Access", client_purpose: "connector_web", allowed_capabilities: ["google_drive","google_gmail","google_calendar"], environment: "production", launch_stage: "planned", notes: "Separate OAuth client for Drive/Gmail/Calendar connector scopes" },
    { client_name: "SITA iOS Auth", client_purpose: "mobile_ios", allowed_capabilities: ["google_identity"], environment: "production", launch_stage: "planned", notes: "Future iOS OAuth client" },
    { client_name: "SITA Android Auth", client_purpose: "mobile_android", allowed_capabilities: ["google_identity"], environment: "production", launch_stage: "planned", notes: "Future Android OAuth client" },
  ];

  for (const cl of clients) {
    await supabase.from("oauth_client_registry").upsert({ ...cl, provider_family_id: google.id, user_id: userId }, { onConflict: "id" });
  }

  // Scope policies
  for (const [key, capId] of Object.entries(capIds)) {
    const cap = capabilities.find(c => c.capability_key === key)!;
    await supabase.from("scope_policy_matrix").upsert({
      user_id: userId, provider_capability_id: capId,
      minimum_scopes: cap.minimum_scopes, optional_scopes: cap.optional_scopes || [],
      disallowed_scopes: key === "google_gmail" ? ["https://mail.google.com/"] : [],
      default_grant_profile: "read_only",
      upgrade_path_available: cap.upgrade_path_support,
      approval_required_for_upgrade: key === "google_gmail",
      launch_safety_notes: key === "google_gmail" ? "Gmail send scope requires explicit user approval" : null,
    }, { onConflict: "provider_capability_id,user_id" });

    // Launch honesty per capability
    await supabase.from("integration_launch_honesty").insert({
      user_id: userId, provider_family_id: google.id, provider_capability_id: capId,
      launch_label: key === "google_identity" ? "identity_only" : "shell_only",
      blockers: key === "google_identity" ? [] : ["OAuth client not configured", "Connector not built"],
    });
  }

  return jsonRes({ success: true, capabilities: Object.keys(capIds).length, oauth_clients: clients.length });
}

async function seedScopePolicies(supabase: any, userId: string) {
  // Already handled in seedGoogleFamily; this seeds for non-Google families
  const { data: caps } = await supabase.from("provider_capabilities").select("id, capability_key, minimum_scopes, optional_scopes, upgrade_path_support").eq("user_id", userId);
  let count = 0;
  for (const cap of (caps || [])) {
    const { error } = await supabase.from("scope_policy_matrix").upsert({
      user_id: userId, provider_capability_id: cap.id,
      minimum_scopes: cap.minimum_scopes || [], optional_scopes: cap.optional_scopes || [],
      default_grant_profile: "read_only", upgrade_path_available: cap.upgrade_path_support || false,
    }, { onConflict: "provider_capability_id,user_id" });
    if (!error) count++;
  }
  return jsonRes({ success: true, policies_seeded: count });
}

async function checkPermissionDrift(supabase: any, userId: string) {
  const { data: services } = await supabase.from("connected_service_links").select("*, provider_capabilities(capability_key, display_name)").eq("user_id", userId);
  const drifts: any[] = [];

  for (const svc of (services || [])) {
    if (svc.reauth_needed) {
      drifts.push({ drift_type: "reauth_needed", description: `${svc.provider_capabilities?.display_name} requires re-authentication`, severity: "high", provider_capability_id: svc.provider_capability_id, reconnect_needed: true, reauth_needed: true });
    }
    if (svc.health_status === "error" || svc.health_status === "degraded") {
      drifts.push({ drift_type: "health_degraded", description: `${svc.provider_capabilities?.display_name} health is ${svc.health_status}`, severity: "medium", provider_capability_id: svc.provider_capability_id });
    }
  }

  for (const d of drifts) {
    await supabase.from("permission_drift_records").insert({ ...d, user_id: userId });
  }

  return jsonRes({ success: true, drifts_detected: drifts.length });
}

async function generateScopeRecommendation(supabase: any, userId: string) {
  const { data: policies } = await supabase.from("scope_policy_matrix").select("*, provider_capabilities(capability_key, display_name)").eq("user_id", userId);
  const recs: any[] = [];

  for (const p of (policies || [])) {
    const warnings: string[] = [];
    if ((p.optional_scopes || []).some((s: string) => s.includes("send") || s.includes("modify") || s.includes("write"))) {
      warnings.push("Write/send scopes available — start with read-only");
    }
    if (p.approval_required_for_upgrade) {
      warnings.push("Upgrade requires explicit approval");
    }

    recs.push({
      user_id: userId, provider_capability_id: p.provider_capability_id,
      requested_scopes: [...(p.minimum_scopes || []), ...(p.optional_scopes || [])],
      recommended_scopes: p.minimum_scopes || [],
      removed_scopes: p.optional_scopes || [],
      warnings, approval_needed: p.approval_required_for_upgrade || false,
      launch_safe: (p.minimum_scopes || []).length > 0,
    });
  }

  for (const r of recs) {
    await supabase.from("scope_recommendations").insert(r);
  }

  return jsonRes({ success: true, recommendations: recs.length });
}

async function accountGraphReport(supabase: any, userId: string) {
  const { data: nodes } = await supabase.from("unified_account_nodes").select("*").eq("user_id", userId);
  const { data: edges } = await supabase.from("unified_account_edges").select("*").eq("user_id", userId);
  const { data: identities } = await supabase.from("identity_provider_links").select("*, provider_families(name, provider_key)").eq("user_id", userId);
  const { data: services } = await supabase.from("connected_service_links").select("*, provider_families(name), provider_capabilities(display_name, capability_key)").eq("user_id", userId);

  return jsonRes({
    success: true,
    nodes: (nodes || []).length,
    edges: (edges || []).length,
    identity_links: (identities || []).length,
    service_links: (services || []).length,
    graph: { nodes: nodes || [], edges: edges || [], identities: identities || [], services: services || [] },
  });
}
