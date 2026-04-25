import { useMemo } from "react";
import { useCompanion } from "@/hooks/use-companion";
import { SitaPageHeader } from "@/platform/sita/components/sita/SitaCard";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { format, differenceInDays, parseISO } from "date-fns";
import { Link } from "react-router-dom";
import {
  Briefcase, DollarSign, Home, Clock, AlertTriangle, CheckCircle,
  TrendingUp, Shield, Target, Zap, Users, CalendarDays,
  ArrowRight, Activity, Heart, Scale, Brain, Flame,
  Radar, Sparkles, FileSearch
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar as RechartsRadar, AreaChart, Area
} from "recharts";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
import { PageShell } from "@/platform/sita/components/sita/PageShell";

// ── Animation Variants ──────────────────────────────────────────

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

// ── Color Tokens ────────────────────────────────────────────────

const DOMAIN_COLORS: Record<string, string> = {
  business: "hsl(var(--sita-purple))",
  finance: "hsl(var(--sita-gold))",
  household: "hsl(var(--trust-safe))",
  legal: "hsl(var(--accent))",
  health: "hsl(var(--destructive))",
  education: "hsl(var(--primary))",
};

const URGENCY_STYLES: Record<string, { bg: string; text: string; icon: typeof AlertTriangle }> = {
  critical: { bg: "bg-destructive/15", text: "text-destructive", icon: Flame },
  high: { bg: "bg-sita-gold/15", text: "text-sita-gold", icon: AlertTriangle },
  medium: { bg: "bg-primary/10", text: "text-primary", icon: Clock },
  low: { bg: "bg-trust-safe/10", text: "text-trust-safe", icon: CheckCircle },
};

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  pending: { bg: "bg-muted", text: "text-muted-foreground" },
  "in-progress": { bg: "bg-sita-purple/15", text: "text-sita-purple" },
  overdue: { bg: "bg-destructive/15", text: "text-destructive" },
  completed: { bg: "bg-trust-safe/15", text: "text-trust-safe" },
};

// ── Page Component ──────────────────────────────────────────────

