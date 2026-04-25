#!/usr/bin/env node
/* eslint-disable no-console */
// ═══════════════════════════════════════════════════════════════
// SITA OS — Wave 6: Root-level single-file page reclassification
// Moves the ~97 stand-alone files in src/pages/*.tsx to their
// canonical platform/pillar homes. Replaces originals with thin
// re-export adapters so every existing route remains stable.
// ═══════════════════════════════════════════════════════════════

import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

type Move = { file: string; to: string };

/**
 * file → canonical destination directory under src/...
 * Each entry is the page basename (in src/pages/) and the destination
 * sub-folder under either src/platform/<system>/pages/ or src/modules/<pillar>/pages/.
 */
const MOVES: Move[] = [
  // ── PLATFORM: AI / orchestration ──
  { file: "AIEconomicsPage.tsx",          to: "src/platform/ai/pages" },
  { file: "AIWorkforcePage.tsx",          to: "src/platform/ai/pages" },
  { file: "AgentActivityDashboard.tsx",   to: "src/platform/ai/pages" },
  { file: "OutcomeEnginePage.tsx",        to: "src/platform/ai/pages" },
  { file: "OpportunityEngine.tsx",        to: "src/platform/ai/pages" },
  { file: "DigitalTwinsPage.tsx",         to: "src/platform/ai/pages" },
  { file: "SimulationEnginePage.tsx",     to: "src/platform/ai/pages" },
  { file: "ScenarioLabPage.tsx",          to: "src/platform/ai/pages" },
  { file: "LifeSimulator.tsx",            to: "src/platform/ai/pages" },

  // ── PLATFORM: Trust / Approvals / Governance ──
  { file: "ApprovalChamber.tsx",          to: "src/platform/trust/pages" },
  { file: "ApprovalsCenter.tsx",          to: "src/platform/trust/pages" },
  { file: "ProofCenter.tsx",              to: "src/platform/trust/pages" },
  { file: "TrustCenter.tsx",              to: "src/platform/trust/pages" },
  { file: "PermissionsCenter.tsx",        to: "src/platform/trust/pages" },
  { file: "PolicyEditor.tsx",             to: "src/platform/trust/pages" },
  { file: "PolicySimulatorHub.tsx",       to: "src/platform/trust/pages" },
  { file: "GovernanceDashboard.tsx",      to: "src/platform/governance/pages" },

  // ── PLATFORM: Boardroom ──
  { file: "Boardroom.tsx",                to: "src/platform/boardroom/pages" },
  { file: "GlobalBoardroom.tsx",          to: "src/platform/boardroom/pages" },
  { file: "WeeklyBoardroom.tsx",          to: "src/platform/boardroom/pages" },

  // ── PLATFORM: Owner / Admin Centers ──
  { file: "OwnerCenter.tsx",              to: "src/platform/owner/pages" },
  { file: "AdminCenter.tsx",              to: "src/platform/owner/pages" },
  { file: "UsersAdminPage.tsx",           to: "src/platform/owner/pages" },
  { file: "EnterpriseMaturityDashboard.tsx", to: "src/platform/enterprise/pages" },

  // ── PLATFORM: App Platform / Store ──
  { file: "AppStoreCenter.tsx",           to: "src/platform/app-platform/pages" },
  { file: "DownloadPage.tsx",             to: "src/platform/app-platform/pages" },
  { file: "DownloadsCenter.tsx",          to: "src/platform/app-platform/pages" },
  { file: "TemplateCenter.tsx",           to: "src/platform/app-platform/pages" },
  { file: "UpdateCenter.tsx",             to: "src/platform/app-platform/pages" },

  // ── PLATFORM: Files & Storage ──
  { file: "FilesCenter.tsx",              to: "src/platform/files/pages" },
  { file: "StorageManager.tsx",           to: "src/platform/files/pages" },
  { file: "ImportExportCenter.tsx",       to: "src/platform/files/pages" },
  { file: "SovereignExportPage.tsx",      to: "src/platform/files/pages" },

  // ── PLATFORM: Workspace / Productivity surfaces ──
  { file: "DesktopPage.tsx",              to: "src/platform/workspace/pages" },
  { file: "CalendarWorkspace.tsx",        to: "src/platform/workspace/pages" },
  { file: "DocumentEditor.tsx",           to: "src/platform/workspace/pages" },
  { file: "SpreadsheetWorkspace.tsx",     to: "src/platform/workspace/pages" },
  { file: "MediaWorkspace.tsx",           to: "src/platform/workspace/pages" },
  { file: "NotesWorkspace.tsx",           to: "src/platform/workspace/pages" },
  { file: "PDFViewerWorkspace.tsx",       to: "src/platform/workspace/pages" },
  { file: "PeopleWorkspace.tsx",          to: "src/platform/workspace/pages" },
  { file: "ReportingWorkspace.tsx",       to: "src/platform/workspace/pages" },
  { file: "TeamWorkspace.tsx",            to: "src/platform/workspace/pages" },
  { file: "PlanningCanvas.tsx",           to: "src/platform/workspace/pages" },
  { file: "ProductivityHub.tsx",          to: "src/platform/workspace/pages" },
  { file: "PrintScanCenter.tsx",          to: "src/platform/workspace/pages" },
  { file: "ClipboardHistory.tsx",         to: "src/platform/workspace/pages" },
  { file: "CommandHistory.tsx",           to: "src/platform/workspace/pages" },
  { file: "SearchPage.tsx",               to: "src/platform/search/pages" },

  // ── PLATFORM: Notifications / Activity ──
  { file: "NotificationCenter.tsx",       to: "src/platform/notifications/pages" },
  { file: "NotificationSettingsPage.tsx", to: "src/platform/notifications/pages" },
  { file: "ActivityStream.tsx",           to: "src/platform/notifications/pages" },
  { file: "MyActivity.tsx",               to: "src/platform/notifications/pages" },
  { file: "InboxCapture.tsx",             to: "src/platform/notifications/pages" },
  { file: "DailyPulse.tsx",               to: "src/platform/notifications/pages" },

  // ── PLATFORM: Communications ──
  { file: "CommunicationInbox.tsx",       to: "src/platform/notifications/pages" },
  { file: "CommunicationsPage.tsx",       to: "src/platform/notifications/pages" },

  // ── PLATFORM: Setup / Onboarding / First-use ──
  { file: "FirstBootSetup.tsx",           to: "src/platform/setup/pages" },
  { file: "FirstWinActivation.tsx",       to: "src/platform/setup/pages" },
  { file: "Onboarding.tsx",               to: "src/platform/setup/pages" },
  { file: "OnboardingWrapper.tsx",        to: "src/platform/setup/pages" },
  { file: "MoneyOnboarding.tsx",          to: "src/modules/finance/pages" },
  { file: "PersonalizationStudio.tsx",    to: "src/platform/setup/pages" },
  { file: "EnvironmentSwitcher.tsx",      to: "src/platform/setup/pages" },
  { file: "LandingPage.tsx",              to: "src/platform/marketing/pages" },

  // ── PLATFORM: Integration / Connectors ──
  { file: "ConnectorHub.tsx",             to: "src/platform/integration/pages" },
  { file: "IntegrationConcierge.tsx",     to: "src/platform/integration/pages" },

  // ── PLATFORM: Observability ──
  { file: "ObservabilityPage.tsx",        to: "src/platform/observability/pages" },
  { file: "SystemStatus.tsx",             to: "src/platform/observability/pages" },
  { file: "ServiceArchitectureDashboard.tsx", to: "src/platform/observability/pages" },
  { file: "NetworkUtility.tsx",           to: "src/platform/observability/pages" },
  { file: "WorkflowReplayHub.tsx",        to: "src/platform/observability/pages" },
  { file: "TimeMachinePage.tsx",          to: "src/platform/observability/pages" },
  { file: "SpilloverDashboard.tsx",       to: "src/platform/observability/pages" },

  // ── PLATFORM: Memory / Personal Brain ──
  { file: "MemoryCenter.tsx",             to: "src/platform/personal-brain/pages" },
  { file: "PersonalBrain.tsx",            to: "src/platform/personal-brain/pages" },
  { file: "LearnLaterPage.tsx",           to: "src/platform/personal-brain/pages" },

  // ── PLATFORM: Settings / Profile ──
  { file: "SettingsPage.tsx",             to: "src/platform/settings/pages" },
  { file: "UserProfilePage.tsx",          to: "src/platform/settings/pages" },
  { file: "AchievementsPage.tsx",         to: "src/platform/settings/pages" },
  { file: "CalmFocusMode.tsx",            to: "src/platform/settings/pages" },

  // ── PLATFORM: Tasks / Workflows / Automation ──
  { file: "AutomationCenter.tsx",         to: "src/platform/orchestration/pages" },
  { file: "TasksWorkflowsCenter.tsx",     to: "src/platform/orchestration/pages" },
  { file: "WorkflowsCenter.tsx",          to: "src/platform/orchestration/pages" },
  { file: "RecoveryCenter.tsx",           to: "src/platform/support/pages" },

  // ── PILLAR: Business ──
  { file: "BusinessCenter.tsx",           to: "src/modules/business/pages" },
  { file: "CustomerDetail.tsx",           to: "src/modules/business/pages" },
  { file: "CustomerHealthPage.tsx",       to: "src/modules/business/pages" },
  { file: "RevenueCallingPage.tsx",       to: "src/modules/business/pages" },
  { file: "RecoveredValuePage.tsx",       to: "src/modules/business/pages" },

  // ── PILLAR: Concierge / Personal Life ──
  { file: "ConciergeCenter.tsx",          to: "src/modules/concierge/pages" },
  { file: "PersonalLifeWorkspace.tsx",    to: "src/modules/concierge/pages" },
  { file: "LifeDashboard.tsx",            to: "src/modules/concierge/pages" },

  // ── PILLAR: Finance ──
  { file: "MoneyCenter.tsx",              to: "src/modules/finance/pages" },
  { file: "WealthCommandCenter.tsx",      to: "src/modules/finance/pages" },
  { file: "CapitalAllocationPage.tsx",    to: "src/modules/finance/pages" },

  // ── KEEP at root (true root pages) ──
  // NotFound.tsx — 404 fallback, intentionally kept at src/pages/NotFound.tsx
];

