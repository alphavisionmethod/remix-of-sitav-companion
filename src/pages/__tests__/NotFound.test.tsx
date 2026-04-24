import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/test/test-utils";
import NotFound from "../NotFound";

describe("NotFound", () => {
  it("renders 404 heading", () => {
    render(<NotFound />);
    expect(screen.getByText("404")).toBeInTheDocument();
  });

  it("renders navigation link to home", () => {
    render(<NotFound />);
    expect(screen.getByText("Go to Daily Pulse")).toBeInTheDocument();
  });

  it("renders go back button", () => {
    render(<NotFound />);
    expect(screen.getByText("Go back")).toBeInTheDocument();
  });
});
