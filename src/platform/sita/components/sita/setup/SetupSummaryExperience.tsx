import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";
import { CheckCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface SummaryGroup {
  label: string;
  icon: LucideIcon;
  items: string[];
}

interface SetupSummaryExperienceProps {
  displayName: string;
  groups: SummaryGroup[];
  deferredCount: number;
}

export function SetupSummaryExperience({ displayName, groups, deferredCount }: SetupSummaryExperienceProps) {
  const reduced = useReducedMotion();

  return (
    <div className="space-y-4">
      <motion.div
        initial={reduced ? {} : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <p className="text-lg font-display font-bold text-foreground">
          {displayName ? `${displayName}'s environment` : "Your environment"} is ready
        </p>
      </motion.div>
      <div className="grid grid-cols-2 gap-2.5">
        {groups.map((g, i) => (
          <motion.div key={g.label}
            initial={reduced ? {} : { opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: reduced ? 0 : i * 0.06 }}
            className="rounded-xl border border-border bg-secondary/20 p-3"
          >
            <div className="flex items-center gap-2 mb-2">
              <g.icon className="h-3.5 w-3.5 text-primary" />
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{g.label}</span>
            </div>
            <div className="space-y-1">
              {g.items.map(item => (
                <div key={item} className="flex items-center gap-1.5 text-[11px] text-foreground">
                  <CheckCircle className="h-2.5 w-2.5 text-trust-safe shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
      {deferredCount > 0 && (
        <p className="text-center text-[11px] text-muted-foreground">
          {deferredCount} item{deferredCount > 1 ? "s" : ""} deferred — available in Settings anytime
        </p>
      )}
    </div>
  );
}
