// Phase 5 — page-state honesty: BudgetEnvelopeOffice
import { describe, it, expect } from "vitest";
import { renderFinancePage } from "@/__tests__/finance/_helpers/render-finance-page";
import BudgetEnvelopeOffice from "@/modules/finance/pages/money/BudgetEnvelopeOffice";
import { expectHonestStateSignal } from "./_shared";

describe("Finance page — BudgetEnvelopeOffice (Phase 5)", () => {
  it("mounts and renders budget shell with empty envelopes", () => {
    const { container } = renderFinancePage(<BudgetEnvelopeOffice />);
    expectHonestStateSignal(container, /BUDGET|ENVELOPE|every dollar a job/i);
  });
});
