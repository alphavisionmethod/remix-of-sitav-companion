import { describe, it, expect } from "vitest";
import {
  validateAdvisorSpec,
  isAdvisorSpecComplete,
  type BusinessAdvisorSpec,
} from "../spec-types";

function makeMinimalCompleteSpec(): BusinessAdvisorSpec {
  return {
    id: "sales-advisor",
    displayName: "Sales Advisor",
    positioning: "Closer + pipeline strategist + objection coach for the operator.",
    distinction: "Specialised in deal mechanics, not generic prose.",
    intelligenceArchetype: "Strategic closer with disciplined follow-through.",
    userFeel: "Sharp, calm, decisive.",
    trustedBy: "Founders running a real pipeline who need objection coaching at speed.",
    mission: "Help the operator close deals through better qualification and follow-up.",
    problemSpace: "Deals stall, follow-up slips, objections go unanswered.",
    leverageCreated: "Higher win rate per hour invested in the pipeline.",
    outcomesImproved: ["Win rate", "Time-to-close", "Pipeline hygiene"],
    handles: ["pipeline analysis", "objection drafts", "follow-up cadence", "qualification"],
    doesNotHandle: ["legal contracts", "tax filings", "infra changes"],
    overlapsWith: [{ advisorId: "marketing-advertising-advisor", reason: "lead source quality discussions" }],
    escalatesTo: [{ advisorId: "cfo-advisor", trigger: "discount thresholds beyond margin guardrails" }],
    coreUseCases: [
      "qualify a new inbound lead",
      "draft an objection-handling response",
      "design a 5-touch follow-up cadence",
      "review pipeline health and prioritise",
      "stress-test a discount proposal",
      "simulate a price/value framing change",
    ],
    typicalQuestions: [
      "How should I follow up with this lead?",
      "What's a strong response to this objection?",
      "Which deals should I focus on this week?",
      "Can you draft a quote follow-up email?",
      "What's a fair discount given our margins?",
      "How do I qualify this inbound?",
    ],
    requiredInputs: ["lead record"],
    optionalInputs: ["quote history"],
    highValueFutureInputs: ["call transcripts"],
    intelligenceBehaviors: [
      { name: "Pattern detection", description: "spots recurring objection themes across the pipeline" },
      { name: "Priority ranking", description: "ranks deals by tractability × value" },
      { name: "Next-best action", description: "names the smallest, highest-leverage move" },
      { name: "Tradeoff surfacing", description: "explains the cost of each option" },
      { name: "Drafting", description: "produces ready-to-send replies in the operator's voice" },
    ],
    outputTypes: ["script", "follow-up plan", "qualification memo", "objection rebuttal"],
    uiSurfaces: ["chat", "recommendations feed", "simulation form", "header KPIs"],
    osIntegrationPoints: ["CRM", "lead recovery", "quotes module"],
    automationMatrix: (["L0", "L1", "L2", "L3", "L4", "L5"] as const).map((level) => ({
      level,
      label: `${level} sales authority`,
      canDo: [`${level} action`],
      mustNotDo: [`never auto-send at ${level}`],
      approvalRequiredFor: [`anything irreversible at ${level}`],
    })),
    currentAuthorityCeiling: "L3-draft",
    trustRules: [
      "never auto-send external email",
      "never modify pricing live",
      "always cite the source CRM record",
      "always show authority notice",
    ],
    disallowedAutonomousActions: ["send_external_email", "commit_deal"],
    receiptedActions: ["draft_external_message"],
    explainabilityRequirements: [
      "show context slices used",
      "show assumptions made",
      "show confidence band",
      "label drafts vs recommendations",
    ],
    simulation: {
      summary: "Compare scripts, follow-up cadences, and pricing angles before sending.",
      scenarios: [
        {
          id: "script-ab",
          label: "Script A/B",
          compares: "two outbound script variants on the same lead",
          requiredInputs: ["lead", "scriptA", "scriptB"],
          optionalInputs: ["historicalReplyRate"],
          outputs: ["expectedReplyRate", "rationale"],
          nonAuthoritative: false,
        },
      ],
    },
    memoryRules: [
      "remember objection themes per workspace",
      "never persist contact PII outside CRM",
      "let the user edit/forget remembered items",
    ],
    proactiveSignals: [
      { trigger: "stale lead 7d+", surface: "recommendations feed", cadence: "daily", mode: "suggested", approvalRequired: false },
      { trigger: "discount above guardrail", surface: "approval queue", cadence: "event-driven", mode: "action-oriented", approvalRequired: true },
    ],
    knowledgeSources: [
      { label: "Quote templates", extracts: "structure and pricing patterns", scope: "workspace", sensitivity: "medium" },
      { label: "Lead lists", extracts: "qualification signals", scope: "workspace", sensitivity: "medium" },
    ],
    analyticsEvents: ["advisor.sales.ask", "advisor.sales.draft", "advisor.sales.simulate", "advisor.sales.recommend"],
    adminOversightSurfaces: ["adoption dashboard", "low-confidence drafts queue", "approval audit trail"],
    testingMatrix: [
      { category: "unit", scenarios: ["script ranking heuristic"] },
      { category: "component", scenarios: ["SalesSimulationForm submit"] },
      { category: "integration", scenarios: ["ask → context → response"] },
      { category: "authority", scenarios: ["never sends external email"] },
      { category: "explainability", scenarios: ["citations rendered"] },
    ],
    definitionOfDone: [
      "spec authored and registered",
      "shell renders Spec tab",
      "context loader returns CRM/leads",
      "simulation form submits",
      "recommendations panel rendered",
      "authority notice visible",
      "blocked actions enforced",
      "citations persisted",
      "tests green",
      "analytics events emitted",
      "admin oversight surface available",
      "no raw colors / no any",
    ],
    roadmap: {
      phase1: { title: "Deployable core", outcomes: ["spec live", "chat + sim + recs"] },
      phase2: { title: "Deeper intelligence", outcomes: ["objection memory", "pipeline summarizer"] },
      phase3: { title: "Bounded automation", outcomes: ["JIT approval drafts", "stale-lead nudges"] },
    },
    wowDifferentiators: [
      "objection coach you can roleplay with",
      "pipeline triage in under 30s",
      "drafts that sound like the operator, with receipts",
    ],
  };
}

