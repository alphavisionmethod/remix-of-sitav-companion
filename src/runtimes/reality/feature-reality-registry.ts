// ═══════════════════════════════════════════════════════════════
// SITA OS — Feature Reality Registry (Phase 11 — full coverage)
// Every meaningful product feature classified per surface.
// CI gate: scripts/architecture/checks/check-feature-reality-coverage.ts
// ═══════════════════════════════════════════════════════════════

import type { FeatureRealityEntry, RealityState, SurfaceId } from "./feature-reality-types";

/** Helper: feature is real on every desktop surface, mobile-degraded by default. */
const realDesktopMobileDegraded = {
  web: "real" as RealityState, electron: "real" as RealityState, appliance: "real" as RealityState,
  ios: "degraded" as RealityState, android: "degraded" as RealityState,
  "mobile-pwa": "degraded" as RealityState, admin: "real" as RealityState,
};

const realEverywhere = {
  web: "real" as RealityState, electron: "real" as RealityState, appliance: "real" as RealityState,
  ios: "real" as RealityState, android: "real" as RealityState,
  "mobile-pwa": "real" as RealityState, admin: "real" as RealityState,
};

const desktopOnly = {
  web: "real" as RealityState, electron: "real" as RealityState, appliance: "real" as RealityState,
  ios: "unsupported" as RealityState, android: "unsupported" as RealityState,
  "mobile-pwa": "unsupported" as RealityState, admin: "real" as RealityState,
};

