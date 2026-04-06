// ═══════════════════════════════════════════════════════════════
// SITA OS — Master Ecosystem Seeder
// Populates all critical ecosystem tables with operational data
// Run once per authenticated user to bootstrap admin pages
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";

async function getUserId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

async function upsertRows(table: string, rows: Record<string, unknown>[], conflictCol?: string): Promise<number> {
  const opts = conflictCol ? { onConflict: conflictCol } : {};
  const { error } = await (supabase as any).from(table).upsert(rows, opts);
  if (error) {
    console.warn(`[seeder] ${table} upsert warning:`, error.message);
    return 0;
  }
  return rows.length;
}

// ── AI Provider Registry ────────────────────────────────────
function aiProviderRows(userId: string) {
  return [
    { user_id: userId, provider_key: "lovable", display_name: "Lovable AI Gateway", api_style: "openai", is_active: true, mode: "real", launch_stage: "production", supports_streaming: true, supports_structured_output: true, supports_tools: true, supports_demo_mode: false },
    { user_id: userId, provider_key: "demo", display_name: "Demo Provider (Local)", api_style: "openai", is_active: true, mode: "demo", launch_stage: "production", supports_streaming: false, supports_structured_output: true, supports_tools: false, supports_demo_mode: true },
  ];
}

// ── AI Model Registry ───────────────────────────────────────
function aiModelRows(userId: string) {
  return [
    { user_id: userId, model_id: "gemini-2.5-flash-lite", provider: "lovable", provider_model_name: "gemini-2.5-flash-lite", model_class: "economy", display_name: "Gemini 2.5 Flash Lite", cost_per_1k_input: 0.01, cost_per_1k_output: 0.04, context_length: 128000, is_active: true, cost_tier: "economy", latency_tier: "fast", quality_tier: "good", tool_calling_support: true, structured_output_support: true },
    { user_id: userId, model_id: "gemini-2.5-flash", provider: "lovable", provider_model_name: "gemini-2.5-flash", model_class: "balanced", display_name: "Gemini 2.5 Flash", cost_per_1k_input: 0.015, cost_per_1k_output: 0.06, context_length: 128000, is_active: true, cost_tier: "balanced", latency_tier: "medium", quality_tier: "strong", tool_calling_support: true, structured_output_support: true },
    { user_id: userId, model_id: "gemini-2.5-pro", provider: "lovable", provider_model_name: "gemini-2.5-pro", model_class: "premium", display_name: "Gemini 2.5 Pro", cost_per_1k_input: 0.07, cost_per_1k_output: 0.28, context_length: 128000, is_active: true, cost_tier: "premium", latency_tier: "slow", quality_tier: "exceptional", tool_calling_support: true, structured_output_support: true },
  ];
}

// ── AI Budget Policies ──────────────────────────────────────
function aiBudgetPolicyRows(userId: string) {
  return [
    { user_id: userId, policy_key: "global_default", scope_type: "global", is_active: true, daily_budget_usd: 5.0, weekly_budget_usd: 25.0, monthly_budget_usd: 80.0, max_request_cost_usd: 0.50, max_daily_requests: 200, premium_allowed: true, alert_threshold_percent: 70, critical_threshold_percent: 90, block_on_exceeded: false, fallback_on_exceeded: true },
    { user_id: userId, policy_key: "economy_cap", scope_type: "capability", scope_ref: "economy_admin", is_active: true, daily_budget_usd: 1.0, max_request_cost_usd: 0.05, premium_allowed: false, alert_threshold_percent: 80, critical_threshold_percent: 95, block_on_exceeded: true, fallback_on_exceeded: false },
  ];
}

// ── AI Capability Routing ───────────────────────────────────
function aiCapabilityRoutingRows(userId: string) {
  return [
    { user_id: userId, capability_key: "admin_workforce_task", routing_class: "balanced", budget_class: "balanced", quality_requirement: "strong", max_latency_class: "medium", launch_honesty_class: "internal_only", is_active: true, structured_output_required: true, tool_use_required: true, can_fallback_to_demo: true, can_fallback_to_unavailable: false },
    { user_id: userId, capability_key: "architecture_review", routing_class: "premium", budget_class: "premium", quality_requirement: "exceptional", max_latency_class: "slow", launch_honesty_class: "internal_only", is_active: true, structured_output_required: true, tool_use_required: true, can_fallback_to_demo: false, can_fallback_to_unavailable: false },
    { user_id: userId, capability_key: "incident_triage", routing_class: "economy", budget_class: "economy", quality_requirement: "good", max_latency_class: "fast", launch_honesty_class: "internal_only", is_active: true, structured_output_required: true, tool_use_required: false, can_fallback_to_demo: true, can_fallback_to_unavailable: true },
  ];
}

