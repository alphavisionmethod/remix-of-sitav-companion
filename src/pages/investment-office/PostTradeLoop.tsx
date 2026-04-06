import { useState } from "react";
import { motion } from "framer-motion";
import { RotateCcw, TrendingUp, TrendingDown, Brain, Check, AlertTriangle, ArrowRight } from "lucide-react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";

const ACTIVE_POSITIONS = [
  {
    id: "p1", symbol: "NVDA", name: "NVIDIA", icon: "💚", entryPrice: 95.50, currentPrice: 135.20, entryDate: "2025-08-15",
    thesisStatus: "strengthened", recommendation: "hold", advisorNote: "AI capex cycle confirmed. Thesis intact. Consider trimming 10% to manage concentration.",
    whatChanged: ["Blackwell revenue exceeded estimates", "AI capex spending accelerated", "Export controls stable"],
    thesisIntact: true, shouldReview: false,
  },
  {
    id: "p2", symbol: "BTC", name: "Bitcoin", icon: "₿", entryPrice: 62000, currentPrice: 97450, entryDate: "2025-11-01",
    thesisStatus: "intact", recommendation: "trim", advisorNote: "Thesis valid but allocation has drifted above policy. Trim to bring within 20% crypto sleeve target.",
    whatChanged: ["ETF inflows strong", "Halving dynamics playing out", "Allocation breached policy limit"],
    thesisIntact: true, shouldReview: true,
  },
  {
    id: "p3", symbol: "SOL", name: "Solana", icon: "◎", entryPrice: 120, currentPrice: 185.40, entryDate: "2026-01-15",
    thesisStatus: "strengthened", recommendation: "hold", advisorNote: "Ecosystem momentum strong. TVL milestone crossed. Network congestion risk monitored.",
    whatChanged: ["TVL crossed $8B", "Network congestion event occurred but resolved", "DeFi ecosystem expanding"],
    thesisIntact: true, shouldReview: false,
  },
  {
    id: "p4", symbol: "XAUUSD", name: "Gold", icon: "🥇", entryPrice: 2400, currentPrice: 2640, entryDate: "2025-06-01",
    thesisStatus: "intact", recommendation: "hold", advisorNote: "Safe haven thesis intact. Central bank buying structural. No action needed.",
    whatChanged: ["Central bank buying at record pace", "Geopolitical uncertainty elevated", "Real rates declining"],
    thesisIntact: true, shouldReview: false,
  },
];

export default function PostTradeLoop() {
  const [selected, setSelected] = useState(ACTIVE_POSITIONS[0]);
  const pnlPct = ((selected.currentPrice - selected.entryPrice) / selected.entryPrice * 100).toFixed(1);
  const isPositive = selected.currentPrice >= selected.entryPrice;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <DemoModeBadge />
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><RotateCcw className="h-6 w-6 text-primary" /> Post-Trade Intelligence Loop</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Continuous review — did the thesis strengthen or weaken? Should you hold, trim, expand, or exit?</p>
      </div>

      {/* Position Selector */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {ACTIVE_POSITIONS.map(p => (
          <button key={p.id} onClick={() => setSelected(p)}
            className={`shrink-0 rounded-xl border px-4 py-3 flex items-center gap-2 transition-all ${selected.id === p.id ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/20"}`}>
            <span className="text-lg">{p.icon}</span>
            <div className="text-left">
              <p className="text-xs font-bold text-foreground">{p.symbol}</p>
              <p className={`text-[10px] font-medium ${p.currentPrice >= p.entryPrice ? "text-[hsl(var(--trust-safe))]" : "text-destructive"}`}>
                {p.currentPrice >= p.entryPrice ? "+" : ""}{((p.currentPrice - p.entryPrice) / p.entryPrice * 100).toFixed(1)}%
              </p>
            </div>
            {p.shouldReview && <AlertTriangle className="h-3 w-3 text-[hsl(var(--trust-warn))]" />}
          </button>
        ))}
      </div>

      <motion.div key={selected.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        {/* Performance Hero */}
        <div className={`rounded-2xl border p-6 ${isPositive ? "border-[hsl(var(--trust-safe))]/15 bg-[hsl(var(--trust-safe))]/5" : "border-destructive/15 bg-destructive/5"}`}>
          <div className="flex items-center gap-4">
            <span className="text-4xl">{selected.icon}</span>
            <div className="flex-1">
              <p className="text-xl font-bold text-foreground">{selected.name} ({selected.symbol})</p>
              <p className="text-sm text-muted-foreground">Entered {selected.entryDate} @ ${selected.entryPrice.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className={`text-3xl font-bold ${isPositive ? "text-[hsl(var(--trust-safe))]" : "text-destructive"}`}>{isPositive ? "+" : ""}{pnlPct}%</p>
              <p className="text-sm text-muted-foreground">${selected.currentPrice.toLocaleString()} now</p>
            </div>
          </div>
        </div>

        {/* Thesis Status */}
        <div className={`rounded-2xl border p-5 ${
          selected.thesisStatus === "strengthened" ? "border-[hsl(var(--trust-safe))]/15 bg-[hsl(var(--trust-safe))]/5" :
          selected.thesisStatus === "weakened" ? "border-destructive/15 bg-destructive/5" :
          "border-border bg-card"
        }`}>
          <div className="flex items-center gap-2 mb-2">
            {selected.thesisIntact ? <Check className="h-4 w-4 text-[hsl(var(--trust-safe))]" /> : <AlertTriangle className="h-4 w-4 text-destructive" />}
            <p className="text-sm font-bold text-foreground">Thesis: <span className="capitalize">{selected.thesisStatus}</span></p>
            <span className={`ml-auto rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase ${
              selected.recommendation === "hold" ? "bg-secondary text-muted-foreground" :
              selected.recommendation === "trim" ? "bg-[hsl(var(--trust-warn))]/10 text-[hsl(var(--trust-warn))]" :
              "bg-[hsl(var(--trust-safe))]/10 text-[hsl(var(--trust-safe))]"
            }`}>{selected.recommendation}</span>
          </div>
        </div>

        {/* What Changed */}
        <div className="rounded-2xl border border-border bg-card p-5 space-y-2">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">What Changed Since Entry</p>
          {selected.whatChanged.map((c, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-foreground">
              <ArrowRight className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
              <span>{c}</span>
            </div>
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
