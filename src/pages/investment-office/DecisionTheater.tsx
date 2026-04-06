import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Theater, Shield, AlertTriangle, Check, X, Brain, Target, Zap, Clock, FileText } from "lucide-react";
import { INVESTMENT_ADVISORS, ADVISOR_SYNTHESIS, SAMPLE_SCENARIOS, SAMPLE_ORDERS } from "@/lib/investment-office/mock-data";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";

const READINESS_DIMENSIONS = [
  { label: "Research Completeness", score: 85, status: "ready" },
  { label: "Thesis Clarity", score: 90, status: "ready" },
  { label: "Risk Clarity", score: 72, status: "review" },
  { label: "Catalyst Understanding", score: 80, status: "ready" },
  { label: "Portfolio Fit", score: 55, status: "simulate" },
  { label: "Emotional Discipline", score: 88, status: "ready" },
  { label: "Execution Readiness", score: 92, status: "ready" },
  { label: "Policy Fit", score: 60, status: "review" },
];

export default function DecisionTheater() {
  const navigate = useNavigate();
  const order = SAMPLE_ORDERS[0];
  const overallReadiness = Math.round(READINESS_DIMENSIONS.reduce((s, d) => s + d.score, 0) / READINESS_DIMENSIONS.length);
  const readinessLabel = overallReadiness >= 80 ? "Ready" : overallReadiness >= 65 ? "Needs Review" : overallReadiness >= 50 ? "Simulate First" : "Wait";

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="text-center space-y-2 pt-4">
        <h1 className="text-3xl font-bold text-foreground flex items-center justify-center gap-3">
          <Theater className="h-7 w-7 text-primary" /> Decision Theater
        </h1>
        <p className="text-sm text-muted-foreground max-w-xl mx-auto">
          A cinematic pre-execution review room for important capital decisions. Review every angle before you commit.
        </p>
      </div>

      {/* Trade Summary Hero */}
      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
        className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card p-8 space-y-4">
        <div className="flex items-center gap-4">
          <span className="text-4xl">{order.instrument.logoIcon}</span>
          <div className="flex-1">
            <p className="text-2xl font-bold text-foreground">{order.action.toUpperCase()} {order.quantity} {order.instrument.symbol}</p>
            <p className="text-sm text-muted-foreground">{order.instrument.name} · {order.platform}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-foreground">${order.estimatedCost.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">{order.orderType} @ ${order.limitPrice}</p>
          </div>
        </div>
        <div className="rounded-xl bg-secondary/30 p-4">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Rationale</p>
          <p className="text-sm text-foreground">{order.rationale}</p>
        </div>
      </motion.div>

      {/* Decision Readiness Score */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="rounded-3xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Target className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground flex-1">Decision Readiness</h2>
          <div className="text-right">
            <p className="text-2xl font-bold text-foreground">{overallReadiness}%</p>
            <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold ${
              overallReadiness >= 80 ? "bg-[hsl(var(--trust-safe))]/10 text-[hsl(var(--trust-safe))]" :
              overallReadiness >= 65 ? "bg-[hsl(var(--trust-warn))]/10 text-[hsl(var(--trust-warn))]" :
              "bg-destructive/10 text-destructive"
            }`}>{readinessLabel}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {READINESS_DIMENSIONS.map(d => (
            <div key={d.label} className="rounded-xl border border-border bg-secondary/20 p-3 space-y-2">
              <p className="text-[10px] font-medium text-muted-foreground">{d.label}</p>
              <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                <div className={`h-full rounded-full ${
                  d.score >= 80 ? "bg-[hsl(var(--trust-safe))]" : d.score >= 60 ? "bg-[hsl(var(--trust-warn))]" : "bg-destructive"
                }`} style={{ width: `${d.score}%` }} />
              </div>
              <p className="text-xs font-bold text-foreground">{d.score}%</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Risk Review */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="rounded-3xl border border-destructive/15 bg-destructive/5 p-6 space-y-3">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-destructive" />
          <h2 className="text-lg font-bold text-foreground">Risk Review</h2>
        </div>
        <p className="text-sm text-foreground">{order.riskPreview}</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { label: "Concentration Impact", value: "Tech → 44%", warning: true },
            { label: "Position Size", value: `${((order.estimatedCost / 500000) * 100).toFixed(1)}% of portfolio`, warning: false },
            { label: "Catalyst Proximity", value: "GTC in 5 months", warning: false },
          ].map(r => (
            <div key={r.label} className={`rounded-xl border p-3 ${r.warning ? "border-destructive/20 bg-destructive/5" : "border-border bg-card"}`}>
              <p className="text-[9px] font-semibold text-muted-foreground uppercase">{r.label}</p>
              <p className={`text-sm font-bold ${r.warning ? "text-destructive" : "text-foreground"}`}>{r.value}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Advisor Commentary */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="rounded-3xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">Advisor Council on This Decision</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {INVESTMENT_ADVISORS.filter(a => ["equity", "risk", "execution", "behavioral"].includes(a.domain)).map(adv => (
            <div key={adv.id} className="rounded-xl border border-border bg-secondary/20 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{adv.icon}</span>
                <div>
                  <p className="text-xs font-bold text-foreground">{adv.name}</p>
                  <p className="text-[9px] text-muted-foreground">{adv.title}</p>
                </div>
                <span className={`ml-auto rounded-full px-2 py-0.5 text-[8px] font-bold uppercase ${
                  adv.currentRecommendation === "execute-now" ? "bg-[hsl(var(--trust-safe))]/10 text-[hsl(var(--trust-safe))]" :
                  adv.currentRecommendation === "reduce" || adv.currentRecommendation === "avoid" ? "bg-destructive/10 text-destructive" :
                  "bg-[hsl(var(--trust-warn))]/10 text-[hsl(var(--trust-warn))]"
                }`}>{adv.currentRecommendation.replace("-", " ")}</span>
              </div>
              <p className="text-[11px] text-foreground leading-relaxed">{adv.currentInsight}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* What Breaks This */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className="rounded-3xl border border-[hsl(var(--trust-warn))]/20 bg-[hsl(var(--trust-warn))]/5 p-6 space-y-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-[hsl(var(--trust-warn))]" />
          <h2 className="text-lg font-bold text-foreground">What Breaks This</h2>
        </div>
        <div className="space-y-2">
          {["NVDA misses earnings by >5% — thesis invalidated", "AI capex cycle shows signs of peaking", "Export controls expand to cover next-gen chips", "Macro turns risk-off with VIX > 30"].map((item, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-foreground">
              <X className="h-4 w-4 text-[hsl(var(--trust-warn))] shrink-0 mt-0.5" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Scenario Preview */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="rounded-3xl border border-border bg-card p-6 space-y-4">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2"><Zap className="h-5 w-5 text-primary" /> Scenario Impact</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {SAMPLE_SCENARIOS.map(sc => (
            <div key={sc.id} className={`rounded-xl border p-4 space-y-2 ${
              sc.projectedReturn >= 0 ? "border-border bg-card" : "border-destructive/20 bg-destructive/5"
            }`}>
              <p className="text-[10px] font-semibold text-muted-foreground">{sc.name}</p>
              <p className={`text-xl font-bold ${sc.projectedReturn >= 0 ? "text-[hsl(var(--trust-safe))]" : "text-destructive"}`}>
                {sc.projectedReturn >= 0 ? "+" : ""}{sc.projectedReturn}%
              </p>
              <p className="text-[9px] text-muted-foreground">Drawdown: {sc.projectedDrawdown}%</p>
              <p className="text-[9px] text-muted-foreground">{sc.probability}% probability</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Action Bar */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
        className="rounded-3xl border border-border bg-card p-6">
        <div className="flex flex-wrap gap-3 justify-center">
          <button className="rounded-xl bg-secondary px-5 py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Save as Draft
          </button>
          <button className="rounded-xl bg-primary/10 px-5 py-3 text-sm font-medium text-primary hover:bg-primary/20 transition-colors">
            Simulate Again
          </button>
          <button onClick={() => navigate("/investments/execute")}
            className="rounded-xl bg-primary px-8 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors">
            Authorize Deployment →
          </button>
        </div>
      </motion.div>
    </div>
  );
}
