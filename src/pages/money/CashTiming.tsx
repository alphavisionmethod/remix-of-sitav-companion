import { SitaPageHeader, SitaCard, SitaCardTitle, SitaSectionHeader, SitaButton } from "@/components/sita/SitaCard";
import { KPITile, RiskCard, OpportunityCard } from "@/components/sita/SitaComponents";
import { TrustBadge } from "@/components/sita/TrustBadge";
import { CashFlowChart } from "@/components/sita/SitaCharts";
import { Shield, DollarSign, TrendingUp, TrendingDown, AlertTriangle, Clock, ArrowRight, CheckCircle, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { LiveAdvisorCard } from "@/components/sita/LiveAdvisorCard";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";

interface CashWindow {
  day: string; inflows: number; outflows: number; net: number; balance: number; stress: boolean;
}

const windows: CashWindow[] = [
  { day: "Today", inflows: 0, outflows: 0, net: 0, balance: 18070, stress: false },
  { day: "Apr 1", inflows: 0, outflows: 2449, net: -2449, balance: 15621, stress: true },
  { day: "Apr 3", inflows: 0, outflows: 340, net: -340, balance: 15281, stress: false },
  { day: "Apr 5", inflows: 3200, outflows: 189, net: 3011, balance: 18292, stress: false },
  { day: "Apr 7", inflows: 0, outflows: 0, net: 0, balance: 18292, stress: false },
  { day: "Apr 10", inflows: 0, outflows: 420, net: -420, balance: 17872, stress: false },
  { day: "Apr 12", inflows: 4200, outflows: 0, net: 4200, balance: 22072, stress: false },
  { day: "Apr 15", inflows: 0, outflows: 3685, net: -3685, balance: 18387, stress: true },
];

const CashTiming = () => {
  const safeToSpend = 3180;
  const minBalance = Math.min(...windows.map(w => w.balance));
  const stressWindows = windows.filter(w => w.stress);

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <DemoModeBadge />
      <SitaPageHeader title="Cash Timing & Safe-to-Spend" subtitle="Understand your money flow, avoid collisions" />

      {/* Hero */}
      <SitaCard hover={false} className="gradient-sita-subtle p-6">
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="text-center">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Safe to Spend</p>
            <p className="mt-2 font-display text-4xl font-bold text-trust-verified">${safeToSpend.toLocaleString()}</p>
            <p className="mt-1 text-xs text-muted-foreground">After bills, reserves, and obligations</p>
          </div>
          <div className="text-center">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Lowest Point (15d)</p>
            <p className="mt-2 font-display text-4xl font-bold text-foreground">${minBalance.toLocaleString()}</p>
            <p className="mt-1 text-xs text-muted-foreground">Projected minimum balance</p>
          </div>
          <div className="text-center">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Stress Windows</p>
            <p className={`mt-2 font-display text-4xl font-bold ${stressWindows.length > 0 ? "text-urgency-high" : "text-trust-verified"}`}>{stressWindows.length}</p>
            <p className="mt-1 text-xs text-muted-foreground">{stressWindows.length > 0 ? "High-outflow days ahead" : "No concerns"}</p>
          </div>
        </div>
      </SitaCard>

      {/* Interactive Chart */}
      <CashFlowChart />

      <SitaCard hover={false}>
        <SitaCardTitle sub="Projected balance over the next 15 days">Cash Flow Timeline</SitaCardTitle>
        <div className="mt-4 space-y-1">
          {windows.map((w, i) => (
            <div key={i} className={`flex items-center gap-4 rounded-xl p-3.5 transition-all ${w.stress ? "bg-urgency-high/5 border border-urgency-high/10" : "bg-secondary/20"}`}>
              <div className="w-16 shrink-0">
                <p className={`text-sm font-semibold ${w.stress ? "text-urgency-high" : "text-foreground"}`}>{w.day}</p>
              </div>
              <div className="flex-1 grid grid-cols-3 gap-4 text-sm">
                <div>
                  {w.inflows > 0 && <span className="text-trust-verified font-medium">+${w.inflows.toLocaleString()}</span>}
                  {w.inflows === 0 && <span className="text-muted-foreground">—</span>}
                </div>
                <div>
                  {w.outflows > 0 && <span className="text-urgency-high font-medium">-${w.outflows.toLocaleString()}</span>}
                  {w.outflows === 0 && <span className="text-muted-foreground">—</span>}
                </div>
                <div className="text-right">
                  <span className="font-display font-bold text-foreground">${w.balance.toLocaleString()}</span>
                </div>
              </div>
              {w.stress && <AlertTriangle className="h-4 w-4 text-urgency-high shrink-0" />}
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-6 text-[11px] text-muted-foreground px-3.5">
          <span className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-trust-verified" /> Inflows</span>
          <span className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-urgency-high" /> Outflows</span>
          <span className="flex items-center gap-1"><AlertTriangle className="h-3 w-3 text-urgency-high" /> Stress Window</span>
        </div>
      </SitaCard>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Stress Analysis */}
        <div className="space-y-4">
          <SitaSectionHeader title="Stress Windows" />
          <RiskCard title="Apr 1 — Rent + Gym ($2,449 outflow)" description="Largest single-day outflow. Both are auto-pay. Balance drops to $15,621." severity="medium" />
          <RiskCard title="Apr 15 — Car Loan + Tax Est. ($3,685 outflow)" description="Combined hit. Tax estimate is $3,200. Ensure balance stays above reserve threshold." severity="high" />
        </div>

        {/* Timing Suggestions */}
        <div className="space-y-4">
          <SitaSectionHeader title="Timing Suggestions" />
          <SitaCard hover={false} className="p-4">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-accent/10 p-2.5"><Sparkles className="h-4 w-4 text-accent" /></div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-foreground">Wait to spend until Apr 5</p>
                  <p className="text-xs text-muted-foreground">$3,200 invoice payment from Apex Corp expected — balance will improve significantly</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Consider splitting tax payment</p>
                  <p className="text-xs text-muted-foreground">$3,200 quarterly estimate on Apr 15 creates stress. If allowed, split across Apr 12 and Apr 15.</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Transfer $1,000 to personal checking</p>
                  <p className="text-xs text-muted-foreground">Personal account at $3,840 — below comfort threshold. Business has surplus.</p>
                </div>
              </div>
            </div>
          </SitaCard>

          {/* Confidence */}
          <SitaCard hover={false} className="p-4">
            <SitaCardTitle>Forecast Confidence</SitaCardTitle>
            <div className="mt-3 space-y-2">
              {[
                { label: "Bills (fixed)", confidence: 95, color: "bg-trust-verified" },
                { label: "Receivables", confidence: 72, color: "bg-trust-review" },
                { label: "Variable spend", confidence: 60, color: "bg-trust-review" },
              ].map((c) => (
                <div key={c.label} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-28">{c.label}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div className={`h-full rounded-full ${c.color}`} style={{ width: `${c.confidence}%` }} />
                  </div>
                  <span className="text-xs font-semibold text-foreground w-10 text-right">{c.confidence}%</span>
                </div>
              ))}
            </div>
          </SitaCard>
        </div>
      </div>
      <LiveAdvisorCard
        advisor="money"
        intent="cashflow_forecast"
        demoName="Cash Flow Intelligence"
        demoRole="Timing Advisor"
        demoConfidence="Medium"
        demoRecommendation="2 stress windows in the next 15 days — Apr 1 ($2,449) and Apr 15 ($3,685). Delay discretionary spending until after Apr 5 when the $3,200 receivable arrives."
        demoReasoning="Based on 15-day cash flow projection, bill timing, expected receivables, and stress window analysis."
      />
    </motion.div>
  );
};

export default CashTiming;
