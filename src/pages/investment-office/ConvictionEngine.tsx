import { motion } from "framer-motion";
import { Gauge, AlertTriangle, Check } from "lucide-react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";
import { usePortfolioPositions } from "@/hooks/use-investment-office";

const DEMO_POSITIONS = [
  {
    symbol: "NVDA", name: "NVIDIA", icon: "💚",
    conviction: 82, uncertainty: 28, catalystStrength: 85, downsideFragility: 35,
    thesisClarity: 90, portfolioFit: 60, timeHorizonFit: 80,
    overall: 78, verdict: "Strong conviction — moderate concentration concern",
  },
  {
    symbol: "BTC", name: "Bitcoin", icon: "₿",
    conviction: 72, uncertainty: 45, catalystStrength: 60, downsideFragility: 55,
    thesisClarity: 75, portfolioFit: 45, timeHorizonFit: 85,
    overall: 62, verdict: "Good conviction — allocation above policy, trim to improve fit",
  },
  {
    symbol: "SOL", name: "Solana", icon: "◎",
    conviction: 65, uncertainty: 55, catalystStrength: 50, downsideFragility: 65,
    thesisClarity: 60, portfolioFit: 55, timeHorizonFit: 70,
    overall: 55, verdict: "Moderate conviction — speculative allocation, size appropriately",
  },
  {
    symbol: "XAUUSD", name: "Gold", icon: "🥇",
    conviction: 75, uncertainty: 20, catalystStrength: 40, downsideFragility: 15,
    thesisClarity: 85, portfolioFit: 90, timeHorizonFit: 90,
    overall: 80, verdict: "High conviction — excellent portfolio hedge, low fragility",
  },
  {
    symbol: "AAPL", name: "Apple", icon: "🍎",
    conviction: 68, uncertainty: 30, catalystStrength: 55, downsideFragility: 30,
    thesisClarity: 70, portfolioFit: 70, timeHorizonFit: 85,
    overall: 68, verdict: "Solid conviction — quality hold with AI optionality",
  },
];

const DEMO_DIMS: Array<{ key: keyof Pick<typeof DEMO_POSITIONS[0], "conviction" | "uncertainty" | "catalystStrength" | "downsideFragility" | "thesisClarity" | "portfolioFit" | "timeHorizonFit">; label: string; color: string; inverted?: boolean }> = [
  { key: "conviction", label: "Conviction", color: "bg-primary" },
  { key: "uncertainty", label: "Uncertainty", color: "bg-destructive", inverted: true },
  { key: "catalystStrength", label: "Catalyst Strength", color: "bg-[hsl(var(--trust-safe))]" },
  { key: "downsideFragility", label: "Downside Fragility", color: "bg-[hsl(var(--trust-warn))]", inverted: true },
  { key: "thesisClarity", label: "Thesis Clarity", color: "bg-primary" },
  { key: "portfolioFit", label: "Portfolio Fit", color: "bg-[hsl(var(--trust-safe))]" },
  { key: "timeHorizonFit", label: "Time Horizon Fit", color: "bg-primary" },
];

export default function ConvictionEngine() {
  const { isDemoMode } = useDataMode();
  const { data: liveData, isLoading } = usePortfolioPositions();
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <DemoModeBadge />
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><Gauge className="h-6 w-6 text-primary" /> Conviction Engine</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Multi-dimensional conviction scoring for every position — conviction, uncertainty, catalyst strength, fragility, and fit</p>
      </div>

      {DEMO_POSITIONS.map((p, pi) => (
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
            {DEMO_DIMS.map(d => {
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
