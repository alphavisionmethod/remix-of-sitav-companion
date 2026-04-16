// ═══════════════════════════════════════════════════════════════
// SITA OS — Feature Reality Registry
// Every meaningful product feature classified per surface.
// CI gate: scripts/architecture/checks/check-feature-reality-coverage.ts
// ═══════════════════════════════════════════════════════════════

import type { FeatureRealityEntry, RealityState, SurfaceId } from "./feature-reality-types";

export const FEATURE_REALITY_REGISTRY: readonly FeatureRealityEntry[] = [
  // ── Business OS ──
  {
    featureId: "business.lead-capture",
    featureName: "CRM lead capture",
    contextId: "business-os",
    perSurface: {
      web: "real", electron: "real", appliance: "real",
      ios: "real", android: "real", "mobile-pwa": "real", admin: "real",
    },
    evidence: ["src/features/business", "supabase/functions/business-board-api"],
  },
  {
    featureId: "business.pipeline-board",
    featureName: "Pipeline kanban",
    contextId: "business-os",
    perSurface: {
      web: "real", electron: "real", appliance: "real",
      ios: "degraded", android: "degraded", "mobile-pwa": "degraded", admin: "real",
    },
    evidence: ["src/features/business", "src/pages/BusinessCenter.tsx"],
    notes: "Mobile uses condensed kanban (degraded UI)",
  },

  // ── Finance OS ──
  {
    featureId: "finance.cashflow",
    featureName: "Cashflow projection",
    contextId: "finance-os",
    perSurface: {
      web: "real", electron: "real", appliance: "real",
      ios: "real", android: "real", "mobile-pwa": "real", admin: "real",
    },
    evidence: ["supabase/functions/cashflow-calculate"],
  },
  {
    featureId: "finance.payment-execution",
    featureName: "Payment execution",
    contextId: "finance-os",
    perSurface: {
      web: "real", electron: "real", appliance: "real",
      ios: "degraded", android: "degraded", "mobile-pwa": "degraded", admin: "real",
    },
    evidence: ["supabase/functions/payment-process", "supabase/functions/payment-kill-switch"],
    notes: "Mobile requires step-up auth → degraded path until Apple/Google Pay wired",
  },
  {
    featureId: "finance.tax-estimation",
    featureName: "Tax estimation",
    contextId: "finance-os",
    perSurface: {
      web: "real", electron: "real", appliance: "real",
      ios: "real", android: "real", "mobile-pwa": "real", admin: "real",
    },
    evidence: ["supabase/functions/tax-estimate"],
  },

  // ── Concierge OS ──
  {
    featureId: "concierge.appointments",
    featureName: "Appointments & bookings",
    contextId: "concierge-os",
    perSurface: {
      web: "real", electron: "real", appliance: "real",
      ios: "real", android: "real", "mobile-pwa": "real", admin: "real",
    },
    evidence: ["supabase/functions/booking-manage"],
  },

  // ── Investment Office ──
  {
    featureId: "investment.portfolio",
    featureName: "Investment portfolio",
    contextId: "investment-office",
    perSurface: {
      web: "real", electron: "real", appliance: "real",
      ios: "real", android: "real", "mobile-pwa": "real", admin: "real",
    },
    evidence: ["supabase/functions/investment-portfolio-api"],
  },

  // ── Boardroom ──
  {
    featureId: "boardroom.voting",
    featureName: "Boardroom voting & decisions",
    contextId: "boardroom",
    perSurface: {
      web: "real", electron: "real", appliance: "real",
      ios: "real", android: "real", "mobile-pwa": "real", admin: "real",
    },
    evidence: ["src/pages/Boardroom.tsx"],
  },
  {
    featureId: "boardroom.proof-trail",
    featureName: "Proof receipt trail",
    contextId: "boardroom",
    perSurface: {
      web: "real", electron: "real", appliance: "real",
      ios: "real", android: "real", "mobile-pwa": "real", admin: "real",
    },
    evidence: ["src/pages/admin/AIG05ReceiptsExplorer.tsx"],
  },

  // ── Mission Control ──
  {
    featureId: "mission-control.health",
    featureName: "Mission control health",
    contextId: "mission-control",
    perSurface: {
      web: "real", electron: "real", appliance: "real",
      ios: "degraded", android: "degraded", "mobile-pwa": "degraded", admin: "real",
    },
    evidence: ["src/pages/admin/modules/MCSystemHealth.tsx"],
    notes: "Mobile gets read-only summary",
  },

  // ── Setup / Identity ──
  {
    featureId: "identity.biometric-auth",
    featureName: "Biometric authentication",
    contextId: "setup-identity",
    perSurface: {
      web: "real", electron: "real", appliance: "real",
      ios: "real", android: "real", "mobile-pwa": "real", admin: "real",
    },
    evidence: ["src/lib/runtime/mobile-runtime-contract.ts"],
  },

  // ── Cloud Control Plane ──
  {
    featureId: "cloud.tenant-mgmt",
    featureName: "Cloud tenant management",
    contextId: "cloud-control-plane",
    perSurface: {
      web: "real", electron: "real", appliance: "real",
      ios: "unsupported", android: "unsupported", "mobile-pwa": "unsupported", admin: "real",
    },
    evidence: ["src/pages/admin/cloud/CloudBackboneAdmin.tsx"],
  },

  // ── Integrations ──
  {
    featureId: "integrations.connector-sync",
    featureName: "Connector sync engine",
    contextId: "integrations",
    perSurface: {
      web: "real", electron: "real", appliance: "real",
      ios: "real", android: "real", "mobile-pwa": "real", admin: "real",
    },
    evidence: ["supabase/functions/connector-sync", "src/lib/architecture/connector-governance.ts"],
  },

  // ── Proof / Trust ──
  {
    featureId: "proof.receipt-generation",
    featureName: "Proof receipt generation",
    contextId: "proof-trust",
    perSurface: {
      web: "real", electron: "real", appliance: "real",
      ios: "real", android: "real", "mobile-pwa": "real", admin: "real",
    },
    evidence: ["supabase/functions/health-check"],
  },

  // ── Runtime / Kernel ──
  {
    featureId: "runtime.ai-gateway",
    featureName: "Sovereign AI gateway",
    contextId: "runtime-kernel",
    perSurface: {
      web: "real", electron: "real", appliance: "real",
      ios: "real", android: "real", "mobile-pwa": "real", admin: "real",
    },
    evidence: ["supabase/functions/ai-gateway"],
  },
  {
    featureId: "runtime.kill-switches",
    featureName: "Emergency kill-switches",
    contextId: "runtime-kernel",
    perSurface: {
      web: "real", electron: "real", appliance: "real",
      ios: "real", android: "real", "mobile-pwa": "real", admin: "real",
    },
    evidence: ["src/lib/control-plane/kill-switch-types.ts"],
  },

  // ── Mobile (host) ──
  {
    featureId: "mobile.offline-sync",
    featureName: "Offline sync engine",
    contextId: "mobile",
    perSurface: {
      web: "degraded", electron: "real", appliance: "unsupported",
      ios: "real", android: "real", "mobile-pwa": "real", admin: "unsupported",
    },
    evidence: ["src/runtimes/mobile/index.ts"],
  },
  {
    featureId: "mobile.push-notifications",
    featureName: "Push notifications",
    contextId: "mobile",
    perSurface: {
      web: "real", electron: "real", appliance: "unsupported",
      ios: "roadmap", android: "real", "mobile-pwa": "real", admin: "real",
    },
    evidence: ["src/lib/runtime/mobile-runtime-contract.ts"],
    notes: "iOS APNs deferred — must remain roadmap until Apple membership active",
  },

  // ── Admin ──
  {
    featureId: "admin.architecture-atlas",
    featureName: "Meta-architecture atlas",
    contextId: "admin",
    perSurface: {
      web: "real", electron: "real", appliance: "real",
      ios: "unsupported", android: "unsupported", "mobile-pwa": "unsupported", admin: "real",
    },
    evidence: ["src/pages/admin/META01ArchitectureAtlas.tsx"],
  },
];

