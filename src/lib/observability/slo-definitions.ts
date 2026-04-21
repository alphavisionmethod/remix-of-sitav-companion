// ═══════════════════════════════════════════════════════════════
// SITA OS — SLO Definitions
// Initial Service Level Objectives
// ═══════════════════════════════════════════════════════════════

export type SLOCategory = "availability" | "latency" | "success-rate" | "actuation";

export interface SLODefinition {
  id: string;
  name: string;
  category: SLOCategory;
  target: number;
  unit: string;
  window: "30d" | "7d" | "24h";
  measurement: string;
  errorBudgetPercent: number;
  owner: string;
  currentValue: number | null;
}

export const SLO_DEFINITIONS: SLODefinition[] = [
  { id: "SLO-001", name: "Core Route Availability", category: "availability", target: 99.5, unit: "%", window: "30d", measurement: "Successful page loads / total requests", errorBudgetPercent: 0.5, owner: "platform", currentValue: null },
  { id: "SLO-002", name: "Waitlist Form Success", category: "success-rate", target: 99.9, unit: "%", window: "30d", measurement: "Successful submissions / total attempts", errorBudgetPercent: 0.1, owner: "growth", currentValue: null },
  { id: "SLO-003", name: "AI Chat P95 Latency", category: "latency", target: 3000, unit: "ms", window: "7d", measurement: "P95 of chat response time", errorBudgetPercent: 5, owner: "intelligence", currentValue: null },
  { id: "SLO-004", name: "Kill Switch Actuation", category: "actuation", target: 30000, unit: "ms", window: "30d", measurement: "Time from trigger to feature disabled", errorBudgetPercent: 0, owner: "platform", currentValue: null },
  { id: "SLO-005", name: "Workflow Execution Success", category: "success-rate", target: 99.0, unit: "%", window: "30d", measurement: "Completed runs / triggered runs", errorBudgetPercent: 1, owner: "platform", currentValue: null },
  { id: "SLO-006", name: "Edge Function Availability", category: "availability", target: 99.5, unit: "%", window: "30d", measurement: "2xx responses / total invocations", errorBudgetPercent: 0.5, owner: "platform", currentValue: null },
  { id: "SLO-007", name: "AI Budget Enforcement", category: "success-rate", target: 100, unit: "%", window: "7d", measurement: "Budget-checked calls / total AI calls", errorBudgetPercent: 0, owner: "intelligence", currentValue: null },
  { id: "SLO-008", name: "Receipt Completeness", category: "success-rate", target: 99.0, unit: "%", window: "7d", measurement: "Invocations with receipt / total invocations", errorBudgetPercent: 1, owner: "trust", currentValue: null },
  { id: "SLO-009", name: "Investor Portal Availability", category: "availability", target: 99.9, unit: "%", window: "30d", measurement: "Successful deal room loads / total requests", errorBudgetPercent: 0.1, owner: "growth", currentValue: null },
  { id: "SLO-010", name: "Campaign Delivery Rate", category: "success-rate", target: 98.0, unit: "%", window: "30d", measurement: "Delivered messages / sent messages", errorBudgetPercent: 2, owner: "growth", currentValue: null },
];

export function getSLOsByOwner(owner: string): SLODefinition[] {
  return SLO_DEFINITIONS.filter((s) => s.owner === owner);
}

export function getBreachedSLOs(): SLODefinition[] {
  return SLO_DEFINITIONS.filter((s) => {
    if (s.currentValue === null) return false;
    if (s.category === "latency") return s.currentValue > s.target;
    return s.currentValue < s.target;
  });
}