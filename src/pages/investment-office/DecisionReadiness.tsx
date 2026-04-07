import { useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, AlertTriangle, Check, X, Clock, Search, Brain } from "lucide-react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";
import { useInvestmentDecisions } from "@/hooks/use-investment-office";

const DEMO_PENDING_DECISIONS = [
  {
    id: "d1", symbol: "NVDA", name: "Add to NVIDIA Position", icon: "💚", type: "Buy $8,000",
    dimensions: [
      { label: "Research Completeness", score: 90, status: "pass" },
      { label: "Thesis Clarity", score: 85, status: "pass" },
      { label: "Risk Clarity", score: 60, status: "review" },
      { label: "Catalyst Understanding", score: 80, status: "pass" },
      { label: "Portfolio Fit", score: 45, status: "fail" },
      { label: "Emotional Discipline", score: 75, status: "pass" },
      { label: "Execution Readiness", score: 88, status: "pass" },
      { label: "Policy Fit", score: 40, status: "fail" },
    ],
    overallScore: 68, verdict: "needs-review" as const,
    advisorNote: "Strong thesis but concentration risk too high. Reduce size to $5K or trim existing tech exposure first.",
  },
  {
    id: "d2", symbol: "SOL", name: "New Solana Position", icon: "◎", type: "Buy $3,000",
    dimensions: [
      { label: "Research Completeness", score: 55, status: "review" },
      { label: "Thesis Clarity", score: 50, status: "review" },
      { label: "Risk Clarity", score: 40, status: "fail" },
      { label: "Catalyst Understanding", score: 45, status: "fail" },
      { label: "Portfolio Fit", score: 60, status: "review" },
      { label: "Emotional Discipline", score: 70, status: "pass" },
      { label: "Execution Readiness", score: 80, status: "pass" },
      { label: "Policy Fit", score: 65, status: "pass" },
    ],
    overallScore: 52, verdict: "simulate-first" as const,
    advisorNote: "Thesis not fully formed. Run a simulation first and document your invalidation triggers before proceeding.",
  },
  {
    id: "d3", symbol: "XAUUSD", name: "Increase Gold Allocation", icon: "🥇", type: "Buy $10,000",
    dimensions: [
      { label: "Research Completeness", score: 85, status: "pass" },
      { label: "Thesis Clarity", score: 90, status: "pass" },
      { label: "Risk Clarity", score: 92, status: "pass" },
      { label: "Catalyst Understanding", score: 75, status: "pass" },
      { label: "Portfolio Fit", score: 95, status: "pass" },
      { label: "Emotional Discipline", score: 88, status: "pass" },
      { label: "Execution Readiness", score: 90, status: "pass" },
      { label: "Policy Fit", score: 80, status: "pass" },
    ],
    overallScore: 87, verdict: "ready" as const,
    advisorNote: "Well-researched, excellent portfolio hedge. Proceed when ready.",
  },
];

const VERDICT_CONFIG = {
  ready: { label: "Ready", color: "text-[hsl(var(--trust-safe))]", bg: "bg-[hsl(var(--trust-safe))]/10", icon: <Check className="h-5 w-5" /> },
  "needs-review": { label: "Needs Review", color: "text-[hsl(var(--trust-warn))]", bg: "bg-[hsl(var(--trust-warn))]/10", icon: <Search className="h-5 w-5" /> },
  "simulate-first": { label: "Simulate First", color: "text-primary", bg: "bg-primary/10", icon: <Clock className="h-5 w-5" /> },
  wait: { label: "Wait", color: "text-muted-foreground", bg: "bg-secondary", icon: <Clock className="h-5 w-5" /> },
  avoid: { label: "Avoid", color: "text-destructive", bg: "bg-destructive/10", icon: <X className="h-5 w-5" /> },
};

export default function DecisionReadiness() {
  const { isDemoMode } = useDataMode();
  const { data: liveData, isLoading } = useInvestmentDecisions();
  const [selected, setSelected] = useState(DEMO_PENDING_DECISIONS[0]);
  const vc = VERDICT_CONFIG[selected.verdict];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <DemoModeBadge />
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><ShieldCheck className="h-6 w-6 text-primary" /> Decision Readiness Center</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Score whether you're truly ready to act — across research, risk, thesis, discipline, and policy</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {DEMO_PENDING_DECISIONS.map(d => {
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
