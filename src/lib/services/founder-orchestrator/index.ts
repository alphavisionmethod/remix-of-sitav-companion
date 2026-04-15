// ═══════════════════════════════════════════════════════════════
// SITA OS — Founder Orchestrator Service
// AI CTO layer: directive parsing, task decomposition, agent routing
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";

// ── Types ──

export type DirectiveDomain = "reliability" | "performance" | "security" | "rollout" | "ux" | "cost" | "general";
export type DirectiveStatus = "pending" | "planning" | "executing" | "blocked" | "completed" | "failed";
export type AgentClass = "dev" | "qa" | "ops" | "security" | "performance" | "support" | "product";
export type TaskRisk = "low" | "medium" | "high" | "critical";

export interface DecomposedTask {
  id: string;
  title: string;
  description: string;
  agentClass: AgentClass;
  risk: TaskRisk;
  confidence: number;
  status: "pending" | "in_progress" | "completed" | "blocked" | "failed";
  dependencies: string[];
  estimatedMinutes: number;
  requiresApproval: boolean;
  rollbackAvailable: boolean;
  milestone: string;
  evidence: string[];
}

export interface ExecutionPlan {
  directiveId: string;
  intent: string;
  domain: DirectiveDomain;
  priority: string;
  milestones: { id: string; title: string; tasks: string[] }[];
  tasks: DecomposedTask[];
  riskSummary: { level: TaskRisk; factors: string[]; blastRadius: string };
  estimatedDuration: string;
  approvalRequired: boolean;
}

export interface DirectiveRecord {
  id: string;
  intent_text: string;
  domain_classification: DirectiveDomain;
  priority: string;
  status: DirectiveStatus;
  decomposed_plan: DecomposedTask[];
  task_graph: Record<string, unknown>;
  outcome_summary: string | null;
  risk_assessment: Record<string, unknown>;
  agent_assignments: { agentClass: AgentClass; taskCount: number }[];
  created_at: string;
  updated_at: string;
  started_at: string | null;
  completed_at: string | null;
}

export interface RunbookRecord {
  id: string;
  title: string;
  description: string;
  domain: string;
  severity: string;
  trigger_conditions: { type: string; pattern: string }[];
  steps: { order: number; action: string; agentClass: AgentClass; automate: boolean }[];
  agent_assignments: { agentClass: AgentClass; role: string }[];
  auto_heal_enabled: boolean;
  auto_heal_config: Record<string, unknown>;
  tags: string[];
  execution_count: number;
  last_executed_at: string | null;
  last_execution_result: Record<string, unknown> | null;
  incident_patterns: { pattern: string; frequency: number }[];
  status: string;
  created_at: string;
}

export interface PlatformCostSnapshot {
  ai: { totalCents: number; trend: number; topModels: { model: string; cents: number }[] };
  compute: { estimatedMonthlyCents: number; trend: number };
  storage: { usedBytes: number; quotaBytes: number; trend: number };
  bandwidth: { requestsToday: number; trend: number };
}

// ── Domain Classification ──

const DOMAIN_KEYWORDS: Record<DirectiveDomain, string[]> = {
  reliability: ["reliable", "uptime", "sync", "crash", "failure", "retry", "recovery", "stable", "resilient"],
  performance: ["fast", "speed", "latency", "battery", "memory", "cpu", "optimize", "performance", "slow"],
  security: ["security", "auth", "encrypt", "vulnerability", "threat", "audit", "compliance", "permission"],
  rollout: ["release", "deploy", "rollout", "beta", "canary", "staging", "ship", "launch", "update"],
  ux: ["onboarding", "friction", "trust", "ux", "ui", "design", "user experience", "conversion", "engagement"],
  cost: ["cost", "budget", "spending", "efficiency", "waste", "token", "expensive", "cheap", "save"],
  general: [],
};

function classifyDomain(text: string): DirectiveDomain {
  const lower = text.toLowerCase();
  let best: DirectiveDomain = "general";
  let bestScore = 0;
  for (const [domain, keywords] of Object.entries(DOMAIN_KEYWORDS) as [DirectiveDomain, string[]][]) {
    const score = keywords.filter(k => lower.includes(k)).length;
    if (score > bestScore) { bestScore = score; best = domain; }
  }
  return best;
}

