import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// ── Supabase client mock ───────────────────────────────────────
const mockFrom = vi.fn();
const mockGetUser = vi.fn();
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: { getUser: () => mockGetUser() },
    from: (table: string) => mockFrom(table),
  },
}));

// ── Advisor runtime mock ───────────────────────────────────────
const askMock = vi.fn();
const simMock = vi.fn();
vi.mock("@/lib/ai-platform/runtime", () => ({
  askBusinessAdvisor: (args: unknown) => askMock(args),
  runAdvisorSimulation: (args: unknown) => simMock(args),
}));

// ── Toast mock ─────────────────────────────────────────────────
const toastMock = vi.fn();
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: toastMock }),
}));

import { CustomerServiceHeaderStats } from "../CustomerServiceHeaderStats";
import { CustomerServiceSimulationForm } from "../CustomerServiceSimulationForm";

function makeCountQuery(count: number) {
  // Chainable builder: every method returns `this`, terminal `await` resolves to { count }
  const builder: Record<string, unknown> = {};
  const methods = ["select", "eq", "in", "not", "lt", "gte", "order", "limit"] as const;
  for (const m of methods) builder[m] = () => builder;
  builder.then = (resolve: (v: { count: number; data: unknown[] }) => unknown) =>
    Promise.resolve({ count, data: [] }).then(resolve);
  return builder;
}

describe("CustomerServiceHeaderStats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
  });

  it("renders all four tiles with empty (zero) state", async () => {
    mockFrom.mockReturnValue(makeCountQuery(0));
    render(<CustomerServiceHeaderStats />);
    await waitFor(() => {
      expect(screen.getByText("Open cases")).toBeInTheDocument();
      expect(screen.getByText("Urgent (>24h)")).toBeInTheDocument();
      expect(screen.getByText("Escalated")).toBeInTheDocument();
      expect(screen.getByText("At-risk customers")).toBeInTheDocument();
    });
  });

  it("renders counts when populated", async () => {
    let callIdx = 0;
    const counts = [12, 3, 1, 2];
    mockFrom.mockImplementation(() => makeCountQuery(counts[callIdx++ % counts.length]));
    render(<CustomerServiceHeaderStats />);
    await waitFor(() => {
      expect(screen.getByText("12")).toBeInTheDocument();
      expect(screen.getByText("3")).toBeInTheDocument();
      expect(screen.getByText("1")).toBeInTheDocument();
      expect(screen.getByText("2")).toBeInTheDocument();
    });
  });
});

describe("CustomerServiceSimulationForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all 3 scenario types in the type selector", () => {
    render(<CustomerServiceSimulationForm />);
    const select = screen.getByLabelText(/Scenario type/i) as HTMLSelectElement;
    const options = Array.from(select.options).map((o) => o.value);
    expect(options).toEqual(
      expect.arrayContaining(["response-time-target", "staffing-change", "escalation-policy"]),
    );
    expect(options).toHaveLength(3);
  });

  it("blocks submission when title is empty", async () => {
    render(<CustomerServiceSimulationForm />);
    fireEvent.click(screen.getByRole("button", { name: /Run scenario/i }));
    expect(simMock).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(toastMock).toHaveBeenCalledWith(
        expect.objectContaining({ title: expect.stringMatching(/title/i) }),
      );
    });
  });

  it("calls runAdvisorSimulation with the customer-service-advisor id and scenario inputs", async () => {
    simMock.mockResolvedValue({ status: "completed", confidence: 0.82, riskSummary: "" });
    render(<CustomerServiceSimulationForm />);
    fireEvent.change(screen.getByLabelText(/Scenario title/i), {
      target: { value: "Tighten SLA to 1h" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Run scenario/i }));
    await waitFor(() => {
      expect(simMock).toHaveBeenCalledWith(
        expect.objectContaining({
          advisorId: "customer-service-advisor",
          scenarioTitle: "Tighten SLA to 1h",
          inputs: expect.objectContaining({ scenario_type: "response-time-target" }),
        }),
      );
    });
  });
});