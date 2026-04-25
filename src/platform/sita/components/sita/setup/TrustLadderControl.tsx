import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { LucideIcon } from "lucide-react";

interface TrustLevel {
  level: number;
  icon: LucideIcon;
  title: string;
  description: string;
  stages: boolean[];
}

interface TrustLadderControlProps {
  levels: TrustLevel[];
  selected: number;
  onSelect: (level: number) => void;
}

export function TrustLadderControl({ levels, selected, onSelect }: TrustLadderControlProps) {
  const reduced = useReducedMotion();

  return (
    <div className="space-y-1">
      {levels.map((t, i) => {
        const isSelected = selected === t.level;
        const isBelow = selected > t.level;
        return (
          <div key={t.level}>
            <motion.button
              initial={reduced ? {} : { opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: reduced ? 0 : i * 0.06 }}
              onClick={() => onSelect(t.level)}
              className={cn(
                "w-full flex items-center gap-3 rounded-xl border p-3.5 text-left transition-all",
                isSelected ? "border-primary/50 bg-primary/8 shadow-sm shadow-primary/10" :
                isBelow ? "border-trust-safe/30 bg-trust-safe/5" :
                "border-border bg-secondary/20 hover:border-primary/20"
              )}
            >
              <div className={cn("rounded-lg p-2 transition-colors",
                isSelected ? "bg-primary/15" : isBelow ? "bg-trust-safe/10" : "bg-secondary")}>
                <t.icon className={cn("h-4 w-4",
                  isSelected ? "text-primary" : isBelow ? "text-trust-safe" : "text-muted-foreground")} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn("text-xs font-semibold", isSelected ? "text-foreground" : "text-muted-foreground")}>{t.title}</p>
                <p className="text-[11px] text-muted-foreground">{t.description}</p>
              </div>
              {isBelow && (
                <div className="h-2 w-2 rounded-full bg-trust-safe shrink-0" />
              )}
              {isSelected && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="h-2.5 w-2.5 rounded-full bg-primary shrink-0" />
              )}
            </motion.button>
            {/* Connector line */}
            {i < levels.length - 1 && (
              <div className="flex justify-start ml-7 my-0.5">
                <div className={cn("w-0.5 h-2 rounded-full transition-colors",
                  selected > t.level ? "bg-trust-safe/40" : "bg-muted")} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
