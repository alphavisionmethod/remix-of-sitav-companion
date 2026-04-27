// Phase 5 — page-state honesty: CapitalAllocationPage
import { describe, it, expect } from "vitest";
import { renderFinancePage } from "@/__tests__/finance/_helpers/render-finance-page";
import CapitalAllocationPage from "@/modules/finance/pages/CapitalAllocationPage";
import { expectHonestStateSignal } from "./_shared";

describe("Finance page — CapitalAllocation (Phase 5)", () => {
  it("mounts with empty allocations and renders KPI shell", () => {
    const { container } = renderFinancePage(<CapitalAllocationPage />);
    expectHonestStateSignal(container, /Capital Allocation|Total Portfolio|Rebalance/i);
  });
});
