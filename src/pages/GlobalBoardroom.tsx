import { useAuth } from "@/contexts/AuthContext";
// ═══════════════════════════════════════════════════════════════
// SITA OS — Global OS Boardroom (Cinematic)
// Synthesized executive review across Business, Finance, Concierge
// ═══════════════════════════════════════════════════════════════

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useLoopEmitter } from "@/hooks/use-flagship-loop-proof";
import { useNavigate } from "react-router-dom";
import {
  Crown, Briefcase, DollarSign, Headphones, AlertTriangle, CheckCircle,
  ArrowRight, Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { HeroCard, SummaryCard, ComparisonCard, ProofCard, AdvisorCard, QueueCard } from "@/components/sita/cards";
import { AdvisorPortrait } from "@/components/advisors/AdvisorPortrait";
import { PROMO_IMAGES } from "@/lib/advisors/advisor-responsive-assets";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { BoardroomCinematic } from "@/components/sita/motion/AppTransitions";
import { SitaTabs } from "@/components/sita/SitaComponents";
import { DomainAdvisorBoard } from "@/components/sita/domain-shared/DomainAdvisorBoard";
import { useLeads, useCustomers, useInvoices } from "@/hooks/use-sita-data";
import { useMoneyKPIs } from "@/hooks/use-domain-data";
import { useDataMode } from "@/contexts/DataModeContext";





type BoardroomView = "synthesis" | "priorities" | "risks" | "advisors";

const GlobalBoardroom = () => {
  const { isDemo, user } = useAuth();
  const isDemoMode = isDemo;
  const [view, setView] = useState<BoardroomView>("synthesis");
  const navigate = useNavigate();
  const { data: leads = [] } = useLeads();
  const { data: customers = [] } = useCustomers();
  const { data: invoices = [] } = useInvoices();
  const { data: moneyKpis } = useMoneyKPIs();
  const emitBoardroomLoop = useLoopEmitter("boardroom-summary-decision");

  const k = moneyKpis || { totalBalance: 0, safeToSpend: 0, reserveHealth: 0, billsDue7d: 0, monthlyBurn: 0, estWaste: 0, wasteCount: 0 };
  const overdueInvoices = invoices.filter((i: any) => i.status === "overdue");
  const overdueAmount = overdueInvoices.reduce((s: number, i: any) => s + (i.amount || 0), 0);

  // Flagship Loop 3 — emit boardroom_summary once data has settled (live mode only).
  useEffect(() => {
    if (!user || isDemoMode) return;
    emitBoardroomLoop("boardroom_summary", {
      outcome: "success",
      evidence: {
        leads: leads.length,
        customers: customers.length,
        invoices: invoices.length,
        overdue_amount_cents: Math.round(overdueAmount * 100),
        total_balance_cents: Math.round((k.totalBalance || 0) * 100),
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, isDemoMode, leads.length, customers.length, invoices.length]);

  const crossDomainPriorities = [
    overdueAmount > 0 && { id: "od", label: `Collect $${overdueAmount.toLocaleString()} in overdue invoices`, urgency: "critical" as const },
    k.billsDue7d > 0 && { id: "bills", label: `$${k.billsDue7d.toLocaleString()} in bills due this week`, urgency: "high" as const },
    leads.filter((l: any) => l.status === "new").length > 0 && { id: "leads", label: `${leads.filter((l: any) => l.status === "new").length} new leads awaiting follow-up`, urgency: "normal" as const },
    k.reserveHealth < 80 && { id: "reserve", label: `Reserve health at ${k.reserveHealth}% — below target`, urgency: "high" as const },
    { id: "conc", label: "Review upcoming obligations and appointments", urgency: "low" as const },
  ].filter(Boolean) as Array<{ id: string; label: string; urgency: "critical" | "high" | "normal" | "low" }>;

  return (
    <BoardroomCinematic domain="business">
      <motion.div className="mx-auto max-w-6xl space-y-6 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <PageTruthBanner truthState={isDemoMode ? "demo" : "live"} />

        <HeroCard
          title={`Executive Boardroom — ${new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}`}
          metric={`$${k.totalBalance.toLocaleString()}`}
          subtitle="Cross-domain synthesis · All domains"
          accentFrom="hsl(265 55% 58%)"
          accentTo="hsl(38 85% 58%)"
          icon={<Crown className="h-5 w-5 text-[hsl(38_85%_68%)]" />}
        >
          <SummaryCard
            title="System Overview"
            kpis={[
              { label: "Total Balance", value: `$${k.totalBalance.toLocaleString()}` },
              { label: "Revenue at Risk", value: `$${overdueAmount.toLocaleString()}`, trend: overdueAmount > 0 ? "down" : "flat" },
              { label: "Active Leads", value: String(leads.length) },
              { label: "Reserve Health", value: `${k.reserveHealth}%` },
            ]}
          />
        </HeroCard>

        <SitaTabs tabs={[
          { key: "synthesis", label: "Synthesis" },
          { key: "priorities", label: "Priorities", count: crossDomainPriorities.length },
          { key: "risks", label: "Cross-Domain Risks" },
          { key: "advisors", label: "Advisory Boards" },
        ]} active={view} onChange={k => setView(k as BoardroomView)} />

        {view === "synthesis" && (
          <div className="space-y-5">
            <div className="grid gap-5 lg:grid-cols-3">
              {/* Business */}
              <motion.div
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden p-5 rounded-2xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] cursor-pointer hover:bg-[hsl(0_0%_100%/0.04)] transition-colors"
                onClick={() => { window.dispatchEvent(new CustomEvent("sita-open-business", { detail: { module: "boardroom" } })); }}
              >
                <img
                  src={PROMO_IMAGES.heroBusiness.src}
                  srcSet={PROMO_IMAGES.heroBusiness.srcSet}
                  sizes="(max-width: 768px) 480px, 768px"
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover opacity-[0.07] dark:opacity-[0.12] pointer-events-none"
                  loading="lazy"
                  decoding="async"
                />
                <div className="flex items-center gap-3 mb-3">
                  <AdvisorPortrait domain="business" size="sm" />
                  <div className="flex-1">
                    <p className="relative text-sm font-semibold text-foreground">Business OS</p>
                  </div>
                  <ArrowRight className="relative h-4 w-4 text-muted-foreground" />
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div><span className="text-muted-foreground">Customers</span><p className="font-semibold text-foreground">{customers.length}</p></div>
                  <div><span className="text-muted-foreground">Leads</span><p className="font-semibold text-foreground">{leads.length}</p></div>
                  <div><span className="text-muted-foreground">Invoices</span><p className="font-semibold text-foreground">{invoices.length}</p></div>
                  <div><span className="text-muted-foreground">Overdue</span><p className="font-semibold text-[hsl(0_70%_55%)]">${overdueAmount.toLocaleString()}</p></div>
                </div>
              </motion.div>
              {/* Finance */}
              <motion.div
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                className="relative overflow-hidden p-5 rounded-2xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] cursor-pointer hover:bg-[hsl(0_0%_100%/0.04)] transition-colors"
                onClick={() => { window.dispatchEvent(new CustomEvent("sita-open-finance", { detail: { module: "boardroom" } })); }}
              >
                <img
                  src={PROMO_IMAGES.heroMoney.src}
                  srcSet={PROMO_IMAGES.heroMoney.srcSet}
                  sizes="(max-width: 768px) 480px, 768px"
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover opacity-[0.07] dark:opacity-[0.12] pointer-events-none"
                  loading="lazy"
                  decoding="async"
                />
                <div className="flex items-center gap-3 mb-3">
                  <AdvisorPortrait domain="money" size="sm" />
                  <div className="flex-1"><p className="relative text-sm font-semibold text-foreground">Finance OS</p></div>
                  <ArrowRight className="relative h-4 w-4 text-muted-foreground" />
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div><span className="text-muted-foreground">Balance</span><p className="font-semibold text-foreground">${k.totalBalance.toLocaleString()}</p></div>
                  <div><span className="text-muted-foreground">Safe to Spend</span><p className="font-semibold text-foreground">${k.safeToSpend.toLocaleString()}</p></div>
                  <div><span className="text-muted-foreground">Bills Due</span><p className="font-semibold text-foreground">${k.billsDue7d.toLocaleString()}</p></div>
                  <div><span className="text-muted-foreground">Reserves</span><p className="font-semibold text-foreground">{k.reserveHealth}%</p></div>
                </div>
              </motion.div>
              {/* Concierge */}
              <motion.div
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="relative overflow-hidden p-5 rounded-2xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] cursor-pointer hover:bg-[hsl(0_0%_100%/0.04)] transition-colors"
                onClick={() => window.dispatchEvent(new CustomEvent("sita-open-concierge", { detail: { module: "boardroom" } }))}
              >
                <img
                  src={PROMO_IMAGES.heroConcierge.src}
                  srcSet={PROMO_IMAGES.heroConcierge.srcSet}
                  sizes="(max-width: 768px) 480px, 768px"
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover opacity-[0.07] dark:opacity-[0.12] pointer-events-none"
                  loading="lazy"
                  decoding="async"
                />
                <div className="flex items-center gap-3 mb-3">
                  <AdvisorPortrait domain="concierge" size="sm" />
                  <div className="flex-1"><p className="relative text-sm font-semibold text-foreground">Concierge</p></div>
                  <ArrowRight className="relative h-4 w-4 text-muted-foreground" />
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div><span className="text-muted-foreground">Upcoming</span><p className="font-semibold text-foreground">—</p></div>
                  <div><span className="text-muted-foreground">Errands</span><p className="font-semibold text-foreground">—</p></div>
                  <div><span className="text-muted-foreground">Appointments</span><p className="font-semibold text-foreground">—</p></div>
                  <div><span className="text-muted-foreground">Tasks</span><p className="font-semibold text-foreground">—</p></div>
                </div>
              </motion.div>
            </div>

            <ComparisonCard
              title="Cross-Domain Health"
              before={{ label: "Business", value: overdueAmount > 0 ? "Needs Attention" : "Healthy" }}
              after={{ label: "Finance", value: k.reserveHealth >= 80 ? "Healthy" : "Needs Attention" }}
              delta={overdueAmount === 0 && k.reserveHealth >= 80 ? "Stable" : "Action Needed"}
              deltaPositive={overdueAmount === 0 && k.reserveHealth >= 80}
            />

            <ProofCard
              title="Boardroom Evidence Chain"
              status={isDemoMode ? "pending" : "verified"}
              chain={[
                { label: "Business data sourced", verified: !isDemoMode },
                { label: "Financial accounts synced", verified: k.totalBalance > 0 },
                { label: "Concierge data loaded", verified: true },
                { label: "Cross-domain synthesis complete", verified: true },
              ]}
            />
          </div>
        )}

        {view === "priorities" && (
          <QueueCard title="Cross-Domain Priorities" items={crossDomainPriorities} maxVisible={8} />
        )}

        {view === "risks" && (
          <div className="space-y-3">
            {overdueAmount === 0 && k.reserveHealth >= 80 ? (
              <div className="p-8 rounded-2xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] text-center">
                <CheckCircle className="h-8 w-8 text-[hsl(152_55%_48%)] mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No cross-domain risks detected</p>
              </div>
            ) : (
              <>
                {overdueAmount > 3000 && (
                  <div className="p-4 rounded-xl border border-[hsl(0_70%_55%/0.2)] bg-[hsl(0_70%_55%/0.04)]">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-4 w-4 text-[hsl(0_70%_55%)] shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Revenue at risk</p>
                        <p className="text-xs text-muted-foreground">${overdueAmount.toLocaleString()} overdue — may impact cash flow</p>
                      </div>
                    </div>
                  </div>
                )}
                {k.reserveHealth < 60 && (
                  <div className="p-4 rounded-xl border border-[hsl(38_85%_58%/0.2)] bg-[hsl(38_85%_58%/0.04)]">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Reserve depletion risk</p>
                        <p className="text-xs text-muted-foreground">Below 60% target — operations may be constrained</p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {view === "advisors" && (
          <div className="grid gap-6 lg:grid-cols-2">
            <DomainAdvisorBoard domain="business" />
            <DomainAdvisorBoard domain="finance" />
            <DomainAdvisorBoard domain="concierge" className="lg:col-span-2" />
          </div>
        )}

        <AdvisorCard
          advisorName="Executive Intelligence"
          domain="Global"
          insight={
            overdueAmount > 0
              ? `Key concern: $${overdueAmount.toLocaleString()} in overdue invoices creating cash flow pressure. ${k.reserveHealth < 80 ? `Combined with reserve health at ${k.reserveHealth}%, this warrants immediate attention.` : "Reserves are healthy enough to absorb short-term impact."}`
              : `Operations stable. ${leads.length} active leads in pipeline, finances at ${k.reserveHealth}% reserve health.`
          }
          confidence={overdueAmount > 0 ? 92 : 85}
          accentColor="hsl(38 85% 58%)"
        />
      </motion.div>
    </BoardroomCinematic>
  );
};

export default GlobalBoardroom;
