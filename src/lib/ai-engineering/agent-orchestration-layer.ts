// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Engineering: Agent Orchestration Layer
// Coordinates specialist AI agents, routes tasks, detects conflicts,
// handles escalation, manages autonomy, produces synthesis
// ═══════════════════════════════════════════════════════════════

import type { AutonomyMode } from "./planning-layer";

// ── Agent definitions ──────────────────────────────────────────

export type AgentRole =
  | "engineering-lead"
  | "backend-engineer"
  | "frontend-engineer"
  | "design-engineer"
  | "qa-engineer"
  | "error-fixer"
  | "reliability-engineer"
  | "security-reviewer"
  | "performance-optimizer"
  | "release-manager"
  | "self-healing-supervisor"
  | "learning-analyst"
  | "docs-engineer";

export type AgentState = "idle" | "assigned" | "working" | "blocked" | "escalated" | "completed";

export interface AgentInstance {
  agentId: string;
  role: AgentRole;
  name: string;
  domain: string;
  state: AgentState;
  currentMissionId?: string;
  currentTaskDescription?: string;
  confidence: number;
  autonomyMode: AutonomyMode;
  maxConcurrentTasks: number;
  activeTaskCount: number;
  capabilities: string[];
  escalationTargets: AgentRole[];
  receivesEscalationsFrom: AgentRole[];
  accuracy: number;
  weight: number; // routing weight 0.5-1.5
  lastActivityAt: string;
}

// ── Collaboration types ────────────────────────────────────────

export interface AgentProposal {
  proposalId: string;
  agentId: string;
  agentRole: AgentRole;
  missionId: string;
  recommendation: string;
  confidence: number;
  evidence: string[];
  assumptions: string[];
  risks: string[];
  dissent?: string; // disagreement with another agent
  timestamp: string;
}

export interface ConflictDetection {
  conflictId: string;
  missionId: string;
  agents: { agentId: string; role: AgentRole; position: string; confidence: number }[];
  nature: "recommendation-clash" | "risk-disagreement" | "priority-conflict" | "scope-overlap" | "assumption-conflict";
  severity: "low" | "medium" | "high";
  suggestedResolution: string;
  resolvedBy?: "synthesis" | "escalation" | "human-override" | "confidence-arbitration";
  resolvedAt?: string;
}

export interface EscalationRecord {
  escalationId: string;
  fromAgent: string;
  fromRole: AgentRole;
  toTarget: AgentRole | "human";
  reason: string;
  missionId?: string;
  context: Record<string, unknown>;
  status: "pending" | "acknowledged" | "resolved" | "overridden";
  createdAt: string;
  resolvedAt?: string;
}

export interface EngineeringSynthesis {
  synthesisId: string;
  missionId: string;
  proposals: AgentProposal[];
  conflicts: ConflictDetection[];
  escalations: EscalationRecord[];
  consensusSummary: string;
  recommendedAction: string;
  overallConfidence: number;
  dissent: string[];
  humanReviewRequired: boolean;
  synthesizedAt: string;
}

// ── Handoff types ──────────────────────────────────────────────

export interface TaskHandoff {
  handoffId: string;
  missionId: string;
  fromAgent: string;
  toAgent: string;
  description: string;
  contextPacket: Record<string, unknown>;
  status: "pending" | "accepted" | "completed" | "rejected";
  createdAt: string;
}

// ── Orchestration Engine ───────────────────────────────────────

export class AgentOrchestrationLayer {
  private agents: Map<string, AgentInstance> = new Map();
  private proposals: AgentProposal[] = [];
  private conflicts: ConflictDetection[] = [];
  private escalations: EscalationRecord[] = [];
  private handoffs: TaskHandoff[] = [];
  private syntheses: EngineeringSynthesis[] = [];

  constructor() {
    this.initializeAgents();
  }

