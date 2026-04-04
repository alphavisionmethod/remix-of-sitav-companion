// ═══════════════════════════════════════════════════════════════
// SITA OS — Feature Flags Package
// ═══════════════════════════════════════════════════════════════

export type FlagType = "boolean" | "percentage" | "user-list" | "domain";

export interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description: string;
  type: FlagType;
  enabled: boolean;
  value: unknown;
  domain?: string;
  createdAt: number;
  updatedAt: number;
}

export interface FlagContext {
  userId: string;
  role: string;
  domain?: string;
  deviceType?: string;
}

const flags = new Map<string, FeatureFlag>();

export const registerFlag = (flag: FeatureFlag): void => { flags.set(flag.key, flag); };

export const isEnabled = (key: string, ctx?: FlagContext): boolean => {
  const flag = flags.get(key);
  if (!flag) return false;
  if (!flag.enabled) return false;
  if (flag.type === "boolean") return true;
  if (flag.type === "percentage" && typeof flag.value === "number") {
    const hash = key.length + (ctx?.userId?.length ?? 0);
    return (hash % 100) < flag.value;
  }
  if (flag.type === "user-list" && Array.isArray(flag.value) && ctx?.userId) {
    return flag.value.includes(ctx.userId);
  }
  if (flag.type === "domain" && typeof flag.value === "string" && ctx?.domain) {
    return flag.value === ctx.domain;
  }
  return flag.enabled;
};

export const getFlag = (key: string): FeatureFlag | undefined => flags.get(key);
export const getAllFlags = (): FeatureFlag[] => Array.from(flags.values());

// ── Gradual Rollout ─────────────────────────────────────────

export interface RolloutStage {
  readonly percentage: number;
  readonly startAt: number;
  readonly durationMs: number;
}

export interface GradualRollout {
  readonly flagKey: string;
  readonly stages: RolloutStage[];
  readonly currentStage: number;
  readonly cohortSeed: string;
  readonly targetSegments: string[];
}

export const getCurrentRolloutPercentage = (rollout: GradualRollout): number => {
  const now = Date.now();
  for (let i = rollout.stages.length - 1; i >= 0; i--) {
    if (now >= rollout.stages[i].startAt) return rollout.stages[i].percentage;
  }
  return 0;
};

// ── Kill-Switch Integration ─────────────────────────────────

export type KillSwitchState = "armed" | "triggered" | "disarmed";

export interface KillSwitch {
  readonly flagKey: string;
  readonly featureId: string;
  readonly killClass: "instant" | "graceful" | "scheduled";
  readonly state: KillSwitchState;
  readonly triggeredAt?: number;
  readonly triggeredBy?: string;
  readonly reason?: string;
}

// ── Flag Audit ──────────────────────────────────────────────

export type FlagAuditAction = "created" | "enabled" | "disabled" | "value-changed" | "deleted" | "kill-switch-triggered";

export interface FlagAuditEntry {
  readonly id: string;
  readonly flagKey: string;
  readonly action: FlagAuditAction;
  readonly previousValue: unknown;
  readonly newValue: unknown;
  readonly changedBy: string;
  readonly timestamp: number;
  readonly reason?: string;
}

// ── Tenant-Scoped Overrides ─────────────────────────────────

export interface TenantFlagOverride {
  readonly flagKey: string;
  readonly tenantId: string;
  readonly enabled: boolean;
  readonly setAt: number;
  readonly setBy: string;
  readonly reason?: string;
}

const tenantOverrides = new Map<string, TenantFlagOverride>();

function overrideKey(flagKey: string, tenantId: string): string {
  return `${tenantId}::${flagKey}`;
}

export const setTenantOverride = (flagKey: string, tenantId: string, enabled: boolean, meta?: { setBy?: string; reason?: string }): TenantFlagOverride => {
  const override: TenantFlagOverride = {
    flagKey,
    tenantId,
    enabled,
    setAt: Date.now(),
    setBy: meta?.setBy ?? "system",
    reason: meta?.reason,
  };
  tenantOverrides.set(overrideKey(flagKey, tenantId), override);
  return override;
};

export const removeTenantOverride = (flagKey: string, tenantId: string): boolean => {
  return tenantOverrides.delete(overrideKey(flagKey, tenantId));
};

export const getTenantOverrides = (tenantId: string): TenantFlagOverride[] => {
  return Array.from(tenantOverrides.values()).filter(o => o.tenantId === tenantId);
};

export const getAllTenantOverrides = (): TenantFlagOverride[] => {
  return Array.from(tenantOverrides.values());
};

export const isEnabledForTenant = (key: string, tenantId: string, ctx?: FlagContext): boolean => {
  // tenant override takes priority
  const override = tenantOverrides.get(overrideKey(key, tenantId));
  if (override) return override.enabled;
  // fall back to global evaluation
  return isEnabled(key, ctx);
};
