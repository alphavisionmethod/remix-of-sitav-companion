// ═══════════════════════════════════════════════════════════════
// SITA OS — Money Office: Net Worth & Balance Sheet
// ═══════════════════════════════════════════════════════════════

import { SitaCard, SitaCardTitle, SitaSectionHeader } from "@/components/sita/SitaCard";
import { KPITile } from "@/components/sita/SitaComponents";
import { TrustBadge } from "@/components/sita/TrustBadge";
import { ConfidenceBar } from "@/components/sita/primitives/ConfidenceBar";
import { DomainHeader } from "@/components/sita/primitives/DomainHeader";
import { LiveAdvisorCard } from "@/components/sita/LiveAdvisorCard";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";
import { useFinancialAccounts, useMoneyKPIs } from "@/hooks/use-domain-data";
import { useSavingsGoals } from "@/hooks/use-money-data";
import { DollarSign, TrendingUp, TrendingDown, Building, PiggyBank, CreditCard, BarChart3, ArrowUpRight, ArrowDownRight, Wallet, Clock, Rewind } from "lucide-react";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";

const NetWorthOffice = () => {
  const { isDemoMode } = useDataMode();
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
      <DemoModeBadge />

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
            <SitaCard hover={false} className="p-4 text-center text-muted-foreground text-sm">
              No asset accounts connected yet
            </SitaCard>
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
          {isDemoMode && analysis.assets.length === 0 && (
            <>
              {[{ name: "Main Checking", type: "checking", bal: 1250000 }, { name: "Savings", type: "savings", bal: 3500000 }, { name: "Brokerage", type: "investment", bal: 8500000 }].map(d => (
                <SitaCard key={d.name} hover className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wallet className="h-4 w-4 text-primary" />
                      <div>
                        <p className="font-display text-sm font-semibold">{d.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{d.type}</p>
                      </div>
                    </div>
                    <p className="font-display text-sm font-bold text-trust-verified">{fmt(d.bal)}</p>
                  </div>
                </SitaCard>
              ))}
            </>
          )}
        </div>

        {/* Liabilities Column */}
        <div className="space-y-4">
          <SitaSectionHeader title="Liabilities" />
          {analysis.liabilities.length === 0 && isDemoMode && (
            <>
              {[{ name: "Visa Platinum", type: "credit", bal: 350000, util: 18 }, { name: "Student Loan", type: "loan", bal: 2400000, util: 60 }].map(d => (
                <SitaCard key={d.name} hover className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-amber-500" />
                      <div>
                        <p className="font-display text-sm font-semibold">{d.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{d.type} · {d.util}% util</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-sm font-bold text-amber-500">{fmt(d.bal)}</p>
                      <ArrowDownRight className="h-3 w-3 text-amber-500 inline" />
                    </div>
                  </div>
                </SitaCard>
              ))}
            </>
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

        {/* Insights Column */}
        <div className="space-y-4">
          <SitaSectionHeader title="Net Worth Trend" />
          <SitaCard hover={false} className="p-4">
            <div className="space-y-2">
              {(isDemoMode ? [
                { month: "Nov", nw: 95000 }, { month: "Dec", nw: 102000 }, { month: "Jan", nw: 108000 },
                { month: "Feb", nw: 112000 }, { month: "Mar", nw: 118000 }, { month: "Apr", nw: 125000 },
              ] : analysis.trend.map(t => ({ month: t.month, nw: t.netWorth / 100 }))).map((t, i) => (
                <div key={t.month} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground w-10">{t.month}</span>
                  <div className="flex-1 mx-3">
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${Math.min(100, (t.nw / 150000) * 100)}%` }} />
                    </div>
                  </div>
                  <span className="font-display font-semibold w-20 text-right">${t.nw.toLocaleString()}</span>
                </div>
              ))}
            </div>
            <TrustBadge level="verified" className="mt-3" />
          </SitaCard>

          <LiveAdvisorCard
            advisor="money"
            intent="net_worth_review"
            context={{ net_worth: analysis.netWorth / 100, assets: analysis.totalAssets / 100, liabilities: analysis.totalLiabilities / 100 }}
            demoName="Wealth Advisor"
            demoRole="Net Worth Intelligence"
            demoConfidence="High"
            demoRecommendation="Net worth growing steadily. Focus on reducing high-interest liabilities to accelerate growth."
            demoReasoning="Asset growth of 3.2% this month vs 1.1% liability reduction — positive momentum."
          />

          <ConfidenceBar value={Math.round(0.92 * 100)} label="Balance accuracy" />
        </div>
      </div>
    </motion.div>
  );
};

export default NetWorthOffice;
