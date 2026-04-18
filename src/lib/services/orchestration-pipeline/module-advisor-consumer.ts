// ═══════════════════════════════════════════════════════════════
// SITA OS — Module Advisor Consumer
// Subscribes to domain signals and routes to registered advisors
// ═══════════════════════════════════════════════════════════════

import { getEventBus, type BusEvent } from "@/platform/core-services/event-bus";
import { getAdvisorsForSignal, getBoardroomWorthinessScore, type AdvisorRegistryEntry } from "./advisor-routing-registry";
import type { DomainSignal, AdvisorOutputPacket, TransmissionLogEntry } from "./types";

const advisorOutputs: AdvisorOutputPacket[] = [];
const MAX_OUTPUTS = 200;
let subscriptionId: string | null = null;

function logTransmission(entry: Omit<TransmissionLogEntry, "id">) {
  // Shared log — imported from signal-emitter in practice
  void entry;
}

/**
 * Generate a deterministic mock advisor output for demo mode.
 */
function generateDemoAdvisorOutput(
  advisor: AdvisorRegistryEntry,
  signal: DomainSignal
): AdvisorOutputPacket {
  const worthiness = getBoardroomWorthinessScore(signal);

  const recommendations: Record<string, string> = {
    "revenue-advisor": "Prioritize phased outreach for high-value accounts to protect revenue pipeline.",
    "crm-advisor": "Review customer health scores and flag at-risk relationships for proactive engagement.",
    "lead-recovery-advisor": "Re-engage stalled leads with personalized follow-up sequences.",
    "operations-advisor": "Optimize fulfillment workflow to reduce operational bottlenecks.",
    "spending-advisor": "Review discretionary spending categories for potential savings.",
    "reserve-advisor": "Build reserve buffer to 90-day target through receivables acceleration.",
    "obligations-advisor": "Prioritize upcoming obligations by due date and penalty risk.",
    "travel-advisor": "Confirm all travel prep items are cleared 48 hours before departure.",
    "calendar-advisor": "Consolidate overlapping appointments and block prep time.",
    "lifestyle-advisor": "Bundle nearby errands to reduce transit time and effort.",
  };

  return {
    packet_id: crypto.randomUUID(),
    advisor_id: advisor.advisor_id,
    advisor_name: advisor.display_name,
    scope: advisor.modules.join(", "),
    domain: signal.domain,
    target_objects: signal.linked_objects,
    signal_ref: signal.signal_id,
    recommendation: recommendations[advisor.advisor_id] || `Reviewing ${signal.summary}`,
    rationale: `Based on ${signal.triggering_conditions.length || 1} triggering condition(s) with ${signal.confidence}% confidence.`,
    confidence: Math.min(95, signal.confidence + Math.floor(Math.random() * 10)),
    assumptions: [`Signal source is ${signal.source}`, "Current data is representative"],
    risks: signal.severity === "high" || signal.severity === "critical" ? ["Delayed action may increase impact"] : [],
    missing_data: signal.confidence < 60 ? ["Additional data sources needed for higher confidence"] : [],
    escalation_suggestion: worthiness > 0.6 ? "Consider Boardroom escalation" : null,
    boardroom_relevance_score: worthiness,
    created_at: new Date().toISOString(),
  };
}

/**
 * Handle an incoming domain signal event.
 */
function handleSignalEvent(event: BusEvent) {
  const signal = event.payload as unknown as DomainSignal;
  if (!signal?.signal_id || !signal?.domain) return;

  const advisors = getAdvisorsForSignal(signal);

  for (const advisor of advisors) {
    const output = generateDemoAdvisorOutput(advisor, signal);
    advisorOutputs.push(output);
    if (advisorOutputs.length > MAX_OUTPUTS) {
      advisorOutputs.splice(0, advisorOutputs.length - MAX_OUTPUTS);
    }

    // Re-publish advisor output for app board synthesis layer
    const bus = getEventBus();
    bus.publish(`advisor.output.${signal.domain}`, output as unknown as Record<string, unknown>, {
      source: `advisor-consumer:${advisor.advisor_id}`,
      correlationId: signal.signal_id,
      domain: signal.domain,
      skipPersist: true,
    });
  }
}

/**
 * Initialize the module advisor consumer — subscribes to all domain signals.
 */
export function initAdvisorConsumer(): () => void {
  const bus = getEventBus();
  subscriptionId = bus.subscribe("domain.signal.*", handleSignalEvent, "module-advisor-consumer");
  return () => {
    if (subscriptionId) {
      bus.unsubscribe(subscriptionId);
      subscriptionId = null;
    }
  };
}

/**
 * Get all collected advisor outputs, optionally filtered by domain.
 */
export function getAdvisorOutputs(domain?: string): AdvisorOutputPacket[] {
  if (domain) return advisorOutputs.filter((o) => o.domain === domain);
  return [...advisorOutputs];
}

/**
 * Get outputs that cross the Boardroom relevance threshold.
 */
export function getBoardroomCandidateOutputs(threshold = 0.6): AdvisorOutputPacket[] {
  return advisorOutputs.filter((o) => o.boardroom_relevance_score > threshold);
}
