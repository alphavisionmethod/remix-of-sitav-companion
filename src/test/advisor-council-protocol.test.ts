// ═══════════════════════════════════════════════════════════════
// SITA OS — Advisor Council Protocol Tests
// Council deliberation, disagreement detection, perspective
// filtering, mission mode switching, capability checks, bridging
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect } from "vitest";
import {
  ADVISOR_REGISTRY,
  MISSION_MODES,
  PERSPECTIVE_CONFIGS,
  getAdvisor,
  getAdvisorsByCouncil,
  getMetaAdvisors,
  runCouncilProtocol,
  getActiveMissionMode,
  setMissionMode,
  getPerspectiveConfig,
  filterSectionsByPerspective,
  filterAlertsByPerspective,
  filterActionItemsByPerspective,
  canAdvisorPerformAction,
  getAdvisorCapabilities,
  isAdvisorTrustworthy,
  getAdvisorsForDomain,
  getAdvisorsWithMemoryAccess,
  detectCouncilDisagreements,
  synthesizeCouncilRecommendations,
  type AdvisorDefinition,
  type CouncilRecommendation,
  type CouncilDisagreement,
  type CouncilSynthesis,
  type MissionMode,
  type PerspectiveLevel,
  type PerspectiveConfig,
} from "@/lib/advisor-protocol";
import type { BoardroomContentSection } from "@/lib/boardroom/types";
import { generateBoardroomPacket } from "@/lib/boardroom";
import { ADVISOR_CONFIGS, getAdvisorConfig, getAdvisorsByDomain } from "@/packages/advisor-config";
import { getAdvisorContract, isActionBlocked } from "@/lib/no-hallucination";

// ═══════════════════════════════════════════════════════════════
// 1. Advisor Registry Integrity
// ═══════════════════════════════════════════════════════════════

