import { describe, it, expect } from "vitest";
import { render, screen } from "@/test/test-utils";
import React from "react";
import { SitaPageHeader } from "../SitaPageHeader";

describe("SitaPageHeader", () => {
  it("renders title and subtitle", () => {
    render(React.createElement(SitaPageHeader, {
      icon: React.createElement("span", null, "🏠"),
      title: "Test Title",
      subtitle: "Test Subtitle",
    }));
    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByText("Test Subtitle")).toBeInTheDocument();
  });

  it("renders children in actions area", () => {
    render(React.createElement(SitaPageHeader, {
      icon: React.createElement("span", null, "🏠"),
      title: "Title",
      subtitle: "Sub",
    }, React.createElement("button", null, "Action")));
    expect(screen.getByText("Action")).toBeInTheDocument();
  });

  it("renders icon", () => {
    render(React.createElement(SitaPageHeader, {
      icon: React.createElement("span", { "data-testid": "icon" }, "🏠"),
      title: "Title",
      subtitle: "Sub",
    }));
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });
});
