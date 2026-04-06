import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { EmptyStateCard } from "../EmptyStateCard";
import { AlertCircle } from "lucide-react";

describe("EmptyStateCard", () => {
  it("renders title and description", () => {
    render(
      <MemoryRouter>
        <EmptyStateCard icon={AlertCircle} title="No Data" description="Nothing to show" />
      </MemoryRouter>
    );
    expect(screen.getByText("No Data")).toBeInTheDocument();
    expect(screen.getByText("Nothing to show")).toBeInTheDocument();
  });

  it("renders CTA button when provided", () => {
    render(
      <MemoryRouter>
        <EmptyStateCard icon={AlertCircle} title="Empty" description="Desc" ctaLabel="Add Item" />
      </MemoryRouter>
    );
    expect(screen.getByText("Add Item")).toBeInTheDocument();
  });

  it("does not render CTA when not provided", () => {
    render(
      <MemoryRouter>
        <EmptyStateCard icon={AlertCircle} title="Empty" description="Desc" />
      </MemoryRouter>
    );
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
