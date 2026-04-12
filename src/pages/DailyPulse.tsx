// ═══════════════════════════════════════════════════════════════
// SITA OS — Daily Pulse (Cross-Domain Morning Briefing)
// Unified view pulling key bento cards from Business, Money,
// and Concierge into a single actionable morning summary.
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useDataMode } from "@/contexts/DataModeContext";
import { motion } from "framer-motion";
import {
  Briefcase, DollarSign, CheckCircle, ArrowRight, Brain,
  Home, TrendingUp, Calendar, ChevronDown, ChevronUp, Sparkles,
  AlertTriangle, Clock, Users, Receipt, Target, ShoppingCart,
  Mail, Bell, Shield, Zap, BarChart3, Wallet,
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
  return new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });
}

// ── Sparkline ────────────────────────────────────────────────

function Sparkline({ data, color, width = 80, height = 28 }: { data: number[]; color: string; width?: number; height?: number }) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(" ");
  const gradientId = `sp-${color.replace(/[^a-z0-9]/gi, "")}`;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="shrink-0">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.25} />
          <stop offset="100%" stopColor={color} stopOpacity={0.02} />
        </linearGradient>
      </defs>
      <polygon points={`0,${height} ${points} ${width},${height}`} fill={`url(#${gradientId})`} />
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={width} cy={height - ((data[data.length - 1] - min) / range) * (height - 4) - 2} r="2" fill={color} />
    </svg>
  );
}

function generateSeries(count: number, min: number, max: number): number[] {
  const arr: number[] = [];
  let val = min + Math.random() * (max - min) * 0.5;
  for (let i = 0; i < count; i++) {
    val += (Math.random() - 0.42) * (max - min) * 0.18;
    val = Math.max(min, Math.min(max, val));
    arr.push(val);
  }
  return arr;
}

// ── Domain Color System ──────────────────────────────────────

const DOMAIN_STYLES = {
  business: {
    accent: "text-blue-400",
    bg: "bg-blue-500/8",
    border: "border-blue-500/15",
    ring: "ring-blue-500/20",
    sparkColor: "hsl(217 90% 62%)",
    icon: Briefcase,
    label: "Business",
  },
  money: {
    accent: "text-emerald-400",
    bg: "bg-emerald-500/8",
    border: "border-emerald-500/15",
    ring: "ring-emerald-500/20",
    sparkColor: "hsl(160 60% 50%)",
    icon: DollarSign,
    label: "Finance",
  },
  concierge: {
    accent: "text-amber-400",
    bg: "bg-amber-500/8",
    border: "border-amber-500/15",
    ring: "ring-amber-500/20",
    sparkColor: "hsl(38 92% 55%)",
    icon: Home,
    label: "Concierge",
  },
} as const;

type DomainKey = keyof typeof DOMAIN_STYLES;

// ── Demo Data ────────────────────────────────────────────────

interface BentoCard {
  id: string;
  domain: DomainKey;
  icon: React.ElementType;
  label: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  route: string;
  sparkData: number[];
  priority: number; // 1 = highest
}

function usePulseData() {
  return useMemo<BentoCard[]>(() => [
    // ── Business ──
    { id: "revenue", domain: "business", icon: TrendingUp, label: "Revenue Today", value: "$2,450", change: "+12%", changeType: "positive", route: "/business", sparkData: generateSeries(7, 1800, 3200), priority: 1 },
    { id: "pipeline", domain: "business", icon: BarChart3, label: "Pipeline Value", value: "$84K", change: "6 active deals", changeType: "neutral", route: "/business", sparkData: generateSeries(7, 60000, 95000), priority: 2 },
    { id: "leads", domain: "business", icon: Users, label: "New Leads", value: "4", change: "+2 this week", changeType: "positive", route: "/business", sparkData: generateSeries(7, 1, 8), priority: 3 },
    { id: "callbacks", domain: "business", icon: Mail, label: "Follow-ups Due", value: "3", change: "1 overdue", changeType: "negative", route: "/business", sparkData: generateSeries(7, 0, 6), priority: 4 },

    // ── Money ──
    { id: "cash", domain: "money", icon: Wallet, label: "Cash Position", value: "$42K", change: "Healthy", changeType: "positive", route: "/money", sparkData: generateSeries(7, 35000, 50000), priority: 1 },
    { id: "bills", domain: "money", icon: Receipt, label: "Bills Due", value: "3", change: "$4,230 total", changeType: "neutral", route: "/money", sparkData: generateSeries(7, 1, 6), priority: 2 },
    { id: "savings", domain: "money", icon: Target, label: "Savings Rate", value: "18%", change: "+2% vs avg", changeType: "positive", route: "/money", sparkData: generateSeries(7, 12, 22), priority: 3 },
    { id: "spending", domain: "money", icon: ShoppingCart, label: "Spending Today", value: "$145", change: "Under budget", changeType: "positive", route: "/money", sparkData: generateSeries(7, 80, 300), priority: 4 },

    // ── Concierge ──
    { id: "tasks", domain: "concierge", icon: Calendar, label: "Tasks Today", value: "6", change: "2 urgent", changeType: "negative", route: "/concierge", sparkData: generateSeries(7, 3, 10), priority: 1 },
    { id: "meetings", domain: "concierge", icon: Clock, label: "Meetings", value: "2", change: "Next at 10:30 AM", changeType: "neutral", route: "/concierge", sparkData: generateSeries(7, 0, 5), priority: 2 },
    { id: "groceries", domain: "concierge", icon: ShoppingCart, label: "Grocery Order", value: "Queued", change: "Delivery Mon", changeType: "neutral", route: "/concierge", sparkData: generateSeries(7, 80, 180), priority: 3 },
    { id: "reminders", domain: "concierge", icon: Bell, label: "Reminders", value: "4", change: "1 recurring", changeType: "neutral", route: "/concierge", sparkData: generateSeries(7, 2, 8), priority: 4 },
  ], []);
}

