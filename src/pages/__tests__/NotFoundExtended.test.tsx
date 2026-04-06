import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
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

describe("NotFound page (extended)", () => {
  it("renders 404 message", () => {
    render(<NotFound />, { wrapper: Wrapper });
    expect(screen.getByText("404")).toBeInTheDocument();
  });
});
