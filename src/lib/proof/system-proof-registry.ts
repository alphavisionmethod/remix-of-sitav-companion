// ═══════════════════════════════════════════════════════════════
// SITA OS — System Proof Registry
// Maps 14 major subsystems to proof coverage across 7 categories.
// ═══════════════════════════════════════════════════════════════

import type { HardProofCategory } from "./proof-category-model";

export type SubsystemId =
  | "ai-runtime" | "advisor-boardroom" | "connectors" | "app-platform"
  | "frontend" | "mobile" | "desktop" | "os-runtime"
  | "security" | "admin" | "release" | "truth-governance"
  | "notifications" | "search";

export type ProofStatus = "present" | "partial" | "missing";

export interface SubsystemProofEntry {
  readonly subsystem: SubsystemId;
  readonly displayName: string;
  readonly category: HardProofCategory;
  readonly status: ProofStatus;
  readonly evidenceRefs: readonly string[];
  readonly notes?: string;
}

export const SYSTEM_PROOF_REGISTRY: readonly SubsystemProofEntry[] = [
  // AI Runtime
  { subsystem: "ai-runtime",         displayName: "AI Runtime",          category: "IMPLEMENTATION", status: "present", evidenceRefs: ["src/lib/ai-platform/", "src/packages/ai-contracts/"] },
  { subsystem: "ai-runtime",         displayName: "AI Runtime",          category: "WIRING",         status: "present", evidenceRefs: ["src/planes/shared.ts#AIContracts", "src/platform/ai/"] },
  { subsystem: "ai-runtime",         displayName: "AI Runtime",          category: "BEHAVIOR",       status: "partial", evidenceRefs: ["supabase/functions/ai-gateway/"], notes: "E2E coverage partial" },
  { subsystem: "ai-runtime",         displayName: "AI Runtime",          category: "FAILURE",        status: "partial", evidenceRefs: ["src/lib/ai-platform/ai-fallback.ts"], notes: "Fallback chain exists, chaos drills missing" },
  { subsystem: "ai-runtime",         displayName: "AI Runtime",          category: "RECOVERY",       status: "partial", evidenceRefs: [], notes: "Budget recovery exists, full state recovery untested" },
  { subsystem: "ai-runtime",         displayName: "AI Runtime",          category: "OPERATIONAL",    status: "present", evidenceRefs: ["src/lib/ai-platform/ai-telemetry.ts", "generated/ai-receipt-completeness-report.json"] },
  { subsystem: "ai-runtime",         displayName: "AI Runtime",          category: "RELEASE",        status: "present", evidenceRefs: ["scripts/release/checks/"] },

  // Advisor / Boardroom
  { subsystem: "advisor-boardroom",  displayName: "Advisor Boardroom",   category: "IMPLEMENTATION", status: "present", evidenceRefs: ["src/domains/boardroom/", "src/packages/boardroom-contracts/"] },
  { subsystem: "advisor-boardroom",  displayName: "Advisor Boardroom",   category: "WIRING",         status: "present", evidenceRefs: ["src/planes/shared.ts#BoardroomContracts"] },
  { subsystem: "advisor-boardroom",  displayName: "Advisor Boardroom",   category: "BEHAVIOR",       status: "partial", evidenceRefs: [], notes: "UI renders, e2e action flow partial" },
  { subsystem: "advisor-boardroom",  displayName: "Advisor Boardroom",   category: "FAILURE",        status: "partial", evidenceRefs: [], notes: "Error boundaries exist, advisor failure isolation untested" },
  { subsystem: "advisor-boardroom",  displayName: "Advisor Boardroom",   category: "RECOVERY",       status: "missing", evidenceRefs: [], notes: "No rollback drill evidence" },
  { subsystem: "advisor-boardroom",  displayName: "Advisor Boardroom",   category: "OPERATIONAL",    status: "present", evidenceRefs: ["src/lib/platform/proof/proof-registry.ts"] },
  { subsystem: "advisor-boardroom",  displayName: "Advisor Boardroom",   category: "RELEASE",        status: "present", evidenceRefs: ["scripts/release/checks/"] },

  // Connectors
  { subsystem: "connectors",         displayName: "Connectors",          category: "IMPLEMENTATION", status: "present", evidenceRefs: ["src/domains/integrations/"] },
  { subsystem: "connectors",         displayName: "Connectors",          category: "WIRING",         status: "present", evidenceRefs: ["src/platform/integrations/"] },
  { subsystem: "connectors",         displayName: "Connectors",          category: "BEHAVIOR",       status: "partial", evidenceRefs: [], notes: "Sync flows partial" },
  { subsystem: "connectors",         displayName: "Connectors",          category: "FAILURE",        status: "partial", evidenceRefs: [], notes: "Retry logic exists, failure isolation incomplete" },
  { subsystem: "connectors",         displayName: "Connectors",          category: "RECOVERY",       status: "missing", evidenceRefs: [], notes: "No reconnection drill" },
  { subsystem: "connectors",         displayName: "Connectors",          category: "OPERATIONAL",    status: "present", evidenceRefs: ["src/lib/platform/observability/"] },
  { subsystem: "connectors",         displayName: "Connectors",          category: "RELEASE",        status: "present", evidenceRefs: ["scripts/release/checks/"] },

  // App Platform
  { subsystem: "app-platform",       displayName: "App Platform",        category: "IMPLEMENTATION", status: "present", evidenceRefs: ["src/lib/app-platform/"] },
  { subsystem: "app-platform",       displayName: "App Platform",        category: "WIRING",         status: "present", evidenceRefs: ["src/planes/product.ts"] },
  { subsystem: "app-platform",       displayName: "App Platform",        category: "BEHAVIOR",       status: "present", evidenceRefs: ["src/shell-runtime/launcher-profile.ts"] },
  { subsystem: "app-platform",       displayName: "App Platform",        category: "FAILURE",        status: "partial", evidenceRefs: [], notes: "App crash isolation partial" },
  { subsystem: "app-platform",       displayName: "App Platform",        category: "RECOVERY",       status: "partial", evidenceRefs: [], notes: "State persistence exists via sessionStorage" },
  { subsystem: "app-platform",       displayName: "App Platform",        category: "OPERATIONAL",    status: "present", evidenceRefs: ["src/shell-runtime/"] },
  { subsystem: "app-platform",       displayName: "App Platform",        category: "RELEASE",        status: "present", evidenceRefs: ["scripts/release/checks/"] },

  // Frontend
  { subsystem: "frontend",           displayName: "Frontend",            category: "IMPLEMENTATION", status: "present", evidenceRefs: ["src/pages/", "src/components/"] },
  { subsystem: "frontend",           displayName: "Frontend",            category: "WIRING",         status: "present", evidenceRefs: ["src/routes/"] },
  { subsystem: "frontend",           displayName: "Frontend",            category: "BEHAVIOR",       status: "partial", evidenceRefs: [], notes: "1,079 pages exist, e2e coverage partial" },
  { subsystem: "frontend",           displayName: "Frontend",            category: "FAILURE",        status: "partial", evidenceRefs: ["src/components/ui/error-boundary.tsx"], notes: "Error boundaries exist, not all routes wrapped" },
  { subsystem: "frontend",           displayName: "Frontend",            category: "RECOVERY",       status: "partial", evidenceRefs: [], notes: "Browser back/forward works, deep state recovery partial" },
  { subsystem: "frontend",           displayName: "Frontend",            category: "OPERATIONAL",    status: "present", evidenceRefs: ["src/lib/platform/observability/"] },
  { subsystem: "frontend",           displayName: "Frontend",            category: "RELEASE",        status: "present", evidenceRefs: ["vite.config.ts"] },

  // Mobile
  { subsystem: "mobile",             displayName: "Mobile",              category: "IMPLEMENTATION", status: "present", evidenceRefs: ["src/lib/mobile/"] },
  { subsystem: "mobile",             displayName: "Mobile",              category: "WIRING",         status: "present", evidenceRefs: ["scripts/mobile/"] },
  { subsystem: "mobile",             displayName: "Mobile",              category: "BEHAVIOR",       status: "partial", evidenceRefs: [], notes: "PWA mode, native untested" },
  { subsystem: "mobile",             displayName: "Mobile",              category: "FAILURE",        status: "partial", evidenceRefs: ["src/lib/mobile/offline-queue.ts"] },
  { subsystem: "mobile",             displayName: "Mobile",              category: "RECOVERY",       status: "partial", evidenceRefs: [], notes: "Offline queue recovery exists" },
  { subsystem: "mobile",             displayName: "Mobile",              category: "OPERATIONAL",    status: "present", evidenceRefs: ["generated/mobile-supportability-report.json"] },
  { subsystem: "mobile",             displayName: "Mobile",              category: "RELEASE",        status: "present", evidenceRefs: ["generated/mobile-signing-proof-report.json"] },

  // Desktop
  { subsystem: "desktop",            displayName: "Desktop",             category: "IMPLEMENTATION", status: "present", evidenceRefs: ["src/lib/desktop/"] },
  { subsystem: "desktop",            displayName: "Desktop",             category: "WIRING",         status: "present", evidenceRefs: ["scripts/release/checks/check-desktop-signing-notarization.ts"] },
  { subsystem: "desktop",            displayName: "Desktop",             category: "BEHAVIOR",       status: "partial", evidenceRefs: [], notes: "Electron shell exists, e2e incomplete" },
  { subsystem: "desktop",            displayName: "Desktop",             category: "FAILURE",        status: "missing", evidenceRefs: [], notes: "No crash recovery drill" },
  { subsystem: "desktop",            displayName: "Desktop",             category: "RECOVERY",       status: "missing", evidenceRefs: [], notes: "No auto-update rollback drill" },
  { subsystem: "desktop",            displayName: "Desktop",             category: "OPERATIONAL",    status: "partial", evidenceRefs: [], notes: "Basic logging, no structured diagnostics" },
  { subsystem: "desktop",            displayName: "Desktop",             category: "RELEASE",        status: "present", evidenceRefs: ["generated/desktop-signing-notarization-report.json"] },

  // OS Runtime
  { subsystem: "os-runtime",         displayName: "OS Runtime",          category: "IMPLEMENTATION", status: "present", evidenceRefs: ["src/runtimes/"] },
  { subsystem: "os-runtime",         displayName: "OS Runtime",          category: "WIRING",         status: "present", evidenceRefs: ["src/runtimes/feature-runtime-tier-registry.ts"] },
  { subsystem: "os-runtime",         displayName: "OS Runtime",          category: "BEHAVIOR",       status: "partial", evidenceRefs: [], notes: "Tier 1/2 tested, Tier 3/4 simulated" },
  { subsystem: "os-runtime",         displayName: "OS Runtime",          category: "FAILURE",        status: "partial", evidenceRefs: [], notes: "Kill-switch exists, full failure drill missing" },
  { subsystem: "os-runtime",         displayName: "OS Runtime",          category: "RECOVERY",       status: "missing", evidenceRefs: [], notes: "No OS-level recovery drill" },
  { subsystem: "os-runtime",         displayName: "OS Runtime",          category: "OPERATIONAL",    status: "present", evidenceRefs: ["generated/os-boot-validation-report.json"] },
  { subsystem: "os-runtime",         displayName: "OS Runtime",          category: "RELEASE",        status: "present", evidenceRefs: ["scripts/release/checks/check-os-boot-validation.ts"] },

  // Security
  { subsystem: "security",           displayName: "Security",            category: "IMPLEMENTATION", status: "present", evidenceRefs: ["src/lib/security/", "src/packages/auth/"] },
  { subsystem: "security",           displayName: "Security",            category: "WIRING",         status: "present", evidenceRefs: ["src/platform/auth/", "src/contexts/AuthContext.tsx"] },
  { subsystem: "security",           displayName: "Security",            category: "BEHAVIOR",       status: "present", evidenceRefs: ["src/packages/auth/index.ts#validateSession"] },
  { subsystem: "security",           displayName: "Security",            category: "FAILURE",        status: "partial", evidenceRefs: [], notes: "Session expiry handled, MFA failure path partial" },
  { subsystem: "security",           displayName: "Security",            category: "RECOVERY",       status: "partial", evidenceRefs: [], notes: "Session refresh exists, account recovery partial" },
  { subsystem: "security",           displayName: "Security",            category: "OPERATIONAL",    status: "present", evidenceRefs: ["src/packages/auth/index.ts#AuthAuditEntry"] },
  { subsystem: "security",           displayName: "Security",            category: "RELEASE",        status: "present", evidenceRefs: ["scripts/release/checks/"] },

  // Admin
  { subsystem: "admin",              displayName: "Admin",               category: "IMPLEMENTATION", status: "present", evidenceRefs: ["src/pages/admin/", "src/domains/admin/"] },
  { subsystem: "admin",              displayName: "Admin",               category: "WIRING",         status: "present", evidenceRefs: ["src/platform/architecture/route-plane-map.ts"] },
  { subsystem: "admin",              displayName: "Admin",               category: "BEHAVIOR",       status: "partial", evidenceRefs: [], notes: "Admin pages render, action flows partial" },
  { subsystem: "admin",              displayName: "Admin",               category: "FAILURE",        status: "partial", evidenceRefs: [], notes: "Admin error handling exists, not fully tested" },
  { subsystem: "admin",              displayName: "Admin",               category: "RECOVERY",       status: "missing", evidenceRefs: [], notes: "No admin state recovery drill" },
  { subsystem: "admin",              displayName: "Admin",               category: "OPERATIONAL",    status: "present", evidenceRefs: ["admin_action_audit table"] },
  { subsystem: "admin",              displayName: "Admin",               category: "RELEASE",        status: "present", evidenceRefs: ["scripts/release/checks/"] },

  // Release
  { subsystem: "release",            displayName: "Release",             category: "IMPLEMENTATION", status: "present", evidenceRefs: ["src/lib/release/", "scripts/release/"] },
  { subsystem: "release",            displayName: "Release",             category: "WIRING",         status: "present", evidenceRefs: ["scripts/architecture/checks/check-os-release-readiness.ts"] },
  { subsystem: "release",            displayName: "Release",             category: "BEHAVIOR",       status: "present", evidenceRefs: ["generated/release-evidence-packs-report.json"] },
  { subsystem: "release",            displayName: "Release",             category: "FAILURE",        status: "partial", evidenceRefs: [], notes: "Rollback mechanism defined, drill missing" },
  { subsystem: "release",            displayName: "Release",             category: "RECOVERY",       status: "partial", evidenceRefs: ["generated/install-upgrade-rollback-report.json"] },
  { subsystem: "release",            displayName: "Release",             category: "OPERATIONAL",    status: "present", evidenceRefs: ["generated/release-channel-migration-report.json"] },
  { subsystem: "release",            displayName: "Release",             category: "RELEASE",        status: "present", evidenceRefs: ["generated/checksum-publication-report.json", "generated/provenance-attestation-report.json"] },

  // Truth Governance
  { subsystem: "truth-governance",   displayName: "Truth Governance",    category: "IMPLEMENTATION", status: "present", evidenceRefs: ["src/lib/truth/"] },
  { subsystem: "truth-governance",   displayName: "Truth Governance",    category: "WIRING",         status: "present", evidenceRefs: ["scripts/truth/check-truth-governance.ts"] },
  { subsystem: "truth-governance",   displayName: "Truth Governance",    category: "BEHAVIOR",       status: "present", evidenceRefs: ["generated/truth-governance-report.json"] },
  { subsystem: "truth-governance",   displayName: "Truth Governance",    category: "FAILURE",        status: "partial", evidenceRefs: [], notes: "Contradiction detection works, no chaos drill" },
  { subsystem: "truth-governance",   displayName: "Truth Governance",    category: "RECOVERY",       status: "partial", evidenceRefs: ["generated/stale-artifact-invalidations.json"] },
  { subsystem: "truth-governance",   displayName: "Truth Governance",    category: "OPERATIONAL",    status: "present", evidenceRefs: ["generated/claim-confidence-report.json"] },
  { subsystem: "truth-governance",   displayName: "Truth Governance",    category: "RELEASE",        status: "present", evidenceRefs: ["scripts/architecture/checks/check-os-release-readiness.ts"] },

  // Notifications
  { subsystem: "notifications",      displayName: "Notifications",       category: "IMPLEMENTATION", status: "present", evidenceRefs: ["src/hooks/useNotifications.ts", "src/hooks/use-push-notifications.ts"] },
  { subsystem: "notifications",      displayName: "Notifications",       category: "WIRING",         status: "present", evidenceRefs: ["src/platform/notifications/index.ts"] },
  { subsystem: "notifications",      displayName: "Notifications",       category: "BEHAVIOR",       status: "partial", evidenceRefs: [], notes: "Hook renders, push untested in production" },
  { subsystem: "notifications",      displayName: "Notifications",       category: "FAILURE",        status: "missing", evidenceRefs: [], notes: "No notification failure handling" },
  { subsystem: "notifications",      displayName: "Notifications",       category: "RECOVERY",       status: "missing", evidenceRefs: [], notes: "No missed-notification recovery" },
  { subsystem: "notifications",      displayName: "Notifications",       category: "OPERATIONAL",    status: "partial", evidenceRefs: [], notes: "Basic logging only" },
  { subsystem: "notifications",      displayName: "Notifications",       category: "RELEASE",        status: "present", evidenceRefs: ["generated/mobile-push-cert-lifecycle-report.json"] },

  // Search
  { subsystem: "search",             displayName: "Search",              category: "IMPLEMENTATION", status: "present", evidenceRefs: ["src/hooks/use-global-search.ts", "src/components/sita/CommandPalette.tsx"] },
  { subsystem: "search",             displayName: "Search",              category: "WIRING",         status: "present", evidenceRefs: ["src/platform/search/index.ts", "src/shell-runtime/command-profile.ts"] },
  { subsystem: "search",             displayName: "Search",              category: "BEHAVIOR",       status: "partial", evidenceRefs: [], notes: "Palette renders, cross-domain search partial" },
  { subsystem: "search",             displayName: "Search",              category: "FAILURE",        status: "missing", evidenceRefs: [], notes: "No search failure fallback" },
  { subsystem: "search",             displayName: "Search",              category: "RECOVERY",       status: "missing", evidenceRefs: [], notes: "No search state recovery" },
  { subsystem: "search",             displayName: "Search",              category: "OPERATIONAL",    status: "partial", evidenceRefs: [], notes: "Basic logging only" },
  { subsystem: "search",             displayName: "Search",              category: "RELEASE",        status: "present", evidenceRefs: [] },
] as const;