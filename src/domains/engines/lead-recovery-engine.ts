// ═══════════════════════════════════════════════════════════════
// SITA OS — Lead Recovery Engine
// Pure stateless engine for recovery scoring, classification,
// queue assignment, and path recommendation
//
// PURITY:
//   ✅ Pure computation — no I/O or side effects
//   ✅ No embedded fixtures — demo rows live in
//      `src/data/fixtures/mock-data/recovery-candidates.ts`
//   ✅ Canonical contracts re-exported from `@/domains/business`
// ═══════════════════════════════════════════════════════════════

import type {
  FailureMode,
  RecoveryPath,
  SuccessBand,
  UrgencyLevel,
  RelationshipSensitivity,
  RecoveryQueueDef,
  RecoveryTimelineEvent,
  RecoveryCandidate,
} from "@/domains/business";

// Re-export canonical contracts so existing import paths
// (`from "@/domains/engines/lead-recovery-engine"`) keep working.
// Source of truth lives in `@/domains/business`.
export type {
  FailureMode,
  RecoveryPath,
  SuccessBand,
  UrgencyLevel,
  RelationshipSensitivity,
  RecoveryQueueDef,
  RecoveryTimelineEvent,
  RecoveryCandidate,
};

export const FAILURE_MODE_META: Record<FailureMode, { label: string; icon: string; color: string }> = {
  no_response:            { label: "No Response",            icon: "mail-x",        color: "hsl(0 70% 55%)" },
  missed_followup:        { label: "Missed Follow-up",       icon: "clock",         color: "hsl(38 85% 58%)" },
  quote_abandoned:        { label: "Quote Abandoned",        icon: "file-x",        color: "hsl(0 70% 55%)" },
  lost_momentum:          { label: "Lost Momentum",          icon: "trending-down",  color: "hsl(38 85% 58%)" },
  owner_dropped:          { label: "Owner Dropped",          icon: "user-x",        color: "hsl(0 70% 55%)" },
  appointment_incomplete: { label: "Appointment Missed",     icon: "calendar-x",    color: "hsl(38 85% 58%)" },
  post_consult_drift:     { label: "Post-Consult Drift",     icon: "git-branch",    color: "hsl(265 55% 58%)" },
  handoff_failure:        { label: "Handoff Failure",        icon: "arrow-right-left", color: "hsl(0 70% 55%)" },
  silent_high_value:      { label: "Silent High-Value",      icon: "volume-x",      color: "hsl(38 85% 58%)" },
  callback_missed:        { label: "Callback Missed",        icon: "phone-missed",  color: "hsl(0 70% 55%)" },
};

export const RECOVERY_PATH_META: Record<RecoveryPath, { label: string; tone: string; description: string }> = {
  soft_reactivation:    { label: "Soft Reactivation",    tone: "Warm & Low-Pressure",    description: "Gentle re-entry for quiet leads that may still be interested" },
  direct_rescue:        { label: "Direct Rescue",        tone: "Professional & Direct",  description: "Immediate follow-up for simply missed actions" },
  quote_rescue:         { label: "Quote Rescue",         tone: "Value-Focused",          description: "Re-engage around the proposal with updated context" },
  consult_reactivation: { label: "Consult Reactivation", tone: "Helpful & Flexible",     description: "Rebook missed or incomplete consultation" },
  relationship_repair:  { label: "Relationship Repair",  tone: "Empathetic & Careful",   description: "Address damage from delays or owner errors" },
  reassignment:         { label: "Reassignment",         tone: "Fresh Start",            description: "Transfer to a more responsive owner" },
  strategic_rescue:     { label: "Strategic Rescue",      tone: "Senior & High-Touch",   description: "Escalate for founder or boardroom visibility" },
};

export const SUCCESS_BAND_META: Record<SuccessBand, { label: string; color: string }> = {
  strong:    { label: "Strong Chance",         color: "hsl(152 55% 48%)" },
  moderate:  { label: "Moderate Chance",        color: "hsl(38 85% 58%)" },
  uncertain: { label: "Uncertain — Worth Try",  color: "hsl(265 55% 58%)" },
  low:       { label: "Low Chance",             color: "hsl(0 70% 55%)" },
  archive:   { label: "Archive Likely",         color: "hsl(0 0% 40%)" },
};

export const RECOVERY_QUEUES: RecoveryQueueDef[] = [
  { key: "all",                   label: "All Recovery",         failureModes: [],                                                  icon: "layers" },
  { key: "no_response",           label: "No Response",          failureModes: ["no_response"],                                     icon: "mail-x" },
  { key: "missed_followup",       label: "Missed Follow-up",     failureModes: ["missed_followup"],                                 icon: "clock" },
  { key: "quote_abandoned",       label: "Quote Abandoned",      failureModes: ["quote_abandoned"],                                 icon: "file-x" },
  { key: "lost_momentum",         label: "Lost Momentum",        failureModes: ["lost_momentum"],                                   icon: "trending-down" },
  { key: "owner_dropped",         label: "Owner Dropped",        failureModes: ["owner_dropped"],                                   icon: "user-x" },
  { key: "appointment_incomplete", label: "Appointment Missed",  failureModes: ["appointment_incomplete"],                           icon: "calendar-x" },
  { key: "post_consult_drift",    label: "Post-Consult Drift",   failureModes: ["post_consult_drift"],                              icon: "git-branch" },
  { key: "handoff_failure",       label: "Handoff Failure",      failureModes: ["handoff_failure"],                                  icon: "arrow-right-left" },
  { key: "silent_high_value",     label: "Silent High-Value",    failureModes: ["silent_high_value"],                                icon: "volume-x" },
  { key: "callback_missed",       label: "Callback Missed",      failureModes: ["callback_missed"],                                  icon: "phone-missed" },
  { key: "winback",               label: "Winback / Reactivation", failureModes: ["no_response", "lost_momentum", "silent_high_value"], icon: "rotate-ccw" },
  { key: "strategic",             label: "Strategic Recovery",    failureModes: ["silent_high_value", "owner_dropped", "handoff_failure"], icon: "crown" },
];

