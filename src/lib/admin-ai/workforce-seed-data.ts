import { supabase } from "@/integrations/supabase/client";

// ═══════════════════════════════════════════════════════════════
// SITA OS — Admin AI Workforce Canonical Seed Data
// Seeds 10 roles, 12 tasks, 5 budget classes, and permissions
// ═══════════════════════════════════════════════════════════════

const SEED_ROLES = [
  { role_key: "chief_architect", display_name: "Chief Architect", purpose: "High-value architecture reasoning, cross-domain synthesis, and remediation planning", prompt_family: "architecture", domain_family: "architecture", default_model_tier: "premium", budget_class: "premium_architecture", fallback_budget_class: "balanced_admin", default_routing_class: "premium_synthesis", max_autonomy: "recommend_only", approval_required: true, approval_requirement_class: "required_for_sensitive", launch_stage: "internal", launch_honesty_class: "internal_only", is_active: true, supports_demo_mode: false, cost_per_invocation_cents: 25 },
  { role_key: "runtime_truth_analyst", display_name: "Runtime Truth Analyst", purpose: "Audit runtime truth indices, detect contradictions, and classify degraded states", prompt_family: "runtime_truth", domain_family: "runtime_truth", default_model_tier: "balanced", budget_class: "balanced_admin", fallback_budget_class: "economy_admin", default_routing_class: "balanced_assistant", max_autonomy: "recommend_only", approval_required: false, approval_requirement_class: "recommended", launch_stage: "internal", launch_honesty_class: "internal_only", is_active: true, supports_demo_mode: false, cost_per_invocation_cents: 8 },
  { role_key: "connector_ops_engineer", display_name: "Connector Operations Engineer", purpose: "Diagnose connector failures, classify degraded connectors, and recommend fixes", prompt_family: "connectors", domain_family: "connectors", default_model_tier: "balanced", budget_class: "balanced_admin", fallback_budget_class: "economy_admin", default_routing_class: "balanced_assistant", max_autonomy: "recommend_only", approval_required: false, approval_requirement_class: "recommended", launch_stage: "internal", launch_honesty_class: "internal_only", is_active: true, supports_demo_mode: false, cost_per_invocation_cents: 8 },
  { role_key: "ai_governance_engineer", display_name: "AI Governance Engineer", purpose: "Review AI budget policies, routing efficiency, and cost optimization opportunities", prompt_family: "ai_governance", domain_family: "ai_governance", default_model_tier: "balanced", budget_class: "balanced_admin", fallback_budget_class: "economy_admin", default_routing_class: "balanced_assistant", max_autonomy: "recommend_only", approval_required: false, approval_requirement_class: "recommended", launch_stage: "internal", launch_honesty_class: "internal_only", is_active: true, supports_demo_mode: false, cost_per_invocation_cents: 8 },
  { role_key: "quality_launch_engineer", display_name: "Quality & Launch Readiness Engineer", purpose: "Assess launch readiness, contradiction mapping, and quality gates", prompt_family: "quality", domain_family: "quality", default_model_tier: "balanced", budget_class: "balanced_admin", fallback_budget_class: "economy_admin", default_routing_class: "balanced_assistant", max_autonomy: "recommend_only", approval_required: false, approval_requirement_class: "recommended", launch_stage: "internal", launch_honesty_class: "internal_only", is_active: true, supports_demo_mode: false, cost_per_invocation_cents: 8 },
  { role_key: "data_schema_ops_engineer", display_name: "Data / Schema Operations Engineer", purpose: "Analyze schema gaps, data model inconsistencies, and remediation needs", prompt_family: "data", domain_family: "data", default_model_tier: "balanced", budget_class: "balanced_admin", fallback_budget_class: "economy_admin", default_routing_class: "balanced_assistant", max_autonomy: "recommend_only", approval_required: false, approval_requirement_class: "recommended", launch_stage: "internal", launch_honesty_class: "internal_only", is_active: true, supports_demo_mode: false, cost_per_invocation_cents: 8 },
  { role_key: "device_surface_readiness_engineer", display_name: "Device / Surface Readiness Engineer", purpose: "Review portability, adaptive interface coverage, and surface consistency", prompt_family: "devices", domain_family: "devices", default_model_tier: "balanced", budget_class: "balanced_admin", fallback_budget_class: "economy_admin", default_routing_class: "balanced_assistant", max_autonomy: "recommend_only", approval_required: false, approval_requirement_class: "recommended", launch_stage: "internal", launch_honesty_class: "internal_only", is_active: true, supports_demo_mode: false, cost_per_invocation_cents: 8 },
  { role_key: "budget_efficiency_analyst", display_name: "Budget & Efficiency Analyst", purpose: "Track AI spend efficiency, identify waste, and recommend cost optimizations", prompt_family: "budget", domain_family: "budget", default_model_tier: "economy", budget_class: "economy_admin", fallback_budget_class: "economy_admin", default_routing_class: "economy_fast", max_autonomy: "recommend_only", approval_required: false, approval_requirement_class: "none", launch_stage: "internal", launch_honesty_class: "internal_only", is_active: true, supports_demo_mode: false, cost_per_invocation_cents: 3 },
  { role_key: "incident_drift_analyst", display_name: "Incident / Drift Analyst", purpose: "Triage incidents, detect configuration drift, and classify impact", prompt_family: "incidents", domain_family: "incidents", default_model_tier: "economy", budget_class: "economy_admin", fallback_budget_class: "balanced_admin", default_routing_class: "economy_fast", max_autonomy: "recommend_only", approval_required: false, approval_requirement_class: "recommended", launch_stage: "internal", launch_honesty_class: "internal_only", is_active: true, supports_demo_mode: false, cost_per_invocation_cents: 3 },
  { role_key: "remediation_planner", display_name: "Remediation Planner", purpose: "Generate phased remediation plans with effort estimates and risk classification", prompt_family: "remediation", domain_family: "remediation", default_model_tier: "balanced", budget_class: "balanced_admin", fallback_budget_class: "premium_architecture", default_routing_class: "balanced_assistant", max_autonomy: "recommend_only", approval_required: true, approval_requirement_class: "required_for_sensitive", launch_stage: "internal", launch_honesty_class: "internal_only", is_active: true, supports_demo_mode: false, cost_per_invocation_cents: 12 },
];

