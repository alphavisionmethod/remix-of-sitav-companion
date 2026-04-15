// ═══════════════════════════════════════════════════════════════
// SITA OS — Human Factor Guard
// Step-up auth triggers, blast-radius calculation,
// confirmation ceremonies, anti-fatigue, safe defaults, emergency mode
// ═══════════════════════════════════════════════════════════════

// ── Types ──────────────────────────────────────────────────────

export type ConfirmationLevel = "none" | "simple" | "typed-confirmation" | "biometric" | "dual-approval" | "emergency-override";
export type BlastRadius = "none" | "self" | "team" | "org" | "platform" | "data-loss" | "irrecoverable";

export interface HumanActionRequest {
  actionId: string;
  actionKey: string;
  userId: string;
  description: string;
  riskTier: "low" | "medium" | "high" | "critical";
  domain: string;
  surface: string;
  affectedEntities: AffectedEntity[];
  reversible: boolean;
  estimatedImpact: string;
  metadata: Record<string, unknown>;
}

export interface AffectedEntity {
  type: string;
  id: string;
  name: string;
  impact: "read" | "modify" | "delete" | "create" | "transfer" | "revoke";
}

export interface GuardDecision {
  actionId: string;
  timestamp: string;
  confirmationRequired: ConfirmationLevel;
  stepUpAuthRequired: boolean;
  blastRadius: BlastRadius;
  blastRadiusScore: number;
  warningMessage: string | null;
  impactSummary: string;
  cooldownRequired: boolean;
  cooldownSeconds: number;
  simulationRecommended: boolean;
  requiresJustification: boolean;
  fatigueWarning: boolean;
  safeDefaults: SafeDefault[];
  blockers: string[];
}

export interface SafeDefault {
  field: string;
  safeValue: unknown;
  unsafeValue: unknown;
  reason: string;
}

export interface ConfirmationCeremony {
  id: string;
  actionId: string;
  level: ConfirmationLevel;
  prompt: string;
  typedConfirmationText: string | null;
  expiresAt: string;
  completedAt: string | null;
  result: "pending" | "confirmed" | "rejected" | "expired";
}

export interface FatigueState {
  userId: string;
  confirmationsInLastHour: number;
  confirmationsInLastDay: number;
  lastConfirmationAt: string | null;
  consecutiveApprovals: number;
  fatigueScore: number; // 0-1
  lastResetAt: string;
}

export interface EmergencyMode {
  active: boolean;
  activatedAt: string | null;
  activatedBy: string | null;
  reason: string | null;
  expiresAt: string | null;
  restrictions: string[];
  allowedActions: string[];
}

export interface HumanFactorMetrics {
  totalEvaluations: number;
  confirmationsRequired: number;
  stepUpAuthTriggered: number;
  actionsBlocked: number;
  averageBlastRadiusScore: number;
  fatigueWarningsIssued: number;
  emergencyActivations: number;
  byRiskTier: Record<string, number>;
  byConfirmationLevel: Record<string, number>;
}

// ── Configuration ──────────────────────────────────────────────

interface ActionClassification {
  actionPattern: string;
  riskTier: HumanActionRequest["riskTier"];
  defaultConfirmation: ConfirmationLevel;
  requireJustification: boolean;
  cooldownSeconds: number;
  simulationRecommended: boolean;
}

