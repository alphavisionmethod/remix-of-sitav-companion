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

import { TechAdvisorHeaderStats } from "../TechAdvisorHeaderStats";
import { TechAdvisorSimulationForm } from "../TechAdvisorSimulationForm";

function makeQuery(result: { count?: number; data?: unknown[] }) {
  const builder: Record<string, unknown> = {};
  const methods = ["select", "eq", "neq", "in", "is", "not", "lt", "gte", "lte", "or", "order", "limit"] as const;
  for (const m of methods) builder[m] = () => builder;
  builder.then = (resolve: (v: { count: number; data: unknown[] }) => unknown) =>
    Promise.resolve({ count: result.count ?? 0, data: result.data ?? [] }).then(resolve);
  return builder;
}

describe("TechAdvisorHeaderStats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: { id: "u-1" } } });
  });

  it("renders all four reliability tiles", async () => {
    mockFrom.mockReturnValue(makeQuery({ count: 0, data: [] }));
    render(<TechAdvisorHeaderStats />);
    await waitFor(() => {
      expect(screen.getByText("Open incidents")).toBeInTheDocument();
      expect(screen.getByText("Errors 7d")).toBeInTheDocument();
      expect(screen.getByText("Unresolved")).toBeInTheDocument();
      expect(screen.getByText("Last severity")).toBeInTheDocument();
    });
  });

  it("surfaces RLS-scoped counts and last severity from real tables", async () => {
    let incidentsCallIndex = 0;
    mockFrom.mockImplementation((table: string) => {
      if (table === "incidents") {
        incidentsCallIndex += 1;
        // First incidents call is the open-count head query; second is the latest-severity row query.
        if (incidentsCallIndex === 1) return makeQuery({ count: 7 });
        return makeQuery({ data: [{ severity: "high" }] });
      }
      if (table === "error_events") return makeQuery({ count: 23 });
      return makeQuery({});
    });
    render(<TechAdvisorHeaderStats />);
    await waitFor(() => {
      expect(screen.getByText("7")).toBeInTheDocument();
      expect(screen.getAllByText("23").length).toBeGreaterThan(0);
      expect(screen.getByText("high")).toBeInTheDocument();
    });
  });

  it("falls back to em-dash when no incidents exist", async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === "incidents") return makeQuery({ count: 0, data: [] });
      if (table === "error_events") return makeQuery({ count: 0 });
      return makeQuery({});
    });
    render(<TechAdvisorHeaderStats />);
    await waitFor(() => {
      expect(screen.getByText("Last severity")).toBeInTheDocument();
      expect(screen.getByText("—")).toBeInTheDocument();
    });
  });
});

describe("TechAdvisorSimulationForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all 3 tech scenario types", () => {
    render(<TechAdvisorSimulationForm />);
    const select = screen.getByLabelText(/Scenario type/i) as HTMLSelectElement;
    const options = Array.from(select.options).map((o) => o.value);
    expect(options).toEqual(
      expect.arrayContaining(["architecture-tradeoff", "scaling-threshold", "migration-risk"]),
    );
    expect(options).toHaveLength(3);
  });

  it("relabels numeric input per scenario type", () => {
    render(<TechAdvisorSimulationForm />);
    expect(screen.getByLabelText(/Options/i)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/Scenario type/i), {
      target: { value: "scaling-threshold" },
    });
    expect(screen.getByLabelText(/Load multiplier/i)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/Scenario type/i), {
      target: { value: "migration-risk" },
    });
    expect(screen.getByLabelText(/Rollback steps/i)).toBeInTheDocument();
  });

  it("updates live prompt deterministically when delta changes", () => {
    render(<TechAdvisorSimulationForm />);
    fireEvent.change(screen.getByLabelText(/Scenario type/i), { target: { value: "scaling-threshold" } });
    fireEvent.change(screen.getByLabelText(/Load multiplier/i), { target: { value: 7 } });
    expect(screen.getByText(/at 7× current load/)).toBeInTheDocument();
  });

  it("blocks submission with whitespace-only title", async () => {
    render(<TechAdvisorSimulationForm />);
    fireEvent.change(screen.getByLabelText(/Scenario title/i), { target: { value: "  " } });
    fireEvent.click(screen.getByRole("button", { name: /Run scenario/i }));
    expect(simMock).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(toastMock).toHaveBeenCalledWith(
        expect.objectContaining({ title: expect.stringMatching(/title/i) }),
      );
    });
  });

  it("calls runAdvisorSimulation with tech-advisor id and scenario payload", async () => {
    simMock.mockResolvedValue({ status: "completed", confidence: 0.81, riskSummary: "" });
    render(<TechAdvisorSimulationForm />);
    fireEvent.change(screen.getByLabelText(/Scenario title/i), {
      target: { value: "Postgres → Aurora migration" },
    });
    fireEvent.change(screen.getByLabelText(/Scenario type/i), { target: { value: "migration-risk" } });
    fireEvent.change(screen.getByLabelText(/Rollback steps/i), { target: { value: 4 } });
    fireEvent.click(screen.getByRole("button", { name: /Run scenario/i }));
    await waitFor(() => {
      expect(simMock).toHaveBeenCalledWith(
        expect.objectContaining({
          advisorId: "tech-advisor",
          scenarioTitle: "Postgres → Aurora migration",
          inputs: expect.objectContaining({ scenario_type: "migration-risk", delta: 4 }),
        }),
      );
    });
  });

  it("each tech scenario produces a distinct prompt", () => {
    render(<TechAdvisorSimulationForm />);
    const arch = screen.getByText(/architecture option/).textContent;
    fireEvent.change(screen.getByLabelText(/Scenario type/i), { target: { value: "scaling-threshold" } });
    const scale = screen.getByText(/current load/).textContent;
    fireEvent.change(screen.getByLabelText(/Scenario type/i), { target: { value: "migration-risk" } });
    const mig = screen.getByText(/discrete rollback step/).textContent;
    expect(new Set([arch, scale, mig]).size).toBe(3);
  });

  it("surfaces simulation failure via toast", async () => {
    simMock.mockRejectedValue(new Error("provider down"));
    render(<TechAdvisorSimulationForm />);
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
});