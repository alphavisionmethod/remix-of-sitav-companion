// ═══════════════════════════════════════════════════════════════
// SITA OS — Contextual Empty State Component
// Domain-specific empty states with smart suggestions
// ═══════════════════════════════════════════════════════════════

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { ContextualEmptyStateConfig } from "@/lib/ux-trust/contextual-empty-states";
import { cn } from "@/lib/utils";

interface ContextualEmptyStateProps {
  config: ContextualEmptyStateConfig;
  className?: string;
}

export function ContextualEmptyState({ config, className }: ContextualEmptyStateProps) {
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={cn(
        "flex flex-col items-center justify-center text-center py-16 px-6 rounded-2xl border border-dashed border-border/50 bg-card/30",
        className
      )}
    >
      <div className="rounded-2xl bg-primary/5 p-4 mb-5">
        <Icon className="h-10 w-10 text-primary/60" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{config.title}</h3>
      <p className="text-sm text-muted-foreground max-w-md mb-4">{config.description}</p>
      <p className="text-xs text-muted-foreground/70 italic mb-6">💡 {config.tip}</p>
      {config.actions.length > 0 && (
        <div className="flex flex-wrap gap-3 justify-center">
          {config.actions.map((action) => (
            <Link
              key={action.to}
              to={action.to}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20 transition-colors"
            >
              {action.label} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          ))}
        </div>
      )}
    </motion.div>
  );
}
