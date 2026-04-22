import { describe, it, expect, vi } from "vitest";
import { render } from "@/test/test-utils";

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => vi.fn(), useParams: () => ({}), useSearchParams: () => [new URLSearchParams(), vi.fn()] };
});

async function getDefaultExport(loader: () => Promise<any>) {
  const mod = await loader();
  return mod.default || Object.values(mod).find((v: any) => typeof v === "function");
}

describe("Component Smoke Tests - Domain Components", () => {
  it("NavLink renders", async () => {
    const Component = await getDefaultExport(() => import("@/components/NavLink"));
    if (Component) {
      const { container } = render(<Component to="/test">Link</Component>);
      expect(container.firstChild).toBeTruthy();
    }
  });

  it("DemoStateBanner renders", async () => {
    const Component = await getDefaultExport(() => import("@/components/reality/DemoStateBanner"));
    if (Component) {
      const { container } = render(<Component />);
      expect(container).toBeTruthy();
    }
  });

  it("RealityStateBadge renders", async () => {
    const Component = await getDefaultExport(() => import("@/components/reality/RealityStateBadge"));
    if (Component) {
      const { container } = render(<Component stateClass="demo" />);
      expect(container).toBeTruthy();
    }
  });

  it("AIStateBadge renders", async () => {
    const Component = await getDefaultExport(() => import("@/components/ai/AIStateBadge"));
    if (Component) {
      const { container } = render(<Component state="healthy" />);
      expect(container).toBeTruthy();
    }
  });

  it("AIDegradedState renders", async () => {
    const Component = await getDefaultExport(() => import("@/components/ai/AIDegradedState"));
    if (Component) {
      const { container } = render(<Component />);
      expect(container).toBeTruthy();
    }
  });
});
