// ═══════════════════════════════════════════════════════════════
// SITA OS — Daily Pulse (Cross-Domain Morning Briefing)
// Flagship surface — new design system cards throughout
// ═══════════════════════════════════════════════════════════════

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { HeroCard, SummaryCard, QueueCard, AdvisorCard, StatusCard } from "@/components/sita/cards";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { ListReveal, ListRevealItem } from "@/components/sita/motion/AppTransitions";
import { motion } from "framer-motion";
import {
  Briefcase, DollarSign, CheckCircle, ArrowRight, Brain,
  Home, TrendingUp, Calendar, Sparkles, AlertTriangle,
  Clock, Users, Receipt, Target, ShoppingCart, Bell,
  Wallet, BarChart3, Mail, ChevronDown, ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Helpers ──────────────────────────────────────────────────

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function formatDate(): string {
  return new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

// ── Domain Config ────────────────────────────────────────────

const DOMAIN_ACCENTS = {
  business: { from: "hsl(217 90% 55%)", to: "hsl(217 70% 45%)" },
  money:    { from: "hsl(160 60% 45%)", to: "hsl(152 55% 48%)" },
  concierge:{ from: "hsl(292 60% 55%)", to: "hsl(265 55% 58%)" },
} as const;

type DomainKey = keyof typeof DOMAIN_ACCENTS;

interface PulseMetric {
  id: string;
  domain: DomainKey;
  label: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  route: string;
}

function usePulseData(): PulseMetric[] {
  return useMemo(() => [
    { id: "revenue", domain: "business", label: "Revenue Today", value: "$2,450", change: "+12%", changeType: "positive", route: "/business" },
    { id: "pipeline", domain: "business", label: "Pipeline Value", value: "$84K", change: "6 active deals", changeType: "neutral", route: "/business" },
    { id: "leads", domain: "business", label: "New Leads", value: "4", change: "+2 this week", changeType: "positive", route: "/business" },
    { id: "callbacks", domain: "business", label: "Follow-ups Due", value: "3", change: "1 overdue", changeType: "negative", route: "/business" },
    { id: "cash", domain: "money", label: "Cash Position", value: "$42K", change: "Healthy", changeType: "positive", route: "/money" },
    { id: "bills", domain: "money", label: "Bills Due", value: "3", change: "$4,230 total", changeType: "neutral", route: "/money" },
    { id: "savings", domain: "money", label: "Savings Rate", value: "18%", change: "+2% vs avg", changeType: "positive", route: "/money" },
    { id: "spending", domain: "money", label: "Spending Today", value: "$145", change: "Under budget", changeType: "positive", route: "/money" },
    { id: "tasks", domain: "concierge", label: "Tasks Today", value: "6", change: "2 urgent", changeType: "negative", route: "/concierge" },
    { id: "meetings", domain: "concierge", label: "Meetings", value: "2", change: "Next at 10:30 AM", changeType: "neutral", route: "/concierge" },
    { id: "groceries", domain: "concierge", label: "Grocery Order", value: "Queued", change: "Delivery Mon", changeType: "neutral", route: "/concierge" },
    { id: "reminders", domain: "concierge", label: "Reminders", value: "4", change: "1 recurring", changeType: "neutral", route: "/concierge" },
  ], []);
}

const PENDING_APPROVALS = [
  { id: "1", title: "Invoice #1847 — $3,200", domain: "money" as DomainKey, urgency: "medium" as const },
  { id: "2", title: "Proposal for Acme Corp", domain: "business" as DomainKey, urgency: "high" as const },
  { id: "3", title: "Grocery delivery — $145", domain: "concierge" as DomainKey, urgency: "low" as const },
  { id: "4", title: "Subscription renewal — $49/mo", domain: "money" as DomainKey, urgency: "medium" as const },
];

// ── Component ────────────────────────────────────────────────

export default function DailyPulse() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [approvalsOpen, setApprovalsOpen] = useState(false);
  const allCards = usePulseData();

  const firstName = user?.user_metadata?.full_name?.split(" ")[0]
    || user?.email?.split("@")[0]
    || "there";

  const byDomain = (d: DomainKey) => allCards.filter(c => c.domain === d);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-8">
      <h1 className="sr-only">Daily Pulse</h1>
      <PageTruthBanner />

      {/* Hero Greeting */}
      <HeroCard
        title={formatDate()}
        metric={`${getGreeting()}, ${firstName}`}
        subtitle="Cross-Domain Morning Briefing"
        accentFrom="hsl(265 55% 58%)"
        accentTo="hsl(285 50% 48%)"
        icon={<Sparkles className="h-5 w-5 text-[hsl(265_55%_58%)]" />}
      />

      {/* Domain Summaries */}
      <div className="grid gap-4 lg:grid-cols-3">
        <SummaryCard
          title="Business"
          icon={<Briefcase className="h-4 w-4" />}
          kpis={byDomain("business").map(c => ({ label: c.label, value: c.value }))}
        />
        <SummaryCard
          title="Finance"
          icon={<Wallet className="h-4 w-4" />}
          kpis={byDomain("money").map(c => ({ label: c.label, value: c.value }))}
        />
        <SummaryCard
          title="Concierge"
          icon={<Home className="h-4 w-4" />}
          kpis={byDomain("concierge").map(c => ({ label: c.label, value: c.value }))}
        />
      </div>

      {/* Urgent Queue */}
      <QueueCard
        title="Needs Attention"
        items={[
          ...allCards.filter(c => c.changeType === "negative").map(c => ({
            id: c.id,
            label: `${c.label}: ${c.value} — ${c.change}`,
            urgency: "high" as const,
          })),
          ...PENDING_APPROVALS.filter(a => a.urgency === "high").map(a => ({
            id: a.id,
            label: a.title,
            urgency: "high" as const,
          })),
        ]}
      />

      {/* Advisor Council */}
      <ListReveal className="grid gap-4 md:grid-cols-3">
        <ListRevealItem>
          <AdvisorCard
            advisorName="Business Advisor"
            domain="business"
            insight="3 leads haven't been contacted in 5+ days. Re-engaging now could recover ~$12K in potential revenue."
            confidence={82}
            accentColor={DOMAIN_ACCENTS.business.from}
            action={{ label: "Review Leads", onClick: () => { window.dispatchEvent(new CustomEvent("sita-open-business", { detail: { module: "leads" } })); } }}
          />
        </ListRevealItem>
        <ListRevealItem>
          <AdvisorCard
            advisorName="Finance Advisor"
            domain="finance"
            insight="Insurance renewal due in 12 days — found $340/yr savings across 3 options. Q2 tax estimate 75% reserved."
            confidence={88}
            accentColor={DOMAIN_ACCENTS.money.from}
            action={{ label: "View Options", onClick: () => { window.dispatchEvent(new CustomEvent("sita-open-finance", { detail: { module: "overview" } })); } }}
          />
        </ListRevealItem>
        <ListRevealItem>
          <AdvisorCard
            advisorName="Life Advisor"
            domain="concierge"
            insight="Grocery delivery scheduled for Monday. 2 household tasks overdue. Dentist rescheduled to Thursday 3 PM."
            confidence={90}
            accentColor={DOMAIN_ACCENTS.concierge.from}
            action={{ label: "See Schedule", onClick: () => window.dispatchEvent(new CustomEvent("sita-open-concierge", { detail: { module: "overview" } })) }}
          />
        </ListRevealItem>
      </ListReveal>

      {/* Pending Approvals */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_9%)] overflow-hidden"
      >
        <button
          onClick={() => setApprovalsOpen(!approvalsOpen)}
          className="w-full flex items-center justify-between p-4 hover:bg-[hsl(0_0%_100%/0.03)] transition-colors"
        >
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-[hsl(38_85%_58%)]" />
            <span className="text-sm font-medium text-[hsl(0_0%_90%)]">Pending Approvals</span>
            <span className="text-xs text-[hsl(0_0%_50%)] bg-[hsl(0_0%_100%/0.06)] px-2 py-0.5 rounded-full">{PENDING_APPROVALS.length}</span>
          </div>
          {approvalsOpen ? <ChevronUp className="h-4 w-4 text-[hsl(0_0%_50%)]" /> : <ChevronDown className="h-4 w-4 text-[hsl(0_0%_50%)]" />}
        </button>
        {approvalsOpen && (
          <div className="border-t border-[hsl(0_0%_100%/0.06)] divide-y divide-[hsl(0_0%_100%/0.06)]">
            {PENDING_APPROVALS.map(a => (
              <div key={a.id} className="flex items-center justify-between px-4 py-3">
                <p className="text-sm text-[hsl(0_0%_80%)]">{a.title}</p>
                <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full", {
                  "bg-[hsl(0_70%_50%/0.1)] text-[hsl(0_70%_60%)]": a.urgency === "high",
                  "bg-[hsl(38_85%_58%/0.1)] text-[hsl(38_85%_58%)]": a.urgency === "medium",
                  "bg-[hsl(0_0%_100%/0.06)] text-[hsl(0_0%_50%)]": a.urgency === "low",
                })}>{a.urgency}</span>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Quick Navigation */}
      <div className="flex items-center justify-center gap-3 pt-2">
        {([
          { key: "business", label: "Business Center", route: "/business", icon: Briefcase, accent: DOMAIN_ACCENTS.business },
          { key: "money", label: "Finance Center", route: "/money", icon: Wallet, accent: DOMAIN_ACCENTS.money },
          { key: "concierge", label: "Concierge Center", route: "/concierge", icon: Home, accent: DOMAIN_ACCENTS.concierge },
        ] as const).map(d => (
          <button
            key={d.key}
            onClick={() => navigate(d.route)}
            className="flex items-center gap-2 rounded-xl border border-[hsl(0_0%_100%/0.06)] px-4 py-2.5 hover:bg-[hsl(0_0%_100%/0.03)] transition-all"
          >
            <d.icon className="h-4 w-4" style={{ color: d.accent.from }} />
            <span className="text-sm font-medium text-[hsl(0_0%_90%)]">{d.label}</span>
            <ArrowRight className="h-3 w-3 text-[hsl(0_0%_50%)]" />
          </button>
        ))}
      </div>
    </div>
  );
}
