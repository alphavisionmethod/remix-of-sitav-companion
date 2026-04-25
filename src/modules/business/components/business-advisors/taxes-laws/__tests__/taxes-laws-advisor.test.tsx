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

import { TaxesLawsHeaderStats } from "../TaxesLawsHeaderStats";
import { TaxesLawsSimulationForm } from "../TaxesLawsSimulationForm";
import { ProfessionalDisclaimerBanner, TAXES_LAWS_DISCLAIMER_TEXT } from "../ProfessionalDisclaimerBanner";

function makeQuery(result: { count?: number; data?: unknown[] }) {
  const builder: Record<string, unknown> = {};
  const methods = ["select", "eq", "neq", "in", "is", "not", "lt", "gte", "lte", "or", "order", "limit"] as const;
  for (const m of methods) builder[m] = () => builder;
  builder.then = (resolve: (v: { count: number; data: unknown[] }) => unknown) =>
    Promise.resolve({ count: result.count ?? 0, data: result.data ?? [] }).then(resolve);
  return builder;
}

describe("ProfessionalDisclaimerBanner", () => {
  it("renders default variant with full body", () => {
    render(<ProfessionalDisclaimerBanner />);
    expect(screen.getByText(/Preparation & issue-spotting only/i)).toBeInTheDocument();
    expect(screen.getByText(TAXES_LAWS_DISCLAIMER_TEXT)).toBeInTheDocument();
  });
  it("renders compact variant with short body", () => {
    render(<ProfessionalDisclaimerBanner variant="compact" />);
    expect(screen.getByText(/not a substitute for a licensed/i)).toBeInTheDocument();
  });
  it("renders inline variant with chip", () => {
    render(<ProfessionalDisclaimerBanner variant="inline" />);
    expect(screen.getByText(/Preparation only · not legal\/tax advice/i)).toBeInTheDocument();
  });
});

describe("TaxesLawsHeaderStats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: { id: "u-1" } } });
  });

  it("renders all four tax/legal tiles plus persistent disclaimer", async () => {
    mockFrom.mockReturnValue(makeQuery({ count: 0, data: [] }));
    render(<TaxesLawsHeaderStats />);
    await waitFor(() => {
      expect(screen.getByText("Tax/legal docs")).toBeInTheDocument();
      expect(screen.getByText("Unclassified")).toBeInTheDocument();
      expect(screen.getByText("Sensitive")).toBeInTheDocument();
      expect(screen.getByText("Last doc")).toBeInTheDocument();
    });
    // Persistent disclaimer must be present at all times
    expect(screen.getByText(/not a substitute for a licensed/i)).toBeInTheDocument();
  });

  it("surfaces RLS-scoped tax doc counts", async () => {
    let i = 0;
    mockFrom.mockImplementation((table: string) => {
      expect(table).toBe("file_metadata");
      i += 1;
      if (i === 1) return makeQuery({ count: 9 });   // taxRes
      if (i === 2) return makeQuery({ count: 3 });   // missing
      if (i === 3) return makeQuery({ count: 2 });   // sensitive
      return makeQuery({ data: [{ created_at: new Date().toISOString() }] });
    });
    render(<TaxesLawsHeaderStats />);
    await waitFor(() => {
      expect(screen.getByText("9")).toBeInTheDocument();
      expect(screen.getByText("3")).toBeInTheDocument();
      expect(screen.getByText("2")).toBeInTheDocument();
    });
  });
});

describe("TaxesLawsSimulationForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all 3 discussion scenario types", () => {
    render(<TaxesLawsSimulationForm />);
    const select = screen.getByLabelText(/Scenario type/i) as HTMLSelectElement;
    const options = Array.from(select.options).map((o) => o.value);
    expect(options).toEqual(
      expect.arrayContaining([
        "entity-structure-discussion",
        "deduction-prep-discussion",
        "compliance-readiness-discussion",
      ]),
    );
    expect(options).toHaveLength(3);
  });

  it("relabels numeric input per scenario type", () => {
    render(<TaxesLawsSimulationForm />);
    expect(screen.getByLabelText(/Entity structures to compare/i)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/Scenario type/i), {
      target: { value: "deduction-prep-discussion" },
    });
    expect(screen.getByLabelText(/Deduction categories/i)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/Scenario type/i), {
      target: { value: "compliance-readiness-discussion" },
    });
    expect(screen.getByLabelText(/Compliance domains/i)).toBeInTheDocument();
  });

  it("always carries persistent disclaimer + suggest_only flag in payload", async () => {
    simMock.mockResolvedValue({ status: "completed", confidence: 0.62, riskSummary: "" });
    render(<TaxesLawsSimulationForm />);
    expect(screen.getAllByText(/not a substitute|Preparation/i).length).toBeGreaterThan(0);
    fireEvent.change(screen.getByLabelText(/Discussion title/i), {
      target: { value: "LLC vs S-corp prep" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Prepare discussion checklist/i }));
    await waitFor(() => {
      expect(simMock).toHaveBeenCalledWith(
        expect.objectContaining({
          advisorId: "taxes-laws-advisor",
          scenarioTitle: "LLC vs S-corp prep",
          inputs: expect.objectContaining({
            scenario_type: "entity-structure-discussion",
            suggest_only: true,
          }),
          assumptions: expect.objectContaining({
            disclaimer: expect.stringMatching(/not legal\/tax advice/i),
          }),
        }),
      );
    });
  });

  it("blocks submission with whitespace-only title", async () => {
    render(<TaxesLawsSimulationForm />);
    fireEvent.change(screen.getByLabelText(/Discussion title/i), { target: { value: "  " } });
    fireEvent.click(screen.getByRole("button", { name: /Prepare discussion checklist/i }));
    expect(simMock).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(toastMock).toHaveBeenCalledWith(
        expect.objectContaining({ title: expect.stringMatching(/title/i) }),
      );
    });
  });

  it("each scenario produces a distinct prompt with suggestion-only framing", () => {
    render(<TaxesLawsSimulationForm />);
    const entity = screen.getByText(/entity structure option/).textContent;
    fireEvent.change(screen.getByLabelText(/Scenario type/i), { target: { value: "deduction-prep-discussion" } });
    const deduction = screen.getByText(/deduction categor/).textContent;
    fireEvent.change(screen.getByLabelText(/Scenario type/i), { target: { value: "compliance-readiness-discussion" } });
    const compliance = screen.getByText(/compliance domain/).textContent;
    expect(new Set([entity, deduction, compliance]).size).toBe(3);
    // every scenario must reaffirm "not advice"
    for (const txt of [entity, deduction, compliance]) {
      expect(txt).toMatch(/not (legal|tax)|licensed (professional|attorney|CPA|counsel)/i);
    }
  });
});

describe("Taxes & Laws advisor manifest", () => {
  it("is L1-suggest with professional disclaimer + critical risk + blocked actions", async () => {
    const { BUSINESS_ADVISORS } = await import("@/lib/ai-platform/runtime/business-advisor-registry");
    const advisor = BUSINESS_ADVISORS["taxes-laws-advisor"];
    expect(advisor.authority).toBe("L1-suggest");
    expect(advisor.professionalDisclaimer).toBe(true);
    expect(advisor.riskTier).toBe("critical");
    expect(advisor.blockedActions).toEqual(
      expect.arrayContaining([
        "file_tax_return",
        "provide_legal_advice",
        "submit_legal_filing",
        "execute_compliance_action",
      ]),
    );
  });
});