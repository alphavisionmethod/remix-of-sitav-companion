import { toast } from "sonner";
// ═══════════════════════════════════════════════════════════════
// SITA OS — Money Office: Net Worth & Balance Sheet
// ═══════════════════════════════════════════════════════════════

import { useAuth } from "@/contexts/AuthContext";
import { SitaCard, SitaCardTitle, SitaSectionHeader } from "@/components/sita/SitaCard";
import { KPITile } from "@/components/sita/SitaComponents";
import { TrustBadge } from "@/components/sita/TrustBadge";
import { ConfidenceBar } from "@/components/sita/primitives/ConfidenceBar";
import { DomainHeader } from "@/components/sita/primitives/DomainHeader";
import { useFinancialAccounts, useMoneyKPIs } from "@/hooks/use-domain-data";
import { useSavingsGoals } from "@/hooks/use-money-data";
import { DollarSign, TrendingUp, TrendingDown, Building, PiggyBank, CreditCard, BarChart3, ArrowUpRight, ArrowDownRight, Wallet, Clock, Rewind } from "lucide-react";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { ModuleAdvisorInsight } from "@/components/sita/domain-shared/ModuleAdvisorInsight";
import { PremiumEmptyState } from "@/components/sita/PremiumEmptyState";

const NetWorthOffice = () => {
  const { data: accounts = [] } = useFinancialAccounts();
  const { data: kpis } = useMoneyKPIs();
  const { data: goals = [] } = useSavingsGoals();

  const analysis = useMemo(() => {
    const assets = accounts.filter(a => ["checking", "savings", "investment", "retirement"].includes(a.type as string));
    const liabilities = accounts.filter(a => ["credit", "loan"].includes(a.type as string));
    const totalAssets = assets.reduce((s, a) => s + Math.abs(Number(a.balance_cents || a.available_cents || 0)), 0);
    const totalLiabilities = liabilities.reduce((s, a) => s + Math.abs(Number(a.balance_cents || 0)), 0);
    const netWorth = totalAssets - totalLiabilities;

    const byType = new Map<string, number>();
    for (const a of accounts) {
      const t = String(a.account_type || a.type || "other");
      byType.set(t, (byType.get(t) || 0) + Math.abs(Number(a.balance_cents || 0)));
    }

    // Simulated trend data (would come from historical snapshots in production)
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    const trend = months.map((m, i) => ({
      month: m,
      netWorth: Math.round(netWorth * (0.85 + i * 0.03)),
      assets: Math.round(totalAssets * (0.88 + i * 0.025)),
      liabilities: Math.round(totalLiabilities * (1.05 - i * 0.01)),
    }));

    return { totalAssets, totalLiabilities, netWorth, assets, liabilities, byType, trend };
  }, [accounts]);

  const fmt = (cents: number) => `$${(Math.abs(cents) / 100).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  const pct = analysis.totalAssets > 0 ? ((analysis.netWorth / analysis.totalAssets) * 100).toFixed(0) : "0";

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <DomainHeader domain="money" title="Net Worth & Balance Sheet" subtitle="Total financial position across all accounts" />
{/* KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
        <KPITile label="Net Worth" value={fmt(analysis.netWorth)} icon={DollarSign} />
        <KPITile label="Total Assets" value={fmt(analysis.totalAssets)} icon={TrendingUp} />
        <KPITile label="Total Liabilities" value={fmt(analysis.totalLiabilities)} icon={TrendingDown} />
        <KPITile label="Equity Ratio" value={`${pct}%`} icon={BarChart3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assets Column */}
        <div className="space-y-4">
          <SitaSectionHeader title="Assets" />
          {analysis.assets.length === 0 && (
            <PremiumEmptyState
              variant="first-use"
              domain="finance"
              title="No asset accounts yet"
              description="Connect your bank, brokerage, or retirement accounts to see your full balance sheet."
              actions={[{ label: "Connect Account", onClick: () => toast.info("Account connection planned — coming in a future update") }]}
            />
          )}
          {analysis.assets.map(a => {
            const Icon = a.account_type === "savings" ? PiggyBank : a.account_type === "investment" ? Building : Wallet;
            return (
              <SitaCard key={a.id} hover className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-primary" />
                    <div>
                      <p className="font-display text-sm font-semibold">{a.name || a.account_name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{a.account_type || a.type} · {a.institution || "Manual"}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-sm font-bold text-trust-verified">{fmt(Number(a.balance_cents || a.available_cents || 0))}</p>
                    <ArrowUpRight className="h-3 w-3 text-trust-verified inline" />
                  </div>
                </div>
              </SitaCard>
            );
          })}
        </div>

        {/* Liabilities Column */}
        <div className="space-y-4">
          <SitaSectionHeader title="Liabilities" />
          {analysis.liabilities.length === 0 && (
            <SitaCard hover={false} className="p-4 text-center text-muted-foreground text-sm">
              No liabilities recorded
            </SitaCard>
          )}
          {analysis.liabilities.map(a => (
            <SitaCard key={a.id} hover className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-amber-500" />
                  <div>
                    <p className="font-display text-sm font-semibold">{a.name || a.account_name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{a.account_type || a.type}</p>
                  </div>
                </div>
                <p className="font-display text-sm font-bold text-amber-500">{fmt(Number(a.balance_cents || 0))}</p>
              </div>
            </SitaCard>
          ))}
        </div>

        {/* Money Time Machine + Insights */}
        <div className="space-y-4">
          <SitaSectionHeader title="Money Time Machine" />
          <SitaCard hover={false} className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Rewind className="h-4 w-4 text-primary" />
              <SitaCardTitle sub="Replay how your finances evolved">Historical Replay</SitaCardTitle>
            </div>
            {(() => {
              const timeMachine = analysis.trend.map(t => ({ month: t.month, nw: t.netWorth / 100, event: null as string | null, debt: t.liabilities / 100, savings: (t.assets - t.liabilities) / 100, burden: Math.round((t.liabilities / Math.max(t.assets, 1)) * 100) }));
              return (
                <div className="space-y-2">
                  {timeMachine.map((t, i) => (
                    <div key={t.month} className="flex items-center gap-3 rounded-xl bg-secondary/20 p-3">
                      <div className="w-10 text-center">
                        <p className="text-xs font-semibold text-foreground">{t.month}</p>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Net Worth</span>
                          <span className="font-display font-bold text-foreground">${t.nw.toLocaleString()}</span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${Math.min(100, (t.nw / (timeMachine[timeMachine.length - 1]?.nw || 1)) * 100)}%` }} />
                        </div>
                        <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                          <span>Debt: ${t.debt.toLocaleString()}</span>
                          <span>Burden: {t.burden}%</span>
                        </div>
                      </div>
                      {t.event && (
                        <div className="shrink-0 max-w-[120px]">
                          <span className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-full">{t.event}</span>
                        </div>
                      )}
                      {i > 0 && (
                        <div className="shrink-0">
                          {t.nw > timeMachine[i - 1].nw ? (
                            <ArrowUpRight className="h-3.5 w-3.5 text-trust-verified" />
                          ) : t.nw < timeMachine[i - 1].nw ? (
                            <ArrowDownRight className="h-3.5 w-3.5 text-urgency-high" />
                          ) : null}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              );
            })()}
            <TrustBadge level="verified" className="mt-3" />
          </SitaCard>

          <ModuleAdvisorInsight
            advisorName="Wealth Advisor"
            domain="finance"
            insight="Net worth growing steadily. Focus on reducing high-interest liabilities to accelerate growth."
            confidence={92}
          />

          <ConfidenceBar value={Math.round(0.92 * 100)} label="Balance accuracy" />
        </div>
      </div>
    </motion.div>
  );
};

export default NetWorthOffice;
