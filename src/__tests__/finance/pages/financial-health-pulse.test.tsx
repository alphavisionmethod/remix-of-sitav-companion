// Phase 5 — page-state honesty: FinancialHealthPulse
import { describe, it, expect } from "vitest";
import { renderFinancePage } from "@/__tests__/finance/_helpers/render-finance-page";
import FinancialHealthPulse from "@/modules/finance/pages/money/FinancialHealthPulse";
import { expectHonestStateSignal } from "./_shared";

describe("Finance page — FinancialHealthPulse (Phase 5)", () => {
  it("mounts and renders financial health composite shell", () => {
    const { container } = renderFinancePage(<FinancialHealthPulse />);
    expectHonestStateSignal(container, /Financial Health|Income Quality|Composite/i);
  });
});
