// ═══════════════════════════════════════════════════════════════
// SITA OS — Trust-Weighted Action System
// Unified framework for multi-surface trust-based action routing
// ═══════════════════════════════════════════════════════════════

import { loadServiceState, debouncedSaveServiceState } from "@/lib/persistence/universal-service-persistence";
import type { RiskTier, DomainId, ApprovalType } from "@/packages/contracts/_contract-scaffold";

// ── Types ────────────────────────────────────────────────────────

export type ActionExecutionMode = "auto" | "queued" | "wearable_confirm" | "mobile_confirm" | "desktop_confirm" | "biometric_confirm" | "boardroom_review" | "simulation_only" | "blocked";

export type DeviceTrustLevel = "high" | "medium" | "low" | "untrusted";

export interface ActionEvaluation {
  actionId: string;
  executionMode: ActionExecutionMode;
  confirmationSurface: string | null;
  approvalRequired: boolean;
  approvalType: ApprovalType;
  riskTier: RiskTier;
  trustScore: number;
  deviceTrust: DeviceTrustLevel;
  reasons: string[];
  alternatives: ActionExecutionMode[];
  canSimulate: boolean;
  estimatedRisk: number;      // 0–100
}

export interface TrustWeightedAction {
  id: string;
  name: string;
  domain: DomainId;
  riskTier: RiskTier;
  monetaryValue?: number;
  affectsExternalSystems: boolean;
  reversible: boolean;
  requiresBiometric: boolean;
  minDeviceTrust: DeviceTrustLevel;
  cooldownMs?: number;
  maxAutoFrequency?: number;   // per hour
}

export interface DeviceContext {
  deviceId: string;
  surface: string;
  trustLevel: DeviceTrustLevel;
  hasBiometric: boolean;
  hasKeyboard: boolean;
  lastAuthAt: string;
  sessionAge: number;          // minutes
}

export interface UserTrustContext {
  userId: string;
  overallTrustScore: number;   // 0–100
  recentViolations: number;
  accountAge: number;          // days
  verifiedIdentity: boolean;
  mfaEnabled: boolean;
}

export interface ActionPolicyOverride {
  actionPattern: string;       // glob or regex
  domain?: DomainId;
  forceMode?: ActionExecutionMode;
  reason: string;
  expiresAt?: string;
}

// ── Trust Matrix ─────────────────────────────────────────────────

const DEVICE_TRUST_ORDER: DeviceTrustLevel[] = ["untrusted", "low", "medium", "high"];

function deviceTrustMeetsMin(actual: DeviceTrustLevel, minimum: DeviceTrustLevel): boolean {
  return DEVICE_TRUST_ORDER.indexOf(actual) >= DEVICE_TRUST_ORDER.indexOf(minimum);
}

function riskToBaseScore(risk: RiskTier): number {
  switch (risk) { case "standard": return 20; case "elevated": return 50; case "critical": return 85; }
}

// ── Service ──────────────────────────────────────────────────────

export class TrustWeightedActionService {
  private actions: Map<string, TrustWeightedAction> = new Map();
  private overrides: ActionPolicyOverride[] = [];
  private executionLog: { actionId: string; mode: ActionExecutionMode; timestamp: string; surface: string }[] = [];

  // ── Action Registry ────────────────────────────────────────

  registerAction(action: TrustWeightedAction): void {
    this.actions.set(action.id, action);
    this._persist();
  }

  removeAction(id: string): void {
    this.actions.delete(id);
    this._persist();
  }

  addOverride(override: ActionPolicyOverride): void {
    this.overrides.push(override);
    this._persist();
  }

  removeExpiredOverrides(): number {
    const now = new Date().toISOString();
    const before = this.overrides.length;
    this.overrides = this.overrides.filter(o => !o.expiresAt || o.expiresAt > now);
    this._persist();
    return before - this.overrides.length;
  }

  // ── Core Evaluation ────────────────────────────────────────

  evaluateAction(actionId: string, device: DeviceContext, user: UserTrustContext): ActionEvaluation {
    const action = this.actions.get(actionId);
    if (!action) {
      return this.buildBlockedEval(actionId, "Action not registered", device.trustLevel);
    }

    // Check overrides first
    const override = this.findOverride(actionId, action.domain);
    if (override?.forceMode) {
      return this.buildEval(actionId, override.forceMode, action, device, user, [`Override: ${override.reason}`]);
    }

    const reasons: string[] = [];
    let riskScore = riskToBaseScore(action.riskTier);

    // Device trust check
    if (!deviceTrustMeetsMin(device.trustLevel, action.minDeviceTrust)) {
      reasons.push(`Device trust (${device.trustLevel}) below minimum (${action.minDeviceTrust})`);
      riskScore += 20;
    }

    // Biometric requirement
    if (action.requiresBiometric && !device.hasBiometric) {
      reasons.push("Biometric required but not available on this device");
      return this.buildEval(actionId, "mobile_confirm", action, device, user, reasons);
    }

    // Monetary threshold
    if (action.monetaryValue && action.monetaryValue > 1000) {
      riskScore += Math.min(30, Math.floor(action.monetaryValue / 500));
      reasons.push(`High monetary value: $${action.monetaryValue}`);
    }

    // External system impact
    if (action.affectsExternalSystems) {
      riskScore += 15;
      reasons.push("Affects external systems");
    }

    // User trust adjustments
    if (user.recentViolations > 0) {
      riskScore += user.recentViolations * 10;
      reasons.push(`${user.recentViolations} recent violations`);
    }
    if (!user.mfaEnabled) {
      riskScore += 10;
      reasons.push("MFA not enabled");
    }

    // Session age
    if (device.sessionAge > 240) {
      riskScore += 10;
      reasons.push("Session older than 4 hours");
    }

    // Cooldown check
    if (action.cooldownMs) {
      const recent = this.executionLog.filter(e => e.actionId === actionId && Date.now() - new Date(e.timestamp).getTime() < action.cooldownMs!);
      if (recent.length > 0) {
        reasons.push("Action in cooldown period");
        riskScore += 25;
      }
    }

    // Frequency check
    if (action.maxAutoFrequency) {
      const hourAgo = Date.now() - 3600_000;
      const recentCount = this.executionLog.filter(e => e.actionId === actionId && new Date(e.timestamp).getTime() > hourAgo).length;
      if (recentCount >= action.maxAutoFrequency) {
        reasons.push("Auto frequency limit reached");
        riskScore += 20;
      }
    }

    // Determine execution mode based on risk score
    const mode = this.riskScoreToMode(riskScore, device, action);
    if (reasons.length === 0) reasons.push("Standard trust evaluation passed");

    return this.buildEval(actionId, mode, action, device, user, reasons);
  }

