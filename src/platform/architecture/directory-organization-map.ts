// ═══════════════════════════════════════════════════════════════
// SITA OS — Directory Organization Map
// Authority file for src/ reorganization via barrel re-exports.
// ═══════════════════════════════════════════════════════════════

export type MigrationStatus = "barrel-only" | "physically-moved" | "planned";

export interface DirectoryMapping {
  canonicalPath: string;
  legacyPaths: string[];
  status: MigrationStatus;
  description: string;
}

export const DIRECTORY_ORGANIZATION_MAP: DirectoryMapping[] = [
  // ── Features (user-facing domains) ──
  { canonicalPath: "src/features/advisors", legacyPaths: ["src/components/advisors"], status: "barrel-only", description: "Advisor council UI" },
  { canonicalPath: "src/features/ai", legacyPaths: ["src/components/ai"], status: "barrel-only", description: "AI feature components" },
  { canonicalPath: "src/features/app-platform", legacyPaths: ["src/components/sita/apps"], status: "barrel-only", description: "App platform shells" },
  { canonicalPath: "src/features/apps", legacyPaths: ["src/pages/apps"], status: "barrel-only", description: "Standalone apps" },
  { canonicalPath: "src/features/atlas", legacyPaths: ["src/pages/atlas"], status: "barrel-only", description: "Atlas hub & operations" },
  { canonicalPath: "src/features/auth", legacyPaths: ["src/components/auth", "src/pages/auth"], status: "barrel-only", description: "Authentication feature" },
  { canonicalPath: "src/features/boardroom", legacyPaths: ["src/components/sita/apps/boardroom", "src/pages/Boardroom*"], status: "barrel-only", description: "Boardroom decision chamber" },
  { canonicalPath: "src/features/business", legacyPaths: ["src/components/business", "src/pages/business", "src/pages/BusinessCenter.tsx"], status: "barrel-only", description: "Business domain UI" },
  { canonicalPath: "src/features/business/autopilot", legacyPaths: ["src/components/autopilot"], status: "barrel-only", description: "Business autopilot" },
  { canonicalPath: "src/features/business/crm", legacyPaths: ["src/components/business/crm", "src/components/business/CRM*"], status: "barrel-only", description: "CRM sub-feature" },
  { canonicalPath: "src/features/business/leads", legacyPaths: ["src/components/business/lead-inbox"], status: "barrel-only", description: "Lead inbox & triage" },
  { canonicalPath: "src/features/cloud", legacyPaths: ["src/components/cloud"], status: "barrel-only", description: "Cloud feature UI" },
  { canonicalPath: "src/features/concierge", legacyPaths: ["src/components/concierge", "src/pages/concierge"], status: "barrel-only", description: "Concierge / life admin" },
  { canonicalPath: "src/features/digital-presence", legacyPaths: ["src/pages/digital-presence"], status: "barrel-only", description: "Digital presence office" },
  { canonicalPath: "src/features/enterprise", legacyPaths: ["src/pages/enterprise"], status: "barrel-only", description: "Enterprise control plane" },
  { canonicalPath: "src/features/files", legacyPaths: ["src/components/files", "src/pages/files"], status: "barrel-only", description: "File management" },
  { canonicalPath: "src/features/home", legacyPaths: ["src/components/user-app"], status: "barrel-only", description: "Home / pulse UI" },
  { canonicalPath: "src/features/integrations", legacyPaths: ["src/pages/integrations"], status: "barrel-only", description: "Integrations catalog" },
  { canonicalPath: "src/features/intelligence", legacyPaths: ["src/components/intelligence"], status: "barrel-only", description: "Explainability & orchestration flow" },
  { canonicalPath: "src/features/investment-office", legacyPaths: ["src/components/investment", "src/pages/investment-office"], status: "barrel-only", description: "Investment office" },
  { canonicalPath: "src/features/mission", legacyPaths: ["src/pages/mission"], status: "barrel-only", description: "Mission pages" },
  { canonicalPath: "src/features/mission-control", legacyPaths: ["src/pages/mission-control"], status: "barrel-only", description: "Mission control" },
  { canonicalPath: "src/features/mobile", legacyPaths: ["src/components/mobile", "src/pages/mobile"], status: "barrel-only", description: "Mobile surface" },
  { canonicalPath: "src/features/money", legacyPaths: ["src/components/money", "src/components/finance", "src/pages/money"], status: "barrel-only", description: "Money & finance UI" },
  { canonicalPath: "src/features/money/finance", legacyPaths: ["src/components/finance"], status: "barrel-only", description: "Finance sub-feature" },
  { canonicalPath: "src/features/notifications", legacyPaths: ["src/components/notifications"], status: "barrel-only", description: "Notification inbox" },
  { canonicalPath: "src/features/onboarding", legacyPaths: ["src/components/sita/onboarding"], status: "barrel-only", description: "First-use ceremony" },
  { canonicalPath: "src/features/owner", legacyPaths: ["src/pages/owner"], status: "barrel-only", description: "Owner pages" },
  { canonicalPath: "src/features/owner-mode", legacyPaths: ["src/pages/owner-mode"], status: "barrel-only", description: "Owner mode" },
  { canonicalPath: "src/features/revenue-office", legacyPaths: ["src/components/revenue-office", "src/pages/revenue-office"], status: "barrel-only", description: "Revenue office" },
  { canonicalPath: "src/features/settings", legacyPaths: ["src/pages/settings"], status: "barrel-only", description: "User settings" },
  { canonicalPath: "src/features/simulation", legacyPaths: ["src/components/simulation"], status: "barrel-only", description: "Simulation engine UI" },
  { canonicalPath: "src/features/store", legacyPaths: ["src/pages/store"], status: "barrel-only", description: "Pack store" },
  { canonicalPath: "src/features/workspace", legacyPaths: ["src/pages/workspace"], status: "barrel-only", description: "Workspace pages" },

  // ── Admin modules ──
  { canonicalPath: "src/admin/modules/ai", legacyPaths: ["src/components/admin-ai", "src/pages/admin/ai-*"], status: "barrel-only", description: "AI workforce admin" },
  { canonicalPath: "src/admin/modules/architecture", legacyPaths: ["src/components/admin/architecture"], status: "barrel-only", description: "Architecture governance admin" },
  { canonicalPath: "src/admin/modules/cloud", legacyPaths: ["src/pages/admin/Cloud*"], status: "barrel-only", description: "Cloud admin" },
  { canonicalPath: "src/admin/modules/intelligence", legacyPaths: ["src/components/admin/shells/LearningYou*", "src/components/admin/shells/Simulation*"], status: "barrel-only", description: "Intelligence / learning admin" },
  { canonicalPath: "src/admin/modules/operations", legacyPaths: ["src/components/admin/Fleet*", "src/components/admin/shells/Emergency*", "src/components/admin/shells/Safe*"], status: "barrel-only", description: "Operations & safety admin" },
  { canonicalPath: "src/admin/modules/runtime", legacyPaths: ["src/components/admin-os"], status: "barrel-only", description: "Runtime observability admin" },
  { canonicalPath: "src/admin/modules/security", legacyPaths: ["src/pages/admin/SEC*"], status: "barrel-only", description: "Security admin" },
  { canonicalPath: "src/admin/modules/verification", legacyPaths: ["src/pages/admin/ITC*", "src/pages/admin/V*"], status: "barrel-only", description: "Verification / truth admin" },
  { canonicalPath: "src/admin/shell", legacyPaths: ["src/components/admin/shells"], status: "barrel-only", description: "Admin shell components" },
  { canonicalPath: "src/admin/navigation", legacyPaths: ["src/components/admin/*SubNav*"], status: "barrel-only", description: "Admin sub-navigation" },
  { canonicalPath: "src/admin/components", legacyPaths: ["src/components/admin/panels", "src/components/admin/Admin*"], status: "barrel-only", description: "Admin shared components" },
  { canonicalPath: "src/admin/hooks", legacyPaths: [], status: "barrel-only", description: "Admin hooks" },
  { canonicalPath: "src/admin/routes", legacyPaths: ["src/routes/AdminRoutes*"], status: "barrel-only", description: "Admin route configuration" },
  { canonicalPath: "src/admin/state", legacyPaths: [], status: "barrel-only", description: "Admin state management" },

  // ── Admin page domains ──
  { canonicalPath: "src/admin/pages", legacyPaths: ["src/pages/admin"], status: "barrel-only", description: "Admin page entry points" },
  { canonicalPath: "src/admin/pages/home", legacyPaths: ["src/pages/admin/AdminDashboard*", "src/pages/admin/MissionControlHome*"], status: "barrel-only", description: "Admin home dashboards" },
  { canonicalPath: "src/admin/pages/ai", legacyPaths: ["src/pages/admin/AI*", "src/pages/admin/AIG*", "src/pages/admin/AIT*", "src/pages/admin/Advisor*", "src/pages/admin/BrainCore*", "src/pages/admin/sag/"], status: "barrel-only", description: "AI control plane pages" },
  { canonicalPath: "src/admin/pages/runtime", legacyPaths: ["src/pages/admin/AND*", "src/pages/admin/APL*", "src/pages/admin/DWE*", "src/pages/admin/UAO*", "src/pages/admin/MSA*", "src/pages/admin/DRS*", "src/pages/admin/NRC*", "src/pages/admin/NSS*", "src/pages/admin/HRS*", "src/pages/admin/NOT*"], status: "barrel-only", description: "Runtime/device/surface pages" },
  { canonicalPath: "src/admin/pages/operations", legacyPaths: ["src/pages/admin/AR*", "src/pages/admin/ActionLineage*", "src/pages/admin/AlertTriage*", "src/pages/admin/Delivery*", "src/pages/admin/Fleet*", "src/pages/admin/System*", "src/pages/admin/Release*"], status: "barrel-only", description: "Operations/automation pages" },
  { canonicalPath: "src/admin/pages/intelligence", legacyPaths: ["src/pages/admin/CAI*", "src/pages/admin/intelligence/"], status: "barrel-only", description: "Customer intelligence pages" },
  { canonicalPath: "src/admin/pages/integrations", legacyPaths: ["src/pages/admin/CN*", "src/pages/admin/ISA*", "src/pages/admin/PFA*", "src/pages/admin/Connector*", "src/pages/admin/Integration*"], status: "barrel-only", description: "Integration governance pages" },
  { canonicalPath: "src/admin/pages/launch", legacyPaths: ["src/pages/admin/LT*", "src/pages/admin/LaunchHonesty*", "src/pages/admin/launch/"], status: "barrel-only", description: "Launch honesty/readiness pages" },
  { canonicalPath: "src/admin/pages/governance", legacyPaths: ["src/pages/admin/fip/", "src/pages/admin/platform-law/", "src/pages/admin/implementation-truth/", "src/pages/admin/Policy*", "src/pages/admin/Proof*", "src/pages/admin/Truth*"], status: "barrel-only", description: "Governance/policy/compliance pages" },
  { canonicalPath: "src/admin/pages/strategic", legacyPaths: ["src/pages/admin/strategic/", "src/pages/admin/Outcome*"], status: "barrel-only", description: "Strategic/economics pages" },
  { canonicalPath: "src/admin/pages/security", legacyPaths: ["src/pages/admin/Security*", "src/pages/admin/security/"], status: "barrel-only", description: "Security admin pages" },
  { canonicalPath: "src/admin/pages/architecture", legacyPaths: ["src/pages/admin/architecture/", "src/pages/admin/SERV*", "src/pages/admin/Canonical*", "src/pages/admin/Change*", "src/pages/admin/CoreService*", "src/pages/admin/Dependency*", "src/pages/admin/Domain*", "src/pages/admin/Feature*"], status: "barrel-only", description: "Architecture/service mapping pages" },
  { canonicalPath: "src/admin/pages/support", legacyPaths: ["src/pages/admin/Incident*", "src/pages/admin/Communication*", "src/pages/admin/Builder*", "src/pages/admin/Founder*", "src/pages/admin/HQ*", "src/pages/admin/Team*", "src/pages/admin/User*"], status: "barrel-only", description: "Support/team operations pages" },
  { canonicalPath: "src/admin/pages/verification", legacyPaths: ["src/pages/admin/SRE*", "src/pages/admin/verification/", "src/pages/admin/customer-journey/", "src/pages/admin/frontend/", "src/pages/admin/Compositor*", "src/pages/admin/Contract*"], status: "barrel-only", description: "Verification/quality pages" },
  { canonicalPath: "src/admin/pages/reality-audit", legacyPaths: ["src/pages/admin/reality-audit/", "src/pages/admin/Reality*", "src/pages/admin/Mock*", "src/pages/admin/Simulated*"], status: "barrel-only", description: "Reality audit/demo/mock pages" },
  { canonicalPath: "src/admin/pages/fleet", legacyPaths: ["src/pages/admin/FL*", "src/pages/admin/FCC*", "src/pages/admin/ECO*", "src/pages/admin/OS01*", "src/pages/admin/SYS01*", "src/pages/admin/Kernel*", "src/pages/admin/cloud/"], status: "barrel-only", description: "Fleet/flagship/platform command pages" },

  // ── Platform ──
  { canonicalPath: "src/platform/auth", legacyPaths: ["src/contexts/AuthContext.tsx"], status: "barrel-only", description: "Auth platform layer" },
  { canonicalPath: "src/platform/governance", legacyPaths: ["src/lib/architecture", "src/components/governance"], status: "barrel-only", description: "Architecture governance" },
  { canonicalPath: "src/platform/notifications", legacyPaths: ["src/hooks/use-notification-*", "src/hooks/useNotifications*", "src/hooks/use-push-notifications*"], status: "barrel-only", description: "Notification platform" },
  { canonicalPath: "src/platform/observability", legacyPaths: ["src/hooks/useOrchestrationHealth*"], status: "barrel-only", description: "Observability hooks" },
  { canonicalPath: "src/platform/proof", legacyPaths: ["src/lib/orchestration/proof", "src/lib/services/projections/proof"], status: "barrel-only", description: "Proof orchestration" },
  { canonicalPath: "src/platform/runtime", legacyPaths: ["src/hooks/use-kernel-*", "src/hooks/use-os-api*", "src/hooks/use-backend-actions*", "src/hooks/useOSOrchestration*"], status: "barrel-only", description: "Runtime hooks" },
  { canonicalPath: "src/platform/search", legacyPaths: ["src/hooks/use-global-search*"], status: "barrel-only", description: "Search platform" },
  { canonicalPath: "src/platform/security", legacyPaths: ["src/hooks/use-security-fabric*", "src/hooks/useOSSecurity*"], status: "barrel-only", description: "Security platform" },
  { canonicalPath: "src/platform/setup", legacyPaths: ["src/hooks/useSetupOrchestration*", "src/hooks/useOnboardingDaemon*", "src/hooks/useUpdateDaemon*"], status: "barrel-only", description: "Setup & onboarding platform" },

  // ── Runtimes ──
  { canonicalPath: "src/runtimes/appliance", legacyPaths: ["src/components/sita/boot"], status: "barrel-only", description: "Appliance boot runtime" },
  { canonicalPath: "src/runtimes/desktop", legacyPaths: [], status: "barrel-only", description: "Desktop runtime (future)" },
  { canonicalPath: "src/runtimes/mobile", legacyPaths: ["src/components/mobile"], status: "barrel-only", description: "Mobile runtime" },
  { canonicalPath: "src/runtimes/reality", legacyPaths: ["src/components/reality", "src/hooks/useRealityClassifications*", "src/hooks/useRealityDetection*"], status: "barrel-only", description: "Reality mode runtime" },
  { canonicalPath: "src/runtimes/shell", legacyPaths: ["src/components/sita/shell", "src/components/sita/os"], status: "barrel-only", description: "Shell / OS runtime" },
  { canonicalPath: "src/runtimes/surfaces", legacyPaths: ["src/components/sita/surfaces"], status: "barrel-only", description: "Surface primitives" },

  // ── Shared components (Wave C: shim barrels physically removed; canonical owners listed) ──
  { canonicalPath: "src/platform/ai/components", legacyPaths: ["src/components/shared/ai", "src/components/ai/AIReceiptLink*", "src/components/ai/AIStateBadge*", "src/components/ai/AIResponsePanel*"], status: "physical-move", description: "Shared AI display components — owned by platform/ai" },
  { canonicalPath: "src/platform/sita/components/sita", legacyPaths: ["src/components/shared/sita", "src/components/sita/SitaCard*", "src/components/sita/PageSkeleton*", "src/components/sita/EmptyState*"], status: "physical-move", description: "Shared SITA branded UI — owned by platform/sita" },
  { canonicalPath: "src/platform/cloud/components", legacyPaths: ["src/components/shared/status", "src/components/cloud/PlatformDegradedBanner*"], status: "physical-move", description: "Status/degraded banners — owned by platform/cloud" },
  { canonicalPath: "src/components/NavLink", legacyPaths: ["src/components/navigation"], status: "physical-move", description: "NavLink primitive (kept at root; navigation/ barrel removed)" },
  { canonicalPath: "src/platform/sita/components/cards", legacyPaths: ["src/components/cards", "src/components/sita/cards"], status: "physical-move", description: "Card primitives — owned by platform/sita" },

  // ── Cross-cutting ──
  { canonicalPath: "src/contracts", legacyPaths: ["src/packages/contracts"], status: "barrel-only", description: "Contract types" },
  { canonicalPath: "src/data", legacyPaths: ["src/lib/data-services"], status: "barrel-only", description: "Data access layer" },
  { canonicalPath: "src/app", legacyPaths: ["src/App.tsx", "src/main.tsx"], status: "barrel-only", description: "App bootstrap" },
];

/**
 * Lookup the canonical path for a given legacy path prefix.
 */
export function getCanonicalPath(legacyPath: string): string | undefined {
  const entry = DIRECTORY_ORGANIZATION_MAP.find(m =>
    m.legacyPaths.some(lp => legacyPath.startsWith(lp.replace("*", "")))
  );
  return entry?.canonicalPath;
}
