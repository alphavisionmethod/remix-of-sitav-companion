// ═══════════════════════════════════════════════════════════════
// SITA OS — Undo Toast
// Shows undo actions with countdown timer
// ═══════════════════════════════════════════════════════════════

import { AnimatePresence, motion } from "framer-motion";
import { Undo2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { UndoAction } from "@/hooks/use-confirmation";
import { useEffect, useState } from "react";

function UndoItem({ action, onUndo, onDismiss }: { action: UndoAction; onUndo: () => void; onDismiss: () => void }) {
  const [remaining, setRemaining] = useState(Math.max(0, action.expiresAt - Date.now()));

  useEffect(() => {
    const interval = setInterval(() => {
      const r = Math.max(0, action.expiresAt - Date.now());
      setRemaining(r);
      if (r <= 0) clearInterval(interval);
    }, 100);
    return () => clearInterval(interval);
  }, [action.expiresAt]);

  const pct = Math.max(0, remaining / 8000) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      className="relative flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-lg overflow-hidden"
    >
      <div
        className="absolute bottom-0 left-0 h-0.5 bg-primary/50 transition-none"
        style={{ width: `${pct}%` }}
      />
      <p className="flex-1 text-sm text-foreground">{action.label}</p>
      <Button variant="ghost" size="sm" className="text-primary gap-1.5" onClick={onUndo}>
        <Undo2 className="h-3.5 w-3.5" /> Undo
      </Button>
      <button onClick={onDismiss} className="text-muted-foreground hover:text-foreground">
        <X className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  );
}

export function UndoToastStack({
  actions,
  onUndo,
  onDismiss,
}: {
  actions: UndoAction[];
  onUndo: (id: string) => void;
  onDismiss: (id: string) => void;
}) {
  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-full max-w-sm px-4">
      <AnimatePresence>
        {actions.map((action) => (
          <UndoItem
            key={action.id}
            action={action}
            onUndo={() => onUndo(action.id)}
            onDismiss={() => onDismiss(action.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
