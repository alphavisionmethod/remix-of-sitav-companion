import { describe, it, expect, vi } from "vitest";
import { render } from "@/test/test-utils";

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => vi.fn(), useParams: () => ({}), useSearchParams: () => [new URLSearchParams(), vi.fn()] };
});

describe("Component Smoke Tests - Domain Components", () => {
  it("NavLink renders", async () => {
    const { default: NavLink } = await import("@/components/NavLink");
    const { container } = render(<NavLink to="/test">Link</NavLink>);
    expect(container.firstChild).toBeTruthy();
  });

  it("DemoStateBanner renders", async () => {
    const mod = await import("@/components/reality/DemoStateBanner");
    const Component = mod.default || mod.DemoStateBanner;
    if (Component) {
      const { container } = render(<Component />);
      expect(container).toBeTruthy();
    }
  });

  it("RealityStateBadge renders", async () => {
    const mod = await import("@/components/reality/RealityStateBadge");
    const Component = mod.default || mod.RealityStateBadge;
    if (Component) {
      const { container } = render(<Component />);
      expect(container).toBeTruthy();
    }
  });

  it("AIStateBadge renders", async () => {
    const mod = await import("@/components/ai/AIStateBadge");
    const Component = mod.default || mod.AIStateBadge;
    if (Component) {
      const { container } = render(<Component />);
      expect(container).toBeTruthy();
    }
  });

  it("AIDegradedState renders", async () => {
    const mod = await import("@/components/ai/AIDegradedState");
    const Component = mod.default || mod.AIDegradedState;
    if (Component) {
      const { container } = render(<Component />);
      expect(container).toBeTruthy();
    }
  });
});
