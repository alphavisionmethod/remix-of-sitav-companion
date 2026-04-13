// ═══════════════════════════════════════════════════════════════
// SITA OS — Global OS Boardroom
// Synthesized executive review across Business, Finance, Concierge
// ═══════════════════════════════════════════════════════════════

import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Crown, Briefcase, DollarSign, Headphones, AlertTriangle, CheckCircle,
  TrendingUp, Clock, ArrowRight, Sparkles, Shield, BarChart3, Target
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SitaCard, SitaCardTitle, SitaButton } from "@/components/sita/SitaCard";
import { SitaTabs, KPITile } from "@/components/sita/SitaComponents";
import { ConfidenceBar } from "@/components/sita/primitives/ConfidenceBar";
import { DomainAdvisorCard } from "@/components/advisors/DomainAdvisorCard";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";
import { useLeads, useCustomers, useInvoices } from "@/hooks/use-sita-data";
import { useMoneyKPIs } from "@/hooks/use-domain-data";

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

type BoardroomView = "synthesis" | "priorities" | "risks" | "domains";

const DomainSummaryCard = ({ domain, icon: Icon, accent, title, metrics, status, onDive }: {
  domain: string; icon: typeof Briefcase; accent: string; title: string;
  metrics: { label: string; value: string }[]; status: "healthy" | "attention" | "critical"; onDive: () => void;
}) => {
  const statusConfig = {
    healthy: { label: "Healthy", color: "text-[hsl(152_55%_48%)]", bg: "bg-[hsl(152_55%_48%/0.1)]" },
    attention: { label: "Needs Attention", color: "text-amber-500", bg: "bg-amber-500/10" },
    critical: { label: "Critical", color: "text-[hsl(0_70%_55%)]", bg: "bg-[hsl(0_70%_55%/0.1)]" },
  };
  const s = statusConfig[status];

  return (
    <motion.div variants={fadeUp}>
      <SitaCard hover className="p-5 cursor-pointer" onClick={onDive}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: accent }}>
            <Icon className="h-4.5 w-4.5 text-[hsl(0_0%_100%/0.95)]" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">{title}</p>
            <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full", s.bg, s.color)}>{s.label}</span>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {metrics.map(m => (
            <div key={m.label}>
              <p className="text-[10px] text-muted-foreground">{m.label}</p>
              <p className="font-display text-sm font-bold text-foreground">{m.value}</p>
            </div>
          ))}
        </div>
      </SitaCard>
    </motion.div>
  );
};

