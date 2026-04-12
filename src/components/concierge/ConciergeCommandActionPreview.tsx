import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Terminal, ArrowRight } from "lucide-react";

export interface CommandSuggestion {
  id: string;
  label: string;
  description?: string;
}

export const ConciergeCommandActionPreview = ({ suggestions, onSelect, className }: {
  suggestions: CommandSuggestion[];
  onSelect?: (id: string) => void;
  className?: string;
}) => (
  <motion.div
    className={cn("rounded-2xl border border-border/30 bg-gradient-to-r from-primary/[0.03] to-accent/[0.03] p-4", className)}
    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
  >
    <div className="flex items-center gap-2 mb-3">
      <Terminal className="h-4 w-4 text-primary" />
      <p className="text-xs font-semibold text-foreground">Quick Commands</p>
    </div>
    <div className="flex flex-wrap gap-2">
      {suggestions.map(s => (
        <button
          key={s.id}
          onClick={() => onSelect?.(s.id)}
          className="inline-flex items-center gap-1.5 rounded-full bg-primary/8 hover:bg-primary/15 px-3 py-1.5 text-[11px] font-medium text-primary transition-colors"
          title={s.description}
        >
          {s.label}
          <ArrowRight className="h-3 w-3" />
        </button>
      ))}
    </div>
  </motion.div>
);
