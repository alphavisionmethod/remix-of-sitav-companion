// ═══════════════════════════════════════════════════════════════
// SITA OS — Operating State Hero
// Compact hero strip with 3 key metrics + sparkline feel
// ═══════════════════════════════════════════════════════════════

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export interface HeroMetric {
  label: string;
  value: string;
  change?: string;
  changeDirection?: "up" | "down" | "neutral";
  icon: LucideIcon;
}

interface OperatingStateHeroProps {
  metrics: HeroMetric[];
  accentFrom: string;
  accentTo: string;
  className?: string;
}

export function OperatingStateHero({ metrics, accentFrom, accentTo, className }: OperatingStateHeroProps) {
  return (
    <motion.div
      className={cn("rounded-xl border border-[hsl(0_0%_100%/0.08)] overflow-hidden", className)}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Accent top edge */}
      <div className="h-[2px]" style={{ background: `linear-gradient(to right, ${accentFrom}, ${accentTo})` }} />

      <div className="bg-[hsl(0_0%_100%/0.02)] px-5 py-4">
        <div className={cn(
          "grid gap-4",
          metrics.length === 2 ? "grid-cols-2" : metrics.length >= 4 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-3"
        )}>
          {metrics.map((m, i) => {
            const Icon = m.icon;
            const changeColor = m.changeDirection === "up"
              ? "text-[hsl(152_55%_48%)]"
              : m.changeDirection === "down"
                ? "text-[hsl(0_70%_55%)]"
                : "text-muted-foreground";

            return (
              <motion.div
                key={m.label}
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <div className="rounded-lg p-2 bg-[hsl(0_0%_100%/0.04)]">
                  <Icon className="h-4 w-4" style={{ color: accentFrom }} />
                </div>
                <div>
                  <p className="font-display text-xl font-bold text-foreground tracking-tight">{m.value}</p>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-muted-foreground">{m.label}</span>
                    {m.change && (
                      <span className={cn("text-[10px] font-medium", changeColor)}>{m.change}</span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
