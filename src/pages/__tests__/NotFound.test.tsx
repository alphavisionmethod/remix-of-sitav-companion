import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import NotFound from "../NotFound";

describe("NotFound", () => {
  it("renders 404 heading", () => {
    render(
      <MemoryRouter initialEntries={["/nonexistent"]}>
        <NotFound />
      </MemoryRouter>
    );
    expect(screen.getByText("404")).toBeInTheDocument();
  });

  it("renders navigation link to home", () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    );
    expect(screen.getByText("Go to Daily Pulse")).toBeInTheDocument();
  });

  it("renders go back button", () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    );
    expect(screen.getByText("Go back")).toBeInTheDocument();
  });
});