export const FEATURE_REALITY_REGISTRY: readonly FeatureRealityEntry[] = [
  // ── Business OS (5) ──────────────────────────────────────────
  { featureId: "business.lead-capture", featureName: "CRM lead capture", contextId: "business-os",
    perSurface: realEverywhere,
    evidence: ["src/features/business", "supabase/functions/business-board-api"] },
  { featureId: "business.pipeline-board", featureName: "Pipeline kanban", contextId: "business-os",
    perSurface: realDesktopMobileDegraded,
    evidence: ["src/features/business", "src/pages/BusinessCenter.tsx"],
    notes: "Mobile uses condensed kanban (degraded UI)" },
  { featureId: "business.crm-import", featureName: "Smart CSV / CRM importer", contextId: "business-os",
    perSurface: desktopOnly,
    evidence: ["supabase/functions/crm-sync", "src/features/business"] },
  { featureId: "business.opportunities", featureName: "Opportunities & deals", contextId: "business-os",
    perSurface: realDesktopMobileDegraded,
    evidence: ["src/pages/BusinessCenter.tsx"] },
  { featureId: "business.team-people", featureName: "Team & people directory", contextId: "business-os",
    perSurface: realEverywhere,
    evidence: ["src/pages/BusinessCenter.tsx"] },

  // ── Finance OS (6) ───────────────────────────────────────────
  { featureId: "finance.cashflow", featureName: "Cashflow projection", contextId: "finance-os",
    perSurface: realEverywhere,
    evidence: ["supabase/functions/cashflow-calculate"] },
  { featureId: "finance.invoicing", featureName: "Invoice generation", contextId: "finance-os",
    perSurface: realDesktopMobileDegraded,
    evidence: ["supabase/functions/invoice-generate"] },
  { featureId: "finance.payment-execution", featureName: "Payment execution", contextId: "finance-os",
    perSurface: realDesktopMobileDegraded,
    evidence: ["supabase/functions/payment-process", "supabase/functions/payment-kill-switch"],
    notes: "Mobile requires step-up auth → degraded path until Apple/Google Pay wired" },
  { featureId: "finance.tax-estimation", featureName: "Tax estimation", contextId: "finance-os",
    perSurface: realEverywhere,
    evidence: ["supabase/functions/tax-estimate"] },
  { featureId: "finance.cost-alerts", featureName: "Cost & spend alerts", contextId: "finance-os",
    perSurface: realEverywhere,
    evidence: ["supabase/functions/cost-alert"] },
  { featureId: "finance.msa-operations", featureName: "MSA contract operations", contextId: "finance-os",
    perSurface: desktopOnly,
    evidence: ["supabase/functions/msa-operations"] },

  // ── Concierge OS (4) ─────────────────────────────────────────
  { featureId: "concierge.appointments", featureName: "Appointments & bookings", contextId: "concierge-os",
    perSurface: realEverywhere,
    evidence: ["supabase/functions/booking-manage"] },
  { featureId: "concierge.tasks", featureName: "Tasks & workflows", contextId: "concierge-os",
    perSurface: realEverywhere,
    evidence: ["src/pages/ConciergeCenter.tsx"] },
  { featureId: "concierge.communications", featureName: "Communications inbox", contextId: "concierge-os",
    perSurface: realEverywhere,
    evidence: ["src/pages/CommunicationsPage.tsx"] },
  { featureId: "concierge.calendar", featureName: "Unified calendar", contextId: "concierge-os",
    perSurface: realEverywhere,
    evidence: ["src/pages/ConciergeCenter.tsx"] },

  // ── Investment Office (3) ────────────────────────────────────
  { featureId: "investment.portfolio", featureName: "Investment portfolio", contextId: "investment-office",
    perSurface: realEverywhere,
    evidence: ["supabase/functions/investment-portfolio-api"] },
  { featureId: "investment.trading-floor", featureName: "Trading floor & globe", contextId: "investment-office",
    perSurface: desktopOnly,
    evidence: ["src/pages/MoneyCenter.tsx"] },
  { featureId: "investment.war-room", featureName: "Investment war room", contextId: "investment-office",
    perSurface: desktopOnly,
    evidence: ["src/pages/MoneyCenter.tsx"] },

  // ── Boardroom (5) ────────────────────────────────────────────
  { featureId: "boardroom.voting", featureName: "Boardroom voting & decisions", contextId: "boardroom",
    perSurface: realEverywhere,
    evidence: ["src/pages/Boardroom.tsx"] },
  { featureId: "boardroom.advisor-meeting", featureName: "Advisor meeting room", contextId: "boardroom",
    perSurface: realDesktopMobileDegraded,
    evidence: ["src/pages/Boardroom.tsx"] },
  { featureId: "boardroom.simulation-engine", featureName: "Simulation engine (1M+ iterations)", contextId: "boardroom",
    perSurface: desktopOnly,
    evidence: ["src/pages/Boardroom.tsx"] },
  { featureId: "boardroom.time-machine", featureName: "Time Machine 3D timeline", contextId: "boardroom",
    perSurface: desktopOnly,
    evidence: ["src/pages/Boardroom.tsx"] },
  { featureId: "boardroom.proof-trail", featureName: "Proof receipt trail", contextId: "boardroom",
    perSurface: realEverywhere,
    evidence: ["src/pages/admin/AIG05ReceiptsExplorer.tsx"] },

  // ── Mission Control (5) ──────────────────────────────────────
  { featureId: "mission-control.health", featureName: "Mission control health", contextId: "mission-control",
    perSurface: realDesktopMobileDegraded,
    evidence: ["src/pages/admin/modules/MCSystemHealth.tsx"],
    notes: "Mobile gets read-only summary" },
  { featureId: "mission-control.daily-pulse", featureName: "Daily pulse", contextId: "mission-control",
    perSurface: realEverywhere,
    evidence: ["src/pages/Boardroom.tsx"] },
  { featureId: "mission-control.ai-workforce", featureName: "AI workforce control", contextId: "mission-control",
    perSurface: desktopOnly,
    evidence: ["src/pages/admin/META01ArchitectureAtlas.tsx"] },
  { featureId: "mission-control.automation", featureName: "Automation & workflows", contextId: "mission-control",
    perSurface: realEverywhere,
    evidence: ["src/pages/admin/META01ArchitectureAtlas.tsx"] },
  { featureId: "mission-control.achievements", featureName: "Achievements & XP", contextId: "mission-control",
    perSurface: realEverywhere,
    evidence: ["src/pages/Boardroom.tsx"] },

  // ── Setup / Identity (4) ─────────────────────────────────────
  { featureId: "identity.biometric-auth", featureName: "Biometric authentication", contextId: "setup-identity",
    perSurface: realEverywhere,
    evidence: ["src/lib/runtime/mobile-runtime-contract.ts"] },
  { featureId: "identity.first-boot", featureName: "First-boot setup wizard", contextId: "setup-identity",
    perSurface: realEverywhere,
    evidence: ["src/routes/settings-routes.tsx"] },
  { featureId: "identity.profile", featureName: "User profile & preferences", contextId: "setup-identity",
    perSurface: realEverywhere,
    evidence: ["src/routes/settings-routes.tsx"] },
  { featureId: "identity.recovery", featureName: "Account recovery & MFA", contextId: "setup-identity",
    perSurface: realEverywhere,
    evidence: ["src/routes/settings-routes.tsx"] },

  // ── Cloud Control Plane (3) ──────────────────────────────────
  { featureId: "cloud.tenant-mgmt", featureName: "Cloud tenant management", contextId: "cloud-control-plane",
    perSurface: desktopOnly,
    evidence: ["src/pages/admin/cloud/CloudBackboneAdmin.tsx"] },
  { featureId: "cloud.environment-switcher", featureName: "Environment switcher", contextId: "cloud-control-plane",
    perSurface: desktopOnly,
    evidence: ["src/routes/os-routes.tsx"] },
  { featureId: "cloud.sovereign-export", featureName: "Sovereign data export", contextId: "cloud-control-plane",
    perSurface: desktopOnly,
    evidence: ["src/routes/os-routes.tsx"] },

  // ── Integrations (3) ─────────────────────────────────────────
  { featureId: "integrations.connector-sync", featureName: "Connector sync engine", contextId: "integrations",
    perSurface: realEverywhere,
    evidence: ["supabase/functions/connector-sync", "src/lib/architecture/connector-governance.ts"] },
  { featureId: "integrations.app-store", featureName: "App store & marketplace", contextId: "integrations",
    perSurface: realDesktopMobileDegraded,
    evidence: ["src/routes/apps-routes.tsx"] },
  { featureId: "integrations.token-vault", featureName: "Connector token vault", contextId: "integrations",
    perSurface: realEverywhere,
    evidence: ["src/lib/architecture/connector-governance.ts"] },

  // ── Proof / Trust (3) ────────────────────────────────────────
  { featureId: "proof.receipt-generation", featureName: "Proof receipt generation", contextId: "proof-trust",
    perSurface: realEverywhere,
    evidence: ["supabase/functions/health-check"] },
  { featureId: "proof.audit-trail", featureName: "Immutable audit trail", contextId: "proof-trust",
    perSurface: realEverywhere,
    evidence: ["src/pages/admin/AIG05ReceiptsExplorer.tsx"] },
  { featureId: "proof.attestation", featureName: "Device attestation", contextId: "proof-trust",
    perSurface: realEverywhere,
    evidence: ["src/lib/runtime/mobile-runtime-contract.ts"] },

  // ── Runtime / Kernel (5) ─────────────────────────────────────
  { featureId: "runtime.ai-gateway", featureName: "Sovereign AI gateway", contextId: "runtime-kernel",
    perSurface: realEverywhere,
    evidence: ["supabase/functions/ai-gateway"] },
  { featureId: "runtime.kill-switches", featureName: "Emergency kill-switches", contextId: "runtime-kernel",
    perSurface: realEverywhere,
    evidence: ["src/lib/control-plane/kill-switch-types.ts"] },
  { featureId: "runtime.files", featureName: "Files & storage", contextId: "runtime-kernel",
    perSurface: realEverywhere,
    evidence: ["src/routes/files-routes.tsx"] },
  { featureId: "runtime.search", featureName: "Universal search", contextId: "runtime-kernel",
    perSurface: realEverywhere,
    evidence: ["src/routes/os-routes.tsx"] },
  { featureId: "runtime.desktop", featureName: "Desktop / windowing shell", contextId: "runtime-kernel",
    perSurface: desktopOnly,
    evidence: ["src/pages/DesktopPage.tsx"] },

  // ── Mobile (host) (3) ────────────────────────────────────────
  { featureId: "mobile.offline-sync", featureName: "Offline sync engine", contextId: "mobile",
    perSurface: { web: "degraded", electron: "real", appliance: "unsupported",
      ios: "real", android: "real", "mobile-pwa": "real", admin: "unsupported" },
    evidence: ["src/runtimes/mobile/index.ts"] },
  { featureId: "mobile.push-notifications", featureName: "Push notifications", contextId: "mobile",
    perSurface: { web: "real", electron: "real", appliance: "unsupported",
      ios: "roadmap", android: "real", "mobile-pwa": "real", admin: "real" },
    evidence: ["src/lib/runtime/mobile-runtime-contract.ts"],
    notes: "iOS APNs deferred — must remain roadmap until Apple membership active" },
  { featureId: "mobile.biometric", featureName: "Mobile biometric unlock", contextId: "mobile",
    perSurface: { web: "unsupported", electron: "unsupported", appliance: "unsupported",
      ios: "real", android: "real", "mobile-pwa": "degraded", admin: "unsupported" },
    evidence: ["src/lib/runtime/mobile-runtime-contract.ts"] },

  // ── Admin (4) ────────────────────────────────────────────────
  { featureId: "admin.architecture-atlas", featureName: "Meta-architecture atlas", contextId: "admin",
    perSurface: desktopOnly,
    evidence: ["src/pages/admin/META01ArchitectureAtlas.tsx"] },
  { featureId: "admin.ci-umbrella", featureName: "CI umbrella center", contextId: "admin",
    perSurface: desktopOnly,
    evidence: ["src/pages/admin/CI01CIUmbrellaCenter.tsx"] },
  { featureId: "admin.product-reality", featureName: "Product reality dashboard", contextId: "admin",
    perSurface: desktopOnly,
    evidence: ["src/pages/admin/META04ProductReality.tsx"] },
  { featureId: "admin.completeness-matrix", featureName: "Completeness matrix", contextId: "admin",
    perSurface: desktopOnly,
    evidence: ["src/pages/admin/META05CompletenessMatrix.tsx"] },
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
