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

import { GrowthAdvisorHeaderStats } from "../GrowthAdvisorHeaderStats";
import { GrowthAdvisorSimulationForm } from "../GrowthAdvisorSimulationForm";

function makeQuery(result: { count?: number; data?: unknown[] }) {
  const builder: Record<string, unknown> = {};
  const methods = ["select", "eq", "neq", "in", "not", "lt", "gte", "lte", "or", "order", "limit"] as const;
  for (const m of methods) builder[m] = () => builder;
  builder.then = (resolve: (v: { count: number; data: unknown[] }) => unknown) =>
    Promise.resolve({ count: result.count ?? 0, data: result.data ?? [] }).then(resolve);
  return builder;
}

describe("GrowthAdvisorHeaderStats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: { id: "u-1" } } });
  });

  it("renders all four growth tiles", async () => {
    mockFrom.mockReturnValue(makeQuery({ count: 0, data: [] }));
    render(<GrowthAdvisorHeaderStats />);
    await waitFor(() => {
      expect(screen.getByText("Activity 30d")).toBeInTheDocument();
      expect(screen.getByText("Funnel stages")).toBeInTheDocument();
      expect(screen.getByText("Lifecycle cohorts")).toBeInTheDocument();
      expect(screen.getByText("Active experiments")).toBeInTheDocument();
    });
  });

  it("surfaces RLS-scoped counts per source table", async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === "app_launch_events") return makeQuery({ count: 42 });
      if (table === "customer_journey_stages") return makeQuery({ count: 5 });
      if (table === "customer_lifecycle_stages") return makeQuery({ count: 4 });
      if (table === "conversion_experiments") return makeQuery({ count: 2 });
      return makeQuery({});
    });
    render(<GrowthAdvisorHeaderStats />);
    await waitFor(() => {
      expect(screen.getByText("42")).toBeInTheDocument();
      expect(screen.getByText("5")).toBeInTheDocument();
      expect(screen.getByText("4")).toBeInTheDocument();
      expect(screen.getByText("2")).toBeInTheDocument();
    });
  });
});

describe("GrowthAdvisorSimulationForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all 3 scenario types", () => {
    render(<GrowthAdvisorSimulationForm />);
    const select = screen.getByLabelText(/Scenario type/i) as HTMLSelectElement;
    const options = Array.from(select.options).map((o) => o.value);
    expect(options).toEqual(
      expect.arrayContaining(["activation-lift", "retention-play", "experiment-design"]),
    );
    expect(options).toHaveLength(3);
  });

  it("updates live prompt when delta changes", () => {
    render(<GrowthAdvisorSimulationForm />);
    fireEvent.change(screen.getByLabelText(/Delta \(%\)/i), { target: { value: 35 } });
    expect(screen.getByText(/activation rate by 35%/)).toBeInTheDocument();
  });

  it("relabels numeric input for experiment-design", () => {
    render(<GrowthAdvisorSimulationForm />);
    fireEvent.change(screen.getByLabelText(/Scenario type/i), {
      target: { value: "experiment-design" },
    });
    expect(screen.getByLabelText(/Variants/i)).toBeInTheDocument();
  });

  it("blocks submission with whitespace title", async () => {
    render(<GrowthAdvisorSimulationForm />);
    fireEvent.change(screen.getByLabelText(/Scenario title/i), { target: { value: "  " } });
    fireEvent.click(screen.getByRole("button", { name: /Run scenario/i }));
    expect(simMock).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(toastMock).toHaveBeenCalledWith(
        expect.objectContaining({ title: expect.stringMatching(/title/i) }),
      );
    });
  });

  it("calls runAdvisorSimulation with growth-advisor id", async () => {
    simMock.mockResolvedValue({ status: "completed", confidence: 0.74, riskSummary: "" });
    render(<GrowthAdvisorSimulationForm />);
    fireEvent.change(screen.getByLabelText(/Scenario title/i), {
      target: { value: "Activation push v1" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Run scenario/i }));
    await waitFor(() => {
      expect(simMock).toHaveBeenCalledWith(
        expect.objectContaining({
          advisorId: "growth-advisor",
          scenarioTitle: "Activation push v1",
          inputs: expect.objectContaining({ scenario_type: "activation-lift", delta: 20 }),
        }),
      );
    });
  });

  it("each growth scenario produces a distinct prompt", () => {
    render(<GrowthAdvisorSimulationForm />);
    const activation = screen.getByText(/lifting activation rate/).textContent;
    fireEvent.change(screen.getByLabelText(/Scenario type/i), { target: { value: "retention-play" } });
    const retention = screen.getByText(/cutting churn/).textContent;
    fireEvent.change(screen.getByLabelText(/Scenario type/i), { target: { value: "experiment-design" } });
    const exp = screen.getByText(/2-week conversion experiment/).textContent;
    expect(new Set([activation, retention, exp]).size).toBe(3);
  });
});