// ═══════════════════════════════════════════════════════════════
// SITA OS — Demo Governance Seeder
// Seeds demo governance tables for the authenticated user on first visit.
// Idempotent — checks if data already exists before seeding.
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";

const SEED_KEY = "sita-demo-governance-seeded";

/** Returns true if governance data needs seeding */
async function needsSeeding(userId: string): Promise<boolean> {
  if (sessionStorage.getItem(SEED_KEY) === "true") return false;
  const { count } = await (supabase as any)
    .from("demo_scenarios")
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

  // ── Seed Demo Scenarios ──
  const scenarios = [
    { user_id: uid, scenario_key: "investor_demo", name: "Investor Demo", description: "Pre-configured walkthrough for investor presentations", category: "sales", target_audience: "investors", status: "active", version: 1, narrative_summary: "Full business overview with curated financial data", domain_coverage: ["finance", "ops", "ai", "connectors"], active: true },
    { user_id: uid, scenario_key: "team_onboarding", name: "Team Onboarding", description: "Safe sandbox for new team members to explore features", category: "training", target_audience: "employees", status: "active", version: 1, narrative_summary: "Guided tour of all SITA OS capabilities", domain_coverage: ["all"], active: true },
    { user_id: uid, scenario_key: "sales_demo", name: "Sales Demo", description: "Customer-facing product demonstration", category: "sales", target_audience: "prospects", status: "active", version: 1, narrative_summary: "Key features showcase with sample company data", domain_coverage: ["finance", "ops", "connectors", "ai"], active: true },
    { user_id: uid, scenario_key: "qa_testing", name: "QA Testing", description: "Quality assurance scenario with edge cases", category: "testing", target_audience: "engineering", status: "active", version: 1, narrative_summary: "Edge case testing with boundary conditions", domain_coverage: ["all"], active: true },
    { user_id: uid, scenario_key: "compliance_review", name: "Compliance Review", description: "Compliance officer demo of governance controls", category: "compliance", target_audience: "compliance_officers", status: "active", version: 1, narrative_summary: "Full governance, audit trail, and policy demonstration", domain_coverage: ["governance", "security", "ai"], active: true },
  ];

  await (supabase as any).from("demo_scenarios").insert(scenarios);

  // Get scenario IDs for linking
  const { data: savedScenarios } = await (supabase as any)
    .from("demo_scenarios")
    .select("id, scenario_key")
    .eq("user_id", uid);

  const scenarioMap = new Map((savedScenarios ?? []).map((s: any) => [s.scenario_key, s.id]));

  // ── Seed Demo Policy Profiles ──
  const policies = [
    { user_id: uid, name: "Default Safe", external_writes_allowed: false, connector_writes_allowed: false, notifications_live: false, approval_executes_live: false, billing_live: false, ai_execution_mode: "cached_only", receipt_mode: "demo_receipt", analytics_mode: "separate" },
    { user_id: uid, name: "Limited Live AI", external_writes_allowed: false, connector_writes_allowed: false, notifications_live: false, approval_executes_live: false, billing_live: false, ai_execution_mode: "limited_live", receipt_mode: "demo_receipt", analytics_mode: "separate" },
    { user_id: uid, name: "Full Sandbox", external_writes_allowed: false, connector_writes_allowed: false, notifications_live: false, approval_executes_live: false, billing_live: false, ai_execution_mode: "scenario_grounded", receipt_mode: "simulated_receipt", analytics_mode: "discard" },
  ];

  await (supabase as any).from("demo_policy_profiles").insert(policies);

  // ── Seed Demo Kill Switches (defaults) ──
  const killSwitches = [
    { user_id: uid, key: "demo_mode_global", enabled: false, reason: "Default: demo mode active" },
    { user_id: uid, key: "demo_ai_live_calls", enabled: false, reason: "Default: AI calls allowed in demo" },
    { user_id: uid, key: "demo_simulated_writes", enabled: false, reason: "Default: simulated writes allowed" },
  ];

  await (supabase as any).from("demo_kill_switches").upsert(killSwitches, { onConflict: "user_id,key" });

  // ── Seed Demo Actions (sample governance trail) ──
  const investorId = scenarioMap.get("investor_demo");
  const salesId = scenarioMap.get("sales_demo");

  const actions = [
    { user_id: uid, scenario_id: investorId, feature_id: "finance.burn_rate", action_type: "view_chart", actor_id: "demo_user", route: "/finance/burn-rate", execution_mode: "simulated", outcome_summary: "Displayed curated burn rate chart" },
    { user_id: uid, scenario_id: investorId, feature_id: "ai.workforce", action_type: "invoke_task", actor_id: "demo_user", route: "/admin/ai-workforce", execution_mode: "simulated", outcome_summary: "Simulated AI task invocation" },
    { user_id: uid, scenario_id: salesId, feature_id: "connectors.slack", action_type: "test_connector", actor_id: "demo_user", route: "/integrations/connections", execution_mode: "simulated", outcome_summary: "Simulated Slack message send" },
    { user_id: uid, scenario_id: investorId, feature_id: "ops.dashboard", action_type: "view_page", actor_id: "demo_user", route: "/dashboard", execution_mode: "simulated", outcome_summary: "Displayed demo dashboard with scenario data" },
    { user_id: uid, scenario_id: salesId, feature_id: "finance.allocations", action_type: "view_page", actor_id: "demo_user", route: "/finance/capital", execution_mode: "simulated", outcome_summary: "Capital allocation demo view" },
  ];

  await (supabase as any).from("demo_actions").insert(actions);

  // ── Seed Demo Receipts (initial governance receipts) ──
  const receipts = [
    { user_id: uid, scenario_id: investorId, feature_id: "finance.burn_rate", receipt_type: "demo_receipt", actor_id: "policy_engine", summary: "Burn rate chart displayed with demo data — no real financial data accessed", simulated: true, visible_to_roles: ["admin", "owner"] },
    { user_id: uid, scenario_id: investorId, feature_id: "connector_write", receipt_type: "demo_receipt", actor_id: "policy_engine", summary: "Connector write blocked — demo mode safety policy", simulated: true, visible_to_roles: ["admin", "owner"] },
    { user_id: uid, scenario_id: salesId, feature_id: "ai_inference", receipt_type: "demo_receipt", actor_id: "policy_engine", summary: "AI inference allowed in cached_only mode — no live API calls", simulated: true, visible_to_roles: ["admin", "owner"] },
    { user_id: uid, feature_id: "notification", receipt_type: "demo_receipt", actor_id: "policy_engine", summary: "Live notifications blocked in demo mode", simulated: true, visible_to_roles: ["admin", "owner"] },
    { user_id: uid, feature_id: "billing", receipt_type: "demo_receipt", actor_id: "policy_engine", summary: "Billing operations blocked in demo mode", simulated: true, visible_to_roles: ["admin", "owner"] },
  ];

  await (supabase as any).from("demo_receipts").insert(receipts);

  sessionStorage.setItem(SEED_KEY, "true");
}