interface AdvisorBrief {
  domain: DomainKey;
  title: string;
  message: string;
  action: string;
  route: string;
  urgency: "high" | "medium" | "low";
}

const ADVISOR_BRIEFS: AdvisorBrief[] = [
  {
    domain: "business",
    title: "Business Advisor",
    message: "3 leads haven't been contacted in 5+ days. Re-engaging now could recover ~$12K in potential revenue. Follow-up messages are drafted.",
    action: "Review Leads",
    route: "/business",
    urgency: "high",
  },
  {
    domain: "money",
    title: "Finance Advisor",
    message: "Insurance renewal due in 12 days — I've compared 3 options and found $340/yr savings. Your Q2 tax estimate is 75% reserved.",
    action: "View Options",
    route: "/money",
    urgency: "medium",
  },
  {
    domain: "concierge",
    title: "Life Advisor",
    message: "Grocery delivery scheduled for Monday. 2 household tasks are overdue. I've rescheduled the dentist appointment to Thursday 3 PM.",
    action: "See Schedule",
    route: "/concierge",
    urgency: "low",
  },
];

const PENDING_APPROVALS = [
  { id: "1", title: "Invoice #1847 — $3,200", domain: "money" as DomainKey, urgency: "medium" as const },
  { id: "2", title: "Proposal for Acme Corp", domain: "business" as DomainKey, urgency: "high" as const },
  { id: "3", title: "Grocery delivery — $145", domain: "concierge" as DomainKey, urgency: "low" as const },
  { id: "4", title: "Subscription renewal — $49/mo", domain: "money" as DomainKey, urgency: "medium" as const },
];

// ── Stagger animation helper ─────────────────────────────────

const stagger = (i: number) => ({ initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.06, duration: 0.4 } });

// ── Bento Card Component ─────────────────────────────────────

function BentoKPI({ card, index }: { card: BentoCard; index: number }) {
  const navigate = useNavigate();
  const style = DOMAIN_STYLES[card.domain];
  const Icon = card.icon;

  return (
    <motion.button
      {...stagger(index)}
      onClick={() => navigate(card.route)}
      className={cn(
        "relative overflow-hidden rounded-xl border bg-card/60 backdrop-blur-sm p-4 text-left",
        "hover:bg-secondary/40 transition-all group",
        style.border
      )}
    >
      {/* Background sparkline */}
      <div className="absolute bottom-0 right-0 opacity-30 group-hover:opacity-60 transition-opacity pointer-events-none">
        <Sparkline data={card.sparkData} color={style.sparkColor} width={90} height={32} />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <Icon className={cn("h-4 w-4", style.accent)} />
          <span className="text-[11px] text-muted-foreground uppercase tracking-wider">{card.label}</span>
        </div>
        <p className="text-xl font-bold text-foreground">{card.value}</p>
        {card.change && (
          <p className={cn("text-xs mt-0.5", {
            "text-emerald-400": card.changeType === "positive",
            "text-rose-400": card.changeType === "negative",
            "text-muted-foreground": card.changeType === "neutral",
          })}>
            {card.change}
          </p>
        )}
      </div>
    </motion.button>
  );
}

