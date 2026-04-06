import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import NotFound from "../NotFound";
import { DataModeProvider } from "@/contexts/DataModeContext";
import { DemoModeProvider } from "@/contexts/DemoModeProvider";

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <DataModeProvider>
    <DemoModeProvider>
      <MemoryRouter>{children}</MemoryRouter>
    </DemoModeProvider>
  </DataModeProvider>
);

describe("NotFound", () => {
  it("renders 404 heading", () => {
    render(<NotFound />, { wrapper: Wrapper });
    expect(screen.getByText("404")).toBeInTheDocument();
  });

  it("renders navigation link to home", () => {
    render(<NotFound />, { wrapper: Wrapper });
    expect(screen.getByText("Go to Daily Pulse")).toBeInTheDocument();
  });

  it("renders go back button", () => {
    render(<NotFound />, { wrapper: Wrapper });
    expect(screen.getByText("Go back")).toBeInTheDocument();
  });
});
