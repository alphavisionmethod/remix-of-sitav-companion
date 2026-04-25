import { motion } from "framer-motion";
import { Gauge, AlertTriangle, Check } from "lucide-react";
import { usePortfolioPositions } from "@/hooks/use-investment-office";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
export default function ConvictionEngine() {
  const { data: liveData, isLoading } = usePortfolioPositions();
  return (
    <div className="mx-auto max-w-6xl space-y-6">
<div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><Gauge className="h-6 w-6 text-primary" /> Conviction Engine</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Multi-dimensional conviction scoring for every position — conviction, uncertainty, catalyst strength, fragility, and fit</p>
      </div>

      {([] as any[]).map((p, pi) => (
        <motion.div key={p.symbol} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: pi * 0.05 }}
          className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{p.icon}</span>
            <div className="flex-1">
              <p className="text-sm font-bold text-foreground">{p.name} ({p.symbol})</p>
              <p className="text-[10px] text-muted-foreground">{p.verdict}</p>
            </div>
            <div className="text-center">
              <p className={`text-2xl font-bold ${p.overall >= 70 ? "text-[hsl(var(--trust-safe))]" : p.overall >= 55 ? "text-[hsl(var(--trust-warn))]" : "text-destructive"}`}>{p.overall}</p>
              <p className="text-[8px] text-muted-foreground uppercase">Overall</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
            {([] as any[]).map(d => {
              const val = p[d.key];
              const isGood = d.inverted ? val < 40 : val >= 70;
              const isBad = d.inverted ? val >= 60 : val < 50;
              return (
                <div key={d.key} className="rounded-xl bg-secondary/20 p-2 space-y-1">
                  <p className="text-[8px] font-semibold text-muted-foreground uppercase">{d.label}</p>
                  <div className="h-1 rounded-full bg-secondary overflow-hidden">
                    <div className={`h-full rounded-full ${d.color}`} style={{ width: `${val}%` }} />
                  </div>
                  <p className={`text-sm font-bold ${isGood ? "text-[hsl(var(--trust-safe))]" : isBad ? "text-destructive" : "text-foreground"}`}>{val}%</p>
                </div>
              );
            })}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
