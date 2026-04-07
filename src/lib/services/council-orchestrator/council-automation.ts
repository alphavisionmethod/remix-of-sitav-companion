// ═══════════════════════════════════════════════════════════════
// SITA OS — Council Automation Service
// Auto-escalation rules engine for 4 council types
// ═══════════════════════════════════════════════════════════════

import type { DomainId } from "@/packages/contracts";
import { CouncilOrchestratorService, type CouncilMember, type VotingPolicy } from "./index";

// ── Types ──

export interface EscalationEvent {
  type: string;
  severity?: string;
  servicesAffected?: string[];
  threatScore?: number;
  amount?: number;
  domain?: DomainId;
  errorRate?: number;
  mttrMinutes?: number;
  isUnauthorizedAccess?: boolean;
  recentDeployment?: boolean;
  metadata?: Record<string, unknown>;
}

export interface EscalationRule {
  id: string;
  councilId: string;
  councilName: string;
  description: string;
  priority: "critical" | "high" | "medium" | "low";
  autoConvene: boolean;
  evaluate: (event: EscalationEvent) => boolean;
}

export interface EscalationResult {
  eventType: string;
  matchedRules: Array<{ ruleId: string; councilId: string; councilName: string; priority: string; reason: string }>;
  sessionsCreated: string[];
  timestamp: string;
}

// ── Default council members ──

const BUILD_COUNCIL_MEMBERS: CouncilMember[] = [
  { id: "agent-ux-guardian", name: "UX Guardian", role: "advisor", domain: "business" as DomainId, weight: 1, voted: false },
  { id: "agent-design-linter", name: "Design System Linter", role: "advisor", domain: "business" as DomainId, weight: 1, voted: false },
  { id: "supervisor-build", name: "Build Supervisor", role: "supervisor", domain: "business" as DomainId, weight: 2, voted: false },
];

const OPS_COUNCIL_MEMBERS: CouncilMember[] = [
  { id: "agent-uptime-sentinel", name: "Uptime Sentinel", role: "advisor", domain: "concierge" as DomainId, weight: 1, voted: false },
  { id: "agent-recovery-planner", name: "Recovery Planner", role: "advisor", domain: "concierge" as DomainId, weight: 1, voted: false },
  { id: "supervisor-ops", name: "Ops Supervisor", role: "supervisor", domain: "concierge" as DomainId, weight: 2, voted: false },
];

const SECURITY_COUNCIL_MEMBERS: CouncilMember[] = [
  { id: "agent-threat-detector", name: "Threat Detector", role: "advisor", domain: "finance" as DomainId, weight: 1, voted: false },
  { id: "agent-anomaly-watcher", name: "Anomaly Watcher", role: "advisor", domain: "finance" as DomainId, weight: 1, voted: false },
  { id: "supervisor-security", name: "Security Supervisor", role: "supervisor", domain: "finance" as DomainId, weight: 2, voted: false },
];

const FINANCIAL_COUNCIL_MEMBERS: CouncilMember[] = [
  { id: "agent-budget-tracker", name: "Budget Tracker", role: "advisor", domain: "finance" as DomainId, weight: 1, voted: false },
  { id: "agent-waste-detector", name: "Waste Detector", role: "advisor", domain: "finance" as DomainId, weight: 1, voted: false },
  { id: "supervisor-financial", name: "Financial Supervisor", role: "supervisor", domain: "finance" as DomainId, weight: 2, voted: false },
];

// ── Rules ──

