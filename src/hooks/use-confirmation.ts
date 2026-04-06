// ═══════════════════════════════════════════════════════════════
// SITA OS — Confirmation Dialog Hook
// Provides undo/confirm patterns for destructive actions
// ═══════════════════════════════════════════════════════════════

import { useState, useCallback, useRef } from "react";

export interface ConfirmationOptions {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "destructive" | "warning" | "default";
  requireTypedConfirmation?: string; // Must type this text to confirm
}

export interface ConfirmationState extends ConfirmationOptions {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  typedValue: string;
  setTypedValue: (v: string) => void;
}

export function useConfirmation() {
  const [state, setState] = useState<ConfirmationState>({
    isOpen: false,
    title: "",
    description: "",
    onConfirm: () => {},
    onCancel: () => {},
    typedValue: "",
    setTypedValue: () => {},
  });

  const confirm = useCallback((options: ConfirmationOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({
        ...options,
        isOpen: true,
        typedValue: "",
        setTypedValue: (v: string) => setState((prev) => ({ ...prev, typedValue: v })),
        onConfirm: () => {
          setState((prev) => ({ ...prev, isOpen: false }));
          resolve(true);
        },
        onCancel: () => {
          setState((prev) => ({ ...prev, isOpen: false }));
          resolve(false);
        },
      });
    });
  }, []);

  return { confirmation: state, confirm };
}

// ── Undo Pattern ────────────────────────────────────────────

export interface UndoAction {
  id: string;
  label: string;
  undo: () => void;
  expiresAt: number;
}

export function useUndoStack(timeoutMs = 8000) {
  const [actions, setActions] = useState<UndoAction[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const pushUndo = useCallback(
    (label: string, undoFn: () => void) => {
      const id = crypto.randomUUID();
      const action: UndoAction = {
        id,
        label,
        undo: undoFn,
        expiresAt: Date.now() + timeoutMs,
      };
      setActions((prev) => [...prev, action]);

      const timer = setTimeout(() => {
        setActions((prev) => prev.filter((a) => a.id !== id));
        timers.current.delete(id);
      }, timeoutMs);
      timers.current.set(id, timer);

      return id;
    },
    [timeoutMs]
  );

  const executeUndo = useCallback((id: string) => {
    setActions((prev) => {
      const action = prev.find((a) => a.id === id);
      if (action) {
        action.undo();
        const timer = timers.current.get(id);
        if (timer) clearTimeout(timer);
        timers.current.delete(id);
      }
      return prev.filter((a) => a.id !== id);
    });
  }, []);

  const dismissUndo = useCallback((id: string) => {
    const timer = timers.current.get(id);
    if (timer) clearTimeout(timer);
    timers.current.delete(id);
    setActions((prev) => prev.filter((a) => a.id !== id));
  }, []);

  return { undoActions: actions, pushUndo, executeUndo, dismissUndo };
}
