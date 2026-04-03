// SITA OS — Incident Classification Service
export interface IncidentClassification { severity: "low" | "medium" | "high" | "critical"; category: string; autoHealable: boolean; estimatedResolutionMinutes: number; escalationRequired: boolean; suggestedRunbook: string }

export function classifyIncident(description: string, systemHealth: number): IncidentClassification {
  const lower = description.toLowerCase();
  const isCritical = lower.includes("data loss") || lower.includes("outage") || systemHealth < 50;
  const isHigh = lower.includes("payment failed") || lower.includes("sync broken") || systemHealth < 70;
  const autoHealable = lower.includes("timeout") || lower.includes("retry") || lower.includes("stale");

  return {
    severity: isCritical ? "critical" : isHigh ? "high" : "medium",
    category: lower.includes("connector") ? "integration" : lower.includes("workflow") ? "orchestration" : "platform",
    autoHealable,
    estimatedResolutionMinutes: isCritical ? 5 : isHigh ? 15 : 60,
    escalationRequired: isCritical,
    suggestedRunbook: autoHealable ? "auto-heal-retry" : isCritical ? "critical-incident-response" : "standard-triage",
  };
}
