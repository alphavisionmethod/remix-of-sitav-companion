import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PageErrorState } from "@/platform/sita/components/sita/PageErrorState";

describe("PageErrorState", () => {
  it("renders generic error message by default", () => {
    render(<PageErrorState />);
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("renders network variant with WiFi icon text", () => {
    render(<PageErrorState variant="network" />);
    expect(screen.getByText("Connection Lost")).toBeInTheDocument();
  });

  it("shows context in error message", () => {
    render(<PageErrorState context="connectors" />);
    expect(screen.getByText(/the connectors/)).toBeInTheDocument();
  });

  it("calls onRetry when retry button clicked", () => {
    const onRetry = vi.fn();
    render(<PageErrorState onRetry={onRetry} />);
    fireEvent.click(screen.getByText("Retry"));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("does not render retry button when onRetry is absent", () => {
    render(<PageErrorState />);
    expect(screen.queryByText("Retry")).not.toBeInTheDocument();
  });

  it("shows custom message when provided", () => {
    render(<PageErrorState message="Custom error text" />);
    expect(screen.getByText("Custom error text")).toBeInTheDocument();
  });
});