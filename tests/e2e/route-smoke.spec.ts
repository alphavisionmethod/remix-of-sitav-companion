// ═══════════════════════════════════════════════════════════════
// SITA OS — Playwright E2E: Comprehensive Route Smoke Tests
// Covers ALL major domain routes across the OS
// ═══════════════════════════════════════════════════════════════

import { test, expect } from "@playwright/test";

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:8080";
const TEST_EMAIL = process.env.TEST_USER_EMAIL || "";
const TEST_PASS = process.env.TEST_USER_PASSWORD || "";

// ── P0 Core Routes ──────────────────────────────────────────────
const P0_ROUTES = [
  { path: "/", label: "Daily Pulse" },
  { path: "/files", label: "Files Center" },
  { path: "/boardroom", label: "Boardroom" },
  { path: "/advisors", label: "Advisor Workspace" },
  { path: "/approvals", label: "Approvals Center" },
  { path: "/connectors", label: "Connector Hub" },
  { path: "/proof", label: "Proof Center" },
  { path: "/notifications", label: "Notification Center" },
];

// ── P1 Domain Routes ────────────────────────────────────────────
const MONEY_ROUTES = [
  { path: "/money", label: "Money Center" },
  { path: "/money/bills", label: "Bills Workspace" },
  { path: "/money/investments", label: "Investment Office" },
  { path: "/money/cash-timing", label: "Cash Timing" },
  { path: "/money/tax", label: "Tax Estimator" },
  { path: "/money/subscriptions", label: "Subscriptions" },
  { path: "/money/reserves", label: "Reserves & Savings" },
  { path: "/money/receivables", label: "Receivables" },
  { path: "/money/approvals", label: "Money Approvals" },
  { path: "/money/boardroom", label: "Money Boardroom" },
  { path: "/money/documents", label: "Money Documents" },
  { path: "/money/proof", label: "Money Proof" },
  { path: "/money/settings", label: "Money Settings" },
];

const BUSINESS_ROUTES = [
  { path: "/business", label: "Business Center" },
  { path: "/business/overview", label: "Business Overview" },
  { path: "/business/customers", label: "Customers" },
  { path: "/business/invoices", label: "Invoices & Collections" },
  { path: "/business/leads", label: "Leads Inbox" },
  { path: "/business/opportunities", label: "Opportunities" },
  { path: "/business/quotes", label: "Quotes Workspace" },
  { path: "/business/autopilot", label: "Autopilot Hub" },
  { path: "/business/revenue-autopilot", label: "Revenue Autopilot" },
  { path: "/business/communications", label: "Communications" },
  { path: "/business/boardroom", label: "Business Boardroom" },
  { path: "/business/proof", label: "Business Proof" },
];

const CONCIERGE_ROUTES = [
  { path: "/concierge", label: "Concierge Center" },
  { path: "/concierge/overview", label: "Concierge Overview" },
  { path: "/concierge/family-calendar", label: "Family Calendar" },
  { path: "/concierge/household", label: "Household Command" },
  { path: "/concierge/tasks", label: "Household Tasks" },
  { path: "/concierge/travel", label: "Travel Planning" },
  { path: "/concierge/events-gifts", label: "Events & Gifts" },
  { path: "/concierge/school", label: "School Activities" },
  { path: "/concierge/grocery", label: "Grocery Planning" },
  { path: "/concierge/service-providers", label: "Service Providers" },
  { path: "/concierge/workflows", label: "Concierge Workflows" },
  { path: "/concierge/boardroom", label: "Family Boardroom" },
  { path: "/concierge/proof", label: "Concierge Proof" },
  { path: "/concierge/settings", label: "Concierge Settings" },
];

const OWNER_ROUTES = [
  { path: "/owner", label: "Owner Center" },
  { path: "/owner/advisors", label: "Advisor Config" },
  { path: "/owner/constitution", label: "Constitution Editor" },
  { path: "/owner/leases", label: "Lease Dashboard" },
  { path: "/owner/packs", label: "Pack Editor" },
  { path: "/owner/pricing", label: "Pricing Editor" },
  { path: "/owner/pulse", label: "Owner Pulse" },
  { path: "/owner/approvals", label: "Owner Approvals" },
];

const SYSTEM_ROUTES = [
  { path: "/settings", label: "Settings" },
  { path: "/workflows", label: "Workflows Center" },
  { path: "/calendar", label: "Calendar Workspace" },
  { path: "/search", label: "Search" },
  { path: "/activity", label: "Activity Stream" },
  { path: "/memory", label: "Memory Center" },
  { path: "/system-status", label: "System Status" },
  { path: "/personal-brain", label: "Personal Brain" },
  { path: "/automation", label: "Automation Center" },
  { path: "/governance", label: "Governance Dashboard" },
  { path: "/permissions", label: "Permissions Center" },
];