const GlobalBoardroom = () => {
  const [view, setView] = useState<BoardroomView>("synthesis");
  const navigate = useNavigate();
  const { isDemoMode } = useDataMode();
  const { data: leads = [] } = useLeads();
  const { data: customers = [] } = useCustomers();
  const { data: invoices = [] } = useInvoices();
  const { data: moneyKpis } = useMoneyKPIs();

  const k = moneyKpis || { totalBalance: 0, safeToSpend: 0, reserveHealth: 0, billsDue7d: 0, monthlyBurn: 0, estWaste: 0, wasteCount: 0 };
  const overdueInvoices = invoices.filter((i: any) => i.status === "overdue");
  const overdueAmount = overdueInvoices.reduce((s: number, i: any) => s + (i.amount || 0), 0);
  const businessStatus = overdueAmount > 5000 ? "critical" : overdueAmount > 0 ? "attention" : "healthy";
  const financeStatus = k.reserveHealth < 50 ? "critical" : k.reserveHealth < 80 ? "attention" : "healthy";

  const crossDomainPriorities = [
    overdueAmount > 0 && { text: `Collect $${overdueAmount.toLocaleString()} in overdue invoices`, domain: "business", urgency: "critical" as const },
    k.billsDue7d > 0 && { text: `$${k.billsDue7d.toLocaleString()} in bills due this week`, domain: "finance", urgency: "high" as const },
    leads.filter((l: any) => l.status === "new").length > 0 && { text: `${leads.filter((l: any) => l.status === "new").length} new leads awaiting follow-up`, domain: "business", urgency: "medium" as const },
    k.reserveHealth < 80 && { text: `Reserve health at ${k.reserveHealth}% — below target`, domain: "finance", urgency: "high" as const },
    { text: "Review upcoming obligations and appointments", domain: "concierge", urgency: "low" as const },
  ].filter(Boolean) as { text: string; domain: string; urgency: "critical" | "high" | "medium" | "low" }[];

  const crossDomainRisks = [
    overdueAmount > 3000 && { title: "Revenue at risk", description: `$${overdueAmount.toLocaleString()} overdue — may impact cash flow`, severity: "high" as const, domain: "business→finance" },
    k.reserveHealth < 60 && { title: "Reserve depletion risk", description: "Below 60% target — operations may be constrained", severity: "high" as const, domain: "finance" },
    k.wasteCount > 2 && { title: "Subscription waste detected", description: `${k.wasteCount} unused subscriptions totaling $${k.estWaste}/mo`, severity: "medium" as const, domain: "finance→business" },
  ].filter(Boolean) as { title: string; description: string; severity: "high" | "medium"; domain: string }[];

  return (
    <motion.div className="mx-auto max-w-6xl space-y-6 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <DemoModeBadge />

      {/* Hero */}
      <motion.div className="rounded-2xl border border-[hsl(0_0%_100%/0.08)] overflow-hidden" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="h-[3px] bg-gradient-to-r from-[hsl(265_55%_58%)] via-[hsl(152_55%_48%)] to-[hsl(285_55%_55%)]" />
        <div className="bg-[hsl(0_0%_100%/0.02)] px-6 py-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(265_55%_58%)] to-[hsl(38_85%_58%)] flex items-center justify-center">
              <Crown className="h-5 w-5 text-[hsl(0_0%_100%/0.95)]" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-foreground">Executive Boardroom</h1>
              <p className="text-xs text-muted-foreground">Cross-domain synthesis · {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Total Balance</p><p className="font-display text-2xl font-bold text-foreground">${k.totalBalance.toLocaleString()}</p></div>
            <div><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Revenue at Risk</p><p className="font-display text-2xl font-bold text-[hsl(0_70%_55%)]">${overdueAmount.toLocaleString()}</p></div>
            <div><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Active Leads</p><p className="font-display text-2xl font-bold text-foreground">{leads.length}</p></div>
            <div><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Reserve Health</p><p className="font-display text-2xl font-bold text-foreground">{k.reserveHealth}%</p></div>
          </div>
        </div>
      </motion.div>

      <SitaTabs tabs={[
        { key: "synthesis", label: "Synthesis" },
        { key: "priorities", label: "Priorities", count: crossDomainPriorities.length },
        { key: "risks", label: "Risks", count: crossDomainRisks.length },
        { key: "domains", label: "Domain Deep-Dive" },
      ]} active={view} onChange={k => setView(k as BoardroomView)} />

      {/* Synthesis View */}
      {view === "synthesis" && (
        <motion.div className="grid gap-6 lg:grid-cols-3" variants={stagger} initial="hidden" animate="show">
          <DomainSummaryCard
            domain="business" icon={Briefcase} accent="linear-gradient(135deg, hsl(265 55% 58%), hsl(285 50% 48%))"
            title="Business OS"
            metrics={[
              { label: "Customers", value: String(customers.length) },
              { label: "Active Leads", value: String(leads.length) },
              { label: "Invoices", value: String(invoices.length) },
              { label: "Overdue", value: `$${overdueAmount.toLocaleString()}` },
            ]}
            status={businessStatus}
            onDive={() => navigate("/business/boardroom")}
          />
          <DomainSummaryCard
            domain="finance" icon={DollarSign} accent="linear-gradient(135deg, hsl(152 55% 48%), hsl(165 50% 42%))"
            title="Finance OS"
            metrics={[
              { label: "Balance", value: `$${k.totalBalance.toLocaleString()}` },
              { label: "Safe to Spend", value: `$${k.safeToSpend.toLocaleString()}` },
              { label: "Bills Due", value: `$${k.billsDue7d.toLocaleString()}` },
              { label: "Reserves", value: `${k.reserveHealth}%` },
            ]}
            status={financeStatus}
            onDive={() => navigate("/money/boardroom")}
          />
          <DomainSummaryCard
            domain="concierge" icon={Headphones} accent="linear-gradient(135deg, hsl(285 55% 55%), hsl(310 50% 48%))"
            title="Concierge"
            metrics={[
              { label: "Upcoming", value: "—" },
              { label: "Errands", value: "—" },
              { label: "Appointments", value: "—" },
              { label: "Tasks", value: "—" },
            ]}
            status="healthy"
            onDive={() => navigate("/concierge/boardroom")}
          />
        </motion.div>
      )}

      {/* Priorities View */}
      {view === "priorities" && (
        <motion.div className="space-y-2" variants={stagger} initial="hidden" animate="show">
          {crossDomainPriorities.map((p, i) => (
            <motion.div key={i} variants={fadeUp}>
              <SitaCard className="p-4" lane={p.urgency === "critical" ? "action" : undefined}>
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[hsl(265_55%_58%)] to-[hsl(38_85%_58%)] font-display text-xs font-bold text-[hsl(0_0%_100%)]">{i + 1}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{p.text}</p>
                    <p className="text-[10px] text-muted-foreground capitalize">{p.domain}</p>
                  </div>
                  <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full",
                    p.urgency === "critical" ? "bg-[hsl(0_70%_55%/0.1)] text-[hsl(0_70%_55%)]" :
                    p.urgency === "high" ? "bg-amber-500/10 text-amber-500" :
                    "bg-muted text-muted-foreground"
                  )}>{p.urgency}</span>
                </div>
              </SitaCard>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Risks View */}
      {view === "risks" && (
        <motion.div className="space-y-3" variants={stagger} initial="hidden" animate="show">
          {crossDomainRisks.length === 0 ? (
            <SitaCard hover={false} className="p-8 text-center">
              <CheckCircle className="h-8 w-8 text-[hsl(152_55%_48%)] mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No cross-domain risks detected</p>
            </SitaCard>
          ) : crossDomainRisks.map((r, i) => (
            <motion.div key={i} variants={fadeUp}>
              <SitaCard lane="action" className="p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className={cn("h-4 w-4 shrink-0 mt-0.5", r.severity === "high" ? "text-[hsl(0_70%_55%)]" : "text-amber-500")} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{r.title}</p>
                    <p className="text-xs text-muted-foreground">{r.description}</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-1">{r.domain}</p>
                  </div>
                  <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0",
                    r.severity === "high" ? "bg-[hsl(0_70%_55%/0.1)] text-[hsl(0_70%_55%)]" : "bg-amber-500/10 text-amber-500"
                  )}>{r.severity}</span>
                </div>
              </SitaCard>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Domain Deep-Dive */}
      {view === "domains" && (
        <div className="grid gap-6 lg:grid-cols-3">
          <DomainAdvisorCard domain="business" insights={[
            { id: "b1", text: overdueAmount > 0 ? `$${overdueAmount.toLocaleString()} needs collection attention` : "All invoices current", confidence: overdueAmount > 0 ? 92 : 85, action: "Review", onAction: () => navigate("/business/invoices") },
            { id: "b2", text: `${leads.filter((l: any) => l.status === "new").length} leads need engagement`, confidence: 78, action: "Leads", onAction: () => navigate("/business/leads") },
          ]} />
          <DomainAdvisorCard domain="finance" insights={[
            { id: "f1", text: `Reserve health: ${k.reserveHealth}%`, confidence: 88 },
            { id: "f2", text: k.billsDue7d > 0 ? `$${k.billsDue7d.toLocaleString()} bills due this week` : "No bills due soon", confidence: 95, action: "Bills", onAction: () => navigate("/money/bills") },
          ]} />
          <DomainAdvisorCard domain="concierge" insights={[
            { id: "c1", text: "Review upcoming obligations for the week", confidence: 72, action: "Upcoming", onAction: () => navigate("/concierge/upcoming") },
          ]} />
        </div>
      )}

      {/* Cross-domain advisor */}
      <SitaCard hover={false} className="p-5 border-[hsl(38_85%_58%/0.2)] bg-gradient-to-br from-[hsl(38_85%_58%/0.04)] to-[hsl(265_55%_58%/0.02)]">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[hsl(38_85%_58%)] to-[hsl(265_55%_58%)] flex items-center justify-center shrink-0">
            <Sparkles className="h-4 w-4 text-[hsl(0_0%_100%/0.95)]" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">Executive Intelligence</p>
            <p className="text-xs text-muted-foreground mt-1">
              {overdueAmount > 0
                ? `Key concern: $${overdueAmount.toLocaleString()} in overdue invoices is creating cash flow pressure. ${k.reserveHealth < 80 ? `Combined with reserve health at ${k.reserveHealth}%, this warrants immediate attention.` : "Reserves are healthy enough to absorb short-term impact."}`
                : `Operations are stable. ${leads.length} active leads in pipeline, finances at ${k.reserveHealth}% reserve health. Focus on growth and household logistics.`
              }
            </p>
          </div>
        </div>
      </SitaCard>
    </motion.div>
  );
};

export default GlobalBoardroom;
