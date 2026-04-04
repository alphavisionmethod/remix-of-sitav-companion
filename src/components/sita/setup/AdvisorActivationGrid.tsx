import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { Check } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface AdvisorCard {
  id: string;
  icon: LucideIcon;
  title: string;
  role: string;
  color: string;
  enabled: boolean;
  recommended: boolean;
}

interface AdvisorActivationGridProps {
  advisors: AdvisorCard[];
  onToggle: (id: string) => void;
  onExpand?: (id: string) => void;
}

export function AdvisorActivationGrid({ advisors, onToggle, onExpand }: AdvisorActivationGridProps) {
  const reduced = useReducedMotion();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
      {advisors.map((a, i) => (
        <motion.div key={a.id}
          initial={reduced ? {} : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduced ? 0 : i * 0.06 }}
          whileHover={reduced ? {} : { scale: 1.02 }}
          whileTap={reduced ? {} : { scale: 0.98 }}
          onClick={() => onToggle(a.id)}
          className={cn(
            "relative rounded-xl border p-4 cursor-pointer transition-all",
            a.enabled ? "border-primary/40 bg-primary/5 shadow-sm" : "border-border bg-secondary/20 hover:border-primary/20",
          )}
        >
          {a.recommended && !a.enabled && (
            <span className="absolute -top-1.5 right-3 rounded-full bg-[hsl(var(--sita-gold))] px-2 py-0.5 text-[9px] font-bold text-background">
              Recommended
            </span>
          )}
          <div className="flex items-start gap-3">
            <div className={cn("rounded-lg p-2", a.enabled ? "bg-primary/15" : "bg-secondary")}
              style={a.enabled ? {} : {}}>
              <a.icon className="h-4 w-4" style={{ color: a.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground">{a.title}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{a.role}</p>
            </div>
            {a.enabled && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                className="h-5 w-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                <Check className="h-3 w-3 text-primary-foreground" />
              </motion.div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