const SEED_TASKS = [
  { task_key: "architecture_review", display_name: "Architecture Review", description: "Cross-domain architecture analysis with dependency and contract assessment", task_family: "audit", routing_class: "premium_synthesis", budget_class: "premium_architecture", max_cost_cents: 30 },
  { task_key: "runtime_truth_audit", display_name: "Runtime Truth Audit", description: "Verify runtime truth indices, detect contradictions, classify degraded states", task_family: "audit", routing_class: "balanced_assistant", budget_class: "balanced_admin", max_cost_cents: 10 },
  { task_key: "connector_failure_diagnosis", display_name: "Connector Failure Diagnosis", description: "Root-cause analysis of connector failures with remediation recommendations", task_family: "diagnose", routing_class: "balanced_assistant", budget_class: "balanced_admin", max_cost_cents: 10 },
  { task_key: "ai_budget_analysis", display_name: "AI Budget Analysis", description: "Analyze AI spend patterns, identify waste, and suggest optimizations", task_family: "summarize", routing_class: "economy_fast", budget_class: "economy_admin", max_cost_cents: 5 },
  { task_key: "launch_readiness_summary", display_name: "Launch Readiness Summary", description: "Assess launch readiness across all domains with go/no-go classification", task_family: "summarize", routing_class: "balanced_assistant", budget_class: "balanced_admin", max_cost_cents: 10 },
  { task_key: "schema_gap_analysis", display_name: "Schema Gap Analysis", description: "Identify schema inconsistencies, missing tables, and data model gaps", task_family: "audit", routing_class: "balanced_assistant", budget_class: "balanced_admin", max_cost_cents: 10 },
  { task_key: "surface_portability_review", display_name: "Surface Portability Review", description: "Review adaptive interface coverage and cross-device surface consistency", task_family: "audit", routing_class: "balanced_assistant", budget_class: "balanced_admin", max_cost_cents: 10 },
  { task_key: "incident_triage", display_name: "Incident Triage", description: "Classify incident severity, impact, and recommended response actions", task_family: "diagnose", routing_class: "economy_fast", budget_class: "economy_admin", max_cost_cents: 5 },
  { task_key: "remediation_plan_generation", display_name: "Remediation Plan Generation", description: "Generate phased remediation plans with effort, risk, and dependency mapping", task_family: "plan", routing_class: "balanced_assistant", budget_class: "balanced_admin", max_cost_cents: 15 },
  { task_key: "contradiction_mapping", display_name: "Contradiction Mapping", description: "Map contradictions across runtime truth, launch honesty, and system state", task_family: "investigate", routing_class: "balanced_assistant", budget_class: "balanced_admin", max_cost_cents: 10 },
  { task_key: "degraded_state_analysis", display_name: "Degraded State Analysis", description: "Classify and analyze degraded system states with recovery recommendations", task_family: "diagnose", routing_class: "economy_fast", budget_class: "economy_admin", max_cost_cents: 5 },
  { task_key: "cost_optimization_review", display_name: "Cost Optimization Review", description: "Identify cost optimization opportunities across AI model usage and routing", task_family: "recommend", routing_class: "economy_fast", budget_class: "economy_admin", max_cost_cents: 5 },
];

