// Phase 5 — page-state honesty: WealthCommandCenter
import { describe, it, expect } from "vitest";
import { renderFinancePage } from "@/__tests__/finance/_helpers/render-finance-page";
import WealthCommandCenter from "@/modules/finance/pages/WealthCommandCenter";
import { expectHonestStateSignal } from "./_shared";

describe("Finance page — WealthCommandCenter (Phase 5)", () => {
  it("mounts and renders Net Worth ticker shell", () => {
    const { container } = renderFinancePage(<WealthCommandCenter />);
    expectHonestStateSignal(container, /Net Worth|Total Net Worth|Wealth/i);
  });
});
