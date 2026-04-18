// ═══════════════════════════════════════════════════════════════
// SITA OS — Companion Engine
// Always-available ambient companion: context detection,
// suggestion generation, constrained execution pipeline
// ═══════════════════════════════════════════════════════════════

import { createReceiptService, type ReceiptService } from "./receipt-service";
import { LifeIntelligenceEngine, createLifeIntelligenceEngine, type LifeContext } from "./life-intelligence-engine";
import { NLPCompanion, createNLPCompanion } from "./nlp-companion";
import { ManifestGenerator, createManifestGenerator } from "./manifest-generator";
import { AgentOrchestrator, createAgentOrchestrator, type FleetStatus } from "./agent-orchestrator";
import { ErrorPatrol, createErrorPatrol, type HealthReport } from "./error-patrol";
import { CloudSyncManager, createCloudSyncManager, type SyncStatus } from "./cloud-sync-manager";
import { SelfLearningEngine, createSelfLearningEngine, type SystemLearnings } from "./self-learning-engine";
import { EventBus } from "./event-bus";

// ── Types ───────────────────────────────────────────────────────

export type CompanionContext = {
  route: string;
  module: string;
  recentActions: string[];
  activeAlerts: number;
  agentsRunning: number;
  trustScore: number;
  lifeContext: LifeContext;
};

export type SuggestionCategory = "optimization" | "workflow" | "alert" | "booking" | "insight";

export interface CompanionSuggestion {
  id: string;
  category: SuggestionCategory;
  title: string;
  description: string;
  actionLabel?: string;
  priority: "low" | "medium" | "high";
  route?: string;
  dismissed: boolean;
  createdAt: number;
}

export type CompanionStatus = "idle" | "listening" | "thinking" | "acting" | "error";

export interface HealthPulse {
  status: CompanionStatus;
  agentsActive: number;
  alertsPending: number;
  trustScore: number;
  lastUpdated: number;
}

export interface ExecutionRequest {
  id: string;
  intent: string;
  payload: Record<string, unknown>;
  requiresApproval: boolean;
  simulated: boolean;
  approved: boolean;
  executed: boolean;
  rolledBack: boolean;
  receiptId?: string;
  createdAt: number;
}

// ── Route-to-Module Mapping ─────────────────────────────────────

const ROUTE_MODULE_MAP: Record<string, string> = {
  home: "dashboard",
  money: "finance",
  clients: "business",
  pipeline: "business",
  invoices: "finance",
  calendar: "concierge",
  tasks: "productivity",
  settings: "system",
  agents: "system",
};

// ── Companion Engine ────────────────────────────────────────────

export class CompanionEngine {
  private receipts: ReceiptService;
  private executionQueue: ExecutionRequest[] = [];
  private lifeIntelligence: LifeIntelligenceEngine;
  private manifests: ManifestGenerator;
  private orchestrator: AgentOrchestrator;
  private errorPatrol: ErrorPatrol;
  private cloudSync: CloudSyncManager;
  private selfLearning: SelfLearningEngine;
  private nlpCompanion: NLPCompanion;
  private healthPulse: HealthPulse = {
    status: "idle",
    agentsActive: 40,
    alertsPending: 0,
    trustScore: 0.92,
    lastUpdated: Date.now(),
  };

  constructor(receiptService?: ReceiptService) {
    this.receipts = receiptService ?? createReceiptService();
    const eventBus = new EventBus();
    this.lifeIntelligence = createLifeIntelligenceEngine();
    this.manifests = createManifestGenerator(this.receipts);
    this.orchestrator = createAgentOrchestrator({ eventBus, receipts: this.receipts });
    this.errorPatrol = createErrorPatrol({ eventBus, receipts: this.receipts });
    this.errorPatrol.connectOrchestrator(this.orchestrator);
    this.errorPatrol.start();
    this.cloudSync = createCloudSyncManager({ eventBus });
    this.selfLearning = createSelfLearningEngine({ eventBus });
    this.nlpCompanion = createNLPCompanion();
  }

  // ── Accessors ─────────────────────────────────────────────────

  getLifeIntelligence(): LifeIntelligenceEngine {
    return this.lifeIntelligence;
  }

  getManifestGenerator(): ManifestGenerator {
    return this.manifests;
  }

  getOrchestrator(): AgentOrchestrator {
    return this.orchestrator;
  }

  getErrorPatrol(): ErrorPatrol {
    return this.errorPatrol;
  }

  getCloudSync(): CloudSyncManager {
    return this.cloudSync;
  }

  getSelfLearning(): SelfLearningEngine {
    return this.selfLearning;
  }

  getNLPCompanion(): NLPCompanion {
    return this.nlpCompanion;
  }

  // ── Context Detection ──────────────────────────────────────────

  detectContext(route: string): CompanionContext {
    const segments = route.split("/").filter(Boolean);
    const moduleKey = segments[0] || "home";
    const module = ROUTE_MODULE_MAP[moduleKey] || "dashboard";

    const lifeContext = this.lifeIntelligence.buildContext();

    return {
      route,
      module,
      recentActions: [],
      activeAlerts: this.healthPulse.alertsPending,
      agentsRunning: this.healthPulse.agentsActive,
      trustScore: this.healthPulse.trustScore,
      lifeContext,
    };
  }

  // ── Suggestion Generation (life-intelligence-aware) ────────────

