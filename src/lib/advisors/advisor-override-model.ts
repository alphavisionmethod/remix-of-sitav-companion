// ═══════════════════════════════════════════════════════════════
// SITA OS — Advisor Operator Override Model
// Rules for how operators can override advisor behavior.
// ═══════════════════════════════════════════════════════════════

export type OverrideScope = "pause" | "disable" | "force-escalate" | "reduce-autonomy" | "reset-trust" | "clear-memory" | "force-reevaluate";

export interface OverrideAction {
  readonly scope: OverrideScope;
  readonly description: string;
  readonly requiresJustification: boolean;
  readonly requiresDualApproval: boolean;
  readonly emitsAuditLog: boolean;
  readonly reversible: boolean;
}

export const OVERRIDE_ACTIONS: readonly OverrideAction[] = [
  { scope: "pause", description: "Temporarily pause advisor from producing recommendations", requiresJustification: true, requiresDualApproval: false, emitsAuditLog: true, reversible: true },
  { scope: "disable", description: "Fully disable advisor, rerouting to fallback", requiresJustification: true, requiresDualApproval: true, emitsAuditLog: true, reversible: true },
  { scope: "force-escalate", description: "Force all advisor outputs to require human approval", requiresJustification: true, requiresDualApproval: false, emitsAuditLog: true, reversible: true },
  { scope: "reduce-autonomy", description: "Lower advisor autonomy level by one rung", requiresJustification: true, requiresDualApproval: false, emitsAuditLog: true, reversible: true },
  { scope: "reset-trust", description: "Reset advisor trust score to baseline", requiresJustification: true, requiresDualApproval: true, emitsAuditLog: true, reversible: false },
  { scope: "clear-memory", description: "Clear all advisor working and short-term memory", requiresJustification: true, requiresDualApproval: true, emitsAuditLog: true, reversible: false },
  { scope: "force-reevaluate", description: "Force advisor to re-evaluate pending recommendations", requiresJustification: false, requiresDualApproval: false, emitsAuditLog: true, reversible: true },
];

export function getOverrideAction(scope: OverrideScope): OverrideAction {
  return OVERRIDE_ACTIONS.find((a) => a.scope === scope) ?? OVERRIDE_ACTIONS[0];
}

export function requiresDualApproval(scope: OverrideScope): boolean {
  return getOverrideAction(scope).requiresDualApproval;
}