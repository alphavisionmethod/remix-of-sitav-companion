import { describe, it, expect } from "vitest";

// ── Page Rendering Tests ──
// Validates that key page modules export default components

describe("Page Module Exports", () => {
  it("DailyPulse exports default component", async () => {
    const mod = await import("@/pages/DailyPulse");
    expect(mod.default).toBeDefined();
    expect(typeof mod.default).toBe("function");
  }, 15000);

  it("MoneyCenter exports default component", async () => {
    const mod = await import("@/pages/MoneyCenter");
    expect(mod.default).toBeDefined();
  }, 15000);

  it("BusinessCenter exports default component", async () => {
    const mod = await import("@/pages/BusinessCenter");
    expect(mod.default).toBeDefined();
  });

  it("ConciergeCenter exports default component", async () => {
    const mod = await import("@/pages/ConciergeCenter");
    expect(mod.default).toBeDefined();
  });

  it("FilesCenter exports default component", async () => {
    const mod = await import("@/pages/FilesCenter");
    expect(mod.default).toBeDefined();
  });

  it("MissionControlPage exports default component", async () => {
    const mod = await import("@/pages/mission-control/MissionControlPage");
    expect(mod.default).toBeDefined();
  });

  it("AdvisorWorkspace exports default component", async () => {
    const mod = await import("@/pages/advisors/AdvisorWorkspace");
    expect(mod.default).toBeDefined();
  });

  it("Boardroom exports default component", async () => {
    const mod = await import("@/pages/Boardroom");
    expect(mod.default).toBeDefined();
  });

  it("ProofCenter exports default component", async () => {
    const mod = await import("@/pages/ProofCenter");
    expect(mod.default).toBeDefined();
  });

  it("SettingsPage exports default component", async () => {
    const mod = await import("@/pages/SettingsPage");
    expect(mod.default).toBeDefined();
  });

  it("ProductivityHub exports default component", async () => {
    const mod = await import("@/pages/ProductivityHub");
    expect(mod.default).toBeDefined();
  });

  it("PackStorePage exports default component", async () => {
    const mod = await import("@/pages/store/PackStorePage");
    expect(mod.default).toBeDefined();
  });

  it("StoreAnalyticsPage exports default component", async () => {
    const mod = await import("@/pages/store/StoreAnalyticsPage");
    expect(mod.default).toBeDefined();
  });
});

describe("Money Sub-Page Exports", () => {
  const moneyPages = [
    "MoneyOverview", "BillsWorkspace", "SubscriptionsWaste", "ReservesSavings",
    "CashTiming", "ReceivablesObligations", "InvestmentOffice",
    "MoneyApprovals", "MoneyBoardroom", "MoneyProof", "MoneyDocuments", "MoneySettings",
  ];

  for (const page of moneyPages) {
    it(`${page} exports default`, async () => {
      const mod = await import(`@/pages/money/${page}`);
      expect(mod.default).toBeDefined();
    });
  }
});

describe("Concierge Sub-Page Exports", () => {
  const conciergePages = [
    "ConciergeOverview", "HouseholdTasks", "GroceryPlanning",
    "FamilyCalendar", "SchoolActivities", "TravelPlanning",
    "ServiceProviders", "EventsGifts", "AppointmentsPrep",
    "ConciergeWorkflows", "ConciergeProof", "ConciergeFiles",
    "FamilyBoardroom", "ConciergeSettings",
  ];

  for (const page of conciergePages) {
    it(`${page} exports default`, async () => {
      const mod = await import(`@/pages/concierge/${page}`);
      expect(mod.default).toBeDefined();
    });
  }
});

describe("Business Sub-Page Exports", () => {
  const businessPages = [
    "BusinessOverview", "LeadsInbox", "CustomersPage",
    "OpportunitiesCenter", "QuotesWorkspace", "InvoicesCollections",
    "CollectionsCommandCenter", "RevenueAutopilot", "CommunicationsCenter",
    "BusinessBoardroom", "BusinessProof",
  ];

  for (const page of businessPages) {
    it(`${page} exports default`, async () => {
      const mod = await import(`@/pages/business/${page}`);
      expect(mod.default).toBeDefined();
    });
  }
});