const SEED_BUDGET_CLASSES = [
  { budget_class_key: "economy_admin", display_name: "Economy Admin", description: "Cheap, repetitive, utility admin work — flash models only", priority_order: 1, premium_allowed: false, default_max_request_cost_usd: 0.05, default_daily_budget_usd: 1.0, default_weekly_budget_usd: 5.0, default_monthly_budget_usd: 15.0, fallback_budget_class_key: null },
  { budget_class_key: "balanced_admin", display_name: "Balanced Admin", description: "Standard admin analysis and diagnostics — good quality/cost ratio", priority_order: 2, premium_allowed: false, default_max_request_cost_usd: 0.15, default_daily_budget_usd: 3.0, default_weekly_budget_usd: 15.0, default_monthly_budget_usd: 50.0, fallback_budget_class_key: "economy_admin" },
  { budget_class_key: "premium_architecture", display_name: "Premium Architecture", description: "High-value architecture and remediation reasoning — full reasoning models", priority_order: 3, premium_allowed: true, default_max_request_cost_usd: 0.50, default_daily_budget_usd: 5.0, default_weekly_budget_usd: 25.0, default_monthly_budget_usd: 80.0, fallback_budget_class_key: "balanced_admin" },
  { budget_class_key: "deep_audit", display_name: "Deep Audit", description: "Large audit syntheses across multiple domains — stricter request caps", priority_order: 4, premium_allowed: true, default_max_request_cost_usd: 0.75, default_daily_budget_usd: 3.0, default_weekly_budget_usd: 15.0, default_monthly_budget_usd: 50.0, fallback_budget_class_key: "balanced_admin" },
  { budget_class_key: "internal_diagnostics", display_name: "Internal Diagnostics", description: "Health, support, and drift diagnostics — economy or balanced tier", priority_order: 5, premium_allowed: false, default_max_request_cost_usd: 0.05, default_daily_budget_usd: 2.0, default_weekly_budget_usd: 10.0, default_monthly_budget_usd: 30.0, fallback_budget_class_key: "economy_admin" },
];

// Role → task key mappings
const ROLE_TASK_MAP: Record<string, string[]> = {
  chief_architect: ["architecture_review", "remediation_plan_generation", "contradiction_mapping"],
  runtime_truth_analyst: ["runtime_truth_audit", "degraded_state_analysis", "contradiction_mapping"],
  connector_ops_engineer: ["connector_failure_diagnosis", "degraded_state_analysis"],
  ai_governance_engineer: ["ai_budget_analysis", "cost_optimization_review"],
  quality_launch_engineer: ["launch_readiness_summary", "contradiction_mapping"],
  data_schema_ops_engineer: ["schema_gap_analysis"],
  device_surface_readiness_engineer: ["surface_portability_review"],
  budget_efficiency_analyst: ["ai_budget_analysis", "cost_optimization_review"],
  incident_drift_analyst: ["incident_triage", "degraded_state_analysis"],
  remediation_planner: ["remediation_plan_generation"],
};

