import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, Brain, Check, X, AlertTriangle, ArrowRight, TrendingUp, TrendingDown } from "lucide-react";
import { INVESTMENT_ADVISORS } from "@/lib/investment-office/mock-data";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";

const PAST_DECISIONS = [
  {
    id: "td1", date: "2025-08-15", action: "BUY 200 NVDA @ $95.50", instrument: "NVDA", symbol: "💚",
    thesisAtTime: "AI infrastructure supercycle — NVDA dominant with 80%+ GPU share. Blackwell architecture extends moat.",
    marketConditionsAtTime: "S&P at 5,200. Fed paused at 5.25%. VIX at 14. AI narrative accelerating post-earnings beat.",
    advisorViewsAtTime: [
      { advisor: "Maven (Equity)", view: "Strong buy — AI capex cycle early innings", confidence: 88 },
      { advisor: "Sentinel (Risk)", view: "Size carefully — tech concentration already elevated", confidence: 82 },
      { advisor: "Atlas (Macro)", view: "Supportive macro — risk-on regime intact", confidence: 75 },
    ],
    whatChangedAfter: ["NVDA rallied 42% in 6 months", "AI capex spending exceeded estimates", "Export controls didn't expand significantly", "Blackwell ramp confirmed strong demand"],
    wasRight: true,
    disciplineFollowed: true,
    lessonLearned: "Thesis-driven entry with patient sizing paid off. The dip before GTC was the opportunity.",
    currentPrice: 135.20, entryPrice: 95.50,
  },
  {
    id: "td2", date: "2025-11-01", action: "BUY 1.5 BTC @ $62,000", instrument: "BTC", symbol: "₿",
    thesisAtTime: "Post-halving cycle. ETF inflows creating structural demand floor.",
    marketConditionsAtTime: "BTC at $62K. ETF approval fresh. Institutional flows positive. Fed signaling rate cuts ahead.",
    advisorViewsAtTime: [
      { advisor: "Cipher (Crypto)", view: "Structural bull — halving dynamics and ETF flows supportive", confidence: 72 },
      { advisor: "Sentinel (Risk)", view: "Size appropriately — crypto volatile, keep within sleeve", confidence: 80 },
      { advisor: "Mirror (Behavioral)", view: "Entry looks disciplined, not FOMO-driven", confidence: 85 },
    ],
    whatChangedAfter: ["BTC reached $97K — +56% from entry", "ETF inflows remained strong", "No major regulatory crackdown occurred", "Crypto allocation drifted above policy target"],
    wasRight: true,
    disciplineFollowed: false,
    lessonLearned: "Entry was excellent but failed to trim when allocation exceeded policy target. Discipline gap in risk management.",
    currentPrice: 97450, entryPrice: 62000,
  },
  {
    id: "td3", date: "2026-01-15", action: "BUY 100 SOL @ $120", instrument: "SOL", symbol: "◎",
    thesisAtTime: "Fastest growing DeFi ecosystem. High-performance chain gaining developer adoption.",
    marketConditionsAtTime: "SOL recovering from lows. DeFi TVL growing. Network stability improved.",
    advisorViewsAtTime: [
      { advisor: "Cipher (Crypto)", view: "Constructive — ecosystem momentum strong", confidence: 65 },
      { advisor: "Sentinel (Risk)", view: "Speculative allocation — size small", confidence: 78 },
      { advisor: "Mirror (Behavioral)", view: "Patient entry after waiting for pullback — good discipline", confidence: 90 },
    ],
    whatChangedAfter: ["SOL rallied to $185 — +54%", "Network had congestion event", "TVL crossed $8B milestone", "Pushed crypto sleeve above target"],
    wasRight: true,
    disciplineFollowed: true,
    lessonLearned: "Waiting for the pullback rather than chasing the rally was the right call. Mirror flagged potential FOMO earlier and user waited.",
    currentPrice: 185.40, entryPrice: 120,
  },
];