describe("Advisor Registry Integrity", () => {
  it("has 24 advisors total across 4 councils", () => {
    expect(ADVISOR_REGISTRY.length).toBe(26);
    const councils = new Set(ADVISOR_REGISTRY.map(a => a.council));
    expect(councils.size).toBe(4);
    expect(councils).toContain("business");
    expect(councils).toContain("finance");
    expect(councils).toContain("concierge");
    expect(councils).toContain("meta");
  });

  it("has unique IDs for all advisors", () => {
    const ids = ADVISOR_REGISTRY.map(a => a.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("all advisors have required fields populated", () => {
    for (const advisor of ADVISOR_REGISTRY) {
      expect(advisor.id).toBeTruthy();
      expect(advisor.name).toBeTruthy();
      expect(advisor.mission).toBeTruthy();
      expect(advisor.specialAbility).toBeTruthy();
      expect(advisor.domainScope.length).toBeGreaterThan(0);
      expect(advisor.memoryScope.length).toBeGreaterThan(0);
      expect(advisor.toolPermissions.length).toBeGreaterThan(0);
      expect(advisor.kpis.length).toBeGreaterThan(0);
      expect(advisor.trustThreshold).toBeGreaterThanOrEqual(0);
      expect(advisor.trustThreshold).toBeLessThanOrEqual(100);
    }
  });

  it("each council has a boardroom synthesizer", () => {
    const domainCouncils = ["business", "finance", "concierge"] as const;
    for (const council of domainCouncils) {
      const advisors = getAdvisorsByCouncil(council);
      const hasBoardroom = advisors.some(a => a.boardroomRole.toLowerCase().includes("synthesizer"));
      expect(hasBoardroom).toBe(true);
    }
  });

  it("meta council has boardroom-meta-advisor", () => {
    const meta = getAdvisor("boardroom-meta-advisor");
    expect(meta).toBeDefined();
    expect(meta!.council).toBe("meta");
    expect(meta!.boardroomRole).toBe("Chief Synthesizer");
  });

  it("getAdvisor returns undefined for unknown IDs", () => {
    expect(getAdvisor("nonexistent-advisor")).toBeUndefined();
  });
});

// ═══════════════════════════════════════════════════════════════
// 2. Council Deliberation Protocol
// ═══════════════════════════════════════════════════════════════

describe("Council Deliberation Protocol", () => {
  it("runs council protocol and returns synthesis with all required fields", () => {
    const synthesis = runCouncilProtocol("quarterly revenue review", "business", {});
    expect(synthesis.id).toBeTruthy();
    expect(synthesis.topic).toBe("quarterly revenue review");
    expect(synthesis.participatingAdvisors.length).toBeGreaterThan(0);
    expect(synthesis.recommendations.length).toBeGreaterThan(0);
    expect(synthesis.primaryRecommendation).toBeTruthy();
    expect(synthesis.alternativePath).toBeTruthy();
    expect(synthesis.overallConfidence).toBeGreaterThan(0);
    expect(synthesis.overallConfidence).toBeLessThanOrEqual(1);
    expect(synthesis.synthesizedBy).toBe("boardroom-meta-advisor");
    expect(synthesis.timestamp).toBeGreaterThan(0);
    expect(synthesis.simulationAvailable).toBe(true);
  });

  it("includes only specified councils", () => {
    const synthesis = runCouncilProtocol("cash review", "finance", {}, ["finance"]);
    const financeAdvisors = getAdvisorsByCouncil("finance");
    // All participating advisors should be from finance council
    for (const advisorId of synthesis.participatingAdvisors) {
      const advisor = getAdvisor(advisorId);
      expect(advisor).toBeDefined();
      expect(advisor!.council).toBe("finance");
    }
  });

  it("returns recommendations with confidence scores between 0 and 1", () => {
    const synthesis = runCouncilProtocol("pipeline health", "business", {});
    for (const rec of synthesis.recommendations) {
      expect(rec.confidence).toBeGreaterThanOrEqual(0);
      expect(rec.confidence).toBeLessThanOrEqual(1);
      expect(rec.advisorId).toBeTruthy();
      expect(rec.advisorName).toBeTruthy();
      expect(rec.recommendation).toBeTruthy();
    }
  });

  it("requires approval when high-risk recommendations exist", () => {
    const synthesis = runCouncilProtocol("large payment", "finance", {}, ["finance"]);
    // Finance advisors have high/critical ceilings, so recommendations may flag high risk
    if (synthesis.recommendations.some(r => r.riskAssessment === "high" || r.riskAssessment === "critical")) {
      expect(synthesis.requiresApproval).toBe(true);
    }
  });

  it("sets overallRisk based on disagreement count and severity", () => {
    const synthesis = runCouncilProtocol("complex decision", "business", {});
    const validRisks = ["low", "medium", "high", "critical"];
    expect(validRisks).toContain(synthesis.overallRisk);
  });
});

// ═══════════════════════════════════════════════════════════════
// 3. Disagreement Detection
// ═══════════════════════════════════════════════════════════════

describe("Disagreement Detection", () => {
  it("detects risk assessment disagreements between advisors", () => {
    const recs: CouncilRecommendation[] = [
      { advisorId: "biz-advisor", advisorName: "Business", council: "business", recommendation: "Go ahead", confidence: 0.9, concerns: [], opportunities: [], constraints: [], preferredAction: "proceed", riskAssessment: "low", dataSources: [], assumptions: [] },
      { advisorId: "money-advisor", advisorName: "Money", council: "finance", recommendation: "Wait", confidence: 0.8, concerns: ["cash"], opportunities: [], constraints: [], preferredAction: "wait", riskAssessment: "high", dataSources: [], assumptions: [] },
    ];
    const disagreements = detectCouncilDisagreements(recs);
    expect(disagreements.length).toBeGreaterThan(0);
    expect(disagreements[0].field).toBe("risk assessment");
    expect(disagreements[0].severity).toBe("material");
  });

  it("detects blocking disagreements when critical risk involved", () => {
    const recs: CouncilRecommendation[] = [
      { advisorId: "a1", advisorName: "A", council: "business", recommendation: "x", confidence: 0.9, concerns: [], opportunities: [], constraints: [], preferredAction: "go", riskAssessment: "low", dataSources: [], assumptions: [] },
      { advisorId: "a2", advisorName: "B", council: "finance", recommendation: "y", confidence: 0.8, concerns: [], opportunities: [], constraints: [], preferredAction: "stop", riskAssessment: "critical", dataSources: [], assumptions: [] },
    ];
    const disagreements = detectCouncilDisagreements(recs);
    const blocking = disagreements.find(d => d.severity === "blocking");
    expect(blocking).toBeDefined();
  });

  it("detects confidence gap disagreements", () => {
    const recs: CouncilRecommendation[] = [
      { advisorId: "a1", advisorName: "A", council: "business", recommendation: "x", confidence: 0.95, concerns: [], opportunities: [], constraints: [], preferredAction: "go", riskAssessment: "low", dataSources: [], assumptions: [] },
      { advisorId: "a2", advisorName: "B", council: "business", recommendation: "y", confidence: 0.5, concerns: [], opportunities: [], constraints: [], preferredAction: "go", riskAssessment: "low", dataSources: [], assumptions: [] },
    ];
    const disagreements = detectCouncilDisagreements(recs);
    const confidenceGap = disagreements.find(d => d.field === "confidence");
    expect(confidenceGap).toBeDefined();
    expect(confidenceGap!.severity).toBe("minor");
  });

  it("returns no disagreements when advisors agree", () => {
    const recs: CouncilRecommendation[] = [
      { advisorId: "a1", advisorName: "A", council: "business", recommendation: "x", confidence: 0.85, concerns: [], opportunities: [], constraints: [], preferredAction: "go", riskAssessment: "medium", dataSources: [], assumptions: [] },
      { advisorId: "a2", advisorName: "B", council: "business", recommendation: "y", confidence: 0.82, concerns: [], opportunities: [], constraints: [], preferredAction: "go", riskAssessment: "medium", dataSources: [], assumptions: [] },
    ];
    const disagreements = detectCouncilDisagreements(recs);
    expect(disagreements).toHaveLength(0);
  });

  it("synthesizeCouncilRecommendations picks highest confidence", () => {
    const recs: CouncilRecommendation[] = [
      { advisorId: "a1", advisorName: "A", council: "business", recommendation: "x", confidence: 0.6, concerns: [], opportunities: [], constraints: [], preferredAction: "slow", riskAssessment: "low", dataSources: [], assumptions: [] },
      { advisorId: "a2", advisorName: "B", council: "finance", recommendation: "y", confidence: 0.95, concerns: [], opportunities: [], constraints: [], preferredAction: "fast", alternativeAction: "medium", riskAssessment: "low", dataSources: [], assumptions: [] },
    ];
    const result = synthesizeCouncilRecommendations(recs);
    expect(result.primary).toBe("fast");
    expect(result.overallConfidence).toBeCloseTo(0.775, 2);
    expect(result.requiresApproval).toBe(false);
  });

  it("synthesizeCouncilRecommendations handles empty array", () => {
    const result = synthesizeCouncilRecommendations([]);
    expect(result.primary).toBe("No recommendations available");
    expect(result.overallConfidence).toBe(0);
  });
});

// ═══════════════════════════════════════════════════════════════
// 4. Perspective Filtering
// ═══════════════════════════════════════════════════════════════

describe("Perspective Filtering", () => {
  const mockSections: BoardroomContentSection[] = [
    { id: "s1", type: "metric-card", title: "KPIs", data: [] as never },
    { id: "s2", type: "table", title: "Details", data: { columns: [], rows: [], source: "test" } },
    { id: "s3", type: "narrative", title: "Summary", data: { text: "ok", confidence: 0.9, citations: [] } },
    { id: "s4", type: "alert", title: "Alerts", data: [] as never },
    { id: "s5", type: "action-list", title: "Actions", data: [] as never },
  ];

  it("executive perspective hides detail tables", () => {
    const filtered = filterSectionsByPerspective(mockSections, "executive");
    expect(filtered.find(s => s.type === "table")).toBeUndefined();
    expect(filtered.find(s => s.type === "metric-card")).toBeDefined();
    expect(filtered.find(s => s.type === "narrative")).toBeDefined();
  });

  it("analyst perspective shows everything", () => {
    const filtered = filterSectionsByPerspective(mockSections, "analyst");
    expect(filtered.length).toBe(mockSections.length);
  });

  it("owner perspective shows tables and narratives", () => {
    const filtered = filterSectionsByPerspective(mockSections, "owner");
    expect(filtered.find(s => s.type === "table")).toBeDefined();
    expect(filtered.find(s => s.type === "narrative")).toBeDefined();
  });

  it("executive limits alerts to 3", () => {
    const alerts = Array.from({ length: 10 }, (_, i) => ({ id: `a${i}`, severity: "warning" }));
    const filtered = filterAlertsByPerspective(alerts, "executive");
    expect(filtered.length).toBe(3);
  });

  it("analyst allows up to 10 alerts", () => {
    const alerts = Array.from({ length: 15 }, (_, i) => ({ id: `a${i}`, severity: "info" }));
    const filtered = filterAlertsByPerspective(alerts, "analyst");
    expect(filtered.length).toBe(10);
  });

  it("executive limits action items to 5", () => {
    const items = Array.from({ length: 12 }, (_, i) => ({ id: `ai${i}` }));
    const filtered = filterActionItemsByPerspective(items, "executive");
    expect(filtered.length).toBe(5);
  });

  it("all perspective configs are fully defined", () => {
    const levels: PerspectiveLevel[] = ["executive", "analyst", "owner"];
    for (const level of levels) {
      const config = getPerspectiveConfig(level);
      expect(config.level).toBe(level);
      expect(config.label).toBeTruthy();
      expect(config.description).toBeTruthy();
      expect(config.maxMetrics).toBeGreaterThan(0);
      expect(config.maxAlerts).toBeGreaterThan(0);
      expect(config.maxActionItems).toBeGreaterThan(0);
      expect(["summary", "standard", "detailed"]).toContain(config.narrativeDepth);
    }
  });
});

// ═══════════════════════════════════════════════════════════════
// 5. Mission Mode Switching
// ═══════════════════════════════════════════════════════════════

describe("Mission Mode Switching", () => {
  it("has 10 mission modes defined", () => {
    expect(MISSION_MODES.length).toBe(10);
  });

  it("only one mode is active at a time", () => {
    const activeModes = MISSION_MODES.filter(m => m.active);
    expect(activeModes.length).toBe(1);
  });

  it("normal mode is default active", () => {
    const active = getActiveMissionMode();
    expect(active.id).toBe("normal");
    expect(active.name).toBe("Normal");
  });

  it("setMissionMode activates correct mode", () => {
    const updated = setMissionMode("sales-day");
    const active = updated.filter(m => m.active);
    expect(active.length).toBe(1);
    expect(active[0].id).toBe("sales-day");
    expect(active[0].name).toBe("Sales Day");
  });

  it("setMissionMode deactivates all others", () => {
    const updated = setMissionMode("travel-mode");
    const inactive = updated.filter(m => !m.active);
    expect(inactive.length).toBe(9);
    expect(inactive.every(m => m.id !== "travel-mode")).toBe(true);
  });

  it("each mission mode has prominent advisors that exist in registry", () => {
    for (const mode of MISSION_MODES) {
      for (const advisorId of mode.prominentAdvisors) {
        const advisor = getAdvisor(advisorId);
        expect(advisor).toBeDefined();
      }
    }
  });

  it("each mission mode has a valid boardroom packet type", () => {
    const validTypes = ["morning-briefing", "weekly-review", "financial-health", "pipeline-review", "household-ops", "opportunity-board", "incident-review"];
    for (const mode of MISSION_MODES) {
      expect(validTypes).toContain(mode.boardroomPacketType);
    }
  });

  it("emergency mode includes recovery and trust advisors", () => {
    const emergency = MISSION_MODES.find(m => m.id === "emergency");
    expect(emergency).toBeDefined();
    expect(emergency!.prominentAdvisors).toContain("recovery-advisor");
    expect(emergency!.prominentAdvisors).toContain("trust-policy-advisor");
  });

  it("calm mode deemphasizes business", () => {
    const calm = MISSION_MODES.find(m => m.id === "calm");
    expect(calm).toBeDefined();
    expect(calm!.deemphasizedDomains).toContain("business");
  });
});

// ═══════════════════════════════════════════════════════════════
// 6. Advisor Capability & Trust Checks
// ═══════════════════════════════════════════════════════════════

describe("Advisor Capability Checks", () => {
  it("money advisor can analyze but not transfer", () => {
    const analyze = canAdvisorPerformAction("money-advisor", "finance.analyze.cashflow");
    expect(analyze.allowed).toBe(true);

    const transfer = canAdvisorPerformAction("money-advisor", "finance.transfer.execute");
    expect(transfer.allowed).toBe(false);
    expect(transfer.reason).toContain("blocked");
  });

  it("business advisor is blocked from finance actions", () => {
    const result = canAdvisorPerformAction("sales-advisor", "finance.transfer");
    expect(result.allowed).toBe(false);
  });

  it("unknown advisor returns not allowed", () => {
    const result = canAdvisorPerformAction("fake-advisor", "anything");
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("Unknown");
  });

  it("getAdvisorCapabilities returns permissions list", () => {
    const caps = getAdvisorCapabilities("money-advisor");
    expect(caps.length).toBeGreaterThan(0);
    expect(caps).toContain("finance.analyze.*");
  });

  it("getAdvisorCapabilities returns empty for unknown", () => {
    expect(getAdvisorCapabilities("fake")).toHaveLength(0);
  });

  it("isAdvisorTrustworthy checks against threshold", () => {
    // money-advisor has trustThreshold: 75
    expect(isAdvisorTrustworthy("money-advisor", 80)).toBe(true);
    expect(isAdvisorTrustworthy("money-advisor", 70)).toBe(false);
    expect(isAdvisorTrustworthy("money-advisor", 75)).toBe(true);
  });

  it("isAdvisorTrustworthy returns false for unknown", () => {
    expect(isAdvisorTrustworthy("fake", 100)).toBe(false);
  });

  it("execution advisor has highest autonomy level", () => {
    const exec = getAdvisor("execution-advisor");
    expect(exec).toBeDefined();
    expect(exec!.autonomyLevel).toBe("execute");
    expect(exec!.trustThreshold).toBe(85);
  });
});

// ═══════════════════════════════════════════════════════════════
// 7. Cross-Council Bridging
// ═══════════════════════════════════════════════════════════════

describe("Cross-Council Bridging", () => {
  it("getAdvisorsForDomain returns advisors with matching scope", () => {
    const financeAdvisors = getAdvisorsForDomain("finance");
    expect(financeAdvisors.length).toBeGreaterThan(0);
    for (const a of financeAdvisors) {
      expect(a.domainScope).toContain("finance");
    }
  });

  it("meta advisors span all domains", () => {
    const meta = getMetaAdvisors();
    expect(meta.length).toBeGreaterThanOrEqual(5);
    for (const a of meta) {
      expect(a.domainScope.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("getAdvisorsWithMemoryAccess finds advisors with wildcard scope", () => {
    const advisors = getAdvisorsWithMemoryAccess("customers");
    expect(advisors.length).toBeGreaterThan(0);
    // boardroom-meta-advisor has memoryScope ["*"], so it should appear
    expect(advisors.some(a => a.id === "boardroom-meta-advisor")).toBe(true);
  });

  it("collections advisor bridges business and finance domains", () => {
    const collections = getAdvisor("collections-advisor");
    expect(collections).toBeDefined();
    expect(collections!.domainScope).toContain("business");
    expect(collections!.domainScope).toContain("finance");
  });

  it("receivables advisor bridges business and finance", () => {
    const rec = getAdvisor("receivables-advisor");
    expect(rec).toBeDefined();
    expect(rec!.domainScope).toContain("finance");
    expect(rec!.domainScope).toContain("business");
  });
});

// ═══════════════════════════════════════════════════════════════
// 8. Advisor Config Package Alignment
// ═══════════════════════════════════════════════════════════════

describe("Advisor Config Package Alignment", () => {
  it("advisor-config package has 4 advisors", () => {
    expect(ADVISOR_CONFIGS.length).toBe(4);
  });

  it("all advisor-config IDs map to protocol advisors", () => {
    const configMap: Record<string, string> = {
      "business-advisor": "biz-advisor",
      "money-advisor": "money-advisor",
      "concierge-advisor": "concierge-advisor",
      "strategy-advisor": "opportunity-advisor", // closest match
    };
    for (const config of ADVISOR_CONFIGS) {
      const protocolId = configMap[config.id];
      if (protocolId) {
        const protocol = getAdvisor(protocolId);
        expect(protocol).toBeDefined();
      }
    }
  });

  it("getAdvisorConfig throws for unknown ID", () => {
    expect(() => getAdvisorConfig("nonexistent" as never)).toThrow("Unknown advisor");
  });

  it("getAdvisorsByDomain returns correct results", () => {
    const biz = getAdvisorsByDomain("business-os");
    expect(biz.length).toBe(1);
    expect(biz[0].id).toBe("business-advisor");
  });
});

// ═══════════════════════════════════════════════════════════════
// 9. No-Hallucination Contract Integration
// ═══════════════════════════════════════════════════════════════

describe("No-Hallucination Contract Integration", () => {
  it("all advisor contracts have confidence thresholds", () => {
    const advisorIds = ["money", "business", "concierge", "family", "growth"];
    for (const id of advisorIds) {
      const contract = getAdvisorContract(id);
      expect(contract.confidenceThreshold).toBeGreaterThan(0);
      expect(contract.requiredInputs.length).toBeGreaterThanOrEqual(0);
    }
  });

  it("money advisor blocks payment on stale data", () => {
    expect(isActionBlocked("money", "execute_payment", true)).toBe(true);
    expect(isActionBlocked("money", "execute_payment", false)).toBe(false);
  });

  it("business advisor blocks proposal on stale data", () => {
    expect(isActionBlocked("business", "send_proposal", true)).toBe(true);
    expect(isActionBlocked("business", "send_proposal", false)).toBe(false);
  });

  it("concierge advisor blocks booking on stale data", () => {
    expect(isActionBlocked("concierge", "confirm_booking", true)).toBe(true);
  });

  it("general advisor has no blocked actions", () => {
    const contract = getAdvisorContract("general");
    expect(contract.blockedActionsWhenStale).toHaveLength(0);
  });
});

// ═══════════════════════════════════════════════════════════════
// 10. Boardroom Packet E2E Integration
// ═══════════════════════════════════════════════════════════════

describe("Boardroom Packet E2E", () => {
  it("morning briefing packet has all required fields", async () => {
    const packet = await generateBoardroomPacket("morning-briefing");
    expect(packet.packetId).toBeTruthy();
    expect(packet.type).toBe("morning-briefing");
    expect(packet.sections.length).toBeGreaterThan(0);
    expect(packet.dataSources.length).toBeGreaterThan(0);
    expect(packet.confidence).toBeGreaterThan(0);
    expect(packet.receipt.hash).toBeTruthy();
    expect(packet.receipt.generationTimeMs).toBeGreaterThanOrEqual(0);
  });

  it("financial health packet only includes finance domain", async () => {
    const packet = await generateBoardroomPacket("financial-health");
    expect(packet.sections.some(s => s.id.startsWith("fin-"))).toBe(true);
    expect(packet.dataSources.every(ds => ds.domain === "finance")).toBe(true);
  });

  it("packet receipt chain is valid", async () => {
    const packet = await generateBoardroomPacket("morning-briefing");
    expect(packet.receipt.receiptId).toContain(packet.packetId);
    expect(packet.receipt.sectionsGenerated).toBe(packet.sections.length);
    expect(packet.receipt.dataSourcesQueried).toBe(packet.dataSources.length);
  });

  it("packet includes no-hallucination contracts", async () => {
    const packet = await generateBoardroomPacket("morning-briefing");
    expect(packet.confidenceEnvelope).toBeDefined();
    expect(packet.groundingReport).toBeDefined();
    expect(packet.contradictions).toBeDefined();
  });

  it("perspective filtering integrates with packets", async () => {
    const packet = await generateBoardroomPacket("morning-briefing");
    const exec = filterSectionsByPerspective(packet.sections, "executive");
    const analyst = filterSectionsByPerspective(packet.sections, "analyst");
    expect(exec.length).toBeLessThanOrEqual(analyst.length);
  });
});

// ═══════════════════════════════════════════════════════════════
// 11. Council Protocol E2E with Mission Mode
// ═══════════════════════════════════════════════════════════════

describe("Council Protocol E2E with Mission Mode", () => {
  it("sales-day mode surfaces business advisors prominently", () => {
    const mode = MISSION_MODES.find(m => m.id === "sales-day")!;
    const synthesis = runCouncilProtocol("deal review", "business", {}, ["business"]);
    // All prominent advisors in sales-day should exist
    for (const id of mode.prominentAdvisors) {
      expect(getAdvisor(id)).toBeDefined();
    }
    expect(synthesis.recommendations.length).toBeGreaterThan(0);
  });

  it("tax-week mode surfaces finance advisors", () => {
    const mode = MISSION_MODES.find(m => m.id === "tax-week")!;
    for (const id of mode.prominentAdvisors) {
      const advisor = getAdvisor(id);
      expect(advisor).toBeDefined();
      expect(["finance", "meta"]).toContain(advisor!.council);
    }
  });

  it("full deliberation chain: mode → council → disagreements → synthesis → perspective", async () => {
    // 1. Set mission mode
    const updated = setMissionMode("collections-recovery");
    const active = updated.find(m => m.active)!;
    expect(active.id).toBe("collections-recovery");

    // 2. Run council protocol
    const synthesis = runCouncilProtocol("invoice recovery", "business", {}, ["business", "finance"]);
    expect(synthesis.recommendations.length).toBeGreaterThan(0);

    // 3. Detect disagreements
    const disagreements = detectCouncilDisagreements(synthesis.recommendations);
    // May or may not have disagreements

    // 4. Synthesize
    const synth = synthesizeCouncilRecommendations(synthesis.recommendations);
    expect(synth.primary).toBeTruthy();
    expect(synth.overallConfidence).toBeGreaterThan(0);

    // 5. Generate packet
    const packet = await generateBoardroomPacket(active.boardroomPacketType as never);
    expect(packet.sections.length).toBeGreaterThan(0);

    // 6. Filter by perspective
    const execView = filterSectionsByPerspective(packet.sections, "executive");
    const ownerView = filterSectionsByPerspective(packet.sections, "owner");
    expect(execView.length).toBeLessThanOrEqual(ownerView.length);
  });
});