const INVESTMENT_ROUTES = [
  { path: "/investments", label: "Investment Gate" },
  { path: "/investment-office/portfolio", label: "Portfolio Office" },
  { path: "/investment-office/risk", label: "Risk Office" },
  { path: "/investment-office/strategy", label: "Strategy Studio" },
  { path: "/investment-office/market-explorer", label: "Market Explorer" },
  { path: "/investment-office/decision-theater", label: "Decision Theater" },
  { path: "/investment-office/execution", label: "Execution Desk" },
  { path: "/investment-office/receipts", label: "Investment Receipts" },
  { path: "/investment-office/boardroom", label: "Investment Boardroom" },
];

const REVENUE_ROUTES = [
  { path: "/revenue-office", label: "Revenue Gate" },
  { path: "/revenue-office/automation-office", label: "Automation Office" },
  { path: "/revenue-office/funnel-builder", label: "Funnel Builder" },
  { path: "/revenue-office/campaign-orchestrator", label: "Campaign Orchestrator" },
  { path: "/revenue-office/growth-dna", label: "Growth DNA" },
  { path: "/revenue-office/retention", label: "Retention Office" },
  { path: "/revenue-office/pipeline", label: "Pipeline Studio" },
  { path: "/revenue-office/boardroom", label: "Growth Boardroom" },
];

const DIGITAL_PRESENCE_ROUTES = [
  { path: "/digital-presence", label: "Digital Presence" },
  { path: "/digital-presence/site-builder", label: "Site Builder" },
  { path: "/digital-presence/brand-studio", label: "Brand Studio" },
  { path: "/digital-presence/analytics", label: "Presence Analytics" },
  { path: "/digital-presence/connected-sites", label: "Connected Sites" },
];

const INTEGRATIONS_ROUTES = [
  { path: "/integrations", label: "Integrations Catalog" },
  { path: "/integrations/connections", label: "Connections List" },
];

const STORE_ROUTES = [
  { path: "/store", label: "Pack Store" },
  { path: "/app-store", label: "App Store" },
  { path: "/app-library", label: "App Library" },
];

const FILES_ROUTES = [
  { path: "/files/overview", label: "Files Overview" },
  { path: "/files/all", label: "All Files" },
  { path: "/files/search", label: "Files Search" },
  { path: "/files/sensitive", label: "Sensitive Files" },
  { path: "/files/settings", label: "Files Settings" },
];

const WORKSPACE_ROUTES = [
  { path: "/workspace/docs", label: "Docs Workspace" },
  { path: "/workspace/sheets", label: "Sheets Workspace" },
  { path: "/workspace/slides", label: "Slides Workspace" },
];

// ── Admin Routes ────────────────────────────────────────────────
const ADMIN_CORE_ROUTES = [
  { path: "/admin", label: "Admin Dashboard" },
  { path: "/admin/ai-runtime", label: "AI Runtime Status" },
  { path: "/admin/team", label: "AI Team" },
  { path: "/admin/brain-core", label: "Brain Core Dashboard" },
  { path: "/admin/conscience-gate", label: "Conscience Gate Dashboard" },
  { path: "/admin/fleet-health", label: "Fleet Health" },
  { path: "/admin/system-health", label: "System Health" },
  { path: "/admin/users", label: "User Management" },
  { path: "/admin/incident-command", label: "Incident Command" },
  { path: "/admin/google-provider-family", label: "Google Provider Family" },
];

const ADMIN_AI_GATEWAY_ROUTES = [
  { path: "/admin/ai-gateway/providers", label: "AIG01 Provider Registry" },
  { path: "/admin/ai-gateway/models", label: "AIG02 Model Registry" },
  { path: "/admin/ai-gateway/routing", label: "AIG03 Routing Matrix" },
  { path: "/admin/ai-gateway/budget", label: "AIG04 Budget Center" },
  { path: "/admin/ai-gateway/receipts", label: "AIG05 Receipts Explorer" },
  { path: "/admin/ai-gateway/launch-truth", label: "AIG06 Launch Truth" },
];

