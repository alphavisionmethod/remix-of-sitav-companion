// ═══════════════════════════════════════════════════════════════
// SITA OS — Canonical Feature Surface Registry
// Maps every feature barrel to its domain, routes, apps, runtime
// support, proof coverage, and governance metadata.
//
// This is the SINGLE source of truth connecting src/features/*
// barrels to the rest of the architecture. It extends — never
// duplicates — the governance in src/packages/feature-governance/.
// ═══════════════════════════════════════════════════════════════

import type { FeatureSurfaceEntry } from "./_contracts/feature-surface-contract";

const ALL_TIERS = ["WEB_APP", "DESKTOP_HOST", "APPLIANCE_RUNTIME", "SIMULATED_OS_EXPERIENCE"] as const;
const WEB_DESKTOP = ["WEB_APP", "DESKTOP_HOST"] as const;
const CORE_STATES = ["loading", "ready", "empty", "error", "degraded"] as const;
const FULL_STATES = ["loading", "ready", "empty", "error", "blocked", "degraded", "recovery", "stale-data", "permission-required"] as const;

const PARTIAL_PROOF = { implementation: "partial", wiring: "partial", behavior: "missing", failure: "missing", recovery: "missing", operational: "missing", release: "missing" } as const;
const CORE_PROOF = { implementation: "covered", wiring: "covered", behavior: "partial", failure: "partial", recovery: "missing", operational: "missing", release: "missing" } as const;

