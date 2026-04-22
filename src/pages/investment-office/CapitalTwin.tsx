import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Layers, Shield, TrendingUp, Zap, DollarSign, Target, AlertTriangle, ChevronRight } from "lucide-react";
import { PORTFOLIO } from "@/hooks/useInvestmentOfficeData";
import { useCapitalPurposeBuckets } from "@/hooks/use-investment-office";
import { DEMO_SHOCK_ZONES } from "@/data/seed/investment";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";

// Production fallback — seed data removed
const DEMO_PURPOSES: any[] = [];

export default function CapitalTwin() {
  const { data: liveData, isLoading } = useCapitalPurposeBuckets();
  const navigate = useNavigate();
  const [view, setView] = useState<"purpose" | "exposure" | "readiness">("purpose");

  const totalCapital = PORTFOLIO.totalValue + PORTFOLIO.totalCash;
  const deployedPct = ((PORTFOLIO.totalValue / totalCapital) * 100).toFixed(1);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
<div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><Layers className="h-6 w-6 text-primary" /> Capital Twin</h1>
        <p className="text-sm text-muted-foreground mt-0.5">A living digital twin of your capital world — by purpose, exposure, and readiness</p>
      </div>

      {/* Capital Summary Band */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Total Capital", value: `$${(totalCapital).toLocaleString()}`, sub: "All accounts" },
          { label: "Deployed", value: `${deployedPct}%`, sub: `$${PORTFOLIO.totalValue.toLocaleString()}` },
          { label: "Cash / Reserves", value: `$${PORTFOLIO.totalCash.toLocaleString()}`, sub: "Liquid" },
          { label: "Speculative", value: "12%", sub: "vs 8% target" },
          { label: "Deployment Ready", value: "$18K", sub: "Opportunity capacity" },
        ].map(s => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-4">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{s.label}</p>
            <p className="text-xl font-bold text-foreground mt-1">{s.value}</p>
            <p className="text-[10px] text-muted-foreground">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* View Tabs */}
      <div className="flex gap-1.5">
        {(["purpose", "exposure", "readiness"] as const).map(v => (
          <button key={v} onClick={() => setView(v)}
            className={`rounded-lg px-4 py-2 text-xs font-medium capitalize transition-colors ${
              view === v ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}>{v === "purpose" ? "Capital by Purpose" : v === "exposure" ? "Shock Zones" : "Deployment Readiness"}</button>
        ))}
      </div>

      {view === "purpose" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {([] as typeof DEMO_PURPOSES).map((p, i) => {
            const overTarget = p.allocated > p.target;
            return (
              <motion.div key={p.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="rounded-2xl border border-border bg-card p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{p.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-foreground">{p.label}</p>
                    <p className="text-[10px] text-muted-foreground capitalize">Risk: {p.risk}</p>
                  </div>
                  {overTarget && <AlertTriangle className="h-4 w-4 text-[hsl(var(--trust-warn))]" />}
                </div>
                <div>
                  <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                    <span>{p.allocated}% allocated</span>
                    <span>{p.target}% target</span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(p.allocated / Math.max(p.target, 1) * 100, 100)}%`, backgroundColor: p.color }} />
                  </div>
                </div>
                <p className="text-lg font-bold text-foreground">${p.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                {overTarget && <p className="text-[10px] text-[hsl(var(--trust-warn))]">⚠️ {p.allocated - p.target}% above target — consider rebalancing</p>}
              </motion.div>
            );
          })}
        </div>
      )}

      {view === "exposure" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5 space-y-1">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Correlated Shock Zones</p>
            <p className="text-xs text-muted-foreground">Areas where a single event could create cascading impact across your portfolio</p>
          </div>
          {([] as typeof DEMO_SHOCK_ZONES).map((sz, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className={`rounded-2xl border p-5 space-y-3 ${
                sz.severity === "high" ? "border-destructive/20 bg-destructive/5" :
                sz.severity === "moderate" ? "border-[hsl(var(--trust-warn))]/20 bg-[hsl(var(--trust-warn))]/5" :
                "border-border bg-card"
              }`}>
              <div className="flex items-center gap-2">
                <AlertTriangle className={`h-4 w-4 ${
                  sz.severity === "high" ? "text-destructive" : sz.severity === "moderate" ? "text-[hsl(var(--trust-warn))]" : "text-muted-foreground"
                }`} />
                <p className="text-sm font-bold text-foreground">{sz.label}</p>
                <span className={`ml-auto rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
                  sz.severity === "high" ? "bg-destructive/10 text-destructive" :
                  sz.severity === "moderate" ? "bg-[hsl(var(--trust-warn))]/10 text-[hsl(var(--trust-warn))]" :
                  "bg-secondary text-muted-foreground"
                }`}>{sz.severity}</span>
              </div>
              <div className="h-2 rounded-full bg-secondary overflow-hidden">
                <div className={`h-full rounded-full ${
                  sz.severity === "high" ? "bg-destructive" : sz.severity === "moderate" ? "bg-[hsl(var(--trust-warn))]" : "bg-muted-foreground"
                }`} style={{ width: `${sz.exposure}%` }} />
              </div>
              <p className="text-xs text-foreground">{sz.detail}</p>
              <p className="text-[10px] text-muted-foreground">{sz.exposure}% portfolio exposure</p>
            </motion.div>
          ))}
        </div>
      )}

      {view === "readiness" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: "Opportunity Capacity", value: "$18,000", detail: "Available cash above reserve requirements for new positions", status: "ready" },
            { label: "Speculative Sleeve Room", value: "-4%", detail: "Speculative allocation 4% above target — trim before adding new speculative positions", status: "blocked" },
            { label: "Event Sleeve Room", value: "1%", detail: "Small remaining capacity for event market positions", status: "limited" },
            { label: "Strategic Rebalance", value: "Needed", detail: "Crypto allocation above policy. Tech concentration above target. Rebalance recommended.", status: "action" },
            { label: "Income Sleeve Gap", value: "3%", detail: "Income allocation 3% below target — consider yield-generating positions", status: "opportunity" },
            { label: "Reserve Health", value: "80%", detail: "Cash reserves at 80% of recommended level", status: "warning" },
          ].map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="rounded-2xl border border-border bg-card p-5 space-y-2">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-foreground flex-1">{item.label}</p>
                <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
                  item.status === "ready" ? "bg-[hsl(var(--trust-safe))]/10 text-[hsl(var(--trust-safe))]" :
                  item.status === "blocked" ? "bg-destructive/10 text-destructive" :
                  item.status === "action" ? "bg-primary/10 text-primary" :
                  item.status === "opportunity" ? "bg-[hsl(var(--trust-safe))]/10 text-[hsl(var(--trust-safe))]" :
                  "bg-[hsl(var(--trust-warn))]/10 text-[hsl(var(--trust-warn))]"
                }`}>{item.status}</span>
              </div>
              <p className="text-xl font-bold text-foreground">{item.value}</p>
              <p className="text-xs text-muted-foreground">{item.detail}</p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