function ensureDir(p: string) { mkdirSync(p, { recursive: true }); }
function aliasFor(absToFile: string): string {
  return "@/" + absToFile.replace(/^src\//, "").replace(/\.(ts|tsx)$/, "");
}
function adapterBody(alias: string): string {
  return [
    `// Wave 6 — legacy path re-exports the canonical implementation.`,
    `// Moved to ${alias}`,
    `export { default } from "${alias}";`,
    `export * from "${alias}";`,
    ``,
  ].join("\n");
}

const moved: { src: string; dest: string }[] = [];
const adapters: string[] = [];
const skipped: string[] = [];

for (const m of MOVES) {
  const src = `src/pages/${m.file}`;
  if (!existsSync(src)) { skipped.push(`MISSING:${src}`); continue; }
  // If the file is already a thin re-export adapter (Wave 5 leftover), skip.
  const content = readFileSync(src, "utf8");
  if (/Wave \d — legacy path re-exports/.test(content) && content.split("\n").length <= 8) {
    skipped.push(`ALREADY_ADAPTER:${src}`); continue;
  }

  ensureDir(m.to);
  const dest = join(m.to, m.file);
  if (existsSync(dest)) { skipped.push(`COLLISION:${dest}`); continue; }

  renameSync(src, dest);
  moved.push({ src, dest: dest.replace(/\\/g, "/") });

  const alias = aliasFor(dest.replace(/\\/g, "/"));
  writeFileSync(src, adapterBody(alias), "utf8");
  adapters.push(src);
}

const reportDir = "generated/audits";
ensureDir(reportDir);
const reportPath = join(reportDir, "wave-6-root-page-reclassification.json");
writeFileSync(reportPath, JSON.stringify({
  generatedAt: new Date().toISOString(),
  wave: 6,
  movedCount: moved.length,
  adapterCount: adapters.length,
  skippedCount: skipped.length,
  movedByDestination: moved.reduce<Record<string, number>>((acc, { dest }) => {
    const dir = dirname(dest);
    acc[dir] = (acc[dir] ?? 0) + 1;
    return acc;
  }, {}),
  moved,
  skipped,
}, null, 2));

console.log(`Wave 6 complete: moved=${moved.length} adapters=${adapters.length} skipped=${skipped.length}`);
console.log(`Report: ${reportPath}`);