const ACTION_CLASSIFICATIONS: ActionClassification[] = [
  { actionPattern: "delete.*", riskTier: "critical", defaultConfirmation: "typed-confirmation", requireJustification: true, cooldownSeconds: 30, simulationRecommended: true },
  { actionPattern: "revoke.*", riskTier: "high", defaultConfirmation: "biometric", requireJustification: true, cooldownSeconds: 15, simulationRecommended: true },
  { actionPattern: "transfer.*", riskTier: "high", defaultConfirmation: "biometric", requireJustification: true, cooldownSeconds: 10, simulationRecommended: false },
  { actionPattern: "admin.override.*", riskTier: "critical", defaultConfirmation: "dual-approval", requireJustification: true, cooldownSeconds: 60, simulationRecommended: true },
  { actionPattern: "policy.change.*", riskTier: "high", defaultConfirmation: "typed-confirmation", requireJustification: true, cooldownSeconds: 30, simulationRecommended: true },
  { actionPattern: "update.rollout.*", riskTier: "high", defaultConfirmation: "simple", requireJustification: true, cooldownSeconds: 15, simulationRecommended: true },
  { actionPattern: "trust.downgrade.*", riskTier: "high", defaultConfirmation: "biometric", requireJustification: true, cooldownSeconds: 10, simulationRecommended: false },
  { actionPattern: "device.revoke.*", riskTier: "critical", defaultConfirmation: "biometric", requireJustification: true, cooldownSeconds: 30, simulationRecommended: false },
  { actionPattern: "account.close.*", riskTier: "critical", defaultConfirmation: "dual-approval", requireJustification: true, cooldownSeconds: 120, simulationRecommended: true },
  { actionPattern: "export.data.*", riskTier: "medium", defaultConfirmation: "simple", requireJustification: false, cooldownSeconds: 0, simulationRecommended: false },
];

// ── Engine ─────────────────────────────────────────────────────

export class HumanFactorGuard {
  private fatigueStates: Map<string, FatigueState> = new Map();
  private ceremonies: Map<string, ConfirmationCeremony> = new Map();
  private emergencyMode: EmergencyMode = { active: false, activatedAt: null, activatedBy: null, reason: null, expiresAt: null, restrictions: [], allowedActions: [] };
  private metrics: HumanFactorMetrics = {
    totalEvaluations: 0, confirmationsRequired: 0, stepUpAuthTriggered: 0,
    actionsBlocked: 0, averageBlastRadiusScore: 0, fatigueWarningsIssued: 0,
    emergencyActivations: 0, byRiskTier: {}, byConfirmationLevel: {},
  };
  private ceremonyCounter = 0;

  // ── Core Evaluation ────────────────────────────────────────

  evaluate(request: HumanActionRequest): GuardDecision {
    this.metrics.totalEvaluations++;
    this.metrics.byRiskTier[request.riskTier] = (this.metrics.byRiskTier[request.riskTier] ?? 0) + 1;

    const blockers: string[] = [];

    // Emergency mode check
    if (this.emergencyMode.active) {
      if (!this.emergencyMode.allowedActions.some((a) => request.actionKey.startsWith(a))) {
        blockers.push("Emergency mode active — action not in allowed list");
      }
    }

    // Blast radius calculation
    const { radius, score } = this.calculateBlastRadius(request);

    // Confirmation level
    const classification = this.classifyAction(request.actionKey);
    let confirmationLevel = classification?.defaultConfirmation ?? this.deriveConfirmation(request, score);

    // Escalate if blast radius is extreme
    if (score > 0.8 && confirmationLevel !== "dual-approval") {
      confirmationLevel = "dual-approval";
    }

    // Step-up auth
    const stepUpRequired = request.riskTier === "critical" || score > 0.6 || confirmationLevel === "biometric" || confirmationLevel === "dual-approval";
    if (stepUpRequired) this.metrics.stepUpAuthTriggered++;

    // Fatigue check
    const fatigue = this.getFatigueState(request.userId);
    const fatigueWarning = fatigue.fatigueScore > 0.7;
    if (fatigueWarning) this.metrics.fatigueWarningsIssued++;

    // Cooldown
    const cooldownSeconds = classification?.cooldownSeconds ?? 0;

    // Safe defaults
    const safeDefaults = this.computeSafeDefaults(request);

    if (confirmationLevel !== "none") this.metrics.confirmationsRequired++;
    this.metrics.byConfirmationLevel[confirmationLevel] = (this.metrics.byConfirmationLevel[confirmationLevel] ?? 0) + 1;
    if (blockers.length > 0) this.metrics.actionsBlocked++;

    // Update running average
    this.metrics.averageBlastRadiusScore =
      (this.metrics.averageBlastRadiusScore * (this.metrics.totalEvaluations - 1) + score) / this.metrics.totalEvaluations;

    return {
      actionId: request.actionId,
      timestamp: new Date().toISOString(),
      confirmationRequired: confirmationLevel,
      stepUpAuthRequired: stepUpRequired,
      blastRadius: radius,
      blastRadiusScore: score,
      warningMessage: this.generateWarning(request, radius, score),
      impactSummary: this.generateImpactSummary(request),
      cooldownRequired: cooldownSeconds > 0,
      cooldownSeconds,
      simulationRecommended: classification?.simulationRecommended ?? score > 0.5,
      requiresJustification: classification?.requireJustification ?? request.riskTier !== "low",
      fatigueWarning,
      safeDefaults,
      blockers,
    };
  }

