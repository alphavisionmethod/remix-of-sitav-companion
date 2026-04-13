// ═══════════════════════════════════════════════════════════════
// SITA OS — App Board Synthesizer
// Collects advisor outputs per domain and produces synthesis
// ═══════════════════════════════════════════════════════════════

import { getEventBus, type BusEvent } from "@/lib/core-services/event-bus";
import type { AdvisorOutputPacket, AppBoardSynthesis, AdvisorPosition, Domain } from "./types";

const syntheses: Map<Domain, AppBoardSynthesis> = new Map();
const pendingOutputs: Map<Domain, AdvisorOutputPacket[]> = new Map();
let subscriptionId: string | null = null;

const BOARDROOM_AUTO_THRESHOLD = 0.65;
const BOARDROOM_USER_THRESHOLD = 0.4;

function collectOutput(event: BusEvent) {
  const output = event.payload as unknown as AdvisorOutputPacket;
  if (!output?.packet_id || !output?.domain) return;

  const domain = output.domain;
  if (!pendingOutputs.has(domain)) pendingOutputs.set(domain, []);
  pendingOutputs.get(domain)!.push(output);

  // Re-synthesize after each new output
  synthesizeDomain(domain);
}

function synthesizeDomain(domain: Domain) {
  const outputs = pendingOutputs.get(domain) || [];
  if (outputs.length === 0) return;

  // Build advisor positions
  const positions: AdvisorPosition[] = outputs.map((o) => ({
    advisor_id: o.advisor_id,
    advisor_name: o.advisor_name,
    stance: o.boardroom_relevance_score > 0.6
      ? "support"
      : o.confidence < 40
        ? "needs-data"
        : o.risks.length > 0
          ? "caution"
          : "support",
    summary: o.recommendation,
    confidence: o.confidence,
  }));

  // Calculate consensus
  const avgConfidence = outputs.reduce((s, o) => s + o.confidence, 0) / outputs.length;
  const avgWorthiness = outputs.reduce((s, o) => s + o.boardroom_relevance_score, 0) / outputs.length;
  const disagreements = findDisagreements(positions);
  const allMissingData = [...new Set(outputs.flatMap((o) => o.missing_data))];
  const affectedModules = [...new Set(outputs.map((o) => o.scope))];

  // Top recommendation
  const topOutput = outputs.reduce((best, o) =>
    o.boardroom_relevance_score > best.boardroom_relevance_score ? o : best
  , outputs[0]);

  const synthesis: AppBoardSynthesis = {
    synthesis_id: crypto.randomUUID(),
    app_id: domain,
    issue_summary: `${outputs.length} advisor(s) reviewed signals in ${domain}. Top concern: ${topOutput.recommendation.slice(0, 80)}`,
    affected_modules: affectedModules,
    module_advisor_positions: positions,
    recommendation: topOutput.recommendation,
    disagreement_areas: disagreements,
    trust_state: avgConfidence >= 80 ? "verified" : avgConfidence >= 60 ? "evidence-backed" : avgConfidence >= 40 ? "inferred" : "advisory-only",
    scenario_need: avgWorthiness > 0.5,
    action_options: outputs.map((o) => o.recommendation).slice(0, 3),
    boardroom_candidate_motion: avgWorthiness >= BOARDROOM_USER_THRESHOLD ? topOutput.recommendation : null,
    boardroom_worthiness_score: avgWorthiness,
    missing_data_flags: allMissingData,
    created_at: new Date().toISOString(),
  };

  syntheses.set(domain, synthesis);

  // Publish synthesis event
  const bus = getEventBus();
  bus.publish(`board.synthesis.${domain}`, synthesis as unknown as Record<string, unknown>, {
    source: `app-board-synthesizer:${domain}`,
    domain,
    skipPersist: true,
  });
}

function findDisagreements(positions: AdvisorPosition[]): string[] {
  const disagreements: string[] = [];
  const stances = positions.map((p) => p.stance);
  const hasSupport = stances.includes("support");
  const hasCaution = stances.includes("caution");
  const hasOppose = stances.includes("oppose");

  if (hasSupport && (hasCaution || hasOppose)) {
    disagreements.push("Mixed advisor stances — some support while others urge caution");
  }
  if (positions.some((p) => p.confidence < 50)) {
    disagreements.push("Some advisors have low confidence in their assessment");
  }
  return disagreements;
}

/**
 * Initialize the app board synthesizer.
 */
export function initAppBoardSynthesizer(): () => void {
  const bus = getEventBus();
  subscriptionId = bus.subscribe("advisor.output.*", collectOutput, "app-board-synthesizer");
  return () => {
    if (subscriptionId) {
      bus.unsubscribe(subscriptionId);
      subscriptionId = null;
    }
  };
}

/**
 * Get the latest synthesis for a domain.
 */
export function getSynthesisForDomain(domain: Domain): AppBoardSynthesis | null {
  return syntheses.get(domain) || null;
}

/**
 * Get all current syntheses.
 */
export function getAllSyntheses(): Map<Domain, AppBoardSynthesis> {
  return new Map(syntheses);
}

/**
 * Check if a domain's synthesis qualifies for auto-escalation.
 */
export function shouldAutoEscalate(domain: Domain): boolean {
  const synthesis = syntheses.get(domain);
  return !!synthesis && synthesis.boardroom_worthiness_score >= BOARDROOM_AUTO_THRESHOLD;
}

/**
 * Check if a domain's synthesis is in the "user decides" zone.
 */
export function isUserDecisionZone(domain: Domain): boolean {
  const synthesis = syntheses.get(domain);
  if (!synthesis) return false;
  return synthesis.boardroom_worthiness_score >= BOARDROOM_USER_THRESHOLD && synthesis.boardroom_worthiness_score < BOARDROOM_AUTO_THRESHOLD;
}