// ── Connector Registry ──────────────────────────────────────
function connectorRegistryRows(userId: string) {
  const now = new Date().toISOString();
  return [
    { user_id: userId, connector_key: "bank_plaid", display_name: "Bank (Plaid)", category: "finance", provider: "plaid", auth_method: "oauth2", is_active: true, launch_stage: "demo", demo_available: true, created_at: now },
    { user_id: userId, connector_key: "google_calendar", display_name: "Google Calendar", category: "productivity", provider: "google", auth_method: "oauth2", is_active: true, launch_stage: "demo", demo_available: true, created_at: now },
    { user_id: userId, connector_key: "email_gmail", display_name: "Gmail", category: "communication", provider: "google", auth_method: "oauth2", is_active: true, launch_stage: "demo", demo_available: true, created_at: now },
    { user_id: userId, connector_key: "stripe", display_name: "Stripe Payments", category: "finance", provider: "stripe", auth_method: "api_key", is_active: true, launch_stage: "planned", demo_available: false, created_at: now },
    { user_id: userId, connector_key: "quickbooks", display_name: "QuickBooks", category: "finance", provider: "intuit", auth_method: "oauth2", is_active: false, launch_stage: "planned", demo_available: false, created_at: now },
  ];
}

// ── Advisor Registry ────────────────────────────────────────
function advisorRegistryRows(userId: string) {
  return [
    { user_id: userId, advisor_type: "money", display_name: "Money Advisor", domain: "finance", trust_threshold: 0.7, active: true, explanation_style: "concise", memory_scope: "session" },
    { user_id: userId, advisor_type: "business", display_name: "Business Advisor", domain: "business", trust_threshold: 0.65, active: true, explanation_style: "detailed", memory_scope: "persistent" },
    { user_id: userId, advisor_type: "concierge", display_name: "Concierge Advisor", domain: "concierge", trust_threshold: 0.6, active: true, explanation_style: "friendly", memory_scope: "session" },
    { user_id: userId, advisor_type: "family", display_name: "Family Advisor", domain: "concierge", trust_threshold: 0.6, active: false, explanation_style: "empathetic", memory_scope: "persistent" },
  ];
}

// ── Self-Healing Rules ──────────────────────────────────────
function selfHealingRuleRows(userId: string) {
  return [
    { user_id: userId, rule_name: "auto_restart_stale_connector", trigger_condition: "connector.health_state == 'stale' AND connector.last_sync_age > 3600", action_type: "restart_sync", risk_level: "low", enabled: true, max_frequency: "1/hour" },
    { user_id: userId, rule_name: "downgrade_failing_model", trigger_condition: "model.error_rate > 0.3 AND model.requests_24h > 10", action_type: "downgrade_model_tier", risk_level: "medium", enabled: true, max_frequency: "1/day" },
    { user_id: userId, rule_name: "alert_budget_critical", trigger_condition: "budget.daily_pct >= 90", action_type: "send_alert", risk_level: "low", enabled: true, max_frequency: "1/hour" },
  ];
}

// ── Launch Honesty ──────────────────────────────────────────
function launchHonestyRows(userId: string) {
  return [
    { user_id: userId, capability_key: "finance_os_core", launch_honesty_class: "real_internal", public_claim_allowed: false, qualifier_required: true, notes: "Core finance OS — internal use, demo data" },
    { user_id: userId, capability_key: "business_os_crm", launch_honesty_class: "demo_governed", public_claim_allowed: false, qualifier_required: true, notes: "CRM features demo-governed" },
    { user_id: userId, capability_key: "admin_ai_workforce", launch_honesty_class: "internal_only", public_claim_allowed: false, qualifier_required: false, notes: "Admin AI workforce — internal engineering tool" },
    { user_id: userId, capability_key: "concierge_scheduling", launch_honesty_class: "planned", public_claim_allowed: false, qualifier_required: true, notes: "Scheduling — planned but not yet real" },
  ];
}