  // ── Confirmation Ceremonies ────────────────────────────────

  createCeremony(actionId: string, level: ConfirmationLevel, prompt: string, typedText?: string): ConfirmationCeremony {
    const ceremony: ConfirmationCeremony = {
      id: `ceremony-${++this.ceremonyCounter}-${Date.now()}`,
      actionId,
      level,
      prompt,
      typedConfirmationText: typedText ?? null,
      expiresAt: new Date(Date.now() + 300_000).toISOString(),
      completedAt: null,
      result: "pending",
    };
    this.ceremonies.set(ceremony.id, ceremony);
    return ceremony;
  }

  completeCeremony(ceremonyId: string, confirmed: boolean, userId: string): boolean {
    const ceremony = this.ceremonies.get(ceremonyId);
    if (!ceremony || ceremony.result !== "pending") return false;
    if (new Date(ceremony.expiresAt) < new Date()) {
      ceremony.result = "expired";
      return false;
    }
    ceremony.result = confirmed ? "confirmed" : "rejected";
    ceremony.completedAt = new Date().toISOString();

    if (confirmed) {
      this.recordConfirmation(userId);
    }

    return confirmed;
  }

  // ── Emergency Mode ─────────────────────────────────────────

  activateEmergencyMode(activatedBy: string, reason: string, durationMs = 3600_000): void {
    this.emergencyMode = {
      active: true,
      activatedAt: new Date().toISOString(),
      activatedBy,
      reason,
      expiresAt: new Date(Date.now() + durationMs).toISOString(),
      restrictions: ["No destructive actions", "No policy changes", "No update rollouts"],
      allowedActions: ["read", "view", "export", "support"],
    };
    this.metrics.emergencyActivations++;
  }

  deactivateEmergencyMode(): void {
    this.emergencyMode = { active: false, activatedAt: null, activatedBy: null, reason: null, expiresAt: null, restrictions: [], allowedActions: [] };
  }

  getEmergencyMode(): EmergencyMode {
    // Auto-expire
    if (this.emergencyMode.active && this.emergencyMode.expiresAt && new Date(this.emergencyMode.expiresAt) < new Date()) {
      this.deactivateEmergencyMode();
    }
    return { ...this.emergencyMode };
  }

  // ── Queries ────────────────────────────────────────────────

  getMetrics(): HumanFactorMetrics {
    return { ...this.metrics };
  }

  getFatigueState(userId: string): FatigueState {
    return this.fatigueStates.get(userId) ?? {
      userId, confirmationsInLastHour: 0, confirmationsInLastDay: 0,
      lastConfirmationAt: null, consecutiveApprovals: 0, fatigueScore: 0,
      lastResetAt: new Date().toISOString(),
    };
  }

  // ── Internal ───────────────────────────────────────────────

