// ═══════════════════════════════════════════════════════════════
// SITA OS — Advisor Reversibility Map
// Classifies each advisor action type as reversible/irreversible.
// ═══════════════════════════════════════════════════════════════

export type ReversibilityClass = "fully-reversible" | "partially-reversible" | "irreversible" | "time-limited";

export interface ReversibilityEntry {
  actionType: string;
  reversibility: ReversibilityClass;
  undoMechanism: string | null;
  undoWindowMs: number | null;
  dataLossOnUndo: boolean;
  requiresConfirmation: boolean;
}

export const REVERSIBILITY_MAP: readonly ReversibilityEntry[] = [
  { actionType: "draft-email", reversibility: "fully-reversible", undoMechanism: "Delete draft", undoWindowMs: null, dataLossOnUndo: false, requiresConfirmation: false },
  { actionType: "draft-recommendation", reversibility: "fully-reversible", undoMechanism: "Discard recommendation", undoWindowMs: null, dataLossOnUndo: false, requiresConfirmation: false },
  { actionType: "schedule-meeting", reversibility: "fully-reversible", undoMechanism: "Cancel meeting", undoWindowMs: null, dataLossOnUndo: false, requiresConfirmation: false },
  { actionType: "update-crm-field", reversibility: "fully-reversible", undoMechanism: "Revert to previous value", undoWindowMs: null, dataLossOnUndo: false, requiresConfirmation: false },
  { actionType: "send-email", reversibility: "time-limited", undoMechanism: "Recall (if within window)", undoWindowMs: 30_000, dataLossOnUndo: false, requiresConfirmation: true },
  { actionType: "send-notification", reversibility: "irreversible", undoMechanism: null, undoWindowMs: null, dataLossOnUndo: false, requiresConfirmation: true },
  { actionType: "execute-payment", reversibility: "partially-reversible", undoMechanism: "Refund request", undoWindowMs: null, dataLossOnUndo: false, requiresConfirmation: true },
  { actionType: "create-invoice", reversibility: "fully-reversible", undoMechanism: "Void invoice", undoWindowMs: null, dataLossOnUndo: false, requiresConfirmation: false },
  { actionType: "delete-record", reversibility: "time-limited", undoMechanism: "Restore from soft-delete", undoWindowMs: 7 * 24 * 60 * 60 * 1000, dataLossOnUndo: false, requiresConfirmation: true },
  { actionType: "archive-record", reversibility: "fully-reversible", undoMechanism: "Unarchive", undoWindowMs: null, dataLossOnUndo: false, requiresConfirmation: false },
  { actionType: "change-permission", reversibility: "fully-reversible", undoMechanism: "Revert permission", undoWindowMs: null, dataLossOnUndo: false, requiresConfirmation: true },
  { actionType: "toggle-kill-switch", reversibility: "fully-reversible", undoMechanism: "Toggle back", undoWindowMs: null, dataLossOnUndo: false, requiresConfirmation: true },
] as const;

export function getReversibility(actionType: string): ReversibilityEntry | undefined {
  return REVERSIBILITY_MAP.find((e) => e.actionType === actionType);
}

export function isReversible(actionType: string): boolean {
  const entry = getReversibility(actionType);
  return entry?.reversibility !== "irreversible";
}

export function getIrreversibleActions(): ReversibilityEntry[] {
  return REVERSIBILITY_MAP.filter((e) => e.reversibility === "irreversible");
}