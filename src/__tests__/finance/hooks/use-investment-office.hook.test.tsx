// Phase 6 — Hook integration: use-investment-office (Finance)
import { describe, it, expect } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import "@/__tests__/finance/_helpers/render-finance-page";
import { makeWrapper } from "@/__tests__/concierge/hooks/_hookHarness";
import {
  usePortfolioPositions,
  useTradeOrders,
  useMarketWatchlistItems,
  useInvestmentDecisions,
  useRiskScenarios,
  useInvestmentWatchlists,
  useInvestmentStrategyRecords,
  useCapitalPurposeBuckets,
  useInvestmentThesisEntries,
} from "@/modules/finance/hooks/use-investment-office";

const HOOKS: Array<[string, () => any]> = [
  ["usePortfolioPositions", () => usePortfolioPositions()],
  ["useTradeOrders", () => useTradeOrders()],
  ["useMarketWatchlistItems", () => useMarketWatchlistItems()],
  ["useInvestmentDecisions", () => useInvestmentDecisions()],
  ["useRiskScenarios", () => useRiskScenarios()],
  ["useInvestmentWatchlists", () => useInvestmentWatchlists()],
  ["useInvestmentStrategyRecords", () => useInvestmentStrategyRecords()],
  ["useCapitalPurposeBuckets", () => useCapitalPurposeBuckets()],
  ["useInvestmentThesisEntries", () => useInvestmentThesisEntries()],
];

describe("Finance investment-office hooks (Phase 6)", () => {
  it.each(HOOKS)("%s — anonymous user → disabled (idle, no error)", async (_name, fn) => {
    const { Wrapper } = makeWrapper();
    const { result } = renderHook(fn, { wrapper: Wrapper });
    await waitFor(() => expect(result.current.fetchStatus).toBe("idle"), { timeout: 1500 });
    expect(result.current.isError).toBe(false);
    expect(result.current.data).toBeUndefined();
  });
});