  private calculateBlastRadius(request: HumanActionRequest): { radius: BlastRadius; score: number } {
    const entityCount = request.affectedEntities.length;
    const hasDeletes = request.affectedEntities.some((e) => e.impact === "delete");
    const hasRevokes = request.affectedEntities.some((e) => e.impact === "revoke");
    const hasTransfers = request.affectedEntities.some((e) => e.impact === "transfer");

    let score = 0;

    // Entity count contribution
    score += Math.min(entityCount / 100, 0.3);

    // Impact type contributions
    if (hasDeletes) score += 0.3;
    if (hasRevokes) score += 0.2;
    if (hasTransfers) score += 0.15;
    if (!request.reversible) score += 0.25;

    // Risk tier
    const riskWeights: Record<string, number> = { low: 0, medium: 0.1, high: 0.2, critical: 0.3 };
    score += riskWeights[request.riskTier] ?? 0;

    score = Math.min(score, 1);

    let radius: BlastRadius = "none";
    if (score > 0.8) radius = !request.reversible ? "irrecoverable" : "data-loss";
    else if (score > 0.6) radius = "platform";
    else if (score > 0.4) radius = "org";
    else if (score > 0.2) radius = "team";
    else if (score > 0) radius = "self";

    return { radius, score };
  }

  private classifyAction(actionKey: string): ActionClassification | null {
    for (const cls of ACTION_CLASSIFICATIONS) {
      const pattern = cls.actionPattern.replace(/\*/g, ".*");
      if (new RegExp(`^${pattern}$`).test(actionKey)) return cls;
    }
    return null;
  }

  private deriveConfirmation(request: HumanActionRequest, blastScore: number): ConfirmationLevel {
    if (request.riskTier === "critical") return "typed-confirmation";
    if (request.riskTier === "high" || blastScore > 0.5) return "simple";
    if (request.riskTier === "medium") return "simple";
    return "none";
  }

  private generateWarning(request: HumanActionRequest, radius: BlastRadius, score: number): string | null {
    if (score < 0.2) return null;
    const parts: string[] = [];
    if (radius === "irrecoverable") parts.push("⚠️ This action is IRREVERSIBLE.");
    if (radius === "data-loss") parts.push("⚠️ This may result in data loss.");
    if (request.affectedEntities.length > 10) parts.push(`This will affect ${request.affectedEntities.length} entities.`);
    if (!request.reversible) parts.push("Rollback will not be available.");
    return parts.join(" ") || null;
  }

  private generateImpactSummary(request: HumanActionRequest): string {
    const counts: Record<string, number> = {};
    for (const e of request.affectedEntities) {
      counts[e.impact] = (counts[e.impact] ?? 0) + 1;
    }
    const parts = Object.entries(counts).map(([impact, count]) => `${count} ${impact}`);
    return parts.join(", ") || "No direct impact identified";
  }

  private computeSafeDefaults(request: HumanActionRequest): SafeDefault[] {
    const defaults: SafeDefault[] = [];
    if (request.actionKey.includes("delete")) {
      defaults.push({ field: "softDelete", safeValue: true, unsafeValue: false, reason: "Soft delete preserves recovery option" });
      defaults.push({ field: "backupFirst", safeValue: true, unsafeValue: false, reason: "Backup before destructive operation" });
    }
    if (request.actionKey.includes("rollout")) {
      defaults.push({ field: "rolloutPercentage", safeValue: 5, unsafeValue: 100, reason: "Start with canary before full rollout" });
    }
    return defaults;
  }

  private recordConfirmation(userId: string): void {
    const state = this.fatigueStates.get(userId) ?? {
      userId, confirmationsInLastHour: 0, confirmationsInLastDay: 0,
      lastConfirmationAt: null, consecutiveApprovals: 0, fatigueScore: 0,
      lastResetAt: new Date().toISOString(),
    };
    state.confirmationsInLastHour++;
    state.confirmationsInLastDay++;
    state.consecutiveApprovals++;
    state.lastConfirmationAt = new Date().toISOString();
    state.fatigueScore = Math.min(1, (state.confirmationsInLastHour / 20) * 0.5 + (state.consecutiveApprovals / 10) * 0.5);
    this.fatigueStates.set(userId, state);
  }
}

export function createHumanFactorGuard(): HumanFactorGuard {
  return new HumanFactorGuard();
}
