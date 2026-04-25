import { describe, it, expect } from "vitest";
import { render } from "@/test/test-utils";
import React from "react";
import { PageSkeleton, SectionSkeleton } from "../PageSkeleton";

describe("PageSkeleton", () => {
  it("renders default 3 content rows", () => {
    const { container } = render(React.createElement(PageSkeleton));
    // 4 KPI skeletons + 3 content rows + header skeletons
    const skeletons = container.querySelectorAll(".skeleton-premium");
    expect(skeletons.length).toBeGreaterThanOrEqual(7);
  });

  it("renders custom number of rows", () => {
    const { container } = render(React.createElement(PageSkeleton, { rows: 5 }));
    const skeletons = container.querySelectorAll(".skeleton-premium");
    expect(skeletons.length).toBeGreaterThanOrEqual(9);
  });
});

describe("SectionSkeleton", () => {
  it("renders default 3 lines", () => {
    const { container } = render(React.createElement(SectionSkeleton));
    const skeletons = container.querySelectorAll(".skeleton-premium");
    expect(skeletons.length).toBe(3);
  });

  it("renders custom line count", () => {
    const { container } = render(React.createElement(SectionSkeleton, { lines: 5 }));
    const skeletons = container.querySelectorAll(".skeleton-premium");
    expect(skeletons.length).toBe(5);
  });
});
