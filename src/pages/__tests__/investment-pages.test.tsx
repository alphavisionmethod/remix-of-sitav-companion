import { describe, it, expect, vi } from "vitest";
import { render } from "@/test/test-utils";

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => vi.fn(), useParams: () => ({ id: "test" }), useSearchParams: () => [new URLSearchParams(), vi.fn()] };
});

const pages = [
  ["AdvancedMode", () => import("@/pages/investment-office/AdvancedMode")],
  ["AdvisorBoard", () => import("@/pages/investment-office/AdvisorBoard")],
  ["BeginnerMode", () => import("@/pages/investment-office/BeginnerMode")],
  ["BehavioralFirewall", () => import("@/pages/investment-office/BehavioralFirewall")],
  ["CapitalPurpose", () => import("@/pages/investment-office/CapitalPurpose")],
  ["CapitalTwin", () => import("@/pages/investment-office/CapitalTwin")],
  ["CatalystWarRoom", () => import("@/pages/investment-office/CatalystWarRoom")],
  ["ConvictionEngine", () => import("@/pages/investment-office/ConvictionEngine")],
  ["CrossAssetStoryEngine", () => import("@/pages/investment-office/CrossAssetStoryEngine")],
  ["DecisionReadiness", () => import("@/pages/investment-office/DecisionReadiness")],
  ["DecisionTheater", () => import("@/pages/investment-office/DecisionTheater")],
  ["DisagreementEngine", () => import("@/pages/investment-office/DisagreementEngine")],
  ["EventMarketsWorkspace", () => import("@/pages/investment-office/EventMarketsWorkspace")],
  ["EventProbabilityLab", () => import("@/pages/investment-office/EventProbabilityLab")],
  ["ExecutionDesk", () => import("@/pages/investment-office/ExecutionDesk")],
  ["FamilyOffice", () => import("@/pages/investment-office/FamilyOffice")],
  ["InstrumentDetail", () => import("@/pages/investment-office/InstrumentDetail")],
  ["IntelligenceDossier", () => import("@/pages/investment-office/IntelligenceDossier")],
  ["InvestmentBoardroom", () => import("@/pages/investment-office/InvestmentBoardroom")],
  ["InvestmentConstitution", () => import("@/pages/investment-office/InvestmentConstitution")],
  ["InvestmentGate", () => import("@/pages/investment-office/InvestmentGate")],
  ["InvestmentReceipts", () => import("@/pages/investment-office/InvestmentReceipts")],
  ["MarketExplorer", () => import("@/pages/investment-office/MarketExplorer")],
  ["MarketMemoryFeed", () => import("@/pages/investment-office/MarketMemoryFeed")],
  ["OperatingModes", () => import("@/pages/investment-office/OperatingModes")],
  ["OpportunityMap", () => import("@/pages/investment-office/OpportunityMap")],
  ["PlatformConnections", () => import("@/pages/investment-office/PlatformConnections")],
  ["PortfolioOffice", () => import("@/pages/investment-office/PortfolioOffice")],
  ["PositionSizingCoach", () => import("@/pages/investment-office/PositionSizingCoach")],
  ["PostTradeLoop", () => import("@/pages/investment-office/PostTradeLoop")],
  ["ResearchLibrary", () => import("@/pages/investment-office/ResearchLibrary")],
  ["RiskOffice", () => import("@/pages/investment-office/RiskOffice")],
  ["StrategyDNA", () => import("@/pages/investment-office/StrategyDNA")],
  ["StrategyStudio", () => import("@/pages/investment-office/StrategyStudio")],
  ["ThesisJournal", () => import("@/pages/investment-office/ThesisJournal")],
  ["TimeMachineReview", () => import("@/pages/investment-office/TimeMachineReview")],
  ["WatchlistsSignals", () => import("@/pages/investment-office/WatchlistsSignals")],
  ["WhatWouldBreak", () => import("@/pages/investment-office/WhatWouldBreak")],
] as const;

describe("Investment Office Pages", () => {
  pages.forEach(([name, loader]) => {
    it(`${name} renders without crashing`, async () => {
      const mod: any = await loader();
      const Component = mod.default || Object.values(mod).find((v: any) => typeof v === "function");
      const { container } = render(<Component />, { authenticated: true });
      expect(container).toBeTruthy();
    });
  });
});
