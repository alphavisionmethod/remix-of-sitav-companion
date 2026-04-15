// ═══════════════════════════════════════════════════════════════
// SITA OS — Page Consolidation Map
// Maps old/competing pages to canonical destinations.
// This is the single authority for what merged where.
// ═══════════════════════════════════════════════════════════════

export type MergeAction =
  | "KEEP_AS_PRIMARY"
  | "KEEP_AS_SUBVIEW"
  | "MERGE_INTO_OTHER_PAGE"
  | "REDIRECT_TO_CANONICAL_PAGE"
  | "DEPRECATE_WITH_WRAPPER"
  | "SYSTEM_UTILITY"
  | "AUTH_FLOW";

export interface PageConsolidationEntry {
  /** Original page component name */
  component: string;
  /** Original route path (if routed) */
  oldRoute?: string;
  /** Consolidation action */
  action: MergeAction;
  /** Canonical domain it now belongs to */
  canonicalDomain: string;
  /** If merged/redirected, target component or route */
  mergeTarget?: string;
  /** Whether a redirect wrapper is needed */
  needsRedirectWrapper: boolean;
  /** Notes on unique functionality preserved */
  notes?: string;
}

// ── Admin Consolidation ─────────────────────────────────────────
// Maps competing admin pages to the 10-domain canonical structure