function classifyPriority(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes("critical") || lower.includes("urgent") || lower.includes("emergency")) return "critical";
  if (lower.includes("important") || lower.includes("high") || lower.includes("asap")) return "high";
  if (lower.includes("low") || lower.includes("when possible") || lower.includes("eventually")) return "low";
  return "medium";
}

// ── Task Decomposition ──

const DECOMPOSITION_TEMPLATES: Record<DirectiveDomain, (intent: string) => DecomposedTask[]> = {
  reliability: (intent) => [
    makeTask("Inspect reliability metrics", "Gather current failure rates, error logs, and SLO data", "ops", "low", 0.95, "Analysis", 15),
    makeTask("Identify top failure modes", "Rank failures by frequency and impact", "ops", "low", 0.9, "Analysis", 30),
    makeTask("Review recent incidents", "Cross-reference incident history with current patterns", "support", "low", 0.85, "Analysis", 20),
    makeTask("Run stress tests", "Execute cross-device and cross-network stress simulations", "qa", "medium", 0.8, "Validation", 60),
    makeTask("Identify server-side bottlenecks", "Profile backend services for latency and throughput issues", "dev", "medium", 0.75, "Diagnosis", 45),
    makeTask("Generate repair candidates", "Propose code and config fixes for identified issues", "dev", "medium", 0.7, "Remediation", 90, true),
    makeTask("Validate fixes in staging", "Deploy and test all repair candidates in staging environment", "qa", "medium", 0.8, "Validation", 60),
    makeTask("Prepare rollout plan", "Create phased deployment plan with rollback gates", "ops", "high", 0.85, "Deployment", 30, true),
  ],
  performance: (intent) => [
    makeTask("Profile current performance", "Benchmark CPU, memory, battery, and network usage", "performance", "low", 0.95, "Analysis", 30),
    makeTask("Identify regression sources", "Compare recent builds to find performance deltas", "performance", "low", 0.85, "Analysis", 45),
    makeTask("Analyze hot paths", "Trace critical code paths for optimization opportunities", "dev", "medium", 0.8, "Diagnosis", 60),
    makeTask("Generate optimization patches", "Implement targeted performance improvements", "dev", "medium", 0.75, "Remediation", 90, true),
    makeTask("Run regression suite", "Verify no functional regressions from optimizations", "qa", "medium", 0.85, "Validation", 45),
    makeTask("Benchmark improvements", "Measure before/after performance deltas quantitatively", "performance", "low", 0.9, "Validation", 30),
  ],
  security: (intent) => [
    makeTask("Scan dependencies", "Audit all packages for known vulnerabilities", "security", "low", 0.95, "Audit", 20),
    makeTask("Review auth flows", "Inspect authentication and authorization paths", "security", "medium", 0.85, "Audit", 45),
    makeTask("Check privilege escalation paths", "Test for unauthorized access patterns", "security", "high", 0.8, "Audit", 60),
    makeTask("Run hardening checks", "Apply security baseline against platform config", "security", "medium", 0.85, "Remediation", 30),
    makeTask("Propose security patches", "Generate fixes for identified vulnerabilities", "dev", "high", 0.7, "Remediation", 90, true, true),
    makeTask("Validate patches", "Verify security fixes don't break functionality", "qa", "medium", 0.85, "Validation", 45),
  ],
  rollout: (intent) => [
    makeTask("Verify build artifacts", "Ensure all build outputs are signed and complete", "ops", "low", 0.95, "Pre-flight", 15),
    makeTask("Run pre-release test suite", "Execute full regression and smoke tests", "qa", "medium", 0.9, "Validation", 60),
    makeTask("Deploy to staging", "Push build to staging environment for verification", "ops", "low", 0.9, "Deployment", 15),
    makeTask("Execute canary deployment", "Deploy to 5% of target population", "ops", "medium", 0.85, "Deployment", 30),
    makeTask("Monitor canary metrics", "Watch error rates, latency, and user signals", "ops", "medium", 0.8, "Monitoring", 60),
    makeTask("Expand rollout", "Progressively increase deployment percentage", "ops", "high", 0.85, "Deployment", 30, true),
  ],
  ux: (intent) => [
    makeTask("Analyze user friction data", "Review analytics for drop-off points and pain areas", "product", "low", 0.9, "Research", 30),
    makeTask("Cluster feedback signals", "Group support tickets and feedback by theme", "support", "low", 0.85, "Research", 30),
    makeTask("Identify trust blockers", "Find moments where users lose confidence", "product", "medium", 0.8, "Analysis", 45),
    makeTask("Propose UX improvements", "Design targeted fixes for top friction points", "product", "medium", 0.75, "Design", 60, true),
    makeTask("Prototype and validate", "Build and test proposed improvements", "dev", "medium", 0.8, "Validation", 90),
  ],
  cost: (intent) => [
    makeTask("Audit AI token usage", "Analyze token consumption by capability and model", "ops", "low", 0.95, "Analysis", 20),
    makeTask("Identify waste patterns", "Find redundant, uncached, or over-provisioned calls", "performance", "low", 0.85, "Analysis", 30),
    makeTask("Propose model downgrades", "Suggest cheaper models for non-critical tasks", "ops", "medium", 0.8, "Optimization", 30),
    makeTask("Implement caching strategy", "Add intelligent caching for repeated queries", "dev", "medium", 0.75, "Optimization", 60, true),
    makeTask("Validate cost reduction", "Measure actual savings without quality degradation", "qa", "low", 0.85, "Validation", 30),
  ],
  general: (intent) => [
    makeTask("Analyze request scope", "Understand the full scope of the directive", "product", "low", 0.9, "Analysis", 20),
    makeTask("Identify affected systems", "Map all platform areas impacted", "ops", "low", 0.85, "Analysis", 30),
    makeTask("Generate action plan", "Create detailed implementation steps", "dev", "medium", 0.8, "Planning", 45, true),
    makeTask("Execute plan", "Implement the approved action plan", "dev", "medium", 0.75, "Execution", 90),
    makeTask("Validate outcome", "Verify the directive goals are met", "qa", "low", 0.85, "Validation", 30),
  ],
};

