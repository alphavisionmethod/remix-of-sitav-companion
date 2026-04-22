import { motion } from "framer-motion";
import { Dna, Info } from "lucide-react";
import { useStrategyDnaProfile, useDecisionRecords, useThesisRecords, useBehavioralSignals, usePortfolioPositionsMemory } from "@/hooks/use-investment-memory";
import { inferStrategyDNA } from "@/lib/services/finance-os/investment-memory.service";
import { DEMO_DNA_DIMENSIONS, DEMO_SUGGESTIONS } from "@/data/seed/investment";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { useDataMode } from "@/contexts/DataModeContext";

const STRATEGY_SUMMARY = "Your portfolio reveals a growth-oriented, thesis-disciplined investor with moderate macro awareness. You show strong patience but occasionally drift toward speculation. Event markets are underweight relative to your macro interest.";

export default function StrategyDNA() {
  const { data: dnaProfile } = useStrategyDnaProfile();
  const { data: decisions } = useDecisionRecords();
  const { data: theses } = useThesisRecords();
  const { data: behavioralSignals } = useBehavioralSignals();
  const { data: positions } = usePortfolioPositionsMemory();
  const liveInference = inferStrategyDNA(decisions ?? [], theses ?? [], behavioralSignals ?? [], positions ?? []);
  return (
    <div className="mx-auto max-w-5xl space-y-6">
<div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><Dna className="h-6 w-6 text-primary" /> Strategy DNA</h1>
        <p className="text-sm text-muted-foreground mt-0.5">An inferred strategy fingerprint based on your portfolio, behavior, and decision history</p>
      </div>

      {/* Disclaimer */}
      <div className="rounded-xl border border-primary/15 bg-primary/5 p-3 flex items-start gap-2">
        <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <p className="text-[11px] text-foreground">This is an analytical reflection, not a prescription. Use it to understand tendencies and improve decision quality.</p>
      </div>

      {/* DNA Bars */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <h3 className="text-sm font-bold text-foreground">Your Strategy Profile</h3>
        <div className="space-y-3">
          {([] as typeof DEMO_DNA_DIMENSIONS).map((d, i) => (
            <motion.div key={d.label} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-medium text-foreground">{d.label}</p>
                <p className="text-xs font-bold text-foreground">{d.score}%</p>
              </div>
              <div className="h-2 rounded-full bg-secondary overflow-hidden">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${d.score}%` }} />
              </div>
              <p className="text-[9px] text-muted-foreground mt-0.5">{d.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="rounded-2xl border border-primary/15 bg-card p-6 space-y-2">
        <h3 className="text-sm font-bold text-foreground">Synthesis</h3>
        <p className="text-sm text-foreground leading-relaxed">{STRATEGY_SUMMARY}</p>
      </div>

      {/* Suggestions */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
        <h3 className="text-sm font-bold text-foreground">Advisor Suggestions Based on DNA</h3>
        {([] as typeof DEMO_SUGGESTIONS).map((s, i) => (
          <div key={i} className="flex items-start gap-2 text-sm text-foreground">
            <span className="text-primary font-bold shrink-0">→</span>
            <span>{s.suggestion}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
