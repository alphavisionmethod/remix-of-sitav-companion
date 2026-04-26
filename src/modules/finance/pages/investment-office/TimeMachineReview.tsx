// truth-allow: ia-config
import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, Brain, Check, X, AlertTriangle, ArrowRight, TrendingUp, TrendingDown } from "lucide-react";
import { useTimeMachineSnapshots, useDecisionRecords, useAdvisorObservations } from "@/hooks/use-investment-memory";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
const PAST_DECISIONS: any[] = [{ title: "—", date: "", outcome: "", lessons: [] }];
export default function TimeMachineReview() {
  const { data: liveSnapshots } = useTimeMachineSnapshots();
  const { data: liveDecisions } = useDecisionRecords();
  const { data: liveObservations } = useAdvisorObservations();
  const [selected, setSelected] = useState(PAST_DECISIONS[0]);


  return (
    <div className="mx-auto max-w-6xl space-y-6">
<div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><Clock className="h-6 w-6 text-primary" /> Time Machine Review</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Replay past decisions using only what was known then. Learn what worked and what didn't.</p>
      </div>

      {/* Decision Selector */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {([] as any[]).map(d => (
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
