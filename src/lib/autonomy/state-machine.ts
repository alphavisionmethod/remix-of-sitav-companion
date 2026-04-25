// ═══════════════════════════════════════════════════════════════
// SITA OS — Advisor Autonomy State Machine (Phase 2)
// Pure transition logic for the per-advisor controller. The DB row
// `advisor_autonomy_state.current_state` is the persisted truth;
// this module owns the legal transitions + guards.
//
// States:
//   idle             — no pending signal; controller will scan
//   observing        — saw a signal, gathering context
//   proposing        — generating a candidate plan
//   dry_run          — plan generated, validating against L3 ceiling
//   awaiting_approval— irreversible/over-budget; queued for human
//   executing        — reversible plan running
//   cooling_down     — post-execute backoff
//   circuit_open     — too many failures; halted until breaker resets
// ═══════════════════════════════════════════════════════════════

export type AdvisorState =
  | "idle"
  | "observing"
  | "proposing"
  | "dry_run"
  | "awaiting_approval"
  | "executing"
  | "cooling_down"
  | "circuit_open";

const LEGAL: Record<AdvisorState, AdvisorState[]> = {
  idle: ["observing", "circuit_open"],
  observing: ["proposing", "idle", "circuit_open"],
  proposing: ["dry_run", "idle", "circuit_open"],
  dry_run: ["awaiting_approval", "executing", "idle", "circuit_open"],
  awaiting_approval: ["executing", "idle", "cooling_down"],
  executing: ["cooling_down", "circuit_open"],
  cooling_down: ["idle", "circuit_open"],
  circuit_open: ["idle"],
};

export function canTransition(from: AdvisorState, to: AdvisorState): boolean {
  return LEGAL[from]?.includes(to) ?? false;
}

/** Maximum failures before the breaker opens. */
export const FAILURE_THRESHOLD = 3;
/** Cool-down after a successful execution (ms). */
export const COOLDOWN_AFTER_EXECUTE_MS = 5 * 60 * 1000;
/** Breaker open duration (ms). */
export const CIRCUIT_OPEN_DURATION_MS = 30 * 60 * 1000;

export function nextStateOnFailure(
  current: AdvisorState,
  consecutiveFailures: number,
): { state: AdvisorState; openUntil?: string } {
  if (consecutiveFailures + 1 >= FAILURE_THRESHOLD) {
    return {
      state: "circuit_open",
      openUntil: new Date(Date.now() + CIRCUIT_OPEN_DURATION_MS).toISOString(),
    };
  }
  return { state: "cooling_down" };
}