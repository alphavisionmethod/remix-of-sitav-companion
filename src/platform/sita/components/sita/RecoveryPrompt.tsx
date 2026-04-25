// ═══════════════════════════════════════════════════════════════
// SITA OS — Recovery Prompt
// Detects interrupted flows and offers to resume
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { RotateCcw, X, FileText, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface RecoverableItem {
  id: string;
  type: "draft" | "upload" | "workflow" | "session";
  label: string;
  description?: string;
  savedAt: Date;
  onResume: () => void;
}

interface RecoveryPromptProps {
  items: RecoverableItem[];
  onDismissAll?: () => void;
  className?: string;
}

const TYPE_ICONS = {
  draft: FileText,
  upload: ArrowRight,
  workflow: RotateCcw,
  session: RotateCcw,
} as const;

const TYPE_LABELS = {
  draft: "Unsaved draft",
  upload: "Interrupted upload",
  workflow: "Incomplete workflow",
  session: "Previous session",
} as const;

export function RecoveryPrompt({ items, onDismissAll, className }: RecoveryPromptProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (items.length > 0 && dismissed.size < items.length) {
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
    setVisible(false);
  }, [items.length, dismissed.size]);

  const dismissItem = useCallback((id: string) => {
    setDismissed(prev => new Set(prev).add(id));
  }, []);

  const dismissAll = useCallback(() => {
    setDismissed(new Set(items.map(i => i.id)));
    onDismissAll?.();
  }, [items, onDismissAll]);

  const activeItems = items.filter(i => !dismissed.has(i.id));
  if (!visible || activeItems.length === 0) return null;

  return (
    <div
      className={cn(
        "fixed bottom-20 right-4 z-40 w-80 rounded-lg border border-border/60 bg-background/95 backdrop-blur-md shadow-lg",
        "animate-in slide-in-from-bottom-4 fade-in duration-300",
        className
      )}
      role="complementary"
      aria-label="Continue where you left off"
    >
      <div className="flex items-center justify-between px-3 py-2 border-b border-border/30">
        <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
          <RotateCcw className="h-3.5 w-3.5 text-sita-purple" />
          Continue where you left off
        </span>
        <button onClick={dismissAll} className="text-muted-foreground hover:text-foreground p-0.5 transition-colors">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="p-2 space-y-1 max-h-48 overflow-y-auto">
        {activeItems.map(item => {
          const Icon = TYPE_ICONS[item.type];
          const ageMs = Date.now() - item.savedAt.getTime();
          const ageLabel = ageMs < 3600000 ? `${Math.round(ageMs / 60000)}m ago` : `${Math.round(ageMs / 3600000)}h ago`;

          return (
            <div
              key={item.id}
              className="flex items-center gap-2 p-2 rounded-md hover:bg-accent/40 transition-colors group"
            >
              <div className="rounded bg-muted/50 p-1.5 shrink-0">
                <Icon className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{item.label}</p>
                <p className="text-[10px] text-muted-foreground">
                  {TYPE_LABELS[item.type]} · {ageLabel}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button size="sm" variant="ghost" className="h-6 px-2 text-[10px]" onClick={() => item.onResume()}>
                  Resume
                </Button>
                <button onClick={() => dismissItem(item.id)} className="p-0.5 text-muted-foreground hover:text-foreground">
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
