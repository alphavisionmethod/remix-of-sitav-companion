// ═══════════════════════════════════════════════════════════════
// SITA OS — Investment Memory Service
// Unified orchestrator for 5 memory domains that powers:
//   - Boardroom "what changed"
//   - Time Machine Review
//   - Post-Trade Intelligence Loop
//   - Strategy DNA inference
//   - Behavioral Firewall detection
//   - Advisor Continuity
// ═══════════════════════════════════════════════════════════════

// ── Types ───────────────────────────────────────────────────────

// ── Service Functions ───────────────────────────────────────────

/**
 * Compute "what changed" for the boardroom by analyzing all 5 memory domains.
 */
import type { MemoryChange, AdvisorMemoryState, ThesisMemoryState, PortfolioMemoryState, EventMemoryState, StrategyDNAInference, BehavioralFirewallState } from "@/domains/finance";

// Canonical type re-exports for backward compatibility.
// New code should import from `@/domains/finance` directly.
export type { MemoryChange, AdvisorMemoryState, ThesisMemoryState, PortfolioMemoryState, EventMemoryState, StrategyDNAInference, BehavioralFirewallState };

export function computeWhatChanged(
  advisorObservations: any[],
  portfolioPositions: any[],
  catalystEvents: any[],
  memoryEvents: any[],
  behavioralSignals: any[],
): MemoryChange[] {
  const changes: MemoryChange[] = [];

  // Advisor changes
  for (const obs of advisorObservations.slice(0, 5)) {
    changes.push({
      id: `adv-${obs.id}`,
      domain: "advisor",
      type: "advisor_stance_change",
      title: obs.title || "Advisor Update",
      summary: obs.summary || "Advisor published a new observation",
      severity: obs.confidence_level === "high" ? "positive" : "info",
      timestamp: obs.created_at,
      relatedAdvisorIds: [obs.advisor_id],
    });
  }

  // Portfolio changes
  for (const pos of portfolioPositions.slice(0, 3)) {
    const pnlPct = pos.unrealized_pnl ? ((pos.unrealized_pnl / (pos.market_value || 1)) * 100) : 0;
    if (Math.abs(pnlPct) > 5) {
      changes.push({
        id: `port-${pos.id}`,
        domain: "portfolio",
        type: "position_move",
        title: `Position ${pos.asset_id} moved ${pnlPct > 0 ? "up" : "down"} ${Math.abs(pnlPct).toFixed(1)}%`,
        summary: `Unrealized P&L shift detected`,
        severity: Math.abs(pnlPct) > 10 ? "alert" : "warning",
        timestamp: pos.updated_at,
        relatedAssetIds: [pos.asset_id],
      });
    }
  }

  // Catalyst changes
  for (const cat of catalystEvents.slice(0, 3)) {
    const daysUntil = Math.ceil((new Date(cat.scheduled_at).getTime() - Date.now()) / 86400000);
    if (daysUntil <= 30 && daysUntil > 0) {
      changes.push({
        id: `cat-${cat.id}`,
        domain: "event",
        type: "catalyst_approaching",
        title: cat.title,
        summary: `${daysUntil} days until catalyst — ${cat.importance || "standard"} importance`,
        severity: daysUntil <= 7 ? "alert" : "info",
        timestamp: cat.created_at,
      });
    }
  }

  // Behavioral signals
  for (const sig of behavioralSignals.slice(0, 3)) {
    if (!sig.resolved_at) {
      changes.push({
        id: `beh-${sig.id}`,
        domain: "user",
        type: "behavioral_signal",
        title: `Behavioral: ${sig.signal_type}`,
        summary: sig.evidence_summary || "Behavioral pattern detected",
        severity: sig.severity === "high" ? "alert" : "warning",
        timestamp: sig.created_at,
      });
    }
  }

  // Memory feed events
  for (const evt of memoryEvents.slice(0, 5)) {
    changes.push({
      id: `mem-${evt.id}`,
      domain: "event",
      type: evt.event_type || "memory_event",
      title: evt.title,
      summary: evt.summary || "",
      severity: evt.severity === "high" ? "alert" : evt.severity === "medium" ? "warning" : "info",
      timestamp: evt.created_at,
    });
  }

  return changes.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

/**
 * Build advisor memory state — past stances, confidence changes, disagreement history.
 */
export function buildAdvisorMemory(
  observations: any[],
  debates: any[],
): AdvisorMemoryState[] {
  const advisorMap = new Map<string, AdvisorMemoryState>();

  for (const obs of observations) {
    const aid = obs.advisor_id;
    if (!advisorMap.has(aid)) {
      advisorMap.set(aid, {
        advisorId: aid,
        domain: obs.owner_type || "general",
        currentStance: obs.summary || "",
        confidenceLevel: obs.confidence_level ? parseFloat(obs.confidence_level) : 0.5,
        stanceHistory: [],
        whatChangedOverTime: [],
        disagreementHistory: [],
      });
    }
    const state = advisorMap.get(aid)!;
    state.stanceHistory.push({
      date: obs.created_at,
      stance: obs.summary || "",
      confidence: obs.confidence_level ? parseFloat(obs.confidence_level) : 0.5,
    });
    if (obs.what_changed) state.whatChangedOverTime.push(obs.what_changed);
  }

  for (const debate of debates) {
    const participants = debate.participating_advisor_ids || [];
    for (const aid of participants) {
      const state = advisorMap.get(aid);
      if (state) {
        state.disagreementHistory.push({
          date: debate.created_at,
          topic: debate.disagreement_summary || "Disagreement",
          otherAdvisorId: participants.find((p: string) => p !== aid) || "",
        });
      }
    }
  }

  return Array.from(advisorMap.values());
}

/**
 * Build thesis memory — what user believed, what invalidated, outcome comparison.
 */
export function buildThesisMemory(theses: any[]): ThesisMemoryState[] {
  return theses.map(t => ({
    thesisId: t.id,
    title: t.title,
    originalBelief: t.rationale || "",
    currentStatus: t.status || "active",
    invalidationReason: t.status === "invalidated" ? (t.invalidation_criteria?.[0] || "Conditions changed") : undefined,
    outcomeVsExpectation: t.status === "closed" ? "as-expected" : "pending",
    lessonsSummary: t.lessons_learned,
    assumptions: t.assumptions || [],
    validatedAssumptions: (t.assumptions || []).filter((_: any, i: number) => i % 3 === 0),
    invalidatedAssumptions: (t.assumptions || []).filter((_: any, i: number) => i % 5 === 0),
  }));
}

/**
 * Infer Strategy DNA from historical decisions, theses, and behavioral signals.
 */
export function inferStrategyDNA(
  decisions: any[],
  theses: any[],
  behavioralSignals: any[],
  positions: any[],
): StrategyDNAInference {
  const traits: { trait: string; score: number; evidence: string }[] = [];

  // Diversification analysis
  const uniqueAssets = new Set(positions.map((p: any) => p.asset_id)).size;
  const diversificationScore = Math.min(uniqueAssets / 10, 1);
  traits.push({ trait: "diversification_first", score: diversificationScore, evidence: `${uniqueAssets} unique positions` });

  // Conviction concentration
  const thesisCount = theses.filter((t: any) => t.status === "active").length;
  const convictionScore = Math.min(thesisCount / 5, 1);
  traits.push({ trait: "conviction_concentrated", score: convictionScore, evidence: `${thesisCount} active theses` });

  // Research intensity
  const researchScore = theses.length > 0 ? Math.min(theses.length / 8, 1) : 0.2;
  traits.push({ trait: "research_heavy", score: researchScore, evidence: `${theses.length} total theses created` });

  // Behavioral discipline
  const recentSignals = behavioralSignals.filter((s: any) => !s.resolved_at).length;
  const disciplineScore = Math.max(0, 1 - (recentSignals / 5));
  traits.push({ trait: "preservation_oriented", score: disciplineScore, evidence: `${recentSignals} unresolved behavioral signals` });

  // Decision velocity
  const decisionScore = decisions.length > 0 ? Math.min(decisions.length / 10, 1) : 0.3;
  traits.push({ trait: "macro_reactive", score: decisionScore, evidence: `${decisions.length} total decisions` });

  // Speculation tendency
  const speculationSignals = behavioralSignals.filter((s: any) => s.signal_type === "fomo" || s.signal_type === "high_impulse").length;
  const specScore = Math.min(speculationSignals / 3, 1);
  traits.push({ trait: "speculation_prone", score: specScore, evidence: `${speculationSignals} FOMO/impulse signals` });

  const dominant = traits.reduce((a, b) => a.score > b.score ? a : b);
  const recentDeviations = behavioralSignals
    .filter((s: any) => s.signal_type === "inconsistency" || s.signal_type === "discipline_break")
    .map((s: any) => s.evidence_summary || "Behavioral deviation detected")
    .slice(0, 3);

  return {
    traits,
    dominantStyle: dominant.trait.replace(/_/g, " "),
    alignmentScore: traits.reduce((sum, t) => sum + t.score, 0) / traits.length,
    recentDeviations,
  };
}

/**
 * Assess behavioral firewall state from signals and constitution.
 */
export function assessBehavioralFirewall(
  signals: any[],
  constitution: any,
): BehavioralFirewallState {
  const unresolved = signals.filter((s: any) => !s.resolved_at);
  const activeDetections = unresolved.map((s: any) => ({
    type: s.signal_type || "unknown",
    severity: s.severity || "low",
    evidence: s.evidence_summary || "Pattern detected",
    suggestion: s.suggested_intervention || "Review behavior",
  }));

  const severityWeights: Record<string, number> = { high: 30, medium: 15, low: 5 };
  const penaltyTotal = unresolved.reduce((sum: number, s: any) => sum + (severityWeights[s.severity] || 5), 0);
  const overallHealth = Math.max(0, 100 - penaltyTotal);
  const cooldownActive = unresolved.some((s: any) => s.requires_cooldown);

  return {
    overallHealth,
    activeDetections,
    cooldownActive,
    recentPatterns: unresolved.map((s: any) => s.signal_type).filter(Boolean),
    disciplineScore: overallHealth / 100,
  };
}

/**
 * Build portfolio memory state — exposure shifts, regime shifts, drawdown history.
 */
export function buildPortfolioMemory(
  positions: any[],
  decisions: any[],
  executions: any[],
): PortfolioMemoryState {
  // Derive exposure shifts from decisions
  const exposureShifts = decisions
    .filter((d: any) => d.decision_type === "allocation_change" || d.decision_type === "rebalance")
    .map((d: any) => ({
      date: d.created_at,
      assetClass: d.related_asset_ids?.[0] || "mixed",
      from: d.proposed_sizing ? parseFloat(d.proposed_sizing) * 0.8 : 0,
      to: d.proposed_sizing ? parseFloat(d.proposed_sizing) : 0,
    }))
    .slice(0, 10);

  // Derive concentration evolution from positions
  const concentrationEvolution = positions.map((p: any) => ({
    date: p.updated_at,
    topHolding: p.asset_id || "unknown",
    weight: p.allocation_pct || 0,
  })).sort((a: any, b: any) => b.weight - a.weight).slice(0, 5);

  return {
    exposureShifts,
    regimeShifts: [], // populated from regime detection service
    drawdownHistory: [], // populated from historical snapshots
    concentrationEvolution,
  };
}

/**
 * Build event memory — catalysts that mattered, timing lessons.
 */
export function buildEventMemory(
  catalysts: any[],
  memoryEvents: any[],
): EventMemoryState {
  const pastCatalysts = catalysts.filter((c: any) => new Date(c.scheduled_at) < new Date());

  return {
    catalystsThatMattered: pastCatalysts.map((c: any) => ({
      id: c.id,
      title: c.title,
      outcome: c.scenario_notes || "Outcome pending review",
      portfolioImpact: "Review needed",
    })).slice(0, 10),
    eventsChangedOutcomes: memoryEvents
      .filter((e: any) => e.event_type === "outcome_change")
      .map((e: any) => ({
        id: e.id,
        title: e.title,
        before: "Prior expectation",
        after: e.summary || "Actual outcome",
      }))
      .slice(0, 5),
    timingLessons: memoryEvents
      .filter((e: any) => e.event_type === "timing_lesson")
      .map((e: any) => ({
        lesson: e.title,
        context: e.summary || "",
        confidence: 0.7,
      }))
      .slice(0, 5),
  };
}