// ── Scoring Functions ──────────────────────────────────────────
export function computeRecoveryScore(c: Pick<RecoveryCandidate, "daysSinceLastAction" | "dealSize" | "failureMode" | "stageAtSlip">): number {
  let score = 50;
  // Recency boost
  if (c.daysSinceLastAction <= 7) score += 25;
  else if (c.daysSinceLastAction <= 21) score += 15;
  else if (c.daysSinceLastAction <= 45) score += 5;
  else score -= 10;
  // Value boost
  if (c.dealSize >= 20000) score += 15;
  else if (c.dealSize >= 8000) score += 8;
  // Failure penalty
  if (c.failureMode === "owner_dropped" || c.failureMode === "handoff_failure") score -= 5;
  if (c.failureMode === "silent_high_value") score += 10;
  // Stage boost
  if (c.stageAtSlip === "Proposal Sent" || c.stageAtSlip === "Negotiation") score += 10;
  return Math.max(0, Math.min(100, score));
}

export function computeSuccessBand(score: number): SuccessBand {
  if (score >= 80) return "strong";
  if (score >= 60) return "moderate";
  if (score >= 40) return "uncertain";
  if (score >= 20) return "low";
  return "archive";
}

export function computeUrgency(days: number, value: number): UrgencyLevel {
  if (days <= 7 || value >= 15000) return "act_today";
  if (days <= 21) return "this_week";
  return "flexible";
}

export function recommendPath(mode: FailureMode): RecoveryPath {
  const map: Record<FailureMode, RecoveryPath> = {
    no_response: "soft_reactivation",
    missed_followup: "direct_rescue",
    quote_abandoned: "quote_rescue",
    lost_momentum: "soft_reactivation",
    owner_dropped: "reassignment",
    appointment_incomplete: "consult_reactivation",
    post_consult_drift: "consult_reactivation",
    handoff_failure: "relationship_repair",
    silent_high_value: "strategic_rescue",
    callback_missed: "direct_rescue",
  };
  return map[mode];
}

export function assignQueue(mode: FailureMode, value: number): string {
  if (value >= 15000 && (mode === "silent_high_value" || mode === "owner_dropped")) return "strategic";
  return mode;
}


// ── Aggregate functions ────────────────────────────────────────
export function getQueueCounts(candidates: RecoveryCandidate[]): Record<string, number> {
  const counts: Record<string, number> = { all: candidates.length };
  for (const q of RECOVERY_QUEUES) {
    if (q.key === "all") continue;
    counts[q.key] = candidates.filter(c => c.queueKey === q.key || q.failureModes.includes(c.failureMode)).length;
  }
  return counts;
}

export function getQueueValueAtRisk(candidates: RecoveryCandidate[]): Record<string, number> {
  const values: Record<string, number> = { all: candidates.reduce((s, c) => s + c.valueAtRisk, 0) };
  for (const q of RECOVERY_QUEUES) {
    if (q.key === "all") continue;
    values[q.key] = candidates.filter(c => c.queueKey === q.key || q.failureModes.includes(c.failureMode)).reduce((s, c) => s + c.valueAtRisk, 0);
  }
  return values;
}

export function getTotalValueAtRisk(candidates: RecoveryCandidate[]): number {
  return candidates.reduce((s, c) => s + c.valueAtRisk, 0);
}

export function getTopPriorityRescues(candidates: RecoveryCandidate[], count = 3): RecoveryCandidate[] {
  return [...candidates].sort((a, b) => {
    const urgencyOrder: Record<UrgencyLevel, number> = { act_today: 0, this_week: 1, flexible: 2 };
    const diff = urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
    if (diff !== 0) return diff;
    return b.recoveryScore - a.recoveryScore;
  }).slice(0, count);
}

export function filterByQueue(candidates: RecoveryCandidate[], queueKey: string): RecoveryCandidate[] {
  if (queueKey === "all") return candidates;
  const qDef = RECOVERY_QUEUES.find(q => q.key === queueKey);
  if (!qDef) return candidates;
  return candidates.filter(c => c.queueKey === queueKey || qDef.failureModes.includes(c.failureMode));
}

export function getRecoveryStats(candidates: RecoveryCandidate[]) {
  const totalValue = getTotalValueAtRisk(candidates);
  const actToday = candidates.filter(c => c.urgency === "act_today").length;
  const strongChance = candidates.filter(c => c.successBand === "strong" || c.successBand === "moderate").length;
  const boardroom = candidates.filter(c => c.boardroomCandidate).length;
  const avgScore = candidates.length ? Math.round(candidates.reduce((s, c) => s + c.recoveryScore, 0) / candidates.length) : 0;
  return { totalValue, actToday, strongChance, boardroom, avgScore, total: candidates.length };
}
