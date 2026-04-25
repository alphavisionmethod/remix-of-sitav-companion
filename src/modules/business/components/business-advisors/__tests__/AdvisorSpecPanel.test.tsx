import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { AdvisorSpecPanel, AdvisorSpecEmptyState } from "../AdvisorSpecPanel";
import type { BusinessAdvisorSpec } from "@/lib/ai-platform/specs";

function fixtureSpec(): BusinessAdvisorSpec {
  return {
    id: "sales-advisor",
    displayName: "Sales Advisor",
    positioning: "Closer + pipeline strategist.",
    distinction: "Specialised in deal mechanics.",
    intelligenceArchetype: "Strategic closer.",
    userFeel: "Sharp and decisive.",
    trustedBy: "Founders running a real pipeline.",
    mission: "Help close deals.",
    problemSpace: "Deals stall.",
    leverageCreated: "Higher win rate per hour.",
    outcomesImproved: ["win rate", "time-to-close", "hygiene"],
    handles: ["pipeline", "objections", "follow-up", "qualification"],
    doesNotHandle: ["legal", "tax", "infra"],
    overlapsWith: [{ advisorId: "marketing-advertising-advisor", reason: "lead source quality" }],
    escalatesTo: [{ advisorId: "cfo-advisor", trigger: "discount thresholds" }],
    coreUseCases: ["a", "b", "c", "d", "e", "f"],
    typicalQuestions: ["q1?", "q2?", "q3?", "q4?", "q5?", "q6?"],
    requiredInputs: ["lead"],
    optionalInputs: ["quote"],
    highValueFutureInputs: ["transcripts"],
    intelligenceBehaviors: [
      { name: "Pattern detection", description: "spots themes" },
      { name: "Priority ranking", description: "ranks deals" },
      { name: "Next-best action", description: "names the move" },
      { name: "Tradeoff surfacing", description: "explains cost" },
      { name: "Drafting", description: "produces replies" },
    ],
    outputTypes: ["script", "follow-up plan", "memo", "rebuttal"],
    uiSurfaces: ["chat", "recs", "sim", "header"],
    osIntegrationPoints: ["CRM", "leads", "quotes"],
    automationMatrix: (["L0", "L1", "L2", "L3", "L4", "L5"] as const).map((level) => ({
      level,
      label: `${level} authority`,
      canDo: [`${level} ok`],
      mustNotDo: [`${level} not`],
      approvalRequiredFor: [`${level} approve`],
    })),
    currentAuthorityCeiling: "L3-draft",
    trustRules: ["a", "b", "c", "d"],
    disallowedAutonomousActions: ["send_email", "commit_deal"],
    receiptedActions: [],
    explainabilityRequirements: ["a", "b", "c", "d"],
    simulation: {
      summary: "Compare scripts.",
      scenarios: [
        {
          id: "script-ab",
          label: "Script A/B",
          compares: "two variants",
          requiredInputs: ["a"],
          optionalInputs: [],
          outputs: ["rate"],
          nonAuthoritative: false,
        },
      ],
    },
    memoryRules: ["a", "b", "c"],
    proactiveSignals: [
      { trigger: "stale lead", surface: "feed", cadence: "daily", mode: "suggested", approvalRequired: false },
      { trigger: "discount over guardrail", surface: "queue", cadence: "event-driven", mode: "action-oriented", approvalRequired: true },
    ],
    knowledgeSources: [
      { label: "Quote templates", extracts: "patterns", scope: "workspace", sensitivity: "medium" },
      { label: "Lead lists", extracts: "signals", scope: "workspace", sensitivity: "medium" },
    ],
    analyticsEvents: ["a", "b", "c", "d"],
    adminOversightSurfaces: ["a", "b", "c"],
    testingMatrix: [
      { category: "unit", scenarios: ["x"] },
      { category: "component", scenarios: ["x"] },
      { category: "integration", scenarios: ["x"] },
      { category: "authority", scenarios: ["x"] },
      { category: "explainability", scenarios: ["x"] },
    ],
    definitionOfDone: ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"],
    roadmap: {
      phase1: { title: "core", outcomes: ["x", "y"] },
      phase2: { title: "deeper", outcomes: ["x", "y"] },
      phase3: { title: "auto", outcomes: ["x", "y"] },
    },
    wowDifferentiators: ["a", "b", "c"],
  };
}

describe("AdvisorSpecPanel", () => {
  it("renders all 23 sections from a spec fixture", () => {
    render(<AdvisorSpecPanel spec={fixtureSpec()} />);
    expect(screen.getByTestId("advisor-spec-panel")).toBeInTheDocument();
    expect(screen.getByText(/Identity & mission/i)).toBeInTheDocument();
    expect(screen.getByText(/Domain boundaries/i)).toBeInTheDocument();
    expect(screen.getByText(/Use cases & questions/i)).toBeInTheDocument();
    expect(screen.getByText(/Inputs, intelligence & outputs/i)).toBeInTheDocument();
    expect(screen.getByText(/UI surfaces & OS integrations/i)).toBeInTheDocument();
    expect(screen.getByText(/Automation model/i)).toBeInTheDocument();
    expect(screen.getByText(/Trust, safety & explainability/i)).toBeInTheDocument();
    expect(screen.getByText(/Simulation contract/i)).toBeInTheDocument();
    expect(screen.getByText(/Memory, proactive signals & knowledge/i)).toBeInTheDocument();
    expect(screen.getByText(/Analytics, oversight & testing/i)).toBeInTheDocument();
    expect(screen.getByText(/Deployment readiness, roadmap & wow/i)).toBeInTheDocument();
    // Each L0–L5 row appears
    for (const lvl of ["L0", "L1", "L2", "L3", "L4", "L5"]) {
      expect(screen.getAllByText(lvl).length).toBeGreaterThan(0);
    }
  });

  it("renders empty-state honestly when no spec is registered", () => {
    render(<AdvisorSpecEmptyState advisorName="Tech Advisor" />);
    expect(screen.getByTestId("advisor-spec-empty")).toBeInTheDocument();
    expect(screen.getByText(/Build spec not yet authored/i)).toBeInTheDocument();
    expect(screen.getByText(/Tech Advisor/)).toBeInTheDocument();
  });
});