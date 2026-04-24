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

import { MarketingAdvisorHeaderStats } from "../MarketingAdvisorHeaderStats";
import { MarketingAdvisorSimulationForm } from "../MarketingAdvisorSimulationForm";

function makeQuery(result: { count?: number; data?: unknown[] }) {
  const builder: Record<string, unknown> = {};
  const methods = ["select", "eq", "neq", "in", "not", "lt", "gte", "or", "order", "limit"] as const;
  for (const m of methods) builder[m] = () => builder;
  builder.then = (resolve: (v: { count: number; data: unknown[] }) => unknown) =>
    Promise.resolve({ count: result.count ?? 0, data: result.data ?? [] }).then(resolve);
  return builder;
}

describe("MarketingAdvisorHeaderStats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
  });

  it("renders all four tiles with empty state", async () => {
    mockFrom.mockReturnValue(makeQuery({ count: 0, data: [] }));
    render(<MarketingAdvisorHeaderStats />);
    await waitFor(() => {
      expect(screen.getByText("Inbound 30d")).toBeInTheDocument();
      expect(screen.getByText("Active leads")).toBeInTheDocument();
      expect(screen.getByText("Top channel")).toBeInTheDocument();
      expect(screen.getByText("Qualified rate")).toBeInTheDocument();
    });
  });

  it("computes top channel from lead source distribution", async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === "lead_inbox_items") {
        return makeQuery({
          count: 4,
          data: [
            { triage_status: "qualified" },
            { triage_status: "qualified" },
            { triage_status: "new" },
            { triage_status: "new" },
          ],
        });
      }
      if (table === "leads") {
        return makeQuery({
          count: 5,
          data: [
            { source: "google" }, { source: "google" }, { source: "google" },
            { source: "referral" }, { source: "linkedin" },
          ],
        });
      }
      return makeQuery({});
    });
    render(<MarketingAdvisorHeaderStats />);
    await waitFor(() => {
      // top channel google = 3/5 = 60%
      expect(screen.getByText(/google · 60%/)).toBeInTheDocument();
      // qualification = 2/4 = 50%
      expect(screen.getByText("50%")).toBeInTheDocument();
    });
  });
});

describe("MarketingAdvisorSimulationForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all 3 scenario types", () => {
    render(<MarketingAdvisorSimulationForm />);
    const select = screen.getByLabelText(/Scenario type/i) as HTMLSelectElement;
    const options = Array.from(select.options).map((o) => o.value);
    expect(options).toEqual(
      expect.arrayContaining(["budget-shift", "channel-pivot", "creative-test"]),
    );
    expect(options).toHaveLength(3);
  });

  it("updates the live prompt preview as inputs change", () => {
    render(<MarketingAdvisorSimulationForm />);
    fireEvent.change(screen.getByLabelText(/Shift/i), { target: { value: 35 } });
    expect(screen.getByText(/spend by 35%/)).toBeInTheDocument();
  });

  it("blocks submission when title is empty", async () => {
    render(<MarketingAdvisorSimulationForm />);
    fireEvent.click(screen.getByRole("button", { name: /Run scenario/i }));
    expect(simMock).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(toastMock).toHaveBeenCalledWith(
        expect.objectContaining({ title: expect.stringMatching(/title/i) }),
      );
    });
  });

  it("calls runAdvisorSimulation with marketing-advertising-advisor id", async () => {
    simMock.mockResolvedValue({ status: "completed", confidence: 0.72, riskSummary: "" });
    render(<MarketingAdvisorSimulationForm />);
    fireEvent.change(screen.getByLabelText(/Scenario title/i), {
      target: { value: "Test paid social lift" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Run scenario/i }));
    await waitFor(() => {
      expect(simMock).toHaveBeenCalledWith(
        expect.objectContaining({
          advisorId: "marketing-advertising-advisor",
          scenarioTitle: "Test paid social lift",
          inputs: expect.objectContaining({ scenario_type: "budget-shift" }),
        }),
      );
    });
  });
});