import { describe, it, expect, vi } from "vitest";
import { render } from "@/test/test-utils";

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => vi.fn(), useParams: () => ({}), useSearchParams: () => [new URLSearchParams(), vi.fn()] };
});

const pages = [
  ["MoneyCenter", () => import("@/pages/MoneyCenter")],
  ["MoneyOverview", () => import("@/pages/money/MoneyOverview")],
  ["BillsWorkspace", () => import("@/pages/money/BillsWorkspace")],
  ["CashTiming", () => import("@/pages/money/CashTiming")],
  ["MoneyApprovals", () => import("@/pages/money/MoneyApprovals")],
  ["MoneyBoardroom", () => import("@/pages/money/MoneyBoardroom")],
  ["MoneyDocuments", () => import("@/pages/money/MoneyDocuments")],
  ["MoneyProof", () => import("@/pages/money/MoneyProof")],
  ["MoneySettings", () => import("@/pages/money/MoneySettings")],
  ["ReceivablesObligations", () => import("@/pages/money/ReceivablesObligations")],
  ["ReservesSavings", () => import("@/pages/money/ReservesSavings")],
  ["SubscriptionsWaste", () => import("@/pages/money/SubscriptionsWaste")],
  ["TaxEstimator", () => import("@/pages/money/TaxEstimator")],
  ["InvestmentOffice", () => import("@/pages/money/InvestmentOffice")],
  ["CapitalAllocationPage", () => import("@/pages/CapitalAllocationPage")],
  ["RecoveredValuePage", () => import("@/pages/RecoveredValuePage")],
  ["SpilloverDashboard", () => import("@/pages/SpilloverDashboard")],
  ["NetWorthOffice", () => import("@/pages/money/NetWorthOffice")],
  ["DebtCreditOffice", () => import("@/pages/money/DebtCreditOffice")],
  ["BudgetEnvelopeOffice", () => import("@/pages/money/BudgetEnvelopeOffice")],
  ["TransactionIntelligence", () => import("@/pages/money/TransactionIntelligence")],
  ["HouseholdMoneyOffice", () => import("@/pages/money/HouseholdMoneyOffice")],
  ["FinancialHealthPulse", () => import("@/pages/money/FinancialHealthPulse")],
  ["MoneyAdvisorBoard", () => import("@/pages/money/MoneyAdvisorBoard")],
  ["ScenarioPlanner", () => import("@/pages/money/ScenarioPlanner")],
] as const;

describe("Money Pages", () => {
  pages.forEach(([name, loader]) => {
    it(`${name} renders without crashing`, async () => {
      const mod: any = await loader();
      const Component = mod.default || Object.values(mod).find((v: any) => typeof v === "function");
      const { container } = render(<Component />, { authenticated: true });
      expect(container).toBeTruthy();
    });
  });
});