const ESCALATION_RULES: EscalationRule[] = [
  // Build Council
  {
    id: "build-sev1-brain",
    councilId: "build",
    councilName: "Build Council",
    description: "SEV-1 incident affecting brain-core",
    priority: "critical",
    autoConvene: true,
    evaluate: (e) => e.severity === "SEV-1" && (e.servicesAffected || []).some(s => s.includes("brain-core")),
  },
  {
    id: "build-deploy-errors",
    councilId: "build",
    councilName: "Build Council",
    description: "Recent deployment with high error rate",
    priority: "high",
    autoConvene: true,
    evaluate: (e) => !!e.recentDeployment && (e.errorRate || 0) > 0.1,
  },

  // Ops Council
  {
    id: "ops-multi-service",
    councilId: "ops",
    councilName: "Ops Council",
    description: "Incident affects more than 2 services",
    priority: "high",
    autoConvene: true,
    evaluate: (e) => (e.servicesAffected || []).length > 2,
  },
  {
    id: "ops-mttr-breach",
    councilId: "ops",
    councilName: "Ops Council",
    description: "MTTR exceeds 1 hour",
    priority: "high",
    autoConvene: false,
    evaluate: (e) => (e.mttrMinutes || 0) > 60,
  },

  // Security Council
  {
    id: "security-threat-high",
    councilId: "security",
    councilName: "Security Council",
    description: "Threat score exceeds 7.5",
    priority: "critical",
    autoConvene: true,
    evaluate: (e) => (e.threatScore || 0) > 7.5,
  },
  {
    id: "security-unauthorized",
    councilId: "security",
    councilName: "Security Council",
    description: "Unauthorized access attempt detected",
    priority: "critical",
    autoConvene: true,
    evaluate: (e) => !!e.isUnauthorizedAccess,
  },

  // Financial Council
  {
    id: "financial-dual-approval",
    councilId: "financial",
    councilName: "Financial Council",
    description: "Transaction exceeds dual approval threshold ($10,000)",
    priority: "high",
    autoConvene: false,
    evaluate: (e) => (e.amount || 0) > 10000,
  },
  {
    id: "financial-unusual-spending",
    councilId: "financial",
    councilName: "Financial Council",
    description: "Unusual spending pattern detected",
    priority: "medium",
    autoConvene: false,
    evaluate: (e) => e.type === "unusual_spending",
  },
];

// ── Council member lookup ──

const COUNCIL_MEMBERS: Record<string, { members: CouncilMember[]; votingPolicy: VotingPolicy }> = {
  build: { members: BUILD_COUNCIL_MEMBERS, votingPolicy: "majority" },
  ops: { members: OPS_COUNCIL_MEMBERS, votingPolicy: "majority" },
  security: { members: SECURITY_COUNCIL_MEMBERS, votingPolicy: "unanimous" },
  financial: { members: FINANCIAL_COUNCIL_MEMBERS, votingPolicy: "supervisor-override" },
};

// ── Service ──

export class CouncilAutomationService {
  private recentEscalations: Map<string, number> = new Map();
  private readonly deduplicationWindowMs = 5 * 60 * 1000; // 5 minutes

  constructor(private orchestrator: CouncilOrchestratorService) {}

  evaluate(event: EscalationEvent): EscalationResult {
    const matchedRules: EscalationResult["matchedRules"] = [];
    const sessionsCreated: string[] = [];

    for (const rule of ESCALATION_RULES) {
      if (rule.evaluate(event)) {
        // Deduplication: skip if same rule fired within window
        const dedupeKey = `${rule.id}-${event.type}`;
        const lastFired = this.recentEscalations.get(dedupeKey);
        if (lastFired && Date.now() - lastFired < this.deduplicationWindowMs) continue;

        matchedRules.push({
          ruleId: rule.id,
          councilId: rule.councilId,
          councilName: rule.councilName,
          priority: rule.priority,
          reason: rule.description,
        });

        // Auto-convene council session
        if (rule.autoConvene) {
          const config = COUNCIL_MEMBERS[rule.councilId];
          if (config) {
            const session = this.orchestrator.convene(
              rule.councilId,
              `[Auto-Escalated] ${rule.description}: ${event.type}`,
              event.domain || ("ops" as DomainId),
              config.members.map(m => ({ ...m, voted: false })),
              config.votingPolicy,
            );
            sessionsCreated.push(session.id);
          }
        }

        this.recentEscalations.set(dedupeKey, Date.now());
      }
    }

    // Clean old deduplication entries
    const now = Date.now();
    for (const [key, time] of this.recentEscalations) {
      if (now - time > this.deduplicationWindowMs) this.recentEscalations.delete(key);
    }

    return {
      eventType: event.type,
      matchedRules,
      sessionsCreated,
      timestamp: new Date().toISOString(),
    };
  }

  getRules(): EscalationRule[] {
    return [...ESCALATION_RULES];
  }

  getCouncilConfig(councilId: string) {
    return COUNCIL_MEMBERS[councilId] || null;
  }
}

export function createCouncilAutomation(orchestrator: CouncilOrchestratorService): CouncilAutomationService {
  return new CouncilAutomationService(orchestrator);
}

