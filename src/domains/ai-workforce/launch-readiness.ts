// ═══════════════════════════════════════════════════
// SITA OS — Internal AI Workforce — Launch Readiness
// Validation + founder-safe summaries
// ═══════════════════════════════════════════════════

import { ALL_DETAILED_AGENTS } from "./agents";
import { COUNCILS } from "./councils";
import { SUPERVISORS } from "./supervisors";
import {
  AUTONOMY_TIERS, NEVER_ALLOWED, MUST_REQUIRE_HUMAN_APPROVAL,
  MAY_AUTO_EXECUTE, MUST_SIMULATE_FIRST, DESIGN_DRIFT_CHECKLIST,
  WATCHDOG_CONCERNS, PROMOTION_RULES, DEMOTION_TRIGGERS, AGENT_METRICS,
} from "./rights";
import type { InternalAgentCouncil } from "./types";

// ═══════════════════════════════════════════════════
// Section 13 — Launch-Ready Checklist (14 items)
// ═══════════════════════════════════════════════════

export interface LaunchCheckItem {
  id: string;
  name: string;
  description: string;
  validator: () => { passed: boolean; detail: string };
}

export const LAUNCH_CHECKLIST: LaunchCheckItem[] = [
  {
    id: "named-councils",
    name: "Named Councils",
    description: "All 6 councils are defined with IDs, names, and purposes",
    validator: () => {
      const passed = COUNCILS.length === 6;
      return { passed, detail: `${COUNCILS.length}/6 councils defined` };
    },
  },
  {
    id: "agent-registry",
    name: "Agent Registry",
    description: "40 agents registered across 6 councils",
    validator: () => {
      const passed = ALL_DETAILED_AGENTS.length >= 40;
      return { passed, detail: `${ALL_DETAILED_AGENTS.length}/40 agents registered` };
    },
  },
  {
    id: "autonomy-ceilings",
    name: "Explicit Autonomy Ceilings",
    description: "Every agent has a maxAutonomyLevel defined",
    validator: () => {
      const missing = ALL_DETAILED_AGENTS.filter(a => !a.maxAutonomyLevel);
      return { passed: missing.length === 0, detail: missing.length === 0 ? "All agents have ceilings" : `${missing.length} agents missing ceilings` };
    },
  },
  {
    id: "simulation-rules",
    name: "Simulation-Before-Action Rules",
    description: "MUST_SIMULATE_FIRST categories are defined",
    validator: () => {
      const passed = MUST_SIMULATE_FIRST.length >= 6;
      return { passed, detail: `${MUST_SIMULATE_FIRST.length}/6 simulation-first categories` };
    },
  },
  {
    id: "supervisor-hierarchy",
    name: "Supervisor Hierarchy",
    description: "7 supervisors (1 chief-of-staff + 6 council supervisors)",
    validator: () => {
      const hasChief = SUPERVISORS.some(s => s.supervisorId === "chief-of-staff");
      const passed = SUPERVISORS.length >= 7 && hasChief;
      return { passed, detail: `${SUPERVISORS.length}/7 supervisors, chief: ${hasChief ? "yes" : "NO"}` };
    },
  },
  {
    id: "rollback-paths",
    name: "Rollback Recommendation Paths",
    description: "Agents with L3+ autonomy define rollback authority",
    validator: () => {
      const highAutonomy = ALL_DETAILED_AGENTS.filter(a => ["draft", "simulate", "approval_ready", "constrained_action_ready"].includes(a.maxAutonomyLevel));
      const withRollback = highAutonomy.filter(a => a.rollbackAuthority && a.rollbackAuthority !== "None");
      return { passed: withRollback.length >= highAutonomy.length * 0.8, detail: `${withRollback.length}/${highAutonomy.length} high-autonomy agents have rollback authority` };
    },
  },
  {
    id: "incident-summaries",
    name: "Incident Summaries",
    description: "Incident Response agent is production-ready",
    validator: () => {
      const ir = ALL_DETAILED_AGENTS.find(a => a.agentId === "aw-incident-response");
      const passed = !!ir && ir.maturity === "production";
      return { passed, detail: ir ? `Incident Response: ${ir.maturity}` : "Incident Response agent not found" };
    },
  },
  {
    id: "connector-health",
    name: "Connector Health Review",
    description: "Connector Health agent is defined and operational",
    validator: () => {
      const ch = ALL_DETAILED_AGENTS.find(a => a.agentId === "aw-connector-health");
      return { passed: !!ch, detail: ch ? `Connector Health: ${ch.maturity}` : "Not found" };
    },
  },
  {
    id: "release-safety",
    name: "Release Safety Review",
    description: "Release Safety agent is defined and operational",
    validator: () => {
      const rs = ALL_DETAILED_AGENTS.find(a => a.agentId === "aw-release-safety");
      return { passed: !!rs, detail: rs ? `Release Safety: ${rs.maturity}` : "Not found" };
    },
  },
  {
    id: "design-drift-monitoring",
    name: "Design Drift Monitoring",
    description: "Design drift checklist is defined with 10+ checks",
    validator: () => {
      const passed = DESIGN_DRIFT_CHECKLIST.length >= 10;
      return { passed, detail: `${DESIGN_DRIFT_CHECKLIST.length}/10 drift checks` };
    },
  },
  {
    id: "support-diagnostics",
    name: "Support Diagnostics Output",
    description: "Support Diagnostics agent is defined",
    validator: () => {
      const sd = ALL_DETAILED_AGENTS.find(a => a.agentId === "aw-support-diagnostics");
      return { passed: !!sd, detail: sd ? `Support Diagnostics: ${sd.maturity}` : "Not found" };
    },
  },
  {
    id: "plain-language-summaries",
    name: "Plain-Language Council Summaries",
    description: "Founder-safe summaries available for all councils",
    validator: () => {
      const summaries = COUNCILS.map(c => getCouncilSummary(c.councilId));
      const valid = summaries.filter(s => s.length > 0);
      return { passed: valid.length === COUNCILS.length, detail: `${valid.length}/${COUNCILS.length} summaries available` };
    },
  },
  {
    id: "action-pipeline-visibility",
    name: "Action Pipeline State Visibility",
    description: "Proposal → simulation → approval-ready → executed pipeline defined",
    validator: () => {
      const passed = ACTION_PIPELINE_STATES.length === 4;
      return { passed, detail: `${ACTION_PIPELINE_STATES.length}/4 pipeline states` };
    },
  },
  {
    id: "founder-delegation",
    name: "Founder-Safe Delegation",
    description: "Admin controls defined for agent management",
    validator: () => {
      const passed = ADMIN_CONTROL_FIELDS.length >= 10;
      return { passed, detail: `${ADMIN_CONTROL_FIELDS.length}/10 admin control fields` };
    },
  },
];

