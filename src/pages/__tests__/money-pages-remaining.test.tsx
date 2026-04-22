import { describe, it, expect, vi } from "vitest";
import { render } from "@/test/test-utils";

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => vi.fn(), useParams: () => ({ id: "test" }), useSearchParams: () => [new URLSearchParams(), vi.fn()] };
});

const pages = [
  ["CashAllocator", () => import("@/pages/money/CashAllocator")],
  ["FinanceAutomations", () => import("@/pages/money/FinanceAutomations")],
  ["FinanceBoardroom", () => import("@/pages/money/FinanceBoardroom")],
  ["FinancialBoundaryMonitor", () => import("@/pages/money/FinancialBoundaryMonitor")],
  ["LifeMoneyEngine", () => import("@/pages/money/LifeMoneyEngine")],
  ["MoneyModes", () => import("@/pages/money/MoneyModes")],
  ["MoneyRituals", () => import("@/pages/money/MoneyRituals")],
  ["OpportunityCost", () => import("@/pages/money/OpportunityCost")],
  ["PeaceScore", () => import("@/pages/money/PeaceScore")],
  ["ReconciliationReview", () => import("@/pages/money/ReconciliationReview")],
  ["SpendingPulse", () => import("@/pages/money/SpendingPulse")],
  ["StressRadar", () => import("@/pages/money/StressRadar")],
  ["TrustGraph", () => import("@/pages/money/TrustGraph")],
] as const;

describe("Money Pages Remaining", () => {
  pages.forEach(([name, loader]) => {
    it(`${name} renders without crashing`, async () => {
      const mod: any = await loader();
      const Component = mod.default || Object.values(mod).find((v: any) => typeof v === "function");
      const { container } = render(<Component />, { authenticated: true });
      expect(container).toBeTruthy();
    });
  });
});