// ── Audit Logs (sample) ─────────────────────────────────────
function auditLogRows(userId: string) {
  const now = new Date();
  return Array.from({ length: 8 }, (_, i) => {
    const d = new Date(now.getTime() - i * 3600_000);
    const actions = ["login", "seed_data", "view_dashboard", "invoke_ai_task", "approve_recommendation", "update_policy", "review_audit", "export_data"];
    return {
      user_id: userId,
      action: actions[i],
      category: i < 2 ? "auth" : i < 5 ? "ai_operations" : "governance",
      actor: "user",
      target_type: "system",
      target_id: `sys-${i}`,
      severity: i === 0 ? "info" : i < 4 ? "low" : "medium",
      details: { description: `${actions[i]} event`, timestamp: d.toISOString() },
      created_at: d.toISOString(),
    };
  });
}

// ── Capability Definitions ──────────────────────────────────
function capabilityDefinitionRows(userId: string) {
  return [
    { user_id: userId, capability_key: "view_financial_dashboard", display_name: "View Financial Dashboard", domain: "finance-os", risk_class: "informational", launch_stage: "internal", is_active: true },
    { user_id: userId, capability_key: "execute_payment", display_name: "Execute Payment", domain: "finance-os", risk_class: "high", launch_stage: "planned", is_active: false },
    { user_id: userId, capability_key: "manage_leads", display_name: "Manage Leads", domain: "business-os", risk_class: "low", launch_stage: "demo", is_active: true },
    { user_id: userId, capability_key: "schedule_appointment", display_name: "Schedule Appointment", domain: "concierge-os", risk_class: "medium", launch_stage: "demo", is_active: true },
    { user_id: userId, capability_key: "invoke_ai_workforce", display_name: "Invoke AI Workforce Task", domain: "platform", risk_class: "low", launch_stage: "internal", is_active: true },
  ];
}

// ── Incidents (sample) ──────────────────────────────────────
function incidentRows(userId: string) {
  const now = new Date();
  return [
    { user_id: userId, title: "Connector sync stale: bank_plaid", description: "Plaid connector has not synced in over 6 hours", severity: "medium", source: "self_healing", status: "open", created_at: new Date(now.getTime() - 7200_000).toISOString() },
    { user_id: userId, title: "AI budget alert: daily 85%", description: "Daily AI spend has reached 85% of budget", severity: "low", source: "budget_monitor", status: "resolved", created_at: new Date(now.getTime() - 86400_000).toISOString() },
  ];
}

// ── Surface Types + Readiness ───────────────────────────────
function surfaceTypeRows(userId: string) {
  return [
    { user_id: userId, surface_key: "web_desktop", display_name: "Web Desktop", platform: "web", form_factor: "desktop", is_active: true },
    { user_id: userId, surface_key: "web_mobile", display_name: "Web Mobile", platform: "web", form_factor: "mobile", is_active: true },
    { user_id: userId, surface_key: "ios_native", display_name: "iOS Native", platform: "ios", form_factor: "mobile", is_active: false },
    { user_id: userId, surface_key: "android_native", display_name: "Android Native", platform: "android", form_factor: "mobile", is_active: false },
    { user_id: userId, surface_key: "watchos", display_name: "watchOS", platform: "watchos", form_factor: "wearable", is_active: false },
  ];
}

// ── User AI Budgets ─────────────────────────────────────────
function userAiBudgetRows(userId: string) {
  return [
    { user_id: userId, period: "monthly", limit_tokens: 500000, limit_cost_cents: 8000, used_tokens: 12450, used_cost_cents: 185, hard_limit: false, auto_downgrade_model: true },
  ];
}

// ── Scheduled Jobs ──────────────────────────────────────────
function scheduledJobRows(userId: string) {
  return [
    { user_id: userId, job_key: "daily_truth_audit", display_name: "Daily Runtime Truth Audit", schedule: "0 6 * * *", enabled: true, job_type: "ai_workforce_task", config: { role: "runtime_truth_analyst", task: "runtime_truth_audit" } },
    { user_id: userId, job_key: "weekly_budget_review", display_name: "Weekly Budget Review", schedule: "0 9 * * 1", enabled: true, job_type: "ai_workforce_task", config: { role: "budget_efficiency_analyst", task: "cost_optimization_review" } },
    { user_id: userId, job_key: "connector_health_check", display_name: "Connector Health Check", schedule: "*/30 * * * *", enabled: true, job_type: "system", config: { action: "check_connector_health" } },
  ];
}

