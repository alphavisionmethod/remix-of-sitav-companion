import { describe, it, expect, vi } from "vitest";
import { render } from "@/test/test-utils";
import * as fs from "fs";
import { CANONICAL_PRIMITIVES } from "@/platform/architecture/component-registry";

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => vi.fn(), useParams: () => ({}), useSearchParams: () => [new URLSearchParams(), vi.fn()] };
});

describe("Canonical Primitives Coverage", () => {
  it("all canonical primitives exist on disk", () => {
    const missing: string[] = [];
    for (const [name, path] of Object.entries(CANONICAL_PRIMITIVES)) {
      if (!fs.existsSync(path)) missing.push(name);
    }
    expect(missing).toHaveLength(0);
  });

  it("canonical primitive count matches expected", () => {
    const count = Object.keys(CANONICAL_PRIMITIVES).length;
    expect(count).toBeGreaterThanOrEqual(14);
  });

  it("BaseCard renders", async () => {
    const mod = await import("@/components/primitives/display/BaseCard");
    const BaseCard = mod.default || mod.BaseCard;
    const { container } = render(<BaseCard>Content</BaseCard>);
    expect(container.firstChild).not.toBeNull();
  });

  it("StatusBadge renders", async () => {
    const mod = await import("@/components/primitives/status/StatusBadge");
    const StatusBadge = mod.default || mod.StatusBadge;
    const { container } = render(<StatusBadge status="active" />);
    expect(container.firstChild).not.toBeNull();
  });

  it("EmptyState renders", async () => {
    const mod = await import("@/components/primitives/feedback/EmptyState");
    const EmptyState = mod.default || mod.EmptyState;
    const { container } = render(<EmptyState title="Nothing" />);
    expect(container.firstChild).not.toBeNull();
  });

  it("Panel renders", async () => {
    const mod = await import("@/components/primitives/display/Panel");
    const Panel = mod.default || mod.Panel;
    const { container } = render(<Panel>Content</Panel>);
    expect(container.firstChild).not.toBeNull();
  });
});