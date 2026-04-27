// Phase 5 — page-state honesty: BillsWorkspace
import { describe, it, expect } from "vitest";
import { renderFinancePage } from "@/__tests__/finance/_helpers/render-finance-page";
import BillsWorkspace from "@/modules/finance/pages/money/BillsWorkspace";
import { expectHonestStateSignal } from "./_shared";

describe("Finance page — BillsWorkspace (Phase 5)", () => {
  it("mounts with empty bills and renders payment-queue shell", () => {
    const { container } = renderFinancePage(<BillsWorkspace />);
    expectHonestStateSignal(container, /PAYMENT QUEUE|Bills|No bills|animate-pulse/i);
  });
});
