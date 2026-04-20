// ═══════════════════════════════════════════════════════════════
// SITA OS — Advisor Debate Orchestrator
// Rules for cross-advisor debate, consensus, and conflict.
// ═══════════════════════════════════════════════════════════════

export type DebateOutcome = "consensus" | "majority" | "dissent-recorded" | "escalated-to-owner" | "tiebreaker-by-strategy";

export interface DebateRound {
  readonly topic: string;
  readonly participants: readonly string[];
  readonly positions: readonly { advisorId: string; stance: "support" | "oppose" | "neutral"; confidence: number; rationale: string }[];
  readonly outcome: DebateOutcome;
  readonly resolvedBy?: string;
}

export interface DebatePolicy {
  readonly minParticipants: number;
  readonly consensusThreshold: number;   // fraction needed for consensus (e.g. 0.75)
  readonly majorityThreshold: number;    // fraction for majority (e.g. 0.5)
  readonly maxRounds: number;
  readonly tiebreakerAdvisor: string;
  readonly escalateOnDissent: boolean;
  readonly recordDissent: boolean;
}

export const DEFAULT_DEBATE_POLICY: DebatePolicy = {
  minParticipants: 2,
  consensusThreshold: 0.75,
  majorityThreshold: 0.5,
  maxRounds: 3,
  tiebreakerAdvisor: "strategy-advisor",
  escalateOnDissent: true,
  recordDissent: true,
};

export function resolveDebate(positions: DebateRound["positions"], policy: DebatePolicy = DEFAULT_DEBATE_POLICY): DebateOutcome {
  const total = positions.length;
  if (total < policy.minParticipants) return "escalated-to-owner";

  const supporters = positions.filter((p) => p.stance === "support").length;
  const supportRatio = supporters / total;

  if (supportRatio >= policy.consensusThreshold) return "consensus";
  if (supportRatio >= policy.majorityThreshold) return "majority";

  const opposers = positions.filter((p) => p.stance === "oppose").length;
  if (opposers === supporters) return "tiebreaker-by-strategy";

  if (policy.escalateOnDissent) return "escalated-to-owner";
  return "dissent-recorded";
}