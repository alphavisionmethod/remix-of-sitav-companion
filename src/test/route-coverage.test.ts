import { describe, it, expect } from "vitest";
import * as fs from "fs";

describe("Route Coverage", () => {
  const appContent = fs.readFileSync("src/App.tsx", "utf-8");

  const requiredRoutes = [
    // Root
    "/",
    // Business
    "/business", "/business/overview", "/business/leads", "/business/customers",
    "/business/opportunities", "/business/quotes", "/business/invoices",
    "/business/collections", "/business/communications", "/business/boardroom",
    "/business/proof", "/business/files", "/business/settings",
    // Money
    "/money", "/money/overview", "/money/bills", "/money/subscriptions",
    "/money/reserves", "/money/cash-timing", "/money/receivables",
    "/money/investment-office", "/money/approvals", "/money/proof",
    "/money/files", "/money/boardroom", "/money/settings",
    // Concierge
    "/concierge", "/concierge/overview", "/concierge/calendar",
    "/concierge/tasks", "/concierge/grocery", "/concierge/travel",
    "/concierge/providers", "/concierge/events", "/concierge/workflows",
    "/concierge/proof", "/concierge/files", "/concierge/boardroom",
    "/concierge/settings",
    // Advisors
    "/advisors", "/advisors/overview", "/advisors/compare", "/advisors/simulations",
    // Proof
    "/proof", "/proof/receipts", "/proof/executions", "/proof/verifications", "/proof/rollbacks",
    // Boardroom
    "/boardroom", "/boardroom/business", "/boardroom/finance", "/boardroom/family",
    // Store
    "/store", "/store/founders", "/store/families", "/store/finance",
    "/store/connectors", "/store/surfaces", "/store/analytics",
    // Settings
    "/settings", "/settings/trust", "/settings/profile", "/settings/connectors",
    "/settings/permissions", "/settings/billing",
    // Productivity
    "/productivity", "/productivity/docs", "/productivity/sheets", "/productivity/slides",
    // Files
    "/files", "/files/all", "/files/processing", "/files/review",
    "/files/search", "/files/sensitive", "/files/settings",
    // Approvals
    "/approvals", "/approvals/pending", "/approvals/simulated",
    // Auth
    "/login", "/signup", "/forgot-password", "/reset-password",
  ];

  for (const route of requiredRoutes) {
    it(`route "${route}" is defined`, () => {
      expect(appContent).toContain(`path="${route}"`);
    });
  }

  it("has at least 80 routes defined", () => {
    const routeCount = (appContent.match(/<Route\s+path="/g) || []).length;
    expect(routeCount).toBeGreaterThanOrEqual(80);
  });
});

describe("Lazy Imports", () => {
  const appContent = fs.readFileSync("src/App.tsx", "utf-8");

  const requiredLazyImports = [
    "DailyPulse", "BusinessCenter", "MoneyCenter", "ConciergeCenter",
    "FilesCenter", "ProofCenter", "Boardroom", "AdvisorWorkspace",
    "SettingsPage", "MissionControl", "ProductivityHub", "PackStorePage",
    "StoreAnalyticsPage", "StoreCategoryPage", "ApprovalsCenter",
  ];

  for (const comp of requiredLazyImports) {
    it(`${comp} is lazy-loaded`, () => {
      expect(appContent).toContain(`const ${comp} = lazy(`);
    });
  }
});