describe("validateAdvisorSpec", () => {
  it("accepts a fully populated spec", () => {
    const spec = makeMinimalCompleteSpec();
    expect(validateAdvisorSpec(spec)).toEqual([]);
    expect(isAdvisorSpecComplete(spec)).toBe(true);
  });

  it("flags TODO markers as stubs", () => {
    const spec = { ...makeMinimalCompleteSpec(), mission: "TODO write later" };
    const issues = validateAdvisorSpec(spec);
    expect(issues.some((i) => i.field === "mission")).toBe(true);
  });

  it("requires every L0–L5 automation level", () => {
    const base = makeMinimalCompleteSpec();
    const spec: BusinessAdvisorSpec = {
      ...base,
      automationMatrix: base.automationMatrix.filter((e) => e.level !== "L4"),
    };
    const issues = validateAdvisorSpec(spec);
    expect(issues.some((i) => i.field === "automationMatrix.L4")).toBe(true);
  });

  it("requires at least one simulation scenario", () => {
    const base = makeMinimalCompleteSpec();
    const spec: BusinessAdvisorSpec = {
      ...base,
      simulation: { ...base.simulation, scenarios: [] },
    };
    const issues = validateAdvisorSpec(spec);
    expect(issues.some((i) => i.field === "simulation.scenarios")).toBe(true);
  });

  it("requires DoD with at least 10 items", () => {
    const base = makeMinimalCompleteSpec();
    const spec: BusinessAdvisorSpec = { ...base, definitionOfDone: ["only one"] };
    const issues = validateAdvisorSpec(spec);
    expect(issues.some((i) => i.field === "definitionOfDone")).toBe(true);
  });

  it("requires non-CEO advisors to declare an escalation target", () => {
    const base = makeMinimalCompleteSpec();
    const spec: BusinessAdvisorSpec = { ...base, escalatesTo: [] };
    const issues = validateAdvisorSpec(spec);
    expect(issues.some((i) => i.field === "escalatesTo")).toBe(true);
  });

  it("permits CEO advisor with no escalation targets", () => {
    const base = makeMinimalCompleteSpec();
    const spec: BusinessAdvisorSpec = { ...base, id: "ceo-advisor", escalatesTo: [] };
    const issues = validateAdvisorSpec(spec);
    expect(issues.filter((i) => i.field === "escalatesTo")).toHaveLength(0);
  });
});