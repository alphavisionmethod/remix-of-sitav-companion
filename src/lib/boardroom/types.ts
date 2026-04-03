// ============================================================
// SITA OS — Boardroom Packet Type System
// Canonical types for structured decision-support packets
// ============================================================

export type BoardroomType =
  | "morning-briefing"
  | "weekly-review"
  | "financial-health"
  | "pipeline-review"
  | "household-ops"
  | "opportunity-board"
  | "incident-review";

export const BOARDROOM_META: Record<BoardroomType, { label: string; frequency: string; domains: string[]; purpose: string }> = {
  "morning-briefing": { label: "Morning Briefing", frequency: "Daily", domains: ["All"], purpose: "Day's priorities, alerts, and opportunities" },
  "weekly-review": { label: "Weekly Review", frequency: "Weekly", domains: ["All"], purpose: "Week performance, trends, upcoming" },
  "financial-health": { label: "Financial Health", frequency: "On-demand", domains: ["Finance"], purpose: "Budget, cashflow, reserves, projections" },
  "pipeline-review": { label: "Pipeline Review", frequency: "On-demand", domains: ["Business"], purpose: "Pipeline health, forecasts, stale deals" },
  "household-ops": { label: "Household Ops", frequency: "On-demand", domains: ["Concierge"], purpose: "Task status, routines, coordination" },
  "opportunity-board": { label: "Opportunity Board", frequency: "On-demand", domains: ["All"], purpose: "Open opportunities ranked by value" },
  "incident-review": { label: "Incident Review", frequency: "On-demand", domains: ["All"], purpose: "Active incidents, impact, resolution" },
};

// ── Section Types ─────────────────────────────────────────

export type SectionType = "metric-card" | "table" | "chart" | "narrative" | "alert" | "action-list";

export interface MetricCardData {
  label: string;
  value: string | number;
  trend?: "up" | "down" | "flat";
  trendValue?: string;
  source: string;
}

export interface TableData {
  columns: { key: string; label: string }[];
  rows: Record<string, string | number | boolean>[];
  source: string;
}

export interface NarrativeData {
  text: string;
  confidence: number;
  citations: string[];
}

export interface AlertData {
  severity: "critical" | "warning" | "info";
  title: string;
  description: string;
  suggestedAction?: string;
  source: string;
}

export interface ActionItemData {
  text: string;
  priority: "critical" | "high" | "medium" | "low";
  domain: string;
  assignee?: string;
  dueDate?: string;
}

export interface ChartData {
  type: "bar" | "line" | "pie";
  title: string;
  data: { name: string; value: number }[];
  source: string;
}

export type SectionData = MetricCardData[] | TableData | NarrativeData | AlertData[] | ActionItemData[] | ChartData;

export interface BoardroomSection {
  id: string;
  type: SectionType;
  title: string;
  data: SectionData;
}

// ── Packet ────────────────────────────────────────────────

export interface DataSource {
  id: string;
  name: string;
  domain: string;
  lastUpdated: string;
  recordCount: number;
}

export interface OpportunitySummary {
  id: string;
  title: string;
  description: string;
  domain: string;
  projectedValue: string;
  confidence: number;
}

export interface BoardroomReceipt {
  receiptId: string;
  packetId: string;
  generatedAt: string;
  hash: string;
  generationTimeMs: number;
  sectionsGenerated: number;
  dataSourcesQueried: number;
}

export interface BoardroomPacket {
  packetId: string;
  type: BoardroomType;
  generatedAt: string;
  timeHorizon: { start: string; end: string };
  sections: BoardroomSection[];
  alerts: AlertData[];
  opportunities: OpportunitySummary[];
  actionItems: ActionItemData[];
  confidence: number;
  dataSources: DataSource[];
  staleDataWarnings: string[];
  receipt: BoardroomReceipt;
  // No-hallucination contracts
  confidenceEnvelope?: import("@/lib/no-hallucination/types").ConfidenceEnvelope;
  groundingReport?: import("@/lib/no-hallucination/types").GroundingReport;
  contradictions?: import("@/lib/no-hallucination/types").ContradictionReport;
}

// ── Domain Assessment ─────────────────────────────────────

export interface DomainAssessment {
  domain: string;
  generatedAt: string;
  confidence: number;
  sections: BoardroomSection[];
  alerts: AlertData[];
  opportunities: OpportunitySummary[];
  actionItems: ActionItemData[];
  dataSources: DataSource[];
  staleFields: string[];
}
