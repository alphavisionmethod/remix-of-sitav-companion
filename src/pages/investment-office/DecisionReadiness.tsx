import { useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, AlertTriangle, Check, X, Clock, Search, Brain } from "lucide-react";
import { useInvestmentDecisions } from "@/hooks/use-investment-office";
import { DEMO_PENDING_DECISIONS } from "@/data/seed/investment";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
const VERDICT_CONFIG = {
  ready: { label: "Ready", color: "text-[hsl(var(--trust-safe))]", bg: "bg-[hsl(var(--trust-safe))]/10", icon: <Check className="h-5 w-5" /> },
  "needs-review": { label: "Needs Review", color: "text-[hsl(var(--trust-warn))]", bg: "bg-[hsl(var(--trust-warn))]/10", icon: <Search className="h-5 w-5" /> },
  "simulate-first": { label: "Simulate First", color: "text-primary", bg: "bg-primary/10", icon: <Clock className="h-5 w-5" /> },
  wait: { label: "Wait", color: "text-muted-foreground", bg: "bg-secondary", icon: <Clock className="h-5 w-5" /> },
  avoid: { label: "Avoid", color: "text-destructive", bg: "bg-destructive/10", icon: <X className="h-5 w-5" /> },
};

export default function DecisionReadiness() {
  const { data: liveData, isLoading } = useInvestmentDecisions();
  const [selected, setSelected] = useState(DEMO_PENDING_DECISIONS[0]);
  const vc = VERDICT_CONFIG[selected.verdict];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
<div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><ShieldCheck className="h-6 w-6 text-primary" /> Decision Readiness Center</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Score whether you're truly ready to act — across research, risk, thesis, discipline, and policy</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {([] as typeof DEMO_PENDING_DECISIONS).map(d => {
          const v = VERDICT_CONFIG[d.verdict];
          return (
            <button key={d.id} onClick={() => setSelected(d)}
              className={`shrink-0 rounded-xl border px-4 py-3 flex items-center gap-2 transition-all ${selected.id === d.id ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/20"}`}>
              <span className="text-lg">{d.icon}</span>
              <div className="text-left">
                <p className="text-xs font-bold text-foreground">{d.symbol} — {d.type}</p>
                <p className={`text-[10px] font-medium ${v.color}`}>{v.label}</p>
              </div>
            </button>
          );
        })}
      </div>

      <motion.div key={selected.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        {/* Verdict Hero */}
        <div className={`rounded-2xl border p-6 text-center space-y-2 ${vc.bg} border-transparent`}>
          <div className={`inline-flex items-center justify-center ${vc.color}`}>{vc.icon}</div>
          <p className={`text-3xl font-bold ${vc.color}`}>{selected.overallScore}/100</p>
          <p className={`text-lg font-bold ${vc.color}`}>{vc.label}</p>
          <p className="text-sm text-foreground">{selected.name}</p>
        </div>

        {/* Dimensions */}
        <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
          <h3 className="text-sm font-bold text-foreground">Readiness Dimensions</h3>
          {selected.dimensions.map((d, i) => (
            <motion.div key={d.label} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  {d.status === "pass" ? <Check className="h-3 w-3 text-[hsl(var(--trust-safe))]" /> :
                   d.status === "fail" ? <X className="h-3 w-3 text-destructive" /> :
                   <AlertTriangle className="h-3 w-3 text-[hsl(var(--trust-warn))]" />}
                  <p className="text-xs font-medium text-foreground">{d.label}</p>
                </div>
                <p className={`text-xs font-bold ${d.score >= 70 ? "text-[hsl(var(--trust-safe))]" : d.score >= 50 ? "text-[hsl(var(--trust-warn))]" : "text-destructive"}`}>{d.score}%</p>
              </div>
              <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                <div className={`h-full rounded-full ${d.score >= 70 ? "bg-[hsl(var(--trust-safe))]" : d.score >= 50 ? "bg-[hsl(var(--trust-warn))]" : "bg-destructive"}`} style={{ width: `${d.score}%` }} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Advisor Note */}
        <div className="rounded-2xl border border-primary/15 bg-primary/5 p-5 space-y-2">
          <p className="text-[10px] font-semibold text-primary uppercase tracking-wider flex items-center gap-1"><Brain className="h-3 w-3" /> Board Recommendation</p>
          <p className="text-sm text-foreground leading-relaxed">{selected.advisorNote}</p>
        </div>
      </motion.div>
    </div>
  );
}
