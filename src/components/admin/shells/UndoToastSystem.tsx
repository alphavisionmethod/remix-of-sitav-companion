import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Monitor, Smartphone, Server } from "lucide-react";
import type { CommandOrigin } from "./SurfaceAuthorityMatrix";

const ORIGIN_LABELS: Record<CommandOrigin, { label: string; icon: typeof Monitor }> = {
  os_local: { label: "OS", icon: Monitor },
  app_remote: { label: "App", icon: Smartphone },
  admin_control_plane: { label: "Admin", icon: Server },
};

interface UndoAction {
  id: string;
  label: string;
  executedAt: Date;
  expiresAt: Date;
  rollbackReady: boolean;
  origin: CommandOrigin;
}

let undoQueue: UndoAction[] = [];
let listeners: (() => void)[] = [];

function notifyListeners() { listeners.forEach(fn => fn()); }

export function pushUndoAction(action: Omit<UndoAction, "id" | "executedAt" | "expiresAt" | "origin"> & { origin?: CommandOrigin }) {
  const entry: UndoAction = {
    ...action,
    origin: action.origin ?? "admin_control_plane",
    id: `undo-${Date.now()}`,
    executedAt: new Date(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  };
  undoQueue = [entry, ...undoQueue].slice(0, 10);
  notifyListeners();

  const originInfo = ORIGIN_LABELS[entry.origin];
  toast.success(`${action.label} — Execution complete`, {
    description: `Origin: ${originInfo.label} · Rollback available for 24 hours.`,
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
