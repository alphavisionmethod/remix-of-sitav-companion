// ═══════════════════════════════════════════════════════════════
// SITA OS — Specialized: Observability Metric Contracts
// ═══════════════════════════════════════════════════════════════

import type { DomainId } from "../_contract-scaffold";

export type MetricType = "counter" | "gauge" | "histogram" | "summary";
export type AlertSeverity = "critical" | "warning" | "info";

export interface ObservabilityMetric {
  id: string;
  name: string;
  type: MetricType;
  domain: DomainId;
  value: number;
  unit: string;
  labels: Record<string, string>;
  timestamp: string;
}

export interface SLODefinition {
  id: string;
  name: string;
  target: number; // e.g., 99.9
  window: "1h" | "24h" | "7d" | "30d";
  metric: string;
  currentValue: number;
  isMet: boolean;
  burnRate: number;
}

export interface AlertRule {
  id: string;
  name: string;
  metric: string;
  condition: string;
  threshold: number;
  severity: AlertSeverity;
  isActive: boolean;
  lastTriggered?: string;
  cooldownMinutes: number;
}
