import { SitaPageHeader, SitaCard, SitaCardTitle, SitaSectionHeader, SitaButton } from "@/components/sita/SitaCard";
import { KPITile, RiskCard, OpportunityCard } from "@/components/sita/SitaComponents";
import { TrustBadge } from "@/components/sita/TrustBadge";
import { CashFlowChart } from "@/components/sita/SitaCharts";
import { SectionSkeleton } from "@/components/sita/SectionSkeleton";
import { Shield, DollarSign, TrendingUp, TrendingDown, AlertTriangle, Clock, ArrowRight, CheckCircle, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { LiveAdvisorCard } from "@/components/sita/LiveAdvisorCard";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";
import { useCashTimingWindows, useMoneyKPIs } from "@/hooks/use-domain-data";
import { useCashflowAnalysis, useCashflowForecast, useSafeToSpend } from "@/hooks/use-backend-actions";


interface CashTimingRow {
  balance?: unknown;
  stress?: unknown;
}

const CashTiming = () => {
  const { data: windows = [], isLoading } = useCashTimingWindows();
  const { data: kpis } = useMoneyKPIs();

  // Wire to cashflow-calculate edge function
  const { data: cfAnalysis } = useCashflowAnalysis();
  const { data: cfForecast } = useCashflowForecast(90);
  const { data: safeToSpendData } = useSafeToSpend();

  const k = kpis || { safeToSpend: 0 };

  // Prefer edge function data when available, fallback to demo
  const safeToSpend = safeToSpendData?.safe_to_spend_cents
    ? Math.round(Number(safeToSpendData.safe_to_spend_cents) / 100)
    : k.safeToSpend;
  const minBalance = windows.length > 0 ? Math.min(...windows.map((w: CashTimingRow) => w.balance)) : 0;
  const stressWindows = windows.filter((w: CashTimingRow) => w.stress);

  if (isLoading) return <SectionSkeleton cards={3} columns={1} />;

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <DemoModeBadge />
      <SitaPageHeader title="Cash Timing & Safe-to-Spend" subtitle="Understand your money flow, avoid collisions" />

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

      <CashFlowChart />

      <SitaCard hover={false}>
        <SitaCardTitle sub="Projected balance over the next 15 days">Cash Flow Timeline</SitaCardTitle>
        <div className="mt-4 space-y-1">
          {windows.map((w: any, i: number) => (
            <div key={i} className={`flex items-center gap-4 rounded-xl p-3.5 transition-all ${w.stress ? "bg-urgency-high/5 border border-urgency-high/10" : "bg-secondary/20"}`}>
              <div className="w-16 shrink-0">
                <p className={`text-sm font-semibold ${w.stress ? "text-urgency-high" : "text-foreground"}`}>{w.day}</p>
              </div>
              <div className="flex-1 grid grid-cols-3 gap-4 text-sm">
                <div>{w.inflows > 0 ? <span className="text-trust-verified font-medium">+${w.inflows.toLocaleString()}</span> : <span className="text-muted-foreground">—</span>}</div>
                <div>{w.outflows > 0 ? <span className="text-urgency-high font-medium">-${w.outflows.toLocaleString()}</span> : <span className="text-muted-foreground">—</span>}</div>
                <div className="text-right"><span className="font-display font-bold text-foreground">${w.balance.toLocaleString()}</span></div>
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
        <div className="space-y-4">
          <SitaSectionHeader title="Stress Windows" />
          {stressWindows.length > 0 ? stressWindows.map((sw: any, i: number) => (
            <RiskCard key={i} title={`${sw.day} — $${sw.outflows.toLocaleString()} outflow`} description={`Balance drops to $${sw.balance.toLocaleString()}`} severity={sw.outflows > 3000 ? "high" : "medium"} />
          )) : (
            <SitaCard hover={false} className="p-4"><p className="text-sm text-muted-foreground">No stress windows detected</p></SitaCard>
          )}
        </div>

        <div className="space-y-4">
          <SitaSectionHeader title="Forecast Confidence" />
          <SitaCard hover={false} className="p-4">
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
        demoRecommendation={`${stressWindows.length} stress window${stressWindows.length !== 1 ? "s" : ""} in the next 15 days. Projected minimum balance: $${minBalance.toLocaleString()}.`}
        demoReasoning="Based on 15-day cash flow projection, bill timing, expected receivables, and stress window analysis."
      />
    </motion.div>
  );
};

export default CashTiming;
