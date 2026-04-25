import { motion } from "framer-motion";
import { Sparkles, Send, Eye, X } from "lucide-react";
import { GlassCard } from "@/components/sita/PremiumPageComponents";
import { useState } from "react";

export interface PreparedAction {
  id: string;
  title: string;
  description: string;
  type: "draft" | "reminder" | "suggestion" | "automation";
  confidence: number;
  onPreview?: () => void;
  onApprove?: () => void;
  onDismiss?: () => void;
}

const typeConfig = {
  draft: { label: "Draft", bg: "bg-primary/10 text-primary" },
  reminder: { label: "Reminder", bg: "bg-amber-500/10 text-amber-500" },
  suggestion: { label: "Suggestion", bg: "bg-chart-2/10 text-chart-2" },
  automation: { label: "Auto", bg: "bg-accent/10 text-accent" },
};

export const PreparedActions = ({ actions }: { actions: PreparedAction[] }) => {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const visible = actions.filter((a) => !dismissed.has(a.id));

  if (visible.length === 0) return null;

  return (
    <GlassCard glow="primary" intensity="subtle" className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-4 w-4 text-primary" />
        <p className="text-xs font-semibold text-foreground">Prepared for You</p>
        <span className="text-[10px] text-muted-foreground">AI-ready actions</span>
      </div>
      <div className="space-y-2">
        {visible.map((action, i) => {
          const cfg = typeConfig[action.type];
          return (
            <motion.div
              key={action.id}
              className="flex items-start gap-3 rounded-xl border border-border/20 bg-secondary/20 px-3 py-2.5"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[9px] font-semibold rounded-full px-1.5 py-0.5 ${cfg.bg}`}>
                    {cfg.label}
                  </span>
                  <span className="text-[9px] text-muted-foreground">
                    {Math.round(action.confidence * 100)}% match
                  </span>
                </div>
                <p className="text-[11px] font-medium text-foreground">{action.title}</p>
                <p className="text-[9px] text-muted-foreground mt-0.5">{action.description}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={action.onPreview}
                  className="rounded-lg p-1.5 hover:bg-secondary/50 transition-colors"
                  title="Preview"
                >
                  <Eye className="h-3 w-3 text-muted-foreground" />
                </button>
                <button
                  onClick={action.onApprove}
                  className="rounded-lg p-1.5 hover:bg-primary/10 transition-colors"
                  title="Approve"
                >
                  <Send className="h-3 w-3 text-primary" />
                </button>
                <button
                  onClick={() => setDismissed((s) => new Set(s).add(action.id))}
                  className="rounded-lg p-1.5 hover:bg-destructive/10 transition-colors"
                  title="Dismiss"
                >
                  <X className="h-3 w-3 text-muted-foreground" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </GlassCard>
  );
};