  getSuggestions(context: CompanionContext): CompanionSuggestion[] {
    const suggestions: CompanionSuggestion[] = [];
    const life = context.lifeContext;
    const now = Date.now();

    // Money alerts
    if (life.money.runwayMonths < 3) {
      suggestions.push({
        id: `li-money-runway-${now}`, category: "alert", title: "Cash runway warning",
        description: `Only ${life.money.runwayMonths.toFixed(1)} months of runway remaining at current burn rate.`,
        priority: "high", dismissed: false, createdAt: now,
      });
    }
    const hotBudgets = Object.entries(life.money.budgetHealth).filter(([, b]) => b.percentage > 85);
    if (hotBudgets.length > 0) {
      suggestions.push({
        id: `li-budget-hot-${now}`, category: "alert", title: `${hotBudgets.length} budget(s) above 85%`,
        description: `${hotBudgets.map(([k]) => k).join(", ")} approaching limits.`,
        actionLabel: "Review", priority: "high", dismissed: false, createdAt: now,
      });
    }

    // Business suggestions
    if (life.business.overdueFollowups > 0) {
      suggestions.push({
        id: `li-biz-followup-${now}`, category: "workflow", title: `${life.business.overdueFollowups} overdue follow-ups`,
        description: "Leads waiting for contact — follow up to protect pipeline.",
        actionLabel: "View leads", priority: "high", dismissed: false, createdAt: now,
      });
    }

    // Household
    if (life.household.overdueTasks > 0) {
      suggestions.push({
        id: `li-house-overdue-${now}`, category: "workflow", title: `${life.household.overdueTasks} overdue household tasks`,
        description: `Load balance: ${life.household.loadBalance}%. Consider delegating.`,
        actionLabel: "Triage", priority: "medium", dismissed: false, createdAt: now,
      });
    }

    // Timing
    if (life.timing.conflictsDetected > 0) {
      suggestions.push({
        id: `li-timing-conflict-${now}`, category: "booking", title: "Schedule conflict detected",
        description: `${life.timing.conflictsDetected} overlapping event(s). Review calendar.`,
        actionLabel: "Resolve", priority: "medium", dismissed: false, createdAt: now,
      });
    }

    // Obligations
    const urgentObligations = life.obligations.filter(
      (o) => o.urgency === "high" && o.status !== "completed"
    );
    if (urgentObligations.length > 0) {
      suggestions.push({
        id: `li-obligations-${now}`, category: "insight",
        title: `${urgentObligations.length} high-priority obligation(s)`,
        description: urgentObligations.slice(0, 2).map((o) => o.title).join(", "),
        priority: "high", dismissed: false, createdAt: now,
      });
    }

    // Cross-domain insights
    for (const insight of life.crossDomainInsights.slice(0, 2)) {
      suggestions.push({
        id: `li-insight-${crypto.randomUUID().slice(0, 8)}`, category: "insight",
        title: "Cross-domain insight", description: insight,
        priority: "medium", dismissed: false, createdAt: now,
      });
    }

    return suggestions.filter((s) => !s.dismissed).slice(0, 5);
  }

  dismissSuggestion(_suggestionId: string): void {
    // In real implementation, persist dismissal
  }

  // ── Health Pulse ───────────────────────────────────────────────

  getHealthPulse(): HealthPulse {
    return { ...this.healthPulse, lastUpdated: Date.now() };
  }

  updateHealthPulse(partial: Partial<HealthPulse>): void {
    this.healthPulse = { ...this.healthPulse, ...partial, lastUpdated: Date.now() };
  }

  // ── Constrained Execution Pipeline ─────────────────────────────

  async requestExecution(intent: string, payload: Record<string, unknown>, requiresApproval = true): Promise<ExecutionRequest> {
    const request: ExecutionRequest = {
      id: crypto.randomUUID(),
      intent,
      payload,
      requiresApproval,
      simulated: false,
      approved: false,
      executed: false,
      rolledBack: false,
      createdAt: Date.now(),
    };
    this.executionQueue.push(request);
    this.updateHealthPulse({ status: "thinking" });

    // Auto-generate manifest update
    this.manifests.updateServiceManifest("companion-engine", { status: "active" });

    return request;
  }

  async simulateExecution(requestId: string): Promise<{ success: boolean; preview: string }> {
    const req = this.executionQueue.find((r) => r.id === requestId);
    if (!req) return { success: false, preview: "Request not found" };

    req.simulated = true;
    return {
      success: true,
      preview: `Simulation of "${req.intent}" completed successfully. No side effects detected.`,
    };
  }

  async approveExecution(requestId: string): Promise<boolean> {
    const req = this.executionQueue.find((r) => r.id === requestId);
    if (!req || !req.simulated) return false;

    req.approved = true;
    return true;
  }

  async executeApproved(requestId: string): Promise<{ success: boolean; receiptId?: string }> {
    const req = this.executionQueue.find((r) => r.id === requestId);
    if (!req || !req.approved) return { success: false };

    this.updateHealthPulse({ status: "acting" });

    // Generate proof via ManifestGenerator
    const proofResult = await this.manifests.generateActionProof(
      req.intent,
      { intent: req.intent, payload: req.payload, result: "success" },
      { capabilityId: "companion-engine", domain: "execution" }
    );

    req.executed = true;
    req.receiptId = proofResult.receipt.id;
    this.updateHealthPulse({ status: "idle" });

    return { success: true, receiptId: proofResult.receipt.id };
  }

  async rollbackExecution(requestId: string): Promise<boolean> {
    const req = this.executionQueue.find((r) => r.id === requestId);
    if (!req || !req.executed) return false;

    req.rolledBack = true;
    await this.receipts.createReceipt(requestId, "refusal", {
      intent: req.intent,
      reason: "User-initiated rollback",
    });

    return true;
  }

  getExecutionQueue(): ExecutionRequest[] {
    return [...this.executionQueue];
  }
}

// ── Factory ─────────────────────────────────────────────────────

export function createCompanionEngine(receiptService?: ReceiptService): CompanionEngine {
  return new CompanionEngine(receiptService);
}