// ── Runtime Probes (10 probes) ──────────────────────────────
function runtimeProbeRows(userId: string) {
  const probes = [
    { probe_id: "supabase", name: "Supabase Connectivity", target_system: "supabase", owner: "platform", success_criteria: "profiles table accessible", failure_criteria: "query error" },
    { probe_id: "auth", name: "Auth Service", target_system: "supabase_auth", owner: "platform", success_criteria: "session retrievable", failure_criteria: "no session" },
    { probe_id: "storage", name: "Storage Service", target_system: "supabase_storage", owner: "platform", success_criteria: "bucket listable", failure_criteria: "storage error" },
    { probe_id: "edge_functions", name: "Edge Functions", target_system: "supabase_functions", owner: "platform", success_criteria: "functions API reachable", failure_criteria: "timeout or error" },
    { probe_id: "realtime", name: "Realtime", target_system: "supabase_realtime", owner: "platform", success_criteria: "channel subscribable", failure_criteria: "connection timeout" },
    { probe_id: "ai_gateway", name: "AI Gateway", target_system: "ai_provider_registry", owner: "ai", success_criteria: "active providers exist", failure_criteria: "no active providers" },
    { probe_id: "connectors", name: "Connector Health", target_system: "connector_registry", owner: "platform", success_criteria: "active connectors exist", failure_criteria: "no active connectors" },
    { probe_id: "workflows", name: "Workflow Engine", target_system: "workflow_definitions", owner: "platform", success_criteria: "table accessible", failure_criteria: "query error" },
    { probe_id: "notifications", name: "Notification Queue", target_system: "notifications_queue", owner: "platform", success_criteria: "table accessible", failure_criteria: "query error" },
    { probe_id: "telemetry", name: "Telemetry", target_system: "os_event_log", owner: "platform", success_criteria: "table accessible", failure_criteria: "query error" },
  ];
  return probes.map(p => ({ user_id: userId, ...p, enabled: true, severity: "high", launch_impact: "blocks", cadence_seconds: 300 }));
}

// ── Platform Health Snapshots (10 domains) ──────────────────
function platformHealthSnapshotRows(userId: string) {
  const domains = ["supabase", "auth", "storage", "edge_functions", "realtime", "ai_gateway", "connectors", "workflows", "notifications", "telemetry"];
  return domains.map(d => ({
    user_id: userId,
    domain: d,
    component: d.replace(/_/g, " "),
    health_status: "healthy",
    health_score: 100,
    details: { seeded: true },
    degraded_capabilities: [],
    check_duration_ms: 5,
  }));
}

// ── Device Families (7 canonical) ───────────────────────────
function deviceFamilyRows(userId: string) {
  return [
    { user_id: userId, family_key: "web_desktop", name: "Web Desktop", description: "Desktop web browser", interaction_type: "active", screen_class: "large", notification_type: "push", quick_action_support: true, launch_stage: "live", active: true },
    { user_id: userId, family_key: "web_mobile", name: "Web Mobile", description: "Mobile web browser", interaction_type: "active", screen_class: "small", notification_type: "push", quick_action_support: true, launch_stage: "live", active: true },
    { user_id: userId, family_key: "web_tablet", name: "Web Tablet", description: "Tablet web browser", interaction_type: "active", screen_class: "medium", notification_type: "push", quick_action_support: true, launch_stage: "live", active: true },
    { user_id: userId, family_key: "ios_native", name: "iOS Native", description: "Native iOS app", interaction_type: "active", screen_class: "small", notification_type: "push", quick_action_support: true, launch_stage: "planned", active: true },
    { user_id: userId, family_key: "android_native", name: "Android Native", description: "Native Android app", interaction_type: "active", screen_class: "small", notification_type: "push", quick_action_support: true, launch_stage: "planned", active: true },
    { user_id: userId, family_key: "desktop_electron", name: "Desktop Electron", description: "Electron desktop app", interaction_type: "active", screen_class: "large", notification_type: "push", quick_action_support: true, launch_stage: "planned", active: true },
    { user_id: userId, family_key: "watchos", name: "watchOS", description: "Apple Watch glance surface", interaction_type: "passive", screen_class: "glance", notification_type: "haptic", quick_action_support: false, launch_stage: "planned", active: true },
  ];
}

