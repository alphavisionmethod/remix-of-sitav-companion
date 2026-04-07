// ═══════════════════════════════════════════════════════════════
// SITA OS — Demo Governance Seeder
// Seeds demo governance tables for the authenticated user on first visit.
// Idempotent — checks if data already exists before seeding.
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import { fromDynamicTable } from "@/lib/supabase-helpers";

const SEED_KEY = "sita-demo-governance-seeded";

async function needsSeeding(userId: string): Promise<boolean> {
  if (sessionStorage.getItem(SEED_KEY) === "true") return false;
  const { count } = await fromDynamicTable("demo_scenarios")
    .select("id", { count: "exact", head: true })
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);
  return (count ?? 0) === 0;
}

export async function seedDemoGovernance(): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  if (!(await needsSeeding(user.id))) {
    sessionStorage.setItem(SEED_KEY, "true");
    return;
  }

  const uid = user.id;
  const now = new Date().toISOString();

  // ── 1. Domain Runtime Status (core truth data) ──
  const domains = [
    { user_id: uid, domain_key: "auth", domain_name: "Authentication & Identity", runtime_class: "real", has_real_data: true, has_real_service: true, has_db_tables: true, has_rls_policies: true, has_edge_functions: true, demo_provider_exists: true, empty_state_handled: true, truth_score: 95, last_verified_at: now, notes: "Supabase Auth fully integrated" },
    { user_id: uid, domain_key: "finance", domain_name: "Finance & Money", runtime_class: "demo", has_real_data: false, has_real_service: false, has_db_tables: true, has_rls_policies: true, has_edge_functions: false, demo_provider_exists: true, empty_state_handled: true, truth_score: 40, last_verified_at: now, notes: "Demo providers with governed scenarios" },
    { user_id: uid, domain_key: "crm", domain_name: "CRM & Relationships", runtime_class: "demo", has_real_data: false, has_real_service: false, has_db_tables: true, has_rls_policies: true, has_edge_functions: false, demo_provider_exists: true, empty_state_handled: true, truth_score: 35, last_verified_at: now },
    { user_id: uid, domain_key: "household", domain_name: "Household Operations", runtime_class: "demo", has_real_data: false, has_real_service: false, has_db_tables: true, has_rls_policies: true, has_edge_functions: false, demo_provider_exists: true, empty_state_handled: true, truth_score: 35, last_verified_at: now },
    { user_id: uid, domain_key: "documents", domain_name: "Document Management", runtime_class: "partial", has_real_data: true, has_real_service: true, has_db_tables: true, has_rls_policies: true, has_edge_functions: false, demo_provider_exists: true, empty_state_handled: true, truth_score: 60, last_verified_at: now, notes: "Storage bucket configured, upload works" },
    { user_id: uid, domain_key: "calendar", domain_name: "Calendar & Scheduling", runtime_class: "demo", has_real_data: false, has_real_service: false, has_db_tables: true, has_rls_policies: true, has_edge_functions: false, demo_provider_exists: true, empty_state_handled: true, truth_score: 30, last_verified_at: now },
    { user_id: uid, domain_key: "ai_gateway", domain_name: "AI Gateway & Intelligence", runtime_class: "partial", has_real_data: true, has_real_service: true, has_db_tables: true, has_rls_policies: true, has_edge_functions: true, demo_provider_exists: true, empty_state_handled: true, truth_score: 70, last_verified_at: now, notes: "Edge functions deployed, budget policies active" },
    { user_id: uid, domain_key: "connectors", domain_name: "External Connectors", runtime_class: "partial", has_real_data: false, has_real_service: true, has_db_tables: true, has_rls_policies: true, has_edge_functions: true, demo_provider_exists: true, empty_state_handled: true, truth_score: 55, last_verified_at: now, notes: "Connector proxy edge function deployed" },
    { user_id: uid, domain_key: "notifications", domain_name: "Notifications & Alerts", runtime_class: "partial", has_real_data: true, has_real_service: true, has_db_tables: true, has_rls_policies: true, has_edge_functions: false, demo_provider_exists: true, empty_state_handled: true, truth_score: 55, last_verified_at: now },
    { user_id: uid, domain_key: "workflows", domain_name: "Workflow Engine", runtime_class: "demo", has_real_data: false, has_real_service: false, has_db_tables: true, has_rls_policies: true, has_edge_functions: false, demo_provider_exists: true, empty_state_handled: true, truth_score: 35, last_verified_at: now },
    { user_id: uid, domain_key: "advisors", domain_name: "AI Advisors", runtime_class: "partial", has_real_data: true, has_real_service: true, has_db_tables: true, has_rls_policies: true, has_edge_functions: true, demo_provider_exists: true, empty_state_handled: true, truth_score: 65, last_verified_at: now },
    { user_id: uid, domain_key: "boardroom", domain_name: "Boardroom & Strategy", runtime_class: "demo", has_real_data: false, has_real_service: false, has_db_tables: true, has_rls_policies: true, has_edge_functions: false, demo_provider_exists: true, empty_state_handled: true, truth_score: 30, last_verified_at: now },
    { user_id: uid, domain_key: "approvals", domain_name: "Approvals & Trust", runtime_class: "partial", has_real_data: true, has_real_service: true, has_db_tables: true, has_rls_policies: true, has_edge_functions: false, demo_provider_exists: true, empty_state_handled: true, truth_score: 60, last_verified_at: now },
    { user_id: uid, domain_key: "analytics", domain_name: "Analytics & Insights", runtime_class: "demo", has_real_data: false, has_real_service: false, has_db_tables: true, has_rls_policies: true, has_edge_functions: false, demo_provider_exists: true, empty_state_handled: true, truth_score: 35, last_verified_at: now },
    { user_id: uid, domain_key: "storage", domain_name: "File Storage", runtime_class: "real", has_real_data: true, has_real_service: true, has_db_tables: true, has_rls_policies: true, has_edge_functions: false, demo_provider_exists: true, empty_state_handled: true, truth_score: 85, last_verified_at: now, notes: "Supabase storage with RLS" },
  ];

  await fromTable("domain_runtime_status").insert(domains);

  // ── 2. Launch Gates (feature governance) ──
  const gates = [
    { user_id: uid, name: "Auth Login", feature_key: "auth.login", feature_name: "User Login", domain: "auth", state: "passed", honesty_class: "real", has_real_backend: true, has_real_data: true, has_real_auth: true, has_tests: true, has_error_handling: true, demo_available: true, gate_score: 95, criteria_met: 6, criteria_total: 6, blockers_count: 0, truth_threshold: 80, current_truth_score: 95, environment: "production", blockers: [], status: "active" },
    { user_id: uid, name: "AI Task Invoke", feature_key: "ai.task_invoke", feature_name: "AI Task Invocation", domain: "ai_gateway", state: "partial", honesty_class: "partial", has_real_backend: true, has_real_data: true, has_real_auth: true, has_tests: false, has_error_handling: true, demo_available: true, gate_score: 70, criteria_met: 4, criteria_total: 6, blockers_count: 1, truth_threshold: 80, current_truth_score: 70, environment: "production", blockers: ["Missing test coverage"], status: "active" },
    { user_id: uid, name: "Burn Rate Chart", feature_key: "finance.burn_rate", feature_name: "Burn Rate Analysis", domain: "finance", state: "demo_only", honesty_class: "planned", has_real_backend: false, has_real_data: false, has_real_auth: true, has_tests: false, has_error_handling: true, demo_available: true, gate_score: 35, criteria_met: 2, criteria_total: 6, blockers_count: 2, truth_threshold: 80, current_truth_score: 35, environment: "production", blockers: ["No real data source", "No financial API connected"], status: "active" },
    { user_id: uid, name: "Connector Proxy", feature_key: "connectors.proxy", feature_name: "Connector Proxy", domain: "connectors", state: "partial", honesty_class: "partial", has_real_backend: true, has_real_data: false, has_real_auth: true, has_tests: false, has_error_handling: true, demo_available: true, gate_score: 55, criteria_met: 3, criteria_total: 6, blockers_count: 1, truth_threshold: 80, current_truth_score: 55, environment: "production", blockers: ["No live connector credentials"], status: "active" },
    { user_id: uid, name: "Notification Queue", feature_key: "notifications.queue", feature_name: "Notification Queue", domain: "notifications", state: "partial", honesty_class: "partial", has_real_backend: true, has_real_data: true, has_real_auth: true, has_tests: false, has_error_handling: true, demo_available: true, gate_score: 60, criteria_met: 4, criteria_total: 6, blockers_count: 1, truth_threshold: 80, current_truth_score: 60, environment: "production", blockers: ["Missing test coverage"], status: "active" },
    { user_id: uid, name: "Document Upload", feature_key: "documents.upload", feature_name: "Document Upload", domain: "documents", state: "passed", honesty_class: "real", has_real_backend: true, has_real_data: true, has_real_auth: true, has_tests: false, has_error_handling: true, demo_available: true, gate_score: 80, criteria_met: 5, criteria_total: 6, blockers_count: 0, truth_threshold: 80, current_truth_score: 80, environment: "production", blockers: [], status: "active" },
    { user_id: uid, name: "Approval Queue", feature_key: "approvals.queue", feature_name: "Human Approval Queue", domain: "approvals", state: "partial", honesty_class: "partial", has_real_backend: true, has_real_data: true, has_real_auth: true, has_tests: false, has_error_handling: true, demo_available: true, gate_score: 65, criteria_met: 4, criteria_total: 6, blockers_count: 1, truth_threshold: 80, current_truth_score: 65, environment: "production", blockers: ["Missing test coverage"], status: "active" },
    { user_id: uid, name: "AI Budget Policy", feature_key: "ai.budget_policy", feature_name: "AI Budget Policy Engine", domain: "ai_gateway", state: "passed", honesty_class: "real", has_real_backend: true, has_real_data: true, has_real_auth: true, has_tests: false, has_error_handling: true, demo_available: true, gate_score: 85, criteria_met: 5, criteria_total: 6, blockers_count: 0, truth_threshold: 80, current_truth_score: 85, environment: "production", blockers: [], status: "active" },
    { user_id: uid, name: "CRM Contacts", feature_key: "crm.contacts", feature_name: "Contact Management", domain: "crm", state: "demo_only", honesty_class: "planned", has_real_backend: false, has_real_data: false, has_real_auth: true, has_tests: false, has_error_handling: true, demo_available: true, gate_score: 30, criteria_met: 2, criteria_total: 6, blockers_count: 2, truth_threshold: 80, current_truth_score: 30, environment: "production", blockers: ["No real data", "No CRM integration"], status: "active" },
    { user_id: uid, name: "Workflow Engine", feature_key: "workflows.engine", feature_name: "Workflow Execution", domain: "workflows", state: "demo_only", honesty_class: "planned", has_real_backend: false, has_real_data: false, has_real_auth: true, has_tests: false, has_error_handling: true, demo_available: true, gate_score: 30, criteria_met: 2, criteria_total: 6, blockers_count: 2, truth_threshold: 80, current_truth_score: 30, environment: "production", blockers: ["No workflow executor", "No trigger system"], status: "active" },
  ];

  await fromTable("launch_gates").insert(gates);

  // ── 3. Demo Scenarios ──
  const scenarios = [
    { user_id: uid, scenario_key: "investor_demo", name: "Investor Demo", description: "Pre-configured walkthrough for investor presentations", category: "sales", target_audience: "investors", status: "active", version: 1, narrative_summary: "Full business overview with curated financial data", domain_coverage: ["finance", "ops", "ai", "connectors"], active: true },
    { user_id: uid, scenario_key: "team_onboarding", name: "Team Onboarding", description: "Safe sandbox for new team members to explore features", category: "training", target_audience: "employees", status: "active", version: 1, narrative_summary: "Guided tour of all SITA OS capabilities", domain_coverage: ["all"], active: true },
    { user_id: uid, scenario_key: "sales_demo", name: "Sales Demo", description: "Customer-facing product demonstration", category: "sales", target_audience: "prospects", status: "active", version: 1, narrative_summary: "Key features showcase with sample company data", domain_coverage: ["finance", "ops", "connectors", "ai"], active: true },
    { user_id: uid, scenario_key: "qa_testing", name: "QA Testing", description: "Quality assurance scenario with edge cases", category: "testing", target_audience: "engineering", status: "active", version: 1, narrative_summary: "Edge case testing with boundary conditions", domain_coverage: ["all"], active: true },
    { user_id: uid, scenario_key: "compliance_review", name: "Compliance Review", description: "Compliance officer demo of governance controls", category: "compliance", target_audience: "compliance_officers", status: "active", version: 1, narrative_summary: "Full governance, audit trail, and policy demonstration", domain_coverage: ["governance", "security", "ai"], active: true },
  ];

  await fromTable("demo_scenarios").insert(scenarios);

  // ── 4. Demo Policy Profiles ──
  const policies = [
    { user_id: uid, name: "Default Safe", external_writes_allowed: false, connector_writes_allowed: false, notifications_live: false, approval_executes_live: false, billing_live: false, ai_execution_mode: "cached_only", receipt_mode: "demo_receipt", analytics_mode: "separate" },
    { user_id: uid, name: "Limited Live AI", external_writes_allowed: false, connector_writes_allowed: false, notifications_live: false, approval_executes_live: false, billing_live: false, ai_execution_mode: "limited_live", receipt_mode: "demo_receipt", analytics_mode: "separate" },
    { user_id: uid, name: "Full Sandbox", external_writes_allowed: false, connector_writes_allowed: false, notifications_live: false, approval_executes_live: false, billing_live: false, ai_execution_mode: "scenario_grounded", receipt_mode: "simulated_receipt", analytics_mode: "discard" },
  ];

  await fromTable("demo_policy_profiles").insert(policies);

  // ── 5. Kill Switch Defaults ──
  const killSwitches = [
    { user_id: uid, key: "demo_mode_global", enabled: false, reason: "Default: demo mode active" },
    { user_id: uid, key: "demo_ai_live_calls", enabled: false, reason: "Default: AI calls allowed in demo" },
    { user_id: uid, key: "demo_simulated_writes", enabled: false, reason: "Default: simulated writes allowed" },
  ];

  await fromTable("demo_kill_switches").upsert(killSwitches, { onConflict: "user_id,key" });

  // ── 6. Demo Receipts (sample governance trail) ──
  const { data: savedScenarios } = await fromTable("demo_scenarios").select("id, scenario_key").eq("user_id", uid);
  const scenarioMap = new Map((savedScenarios ?? []).map((s: any) => [s.scenario_key, s.id]));
  const investorId = scenarioMap.get("investor_demo");
  const salesId = scenarioMap.get("sales_demo");

  const receipts = [
    { user_id: uid, scenario_id: investorId, feature_id: "finance.burn_rate", receipt_type: "demo_receipt", actor_id: "policy_engine", summary: "Burn rate chart displayed with demo data — no real financial data accessed", simulated: true, visible_to_roles: ["admin", "owner"] },
    { user_id: uid, scenario_id: investorId, feature_id: "connector_write", receipt_type: "demo_receipt", actor_id: "policy_engine", summary: "Connector write blocked — demo mode safety policy", simulated: true, visible_to_roles: ["admin", "owner"] },
    { user_id: uid, scenario_id: salesId, feature_id: "ai_inference", receipt_type: "demo_receipt", actor_id: "policy_engine", summary: "AI inference allowed in cached_only mode — no live API calls", simulated: true, visible_to_roles: ["admin", "owner"] },
    { user_id: uid, feature_id: "notification", receipt_type: "demo_receipt", actor_id: "policy_engine", summary: "Live notifications blocked in demo mode", simulated: true, visible_to_roles: ["admin", "owner"] },
    { user_id: uid, feature_id: "billing", receipt_type: "demo_receipt", actor_id: "policy_engine", summary: "Billing operations blocked in demo mode", simulated: true, visible_to_roles: ["admin", "owner"] },
  ];

  await fromTable("demo_receipts").insert(receipts);

  // ── 7. Demo Actions ──
  const actions = [
    { user_id: uid, scenario_id: investorId, feature_id: "finance.burn_rate", action_type: "view_chart", actor_id: "demo_user", route: "/finance/burn-rate", execution_mode: "simulated", outcome_summary: "Displayed curated burn rate chart" },
    { user_id: uid, scenario_id: investorId, feature_id: "ai.workforce", action_type: "invoke_task", actor_id: "demo_user", route: "/admin/ai-workforce", execution_mode: "simulated", outcome_summary: "Simulated AI task invocation" },
    { user_id: uid, scenario_id: salesId, feature_id: "connectors.slack", action_type: "test_connector", actor_id: "demo_user", route: "/integrations/connections", execution_mode: "simulated", outcome_summary: "Simulated Slack message send" },
    { user_id: uid, scenario_id: investorId, feature_id: "ops.dashboard", action_type: "view_page", actor_id: "demo_user", route: "/dashboard", execution_mode: "simulated", outcome_summary: "Displayed demo dashboard with scenario data" },
    { user_id: uid, scenario_id: salesId, feature_id: "finance.allocations", action_type: "view_page", actor_id: "demo_user", route: "/finance/capital", execution_mode: "simulated", outcome_summary: "Capital allocation demo view" },
  ];

  await fromTable("demo_actions").insert(actions);

  sessionStorage.setItem(SEED_KEY, "true");
}