export async function seedWorkforceData(): Promise<{ roles: number; tasks: number; budgetClasses: number; permissions: number }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Check if already seeded
  const { count } = await supabase.from("ai_workforce_roles").select("*", { count: "exact", head: true }).eq("user_id", user.id);
  if (count && count > 0) {
    return { roles: count, tasks: 0, budgetClasses: 0, permissions: 0 };
  }

  // Seed roles
  const rolesPayload = SEED_ROLES.map(r => ({
    user_id: user.id,
    ...r,
    metadata: {},
    total_invocations: 0,
    total_cost_cents: 0,
  }));
  const { error: rolesErr } = await supabase.from("ai_workforce_roles").insert(rolesPayload);
  if (rolesErr) throw new Error(`Roles seed failed: ${rolesErr.message}`);

  // Seed tasks
  const tasksPayload = SEED_TASKS.map(t => ({
    user_id: user.id,
    ...t,
    approval_required: true,
    is_active: true,
    structured_output_required: true,
    requires_human_review_for_proposals: true,
    allows_cached_output: true,
    supports_scope_diffing: true,
    launch_stage: "internal",
    output_schema: {},
  }));
  const { error: tasksErr } = await supabase.from("ai_workforce_task_types").insert(tasksPayload);
  if (tasksErr) throw new Error(`Tasks seed failed: ${tasksErr.message}`);

  // Seed budget classes
  const budgetPayload = SEED_BUDGET_CLASSES.map(b => ({ user_id: user.id, ...b }));
  const { error: budgetErr } = await supabase.from("ai_workforce_budget_classes").insert(budgetPayload);
  if (budgetErr) throw new Error(`Budget classes seed failed: ${budgetErr.message}`);

  // Fetch inserted IDs for permissions
  const { data: insertedRoles } = await supabase.from("ai_workforce_roles").select("id, role_key").eq("user_id", user.id);
  const { data: insertedTasks } = await supabase.from("ai_workforce_task_types").select("id, task_key").eq("user_id", user.id);

  if (!insertedRoles || !insertedTasks) throw new Error("Failed to fetch inserted data for permissions");

  const roleMap = Object.fromEntries(insertedRoles.map(r => [r.role_key, r.id]));
  const taskMap = Object.fromEntries(insertedTasks.map(t => [t.task_key, t.id]));

  // Seed permissions
  const perms: any[] = [];
  for (const [roleKey, taskKeys] of Object.entries(ROLE_TASK_MAP)) {
    for (const taskKey of taskKeys) {
      if (roleMap[roleKey] && taskMap[taskKey]) {
        perms.push({
          user_id: user.id,
          role_id: roleMap[roleKey],
          task_id: taskMap[taskKey],
          allowed: true,
          requires_approval_override: roleKey === "chief_architect" || roleKey === "remediation_planner",
        });
      }
    }
  }

  const { error: permsErr } = await supabase.from("ai_workforce_role_task_permissions").insert(perms);
  if (permsErr) throw new Error(`Permissions seed failed: ${permsErr.message}`);

  // Seed role health entries
  const healthPayload = insertedRoles.map(r => ({
    user_id: user.id,
    role_id: r.id,
    health_state: "healthy",
    health_reason: "Initial healthy state",
  }));
  const { error: healthErr } = await supabase.from("ai_workforce_role_health").insert(healthPayload);
  if (healthErr) console.warn("Health seed warning:", healthErr.message);

  return { roles: SEED_ROLES.length, tasks: SEED_TASKS.length, budgetClasses: SEED_BUDGET_CLASSES.length, permissions: perms.length };
}

export { SEED_ROLES, SEED_TASKS, SEED_BUDGET_CLASSES, ROLE_TASK_MAP };
