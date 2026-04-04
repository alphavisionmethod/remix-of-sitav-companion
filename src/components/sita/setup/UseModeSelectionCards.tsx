import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { LucideIcon } from "lucide-react";

interface ModeCard {
  key: string;
  icon: LucideIcon;
  title: string;
  description: string;
  features: string[];
}

interface UseModeSelectionCardsProps {
  modes: ModeCard[];
  selected: string;
  onSelect: (key: string) => void;
}

export function UseModeSelectionCards({ modes, selected, onSelect }: UseModeSelectionCardsProps) {
  const reduced = useReducedMotion();

  return (
    <div className="space-y-2">
      {modes.map((m, i) => {
        const isSelected = selected === m.key;
        return (
          <motion.button key={m.key}
            initial={reduced ? {} : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduced ? 0 : i * 0.05 }}
            whileHover={reduced ? {} : { scale: 1.02 }}
            whileTap={reduced ? {} : { scale: 0.98 }}
            onClick={() => onSelect(m.key)}
            className={cn(
              "w-full rounded-xl border p-4 text-left transition-all relative",
              isSelected ? "border-primary/50 bg-primary/8 shadow-md shadow-primary/10" : "border-border bg-secondary/20 hover:border-primary/20"
            )}
          >
            <div className="flex items-start gap-3">
              <div className={cn("rounded-lg p-2", isSelected ? "bg-primary/15" : "bg-secondary")}>
                <m.icon className={cn("h-5 w-5", isSelected ? "text-primary" : "text-muted-foreground")} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{m.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{m.description}</p>
                {isSelected && m.features.length > 0 && (
                  <motion.div initial={reduced ? {} : { height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                    className="mt-2 flex flex-wrap gap-1.5">
                    {m.features.map(f => (
                      <span key={f} className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary">{f}</span>
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