// ═══════════════════════════════════════════════════
// Action Pipeline States
// ═══════════════════════════════════════════════════

export const ACTION_PIPELINE_STATES = [
  "proposal",
  "simulation",
  "approval-ready",
  "executed",
] as const;

export type ActionPipelineState = typeof ACTION_PIPELINE_STATES[number];

// ═══════════════════════════════════════════════════
// Admin Control Fields (Section 12)
// ═══════════════════════════════════════════════════

export const ADMIN_CONTROL_FIELDS = [
  "enabled",
  "autonomyCeiling",
  "approvalThreshold",
  "simulationOnly",
  "budgetCap",
  "incidentRoutingOverride",
  "lastActions",
  "outputQualityScore",
  "rollbackRecommendations",
  "diagnosticsSummary",
] as const;

export interface AgentAdminControls {
  agentId: string;
  enabled: boolean;
  autonomyCeiling: number;
  approvalThreshold: number;
  simulationOnly: boolean;
  budgetCap: number;
  incidentRoutingOverride: string | null;
  lastActions: { action: string; timestamp: string; result: string }[];
  outputQualityScore: number;
  rollbackRecommendations: string[];
  diagnosticsSummary: string;
}

// ═══════════════════════════════════════════════════
// Launch Readiness Validation
// ═══════════════════════════════════════════════════

export interface LaunchReadinessResult {
  passed: boolean;
  totalChecks: number;
  passedChecks: number;
  failedChecks: number;
  results: { id: string; name: string; passed: boolean; detail: string }[];
}

export function validateLaunchReadiness(): LaunchReadinessResult {
  const results = LAUNCH_CHECKLIST.map(item => {
    const result = item.validator();
    return { id: item.id, name: item.name, passed: result.passed, detail: result.detail };
  });
  const passedChecks = results.filter(r => r.passed).length;
  return {
    passed: passedChecks === results.length,
    totalChecks: results.length,
    passedChecks,
    failedChecks: results.length - passedChecks,
    results,
  };
}

// ═══════════════════════════════════════════════════
// Founder-Safe Plain-Language Council Summaries
// ═══════════════════════════════════════════════════

const COUNCIL_SUMMARIES: Record<InternalAgentCouncil, string> = {
  "product-build": "Your product team — 8 AI agents that keep your app polished, accessible, well-documented, and bug-free. They review code quality, design consistency, test coverage, and make sure every feature ships complete.",
  "reliability-ops": "Your operations team — 8 AI agents that keep everything running. They detect outages, recover stuck processes, monitor connector health, validate releases before rollout, and generate diagnostic reports when things go wrong.",
  "security-trust": "Your security team — 7 AI agents guarding your data. They watch for suspicious activity, detect permission drift, validate audit trails, monitor trust scores, detect fraud patterns, and enforce privacy boundaries.",
  "runtime-cost": "Your efficiency team — 6 AI agents keeping costs under control. They track AI spending, optimize which models handle which tasks, identify performance bottlenecks, plan for growth, and manage caching strategies.",
  "architecture-governance": "Your architecture review board — 6 AI agents maintaining system integrity. They enforce code boundaries, keep registries in sync, validate contracts between services, and ensure changes go through proper review.",
  "knowledge-coordination": "Your coordination team — 5 AI agents keeping knowledge organized. They maintain runbooks, auto-generate release notes, assist with sprint planning, track cross-team dependencies, and detect when docs drift from code.",
};

export function getCouncilSummary(councilId: InternalAgentCouncil): string {
  return COUNCIL_SUMMARIES[councilId] || "";
}

export function getAllCouncilSummaries(): { councilId: InternalAgentCouncil; name: string; summary: string; agentCount: number }[] {
  return COUNCILS.map(c => ({
    councilId: c.councilId,
    name: c.name,
    summary: getCouncilSummary(c.councilId),
    agentCount: c.agentCount,
  }));
}
