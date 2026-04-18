// ═══════════════════════════════════════════════════════════════
// SITA OS — Reality Mode Registry
// Canonical definitions for runtime modes (real/demo/sandbox)
// ═══════════════════════════════════════════════════════════════

export type RealityModeKey = "real" | "demo" | "sandbox" | "dev_demo";

export interface RealityModeDefinition {
  key: RealityModeKey;
  name: string;
  description: string;
  launchHonestyClass: "truthful" | "demo_backed" | "sandbox_simulated";
  sideEffects: {
    externalWritesAllowed: boolean;
    connectorWritesAllowed: boolean;
    notificationsLive: boolean;
    approvalExecutesLive: boolean;
    billingLive: boolean;
  };
  aiPolicy: "full_live" | "limited_live" | "scenario_grounded" | "cached_only" | "disabled";
  analyticsMode: "real" | "separate" | "discard" | "internal_only";
  receiptMode: "real_receipt" | "demo_receipt" | "simulated_receipt";
}

export const CANONICAL_MODES: Record<RealityModeKey, RealityModeDefinition> = {
  real: {
    key: "real",
    name: "Real Mode",
    description: "Production runtime with real auth, data, persistence, and side effects",
    launchHonestyClass: "truthful",
    sideEffects: {
      externalWritesAllowed: true,
      connectorWritesAllowed: true,
      notificationsLive: true,
      approvalExecutesLive: true,
      billingLive: true,
    },
    aiPolicy: "full_live",
    analyticsMode: "real",
    receiptMode: "real_receipt",
  },
  demo: {
    key: "demo",
    name: "Demo Mode",
    description: "Investor/sales demo with curated scenario data, blocked real side effects",
    launchHonestyClass: "demo_backed",
    sideEffects: {
      externalWritesAllowed: false,
      connectorWritesAllowed: false,
      notificationsLive: false,
      approvalExecutesLive: false,
      billingLive: false,
    },
    aiPolicy: "cached_only",
    analyticsMode: "separate",
    receiptMode: "demo_receipt",
  },
  sandbox: {
    key: "sandbox",
    name: "Sandbox Mode",
    description: "Testing/training environment with isolated state",
    launchHonestyClass: "sandbox_simulated",
    sideEffects: {
      externalWritesAllowed: false,
      connectorWritesAllowed: false,
      notificationsLive: false,
      approvalExecutesLive: false,
      billingLive: false,
    },
    aiPolicy: "limited_live",
    analyticsMode: "discard",
    receiptMode: "simulated_receipt",
  },
  dev_demo: {
    key: "dev_demo",
    name: "Dev Demo",
    description: "Internal development demo with live AI for testing",
    launchHonestyClass: "demo_backed",
    sideEffects: {
      externalWritesAllowed: false,
      connectorWritesAllowed: false,
      notificationsLive: false,
      approvalExecutesLive: false,
      billingLive: false,
    },
    aiPolicy: "limited_live",
    analyticsMode: "internal_only",
    receiptMode: "demo_receipt",
  },
};

export function getModeDefinition(key: RealityModeKey): RealityModeDefinition {
  return CANONICAL_MODES[key];
}

export function isRealMode(key: RealityModeKey): boolean {
  return key === "real";
}

export function isDemoMode(key: RealityModeKey): boolean {
  return key === "demo" || key === "dev_demo";
}

export function isSideEffectSafe(key: RealityModeKey): boolean {
  const mode = CANONICAL_MODES[key];
  return !mode.sideEffects.externalWritesAllowed && !mode.sideEffects.billingLive;
}
