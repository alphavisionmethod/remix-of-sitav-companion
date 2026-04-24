// ═══════════════════════════════════════════════════════════════
// SITA OS — Sita Jarvis (Phase J): shared types
// ═══════════════════════════════════════════════════════════════
// One coherent operating-intelligence surface fusing the existing
// Sita Phase A–I stack (world-model, agent loop, advisor council,
// briefings, knowledge graph, episodes) into a single
// "Jarvis Bridge" view. No new schema; pure read-fusion.
// ═══════════════════════════════════════════════════════════════

import type { WorldModelSnapshot } from "@/lib/sita-cortex/world-model";

export type JarvisItemSource =
  | "advisor_action_queue"
  | "sita_agent_plans"
  | "advisor_board_recommendations"
  | "sita_proactive_briefings"
  | "sita_journal_entries"
  | "advisor_board_actions"
  | "sita_episodes"
  | "sita_perception_events";

/** A single mission row as surfaced on the NowPanel. */
export interface NowMission {
  id: string;
  title: string;
  description: string | null;
  domain: string;
  priority: number;
  target_at: string | null;
}

/** A briefing surfaced on NowPanel. */
export interface NowBriefing {
  id: string;
  kind: string;
  headline: string;
  body: string | null;
  priority: number;
  scheduled_for: string;
  evidence: unknown[];
}

/** A reflection / journal entry surfaced as "what changed since last visit". */
export interface NowJournalEntry {
  id: string;
  kind: string;
  summary: string;
  created_at: string;
}

/** Aggregated NowPanel payload — single hook output. */
export interface NowSnapshot {
  loading: boolean;
  error: Error | null;
  worldModel: WorldModelSnapshot;
  activeMission: NowMission | null;
  briefings: NowBriefing[];
  journal: NowJournalEntry[];
  generatedAt: number;
}

/** A single follow-through item in the unified action queue. */
export interface JarvisActionItem {
  /** Stable composite key: `${source}:${id}`. */
  key: string;
  source: JarvisItemSource;
  id: string;
  title: string;
  summary: string;
  advisorId: string | null;
  domain: string;
  /** 0..1 — when source has no confidence we surface null so UI shows "—". */
  confidence: number | null;
  /** "low" | "medium" | "high" | null. */
  risk: "low" | "medium" | "high" | null;
  reversible: boolean | null;
  requiresApproval: boolean;
  status: string;
  createdAt: string;
  /** Optional payload for the explanation panel. */
  raw: Record<string, unknown>;
}

/** A single item in the unified timeline (chronological feed). */
export interface JarvisTimelineItem {
  key: string;
  source: JarvisItemSource;
  id: string;
  title: string;
  summary: string;
  ts: string;
  icon: "episode" | "perception" | "action" | "receipt" | "journal";
  raw: Record<string, unknown>;
}

/** Full explanation payload for any selected JarvisActionItem. */
export interface JarvisExplanation {
  item: JarvisActionItem;
  /** Persona boundary entry from advisor-persona-boundary-map. */
  persona: {
    advisorId: string;
    role: string;
    fenced: string[];
  } | null;
  /** Confidence gate evaluation result. */
  confidence: {
    score: number | null;
    gate: "auto" | "approval" | "block" | "unknown";
  };
  /** Reversibility assessment. */
  reversibility: {
    reversible: boolean | null;
    rollbackEligible: boolean;
  };
  /** Council pre-vote rows for this plan, if any. */
  councilVotes: Array<{
    advisorId: string;
    vote: "consensus" | "dissent" | "abstain" | string;
    score: number;
    rationale: string | null;
  }>;
  /** Linked memory snippets that informed the recommendation. */
  memories: Array<{ id: string; content: string; created_at: string }>;
  /** Plan steps if this item is a plan / has linked plan. */
  steps: Array<{ id: string; summary: string; risk: string; reversible: boolean }>;
}