// ═══════════════════════════════════════════════════════════════
// SITA OS — Kill-Switch Suggestion Engine
// Wraps incident-classifier to produce structured suggestions.
// ═══════════════════════════════════════════════════════════════

import { classifyIncident, type IncidentClassification } from "@/lib/incidents/incident-classifier";
import type { KillSwitchSuggestion } from "./support-bundle-contract";

const DUAL_ADMIN_SWITCHES = new Set([
  "KS-PAYMENTS", "KS-PAYMENTS-AUTH", "KS-MODEL-PROVIDERS",
  "KS-AI-GATEWAY", "KS-RELEASE-PIPELINE",
]);

/**
 * Given a subsystem and optional symptom code, produce a structured
 * kill-switch suggestion if the incident classifier recommends one.
 */
export async function suggestKillSwitch(
  subsystem: string,
  symptomCode?: string,
): Promise<KillSwitchSuggestion | null> {
  const classification = await classifyIncident(subsystem, symptomCode);
  if (!classification || !classification.recommendedSwitchId) return null;

  return classificationToSuggestion(classification);
}

/**
 * Convert an incident classification to a kill-switch suggestion.
 */
export function classificationToSuggestion(
  classification: IncidentClassification,
): KillSwitchSuggestion | null {
  if (!classification.recommendedSwitchId) return null;

  const switchId = classification.recommendedSwitchId;
  const isCritical = classification.severity === "critical" || classification.severity === "high";

  return {
    switchId,
    reason: `Incident: ${classification.displayName} — ${classification.description ?? classification.symptomCode}`,
    confidence: isCritical ? 0.9 : 0.7,
    linkedRunbookId: classification.recommendedRunbookId,
    requiredApprovalLevel: DUAL_ADMIN_SWITCHES.has(switchId) ? "dual-admin" : "standard",
    classification: isCritical ? "actionable" : "informational",
  };
}