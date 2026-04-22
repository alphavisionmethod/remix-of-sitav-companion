import { describe, it, expect, vi } from "vitest";
import { render } from "@/test/test-utils";
import * as fs from "fs";
import { CANONICAL_PRIMITIVES } from "@/platform/architecture/component-registry";
import { BaseCard } from "@/components/primitives/display/BaseCard";
import { StatusBadge } from "@/components/primitives/status/StatusBadge";
import { EmptyState } from "@/components/primitives/feedback/EmptyState";
import { Panel } from "@/components/primitives/display/Panel";

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

  it("BaseCard renders", () => {
    const { container } = render(<BaseCard>Content</BaseCard>);
    expect(container.firstChild).not.toBeNull();
  });

  it("StatusBadge renders", () => {
    const { container } = render(<StatusBadge status="active" />);
    expect(container.firstChild).not.toBeNull();
  });

  it("EmptyState renders", () => {
    const { container } = render(<EmptyState title="Nothing" />);
    expect(container.firstChild).not.toBeNull();
  });

  it("Panel renders", () => {
    const { container } = render(<Panel>Content</Panel>);
    expect(container.firstChild).not.toBeNull();
  });
});