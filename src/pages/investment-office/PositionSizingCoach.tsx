import { useState } from "react";
import { motion } from "framer-motion";
import { Ruler, AlertTriangle, Check, Info, Shield, Target } from "lucide-react";
import { usePortfolioPositions } from "@/hooks/use-investment-office";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
export default function PositionSizingCoach() {
  const { data: liveData, isLoading } = usePortfolioPositions();
  const [selectedIdx, setSelectedIdx] = useState(0);
  const scenario = DEMO_SIZING_SCENARIOS[selectedIdx];


  return (
    <div className="mx-auto max-w-5xl space-y-6">
<div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><Ruler className="h-6 w-6 text-primary" /> Position Sizing Coach</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Turn size into an explicit coaching surface — understand how each position fits your portfolio and policy</p>
      </div>

      {/* Scenario Selector */}
      <div className="flex gap-2">
        {([] as any[]).map((s, i) => (
          <button key={s.asset} onClick={() => setSelectedIdx(i)}
            className={`rounded-xl border px-4 py-3 flex items-center gap-2 transition-all ${selectedIdx === i ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/20"}`}>
            <span className="text-lg">{s.icon}</span>
            <div className="text-left">
              <p className="text-xs font-bold text-foreground">{s.asset}</p>
              <p className="text-[10px] text-muted-foreground">${s.proposedSize.toLocaleString()}</p>
            </div>
            {s.violatesPolicy && <AlertTriangle className="h-3 w-3 text-[hsl(var(--trust-warn))]" />}
          </button>
        ))}
      </div>

      <motion.div key={selectedIdx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        {/* Proposed vs Suggested */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`rounded-2xl border p-5 space-y-2 ${scenario.violatesPolicy ? "border-[hsl(var(--trust-warn))]/20 bg-[hsl(var(--trust-warn))]/5" : "border-[hsl(var(--trust-safe))]/20 bg-[hsl(var(--trust-safe))]/5"}`}>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase">Proposed Size</p>
            <p className="text-2xl font-bold text-foreground">${scenario.proposedSize.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">{scenario.currentAllocation}% → {scenario.postAllocation}% of portfolio</p>
            {scenario.violatesPolicy && (
              <div className="flex items-center gap-1.5 text-[10px] text-[hsl(var(--trust-warn))]">
                <AlertTriangle className="h-3 w-3" /> {scenario.violation}
              </div>
            )}
          </div>
          <div className="rounded-2xl border border-primary/15 bg-primary/5 p-5 space-y-2">
            <p className="text-[10px] font-semibold text-primary uppercase">Advisor Suggested Size</p>
            <p className="text-2xl font-bold text-foreground">${scenario.suggestedSize.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Within policy and risk budget</p>
            <Check className="h-3 w-3 text-[hsl(var(--trust-safe))]" />
          </div>
        </div>

        {/* Impact Analysis */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="rounded-xl border border-border bg-card p-4 space-y-1">
            <p className="text-[9px] font-semibold text-muted-foreground uppercase flex items-center gap-1"><Shield className="h-3 w-3" /> Max Allowed</p>
            <p className="text-lg font-bold text-foreground">{scenario.maxAllowed}%</p>
            <p className="text-[10px] text-muted-foreground">Per constitution</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 space-y-1">
            <p className="text-[9px] font-semibold text-muted-foreground uppercase flex items-center gap-1"><Target className="h-3 w-3" /> Risk Budget Used</p>
            <p className={`text-lg font-bold ${scenario.riskBudgetUsed > 70 ? "text-[hsl(var(--trust-warn))]" : "text-foreground"}`}>{scenario.riskBudgetUsed}%</p>
            <p className="text-[10px] text-muted-foreground">After this position</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 space-y-1">
            <p className="text-[9px] font-semibold text-muted-foreground uppercase">Concentration Impact</p>
            <p className="text-xs font-bold text-foreground">{scenario.concentrationImpact}</p>
          </div>
        </div>

        {/* Advisor Note */}
        <div className="rounded-2xl border border-primary/15 bg-primary/5 p-5 space-y-2">
          <p className="text-[10px] font-semibold text-primary uppercase tracking-wider flex items-center gap-1"><Info className="h-3 w-3" /> Sizing Advisor</p>
          <p className="text-sm text-foreground leading-relaxed">{scenario.advisorSuggestion}</p>
        </div>
      </motion.div>
    </div>
  );
}
