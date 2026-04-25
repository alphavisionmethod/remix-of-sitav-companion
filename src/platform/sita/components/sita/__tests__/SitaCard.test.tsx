import { describe, it, expect } from "vitest";
import { render, screen } from "@/test/test-utils";
import { SitaCard, SitaPageHeader, SitaMetric, SitaSectionHeader, SitaCardTitle } from "../SitaCard";

describe("SitaCard", () => {
  it("renders children", () => {
    render(<SitaCard>Hello Card</SitaCard>);
    expect(screen.getByText("Hello Card")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(<SitaCard className="p-10 custom">Content</SitaCard>);
    expect(container.firstChild).toHaveClass("custom");
  });
});

describe("SitaPageHeader", () => {
  it("renders title and subtitle", () => {
    render(<SitaPageHeader title="Page Title" subtitle="Sub text" />);
    expect(screen.getByText("Page Title")).toBeInTheDocument();
    expect(screen.getByText("Sub text")).toBeInTheDocument();
  });

  it("renders actions", () => {
    render(<SitaPageHeader title="T" actions={<button>Act</button>} />);
    expect(screen.getByText("Act")).toBeInTheDocument();
  });
});

describe("SitaMetric", () => {
  it("renders label and value", () => {
    render(<SitaMetric label="Revenue" value="$50K" />);
    expect(screen.getByText("Revenue")).toBeInTheDocument();
    expect(screen.getByText("$50K")).toBeInTheDocument();
  });

  it("renders trend indicator", () => {
    render(<SitaMetric label="Growth" value="12%" trend="up" />);
    expect(screen.getByText("↑")).toBeInTheDocument();
  });
});

describe("SitaSectionHeader", () => {
  it("renders title", () => {
    render(<SitaSectionHeader title="Section" />);
    expect(screen.getByText("Section")).toBeInTheDocument();
  });
});

describe("SitaCardTitle", () => {
  it("renders title with sub", () => {
    render(<SitaCardTitle sub="subtitle">Main Title</SitaCardTitle>);
    expect(screen.getByText("Main Title")).toBeInTheDocument();
    expect(screen.getByText("subtitle")).toBeInTheDocument();
  });
});