export const ADMIN_CONSOLIDATION: PageConsolidationEntry[] = [
  // Domain 1: Executive Overview — merge competing overview pages
  { component: "AdminDashboard", oldRoute: "/admin/dashboard", action: "REDIRECT_TO_CANONICAL_PAGE", canonicalDomain: "admin-overview", mergeTarget: "/admin/overview", needsRedirectWrapper: true, notes: "Primary admin landing merged into /admin/overview" },
  { component: "AdminOperationsHub", action: "MERGE_INTO_OTHER_PAGE", canonicalDomain: "admin-overview", mergeTarget: "AdminOverview", needsRedirectWrapper: false, notes: "Ops summary widgets merged into executive overview" },
  { component: "MissionControlHome", action: "KEEP_AS_PRIMARY", canonicalDomain: "admin-overview", needsRedirectWrapper: false, notes: "Serves as the canonical overview module inside MissionControlAppShell" },
  { component: "PlatformTruthDashboard", action: "MERGE_INTO_OTHER_PAGE", canonicalDomain: "admin-verification", mergeTarget: "AdminVerification", needsRedirectWrapper: false, notes: "Truth posture merged into verification domain" },
  { component: "SystemHealthDashboard", action: "REDIRECT_TO_CANONICAL_PAGE", canonicalDomain: "admin-health", mergeTarget: "/admin/health", needsRedirectWrapper: true },
  { component: "LaunchReadinessBoard", action: "KEEP_AS_SUBVIEW", canonicalDomain: "admin-releases", needsRedirectWrapper: false, notes: "Subview under /admin/releases/launch-readiness" },
  { component: "LaunchHonestyBoard", action: "KEEP_AS_SUBVIEW", canonicalDomain: "admin-verification", needsRedirectWrapper: false, notes: "Subview under /admin/verification/launch-honesty" },

  // Domain 2: Users & Environments
  { component: "UserManagement", action: "KEEP_AS_SUBVIEW", canonicalDomain: "admin-users", needsRedirectWrapper: false },
  { component: "TeamManagement", action: "KEEP_AS_SUBVIEW", canonicalDomain: "admin-users", needsRedirectWrapper: false },

  // Domain 3: AI Runtime — merge massive AI page families
  { component: "AIG01-AIG09", action: "KEEP_AS_SUBVIEW", canonicalDomain: "admin-ai-runtime", needsRedirectWrapper: false, notes: "AI Gateway pages stay as MissionControl submodules under ai-runtime" },
  { component: "AIT01-AIT08", action: "KEEP_AS_SUBVIEW", canonicalDomain: "admin-ai-runtime", needsRedirectWrapper: false, notes: "AI Team pages stay as submodules" },
  { component: "SAG01-SAG12", action: "KEEP_AS_SUBVIEW", canonicalDomain: "admin-ai-runtime", needsRedirectWrapper: false, notes: "Sovereign AI Gateway pages stay as submodules" },
  { component: "CAI01-CAI15", action: "KEEP_AS_SUBVIEW", canonicalDomain: "admin-ai-runtime", needsRedirectWrapper: false, notes: "Conversational AI pages stay as submodules" },

  // Domain 4: Integrations — merge connector families
  { component: "CN01-CN12", action: "KEEP_AS_SUBVIEW", canonicalDomain: "admin-integrations", needsRedirectWrapper: false, notes: "Connector pages stay as MissionControl submodules" },
  { component: "PFA01-PFA10", action: "KEEP_AS_SUBVIEW", canonicalDomain: "admin-integrations", needsRedirectWrapper: false, notes: "Provider family admin pages stay as submodules" },
  { component: "ISA01-ISA08", action: "KEEP_AS_SUBVIEW", canonicalDomain: "admin-integrations", needsRedirectWrapper: false, notes: "Integration sync admin pages stay as submodules" },

  // Domain 5: Trust & Security
  { component: "SEC01-SEC06", action: "KEEP_AS_SUBVIEW", canonicalDomain: "admin-trust-security", needsRedirectWrapper: false },
  { component: "SecurityCommandCenter", action: "KEEP_AS_PRIMARY", canonicalDomain: "admin-trust-security", needsRedirectWrapper: false, notes: "Primary security surface inside MissionControl" },
  { component: "MCTrustSecurity", action: "MERGE_INTO_OTHER_PAGE", canonicalDomain: "admin-trust-security", mergeTarget: "SecurityCommandCenter", needsRedirectWrapper: false },

  // Domain 6: Health & Observability
  { component: "OBS01-OBS06", action: "KEEP_AS_SUBVIEW", canonicalDomain: "admin-health", needsRedirectWrapper: false },
  { component: "RuntimeContinuityBoard", action: "KEEP_AS_SUBVIEW", canonicalDomain: "admin-health", needsRedirectWrapper: false },

  // Domain 7: Releases
  { component: "VMW01-VMW06", action: "KEEP_AS_SUBVIEW", canonicalDomain: "admin-releases", needsRedirectWrapper: false },

  // Domain 8: Verification — merge truth/reality pages
  { component: "ITC01-ITC14", action: "KEEP_AS_SUBVIEW", canonicalDomain: "admin-verification", needsRedirectWrapper: false, notes: "Implementation Truth Check pages stay as submodules" },
  { component: "RCP01-RCP11", action: "KEEP_AS_SUBVIEW", canonicalDomain: "admin-verification", needsRedirectWrapper: false, notes: "Reality Check pages stay as submodules" },
  { component: "V01-V07", action: "KEEP_AS_SUBVIEW", canonicalDomain: "admin-verification", needsRedirectWrapper: false },
  { component: "JVC01-JVC14", action: "KEEP_AS_SUBVIEW", canonicalDomain: "admin-verification", needsRedirectWrapper: false, notes: "Journey verification pages stay as submodules" },
  { component: "CJ01-CJ09", action: "KEEP_AS_SUBVIEW", canonicalDomain: "admin-verification", needsRedirectWrapper: false },
  { component: "TruthIndexDashboard", action: "MERGE_INTO_OTHER_PAGE", canonicalDomain: "admin-verification", mergeTarget: "AdminVerification", needsRedirectWrapper: false },
  { component: "GeneratedTruthDashboard", action: "MERGE_INTO_OTHER_PAGE", canonicalDomain: "admin-verification", mergeTarget: "AdminVerification", needsRedirectWrapper: false },

  // Domain 9: Config
  { component: "PLE01-PLE08", action: "KEEP_AS_SUBVIEW", canonicalDomain: "admin-config", needsRedirectWrapper: false },
  { component: "FIP01-FIP06", action: "KEEP_AS_SUBVIEW", canonicalDomain: "admin-config", needsRedirectWrapper: false },

  // Domain 10: Support
  { component: "SupportPages", action: "KEEP_AS_SUBVIEW", canonicalDomain: "admin-support", needsRedirectWrapper: false },

  // Surfaces — grouped under admin-surfaces
  { component: "DWE01-DWE07", action: "KEEP_AS_SUBVIEW", canonicalDomain: "admin-surfaces", needsRedirectWrapper: false, notes: "Desktop/Web experience pages" },
  { component: "UAO01-UAO08", action: "KEEP_AS_SUBVIEW", canonicalDomain: "admin-surfaces", needsRedirectWrapper: false },
  { component: "MSA01-MSA05", action: "KEEP_AS_SUBVIEW", canonicalDomain: "admin-surfaces", needsRedirectWrapper: false },
  { component: "AND01-AND05", action: "KEEP_AS_SUBVIEW", canonicalDomain: "admin-surfaces", needsRedirectWrapper: false },
  { component: "APL01-APL06", action: "KEEP_AS_SUBVIEW", canonicalDomain: "admin-surfaces", needsRedirectWrapper: false },

  // Cloud admin — already coherent
  { component: "Cloud*", action: "KEEP_AS_SUBVIEW", canonicalDomain: "admin-cloud", needsRedirectWrapper: false, notes: "47 cloud admin pages already scoped; keep as-is" },

  // Dual Reality — already coherent
  { component: "DRS01-DRS10", action: "KEEP_AS_SUBVIEW", canonicalDomain: "admin-reality", needsRedirectWrapper: false },
];

// ── User Surface Consolidation ──────────────────────────────────

