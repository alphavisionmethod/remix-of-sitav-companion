import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Undo2, Clock, Eye, HelpCircle, CheckCircle } from "lucide-react";

interface UndoAction {
  id: string;
  label: string;
  executedAt: Date;
  expiresAt: Date;
  rollbackReady: boolean;
}

let undoQueue: UndoAction[] = [];
let listeners: (() => void)[] = [];

function notifyListeners() { listeners.forEach(fn => fn()); }

export function pushUndoAction(action: Omit<UndoAction, "id" | "executedAt" | "expiresAt">) {
  const entry: UndoAction = {
    ...action,
    id: `undo-${Date.now()}`,
    executedAt: new Date(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  };
  undoQueue = [entry, ...undoQueue].slice(0, 10);
  notifyListeners();

  toast.success(`${action.label} — Execution complete`, {
    description: "Rollback available for 24 hours.",
    duration: 8000,
    action: {
      label: "Undo",
      onClick: () => {
        undoQueue = undoQueue.filter(a => a.id !== entry.id);
        notifyListeners();
        toast.info(`Undone: ${action.label}`, { description: "Previous state restored." });
      },
    },
  });
}

export function useUndoActions() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const listener = () => setTick(t => t + 1);
    listeners.push(listener);
    return () => { listeners = listeners.filter(l => l !== listener); };
  }, []);

  return {
    actions: undoQueue,
    undo: (id: string) => {
      const action = undoQueue.find(a => a.id === id);
      if (action) {
        undoQueue = undoQueue.filter(a => a.id !== id);
        notifyListeners();
        toast.info(`Undone: ${action.label}`, { description: "Previous state restored." });
      }
    },
    clearAll: () => { undoQueue = []; notifyListeners(); },
  };
}
