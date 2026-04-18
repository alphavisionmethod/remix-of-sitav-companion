// ═══════════════════════════════════════════════════════════════
// SITA OS — Business Autonomy Policy Engine
// 6-level autonomy model with domain permissions & approval gates
// ═══════════════════════════════════════════════════════════════

export type AutonomyLevel = 1 | 2 | 3 | 4 | 5 | 6;

export type AutonomyDomain =
  | "email" | "files" | "finance" | "crm" | "calendar"
  | "messaging" | "scheduling" | "team-workflows" | "notifications" | "outbound-communication";

export interface AutonomyPolicy {
  domain: AutonomyDomain;
  level: AutonomyLevel;
  enabled: boolean;
  lastChanged: string;
}

export interface TrustModeState {
  globalLevel: AutonomyLevel;
  domainPolicies: AutonomyPolicy[];
  emergencyPaused: boolean;
  pausedAt: string | null;
  pauseReason: string | null;
  lastActionAt: string | null;
  totalActionsToday: number;
  approvedActionsToday: number;
  rejectedActionsToday: number;
}

export const AUTONOMY_LEVELS: Record<AutonomyLevel, { label: string; description: string; color: string }> = {
  1: { label: "Observe", description: "Sees and understands only. No recommendations.", color: "200 60% 55%" },
  2: { label: "Suggest", description: "Provides recommendations only.", color: "152 55% 48%" },
  3: { label: "Simulate", description: "Builds drafts, plans, and previews.", color: "38 85% 58%" },
  4: { label: "Ask Before Acting", description: "Can execute after explicit approval.", color: "265 55% 58%" },
  5: { label: "Rule-Based Autonomy", description: "Acts automatically on approved patterns.", color: "330 65% 55%" },
  6: { label: "Full Executive Automation", description: "Manages domains under owner-defined policy.", color: "0 65% 50%" },
};

export const ALL_DOMAINS: AutonomyDomain[] = [
  "email", "files", "finance", "crm", "calendar",
  "messaging", "scheduling", "team-workflows", "notifications", "outbound-communication",
];

export function createDefaultTrustState(): TrustModeState {
  return {
    globalLevel: 2,
    domainPolicies: ALL_DOMAINS.map(domain => ({
      domain,
      level: 2,
      enabled: true,
      lastChanged: new Date().toISOString(),
    })),
    emergencyPaused: false,
    pausedAt: null,
    pauseReason: null,
    lastActionAt: null,
    totalActionsToday: 0,
    approvedActionsToday: 0,
    rejectedActionsToday: 0,
  };
}

export function canExecute(state: TrustModeState, domain: AutonomyDomain, riskLevel: "low" | "medium" | "high" | "critical"): {
  allowed: boolean;
  reason: string;
  requiresApproval: boolean;
} {
  if (state.emergencyPaused) {
    return { allowed: false, reason: "Emergency pause is active", requiresApproval: false };
  }

  const policy = state.domainPolicies.find(p => p.domain === domain);
  if (!policy || !policy.enabled) {
    return { allowed: false, reason: `Domain ${domain} is disabled`, requiresApproval: false };
  }

  const effectiveLevel = Math.min(policy.level, state.globalLevel);

  // Risk-gated execution
  const riskThreshold: Record<string, AutonomyLevel> = {
    low: 5,
    medium: 4,
    high: 4,
    critical: 4,
  };

  if (effectiveLevel < 4) {
    return { allowed: false, reason: `Autonomy level ${effectiveLevel} is below execution threshold`, requiresApproval: false };
  }

  if (riskLevel === "critical" && effectiveLevel < 6) {
    return { allowed: false, reason: "Critical actions require Level 6 autonomy", requiresApproval: true };
  }

  if (riskLevel === "high" && effectiveLevel < 5) {
    return { allowed: false, reason: "High-risk actions require Level 5+", requiresApproval: true };
  }

  if (effectiveLevel === 4) {
    return { allowed: true, reason: "Execution allowed with approval", requiresApproval: true };
  }

  return { allowed: true, reason: "Autonomous execution permitted", requiresApproval: effectiveLevel < riskThreshold[riskLevel] };
}

export function emergencyPause(state: TrustModeState, reason: string): TrustModeState {
  return {
    ...state,
    emergencyPaused: true,
    pausedAt: new Date().toISOString(),
    pauseReason: reason,
  };
}

export function resumeFromPause(state: TrustModeState): TrustModeState {
  return {
    ...state,
    emergencyPaused: false,
    pausedAt: null,
    pauseReason: null,
  };
}

export function setDomainLevel(state: TrustModeState, domain: AutonomyDomain, level: AutonomyLevel): TrustModeState {
  return {
    ...state,
    domainPolicies: state.domainPolicies.map(p =>
      p.domain === domain ? { ...p, level, lastChanged: new Date().toISOString() } : p
    ),
  };
}

export function setGlobalLevel(state: TrustModeState, level: AutonomyLevel): TrustModeState {
  return { ...state, globalLevel: level };
}
