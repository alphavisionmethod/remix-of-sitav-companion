import { describe, it, expect, vi } from "vitest";
import {
  renderConciergePage,
  screen,
} from "@/__tests__/concierge/_helpers/render-concierge-page";
import { useConciergeCAIData } from "@/modules/concierge/contexts/ConciergeDataContext";
import { useConciergeNavigation } from "@/modules/concierge/contexts/ConciergeNavigationContext";

function Probe() {
  const cai = useConciergeCAIData();
  const nav = useConciergeNavigation();
  return (
    <div>
      <span data-testid="rels">{cai.relationships?.length ?? "x"}</span>
      <span data-testid="obls">{cai.obligations?.length ?? "x"}</span>
      <span data-testid="mod">{nav.activeModule}</span>
      <button onClick={() => nav.navigateTo("life-admin")}>go</button>
    </div>
  );
}

describe("renderConciergePage helper", () => {
  it("provides default empty CAI + overview module", () => {
    renderConciergePage(<Probe />);
    expect(screen.getByTestId("rels").textContent).toBe("0");
    expect(screen.getByTestId("obls").textContent).toBe("0");
    expect(screen.getByTestId("mod").textContent).toBe("overview");
  });

  it("threads custom CAI + navigation overrides", () => {
    const navigateTo = vi.fn();
    renderConciergePage(<Probe />, {
      cai: { relationships: [{}, {}], obligations: [{}] },
      activeModule: "appointments",
      navigateTo,
    });
    expect(screen.getByTestId("rels").textContent).toBe("2");
    expect(screen.getByTestId("obls").textContent).toBe("1");
    expect(screen.getByTestId("mod").textContent).toBe("appointments");
    screen.getByText("go").click();
    expect(navigateTo).toHaveBeenCalledWith("life-admin");
  });
});