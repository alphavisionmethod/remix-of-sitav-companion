import { toast } from "sonner";
import { HeroCard, SummaryCard, StatusCard, TimelineCard } from "@/components/sita/cards";
import { ModuleAdvisorInsight } from "@/components/sita/domain-shared/ModuleAdvisorInsight";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { PremiumEmptyState } from "@/components/sita/PremiumEmptyState";
import { SectionSkeleton } from "@/components/sita/SectionSkeleton";
import { CashFlowChart } from "@/components/sita/SitaCharts";
import { AlertTriangle, DollarSign, TrendingDown, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useCashTimingWindows, useMoneyKPIs } from "@/hooks/use-domain-data";
import { useCashflowAnalysis, useCashflowForecast, useSafeToSpend } from "@/hooks/use-backend-actions";

const CashTiming = () => {
  const { data: windows = [], isLoading } = useCashTimingWindows();
  const { data: kpis } = useMoneyKPIs();
  const { data: cfAnalysis } = useCashflowAnalysis();
  const { data: cfForecast } = useCashflowForecast(90);
  const { data: safeToSpendData } = useSafeToSpend();

  const k = kpis || { safeToSpend: 0 };
  const safeToSpend = safeToSpendData?.safe_to_spend_cents
    ? Math.round(Number(safeToSpendData.safe_to_spend_cents) / 100)
    : k.safeToSpend;
  const minBalance = windows.length > 0 ? Math.min(...windows.map((w: Record<string, any>) => w.balance)) : 0;
  const stressWindows = windows.filter((w: Record<string, any>) => w.stress);

  if (isLoading) return <SectionSkeleton cards={3} columns={1} />;

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <PageTruthBanner />

      <HeroCard
        title="CASH TIMING & SAFE-TO-SPEND"
        metric={`$${safeToSpend.toLocaleString()}`}
        subtitle="Safe to spend after bills, reserves, and obligations"
        accentFrom="hsl(152 55% 48%)"
        accentTo="hsl(180 45% 42%)"
        icon={<DollarSign className="h-5 w-5 text-[hsl(152_55%_48%)]" />}
      >
        <div className="flex gap-6">
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wider text-[hsl(0_0%_50%)]">Low Point (15d)</p>
            <p className="font-display text-lg font-bold text-foreground">${minBalance.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wider text-[hsl(0_0%_50%)]">Stress Windows</p>
            <p className={`font-display text-lg font-bold ${stressWindows.length > 0 ? "text-[hsl(0_70%_55%)]" : "text-[hsl(152_55%_48%)]"}`}>{stressWindows.length}</p>
          </div>
        </div>
      </HeroCard>

      <CashFlowChart />

      {/* Cash Flow Timeline */}
      <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_9%)] overflow-hidden">
        <div className="px-4 pt-4 pb-2">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[hsl(0_0%_50%)]">Cash Flow Timeline</h3>
          <p className="text-[10px] text-[hsl(0_0%_40%)]">Projected balance over the next 15 days</p>
        </div>
        <div className="px-4 pb-4 space-y-1">
          {windows.map((w: any, i: number) => (
            <div key={i} className={`flex items-center gap-4 rounded-xl p-3 transition-all micro-hover-lift ${w.stress ? "bg-[hsl(0_70%_55%/0.05)] border border-[hsl(0_70%_55%/0.1)]" : "bg-[hsl(0_0%_100%/0.02)]"}`}>
              <div className="w-16 shrink-0">
                <p className={`text-sm font-semibold ${w.stress ? "text-[hsl(0_70%_55%)]" : "text-foreground"}`}>{w.day}</p>
              </div>
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 text-sm">
                <div>{w.inflows > 0 ? <span className="text-[hsl(152_55%_48%)] font-medium">+${w.inflows.toLocaleString()}</span> : <span className="text-muted-foreground">—</span>}</div>
                <div>{w.outflows > 0 ? <span className="text-[hsl(0_70%_55%)] font-medium">-${w.outflows.toLocaleString()}</span> : <span className="text-muted-foreground">—</span>}</div>
                <div className="text-right"><span className="font-display font-bold text-foreground">${w.balance.toLocaleString()}</span></div>
              </div>
              {w.stress && <AlertTriangle className="h-4 w-4 text-[hsl(0_70%_55%)] shrink-0" />}
            </div>
          ))}
        </div>
      </div>

      {/* Stress Windows + Forecast Confidence */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-2">
          {stressWindows.length > 0 ? stressWindows.map((sw: any, i: number) => (
            <StatusCard key={i} label={`${sw.day} — $${sw.outflows.toLocaleString()} outflow`} status={sw.outflows > 3000 ? "down" : "degraded"} lastChecked={`Balance drops to $${sw.balance.toLocaleString()}`} icon={<AlertTriangle className="h-3.5 w-3.5" />} />
          )) : (
            <StatusCard label="No stress windows detected" status="healthy" icon={<DollarSign className="h-3.5 w-3.5" />} />
          )}
        </div>

        <SummaryCard
          title="Forecast Confidence"
          kpis={[
            { label: "Bills (fixed)", value: "95%", trend: "up" },
            { label: "Receivables", value: "72%", trend: "flat" },
            { label: "Variable spend", value: "60%", trend: "flat" },
          ]}
        />
      </div>

      {/* Cashflow Storyline */}
      <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_9%)] p-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-primary" />
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[hsl(0_0%_50%)]">Cashflow Storyline</h3>
        </div>
        <div className="space-y-3 text-sm text-foreground">
          <p>
            This month, <span className="font-semibold text-[hsl(152_55%_48%)]">${safeToSpend > 0 ? (safeToSpend + (stressWindows.reduce((s: number, w: any) => s + w.outflows, 0))).toLocaleString() : "—"}</span> came in across your income sources. 
            Of that, <span className="font-semibold text-[hsl(0_70%_55%)]">${windows.reduce((s: number, w: any) => s + (w.outflows || 0), 0).toLocaleString()}</span> went to bills and obligations.
          </p>
          {stressWindows.length > 0 && (
            <p className="text-[hsl(0_70%_55%)]">
              ⚠ Watch out: {stressWindows.length} stress window{stressWindows.length > 1 ? "s" : ""} ahead — the heaviest outflow day is <span className="font-semibold">{stressWindows[0]?.day}</span> with ${stressWindows[0]?.outflows.toLocaleString()} going out.
            </p>
          )}
          <p>
            Your projected minimum balance is <span className={`font-semibold ${minBalance < 1000 ? "text-[hsl(0_70%_55%)]" : "text-foreground"}`}>${minBalance.toLocaleString()}</span>. 
            After all obligations, you have <span className="font-semibold text-[hsl(152_55%_48%)]">${safeToSpend.toLocaleString()}</span> safe to spend.
          </p>
          {stressWindows.length === 0 && (
            <p className="text-[hsl(152_55%_48%)]">✓ No cash flow concerns detected for the next 15 days. Your timing looks healthy.</p>
          )}
        </div>
      </div>

      <ModuleAdvisorInsight
        advisorName="Cash Flow Intelligence"
        domain="finance"
        insight={`${stressWindows.length} stress window${stressWindows.length !== 1 ? "s" : ""} in the next 15 days. Projected minimum balance: $${minBalance.toLocaleString()}.`}
        confidence={stressWindows.length === 0 ? 92 : 68}
        actions={[{ label: "View Forecast", onClick: () => toast.info("Forecast view coming soon") }]}
      />
    </motion.div>
  );
};

export default CashTiming;