const ADMIN_VERIFICATION_ROUTES = [
  { path: "/admin/verification/surfaces", label: "V01 Surface Inventory" },
  { path: "/admin/verification/coverage", label: "V02 Coverage Board" },
  { path: "/admin/verification/p0-journeys", label: "V03 P0 Journeys" },
  { path: "/admin/verification/modes", label: "V04 Mode Board" },
  { path: "/admin/verification/failures", label: "V05 Failure Triage" },
  { path: "/admin/verification/evidence", label: "V06 Evidence Explorer" },
  { path: "/admin/verification/blockers", label: "V07 Launch Blockers" },
];

const ADMIN_SECURITY_ROUTES = [
  { path: "/admin/security/posture", label: "SEC01 Posture" },
  { path: "/admin/security/privileged-actions", label: "SEC02 Privileged Actions" },
  { path: "/admin/security/sensitive-assets", label: "SEC03 Sensitive Assets" },
  { path: "/admin/security/edge-audit", label: "SEC04 Edge Audit" },
];

const ADMIN_LAUNCH_ROUTES = [
  { path: "/admin/launch/readiness", label: "LAUNCH01 Readiness" },
  { path: "/admin/launch/flagship", label: "LAUNCH02 Flagship" },
  { path: "/admin/launch/claims", label: "LAUNCH03 Claims Safety" },
  { path: "/admin/launch/blockers", label: "LAUNCH04 Blockers" },
];

// ── Auth Routes (no login needed) ───────────────────────────────
const PUBLIC_ROUTES = [
  { path: "/login", label: "Login" },
  { path: "/signup", label: "Signup" },
  { path: "/forgot-password", label: "Forgot Password" },
];

// ── Helper ──────────────────────────────────────────────────────
function createAuthenticatedSuite(name: string, routes: Array<{ path: string; label: string }>) {
  test.describe(`${name} — Route Smoke`, () => {
    test.skip(!TEST_EMAIL, "Skipping: no TEST_USER_EMAIL configured");

    test.beforeEach(async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      await page.locator("input[type='email'], input[placeholder*='email' i]").fill(TEST_EMAIL);
      await page.locator("input[type='password']").fill(TEST_PASS);
      await page.getByRole("button", { name: /sign in|log in/i }).click();
      await page.waitForURL(/^(?!.*\/(login|signup))/, { timeout: 15000 });
    });

    for (const route of routes) {
      test(`${route.label} (${route.path}) loads`, async ({ page }) => {
        await page.goto(`${BASE_URL}${route.path}`);
        await page.waitForLoadState("networkidle", { timeout: 15000 });
        const body = await page.textContent("body");
        expect(body).not.toContain("Something went wrong");
        expect(body).not.toContain("Page not found");
      });
    }
  });
}

// ── Public Route Suite (no auth) ────────────────────────────────
test.describe("Public Routes — Smoke", () => {
  for (const route of PUBLIC_ROUTES) {
    test(`${route.label} (${route.path}) loads`, async ({ page }) => {
      await page.goto(`${BASE_URL}${route.path}`);
      await page.waitForLoadState("networkidle", { timeout: 10000 });
      const body = await page.textContent("body");
      expect(body).not.toContain("Something went wrong");
    });
  }
});

// ── Authenticated Suites ────────────────────────────────────────
createAuthenticatedSuite("P0 Core", P0_ROUTES);
createAuthenticatedSuite("Money Domain", MONEY_ROUTES);
createAuthenticatedSuite("Business Domain", BUSINESS_ROUTES);
createAuthenticatedSuite("Concierge Domain", CONCIERGE_ROUTES);
createAuthenticatedSuite("Owner", OWNER_ROUTES);
createAuthenticatedSuite("System", SYSTEM_ROUTES);
createAuthenticatedSuite("Investment Office", INVESTMENT_ROUTES);
createAuthenticatedSuite("Revenue Office", REVENUE_ROUTES);
createAuthenticatedSuite("Digital Presence", DIGITAL_PRESENCE_ROUTES);
createAuthenticatedSuite("Integrations", INTEGRATIONS_ROUTES);
createAuthenticatedSuite("Store & Apps", STORE_ROUTES);
createAuthenticatedSuite("Files", FILES_ROUTES);
createAuthenticatedSuite("Workspace", WORKSPACE_ROUTES);
createAuthenticatedSuite("Admin Core", ADMIN_CORE_ROUTES);
createAuthenticatedSuite("Admin AI Gateway", ADMIN_AI_GATEWAY_ROUTES);
createAuthenticatedSuite("Admin Verification", ADMIN_VERIFICATION_ROUTES);
createAuthenticatedSuite("Admin Security", ADMIN_SECURITY_ROUTES);
createAuthenticatedSuite("Admin Launch", ADMIN_LAUNCH_ROUTES);
