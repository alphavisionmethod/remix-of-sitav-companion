import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";
import { Check, ChevronRight, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface FirstWinOption {
  key: string;
  icon: LucideIcon;
  title: string;
  description: string;
  preview: string[];
}

interface FirstWinRecommendationCardProps {
  options: FirstWinOption[];
  selected: string;
  onSelect: (key: string) => void;
}

export function FirstWinRecommendationCard({ options, selected, onSelect }: FirstWinRecommendationCardProps) {
  const reduced = useReducedMotion();

  return (
    <div className="space-y-2">
      {options.map((o, i) => {
        const isSelected = selected === o.key;
        return (
          <motion.button key={o.key}
            initial={reduced ? {} : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduced ? 0 : i * 0.06 }}
            whileHover={reduced ? {} : { scale: 1.01 }}
            onClick={() => onSelect(o.key)}
            className={cn(
              "w-full rounded-xl border p-4 text-left transition-all",
              isSelected ? "border-primary/50 bg-primary/8 shadow-sm shadow-primary/10" : "border-border bg-secondary/20 hover:border-primary/20"
            )}
          >
            <div className="flex items-start gap-3">
              <div className={cn("rounded-lg p-2", isSelected ? "bg-primary/15" : "bg-secondary")}>
                <o.icon className={cn("h-4 w-4", isSelected ? "text-primary" : "text-muted-foreground")} />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-foreground">{o.title}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{o.description}</p>
                {isSelected && o.preview.length > 0 && (
                  <motion.div initial={reduced ? {} : { height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                    className="mt-2 space-y-1 border-t border-border pt-2">
                    <div className="flex items-center gap-1 text-[10px] text-trust-safe mb-1">
                      <Sparkles className="h-2.5 w-2.5" />
                      SITA will prepare:
                    </div>
                    {o.preview.map(p => (
                      <div key={p} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                        <ChevronRight className="h-2.5 w-2.5 text-primary shrink-0" />
                        {p}
                      </div>
                    ))}
                  </motion.div>
                )}
              </div>
              {isSelected && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="h-5 w-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <Check className="h-3 w-3 text-primary-foreground" />
                </motion.div>
              )}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
