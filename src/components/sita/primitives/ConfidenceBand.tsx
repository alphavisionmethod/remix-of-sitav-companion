// ═══════════════════════════════════════════════════════════════
// SITA OS — Confidence Band Visualization
// Shows projected values with uncertainty ranges
// ═══════════════════════════════════════════════════════════════

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Shield, TrendingUp } from "lucide-react";
import { springs } from "@/packages/microinteraction-engine";
import { COLORS } from "@/packages/design-tokens";

interface DataPoint {
  label: string;
  value: number;
  low: number;
  high: number;
  isProjection?: boolean;
}

interface ConfidenceBandProps {
  title?: string;
  subtitle?: string;
  points: DataPoint[];
  unit?: string;
  confidenceLevel?: number;
  className?: string;
}

export const ConfidenceBand = ({
  title = "Confidence Band",
  subtitle,
  points,
  unit = "",
  confidenceLevel = 80,
  className,
}: ConfidenceBandProps) => {
  const allValues = points.flatMap(p => [p.low, p.high, p.value]);
  const minVal = Math.min(...allValues);
  const maxVal = Math.max(...allValues);
  const range = maxVal - minVal || 1;

  const normalize = (v: number) => ((v - minVal) / range) * 100;

  return (
    <div className={cn("rounded-2xl border border-border bg-card p-5", className)}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display text-sm font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" /> {title}
          </h3>
          {subtitle && <p className="text-[11px] text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5">
          <Shield className="h-3 w-3 text-primary" />
          <span className="text-[10px] font-semibold text-primary">{confidenceLevel}% CI</span>
        </div>
      </div>

      {/* Band chart */}
      <div className="relative h-40 flex items-end gap-1">
        {points.map((point, i) => {
          const lowPct = normalize(point.low);
          const highPct = normalize(point.high);
          const valuePct = normalize(point.value);
          const bandHeight = highPct - lowPct;

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, scaleY: 0 }}
              animate={{ opacity: 1, scaleY: 1 }}
              transition={{ delay: i * 0.06, duration: 0.3 }}
              className="flex-1 flex flex-col items-center relative"
              style={{ originY: 1 }}
            >
              {/* Uncertainty band */}
              <div
                className={cn(
                  "w-full rounded-t-md relative",
                  point.isProjection
                    ? "bg-primary/8 border border-dashed border-primary/20"
                    : "bg-primary/15"
                )}
                style={{
                  height: `${bandHeight}%`,
                  marginBottom: `${lowPct}%`,
                }}
              >
                {/* Value dot */}
                <div
                  className="absolute left-1/2 -translate-x-1/2 h-2.5 w-2.5 rounded-full bg-primary border-2 border-card shadow-sm z-10"
                  style={{ bottom: `${((valuePct - lowPct) / (bandHeight || 1)) * 100}%` }}
                />
              </div>

              {/* Label */}
              <p className={cn("text-[9px] mt-1.5 text-center", point.isProjection ? "text-primary font-medium" : "text-muted-foreground")}>
                {point.label}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t border-border/50">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-primary" />
          <span className="text-[10px] text-muted-foreground">Actual / Expected</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-6 rounded bg-primary/15" />
          <span className="text-[10px] text-muted-foreground">Confidence Range</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-6 rounded border border-dashed border-primary/30 bg-primary/5" />
          <span className="text-[10px] text-muted-foreground">Projected</span>
        </div>
      </div>
    </div>
  );
};
