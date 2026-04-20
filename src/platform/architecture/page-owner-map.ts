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
  { page: "src/pages/LoginPage.tsx", domain: "auth", owner: "identity", riskTier: "R3" },
  { page: "src/pages/RegisterPage.tsx", domain: "auth", owner: "identity", riskTier: "R3" },
  { page: "src/pages/SettingsPage.tsx", domain: "settings", owner: "platform", riskTier: "R1" },
  { page: "src/pages/FilesPage.tsx", domain: "files", owner: "productivity", riskTier: "R1" },
  { page: "src/pages/BoardroomPage.tsx", domain: "boardroom", owner: "intelligence", riskTier: "R2" },
  { page: "src/pages/admin/AdminDashboard.tsx", domain: "admin", owner: "operations", riskTier: "R2" },
  { page: "src/pages/admin/KillSwitchesPage.tsx", domain: "admin-safety", owner: "operations", riskTier: "R4" },
  { page: "src/pages/admin/RunbooksPage.tsx", domain: "admin-ops", owner: "operations", riskTier: "R2" },
];
  { page: "src/pages/BusinessShellPage.tsx", domain: "business", owner: "productivity", riskTier: "R0" },
  { page: "src/pages/MoneyShellPage.tsx", domain: "money", owner: "finance", riskTier: "R3" },
  { page: "src/pages/ConciergeShellPage.tsx", domain: "concierge", owner: "intelligence", riskTier: "R2" },
  { page: "src/pages/RevenueOfficeShellPage.tsx", domain: "revenue", owner: "finance", riskTier: "R2" },
  { page: "src/pages/InvestmentShellPage.tsx", domain: "investment", owner: "finance", riskTier: "R3" },
  { page: "src/pages/DigitalPresenceShellPage.tsx", domain: "digital-presence", owner: "marketing", riskTier: "R1" },
  { page: "src/pages/ConnectorsPage.tsx", domain: "connectors", owner: "integrations", riskTier: "R2" },
  { page: "src/pages/AdvisorsPage.tsx", domain: "advisors", owner: "intelligence", riskTier: "R2" },
  { page: "src/pages/WorkspacePage.tsx", domain: "workspace", owner: "productivity", riskTier: "R0" },
  { page: "src/pages/AppStoreCenter.tsx", domain: "apps", owner: "platform", riskTier: "R0" },
  { page: "src/pages/GovernancePage.tsx", domain: "governance", owner: "compliance", riskTier: "R1" },
  { page: "src/pages/EnterprisePage.tsx", domain: "enterprise", owner: "enterprise", riskTier: "R1" },
  { page: "src/pages/PoliciesPage.tsx", domain: "policies", owner: "compliance", riskTier: "R1" },
  { page: "src/pages/NotificationsPage.tsx", domain: "notifications", owner: "platform", riskTier: "R0" },
  { page: "src/pages/OnboardingPage.tsx", domain: "onboarding", owner: "platform", riskTier: "R0" },
  { page: "src/pages/ObservabilityPage.tsx", domain: "observability", owner: "operations", riskTier: "R1" },
  { page: "src/pages/owner/OwnerDashboard.tsx", domain: "owner", owner: "operations", riskTier: "R4" },
  { page: "src/pages/admin/MissionControlPage.tsx", domain: "mission", owner: "operations", riskTier: "R3" },
  { page: "src/pages/NovaDesktopPage.tsx", domain: "desktop", owner: "platform", riskTier: "R0" },
  { page: "src/pages/SearchPage.tsx", domain: "search", owner: "platform", riskTier: "R0" },

export function getPageOwner(pagePath: string): PageOwnerEntry | undefined {
  return PAGE_OWNER_MAP.find((p) => p.page === pagePath);
}