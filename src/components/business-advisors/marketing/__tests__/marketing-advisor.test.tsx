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

describe("MarketingAdvisorSimulationForm — deterministic scenario behavior", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("budget-shift prompt is deterministic for a given shift% + assumption", () => {
    render(<MarketingAdvisorSimulationForm />);
    fireEvent.change(screen.getByLabelText(/Shift/i), { target: { value: -25 } });
    fireEvent.change(screen.getByLabelText(/Assumptions/i), {
      target: { value: "current mix: 60% paid social / 40% search" },
    });
    expect(
      screen.getByText(
        /shifting marketing spend by -25%.*Baseline \/ assumptions: current mix: 60% paid social \/ 40% search/s,
      ),
    ).toBeInTheDocument();
  });

  it("channel-pivot scenario surfaces ramp-time + kill-criteria expected outputs", () => {
    render(<MarketingAdvisorSimulationForm />);
    fireEvent.change(screen.getByLabelText(/Scenario type/i), {
      target: { value: "channel-pivot" },
    });
    expect(screen.getByText("Ramp time (weeks)")).toBeInTheDocument();
    expect(screen.getByText("Lead quality risk")).toBeInTheDocument();
    expect(screen.getByText("Minimum viable test")).toBeInTheDocument();
    expect(screen.getByText("Kill criteria")).toBeInTheDocument();
  });

  it("creative-test relabels the numeric input to 'Test length (weeks)'", () => {
    render(<MarketingAdvisorSimulationForm />);
    fireEvent.change(screen.getByLabelText(/Scenario type/i), {
      target: { value: "creative-test" },
    });
    expect(screen.getByLabelText(/Test length \(weeks\)/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/^Shift \(%\)$/i)).toBeNull();
  });

  it("creative-test prompt embeds the test length verbatim", () => {
    render(<MarketingAdvisorSimulationForm />);
    fireEvent.change(screen.getByLabelText(/Scenario type/i), {
      target: { value: "creative-test" },
    });
    fireEvent.change(screen.getByLabelText(/Test length \(weeks\)/i), {
      target: { value: 4 },
    });
    expect(screen.getByText(/Design a 4-week creative test plan/)).toBeInTheDocument();
  });

  it("falls back to scenario hint when assumption is blank", () => {
    render(<MarketingAdvisorSimulationForm />);
    expect(
      screen.getByText(/current channel mix and conversion rates/),
    ).toBeInTheDocument();
  });

  it("rejects whitespace-only titles as missing", async () => {
    render(<MarketingAdvisorSimulationForm />);
    fireEvent.change(screen.getByLabelText(/Scenario title/i), {
      target: { value: "   " },
    });
    fireEvent.click(screen.getByRole("button", { name: /Run scenario/i }));
    expect(simMock).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(toastMock).toHaveBeenCalledWith(
        expect.objectContaining({ title: expect.stringMatching(/title/i) }),
      );
    });
  });

  it("includes scenario_type and shift_pct in the live inputs payload", () => {
    render(<MarketingAdvisorSimulationForm />);
    fireEvent.change(screen.getByLabelText(/Scenario type/i), {
      target: { value: "channel-pivot" },
    });
    fireEvent.change(screen.getByLabelText(/Shift/i), { target: { value: 30 } });
    // Live JSON preview surfaces the structured inputs verbatim.
    expect(screen.getByText(/"scenario_type": "channel-pivot"/)).toBeInTheDocument();
    expect(screen.getByText(/"shift_pct": 30/)).toBeInTheDocument();
  });

  it("surfaces a destructive toast and keeps title when simulation rejects", async () => {
    simMock.mockRejectedValue(new Error("gateway exploded"));
    render(<MarketingAdvisorSimulationForm />);
    fireEvent.change(screen.getByLabelText(/Scenario title/i), {
      target: { value: "Risky budget cut" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Run scenario/i }));
    await waitFor(() => {
      expect(toastMock).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Simulation failed",
          description: "gateway exploded",
          variant: "destructive",
        }),
      );
    });
    // Title stays on failure so the operator can retry without retyping.
    expect((screen.getByLabelText(/Scenario title/i) as HTMLInputElement).value).toBe(
      "Risky budget cut",
    );
  });

  it("clears title + assumptions only on a completed run", async () => {
    simMock.mockResolvedValue({
      status: "completed",
      confidence: 0.81,
      riskSummary: "",
    });
    render(<MarketingAdvisorSimulationForm />);
    fireEvent.change(screen.getByLabelText(/Scenario title/i), {
      target: { value: "Holiday push" },
    });
    fireEvent.change(screen.getByLabelText(/Assumptions/i), {
      target: { value: "Q4 demand +30%" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Run scenario/i }));
    await waitFor(() => expect(simMock).toHaveBeenCalledTimes(1));
    await waitFor(() => {
      expect((screen.getByLabelText(/Scenario title/i) as HTMLInputElement).value).toBe("");
      expect((screen.getByLabelText(/Assumptions/i) as HTMLTextAreaElement).value).toBe("");
    });
    // Confidence is reported in the success toast, rounded.
    expect(toastMock).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Scenario complete",
        description: "Confidence 81%",
      }),
    );
  });

  it("each scenario type produces a distinct prompt", () => {
    const { rerender } = render(<MarketingAdvisorSimulationForm />);
    const budget = screen.getByText(/shifting marketing spend by/).textContent;
    rerender(<MarketingAdvisorSimulationForm />);
    fireEvent.change(screen.getByLabelText(/Scenario type/i), {
      target: { value: "channel-pivot" },
    });
    const pivot = screen.getByText(/pivoting/).textContent;
    fireEvent.change(screen.getByLabelText(/Scenario type/i), {
      target: { value: "creative-test" },
    });
    const creative = screen.getByText(/creative test plan/).textContent;
    // All three prompts must be unique strings — no copy-paste collisions.
    expect(new Set([budget, pivot, creative]).size).toBe(3);
  });
});