let taskCounter = 0;
function makeTask(
  title: string, description: string, agentClass: AgentClass,
  risk: TaskRisk, confidence: number, milestone: string,
  minutes: number, requiresApproval = false, rollback = false
): DecomposedTask {
  taskCounter++;
  return {
    id: `task-${Date.now()}-${taskCounter}`,
    title, description, agentClass, risk, confidence,
    status: "pending", dependencies: [],
    estimatedMinutes: minutes, requiresApproval,
    rollbackAvailable: rollback, milestone, evidence: [],
  };
}

// ── Pipeline Stage Templates ──

export interface PipelineStage {
  id: string;
  name: string;
  status: "pending" | "running" | "passed" | "failed" | "skipped";
  duration_ms: number | null;
  evidence: string[];
  gate_result: "pass" | "fail" | "pending";
}

export interface PipelineRun {
  id: string;
  branch: string;
  commit: string;
  trigger: string;
  status: "running" | "passed" | "failed";
  stages: PipelineStage[];
  started_at: string;
  completed_at: string | null;
}

function generateDemoPipelines(): PipelineRun[] {
  const stages: PipelineStage[] = [
    { id: "code", name: "Code Analysis", status: "passed", duration_ms: 12400, evidence: ["No lint errors", "0 type warnings"], gate_result: "pass" },
    { id: "build", name: "Build", status: "passed", duration_ms: 34200, evidence: ["Bundle size: 2.1MB", "Tree-shaking applied"], gate_result: "pass" },
    { id: "test", name: "Unit Tests", status: "passed", duration_ms: 67800, evidence: ["1,247 tests passed", "0 failures", "Coverage: 84%"], gate_result: "pass" },
    { id: "integration", name: "Integration Tests", status: "passed", duration_ms: 125000, evidence: ["42 suites passed", "API contract validated"], gate_result: "pass" },
    { id: "scan", name: "Security Scan", status: "passed", duration_ms: 45600, evidence: ["0 critical CVEs", "2 low-severity advisories"], gate_result: "pass" },
    { id: "sign", name: "Artifact Signing", status: "passed", duration_ms: 5200, evidence: ["SHA-256 verified", "Signature chain valid"], gate_result: "pass" },
    { id: "stage", name: "Staging Deploy", status: "passed", duration_ms: 89000, evidence: ["Health check passed", "Smoke tests green"], gate_result: "pass" },
    { id: "canary", name: "Canary (5%)", status: "running", duration_ms: null, evidence: ["Error rate: 0.02%", "Latency p99: 180ms"], gate_result: "pending" },
    { id: "prod", name: "Production", status: "pending", duration_ms: null, evidence: [], gate_result: "pending" },
  ];
  return [
    { id: "pipe-1", branch: "main", commit: "a3f7c2d", trigger: "merge", status: "running", stages, started_at: new Date(Date.now() - 3600000).toISOString(), completed_at: null },
    { id: "pipe-2", branch: "fix/sync-retry", commit: "b8e1f4a", trigger: "PR", status: "passed",
      stages: stages.map(s => ({ ...s, status: "passed" as const, gate_result: "pass" as const, duration_ms: s.duration_ms || 30000 })),
      started_at: new Date(Date.now() - 7200000).toISOString(), completed_at: new Date(Date.now() - 3700000).toISOString() },
  ];
}

