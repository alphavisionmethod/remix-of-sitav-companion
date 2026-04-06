import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import NotFound from "../NotFound";

describe("NotFound page (extended)", () => {
  it("renders 404 message", () => {
    render(React.createElement(MemoryRouter, null, React.createElement(NotFound)));
    expect(screen.getByText("404")).toBeInTheDocument();
  });
});
