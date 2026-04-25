import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

const mockFrom = vi.fn();
const mockGetUser = vi.fn();
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: { getUser: () => mockGetUser() },
    from: (table: string) => mockFrom(table),
  },
}));

const askMock = vi.fn();
const simMock = vi.fn();
vi.mock("@/lib/ai-platform/runtime", () => ({
  askBusinessAdvisor: (args: unknown) => askMock(args),
  runAdvisorSimulation: (args: unknown) => simMock(args),
}));

const toastMock = vi.fn();
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: toastMock }),
}));

import { ImportsExportsHeaderStats } from "../ImportsExportsHeaderStats";
import { ImportsExportsSimulationForm } from "../ImportsExportsSimulationForm";

function makeQuery(result: { count?: number; data?: unknown[] }) {
  const builder: Record<string, unknown> = {};
  const methods = ["select", "eq", "neq", "in", "is", "not", "lt", "gte", "lte", "or", "order", "limit"] as const;
  for (const m of methods) builder[m] = () => builder;
  builder.then = (resolve: (v: { count: number; data: unknown[] }) => unknown) =>
    Promise.resolve({ count: result.count ?? 0, data: result.data ?? [] }).then(resolve);
  return builder;
}

describe("ImportsExportsHeaderStats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: { id: "u-1" } } });
  });

  it("renders all four trade tiles", async () => {
    mockFrom.mockReturnValue(makeQuery({ count: 0, data: [] }));
    render(<ImportsExportsHeaderStats />);
    await waitFor(() => {
      expect(screen.getByText("Vendors")).toBeInTheDocument();
      expect(screen.getByText("Trade docs")).toBeInTheDocument();
      expect(screen.getByText("Unclassified")).toBeInTheDocument();
      expect(screen.getByText("Last doc")).toBeInTheDocument();
    });
  });

  it("surfaces RLS-scoped vendor and doc counts", async () => {
    let fmIndex = 0;
    mockFrom.mockImplementation((table: string) => {
      if (table === "crm_contacts") return makeQuery({ count: 11 });
      if (table === "file_metadata") {
        fmIndex += 1;
        // 1st: trade docs head, 2nd: missing classification head, 3rd: latest doc list
        if (fmIndex === 1) return makeQuery({ count: 17 });
        if (fmIndex === 2) return makeQuery({ count: 4 });
        return makeQuery({ data: [{ created_at: new Date().toISOString() }] });
      }
      return makeQuery({});
    });
    render(<ImportsExportsHeaderStats />);
    await waitFor(() => {
      expect(screen.getByText("11")).toBeInTheDocument();
      expect(screen.getByText("17")).toBeInTheDocument();
      expect(screen.getByText("4")).toBeInTheDocument();
    });
  });

  it("falls back to em-dash when no docs uploaded", async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === "crm_contacts") return makeQuery({ count: 0 });
      if (table === "file_metadata") return makeQuery({ count: 0, data: [] });
      return makeQuery({});
    });
    render(<ImportsExportsHeaderStats />);
    await waitFor(() => {
      expect(screen.getByText("Last doc")).toBeInTheDocument();
      expect(screen.getByText("—")).toBeInTheDocument();
    });
  });
});

describe("ImportsExportsSimulationForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all 3 trade scenario types", () => {
    render(<ImportsExportsSimulationForm />);
    const select = screen.getByLabelText(/Scenario type/i) as HTMLSelectElement;
    const options = Array.from(select.options).map((o) => o.value);
    expect(options).toEqual(
      expect.arrayContaining(["sourcing-comparison", "tariff-exposure", "logistics-tradeoff"]),
    );
    expect(options).toHaveLength(3);
  });

  it("relabels numeric input per scenario type", () => {
    render(<ImportsExportsSimulationForm />);
    expect(screen.getByLabelText(/Vendors to compare/i)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/Scenario type/i), {
      target: { value: "tariff-exposure" },
    });
    expect(screen.getByLabelText(/Tariff change/i)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/Scenario type/i), {
      target: { value: "logistics-tradeoff" },
    });
    expect(screen.getByLabelText(/Modes\/routes to compare/i)).toBeInTheDocument();
  });

  it("updates live prompt deterministically when delta changes", () => {
    render(<ImportsExportsSimulationForm />);
    fireEvent.change(screen.getByLabelText(/Scenario type/i), { target: { value: "tariff-exposure" } });
    fireEvent.change(screen.getByLabelText(/Tariff change/i), { target: { value: 12 } });
    expect(screen.getByText(/12% tariff change/)).toBeInTheDocument();
  });

  it("blocks submission with whitespace-only title", async () => {
    render(<ImportsExportsSimulationForm />);
    fireEvent.change(screen.getByLabelText(/Scenario title/i), { target: { value: "  " } });
    fireEvent.click(screen.getByRole("button", { name: /Run scenario/i }));
    expect(simMock).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(toastMock).toHaveBeenCalledWith(
        expect.objectContaining({ title: expect.stringMatching(/title/i) }),
      );
    });
  });

  it("calls runAdvisorSimulation with imports-exports-advisor id and scenario payload", async () => {
    simMock.mockResolvedValue({ status: "completed", confidence: 0.74, riskSummary: "" });
    render(<ImportsExportsSimulationForm />);
    fireEvent.change(screen.getByLabelText(/Scenario title/i), {
      target: { value: "Vietnam vs Mexico sourcing" },
    });
    fireEvent.change(screen.getByLabelText(/Vendors to compare/i), { target: { value: 4 } });
    fireEvent.click(screen.getByRole("button", { name: /Run scenario/i }));
    await waitFor(() => {
      expect(simMock).toHaveBeenCalledWith(
        expect.objectContaining({
          advisorId: "imports-exports-advisor",
          scenarioTitle: "Vietnam vs Mexico sourcing",
          inputs: expect.objectContaining({ scenario_type: "sourcing-comparison", delta: 4 }),
        }),
      );
    });
  });

  it("each trade scenario produces a distinct prompt", () => {
    render(<ImportsExportsSimulationForm />);
    const sourcing = screen.getByText(/sourcing option/).textContent;
    fireEvent.change(screen.getByLabelText(/Scenario type/i), { target: { value: "tariff-exposure" } });
    const tariff = screen.getByText(/tariff change/).textContent;
    fireEvent.change(screen.getByLabelText(/Scenario type/i), { target: { value: "logistics-tradeoff" } });
    const logistics = screen.getByText(/freight mode/).textContent;
    expect(new Set([sourcing, tariff, logistics]).size).toBe(3);
  });

  it("surfaces simulation failure via toast", async () => {
    simMock.mockRejectedValue(new Error("provider down"));
    render(<ImportsExportsSimulationForm />);
    fireEvent.change(screen.getByLabelText(/Scenario title/i), { target: { value: "Sanity check" } });
    fireEvent.click(screen.getByRole("button", { name: /Run scenario/i }));
    await waitFor(() => {
      expect(toastMock).toHaveBeenCalledWith(
        expect.objectContaining({
          title: expect.stringMatching(/Simulation failed/i),
          description: "provider down",
          variant: "destructive",
        }),
      );
    });
  });

  it("blocks customs filing / contract execution from advisor manifest", async () => {
    const { BUSINESS_ADVISORS } = await import("@/lib/ai-platform/runtime/business-advisor-registry");
    const advisor = BUSINESS_ADVISORS["imports-exports-advisor"];
    expect(advisor.blockedActions).toEqual(
      expect.arrayContaining(["execute_customs_filing", "commit_supplier_contract", "modify_shipping_live"]),
    );
    expect(advisor.authority).toBe("L2-recommend");
  });
});