export default function TimeMachineReview() {
  const [selected, setSelected] = useState(PAST_DECISIONS[0]);


  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <DemoModeBadge />
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><Clock className="h-6 w-6 text-primary" /> Time Machine Review</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Replay past decisions using only what was known then. Learn what worked and what didn't.</p>
      </div>

      {/* Decision Selector */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {PAST_DECISIONS.map(d => (
          <button key={d.id} onClick={() => setSelected(d)}
            className={`shrink-0 rounded-xl border px-4 py-3 text-left transition-all ${
              selected.id === d.id ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/20"
            }`}>
            <div className="flex items-center gap-2">
              <span className="text-lg">{d.symbol}</span>
              <div>
                <p className="text-xs font-bold text-foreground">{d.action}</p>
                <p className="text-[10px] text-muted-foreground">{d.date}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Main Review */}
      <div className="space-y-5">
        {/* What We Knew Then */}
        <motion.div key={selected.id + "-thesis"} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-primary/15 bg-primary/5 p-6 space-y-3">
          <p className="text-[10px] font-semibold text-primary uppercase tracking-wider">What We Knew Then · {selected.date}</p>
          <p className="text-lg font-bold text-foreground">{selected.action}</p>
          <div className="rounded-xl bg-card/60 p-4 space-y-2">
            <p className="text-[9px] font-semibold text-muted-foreground uppercase">Thesis at Time</p>
            <p className="text-sm text-foreground">{selected.thesisAtTime}</p>
          </div>
          <div className="rounded-xl bg-card/60 p-4 space-y-2">
            <p className="text-[9px] font-semibold text-muted-foreground uppercase">Market Conditions</p>
            <p className="text-sm text-foreground">{selected.marketConditionsAtTime}</p>
          </div>
        </motion.div>

        {/* Advisor Views at the Time */}
        <motion.div key={selected.id + "-adv"} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="rounded-2xl border border-border bg-card p-6 space-y-3">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
            <Brain className="h-3 w-3" /> What Advisors Said Then
          </p>
          <div className="space-y-2">
            {selected.advisorViewsAtTime.map((av, i) => (
              <div key={i} className="rounded-xl border border-border bg-secondary/20 p-4 flex items-start gap-3">
                <div className="flex-1">
                  <p className="text-xs font-bold text-foreground">{av.advisor}</p>
                  <p className="text-[11px] text-foreground mt-1">{av.view}</p>
                </div>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-bold text-primary">{av.confidence}%</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* What Changed After */}
        <motion.div key={selected.id + "-after"} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-2xl border border-border bg-card p-6 space-y-3">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
            <ArrowRight className="h-3 w-3" /> What Changed After
          </p>
          <div className="space-y-1.5">
            {selected.whatChangedAfter.map((c, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-foreground">
                <ArrowRight className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                <span>{c}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Outcome */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className={`rounded-2xl border p-6 space-y-2 ${selected.wasRight ? "border-[hsl(var(--trust-safe))]/20 bg-[hsl(var(--trust-safe))]/5" : "border-destructive/20 bg-destructive/5"}`}>
            <div className="flex items-center gap-2">
              {selected.wasRight ? <Check className="h-5 w-5 text-[hsl(var(--trust-safe))]" /> : <X className="h-5 w-5 text-destructive" />}
              <p className="text-sm font-bold text-foreground">Was the Thesis Right?</p>
            </div>
            <p className="text-2xl font-bold text-foreground">{selected.wasRight ? "Yes" : "No"}</p>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground">Entry: ${selected.entryPrice.toLocaleString()}</span>
              <ArrowRight className="h-3 w-3 text-muted-foreground" />
              <span className="text-[10px] text-foreground font-medium">Now: ${selected.currentPrice.toLocaleString()}</span>
            </div>
            <p className={`text-lg font-bold ${selected.currentPrice > selected.entryPrice ? "text-[hsl(var(--trust-safe))]" : "text-destructive"}`}>
              {selected.currentPrice > selected.entryPrice ? "+" : ""}{(((selected.currentPrice - selected.entryPrice) / selected.entryPrice) * 100).toFixed(1)}%
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className={`rounded-2xl border p-6 space-y-2 ${selected.disciplineFollowed ? "border-[hsl(var(--trust-safe))]/20 bg-[hsl(var(--trust-safe))]/5" : "border-[hsl(var(--trust-warn))]/20 bg-[hsl(var(--trust-warn))]/5"}`}>
            <div className="flex items-center gap-2">
              {selected.disciplineFollowed ? <Check className="h-5 w-5 text-[hsl(var(--trust-safe))]" /> : <AlertTriangle className="h-5 w-5 text-[hsl(var(--trust-warn))]" />}
              <p className="text-sm font-bold text-foreground">Discipline Followed?</p>
            </div>
            <p className="text-2xl font-bold text-foreground">{selected.disciplineFollowed ? "Yes" : "Partially"}</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="rounded-2xl border border-primary/15 bg-primary/5 p-6 space-y-2">
            <p className="text-[10px] font-semibold text-primary uppercase tracking-wider">Lesson Learned</p>
            <p className="text-sm text-foreground leading-relaxed">{selected.lessonLearned}</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
