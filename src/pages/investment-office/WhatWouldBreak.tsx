import { useState } from "react";
import { motion } from "framer-motion";
import { ShieldOff, AlertTriangle, Clock, Zap, TrendingDown, Globe } from "lucide-react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";

const DEMO_TRADES = [
  {
    id: "t1", symbol: "NVDA", name: "Add $8K to NVIDIA", icon: "💚",
    invalidations: [
      { trigger: "AI capex cycle peaks and enterprise spending declines", severity: "high", probability: 25, timeframe: "6-12 months" },
      { trigger: "Export controls expanded to block key markets", severity: "critical", probability: 15, timeframe: "Any time" },
      { trigger: "Competitor achieves GPU parity (AMD MI400, custom silicon)", severity: "medium", probability: 20, timeframe: "12-24 months" },
      { trigger: "Broad market selloff >15% — high-beta drawdown amplified", severity: "high", probability: 30, timeframe: "3-6 months" },
    ],
    hiddenRisks: ["Concentration already at 6.2% — adding pushes to 9.2%", "Tech correlation with existing AAPL, MSFT positions", "Valuation premium leaves little margin for disappointment"],
    waitingLogic: "Earnings in 3 weeks — thesis will be tested. Consider waiting for post-earnings clarity.",
    fragility: 62,
  },
  {
    id: "t2", symbol: "SOL", name: "New $3K SOL Position", icon: "◎",
    invalidations: [
      { trigger: "Network outage or consensus failure", severity: "critical", probability: 15, timeframe: "Any time" },
      { trigger: "Regulatory action against Solana ecosystem", severity: "high", probability: 10, timeframe: "6-12 months" },
      { trigger: "DeFi TVL decline >40% from current levels", severity: "medium", probability: 25, timeframe: "3-6 months" },
      { trigger: "Crypto market enters prolonged bear cycle", severity: "high", probability: 30, timeframe: "6-18 months" },
    ],
    hiddenRisks: ["Crypto sleeve already above 20% target", "High correlation with BTC — not true diversification", "Liquidity risk in stress scenarios"],
    waitingLogic: "No imminent catalyst. Consider entering after next major network upgrade milestone.",
    fragility: 75,
  },
];

export default function WhatWouldBreak() {
  const { isDemoMode } = useDataMode();
  const [selected, setSelected] = useState(DEMO_TRADES[0]);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <DemoModeBadge />
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><ShieldOff className="h-6 w-6 text-destructive" /> What Would Break This Trade</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Reverse-thesis layer — invalidation triggers, hidden risks, and reasons waiting may be smarter</p>
      </div>

      <div className="flex gap-2">
        {DEMO_TRADES.map(t => (
          <button key={t.id} onClick={() => setSelected(t)}
            className={`rounded-xl border px-4 py-3 flex items-center gap-2 transition-all ${selected.id === t.id ? "border-destructive/30 bg-destructive/5" : "border-border bg-card hover:border-destructive/15"}`}>
            <span className="text-lg">{t.icon}</span>
            <div className="text-left">
              <p className="text-xs font-bold text-foreground">{t.symbol}</p>
              <p className="text-[10px] text-muted-foreground">{t.name}</p>
            </div>
          </button>
        ))}
      </div>

      <motion.div key={selected.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        {/* Fragility Score */}
        <div className="rounded-2xl border border-destructive/15 bg-destructive/5 p-5 text-center space-y-1">
          <p className="text-[10px] text-muted-foreground uppercase font-semibold">Fragility Score</p>
          <p className={`text-4xl font-bold ${selected.fragility >= 70 ? "text-destructive" : selected.fragility >= 50 ? "text-[hsl(var(--trust-warn))]" : "text-[hsl(var(--trust-safe))]"}`}>{selected.fragility}/100</p>
          <p className="text-[10px] text-muted-foreground">Higher = more ways this trade can fail</p>
        </div>

        {/* Invalidation Triggers */}
        <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2"><Zap className="h-4 w-4 text-destructive" /> Invalidation Triggers</h3>
          {selected.invalidations.map((inv, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              className={`rounded-xl border p-4 ${
                inv.severity === "critical" ? "border-destructive/20 bg-destructive/5" :
                inv.severity === "high" ? "border-[hsl(var(--trust-warn))]/20 bg-[hsl(var(--trust-warn))]/5" :
                "border-border bg-secondary/20"
              }`}>
              <div className="flex items-start gap-2">
                <AlertTriangle className={`h-4 w-4 shrink-0 mt-0.5 ${inv.severity === "critical" ? "text-destructive" : inv.severity === "high" ? "text-[hsl(var(--trust-warn))]" : "text-muted-foreground"}`} />
                <div className="flex-1">
                  <p className="text-xs font-medium text-foreground">{inv.trigger}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className={`text-[9px] font-bold uppercase ${inv.severity === "critical" ? "text-destructive" : inv.severity === "high" ? "text-[hsl(var(--trust-warn))]" : "text-muted-foreground"}`}>{inv.severity}</span>
                    <span className="text-[9px] text-muted-foreground flex items-center gap-0.5"><TrendingDown className="h-2.5 w-2.5" /> {inv.probability}% est. probability</span>
                    <span className="text-[9px] text-muted-foreground flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" /> {inv.timeframe}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Hidden Risks */}
        <div className="rounded-2xl border border-[hsl(var(--trust-warn))]/20 bg-[hsl(var(--trust-warn))]/5 p-5 space-y-2">
          <p className="text-[10px] font-semibold text-[hsl(var(--trust-warn))] uppercase">Hidden Risks</p>
          {selected.hiddenRisks.map((r, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-foreground">
              <Globe className="h-3.5 w-3.5 text-[hsl(var(--trust-warn))] shrink-0 mt-0.5" />
              <span>{r}</span>
            </div>
          ))}
        </div>

        {/* Why Waiting May Be Smarter */}
        <div className="rounded-2xl border border-primary/15 bg-primary/5 p-5 space-y-2">
          <p className="text-[10px] font-semibold text-primary uppercase flex items-center gap-1"><Clock className="h-3 w-3" /> Why Waiting May Be Smarter</p>
          <p className="text-sm text-foreground leading-relaxed">{selected.waitingLogic}</p>
        </div>
      </motion.div>
    </div>
  );
}
