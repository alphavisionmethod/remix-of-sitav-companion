// ═══════════════════════════════════════════════════════════════
// SITA OS — Unified Motion Grammar
// Bridges NOVA_MOTION (shell), SITA_MOTION (tokens), APP domain motion.
// ═══════════════════════════════════════════════════════════════

import type { VisualTierId } from "./visual-tier-system";

export interface MotionConfig {
  readonly springStiffness: number;
  readonly springDamping: number;
  readonly durationMicro: number;
  readonly durationStandard: number;
  readonly durationEmphasis: number;
}

/** Shared defaults all tiers inherit */
export const SHARED_MOTION_DEFAULTS: MotionConfig = {
  springStiffness: 200,
  springDamping: 20,
  durationMicro: 0.15,
  durationStandard: 0.25,
  durationEmphasis: 0.3,
} as const;

export interface TierMotionOverride {
  readonly tierId: VisualTierId;
  readonly overrides: Partial<MotionConfig>;
  readonly sourceRef: string;
  readonly notes: string;
}

export const TIER_MOTION_OVERRIDES: readonly TierMotionOverride[] = [
  { tierId: "TIER_SYSTEM_SHELL",      overrides: { springStiffness: 300, springDamping: 25 }, sourceRef: "NOVA_MOTION.spring.snappy", notes: "Shell uses snappier springs for window interactions" },
  { tierId: "TIER_PRODUCT_APP",       overrides: {},                                         sourceRef: "SHARED_MOTION_DEFAULTS",    notes: "Apps use shared defaults; domains may adjust via DOMAIN_ATMOSPHERE.motionSpeed" },
  { tierId: "TIER_OPERATOR_ADMIN",    overrides: { durationStandard: 0.15 },                 sourceRef: "SHARED_MOTION_DEFAULTS",    notes: "Admin uses faster transitions for efficiency" },
  { tierId: "TIER_SUPPORT_TRUST",     overrides: { durationEmphasis: 0.15 },                 sourceRef: "SHARED_MOTION_DEFAULTS",    notes: "Trust surfaces use minimal motion to avoid distraction" },
  { tierId: "TIER_DEGRADED_RECOVERY", overrides: { durationMicro: 0, durationStandard: 0.1 },sourceRef: "SHARED_MOTION_DEFAULTS",    notes: "Degraded states use minimal/no motion" },
] as const;

export const UNIFIED_MOTION_GRAMMAR = {
  sharedDefaults: SHARED_MOTION_DEFAULTS,
  tierOverrides: TIER_MOTION_OVERRIDES,
} as const;