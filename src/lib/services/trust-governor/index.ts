// ═══════════════════════════════════════════════════════════════
// SITA OS — Trust Governor Service
// Policy enforcement + receipt verification for trust decisions
// ═══════════════════════════════════════════════════════════════

import type { TrustProfile, TrustStateEvent, TrustRecoveryPlan, TrustRecoveryAction, TrustStateDimension, TrustStatePosture } from "@/packages/contracts/domain-types/trust-state";
import type { CorrelationContext } from "@/packages/contracts";

export type { TrustProfile, TrustStateEvent, TrustRecoveryPlan, TrustRecoveryAction, TrustStateDimension, TrustStatePosture };

export interface TrustEvaluationRequest {
  entityId: string;
  entityType: TrustStateEvent["entityType"];
  action: string;
  domain: string;
  riskTier: "standard" | "elevated" | "critical";
  correlation: CorrelationContext;
  tenantId: string;
}

export interface TrustEvaluationResult {
  allowed: boolean;
  entityId: string;
  currentScore: number;
  posture: TrustStatePosture;
  requiredScore: number;
  reason: string;
  conditions?: string[];
  receiptId?: string;
}

const RISK_SCORE_REQUIREMENTS: Record<string, number> = {
  standard: 30,
  elevated: 60,
  critical: 85,
};

const POSTURE_FROM_SCORE = (score: number): TrustStatePosture => {
  if (score >= 90) return "hardened";
  if (score >= 60) return "normal";
  if (score >= 30) return "elevated-risk";
  return "lockdown";
};

export class TrustGovernorService {
  private profiles: Map<string, TrustProfile> = new Map();
  private events: TrustStateEvent[] = [];

  evaluate(request: TrustEvaluationRequest): TrustEvaluationResult {
    const profile = this.profiles.get(request.entityId);
    const score = profile?.overallScore ?? 80;
    const posture = POSTURE_FROM_SCORE(score);
    const requiredScore = RISK_SCORE_REQUIREMENTS[request.riskTier] ?? 50;

    const allowed = score >= requiredScore && posture !== "lockdown";

    const event: TrustStateEvent = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      tenantId: request.tenantId,
      entityId: request.entityId,
      entityType: request.entityType,
      dimension: "behavioral",
      previousScore: score,
      newScore: score,
      delta: 0,
      flags: [],
      reason: `Trust evaluation for ${request.action}: ${allowed ? "allowed" : "denied"}`,
      source: "trust-governor",
      correlation: request.correlation,
      posture,
      metadata: { action: request.action, riskTier: request.riskTier },
    };
    this.events.push(event);

    return {
      allowed,
      entityId: request.entityId,
      currentScore: score,
      posture,
      requiredScore,
      reason: allowed
        ? `Trust score ${score} meets requirement ${requiredScore} for ${request.riskTier} risk`
        : `Trust score ${score} below requirement ${requiredScore} for ${request.riskTier} risk`,
    };
  }

  updateProfile(entityId: string, tenantId: string, dimension: TrustStateDimension, delta: number, _source: string): TrustProfile | null {
    let profile = this.profiles.get(entityId);
    if (!profile) {
      profile = this.createDefaultProfile(entityId, "user", tenantId);
      this.profiles.set(entityId, profile);
    }

    const prevScore = profile.dimensionScores[dimension] ?? 80;
    const newDimScore = Math.min(100, Math.max(0, prevScore + delta));
    profile.dimensionScores[dimension] = newDimScore;

    const dims = Object.values(profile.dimensionScores);
    profile.overallScore = Math.round(dims.reduce((a, b) => a + b, 0) / dims.length);
    profile.posture = POSTURE_FROM_SCORE(profile.overallScore);
    profile.lastEvaluated = new Date().toISOString();
    profile.status = this.scoreToStatus(profile.overallScore);

    return profile;
  }

  getProfile(entityId: string): TrustProfile | null {
    return this.profiles.get(entityId) ?? null;
  }

  getRecoveryPlan(entityId: string): TrustRecoveryPlan | null {
    const profile = this.profiles.get(entityId);
    if (!profile || profile.overallScore >= 80) return null;

    const gap = 80 - profile.overallScore;
    const actions: TrustRecoveryAction[] = [];

    if (profile.overallScore < 30) {
      actions.push({ id: crypto.randomUUID(), type: "re-authenticate", label: "Re-authenticate your identity", completed: false, scoreImpact: 15 });
    }
    if (profile.overallScore < 60) {
      actions.push({ id: crypto.randomUUID(), type: "verify-identity", label: "Complete identity verification", completed: false, scoreImpact: 10 });
    }
    actions.push({ id: crypto.randomUUID(), type: "review-policy", label: "Review and accept updated policies", completed: false, scoreImpact: 5 });
    if (profile.activeFlags.length > 0) {
      actions.push({ id: crypto.randomUUID(), type: "manual-approval", label: "Request manual trust review", completed: false, scoreImpact: 20 });
    }

    return {
      entityId,
      requiredActions: actions,
      estimatedRecoveryScore: Math.min(100, profile.overallScore + actions.reduce((s, a) => s + a.scoreImpact, 0)),
      estimatedDuration: `${Math.ceil(gap / 10)} days`,
    };
  }

  getRecentEvents(limit: number = 50): TrustStateEvent[] {
    return this.events.slice(-limit).reverse();
  }

  private createDefaultProfile(entityId: string, entityType: TrustStateEvent["entityType"], tenantId: string): TrustProfile {
    const defaultScore = 80;
    return {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      tenantId,
      entityId,
      entityType,
      overallScore: defaultScore,
      dimensionScores: {
        behavioral: defaultScore,
        credential: defaultScore,
        device: defaultScore,
        transactional: defaultScore,
        compliance: defaultScore,
        temporal: defaultScore,
      },
      posture: "normal",
      activeFlags: [],
      lastEvaluated: new Date().toISOString(),
      verificationCount: 0,
      status: "trusted",
    };
  }

  private scoreToStatus(score: number): TrustProfile["status"] {
    if (score >= 80) return "trusted";
    if (score >= 50) return "provisional";
    if (score >= 25) return "restricted";
    return "suspended";
  }
}

export function createTrustGovernor(): TrustGovernorService {
  return new TrustGovernorService();
}
