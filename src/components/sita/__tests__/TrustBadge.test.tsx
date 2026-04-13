import { describe, it, expect } from "vitest";
import { render, screen } from "@/test/test-utils";
import React from "react";
import { TrustBadge, type TrustLevel } from "../TrustBadge";

describe("TrustBadge", () => {
  const levels: TrustLevel[] = ["safe", "verified", "review", "approval", "high-impact", "low-confidence", "recovered", "degraded", "blocked"];

  it.each(levels)("renders %s trust level", (level) => {
    render(React.createElement(TrustBadge, { level }));
    // Each level has a default label
    const expectedLabels: Record<string, string> = {
      safe: "Safe", verified: "Verified", review: "Review Required",
      approval: "Approval Required", "high-impact": "High Impact",
      "low-confidence": "Low Confidence", recovered: "Recovered",
      degraded: "Degraded", blocked: "Blocked",
    };
    expect(screen.getByText(expectedLabels[level])).toBeInTheDocument();
  });

  it("uses custom label when provided", () => {
    render(React.createElement(TrustBadge, { level: "safe", label: "Custom Label" }));
    expect(screen.getByText("Custom Label")).toBeInTheDocument();
  });

  it("renders sm size", () => {
    const { container } = render(React.createElement(TrustBadge, { level: "safe", size: "sm" }));
    expect(container.querySelector("span")?.className).toContain("text-[10px]");
  });
});