  // ── Mode Resolution ────────────────────────────────────────

  private riskScoreToMode(score: number, device: DeviceContext, action: TrustWeightedAction): ActionExecutionMode {
    if (score >= 90) return action.reversible ? "boardroom_review" : "blocked";
    if (score >= 75) return device.hasBiometric ? "biometric_confirm" : "desktop_confirm";
    if (score >= 60) return "desktop_confirm";
    if (score >= 45) return "mobile_confirm";
    if (score >= 30) return "queued";
    return "auto";
  }

  private buildEval(actionId: string, mode: ActionExecutionMode, action: TrustWeightedAction, device: DeviceContext, user: UserTrustContext, reasons: string[]): ActionEvaluation {
    const confirmSurface = mode.includes("confirm") ? mode.replace("_confirm", "") : mode === "boardroom_review" ? "boardroom" : null;
    return {
      actionId, executionMode: mode,
      confirmationSurface: confirmSurface,
      approvalRequired: mode === "boardroom_review" || mode === "blocked",
      approvalType: mode === "boardroom_review" ? "dual" : mode === "blocked" ? "owner-only" : "none",
      riskTier: action.riskTier,
      trustScore: user.overallTrustScore,
      deviceTrust: device.trustLevel,
      reasons,
      alternatives: this.getAlternativeModes(mode),
      canSimulate: action.reversible || action.riskTier === "standard",
      estimatedRisk: Math.min(100, riskToBaseScore(action.riskTier) + (100 - user.overallTrustScore) / 2),
    };
  }

  private buildBlockedEval(actionId: string, reason: string, deviceTrust: DeviceTrustLevel): ActionEvaluation {
    return {
      actionId, executionMode: "blocked", confirmationSurface: null,
      approvalRequired: true, approvalType: "owner-only", riskTier: "critical",
      trustScore: 0, deviceTrust, reasons: [reason],
      alternatives: [], canSimulate: false, estimatedRisk: 100,
    };
  }

  private getAlternativeModes(current: ActionExecutionMode): ActionExecutionMode[] {
    const all: ActionExecutionMode[] = ["auto", "queued", "wearable_confirm", "mobile_confirm", "desktop_confirm", "biometric_confirm", "boardroom_review"];
    const idx = all.indexOf(current);
    return idx >= 0 ? all.slice(Math.max(0, idx - 1), idx + 2).filter(m => m !== current) : [];
  }

  private findOverride(actionId: string, domain: DomainId): ActionPolicyOverride | undefined {
    const now = new Date().toISOString();
    return this.overrides.find(o => {
      if (o.expiresAt && o.expiresAt < now) return false;
      if (o.domain && o.domain !== domain) return false;
      return actionId.includes(o.actionPattern) || new RegExp(o.actionPattern).test(actionId);
    });
  }

  // ── Execution Logging ──────────────────────────────────────

  recordExecution(actionId: string, mode: ActionExecutionMode, surface: string): void {
    this.executionLog.push({ actionId, mode, timestamp: new Date().toISOString(), surface });
    if (this.executionLog.length > 500) this.executionLog.shift();
    this._persist();
  }

  getRecentExecutions(limit = 20): typeof this.executionLog { return this.executionLog.slice(-limit); }

  getStats(): { totalActions: number; totalExecutions: number; byMode: Record<string, number> } {
    const byMode: Record<string, number> = {};
    for (const e of this.executionLog) byMode[e.mode] = (byMode[e.mode] ?? 0) + 1;
    return { totalActions: this.actions.size, totalExecutions: this.executionLog.length, byMode };
  }

  // ── Persistence ────────────────────────────────────────────

  private _persist = () => debouncedSaveServiceState("trust-weighted-actions", this.serialize());
  serialize(): Record<string, unknown> { return { actions: Array.from(this.actions.entries()), overrides: this.overrides, executionLog: this.executionLog.slice(-200) }; }
  hydrate(state: Record<string, unknown>): void {
    if (!state) return;
    if (state.actions) this.actions = new Map(state.actions as [string, TrustWeightedAction][]);
    if (state.overrides) this.overrides = state.overrides as ActionPolicyOverride[];
    if (state.executionLog) this.executionLog = state.executionLog as typeof this.executionLog;
  }
  async loadPersistedState(): Promise<void> { const s = await loadServiceState("trust-weighted-actions"); if (s) this.hydrate(s as Record<string, unknown>); }
}

export const createTrustWeightedActions = () => new TrustWeightedActionService();
