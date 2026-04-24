import { describe, it, expect } from "vitest";
import { render, screen } from "@/test/test-utils";
import React from "react";
import NotFound from "../NotFound";

describe("NotFound page (extended)", () => {
  it("renders 404 message", () => {
    render(<NotFound />);
    expect(screen.getByText("404")).toBeInTheDocument();
  });
});
