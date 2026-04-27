// Phase 5 — page-state honesty: ExecutionDesk
import { describe, it, expect } from "vitest";
import { renderFinancePage } from "@/__tests__/finance/_helpers/render-finance-page";
import ExecutionDesk from "@/modules/finance/pages/investment-office/ExecutionDesk";
import { expectHonestStateSignal } from "./_shared";

describe("Finance page — ExecutionDesk (Phase 5)", () => {
  it("mounts under empty trade orders and renders execution shell", () => {
    const { container } = renderFinancePage(<ExecutionDesk />);
    expectHonestStateSignal(container, /Execution|Order|Trade|No orders|animate-pulse/i);
  });
});
