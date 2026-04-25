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

import { CFOAdvisorHeaderStats } from "../CFOAdvisorHeaderStats";
import { CFOAdvisorSimulationForm } from "../CFOAdvisorSimulationForm";

function makeQuery(result: { count?: number; data?: unknown[] }) {
  const builder: Record<string, unknown> = {};
  const methods = ["select", "eq", "neq", "in", "not", "lt", "gte", "order", "limit"] as const;
  for (const m of methods) builder[m] = () => builder;
  builder.then = (resolve: (v: { count: number; data: unknown[] }) => unknown) =>
    Promise.resolve({ count: result.count ?? 0, data: result.data ?? [] }).then(resolve);
  return builder;
}

describe("CFOAdvisorHeaderStats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
  });

  it("renders all four tiles with empty state", async () => {
    mockFrom.mockReturnValue(makeQuery({ count: 0, data: [] }));
    render(<CFOAdvisorHeaderStats />);
    await waitFor(() => {
      expect(screen.getByText("Cash 30d (net)")).toBeInTheDocument();
      expect(screen.getByText("Overdue invoices")).toBeInTheDocument();
      expect(screen.getByText("Open invoices")).toBeInTheDocument();
      expect(screen.getByText("Budget breaches")).toBeInTheDocument();
    });
  });

  it("computes net cash from credit/debit transactions", async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === "transactions") {
        return makeQuery({
          data: [
            { amount_cents: 100000, direction: "credit", currency: "USD" },
            { amount_cents: 30000, direction: "debit", currency: "USD" },
          ],
        });
      }
      if (table === "invoices") return makeQuery({ count: 2, data: [{ amount_cents: 50000, currency: "USD" }] });
      if (table === "budgets") return makeQuery({ data: [{ allocated_cents: 100, spent_cents: 200 }] });
      return makeQuery({ count: 0, data: [] });
    });
    render(<CFOAdvisorHeaderStats />);
    await waitFor(() => {
      // Net = 100000 - 30000 = 70000 cents = $700
      expect(screen.getByText(/\$700/)).toBeInTheDocument();
      // Overdue invoices count
      expect(screen.getByText("2")).toBeInTheDocument();
      // Budget breach count = 1
      expect(screen.getByText("1")).toBeInTheDocument();
    });
  });
});

describe("CFOAdvisorSimulationForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all 3 scenario types in the type selector", () => {
    render(<CFOAdvisorSimulationForm />);
    const select = screen.getByLabelText(/Scenario type/i) as HTMLSelectElement;
    const options = Array.from(select.options).map((o) => o.value);
    expect(options).toEqual(
      expect.arrayContaining(["runway-shift", "spend-cut", "collection-acceleration"]),
    );
    expect(options).toHaveLength(3);
  });

  it("updates the live prompt preview as inputs change", () => {
    render(<CFOAdvisorSimulationForm />);
    fireEvent.change(screen.getByLabelText(/Shift/i), { target: { value: 25 } });
    expect(screen.getByText(/shifts by 25%/)).toBeInTheDocument();
  });

  it("blocks submission when title is empty", async () => {
    render(<CFOAdvisorSimulationForm />);
    fireEvent.click(screen.getByRole("button", { name: /Run scenario/i }));
    expect(simMock).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(toastMock).toHaveBeenCalledWith(
        expect.objectContaining({ title: expect.stringMatching(/title/i) }),
      );
    });
  });

  it("calls runAdvisorSimulation with cfo-advisor id and scenario inputs", async () => {
    simMock.mockResolvedValue({ status: "completed", confidence: 0.78, riskSummary: "" });
    render(<CFOAdvisorSimulationForm />);
    fireEvent.change(screen.getByLabelText(/Scenario title/i), {
      target: { value: "Plan for Q3 revenue dip" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Run scenario/i }));
    await waitFor(() => {
      expect(simMock).toHaveBeenCalledWith(
        expect.objectContaining({
          advisorId: "cfo-advisor",
          scenarioTitle: "Plan for Q3 revenue dip",
          inputs: expect.objectContaining({ scenario_type: "runway-shift" }),
        }),
      );
    });
  });
});
