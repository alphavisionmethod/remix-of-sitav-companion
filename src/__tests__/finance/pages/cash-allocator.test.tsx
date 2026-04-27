// Phase 5 — page-state honesty: CashAllocator
import { describe, it, expect } from "vitest";
import { renderFinancePage } from "@/__tests__/finance/_helpers/render-finance-page";
import CashAllocator from "@/modules/finance/pages/money/CashAllocator";
import { expectHonestStateSignal } from "./_shared";

describe("Finance page — CashAllocator (Phase 5)", () => {
  it("mounts and renders allocation strategy selector", () => {
    const { container } = renderFinancePage(<CashAllocator />);
    expectHonestStateSignal(container, /CASH ALLOCATION|Allocation|Strategy|Unallocated/i);
  });
});