export const USER_CONSOLIDATION: PageConsolidationEntry[] = [
  // Boardroom compression — unified entry, domain boards become tabs
  { component: "Boardroom", action: "KEEP_AS_PRIMARY", canonicalDomain: "boardroom", needsRedirectWrapper: false, notes: "Canonical boardroom entry" },
  { component: "GlobalBoardroom", action: "MERGE_INTO_OTHER_PAGE", canonicalDomain: "boardroom", mergeTarget: "Boardroom", needsRedirectWrapper: false, notes: "Unique widgets merged into Boardroom tabs" },
  { component: "WeeklyBoardroom", action: "KEEP_AS_SUBVIEW", canonicalDomain: "boardroom", needsRedirectWrapper: false, notes: "Becomes a mode/tab inside Boardroom" },
  { component: "BusinessBoardroom", action: "KEEP_AS_SUBVIEW", canonicalDomain: "boardroom", needsRedirectWrapper: false },
  { component: "FinanceBoardroom", action: "KEEP_AS_SUBVIEW", canonicalDomain: "boardroom", needsRedirectWrapper: false },
  { component: "MoneyBoardroom", action: "MERGE_INTO_OTHER_PAGE", canonicalDomain: "boardroom", mergeTarget: "FinanceBoardroom", needsRedirectWrapper: false, notes: "Overlaps with FinanceBoardroom" },
  { component: "ConciergeBoardroom", action: "KEEP_AS_SUBVIEW", canonicalDomain: "boardroom", needsRedirectWrapper: false },
  { component: "FamilyBoardroom", action: "MERGE_INTO_OTHER_PAGE", canonicalDomain: "boardroom", mergeTarget: "ConciergeBoardroom", needsRedirectWrapper: false },
  { component: "InvestmentBoardroom", action: "KEEP_AS_SUBVIEW", canonicalDomain: "boardroom", needsRedirectWrapper: false },
  { component: "GrowthBoardroom", action: "KEEP_AS_SUBVIEW", canonicalDomain: "boardroom", needsRedirectWrapper: false },
  { component: "PresenceBoardroom", action: "KEEP_AS_SUBVIEW", canonicalDomain: "boardroom", needsRedirectWrapper: false },

  // Business — already well-structured via shim
  { component: "BusinessCenter", action: "KEEP_AS_PRIMARY", canonicalDomain: "business", needsRedirectWrapper: false, notes: "Shim architecture is correct; 48 modules via windowed app" },

  // Money — already well-structured via shim
  { component: "MoneyCenter", action: "KEEP_AS_PRIMARY", canonicalDomain: "money", needsRedirectWrapper: false, notes: "Shim architecture is correct; 34 modules via windowed app" },

  // Concierge — merge overlapping home pages
  { component: "ConciergeCenter", action: "KEEP_AS_PRIMARY", canonicalDomain: "concierge", needsRedirectWrapper: false },
  { component: "HouseholdCommandCenter", action: "MERGE_INTO_OTHER_PAGE", canonicalDomain: "concierge", mergeTarget: "ConciergeCenter", needsRedirectWrapper: true, notes: "Unique household widgets moved into concierge 'household' subview" },
  { component: "LifeAdminCenter", action: "MERGE_INTO_OTHER_PAGE", canonicalDomain: "concierge", mergeTarget: "ConciergeCenter", needsRedirectWrapper: true, notes: "Unique life-admin widgets moved into concierge 'life-admin' subview" },

  // Files — already correct
  { component: "FilesCenter", action: "KEEP_AS_PRIMARY", canonicalDomain: "files", needsRedirectWrapper: false },

  // Settings — already correct
  { component: "SettingsPage", action: "KEEP_AS_PRIMARY", canonicalDomain: "settings", needsRedirectWrapper: false },
];

// ── Combined Map ────────────────────────────────────────────────

export const FULL_CONSOLIDATION_MAP: PageConsolidationEntry[] = [
  ...ADMIN_CONSOLIDATION,
  ...USER_CONSOLIDATION,
];

// ── Summary Helpers ─────────────────────────────────────────────

export function getConsolidationSummary() {
  const byAction: Record<string, number> = {};
  const byDomain: Record<string, number> = {};

  for (const entry of FULL_CONSOLIDATION_MAP) {
    byAction[entry.action] = (byAction[entry.action] || 0) + 1;
    byDomain[entry.canonicalDomain] = (byDomain[entry.canonicalDomain] || 0) + 1;
  }

  return {
    totalEntries: FULL_CONSOLIDATION_MAP.length,
    byAction,
    byDomain,
    needingRedirectWrappers: FULL_CONSOLIDATION_MAP.filter(e => e.needsRedirectWrapper).length,
    mergedPages: FULL_CONSOLIDATION_MAP.filter(e => e.action === "MERGE_INTO_OTHER_PAGE").length,
    keptPrimary: FULL_CONSOLIDATION_MAP.filter(e => e.action === "KEEP_AS_PRIMARY").length,
  };
}

export function findConsolidationEntry(component: string): PageConsolidationEntry | undefined {
  return FULL_CONSOLIDATION_MAP.find(e => e.component === component);
}

export function getEntriesNeedingRedirect(): PageConsolidationEntry[] {
  return FULL_CONSOLIDATION_MAP.filter(e => e.needsRedirectWrapper);
}