  private initializeAgents() {
    const defs: Omit<AgentInstance, "state" | "activeTaskCount" | "lastActivityAt" | "weight">[] = [
      { agentId: "agent-lead", role: "engineering-lead", name: "AI Engineering Lead", domain: "Coordination", confidence: 92, autonomyMode: "approval_required", maxConcurrentTasks: 5, capabilities: ["synthesis", "decomposition", "conflict-resolution", "prioritization"], escalationTargets: [], receivesEscalationsFrom: ["backend-engineer", "frontend-engineer", "design-engineer", "qa-engineer", "error-fixer", "reliability-engineer", "security-reviewer", "performance-optimizer", "release-manager"], accuracy: 89 },
      { agentId: "agent-backend", role: "backend-engineer", name: "Backend Engineer", domain: "APIs & Services", confidence: 88, autonomyMode: "draft_only", maxConcurrentTasks: 3, capabilities: ["api-analysis", "query-optimization", "schema-review", "cache-strategy", "edge-fn-debug"], escalationTargets: ["engineering-lead", "security-reviewer"], receivesEscalationsFrom: ["error-fixer"], accuracy: 86 },
      { agentId: "agent-frontend", role: "frontend-engineer", name: "Frontend Engineer", domain: "UI & Components", confidence: 85, autonomyMode: "approval_required", maxConcurrentTasks: 4, capabilities: ["component-analysis", "route-debugging", "a11y-fix", "hydration-analysis", "render-optimization"], escalationTargets: ["engineering-lead", "design-engineer"], receivesEscalationsFrom: ["error-fixer", "design-engineer"], accuracy: 84 },
      { agentId: "agent-design", role: "design-engineer", name: "Design Engineer", domain: "Visual Quality", confidence: 79, autonomyMode: "draft_only", maxConcurrentTasks: 3, capabilities: ["design-diff", "token-audit", "layout-analysis", "dark-mode-fix", "a11y-contrast"], escalationTargets: ["engineering-lead"], receivesEscalationsFrom: [], accuracy: 79 },
      { agentId: "agent-qa", role: "qa-engineer", name: "QA / Test Engineer", domain: "Quality Assurance", confidence: 91, autonomyMode: "safe_auto_heal", maxConcurrentTasks: 4, capabilities: ["test-generation", "regression-detection", "coverage-analysis", "flaky-test-fix", "smoke-test-design"], escalationTargets: ["engineering-lead"], receivesEscalationsFrom: [], accuracy: 88 },
      { agentId: "agent-fixer", role: "error-fixer", name: "Error Fixer / Debugger", domain: "Error Resolution", confidence: 84, autonomyMode: "approval_required", maxConcurrentTasks: 5, capabilities: ["error-clustering", "stack-trace-analysis", "root-cause-inference", "patch-generation", "repro-estimation"], escalationTargets: ["backend-engineer", "frontend-engineer", "engineering-lead"], receivesEscalationsFrom: [], accuracy: 91 },
      { agentId: "agent-reliability", role: "reliability-engineer", name: "Reliability Engineer", domain: "Resilience & Ops", confidence: 90, autonomyMode: "safe_auto_heal", maxConcurrentTasks: 3, capabilities: ["incident-triage", "health-monitoring", "rollback-execution", "degradation-detection", "circuit-breaking"], escalationTargets: ["engineering-lead"], receivesEscalationsFrom: ["error-fixer", "self-healing-supervisor"], accuracy: 93 },
      { agentId: "agent-security", role: "security-reviewer", name: "Security Reviewer", domain: "Security Posture", confidence: 87, autonomyMode: "observe_only", maxConcurrentTasks: 2, capabilities: ["permission-audit", "secret-scan", "policy-check", "migration-risk", "rls-review"], escalationTargets: ["engineering-lead"], receivesEscalationsFrom: ["backend-engineer"], accuracy: 96 },
      { agentId: "agent-perf", role: "performance-optimizer", name: "Performance Optimizer", domain: "Speed & Efficiency", confidence: 76, autonomyMode: "approval_required", maxConcurrentTasks: 3, capabilities: ["bundle-analysis", "query-cost", "render-profiling", "lazy-import", "prefetch-strategy"], escalationTargets: ["engineering-lead"], receivesEscalationsFrom: [], accuracy: 74 },
      { agentId: "agent-release", role: "release-manager", name: "Release Manager", domain: "Release Safety", confidence: 82, autonomyMode: "approval_required", maxConcurrentTasks: 2, capabilities: ["gate-evaluation", "canary-analysis", "rollout-risk", "deployment-planning", "version-tracking"], escalationTargets: ["engineering-lead"], receivesEscalationsFrom: ["reliability-engineer"], accuracy: 85 },
      { agentId: "agent-healing", role: "self-healing-supervisor", name: "Self-Healing Supervisor", domain: "Auto-Remediation", confidence: 88, autonomyMode: "safe_auto_heal", maxConcurrentTasks: 4, capabilities: ["heal-evaluation", "rule-management", "verification-check", "downgrade-decision", "heal-scoping"], escalationTargets: ["reliability-engineer", "engineering-lead"], receivesEscalationsFrom: [], accuracy: 90 },
      { agentId: "agent-learning", role: "learning-analyst", name: "Learning Analyst", domain: "Pattern Discovery", confidence: 71, autonomyMode: "observe_only", maxConcurrentTasks: 2, capabilities: ["pattern-detection", "trend-analysis", "override-tracking", "improvement-proposal", "confidence-calibration"], escalationTargets: ["engineering-lead"], receivesEscalationsFrom: [], accuracy: 71 },
      { agentId: "agent-docs", role: "docs-engineer", name: "Documentation Engineer", domain: "Docs & Runbooks", confidence: 93, autonomyMode: "safe_auto_heal", maxConcurrentTasks: 2, capabilities: ["runbook-update", "changelog-generation", "doc-drift-detection", "api-doc-generation"], escalationTargets: [], receivesEscalationsFrom: [], accuracy: 92 },
    ];

    for (const d of defs) {
      this.agents.set(d.agentId, {
        ...d,
        state: "idle",
        activeTaskCount: 0,
        lastActivityAt: new Date().toISOString(),
        weight: 1.0,
      });
    }
  }

