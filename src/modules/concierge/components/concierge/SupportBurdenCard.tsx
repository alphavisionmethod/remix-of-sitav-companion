import { motion } from "framer-motion";
import { GlassCard } from "@/platform/sita/components/sita/PremiumPageComponents";
import { Activity, TrendingDown, TrendingUp } from "lucide-react";

interface BurdenCategory {
  label: string;
  load: number; // 0-100
  trend: "up" | "down" | "flat";
}

interface SupportBurdenCardProps {
  overall: number; // 0-100
  categories: BurdenCategory[];
  recommendation?: string;
}

const loadColor = (v: number) =>
  v > 75 ? "bg-destructive" : v > 50 ? "bg-amber-500" : v > 25 ? "bg-primary" : "bg-chart-2";

const loadLabel = (v: number) =>
  v > 75 ? "Heavy" : v > 50 ? "Moderate" : v > 25 ? "Light" : "Minimal";

export function SupportBurdenCard({ overall, categories, recommendation }: SupportBurdenCardProps) {
  return (
    <GlassCard glow="none" className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <Activity className="h-4 w-4 text-primary" />
        <p className="text-xs font-semibold text-foreground">Support Burden</p>
        <span className={`ml-auto text-[10px] font-medium rounded-full px-2 py-0.5 ${
          overall > 75 ? "bg-destructive/10 text-destructive" :
          overall > 50 ? "bg-amber-500/10 text-amber-500" :
          "bg-chart-2/10 text-chart-2"
        }`}>
          {loadLabel(overall)}
        </span>
      </div>

      <div className="h-2.5 w-full rounded-full bg-secondary/40 overflow-hidden mb-4">
        <motion.div
          className={`h-full rounded-full ${loadColor(overall)}`}
          initial={{ width: 0 }}
          animate={{ width: `${overall}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>

      <div className="space-y-2.5">
        {categories.map((cat) => (
          <div key={cat.label} className="flex items-center gap-3">
            <span className="text-[11px] text-muted-foreground w-24 shrink-0 truncate">{cat.label}</span>
            <div className="flex-1 h-1.5 rounded-full bg-secondary/40 overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${loadColor(cat.load)}`}
                initial={{ width: 0 }}
                animate={{ width: `${cat.load}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div className="flex items-center gap-1 w-10 justify-end">
              {cat.trend === "up" ? <TrendingUp className="h-3 w-3 text-destructive" /> :
               cat.trend === "down" ? <TrendingDown className="h-3 w-3 text-chart-2" /> :
               <span className="text-[10px] text-muted-foreground">—</span>}
              <span className="text-[10px] text-muted-foreground">{cat.load}%</span>
            </div>
          </div>
        ))}
      </div>

      {recommendation && (
        <p className="text-[10px] text-muted-foreground mt-3 pt-3 border-t border-border/20">{recommendation}</p>
      )}
    </GlassCard>
  );
}
