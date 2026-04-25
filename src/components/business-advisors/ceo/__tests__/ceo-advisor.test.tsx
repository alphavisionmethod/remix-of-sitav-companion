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

import { CEOAdvisorHeaderStats } from "../CEOAdvisorHeaderStats";
import { CEOAdvisorSimulationForm } from "../CEOAdvisorSimulationForm";

function makeQuery(result: { count?: number; data?: unknown[] }) {
  const builder: Record<string, unknown> = {};
  const methods = ["select", "eq", "neq", "in", "is", "not", "lt", "gte", "lte", "or", "order", "limit"] as const;
  for (const m of methods) builder[m] = () => builder;
  builder.then = (resolve: (v: { count: number; data: unknown[] }) => unknown) =>
    Promise.resolve({ count: result.count ?? 0, data: result.data ?? [] }).then(resolve);
  return builder;
}

describe("CEOAdvisorHeaderStats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: { id: "u-1" } } });
  });

  it("renders all four synthesis tiles", async () => {
    mockFrom.mockReturnValue(makeQuery({ count: 0, data: [] }));
    render(<CEOAdvisorHeaderStats />);
    await waitFor(() => {
      expect(screen.getByText("Board recs")).toBeInTheDocument();
      expect(screen.getByText("Advisors active")).toBeInTheDocument();
      expect(screen.getByText("High urgency")).toBeInTheDocument();
      expect(screen.getByText("Pending actions")).toBeInTheDocument();
    });
  });

  it("computes distinct advisor count from rows", async () => {
    let i = 0;
    mockFrom.mockImplementation((table: string) => {
      i += 1;
      if (i === 1) {
        expect(table).toBe("advisor_board_recommendations");
        return makeQuery({ count: 12 });
      }
      if (i === 2) {
        expect(table).toBe("advisor_board_recommendations");
        return makeQuery({ data: [
          { advisor_id: "sales-advisor" },
          { advisor_id: "sales-advisor" },
          { advisor_id: "cfo-advisor" },
          { advisor_id: "growth-advisor" },
        ]});
      }
      if (i === 3) return makeQuery({ count: 4 });
      return makeQuery({ count: 2 });
    });
    render(<CEOAdvisorHeaderStats />);
    await waitFor(() => {
      expect(screen.getByText("12")).toBeInTheDocument();
      expect(screen.getByText("3")).toBeInTheDocument(); // distinct advisors
      expect(screen.getByText("4")).toBeInTheDocument(); // urgent
      expect(screen.getByText("2")).toBeInTheDocument(); // pending
    });
  });
});

describe("CEOAdvisorSimulationForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all 3 strategic scenario types", () => {
    render(<CEOAdvisorSimulationForm />);
    const select = screen.getByLabelText(/Scenario type/i) as HTMLSelectElement;
    const options = Array.from(select.options).map((o) => o.value);
    expect(options).toEqual(
      expect.arrayContaining([
        "strategic-direction",
        "portfolio-prioritization",
        "cross-function-tradeoff",
      ]),
    );
    expect(options).toHaveLength(3);
  });

  it("relabels numeric input per scenario type", () => {
    render(<CEOAdvisorSimulationForm />);
    expect(screen.getByLabelText(/Strategic directions to compare/i)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/Scenario type/i), {
      target: { value: "portfolio-prioritization" },
    });
    expect(screen.getByLabelText(/Initiatives to prioritize/i)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/Scenario type/i), {
      target: { value: "cross-function-tradeoff" },
    });
    expect(screen.getByLabelText(/Functions to model/i)).toBeInTheDocument();
  });

  it("submits payload with recommend_only flag and L2 authority", async () => {
    simMock.mockResolvedValue({ status: "completed", confidence: 0.71, riskSummary: "" });
    render(<CEOAdvisorSimulationForm />);
    fireEvent.change(screen.getByLabelText(/Scenario title/i), {
      target: { value: "Q3 expansion vs consolidation" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Run strategic synthesis/i }));
    await waitFor(() => {
      expect(simMock).toHaveBeenCalledWith(
        expect.objectContaining({
          advisorId: "ceo-advisor",
          scenarioTitle: "Q3 expansion vs consolidation",
          inputs: expect.objectContaining({
            scenario_type: "strategic-direction",
            recommend_only: true,
          }),
          assumptions: expect.objectContaining({
            authority: "L2-recommend",
          }),
        }),
      );
    });
  });

  it("blocks submission with whitespace-only title", async () => {
    render(<CEOAdvisorSimulationForm />);
    fireEvent.change(screen.getByLabelText(/Scenario title/i), { target: { value: "  " } });
    fireEvent.click(screen.getByRole("button", { name: /Run strategic synthesis/i }));
    expect(simMock).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(toastMock).toHaveBeenCalledWith(
        expect.objectContaining({ title: expect.stringMatching(/title/i) }),
      );
    });
  });

  it("each scenario produces a distinct recommend-only prompt", () => {
    render(<CEOAdvisorSimulationForm />);
    const direction = screen.getByText(/strategic direction/).textContent;
    fireEvent.change(screen.getByLabelText(/Scenario type/i), { target: { value: "portfolio-prioritization" } });
    const portfolio = screen.getByText(/competing initiative/).textContent;
    fireEvent.change(screen.getByLabelText(/Scenario type/i), { target: { value: "cross-function-tradeoff" } });
    const cross = screen.getByText(/Stress-test how the proposed decision/).textContent;
    expect(new Set([direction, portfolio, cross]).size).toBe(3);
    for (const txt of [direction, portfolio, cross]) {
      expect(txt).toMatch(/Recommend only|never (commit|authorize)/i);
    }
  });
});

describe("CEO advisor manifest", () => {
  it("is L2-recommend with high risk + critical blocked actions", async () => {
    const { BUSINESS_ADVISORS } = await import("@/lib/ai-platform/runtime/business-advisor-registry");
    const advisor = BUSINESS_ADVISORS["ceo-advisor"];
    expect(advisor.authority).toBe("L2-recommend");
    expect(advisor.riskTier).toBe("high");
    expect(advisor.sensitive).toBe(true);
    expect(advisor.blockedActions).toEqual(
      expect.arrayContaining([
        "commit_strategic_shift",
        "execute_org_change",
        "make_external_announcement",
      ]),
    );
  });
});