export const FEATURE_REGISTRY: readonly FeatureSurfaceEntry[] = [
  // ── Core Product Features ────────────────────────────────────
  {
    featureId: "auth", name: "Authentication", canonicalImport: "@/features/auth",
    domain: "system", riskTier: "R4", status: "ga",
    ownedRoutes: ["/auth", "/auth/login", "/auth/register", "/auth/reset-password", "/login", "/register"],
    ownedApps: [], runtimeSupport: [...ALL_TIERS], stateGrammar: [...FULL_STATES],
    proofCoverage: { ...CORE_PROOF, behavior: "covered", failure: "covered", recovery: "covered", operational: "partial", release: "partial" },
    supportIntegrated: true, trustIntegrated: true,
  },
  {
    featureId: "boardroom", name: "Boardroom", canonicalImport: "@/features/boardroom",
    domain: "cross-domain", riskTier: "R3", status: "beta",
    ownedRoutes: ["/boardroom", "/boardroom/advisor-council", "/boardroom/approvals"],
    ownedApps: ["boardroom-app"], runtimeSupport: [...ALL_TIERS], stateGrammar: [...FULL_STATES],
    proofCoverage: CORE_PROOF, supportIntegrated: true, trustIntegrated: true,
  },
  {
    featureId: "business", name: "Business OS", canonicalImport: "@/features/business",
    domain: "business", riskTier: "R2", status: "beta",
    ownedRoutes: ["/business", "/business/dashboard", "/business/clients", "/business/projects", "/business/pipeline"],
    ownedApps: ["business-app"], runtimeSupport: [...ALL_TIERS], stateGrammar: [...CORE_STATES],
    proofCoverage: CORE_PROOF, supportIntegrated: true, trustIntegrated: false,
    subFeatures: ["business/crm", "business/leads", "business/autopilot"],
  },
  {
    featureId: "money", name: "Money OS", canonicalImport: "@/features/money",
    domain: "finance", riskTier: "R3", status: "beta",
    ownedRoutes: ["/money", "/money/accounts", "/money/transactions", "/money/bills", "/money/invoices"],
    ownedApps: ["finance-app"], runtimeSupport: [...ALL_TIERS], stateGrammar: [...FULL_STATES],
    proofCoverage: CORE_PROOF, supportIntegrated: true, trustIntegrated: true,
    subFeatures: ["money/finance"],
  },
  {
    featureId: "concierge", name: "Concierge", canonicalImport: "@/features/concierge",
    domain: "concierge", riskTier: "R1", status: "beta",
    ownedRoutes: ["/concierge"], ownedApps: ["concierge-app"],
    runtimeSupport: [...ALL_TIERS], stateGrammar: [...CORE_STATES],
    proofCoverage: PARTIAL_PROOF, supportIntegrated: true, trustIntegrated: false,
  },
  {
    featureId: "investment-office", name: "Investment Office", canonicalImport: "@/features/investment-office",
    domain: "finance", riskTier: "R4", status: "beta",
    ownedRoutes: ["/investment", "/investment/boardroom", "/investment/markets", "/investment/portfolio", "/investment/strategy", "/investment/execute", "/investment/research", "/investment/risk", "/investment/family-office"],
    ownedApps: ["investment-app"], runtimeSupport: [...ALL_TIERS], stateGrammar: [...FULL_STATES],
    proofCoverage: CORE_PROOF, supportIntegrated: true, trustIntegrated: true,
  },
  {
    featureId: "files", name: "Files", canonicalImport: "@/features/files",
    domain: "system", riskTier: "R1", status: "beta",
    ownedRoutes: ["/files"], ownedApps: ["files-app"],
    runtimeSupport: [...ALL_TIERS], stateGrammar: [...CORE_STATES],
    proofCoverage: PARTIAL_PROOF, supportIntegrated: false, trustIntegrated: false,
  },

  // ── Supporting Features ──────────────────────────────────────
  {
    featureId: "advisors", name: "Advisors", canonicalImport: "@/features/advisors",
    domain: "cross-domain", riskTier: "R2", status: "beta",
    ownedRoutes: ["/advisors"], ownedApps: [],
    runtimeSupport: [...ALL_TIERS], stateGrammar: [...CORE_STATES],
    proofCoverage: PARTIAL_PROOF, supportIntegrated: true, trustIntegrated: true,
  },
  {
    featureId: "ai", name: "AI Platform", canonicalImport: "@/features/ai",
    domain: "system", riskTier: "R2", status: "beta",
    ownedRoutes: [], ownedApps: [],
    runtimeSupport: [...ALL_TIERS], stateGrammar: [...FULL_STATES],
    proofCoverage: CORE_PROOF, supportIntegrated: true, trustIntegrated: true,
  },
  {
    featureId: "app-platform", name: "App Platform", canonicalImport: "@/features/app-platform",
    domain: "system", riskTier: "R1", status: "beta",
    ownedRoutes: [], ownedApps: ["app-store", "business-app", "concierge-app", "finance-app", "investment-app", "mission-control-app"],
    runtimeSupport: [...ALL_TIERS], stateGrammar: [...CORE_STATES],
    proofCoverage: PARTIAL_PROOF, supportIntegrated: false, trustIntegrated: false,
  },
  {
    featureId: "apps", name: "Mini Apps", canonicalImport: "@/features/apps",
    domain: "system", riskTier: "R0", status: "beta",
    ownedRoutes: ["/apps", "/apps/email", "/apps/gallery", "/apps/health", "/apps/messenger", "/apps/vault", "/apps/weather"],
    ownedApps: [], runtimeSupport: [...WEB_DESKTOP], stateGrammar: [...CORE_STATES],
    proofCoverage: PARTIAL_PROOF, supportIntegrated: false, trustIntegrated: false,
  },
  {
    featureId: "atlas", name: "Atlas Admin", canonicalImport: "@/features/atlas",
    domain: "system", riskTier: "R2", status: "beta",
    ownedRoutes: ["/atlas"], ownedApps: [],
    runtimeSupport: [...WEB_DESKTOP], stateGrammar: [...CORE_STATES],
    proofCoverage: PARTIAL_PROOF, supportIntegrated: true, trustIntegrated: false,
  },
  {
    featureId: "cloud", name: "Cloud Services", canonicalImport: "@/features/cloud",
    domain: "system", riskTier: "R1", status: "beta",
    ownedRoutes: ["/cloud"], ownedApps: [],
    runtimeSupport: [...ALL_TIERS], stateGrammar: [...CORE_STATES],
    proofCoverage: PARTIAL_PROOF, supportIntegrated: true, trustIntegrated: false,
  },
  {
    featureId: "digital-presence", name: "Digital Presence", canonicalImport: "@/features/digital-presence",
    domain: "business", riskTier: "R1", status: "alpha",
    ownedRoutes: ["/digital-presence"], ownedApps: [],
    runtimeSupport: [...WEB_DESKTOP], stateGrammar: [...CORE_STATES],
    proofCoverage: PARTIAL_PROOF, supportIntegrated: false, trustIntegrated: false,
  },
  {
    featureId: "enterprise", name: "Enterprise Control Plane", canonicalImport: "@/features/enterprise",
    domain: "system", riskTier: "R3", status: "alpha",
    ownedRoutes: ["/enterprise"], ownedApps: [],
    runtimeSupport: [...WEB_DESKTOP], stateGrammar: [...CORE_STATES],
    proofCoverage: PARTIAL_PROOF, supportIntegrated: true, trustIntegrated: true,
  },
  {
    featureId: "home", name: "Home", canonicalImport: "@/features/home",
    domain: "system", riskTier: "R0", status: "ga",
    ownedRoutes: ["/", "/home", "/desktop", "/nova-desktop"], ownedApps: [],
    runtimeSupport: [...ALL_TIERS], stateGrammar: [...CORE_STATES],
    proofCoverage: CORE_PROOF, supportIntegrated: false, trustIntegrated: false,
  },
  {
    featureId: "integrations", name: "Integrations", canonicalImport: "@/features/integrations",
    domain: "system", riskTier: "R2", status: "beta",
    ownedRoutes: ["/integrations", "/connectors"], ownedApps: [],
    runtimeSupport: [...ALL_TIERS], stateGrammar: [...CORE_STATES],
    proofCoverage: PARTIAL_PROOF, supportIntegrated: true, trustIntegrated: false,
  },
  {
    featureId: "intelligence", name: "Intelligence", canonicalImport: "@/features/intelligence",
    domain: "cross-domain", riskTier: "R2", status: "alpha",
    ownedRoutes: ["/intelligence"], ownedApps: [],
    runtimeSupport: [...WEB_DESKTOP], stateGrammar: [...CORE_STATES],
    proofCoverage: PARTIAL_PROOF, supportIntegrated: false, trustIntegrated: false,
  },
  {
    featureId: "mission", name: "Mission", canonicalImport: "@/features/mission",
    domain: "cross-domain", riskTier: "R1", status: "alpha",
    ownedRoutes: ["/mission"], ownedApps: [],
    runtimeSupport: [...ALL_TIERS], stateGrammar: [...CORE_STATES],
    proofCoverage: PARTIAL_PROOF, supportIntegrated: false, trustIntegrated: false,
  },
  {
    featureId: "mission-control", name: "Mission Control", canonicalImport: "@/features/mission-control",
    domain: "system", riskTier: "R1", status: "beta",
    ownedRoutes: ["/mission-control"], ownedApps: ["mission-control-app"],
    runtimeSupport: [...ALL_TIERS], stateGrammar: [...CORE_STATES],
    proofCoverage: PARTIAL_PROOF, supportIntegrated: true, trustIntegrated: false,
  },
  {
    featureId: "mobile", name: "Mobile", canonicalImport: "@/features/mobile",
    domain: "system", riskTier: "R1", status: "alpha",
    ownedRoutes: ["/m"], ownedApps: [],
    runtimeSupport: ["WEB_APP"], stateGrammar: [...CORE_STATES],
    proofCoverage: PARTIAL_PROOF, supportIntegrated: false, trustIntegrated: false,
  },
  {
    featureId: "notifications", name: "Notifications", canonicalImport: "@/features/notifications",
    domain: "system", riskTier: "R1", status: "beta",
    ownedRoutes: ["/notifications"], ownedApps: [],
    runtimeSupport: [...ALL_TIERS], stateGrammar: [...CORE_STATES],
    proofCoverage: PARTIAL_PROOF, supportIntegrated: true, trustIntegrated: false,
  },
  {
    featureId: "onboarding", name: "Onboarding", canonicalImport: "@/features/onboarding",
    domain: "system", riskTier: "R1", status: "beta",
    ownedRoutes: ["/onboarding"], ownedApps: [],
    runtimeSupport: [...ALL_TIERS], stateGrammar: [...CORE_STATES],
    proofCoverage: PARTIAL_PROOF, supportIntegrated: false, trustIntegrated: false,
  },
  {
    featureId: "owner", name: "Owner", canonicalImport: "@/features/owner",
    domain: "system", riskTier: "R3", status: "beta",
    ownedRoutes: ["/owner"], ownedApps: [],
    runtimeSupport: [...WEB_DESKTOP], stateGrammar: [...FULL_STATES],
    proofCoverage: CORE_PROOF, supportIntegrated: true, trustIntegrated: true,
  },
  {
    featureId: "owner-mode", name: "Owner Mode", canonicalImport: "@/features/owner-mode",
    domain: "system", riskTier: "R3", status: "beta",
    ownedRoutes: ["/owner-mode"], ownedApps: [],
    runtimeSupport: [...WEB_DESKTOP], stateGrammar: [...FULL_STATES],
    proofCoverage: CORE_PROOF, supportIntegrated: true, trustIntegrated: true,
  },
  {
    featureId: "revenue-office", name: "Revenue Office", canonicalImport: "@/features/revenue-office",
    domain: "finance", riskTier: "R2", status: "alpha",
    ownedRoutes: ["/revenue"], ownedApps: [],
    runtimeSupport: [...WEB_DESKTOP], stateGrammar: [...CORE_STATES],
    proofCoverage: PARTIAL_PROOF, supportIntegrated: false, trustIntegrated: false,
  },
  {
    featureId: "settings", name: "Settings", canonicalImport: "@/features/settings",
    domain: "system", riskTier: "R1", status: "ga",
    ownedRoutes: ["/settings"], ownedApps: [],
    runtimeSupport: [...ALL_TIERS], stateGrammar: [...CORE_STATES],
    proofCoverage: CORE_PROOF, supportIntegrated: true, trustIntegrated: false,
  },
  {
    featureId: "simulation", name: "Simulation", canonicalImport: "@/features/simulation",
    domain: "cross-domain", riskTier: "R2", status: "alpha",
    ownedRoutes: ["/simulation"], ownedApps: [],
    runtimeSupport: [...WEB_DESKTOP], stateGrammar: [...CORE_STATES],
    proofCoverage: PARTIAL_PROOF, supportIntegrated: false, trustIntegrated: false,
  },
  {
    featureId: "store", name: "Store", canonicalImport: "@/features/store",
    domain: "system", riskTier: "R1", status: "alpha",
    ownedRoutes: ["/store"], ownedApps: ["app-store"],
    runtimeSupport: [...ALL_TIERS], stateGrammar: [...CORE_STATES],
    proofCoverage: PARTIAL_PROOF, supportIntegrated: false, trustIntegrated: false,
  },
  {
    featureId: "workspace", name: "Workspace", canonicalImport: "@/features/workspace",
    domain: "system", riskTier: "R1", status: "beta",
    ownedRoutes: ["/workspace"], ownedApps: [],
    runtimeSupport: [...ALL_TIERS], stateGrammar: [...CORE_STATES],
    proofCoverage: PARTIAL_PROOF, supportIntegrated: false, trustIntegrated: false,
  },
];

// ── Lookup Helpers ─────────────────────────────────────────────

export const getFeatureSurface = (id: string): FeatureSurfaceEntry | undefined =>
  FEATURE_REGISTRY.find(f => f.featureId === id);

export const getFeatureByRoute = (route: string): FeatureSurfaceEntry | undefined =>
  FEATURE_REGISTRY.find(f => f.ownedRoutes.some(r => route.startsWith(r)));

export const getFeaturesByDomain = (domain: string): readonly FeatureSurfaceEntry[] =>
  FEATURE_REGISTRY.filter(f => f.domain === domain);

export const getFeaturesWithProofGaps = (): readonly FeatureSurfaceEntry[] =>
  FEATURE_REGISTRY.filter(f =>
    Object.values(f.proofCoverage).some(v => v === "missing"),
  );

export const getFeaturesWithoutTrustIntegration = (): readonly FeatureSurfaceEntry[] =>
  FEATURE_REGISTRY.filter(f => !f.trustIntegrated && (f.riskTier === "R3" || f.riskTier === "R4" || f.riskTier === "R5"));