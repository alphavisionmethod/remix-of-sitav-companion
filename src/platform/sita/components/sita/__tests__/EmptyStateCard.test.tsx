import { describe, it, expect } from "vitest";
import { render, screen } from "@/test/test-utils";
import { EmptyState } from "../EmptyState";
import { AlertCircle } from "lucide-react";

describe("EmptyState", () => {
  it("renders title and description", () => {
    render(
      <EmptyState icon={AlertCircle} title="No Data" description="Nothing to show" />
    );
    expect(screen.getByText("No Data")).toBeInTheDocument();
    expect(screen.getByText("Nothing to show")).toBeInTheDocument();
  });

  it("renders action button when provided", () => {
    render(
      <EmptyState icon={AlertCircle} title="Empty" description="Desc" actionLabel="Add Item" onAction={() => {}} />
    );
    expect(screen.getByText("Add Item")).toBeInTheDocument();
  });

  it("does not render button when no action", () => {
    render(
      <EmptyState icon={AlertCircle} title="Empty" description="Desc" />
    );
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("renders card variant", () => {
    render(
      <EmptyState variant="card" icon={AlertCircle} title="Card Empty" description="Card desc" actionLabel="Go" ctaPath="/test" />
    );
    expect(screen.getByText("Card Empty")).toBeInTheDocument();
    expect(screen.getByText("Go")).toBeInTheDocument();
  });

  it("renders cta variant with actions", () => {
    render(
      <EmptyState variant="cta" icon={AlertCircle} title="CTA" description="Desc" actions={[{ label: "Create" }]} />
    );
    expect(screen.getByText("Create")).toBeInTheDocument();
  });
});
