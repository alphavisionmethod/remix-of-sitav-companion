// ═══════════════════════════════════════════════════════════════
// SITA OS — Timeline Protocol
// Timeline event schema, narrative events, system journal,
// digest feed events.
// ═══════════════════════════════════════════════════════════════

export type TimelineEventCategory =
  | "command"
  | "approval"
  | "execution"
  | "trust"
  | "release"
  | "advisor"
  | "boardroom"
  | "system"
  | "user_action"
  | "integration"
  | "financial"
  | "milestone";

export type TimelineSeverity = "critical" | "high" | "normal" | "low" | "info";

export interface TimelineEvent {
  event_id: string;
  correlation_id?: string;
  category: TimelineEventCategory;
  severity: TimelineSeverity;
  title: string;
  description: string;
  actor_id?: string;
  actor_type?: "user" | "agent" | "system" | "advisor";
  domain?: string;
  entity_type?: string;
  entity_id?: string;
  metadata?: Record<string, unknown>;
  receipt_id?: string;
  parent_event_id?: string;
  tags: string[];
  timestamp: string;
}

export interface NarrativeEvent {
  narrative_id: string;
  timeline_events: string[];
  narrative_type: "decision_arc" | "incident_arc" | "achievement" | "trend" | "pattern";
  title: string;
  summary: string;
  significance: number;
  domain: string;
  actors: string[];
  outcome?: "positive" | "negative" | "neutral" | "pending";
  started_at: string;
  completed_at?: string;
}

export interface SystemJournalEntry {
  entry_id: string;
  journal_type: "boot" | "shutdown" | "error" | "warning" | "config_change" | "health_check" | "migration";
  service: string;
  message: string;
  severity: TimelineSeverity;
  structured_data?: Record<string, unknown>;
  stack_trace?: string;
  correlation_id?: string;
  timestamp: string;
}

export interface DigestFeedEvent {
  digest_id: string;
  period: "hourly" | "daily" | "weekly";
  events_count: number;
  highlights: DigestHighlight[];
  domains_affected: string[];
  health_summary: Record<string, "healthy" | "degraded" | "critical">;
  generated_at: string;
}

export interface DigestHighlight {
  event_id: string;
  category: TimelineEventCategory;
  title: string;
  significance: number;
  outcome?: string;
}

export interface TimelineQuery {
  categories?: TimelineEventCategory[];
  severity_min?: TimelineSeverity;
  actor_id?: string;
  domain?: string;
  entity_type?: string;
  entity_id?: string;
  correlation_id?: string;
  since?: string;
  until?: string;
  limit?: number;
  offset?: number;
  tags?: string[];
}