const LifeDashboard = () => {
  const { lifeContext, dailyBriefing, obligations } = useCompanion();
  const { business, money, household, timing } = lifeContext;

  // ── Derived Data ──────────────────────────────────────────────

  const budgetData = useMemo(() =>
    Object.entries(money.budgetHealth).map(([name, b]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      spent: b.spent,
      limit: b.limit,
      percentage: b.percentage,
      remaining: b.limit - b.spent,
    })),
    [money.budgetHealth]
  );

  const runwayData = useMemo(() => {
    const months: { month: string; balance: number }[] = [];
    let balance = money.cashPosition;
    const now = new Date();
    for (let i = 0; i <= 6; i++) {
      const d = new Date(now);
      d.setMonth(d.getMonth() + i);
      months.push({ month: format(d, "MMM"), balance: Math.max(0, Math.round(balance)) });
      balance -= money.monthlyBurnRate;
    }
    return months;
  }, [money.cashPosition, money.monthlyBurnRate]);

  const obligationsByDomain = useMemo(() => {
    const grouped: Record<string, number> = {};
    for (const o of obligations) {
      grouped[o.domain] = (grouped[o.domain] || 0) + 1;
    }
    return Object.entries(grouped).map(([domain, count]) => ({
      name: domain.charAt(0).toUpperCase() + domain.slice(1),
      value: count,
      color: DOMAIN_COLORS[domain] || "hsl(var(--muted-foreground))",
    }));
  }, [obligations]);

  const radarData = useMemo(() => [
    { domain: "Pipeline", value: business.pipelineHealth, max: 100 },
    { domain: "Cash", value: Math.min(100, (money.runwayMonths / 6) * 100), max: 100 },
    { domain: "Household", value: household.loadBalance, max: 100 },
    { domain: "Calendar", value: 100 - timing.busyScore, max: 100 },
    { domain: "Win Rate", value: business.winRate * 100, max: 100 },
    { domain: "Reserves", value: Math.min(100, (money.reserves / money.cashPosition) * 100), max: 100 },
  ], [business, money, household, timing]);

  const sortedObligations = useMemo(() =>
    [...obligations]
      .filter((o) => o.status !== "completed")
      .sort((a, b) => {
        const urgencyOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return urgencyOrder[a.urgency] - urgencyOrder[b.urgency] || new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }),
    [obligations]
  );

  // ── Render ────────────────────────────────────────────────────

  return (
    <PageShell>
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6 max-w-[1600px] mx-auto">
{/* Header */}
      <motion.div variants={fadeUp}>
        <SitaPageHeader
          title="Life Dashboard"
          subtitle={dailyBriefing.headline}
          actions={<span className="text-[10px] px-2 py-1 rounded-full bg-trust-safe/15 text-trust-safe font-medium animate-pulse">● Live</span>}
        />
      </motion.div>

      {/* Life Score + Opportunity Radar + Simulator Link */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Compound Life Score */}
        <div className="rounded-xl border border-sita-purple/20 bg-gradient-to-br from-sita-purple/5 to-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-sita-purple" />
            <h3 className="text-sm font-semibold text-foreground">Life Score</h3>
          </div>
          <div className="text-center py-2">
            <p className="text-4xl font-bold text-sita-purple">742</p>
            <p className="text-[10px] text-muted-foreground mt-1">of 1,000 · <span className="text-trust-safe">↑ 18 this month</span></p>
          </div>
          <div className="grid grid-cols-4 gap-1 mt-3">
            {['Financial', 'Business', 'Health', 'Goals'].map((d, i) => (
              <div key={d} className="text-center">
                <div className="h-1 rounded-full bg-secondary overflow-hidden mb-1">
                  <div className="h-full rounded-full bg-sita-purple" style={{ width: `${[78, 65, 82, 71][i]}%` }} />
                </div>
                <span className="text-[8px] text-muted-foreground">{d}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Opportunity Radar */}
        <div className="rounded-xl border border-sita-gold/20 bg-gradient-to-br from-sita-gold/5 to-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Radar className="w-4 h-4 text-sita-gold" />
            <h3 className="text-sm font-semibold text-foreground">Opportunities</h3>
          </div>
          <div className="space-y-2">
            {[
              { label: 'Debt restructure', value: '$8,400/yr', type: 'savings' },
              { label: 'Skill match found', value: '$5K saved', type: 'synergy' },
              { label: 'Contract renewal', value: '23 days', type: 'timing' },
            ].map((opp, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-secondary/30">
                <span className="text-[11px] text-foreground">{opp.label}</span>
                <span className="text-[10px] font-semibold text-sita-gold">{opp.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Life Simulator CTA */}
        <Link to="/life-simulator" className="block">
          <div className="rounded-xl border border-accent/20 bg-gradient-to-br from-accent/5 to-card p-5 h-full flex flex-col justify-between hover:border-accent/40 transition-colors cursor-pointer">
            <div className="flex items-center gap-2 mb-3">
              <FileSearch className="w-4 h-4 text-accent" />
              <h3 className="text-sm font-semibold text-foreground">Life Simulator</h3>
            </div>
            <p className="text-[11px] text-muted-foreground mb-3">
              What happens if you lose your job? Have a baby? Market crashes? Simulate cross-domain impacts.
            </p>
            <div className="flex items-center gap-1 text-xs font-medium text-accent">
              Run simulation <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </Link>
      </motion.div>

      {/* Life Health Radar + Cross-Domain Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div variants={fadeUp} className="lg:col-span-1 rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="w-4 h-4 text-sita-purple" />
            <h3 className="text-sm font-semibold text-foreground">Life Health Radar</h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="domain" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
              <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
              <RechartsRadar dataKey="value" stroke="hsl(var(--sita-purple))" fill="hsl(var(--sita-purple))" fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div variants={fadeUp} className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-sita-gold" />
            <h3 className="text-sm font-semibold text-foreground">Cross-Domain Intelligence</h3>
          </div>
          <div className="space-y-3">
            {lifeContext.crossDomainInsights.map((insight, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
                <Activity className="w-4 h-4 mt-0.5 text-sita-purple shrink-0" />
                <p className="text-xs text-foreground leading-relaxed">{insight}</p>
              </div>
            ))}
            {dailyBriefing.recommendations.slice(0, 2).map((rec, i) => (
              <div key={`rec-${i}`} className="flex items-start gap-3 p-3 rounded-lg bg-sita-purple/5 border border-sita-purple/10">
                <Target className="w-4 h-4 mt-0.5 text-sita-purple shrink-0" />
                <p className="text-xs text-foreground leading-relaxed">{rec}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Domain KPI Row */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <DomainKPI
          icon={Briefcase} label="Pipeline Health" value={`${business.pipelineHealth}/100`}
          detail={`${business.activeLeads} leads · ${Math.round(business.winRate * 100)}% win rate`}
          color="text-sita-purple" bgColor="bg-sita-purple/10"
          trend={business.revenueVelocity > 0 ? "up" : "down"}
          trendLabel={`${business.revenueVelocity > 0 ? "+" : ""}${business.revenueVelocity}%`}
        />
        <DomainKPI
          icon={DollarSign} label="Cash Runway" value={`${money.runwayMonths.toFixed(1)} mo`}
          detail={`$${(money.cashPosition / 1000).toFixed(0)}k position · $${(money.monthlyBurnRate / 1000).toFixed(0)}k/mo burn`}
          color="text-sita-gold" bgColor="bg-sita-gold/10"
          alert={money.runwayMonths < 3}
        />
        <DomainKPI
          icon={Home} label="Household Load" value={`${household.loadBalance}%`}
          detail={`${household.activeTasks} active · ${household.overdueTasks} overdue`}
          color="text-trust-safe" bgColor="bg-trust-safe/10"
          alert={household.overdueTasks > 2}
        />
        <DomainKPI
          icon={Clock} label="Calendar Density" value={`${timing.calendarDensity}%`}
          detail={`${timing.conflictsDetected} conflict(s) · Busy: ${timing.busyScore}%`}
          color="text-accent" bgColor="bg-accent/10"
          alert={timing.conflictsDetected > 0}
        />
      </motion.div>

      {/* Money + Business Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Cash Runway Projection */}
        <motion.div variants={fadeUp} className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-sita-gold" />
              <h3 className="text-sm font-semibold text-foreground">Cash Runway Projection</h3>
            </div>
            <span className={cn(
              "text-[10px] px-2 py-0.5 rounded-full font-medium",
              money.runwayMonths < 3 ? "bg-destructive/15 text-destructive" : "bg-trust-safe/15 text-trust-safe"
            )}>
              {money.runwayMonths < 3 ? "⚠ Low" : "Healthy"}
            </span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={runwayData}>
              <defs>
                <linearGradient id="runwayGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--sita-gold))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--sita-gold))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                formatter={(v: number) => [`$${v.toLocaleString()}`, "Balance"]}
              />
              <Area type="monotone" dataKey="balance" stroke="hsl(var(--sita-gold))" fill="url(#runwayGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Budget Health */}
        <motion.div variants={fadeUp} className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Scale className="w-4 h-4 text-sita-gold" />
            <h3 className="text-sm font-semibold text-foreground">Budget Health</h3>
          </div>
          <div className="space-y-4">
            {budgetData.map((b) => (
              <div key={b.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-foreground">{b.name}</span>
                  <span className={cn(
                    "text-[11px] font-semibold",
                    b.percentage > 85 ? "text-destructive" : b.percentage > 70 ? "text-sita-gold" : "text-trust-safe"
                  )}>
                    {b.percentage.toFixed(0)}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <motion.div
                    className={cn(
                      "h-full rounded-full",
                      b.percentage > 85 ? "bg-destructive" : b.percentage > 70 ? "bg-sita-gold" : "bg-trust-safe"
                    )}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, b.percentage)}%` }}
                    transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] text-muted-foreground">${b.spent.toLocaleString()} spent</span>
                  <span className="text-[10px] text-muted-foreground">${b.remaining.toLocaleString()} left</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Business Pipeline + Household Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Business Pipeline */}
        <motion.div variants={fadeUp} className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Briefcase className="w-4 h-4 text-sita-purple" />
            <h3 className="text-sm font-semibold text-foreground">Business Pipeline</h3>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <MiniStat label="Active Leads" value={String(business.activeLeads)} color="text-sita-purple" />
            <MiniStat label="Win Rate" value={`${Math.round(business.winRate * 100)}%`} color="text-trust-safe" />
            <MiniStat label="Rev. Velocity" value={`+${business.revenueVelocity}%`} color="text-sita-gold" />
          </div>

          {business.overdueFollowups > 0 && (
            <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/10 mb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
                <span className="text-xs text-destructive font-medium">{business.overdueFollowups} overdue follow-up(s)</span>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Client Obligations</span>
            {business.clientObligations.map((co, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/30">
                <div>
                  <p className="text-xs font-medium text-foreground">{co.clientName}</p>
                  <p className="text-[11px] text-muted-foreground">{co.obligation}</p>
                </div>
                <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                  {differenceInDays(parseISO(co.dueDate), new Date())}d left
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Household Load */}
        <motion.div variants={fadeUp} className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-trust-safe" />
            <h3 className="text-sm font-semibold text-foreground">Household Overview</h3>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <MiniStat label="Members" value={String(household.totalMembers)} color="text-trust-safe" />
            <MiniStat label="Active Tasks" value={String(household.activeTasks)} color="text-foreground" />
            <MiniStat label="Busy Score" value={`${household.weeklyBusyScore}%`} color="text-sita-gold" />
          </div>

          {/* Load Balance Gauge */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-muted-foreground">Load Balance</span>
              <span className="text-xs font-semibold text-foreground">{household.loadBalance}%</span>
            </div>
            <div className="h-3 rounded-full bg-secondary overflow-hidden">
              <motion.div
                className={cn(
                  "h-full rounded-full",
                  household.loadBalance > 75 ? "bg-trust-safe" :
                  household.loadBalance > 50 ? "bg-sita-gold" : "bg-destructive"
                )}
                initial={{ width: 0 }}
                animate={{ width: `${household.loadBalance}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Top contributor: {household.topContributor}</p>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Upcoming Events</span>
            {household.upcomingEvents.map((ev, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/30">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-3.5 h-3.5 text-trust-safe" />
                  <span className="text-xs text-foreground">{ev.title}</span>
                </div>
                <span className="text-[10px] text-muted-foreground">
                  {differenceInDays(parseISO(ev.date), new Date())}d
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Obligation Timeline + Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Obligation Distribution */}
        <motion.div variants={fadeUp} className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-semibold text-foreground">By Domain</h3>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={obligationsByDomain}
                cx="50%" cy="50%"
                innerRadius={45} outerRadius={70}
                paddingAngle={3}
                dataKey="value"
              >
                {obligationsByDomain.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-2 justify-center">
            {obligationsByDomain.map((d, i) => (
              <span key={i} className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <span className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                {d.name} ({d.value})
              </span>
            ))}
          </div>
        </motion.div>

        {/* Obligation Timeline */}
        <motion.div variants={fadeUp} className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-semibold text-foreground">Obligation Timeline</h3>
            <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent font-medium">
              {sortedObligations.length} pending
            </span>
          </div>
          <div className="space-y-2 max-h-[320px] overflow-y-auto scrollbar-thin pr-1">
            {sortedObligations.map((o) => {
              const daysLeft = differenceInDays(parseISO(o.dueDate), new Date());
              const urgencyStyle = URGENCY_STYLES[o.urgency] || URGENCY_STYLES.low;
              const statusStyle = STATUS_STYLES[o.status] || STATUS_STYLES.pending;
              const UrgencyIcon = urgencyStyle.icon;

              return (
                <motion.div
                  key={o.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-start gap-3 p-3 rounded-lg bg-secondary/20 hover:bg-secondary/40 transition-colors"
                >
                  <div className={cn("p-1.5 rounded-lg shrink-0 mt-0.5", urgencyStyle.bg)}>
                    <UrgencyIcon className={cn("w-3.5 h-3.5", urgencyStyle.text)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-medium text-foreground truncate">{o.title}</p>
                      <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-medium shrink-0", statusStyle.bg, statusStyle.text)}>
                        {o.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{o.description}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-[10px] text-muted-foreground capitalize flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: DOMAIN_COLORS[o.domain] || "hsl(var(--muted-foreground))" }} />
                        {o.domain}
                      </span>
                      <span className={cn(
                        "text-[10px] font-medium",
                        daysLeft < 0 ? "text-destructive" : daysLeft <= 3 ? "text-sita-gold" : "text-muted-foreground"
                      )}>
                        {daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : daysLeft === 0 ? "Due today" : `${daysLeft}d left`}
                      </span>
                      {o.recurring && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">recurring</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Timing & Optimal Windows */}
      <motion.div variants={fadeUp} className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <CalendarDays className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-semibold text-foreground">Timing Intelligence</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <MiniStat label="Calendar Density" value={`${timing.calendarDensity}%`} color="text-accent" />
          <MiniStat label="Busy Score" value={`${timing.busyScore}%`} color="text-sita-gold" />
          <MiniStat label="Conflicts" value={String(timing.conflictsDetected)} color={timing.conflictsDetected > 0 ? "text-destructive" : "text-trust-safe"} />
          <MiniStat label="Peak Hours" value={timing.peakProductivityHours[0] || "N/A"} color="text-sita-purple" />
        </div>
        <div className="space-y-2">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Optimal Windows</span>
          <div className="flex flex-wrap gap-2">
            {timing.optimalWindows.map((w, i) => (
              <div key={i} className={cn(
                "px-3 py-2 rounded-lg border text-xs",
                w.quality === "focus" ? "bg-sita-purple/5 border-sita-purple/20 text-sita-purple" :
                w.quality === "meeting" ? "bg-accent/5 border-accent/20 text-accent" :
                "bg-secondary/50 border-border text-muted-foreground"
              )}>
                <span className="font-medium capitalize">{w.quality}</span>
                <span className="ml-2 text-[11px] opacity-75">
                  {format(parseISO(w.start), "h:mm a")} – {format(parseISO(w.end), "h:mm a")}
                </span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Upcoming Bills */}
      <motion.div variants={fadeUp} className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="w-4 h-4 text-sita-gold" />
          <h3 className="text-sm font-semibold text-foreground">Upcoming Bills</h3>
          <span className="ml-auto text-[10px] text-muted-foreground">
            Total: ${money.upcomingBills.reduce((sum, b) => sum + b.amount, 0).toLocaleString()}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {money.upcomingBills.map((bill, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
              <div>
                <p className="text-xs font-medium text-foreground">{bill.name}</p>
                <p className="text-[10px] text-muted-foreground">
                  {differenceInDays(parseISO(bill.dueDate), new Date())}d · {bill.recurring ? "Recurring" : "One-time"}
                </p>
              </div>
              <span className="text-sm font-semibold text-foreground">${bill.amount.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
    </PageShell>
  );
};

// ── Sub-Components ──────────────────────────────────────────────

const DomainKPI = ({
  icon: Icon, label, value, detail, color, bgColor, trend, trendLabel, alert
}: {
  icon: typeof Briefcase; label: string; value: string; detail: string;
  color: string; bgColor: string;
  trend?: "up" | "down"; trendLabel?: string; alert?: boolean;
}) => (
  <motion.div variants={fadeUp} className={cn(
    "rounded-xl border bg-card p-4 transition-all",
    alert ? "border-destructive/30 shadow-[0_0_12px_-4px] shadow-destructive/20" : "border-border"
  )}>
    <div className="flex items-center gap-2 mb-2">
      <div className={cn("p-1.5 rounded-lg", bgColor)}>
        <Icon className={cn("w-4 h-4", color)} />
      </div>
      <span className="text-[11px] text-muted-foreground font-medium">{label}</span>
      {alert && <AlertTriangle className="w-3 h-3 text-destructive ml-auto" />}
    </div>
    <p className="text-xl font-bold text-foreground tracking-tight">{value}</p>
    <div className="flex items-center gap-2 mt-1">
      <span className="text-[10px] text-muted-foreground">{detail}</span>
      {trend && trendLabel && (
        <span className={cn(
          "text-[10px] font-medium",
          trend === "up" ? "text-trust-safe" : "text-destructive"
        )}>
          {trendLabel}
        </span>
      )}
    </div>
  </motion.div>
);

const MiniStat = ({ label, value, color }: { label: string; value: string; color: string }) => (
  <div className="text-center">
    <p className={cn("text-lg font-bold", color)}>{value}</p>
    <p className="text-[10px] text-muted-foreground">{label}</p>
  </div>
);

export default LifeDashboard;
