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

export function getPageOwner(pagePath: string): PageOwnerEntry | undefined {
  return PAGE_OWNER_MAP.find((p) => p.page === pagePath);
}