// ── Surface Portability Registry (30 capabilities) ──────────
function surfacePortabilityRows(userId: string) {
  const caps = [
    "boardroom_dashboard", "approval_workflow", "proof_chain", "alert_system", "advisor_ai",
    "money_management", "investment_portfolio", "business_ops", "workspace_management", "owner_settings",
    "calendar_scheduling", "workflow_engine", "receipt_ledger", "reality_governance", "connector_system",
    "demo_scenario_engine", "trust_weighted_actions", "incident_management", "admin_observability", "surface_portability",
    "household_ops", "document_management", "crm_relationships", "ai_budget_governance", "device_telemetry",
    "push_notifications", "authentication_identity", "session_handoff", "offline_queue", "global_search",
  ];
  return caps.map(key => ({
    user_id: userId,
    capability_key: key,
    capability_name: key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
    web_ready: true, mobile_ready: true, desktop_ready: true, tablet_ready: true, watch_ready: true,
    response_envelope_neutral: true, surface_adapter_exists: true, portability_score: 100,
    notes: "Seeded — canonical capability",
  }));
}

// ── OS Event Log (sample ambient data) ──────────────────────
function osEventLogRows(userId: string) {
  const now = new Date();
  return Array.from({ length: 15 }, (_, i) => {
    const d = new Date(now.getTime() - i * 600_000);
    const events = [
      { event_type: "service_start", source: "os_kernel", payload: { service: "finance-os" } },
      { event_type: "connector_sync", source: "connector_runtime", payload: { connector: "bank_plaid", status: "success" } },
      { event_type: "ai_invocation", source: "ai_workforce", payload: { role: "runtime_truth_analyst", task: "runtime_truth_audit" } },
      { event_type: "policy_check", source: "policy_engine", payload: { policy: "ai_budget", result: "allowed" } },
      { event_type: "user_action", source: "ui", payload: { action: "view_dashboard", surface: "web_desktop" } },
    ];
    const ev = events[i % events.length];
    return { user_id: userId, event_type: ev.event_type, source: ev.source, payload: ev.payload, created_at: d.toISOString() };
  });
}

// ── Master Seed Function ────────────────────────────────────
export async function seedEcosystemData(): Promise<{ seeded: number; errors: string[] }> {
  const userId = await getUserId();
  if (!userId) return { seeded: 0, errors: ["Not authenticated"] };

  const errors: string[] = [];
  let total = 0;

  const tasks: Array<{ table: string; rows: Record<string, unknown>[]; conflict?: string }> = [
    { table: "ai_provider_registry", rows: aiProviderRows(userId), conflict: "user_id,provider_key" },
    { table: "ai_model_registry", rows: aiModelRows(userId), conflict: "user_id,model_id" },
    { table: "ai_budget_policies", rows: aiBudgetPolicyRows(userId), conflict: "user_id,policy_key" },
    { table: "ai_capability_routing", rows: aiCapabilityRoutingRows(userId), conflict: "user_id,capability_key" },
    { table: "connector_registry", rows: connectorRegistryRows(userId), conflict: "user_id,connector_key" },
    { table: "advisor_registry", rows: advisorRegistryRows(userId) },
    { table: "ai_self_healing_rules", rows: selfHealingRuleRows(userId) },
    { table: "ai_launch_honesty", rows: launchHonestyRows(userId) },
    { table: "audit_logs", rows: auditLogRows(userId) },
    { table: "capability_definitions", rows: capabilityDefinitionRows(userId) },
    { table: "incidents", rows: incidentRows(userId) },
    { table: "surface_types", rows: surfaceTypeRows(userId) },
    { table: "user_ai_budgets", rows: userAiBudgetRows(userId) },
    { table: "scheduled_jobs", rows: scheduledJobRows(userId) },
    { table: "os_event_log", rows: osEventLogRows(userId) },
    { table: "runtime_probes", rows: runtimeProbeRows(userId), conflict: "user_id,probe_id" },
    { table: "platform_health_snapshots", rows: platformHealthSnapshotRows(userId) },
    { table: "device_families", rows: deviceFamilyRows(userId), conflict: "user_id,family_key" },
    { table: "surface_portability_registry", rows: surfacePortabilityRows(userId), conflict: "user_id,capability_key" },
  ];

  for (const task of tasks) {
    try {
      const count = await upsertRows(task.table, task.rows, task.conflict);
      total += count;
      if (count === 0) errors.push(`${task.table}: 0 rows inserted`);
    } catch (e: any) {
      errors.push(`${task.table}: ${e.message}`);
    }
  }

  console.log(`[ecosystem-seeder] Seeded ${total} rows across ${tasks.length} tables. Errors: ${errors.length}`);
  return { seeded: total, errors };
}
