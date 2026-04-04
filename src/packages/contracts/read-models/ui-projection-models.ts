// ═══════════════════════════════════════════════════════════════
// SITA OS — Read Models: UI Projection Models
// Generic projection types — NEVER sources of truth
// ═══════════════════════════════════════════════════════════════

import type { DomainId } from "../_contract-scaffold";

/** @layer read-model — all types in this file are UI projections */

export interface StatusChip {
  label: string;
  variant: "success" | "warning" | "error" | "info" | "neutral";
  tooltip?: string;
}

export interface MetricCard {
  id: string;
  label: string;
  value: number;
  unit: string;
  trend: "up" | "down" | "flat";
  trendPercent: number;
  domain: DomainId;
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  type: string;
  title: string;
  description: string;
  domain: DomainId;
  actor: string;
  linkedEntityId?: string;
}

export interface NavigationBadge {
  route: string;
  count: number;
  severity: "critical" | "warning" | "info";
}