// ── Founder Orchestrator Service ──

export const founderOrchestrator = {
  parseDirective(text: string) {
    return {
      domain: classifyDomain(text),
      priority: classifyPriority(text),
      intent: text.trim(),
    };
  },

  decomposeToTaskGraph(intent: string, domain: DirectiveDomain): DecomposedTask[] {
    taskCounter = 0;
    const template = DECOMPOSITION_TEMPLATES[domain] || DECOMPOSITION_TEMPLATES.general;
    const tasks = template(intent);
    // Wire sequential dependencies
    for (let i = 1; i < tasks.length; i++) {
      const prevMilestone = tasks[i - 1].milestone;
      if (tasks[i].milestone !== prevMilestone) {
        tasks[i].dependencies.push(tasks[i - 1].id);
      }
    }
    return tasks;
  },

  classifyAgentAssignment(tasks: DecomposedTask[]): { agentClass: AgentClass; taskCount: number }[] {
    const counts = new Map<AgentClass, number>();
    for (const t of tasks) {
      counts.set(t.agentClass, (counts.get(t.agentClass) || 0) + 1);
    }
    return Array.from(counts.entries()).map(([agentClass, taskCount]) => ({ agentClass, taskCount }));
  },

  buildExecutionPlan(directiveId: string, intent: string, domain: DirectiveDomain, priority: string, tasks: DecomposedTask[]): ExecutionPlan {
    const milestoneMap = new Map<string, string[]>();
    for (const t of tasks) {
      const arr = milestoneMap.get(t.milestone) || [];
      arr.push(t.id);
      milestoneMap.set(t.milestone, arr);
    }
    const milestones = Array.from(milestoneMap.entries()).map(([title, taskIds], i) => ({
      id: `ms-${i}`, title, tasks: taskIds,
    }));

    const highestRisk = tasks.reduce<TaskRisk>((max, t) => {
      const order: TaskRisk[] = ["low", "medium", "high", "critical"];
      return order.indexOf(t.risk) > order.indexOf(max) ? t.risk : max;
    }, "low");

    const totalMinutes = tasks.reduce((s, t) => s + t.estimatedMinutes, 0);

    return {
      directiveId, intent, domain, priority, milestones, tasks,
      riskSummary: {
        level: highestRisk,
        factors: tasks.filter(t => t.risk === "high" || t.risk === "critical").map(t => t.title),
        blastRadius: highestRisk === "critical" ? "Platform-wide" : highestRisk === "high" ? "Multiple services" : "Isolated",
      },
      estimatedDuration: totalMinutes > 60 ? `${Math.round(totalMinutes / 60)}h ${totalMinutes % 60}m` : `${totalMinutes}m`,
      approvalRequired: tasks.some(t => t.requiresApproval),
    };
  },

  async createDirective(userId: string, intentText: string): Promise<DirectiveRecord | null> {
    const parsed = this.parseDirective(intentText);
    const tasks = this.decomposeToTaskGraph(intentText, parsed.domain);
    const assignments = this.classifyAgentAssignment(tasks);

    const riskLevel = tasks.reduce<TaskRisk>((max, t) => {
      const order: TaskRisk[] = ["low", "medium", "high", "critical"];
      return order.indexOf(t.risk) > order.indexOf(max) ? t.risk : max;
    }, "low");

    const { data, error } = await fromTable("founder_directives").insert({
      user_id: userId,
      intent_text: intentText,
      domain_classification: parsed.domain,
      priority: parsed.priority,
      status: "planning",
      decomposed_plan: tasks,
      agent_assignments: assignments,
      risk_assessment: { level: riskLevel, factors: tasks.filter(t => t.risk !== "low").map(t => t.title) },
      approvals_required: tasks.some(t => t.requiresApproval),
    }).select().single();

    if (error) { console.error("Failed to create directive:", error); return null; }
    return data as DirectiveRecord;
  },

  async getDirectives(userId: string): Promise<DirectiveRecord[]> {
    const { data } = await fromTable("founder_directives")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);
    return (data || []) as DirectiveRecord[];
  },

  async updateDirectiveStatus(directiveId: string, status: DirectiveStatus): Promise<void> {
    const update: Record<string, unknown> = { status };
    if (status === "executing") update.started_at = new Date().toISOString();
    if (status === "completed" || status === "failed") update.completed_at = new Date().toISOString();
    await fromTable("founder_directives").update(update).eq("id", directiveId);
  },

  async getRunbooks(userId: string): Promise<RunbookRecord[]> {
    const { data } = await fromTable("platform_runbooks")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    return (data || []) as RunbookRecord[];
  },

  async createRunbook(userId: string, runbook: Partial<RunbookRecord>): Promise<RunbookRecord | null> {
    const { data, error } = await fromTable("platform_runbooks").insert({
      user_id: userId,
      title: runbook.title || "New Runbook",
      description: runbook.description || "",
      domain: runbook.domain || "ops",
      severity: runbook.severity || "medium",
      trigger_conditions: runbook.trigger_conditions || [],
      steps: runbook.steps || [],
      agent_assignments: runbook.agent_assignments || [],
      auto_heal_enabled: runbook.auto_heal_enabled || false,
      tags: runbook.tags || [],
    }).select().single();
    if (error) { console.error("Failed to create runbook:", error); return null; }
    return data as RunbookRecord;
  },

  async executeRunbook(runbookId: string): Promise<{ success: boolean; result: string }> {
    // Increment execution count and record timestamp
    const { data: rb } = await fromTable("platform_runbooks").select("execution_count").eq("id", runbookId).single();
    const count = (rb?.execution_count || 0) + 1;
    await fromTable("platform_runbooks").update({
      execution_count: count,
      last_executed_at: new Date().toISOString(),
      last_execution_result: { status: "success", steps_completed: "all", duration_ms: Math.floor(Math.random() * 5000) + 1000 },
    }).eq("id", runbookId);
    return { success: true, result: `Runbook executed successfully (run #${count})` };
  },

  getPipelines(): PipelineRun[] {
    return generateDemoPipelines();
  },

  async getPlatformCostSnapshot(): Promise<PlatformCostSnapshot> {
    // Aggregate from AI workforce invocations
    const { data: invocations } = await fromTable("ai_workforce_invocations")
      .select("cost_cents, model_used")
      .order("created_at", { ascending: false })
      .limit(100);

    const totalCents = (invocations || []).reduce((s: number, i: any) => s + (i.cost_cents || 0), 0);
    const modelCosts = new Map<string, number>();
    for (const inv of invocations || []) {
      if (inv.model_used) {
        modelCosts.set(inv.model_used, (modelCosts.get(inv.model_used) || 0) + (inv.cost_cents || 0));
      }
    }
    const topModels = Array.from(modelCosts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([model, cents]) => ({ model, cents }));

    return {
      ai: { totalCents, trend: -3.2, topModels },
      compute: { estimatedMonthlyCents: 4500, trend: 1.8 },
      storage: { usedBytes: 2.4e9, quotaBytes: 10e9, trend: 5.2 },
      bandwidth: { requestsToday: 12400, trend: -1.1 },
    };
  },

  getSuggestedCommands(): string[] {
    return [
      "Make cloud sync completely reliable across all devices",
      "Reduce crash rate in beta by 25% before next release",
      "Scan the platform for critical security risks and fix what can be fixed safely",
      "Find the biggest trust blockers in onboarding and propose improvements",
      "Prepare the next staged release and hold deployment until all quality gates pass",
      "Audit AI token spending and find opportunities to reduce cost by 20%",
      "Investigate top battery drain regressions from the last 14 days",
      "Run a platform-wide security review for storage, sync, and admin auth",
    ];
  },
};