  // ── Routing ────────────────────────────────────────────────

  routeTask(taskDescription: string, domain: string): AgentInstance | null {
    const candidates = [...this.agents.values()]
      .filter(a => a.activeTaskCount < a.maxConcurrentTasks)
      .filter(a => a.capabilities.some(c => domain.toLowerCase().includes(c.split("-")[0])))
      .sort((a, b) => (b.confidence * b.weight) - (a.confidence * a.weight));

    return candidates[0] ?? null;
  }

  assignTask(agentId: string, missionId: string, taskDescription: string) {
    const agent = this.agents.get(agentId);
    if (!agent) return;
    agent.state = "working";
    agent.currentMissionId = missionId;
    agent.currentTaskDescription = taskDescription;
    agent.activeTaskCount++;
    agent.lastActivityAt = new Date().toISOString();
  }

  completeTask(agentId: string) {
    const agent = this.agents.get(agentId);
    if (!agent) return;
    agent.activeTaskCount = Math.max(0, agent.activeTaskCount - 1);
    if (agent.activeTaskCount === 0) {
      agent.state = "idle";
      agent.currentMissionId = undefined;
      agent.currentTaskDescription = undefined;
    }
    agent.lastActivityAt = new Date().toISOString();
  }

  // ── Proposals & Conflict Detection ─────────────────────────

