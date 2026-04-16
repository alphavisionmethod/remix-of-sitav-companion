// ═══════════════════════════════════════════════════════════════
// SITA OS — Undoable Action Hook
// Wraps destructive mutations with configurable undo delay
// ═══════════════════════════════════════════════════════════════

import { useCallback, useRef } from "react";
import { toast } from "sonner";

export interface UseUndoableActionOptions {
  /** Delay in ms before executing (default: 5000) */
  delayMs?: number;
  /** Toast label shown during countdown */
  label: string;
  /** Called when the action is actually executed */
  onExecute: () => void | Promise<void>;
  /** Called when user clicks Undo */
  onUndo?: () => void;
  /** Suppress toast (for testing) */
  silent?: boolean;
}

export function useUndoableAction(options: UseUndoableActionOptions) {
  const { delayMs = 5000, label, onExecute, onUndo, silent } = options;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelledRef = useRef(false);

  const execute = useCallback(() => {
    cancelledRef.current = false;

    timerRef.current = setTimeout(async () => {
      if (!cancelledRef.current) {
        try {
          await onExecute();
        } catch (err) {
          if (!silent) {
            toast.error(`Failed: ${label}`, {
              description: err instanceof Error ? err.message : "An error occurred",
            });
          }
        }
      }
    }, delayMs);

    if (!silent) {
      toast(label, {
        description: `Will execute in ${Math.round(delayMs / 1000)}s`,
        duration: delayMs + 500,
        action: {
          label: "Undo",
          onClick: () => {
            cancelledRef.current = true;
            if (timerRef.current) clearTimeout(timerRef.current);
            onUndo?.();
            toast.info(`Undone: ${label}`, { description: "Action cancelled." });
          },
        },
      });
    }
  }, [delayMs, label, onExecute, onUndo, silent]);

  const cancel = useCallback(() => {
    cancelledRef.current = true;
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  return { execute, cancel };
}
