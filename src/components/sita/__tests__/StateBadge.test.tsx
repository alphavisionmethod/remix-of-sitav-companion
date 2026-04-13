import { describe, it, expect } from "vitest";
import { render, screen } from "@/test/test-utils";
import React from "react";
import { StateBadge, type ExecutionState } from "../StateBadge";

describe("StateBadge", () => {
  const states: ExecutionState[] = ["proposed", "drafted", "simulated", "approved", "queued", "executing", "completed", "verified", "failed", "escalated", "rolled-back"];

  it.each(states)("renders %s state with correct label", (state) => {
    render(React.createElement(StateBadge, { state }));
    const expectedLabels: Record<string, string> = {
      proposed: "Proposed", drafted: "Drafted", simulated: "Simulated",
      approved: "Approved", queued: "Queued", executing: "Executing",
      completed: "Completed", verified: "Verified", failed: "Failed",
      escalated: "Escalated", "rolled-back": "Rolled Back",
    };
    expect(screen.getByText(expectedLabels[state])).toBeInTheDocument();
  });

  it("renders sm size variant", () => {
    const { container } = render(React.createElement(StateBadge, { state: "completed", size: "sm" }));
    expect(container.querySelector("span")?.className).toContain("text-[10px]");
  });

  it("renders default size variant", () => {
    const { container } = render(React.createElement(StateBadge, { state: "completed", size: "default" }));
    expect(container.querySelector("span")?.className).toContain("text-[11px]");
  });
});