  submitProposal(proposal: Omit<AgentProposal, "proposalId" | "timestamp">): AgentProposal {
    const full: AgentProposal = {
      ...proposal,
      proposalId: `prop-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    this.proposals.push(full);
    this.detectConflicts(full);
    return full;
  }

  private detectConflicts(newProposal: AgentProposal) {
    const missionProposals = this.proposals.filter(
      p => p.missionId === newProposal.missionId && p.proposalId !== newProposal.proposalId
    );

    for (const existing of missionProposals) {
      if (existing.dissent || newProposal.dissent) {
        const conflict: ConflictDetection = {
          conflictId: `conflict-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          missionId: newProposal.missionId,
          agents: [
            { agentId: existing.agentId, role: existing.agentRole, position: existing.recommendation, confidence: existing.confidence },
            { agentId: newProposal.agentId, role: newProposal.agentRole, position: newProposal.recommendation, confidence: newProposal.confidence },
          ],
          nature: "recommendation-clash",
          severity: Math.abs(existing.confidence - newProposal.confidence) > 20 ? "high" : "medium",
          suggestedResolution: existing.confidence > newProposal.confidence
            ? `Favor ${existing.agentRole} (higher confidence)`
            : `Favor ${newProposal.agentRole} (higher confidence)`,
        };
        this.conflicts.push(conflict);
      }
    }
  }

  resolveConflict(conflictId: string, resolution: ConflictDetection["resolvedBy"]) {
    const conflict = this.conflicts.find(c => c.conflictId === conflictId);
    if (conflict) {
      conflict.resolvedBy = resolution;
      conflict.resolvedAt = new Date().toISOString();
    }
  }

  // ── Escalation ─────────────────────────────────────────────

  escalate(fromAgentId: string, reason: string, missionId?: string): EscalationRecord {
    const agent = this.agents.get(fromAgentId);
    const toTarget: AgentRole | "human" =
      agent?.escalationTargets[0] ?? "human";

    const record: EscalationRecord = {
      escalationId: `esc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      fromAgent: fromAgentId,
      fromRole: agent?.role ?? "error-fixer",
      toTarget,
      reason,
      missionId,
      context: { agentConfidence: agent?.confidence, agentState: agent?.state },
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    if (agent) {
      agent.state = "escalated";
    }

    this.escalations.push(record);
    return record;
  }

  resolveEscalation(escalationId: string, resolution: "resolved" | "overridden") {
    const esc = this.escalations.find(e => e.escalationId === escalationId);
    if (esc) {
      esc.status = resolution;
      esc.resolvedAt = new Date().toISOString();
    }
  }

  // ── Handoffs ───────────────────────────────────────────────

  createHandoff(fromAgentId: string, toAgentId: string, missionId: string, description: string, context: Record<string, unknown> = {}): TaskHandoff {
    const handoff: TaskHandoff = {
      handoffId: `handoff-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      missionId,
      fromAgent: fromAgentId,
      toAgent: toAgentId,
      description,
      contextPacket: context,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    this.handoffs.push(handoff);
    return handoff;
  }

  // ── Synthesis ──────────────────────────────────────────────

  synthesize(missionId: string): EngineeringSynthesis {
    const missionProposals = this.proposals.filter(p => p.missionId === missionId);
    const missionConflicts = this.conflicts.filter(c => c.missionId === missionId);
    const missionEscalations = this.escalations.filter(e => e.missionId === missionId);

    const avgConfidence = missionProposals.length > 0
      ? Math.round(missionProposals.reduce((a, p) => a + p.confidence, 0) / missionProposals.length)
      : 0;

    const unresolvedConflicts = missionConflicts.filter(c => !c.resolvedBy);
    const pendingEscalations = missionEscalations.filter(e => e.status === "pending");

    const synthesis: EngineeringSynthesis = {
      synthesisId: `synth-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      missionId,
      proposals: missionProposals,
      conflicts: missionConflicts,
      escalations: missionEscalations,
      consensusSummary: unresolvedConflicts.length > 0
        ? `${missionProposals.length} proposals with ${unresolvedConflicts.length} unresolved conflicts`
        : `${missionProposals.length} proposals in consensus`,
      recommendedAction: pendingEscalations.length > 0
        ? "Resolve pending escalations before proceeding"
        : unresolvedConflicts.length > 0
        ? "Resolve conflicts via confidence arbitration or human review"
        : "Proceed with highest-confidence proposal",
      overallConfidence: avgConfidence,
      dissent: missionProposals.filter(p => p.dissent).map(p => p.dissent!),
      humanReviewRequired: pendingEscalations.length > 0 || unresolvedConflicts.some(c => c.severity === "high"),
      synthesizedAt: new Date().toISOString(),
    };

    this.syntheses.push(synthesis);
    return synthesis;
  }

  // ── Autonomy ───────────────────────────────────────────────

  setAgentAutonomy(agentId: string, mode: AutonomyMode) {
    const agent = this.agents.get(agentId);
    if (agent) agent.autonomyMode = mode;
  }

  canAgentAct(agentId: string, actionRisk: "minimal" | "low" | "medium" | "high"): { allowed: boolean; reason: string } {
    const agent = this.agents.get(agentId);
    if (!agent) return { allowed: false, reason: "Agent not found" };

    if (agent.autonomyMode === "never_automate") return { allowed: false, reason: "Never-automate policy" };
    if (agent.autonomyMode === "observe_only") return { allowed: false, reason: "Observe-only mode" };
    if (agent.autonomyMode === "draft_only") return { allowed: false, reason: "Draft-only — cannot execute" };
    if (agent.autonomyMode === "approval_required") return { allowed: false, reason: "Approval required" };

    // safe_auto_heal
    if (actionRisk === "high" || actionRisk === "medium") {
      return { allowed: false, reason: `Risk ${actionRisk} exceeds auto-heal boundary` };
    }
    if (agent.accuracy < 70) {
      return { allowed: false, reason: `Agent accuracy ${agent.accuracy}% below 70% threshold` };
    }

    return { allowed: true, reason: "Within safe auto-heal boundaries" };
  }

  updateAgentWeight(agentId: string, delta: number) {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.weight = Math.max(0.5, Math.min(1.5, agent.weight + delta));
    }
  }

  // ── Environment boundaries ─────────────────────────────────

  canActInEnvironment(agentId: string, env: "preview" | "staging" | "production"): boolean {
    const agent = this.agents.get(agentId);
    if (!agent) return false;
    if (env === "production") {
      // Only safe-auto-heal agents with high accuracy can touch production
      return agent.autonomyMode === "safe_auto_heal" && agent.accuracy >= 90;
    }
    if (env === "staging") {
      return agent.autonomyMode !== "observe_only" && agent.autonomyMode !== "never_automate";
    }
    return true; // preview is always safe
  }

  // ── Queries ────────────────────────────────────────────────

  getAgents(): AgentInstance[] { return [...this.agents.values()]; }
  getAgent(id: string): AgentInstance | undefined { return this.agents.get(id); }
  getProposals(missionId?: string): AgentProposal[] { return missionId ? this.proposals.filter(p => p.missionId === missionId) : [...this.proposals]; }
  getConflicts(): ConflictDetection[] { return [...this.conflicts]; }
  getEscalations(): EscalationRecord[] { return [...this.escalations]; }
  getHandoffs(): TaskHandoff[] { return [...this.handoffs]; }
  getSyntheses(): EngineeringSynthesis[] { return [...this.syntheses]; }

  getActiveAgents(): AgentInstance[] {
    return [...this.agents.values()].filter(a => a.state !== "idle");
  }

  getEscalatedAgents(): AgentInstance[] {
    return [...this.agents.values()].filter(a => a.state === "escalated");
  }
}