// ── Domain Section ───────────────────────────────────────────

function DomainSection({ domain, cards, sectionIndex }: { domain: DomainKey; cards: BentoCard[]; sectionIndex: number }) {
  const style = DOMAIN_STYLES[domain];
  const DomainIcon = style.icon;

  return (
    <motion.div {...stagger(sectionIndex)} className="space-y-3">
      <div className="flex items-center gap-2">
        <div className={cn("rounded-lg p-1.5", style.bg)}>
          <DomainIcon className={cn("h-4 w-4", style.accent)} />
        </div>
        <h3 className="text-sm font-semibold text-foreground">{style.label}</h3>
        <div className={cn("h-px flex-1", style.border.replace("border-", "bg-"))} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {cards.sort((a, b) => a.priority - b.priority).map((card, i) => (
          <BentoKPI key={card.id} card={card} index={sectionIndex * 4 + i} />
        ))}
      </div>
    </motion.div>
  );
}

// ── Component ────────────────────────────────────────────────

export default function DailyPulse() {
  const { user } = useAuth();
  const { isDemoMode } = useDataMode();
  const navigate = useNavigate();
  const [approvalsOpen, setApprovalsOpen] = useState(false);
  const [expandedAdvisor, setExpandedAdvisor] = useState<DomainKey | null>(null);
  const allCards = usePulseData();

  const firstName = user?.user_metadata?.full_name?.split(" ")[0]
    || user?.email?.split("@")[0]
    || "there";

  // Group cards by domain
  const businessCards = allCards.filter(c => c.domain === "business");
  const moneyCards = allCards.filter(c => c.domain === "money");
  const conciergeCards = allCards.filter(c => c.domain === "concierge");

  // Top-level summary metrics (best card from each domain)
  const heroMetrics = [
    allCards.find(c => c.id === "revenue")!,
    allCards.find(c => c.id === "cash")!,
    allCards.find(c => c.id === "tasks")!,
  ];

  // Urgency items across all domains
  const urgentItems = [
    ...PENDING_APPROVALS.filter(a => a.urgency === "high"),
    ...allCards.filter(c => c.changeType === "negative").map(c => ({ id: c.id, title: `${c.label}: ${c.value} — ${c.change}`, domain: c.domain, urgency: "medium" as const })),
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-8">
      <h1 className="sr-only">Daily Pulse</h1>

      {/* ── Greeting + Date ── */}
      <motion.div {...stagger(0)} className="space-y-1">
        <h2 className="text-2xl font-bold text-foreground">
          {getGreeting()}, {firstName}
        </h2>
        <p className="text-sm text-muted-foreground">{formatDate()} · Cross-Domain Briefing</p>
      </motion.div>

      {/* ── Hero Summary Strip ── */}
      <motion.div {...stagger(1)} className="grid grid-cols-3 gap-3">
        {heroMetrics.map((card, i) => {
          const style = DOMAIN_STYLES[card.domain];
          const Icon = card.icon;
          return (
            <button
              key={card.id}
              onClick={() => navigate(card.route)}
              className={cn(
                "relative overflow-hidden rounded-xl border p-5 text-left transition-all group",
                "bg-card/60 backdrop-blur-sm hover:bg-secondary/40",
                style.border
              )}
            >
              <div className="absolute bottom-0 right-0 opacity-25 group-hover:opacity-50 transition-opacity pointer-events-none">
                <Sparkline data={card.sparkData} color={style.sparkColor} width={100} height={36} />
              </div>
              <div className="relative z-10 flex items-center gap-3">
                <div className={cn("rounded-xl p-2.5 shrink-0", style.bg)}>
                  <Icon className={cn("h-5 w-5", style.accent)} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{card.value}</p>
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wider">{card.label}</p>
                </div>
              </div>
              {card.change && (
                <p className={cn("text-xs mt-2 relative z-10", {
                  "text-emerald-400": card.changeType === "positive",
                  "text-rose-400": card.changeType === "negative",
                  "text-muted-foreground": card.changeType === "neutral",
                })}>{card.change}</p>
              )}
            </button>
          );
        })}
      </motion.div>

      {/* ── Urgent Attention Banner ── */}
      {urgentItems.length > 0 && (
        <motion.div {...stagger(2)} className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <span className="text-sm font-semibold text-foreground">Needs Attention</span>
            <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full font-medium">{urgentItems.length}</span>
          </div>
          <div className="space-y-1.5">
            {urgentItems.slice(0, 3).map(item => (
              <div key={item.id} className="flex items-center gap-2 text-sm">
                <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", DOMAIN_STYLES[item.domain].accent.replace("text-", "bg-"))} />
                <span className="text-muted-foreground">{item.title}</span>
                <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full ml-auto shrink-0", DOMAIN_STYLES[item.domain].bg, DOMAIN_STYLES[item.domain].accent)}>{DOMAIN_STYLES[item.domain].label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Domain Bento Sections ── */}
      <DomainSection domain="business" cards={businessCards} sectionIndex={3} />
      <DomainSection domain="money" cards={moneyCards} sectionIndex={4} />
      <DomainSection domain="concierge" cards={conciergeCards} sectionIndex={5} />

      {/* ── Advisor Council Briefs ── */}
      <motion.div {...stagger(6)} className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-primary/10 p-1.5">
            <Brain className="h-4 w-4 text-primary" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">Advisor Council</h3>
          <div className="h-px flex-1 bg-primary/10" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {ADVISOR_BRIEFS.map((brief) => {
            const style = DOMAIN_STYLES[brief.domain];
            const isExpanded = expandedAdvisor === brief.domain;
            return (
              <motion.div
                key={brief.domain}
                {...stagger(7)}
                className={cn(
                  "rounded-xl border p-4 transition-all cursor-pointer",
                  style.border,
                  isExpanded ? style.bg : "bg-card/60 backdrop-blur-sm hover:bg-secondary/30"
                )}
                onClick={() => setExpandedAdvisor(isExpanded ? null : brief.domain)}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className={cn("h-4 w-4", style.accent)} />
                  <span className="text-sm font-semibold text-foreground">{brief.title}</span>
                  {brief.urgency === "high" && (
                    <span className="text-[9px] font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded-full uppercase">Urgent</span>
                  )}
                </div>
                <p className={cn("text-sm text-muted-foreground leading-relaxed", !isExpanded && "line-clamp-2")}>
                  {brief.message}
                </p>
                <button
                  onClick={(e) => { e.stopPropagation(); navigate(brief.route); }}
                  className={cn("mt-3 inline-flex items-center gap-1.5 text-sm font-medium transition-colors", style.accent)}
                >
                  {brief.action}
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* ── Pending Approvals ── */}
      <motion.div {...stagger(8)} className="rounded-xl border border-border bg-card/60 backdrop-blur-sm overflow-hidden">
        <button
          onClick={() => setApprovalsOpen(!approvalsOpen)}
          className="w-full flex items-center justify-between p-4 hover:bg-secondary/30 transition-colors"
        >
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-amber-400" />
            <span className="text-sm font-medium text-foreground">Pending Approvals</span>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {PENDING_APPROVALS.length}
            </span>
          </div>
          {approvalsOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </button>

        {approvalsOpen && (
          <div className="border-t border-border divide-y divide-border">
            {PENDING_APPROVALS.map((a) => {
              const style = DOMAIN_STYLES[a.domain];
              return (
                <div key={a.id} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-1.5 h-1.5 rounded-full", style.accent.replace("text-", "bg-"))} />
                    <div>
                      <p className="text-sm text-foreground">{a.title}</p>
                      <p className={cn("text-[11px]", style.accent)}>{style.label}</p>
                    </div>
                  </div>
                  <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full", {
                    "bg-destructive/10 text-destructive": a.urgency === "high",
                    "bg-amber-500/10 text-amber-500": a.urgency === "medium",
                    "bg-muted text-muted-foreground": a.urgency === "low",
                  })}>
                    {a.urgency}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* ── Quick Navigation ── */}
      <motion.div {...stagger(9)} className="flex items-center justify-center gap-3 pt-2">
        {(Object.entries(DOMAIN_STYLES) as [DomainKey, typeof DOMAIN_STYLES[DomainKey]][]).map(([key, style]) => {
          const Icon = style.icon;
          return (
            <button
              key={key}
              onClick={() => navigate(key === "business" ? "/business" : key === "money" ? "/money" : "/concierge")}
              className={cn(
                "flex items-center gap-2 rounded-xl border px-4 py-2.5 transition-all",
                "hover:bg-secondary/40",
                style.border
              )}
            >
              <Icon className={cn("h-4 w-4", style.accent)} />
              <span className="text-sm font-medium text-foreground">{style.label} Center</span>
              <ArrowRight className="h-3 w-3 text-muted-foreground" />
            </button>
          );
        })}
      </motion.div>
    </div>
  );
}
