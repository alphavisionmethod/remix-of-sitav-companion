import { motion } from "framer-motion";
import { Landmark, Shield, TrendingUp, Wallet, Zap, Calendar, Target, Coins } from "lucide-react";
import { useCapitalPurposeBuckets } from "@/hooks/use-investment-office";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";

const DEMO_RULES: any[] = [];

// Production fallback — seed data removed
const DEMO_PURPOSES: any[] = [];

const fmt = (n: number) => n >= 1e6 ? `$${(n / 1e6).toFixed(2)}M` : `$${(n / 1e3).toFixed(1)}K`;

export default function CapitalPurpose() {
  const TOTAL = ([] as typeof DEMO_PURPOSES).reduce((s, p) => s + p.allocated, 0);
  const { data: liveData, isLoading } = useCapitalPurposeBuckets();
  return (
    <div className="mx-auto max-w-5xl space-y-6">
<div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><Landmark className="h-6 w-6 text-primary" /> Capital Purpose Layer</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Allocate capital by purpose, not just by ticker — this drives risk rules, advisor recommendations, and execution review</p>
      </div>

      {/* Total */}
      <div className="rounded-2xl border border-primary/15 bg-primary/5 p-5 text-center">
        <p className="text-[10px] text-muted-foreground uppercase font-semibold">Total Allocated Capital</p>
        <p className="text-3xl font-bold text-foreground">{fmt(TOTAL)}</p>
      </div>

      {/* Purpose Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {([] as typeof DEMO_PURPOSES).map((p, i) => {
          const overTarget = p.actual > p.target * 1.2;
          return (
            <motion.div key={p.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className={`rounded-2xl border p-5 space-y-3 ${overTarget ? "border-[hsl(var(--trust-warn))]/30 bg-[hsl(var(--trust-warn))]/5" : "border-border bg-card"}`}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{p.emoji}</span>
                <div className="flex-1">
                  <p className="text-sm font-bold text-foreground">{p.label}</p>
                  <p className="text-lg font-bold text-foreground">{fmt(p.allocated)}</p>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-muted-foreground">Target: {p.target}%</span>
                  <span className={`font-bold ${overTarget ? "text-[hsl(var(--trust-warn))]" : "text-foreground"}`}>Actual: {p.actual}%</span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden relative">
                  <div className={`h-full rounded-full ${p.color}`} style={{ width: `${Math.min(p.actual / (p.target * 1.5) * 100, 100)}%` }} />
                  <div className="absolute top-0 h-full w-px bg-foreground/40" style={{ left: `${p.target / (p.target * 1.5) * 100}%` }} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Policy Rules */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
        <h3 className="text-sm font-bold text-foreground">Capital Purpose Rules</h3>
        {([] as typeof DEMO_RULES).map((r, i) => (
          <div key={i} className={`rounded-xl border p-3 flex items-start gap-2 ${r.status === "violated" ? "border-destructive/20 bg-destructive/5" : "border-border bg-secondary/20"}`}>
            {r.status === "pass" ? <Shield className="h-4 w-4 text-[hsl(var(--trust-safe))] shrink-0 mt-0.5" /> : <Zap className="h-4 w-4 text-destructive shrink-0 mt-0.5" />}
            <div>
              <p className="text-xs font-medium text-foreground">{r.rule}</p>
              <p className={`text-[10px] ${r.status === "violated" ? "text-destructive" : "text-muted-foreground"}`}>{r.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