export const ALL_SURFACES: readonly SurfaceId[] = [
  "web", "electron", "appliance", "ios", "android", "mobile-pwa", "admin",
];

export function getRealityForFeature(featureId: string): FeatureRealityEntry | undefined {
  return FEATURE_REALITY_REGISTRY.find((f) => f.featureId === featureId);
}

export function getRealityState(featureId: string, surface: SurfaceId): RealityState | undefined {
  return getRealityForFeature(featureId)?.perSurface[surface];
}

export function listFeaturesByState(state: RealityState, surface: SurfaceId): readonly FeatureRealityEntry[] {
  return FEATURE_REALITY_REGISTRY.filter((f) => f.perSurface[surface] === state);
}

export function realityCoverageStats(): {
  total: number;
  realPct: number;
  simulatedPct: number;
  degradedPct: number;
  unsupportedPct: number;
  roadmapPct: number;
} {
  const total = FEATURE_REALITY_REGISTRY.length * ALL_SURFACES.length;
  let real = 0, sim = 0, deg = 0, uns = 0, road = 0;
  for (const f of FEATURE_REALITY_REGISTRY) {
    for (const s of ALL_SURFACES) {
      switch (f.perSurface[s]) {
        case "real": real++; break;
        case "simulated": sim++; break;
        case "degraded": deg++; break;
        case "unsupported": uns++; break;
        case "roadmap": road++; break;
      }
    }
  }
  return {
    total,
    realPct: (real / total) * 100,
    simulatedPct: (sim / total) * 100,
    degradedPct: (deg / total) * 100,
    unsupportedPct: (uns / total) * 100,
    roadmapPct: (road / total) * 100,
  };
}
