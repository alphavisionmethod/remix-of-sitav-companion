// ═══════════════════════════════════════════════════════════════
// SITA OS — Plan Proposers (Phase 2)
// Pure mapping: signal → candidate plan. The controller calls
// `proposeForSignal(advisorId, signal)` to get a ProposedPlan,
// which is then evaluated by the dry-run gate.
//
// All plans declare their reversibility, risk class, and rollback
// strategy up-front so the dry-run gate can enforce the L3 ceiling
// (execute reversible only — irreversible always needs approval).
// ═══════════════════════════════════════════════════════════════

import { SIGNAL_KINDS, type OSStateSignal } from "./signal-bus";

export type PlanRiskClass = "reversible_safe" | "reversible_risky" | "irreversible";

export type ProposedPlan = {
  /** Action key — matches admin_safety_actions.action_key when present. */
  actionKey: string;
  /** Human-readable summary shown in approval surfaces. */
  summary: string;
  /** Domain (cash, inbox, calendar, ops, marketing, people, strategy). */
  domain: string;
  /** Risk classification for the dry-run gate. */
  riskClass: PlanRiskClass;
  /** Confidence the controller has in this plan (0-1). */
  confidence: number;
  /** Estimated financial impact in cents (0 if non-financial). */
  financialImpactCents: number;
  /** Whether this action exposes anything client-facing (email send, post, etc). */
  isClientFacing: boolean;
  /** Structured params handed to the executor. */
  payload: Record<string, unknown>;
  /** Rollback descriptor — required when riskClass !== "irreversible". */
  rollback: {
    strategy: "noop" | "delete_queued_record" | "restore_snapshot" | "manual";
    payload?: Record<string, unknown>;
  };
  /** True when this is a "draft only — show me" plan (always reversible). */
  draftOnly: boolean;
};

/** Map a signal to a candidate plan for the given advisor. Returns null if nothing to do. */
export function proposeForSignal(
  advisorId: string,
  signal: OSStateSignal,
): ProposedPlan | null {
  const baseConfidence = severityToConfidence(signal.severity as string);

  switch (signal.signal_kind) {
    case SIGNAL_KINDS.CASH_RUNWAY_DIP:
    case SIGNAL_KINDS.CASH_BURN_SPIKE:
      // Reversible: prepare a burn-review brief in the boardroom queue.
      return {
        actionKey: "cfo.draft_burn_review",
        summary: "Draft a burn-review brief for the next boardroom session.",
        domain: "finance",
        riskClass: "reversible_safe",
        confidence: baseConfidence,
        financialImpactCents: 0,
        isClientFacing: false,
        payload: { signal_id: signal.id, kind: signal.signal_kind },
        rollback: { strategy: "delete_queued_record" },
        draftOnly: true,
      };

    case SIGNAL_KINDS.AR_OVERDUE_SPIKE:
      // Drafting reminders is reversible; sending them is irreversible.
      return {
        actionKey: "cfo.draft_ar_reminders",
        summary: "Draft (do not send) AR reminder emails for overdue invoices.",
        domain: "finance",
        riskClass: "reversible_safe",
        confidence: baseConfidence,
        financialImpactCents: 0,
        isClientFacing: false,
        payload: { signal_id: signal.id },
        rollback: { strategy: "delete_queued_record" },
        draftOnly: true,
      };

    case SIGNAL_KINDS.INBOX_BACKLOG_SPIKE:
      return {
        actionKey: "concierge.triage_inbox",
        summary: "Triage inbox backlog into priority buckets (no replies sent).",
        domain: "concierge",
        riskClass: "reversible_safe",
        confidence: baseConfidence,
        financialImpactCents: 0,
        isClientFacing: false,
        payload: { signal_id: signal.id },
        rollback: { strategy: "noop" },
        draftOnly: true,
      };

    case SIGNAL_KINDS.INBOX_VIP_UNANSWERED:
      // Drafting is reversible; sending requires approval.
      return {
        actionKey: "concierge.draft_vip_replies",
        summary: "Draft replies to VIP messages awaiting response.",
        domain: "concierge",
        riskClass: "reversible_safe",
        confidence: baseConfidence,
        financialImpactCents: 0,
        isClientFacing: false,
        payload: { signal_id: signal.id },
        rollback: { strategy: "delete_queued_record" },
        draftOnly: true,
      };

    case SIGNAL_KINDS.CALENDAR_CONFLICT:
      // Proposing a resolution is reversible; actually rescheduling touches client comms.
      return {
        actionKey: "concierge.resolve_calendar_conflict",
        summary: "Propose calendar conflict resolution options.",
        domain: "concierge",
        riskClass: "reversible_safe",
        confidence: baseConfidence,
        financialImpactCents: 0,
        isClientFacing: false,
        payload: { signal_id: signal.id },
        rollback: { strategy: "noop" },
        draftOnly: true,
      };

    case SIGNAL_KINDS.CALENDAR_PREP_GAP:
      return {
        actionKey: "concierge.draft_prep_notes",
        summary: "Draft prep notes for upcoming meetings missing context.",
        domain: "concierge",
        riskClass: "reversible_safe",
        confidence: baseConfidence,
        financialImpactCents: 0,
        isClientFacing: false,
        payload: { signal_id: signal.id },
        rollback: { strategy: "delete_queued_record" },
        draftOnly: true,
      };

    case SIGNAL_KINDS.CAMPAIGN_UNDERPERFORMING:
      return {
        actionKey: "cmo.draft_campaign_review",
        summary: "Draft a campaign performance review with recommended changes.",
        domain: "marketing",
        riskClass: "reversible_safe",
        confidence: baseConfidence,
        financialImpactCents: 0,
        isClientFacing: false,
        payload: { signal_id: signal.id },
        rollback: { strategy: "delete_queued_record" },
        draftOnly: true,
      };

    case SIGNAL_KINDS.GOAL_DRIFT:
      return {
        actionKey: "ceo.draft_goal_realignment",
        summary: "Draft a goal-realignment memo for the next board cycle.",
        domain: "strategy",
        riskClass: "reversible_safe",
        confidence: Math.min(baseConfidence, 0.7),
        financialImpactCents: 0,
        isClientFacing: false,
        payload: { signal_id: signal.id },
        rollback: { strategy: "delete_queued_record" },
        draftOnly: true,
      };

    default:
      // Unknown signal kind for this advisor — no plan.
      void advisorId;
      return null;
  }
}

function severityToConfidence(severity: string): number {
  switch (severity) {
    case "critical":
      return 0.9;
    case "high":
      return 0.8;
    case "medium":
      return 0.7;
    case "low":
      return 0.6;
    default:
      return 0.5;
  }
}