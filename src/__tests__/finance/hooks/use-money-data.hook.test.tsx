// Phase 6 — Hook integration: use-money-data (Finance)
// Exercises every Finance-Money React Query hook through the
// canonical Supabase mock. Anonymous auth → enabled:false →
// fetchStatus 'idle', data undefined, no errors thrown.

import { describe, it, expect } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import "@/__tests__/finance/_helpers/render-finance-page";
import { makeWrapper } from "@/__tests__/concierge/hooks/_hookHarness";
import {
  useTaxEstimates,
  useReceivables,
  useMoneyApprovals,
  useBills,
  useSubscriptions,
  useSavingsGoals,
  useMoneyAccounts,
} from "@/modules/finance/hooks/use-money-data";

const HOOKS: Array<[string, () => any]> = [
  ["useTaxEstimates", () => useTaxEstimates()],
  ["useReceivables", () => useReceivables()],
  ["useMoneyApprovals", () => useMoneyApprovals()],
  ["useBills", () => useBills()],
  ["useSubscriptions", () => useSubscriptions()],
  ["useSavingsGoals", () => useSavingsGoals()],
  ["useMoneyAccounts", () => useMoneyAccounts()],
];

describe("Finance money hooks (Phase 6)", () => {
  it.each(HOOKS)("%s — anonymous user → disabled (idle, no error)", async (_name, fn) => {
    const { Wrapper } = makeWrapper();
    const { result } = renderHook(fn, { wrapper: Wrapper });
    await waitFor(() => expect(result.current.fetchStatus).toBe("idle"), { timeout: 1500 });
    expect(result.current.isError).toBe(false);
    expect(result.current.data).toBeUndefined();
  });
});
