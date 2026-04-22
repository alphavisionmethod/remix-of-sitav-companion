// ═══════════════════════════════════════════════════════════════
// SITA OS — Page → Domain Owner Map
// Maps each page file to its owning domain for traceability.
// ═══════════════════════════════════════════════════════════════

export interface PageOwnerEntry {
  readonly page: string;
  readonly domain: string;
  readonly owner: string;
  readonly riskTier: "R0" | "R1" | "R2" | "R3" | "R4" | "R5";
}

export const PAGE_OWNER_MAP: readonly PageOwnerEntry[] = [
  { page: "src/pages/DesktopPage.tsx", domain: "shell", owner: "platform", riskTier: "R0" },
  { page: "src/pages/auth/Login.tsx", domain: "auth", owner: "identity", riskTier: "R3" },
  { page: "src/pages/auth/Signup.tsx", domain: "auth", owner: "identity", riskTier: "R3" },
  { page: "src/pages/SettingsPage.tsx", domain: "settings", owner: "platform", riskTier: "R1" },
  { page: "src/pages/FilesCenter.tsx", domain: "files", owner: "productivity", riskTier: "R1" },
  { page: "src/pages/Boardroom.tsx", domain: "boardroom", owner: "intelligence", riskTier: "R2" },
  { page: "src/pages/AdminCenter.tsx", domain: "admin", owner: "operations", riskTier: "R2" },
  { page: "src/pages/admin/AdminKillSwitches.tsx", domain: "admin-safety", owner: "operations", riskTier: "R4" },
  { page: "src/pages/admin/AdminRunbookViewerPage.tsx", domain: "admin-ops", owner: "operations", riskTier: "R2" },
  { page: "src/pages/BusinessCenter.tsx", domain: "business", owner: "productivity", riskTier: "R0" },
  { page: "src/pages/MoneyCenter.tsx", domain: "money", owner: "finance", riskTier: "R3" },
  { page: "src/pages/ConciergeCenter.tsx", domain: "concierge", owner: "intelligence", riskTier: "R2" },
  { page: "src/pages/RevenueCallingPage.tsx", domain: "revenue", owner: "finance", riskTier: "R2" },
  { page: "src/pages/investment-office/InvestmentShellPage.tsx", domain: "investment", owner: "finance", riskTier: "R3" },
  { page: "src/pages/digital-presence/ConnectedSites.tsx", domain: "digital-presence", owner: "marketing", riskTier: "R1" },
  { page: "src/pages/ConnectorHub.tsx", domain: "connectors", owner: "integrations", riskTier: "R2" },
  { page: "src/pages/AppStoreCenter.tsx", domain: "apps", owner: "platform", riskTier: "R0" },
  { page: "src/pages/GovernanceDashboard.tsx", domain: "governance", owner: "compliance", riskTier: "R1" },
  { page: "src/pages/enterprise/EnterpriseControlPlane.tsx", domain: "enterprise", owner: "enterprise", riskTier: "R1" },
  { page: "src/pages/PolicyEditor.tsx", domain: "policies", owner: "compliance", riskTier: "R1" },
  { page: "src/pages/NotificationCenter.tsx", domain: "notifications", owner: "platform", riskTier: "R0" },
  { page: "src/pages/Onboarding.tsx", domain: "onboarding", owner: "platform", riskTier: "R0" },
  { page: "src/pages/ObservabilityPage.tsx", domain: "observability", owner: "operations", riskTier: "R1" },
  { page: "src/pages/OwnerCenter.tsx", domain: "owner", owner: "operations", riskTier: "R4" },
  { page: "src/pages/mission-control/MissionControlPage.tsx", domain: "mission", owner: "operations", riskTier: "R3" },
  { page: "src/pages/SearchPage.tsx", domain: "search", owner: "platform", riskTier: "R0" },
  { page: "src/pages/ProductivityHub.tsx", domain: "workspace", owner: "productivity", riskTier: "R0" },
  { page: "src/pages/LandingPage.tsx", domain: "shell", owner: "platform", riskTier: "R0" },
];

export function getPageOwner(pagePath: string): PageOwnerEntry | undefined {
  return PAGE_OWNER_MAP.find((p) => p.page === pagePath);
}