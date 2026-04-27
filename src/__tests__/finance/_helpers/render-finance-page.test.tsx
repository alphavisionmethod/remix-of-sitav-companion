import { describe, it, expect, vi } from "vitest";
import {
  renderFinancePage,
  screen,
} from "@/__tests__/finance/_helpers/render-finance-page";
import { useFinanceNavigation } from "@/modules/finance/contexts/FinanceNavigationContext";

function Probe() {
  const nav = useFinanceNavigation();
  return (
    <div>
      <span data-testid="mod">{nav.activeModule}</span>
      <button onClick={() => nav.navigateTo("approvals")}>go</button>
    </div>
  );
}

describe("renderFinancePage helper", () => {
  it("provides default overview module", () => {
    renderFinancePage(<Probe />);
    expect(screen.getByTestId("mod").textContent).toBe("overview");
  });

  it("threads navigation overrides", () => {
    const navigateTo = vi.fn();
    renderFinancePage(<Probe />, { activeModule: "money", navigateTo });
    expect(screen.getByTestId("mod").textContent).toBe("money");
    screen.getByText("go").click();
    expect(navigateTo).toHaveBeenCalledWith("approvals");
  });
});