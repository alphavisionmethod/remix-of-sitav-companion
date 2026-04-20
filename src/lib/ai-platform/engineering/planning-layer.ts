// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Engineering: Planning Layer
// Converts issues/goals into structured missions, decomposes
// into tasks, and routes to specialized agents
// ═══════════════════════════════════════════════════════════════

import type { IssueCluster } from "./diagnosis-layer";

export type MissionType =
  | "fix-issue"
  | "redesign-surface"
  | "optimize-performance"
  | "add-tests"
  | "improve-accessibility"
  | "harden-deployment"
  | "update-docs"
  | "improve-caching"
  | "patch-api-mismatch"
  | "resolve-incident"
  | "reduce-drift"
  | "improve-security"
  | "custom";

export type MissionStatus =
  | "suggested"
  | "planned"
  | "decomposed"
  | "simulated"
  | "in_progress"
  | "blocked"
  | "ready_for_approval"
  | "applied"
  | "rolled_back"
  | "learned_from"
  | "archived";

export type AutonomyMode =
  | "observe_only"
  | "draft_only"
  | "safe_auto_heal"
  | "approval_required"
  | "never_automate";

export interface MissionTask {
  taskId: string;
  order: number;
  description: string;
  assignedAgent: string;
  estimatedDurationMs: number;
  dependsOn: string[];
  status: "pending" | "in_progress" | "completed" | "failed" | "skipped";
  confidence: number;
  output?: Record<string, unknown>;
}

export interface EngineeringMission {
  missionId: string;
  title: string;
  description: string;
  type: MissionType;
  priority: "low" | "medium" | "high" | "critical";
  status: MissionStatus;
  autonomyMode: AutonomyMode;
  assignedAgents: string[];
  tasks: MissionTask[];
  sourceClusterId?: string;
  evidence: Record<string, unknown>[];
  blastRadius: string;
  rollbackPlan: string;
  estimatedConfidence: number;
  progress: number;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

export class PlanningLayer {
  createMissionFromCluster(cluster: IssueCluster): EngineeringMission {
    const type = this.inferMissionType(cluster);
    const tasks = this.decomposeMission(type, cluster);

    return {
      missionId: `mission-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: `Fix: ${cluster.title}`,
      description: `Auto-generated mission to resolve ${cluster.signalCount} signals. Root cause: ${cluster.likelyRootCause}`,
      type,
      priority: cluster.severity === "critical" ? "critical" : cluster.severity === "high" ? "high" : "medium",
      status: "planned",
      autonomyMode: cluster.severity === "critical" ? "approval_required" : cluster.blastRadius === "isolated" ? "safe_auto_heal" : "approval_required",
      assignedAgents: [cluster.recommendedOwner],
      tasks,
      sourceClusterId: cluster.clusterId,
      evidence: [{ clusterId: cluster.clusterId, signalCount: cluster.signalCount, rootCause: cluster.likelyRootCause }],
      blastRadius: cluster.blastRadius,
      rollbackPlan: this.generateRollbackPlan(type, cluster),
      estimatedConfidence: cluster.confidence,
      progress: 0,
      createdAt: new Date().toISOString(),
    };
  }

  createMissionFromGoal(title: string, description: string, type: MissionType, autonomy: AutonomyMode = "approval_required"): EngineeringMission {
    return {
      missionId: `mission-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title,
      description,
      type,
      priority: "medium",
      status: "planned",
      autonomyMode: autonomy,
      assignedAgents: this.selectAgentsForType(type),
      tasks: [],
      evidence: [],
      blastRadius: "unknown",
      rollbackPlan: "Manual rollback available",
      estimatedConfidence: 50,
      progress: 0,
      createdAt: new Date().toISOString(),
    };
  }

  private inferMissionType(cluster: IssueCluster): MissionType {
    if (cluster.affectedRoutes.length > 0 && cluster.severity === "critical") return "resolve-incident";
    if (cluster.likelyRootCause.includes("performance")) return "optimize-performance";
    if (cluster.likelyRootCause.includes("design")) return "redesign-surface";
    if (cluster.likelyRootCause.includes("accessibility")) return "improve-accessibility";
    if (cluster.likelyRootCause.includes("deployment")) return "harden-deployment";
    return "fix-issue";
  }

  private decomposeMission(type: MissionType, cluster: IssueCluster): MissionTask[] {
    const tasks: MissionTask[] = [
      { taskId: "t1", order: 1, description: "Analyze root cause and gather evidence", assignedAgent: cluster.recommendedOwner, estimatedDurationMs: 30000, dependsOn: [], status: "pending", confidence: cluster.confidence },
      { taskId: "t2", order: 2, description: "Draft fix proposal with patch details", assignedAgent: cluster.recommendedOwner, estimatedDurationMs: 60000, dependsOn: ["t1"], status: "pending", confidence: 0 },
      { taskId: "t3", order: 3, description: "Run verification tests on proposed fix", assignedAgent: "QA Engineer", estimatedDurationMs: 45000, dependsOn: ["t2"], status: "pending", confidence: 0 },
      { taskId: "t4", order: 4, description: "Review security and safety implications", assignedAgent: "Security Reviewer", estimatedDurationMs: 20000, dependsOn: ["t2"], status: "pending", confidence: 0 },
    ];

    if (type === "redesign-surface") {
      tasks.push({ taskId: "t5", order: 5, description: "Generate before/after design comparison", assignedAgent: "Design Engineer", estimatedDurationMs: 40000, dependsOn: ["t2"], status: "pending", confidence: 0 });
    }

    return tasks;
  }

  private selectAgentsForType(type: MissionType): string[] {
    const mapping: Record<MissionType, string[]> = {
      "fix-issue": ["Error Fixer", "QA Engineer"],
      "redesign-surface": ["Design Engineer", "Frontend Engineer"],
      "optimize-performance": ["Performance Optimizer", "Backend Engineer"],
      "add-tests": ["QA Engineer"],
      "improve-accessibility": ["Frontend Engineer", "Design Engineer"],
      "harden-deployment": ["Reliability Engineer", "Release Manager"],
      "update-docs": ["Documentation Engineer"],
      "improve-caching": ["Backend Engineer", "Performance Optimizer"],
      "patch-api-mismatch": ["Backend Engineer", "QA Engineer"],
      "resolve-incident": ["Reliability Engineer", "Error Fixer"],
      "reduce-drift": ["Frontend Engineer", "Design Engineer"],
      "improve-security": ["Security Reviewer"],
      "custom": ["Engineering Lead"],
    };
    return mapping[type] ?? ["Engineering Lead"];
  }

  private generateRollbackPlan(type: MissionType, cluster: IssueCluster): string {
    if (cluster.blastRadius === "isolated") return "Revert single file change. No cascading effects expected.";
    if (cluster.blastRadius === "component") return "Revert component-level changes. Run regression tests on affected route.";
    if (type === "harden-deployment") return "Automated rollback to previous deployment version.";
    return "Manual rollback with verification. Affected services must be tested post-revert.";
  }
}
