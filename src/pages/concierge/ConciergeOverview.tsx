import { SitaPageHeader, SitaCard, SitaCardTitle, SitaSectionHeader, SitaButton } from "@/components/sita/SitaCard";
import { KPITile, RiskCard, SitaTabs } from "@/components/sita/SitaComponents";
import { AmbientHeader, StaggerReveal, StaggerItem, GlassCard } from "@/components/sita/PremiumPageComponents";
import { TrustBadge } from "@/components/sita/TrustBadge";
import { PriorityCard, QuickActionBar as HouseholdQuickActions, HouseholdAdvisor, OverloadCard, GroceryContinuityCard, ApprovalCard } from "@/components/sita/HouseholdComponents";
import { EmptyStateCTA } from "@/components/sita/EmptyStateCTA";
import { WhatMattersNow, WhatChangedFeed, PreparedActions } from "@/components/sita/domain-shared";
import { QuickActionBar as DomainQuickActionBar } from "@/components/sita/domain-shared";
import type { MatterItem, ChangeEvent, PreparedAction } from "@/components/sita/domain-shared";
import { useHouseholdTasks, useFamilyEvents } from "@/hooks/use-sita-data";
import { useDataMode } from "@/contexts/DataModeContext";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CheckSquare, Calendar, AlertCircle, Heart, Clock, ShoppingCart, Plane, Users, Wrench, ArrowRight,
  GraduationCap, Stethoscope, Gift, FileText, Shield, Sparkles, Car, Home, Bell, BarChart3, Headphones,
  UserCircle, Activity, MapPin, Timer, Star, Zap
} from "lucide-react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { DEMO_changedSinceYesterday, DEMO_fallbackPriorities } from "@/lib/demo-data/concierge";

/* ── Bento Cell ── */
const BentoCell = ({ children, className = "", span = "col-span-1", row = "" }: {
  children: React.ReactNode; className?: string; span?: string; row?: string;
}) => (
  <motion.div
    className={`${span} ${row} ${className}`}
    initial={{ opacity: 0, y: 20, scale: 0.97 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ type: "spring", stiffness: 100, damping: 20 }}
  >
    {children}
  </motion.div>
);

/* ── Family Member Card ── */
const FamilyMemberCard = ({ name, role, avatar, tasks, events, status }: {
  name: string; role: string; avatar: string; tasks: number; events: number; status: "busy" | "free" | "away";
}) => {
  const statusColors = { busy: "bg-destructive", free: "bg-chart-2", away: "bg-amber-500" };
  return (
    <div className="flex flex-col items-center gap-2 p-3">
      <div className="relative">
        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-lg font-bold text-primary">
          {avatar}
        </div>
        <div className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-card ${statusColors[status]}`} />
      </div>
      <div className="text-center">
        <p className="text-xs font-semibold text-foreground">{name}</p>
        <p className="text-[9px] text-muted-foreground">{role}</p>
      </div>
      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
        <span>{tasks} tasks</span>
        <span>{events} events</span>
      </div>
    </div>
  );
};

/* ── Activity Timeline Entry ── */
const TimelineEntry = ({ time, title, who, icon: Icon, color = "text-primary" }: {
  time: string; title: string; who: string; icon: typeof Calendar; color?: string;
}) => (
  <div className="flex items-start gap-3 py-2">
    <div className="flex flex-col items-center">
      <div className={`rounded-lg bg-secondary/50 p-1.5`}>
        <Icon className={`h-3 w-3 ${color}`} />
      </div>
      <div className="w-px flex-1 bg-border/30 mt-1" />
    </div>
    <div className="flex-1 min-w-0 pb-2">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-medium text-foreground truncate">{title}</p>
        <span className="text-[9px] text-muted-foreground shrink-0 ml-2">{time}</span>
      </div>
      <p className="text-[9px] text-muted-foreground">{who}</p>
    </div>
  </div>
);

/* ─── Data Derivation (same logic as before) ─── */
const categoryIcon: Record<string, typeof Home> = {
  Errands: ShoppingCart, "Home Maintenance": Wrench, School: GraduationCap,
  Health: Stethoscope, Admin: FileText, Events: Home, Shopping: ShoppingCart,
  Vehicle: Car, General: Home,
};

function deriveKPIs(tasks: any[], events: any[]) {
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const tomorrowStr = new Date(now.getTime() + 86400000).toISOString().slice(0, 10);
  const todayTasks = tasks.filter((t: any) => t.due_date?.startsWith(todayStr));
  const todayEvents = events.filter((e: any) => e.event_date?.startsWith(todayStr));
  const tomorrowTasks = tasks.filter((t: any) => t.due_date?.startsWith(tomorrowStr));
  const overdue = tasks.filter((t: any) => t.status !== "done" && t.due_date && t.due_date < todayStr);
  const schoolTasks = tasks.filter((t: any) => (t.category || "").toLowerCase().includes("school"));
  const groceryTasks = tasks.filter((t: any) => (t.category || "").toLowerCase().includes("grocer") || (t.category || "").toLowerCase().includes("shopping"));
  const pendingApprovals = tasks.filter((t: any) => t.status === "escalated" || t.status === "waiting");
  return {
    todayCommitments: todayTasks.length + todayEvents.length,
    tomorrowPrep: tomorrowTasks.length,
    schoolItems: schoolTasks.length,
    overdueHousehold: overdue.length,
    groceryAlerts: groceryTasks.length,
    appointmentPrep: todayEvents.length,
    travelItems: events.filter((e: any) => (e.event_type || "").toLowerCase().includes("travel")).length,
    urgentApprovals: pendingApprovals.length,
  };
}

function derivePriorities(tasks: any[], events: any[]) {
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const items: Array<{ title: string; due: string; category: string; who: string; icon: any; urgency: "high" | "medium" | "low"; prepNeeded?: string; linkedTo?: string }> = [];
  tasks.filter((t: any) => t.status !== "done" && t.due_date && t.due_date <= todayStr)
    .sort((a: any, b: any) => { const p: Record<string, number> = { high: 0, medium: 1, low: 2 }; return (p[a.priority] ?? 1) - (p[b.priority] ?? 1); })
    .slice(0, 6)
    .forEach((t: any) => {
      const cat = t.category || "General";
      items.push({ title: t.title, due: t.due_date < todayStr ? "Overdue" : "Today", category: cat, who: t.assigned_to || "You", icon: categoryIcon[cat] || Home, urgency: t.due_date < todayStr ? "high" : t.priority === "high" ? "high" : "medium", prepNeeded: t.notes });
    });
  events.filter((e: any) => e.event_date?.startsWith(todayStr)).slice(0, 3).forEach((e: any) => {
    items.push({ title: e.title, due: e.start_time || "Today", category: e.event_type || "Event", who: e.participants?.join(", ") || "Family", icon: Calendar, urgency: "medium" });
  });
  return items.length > 0 ? items : DEMO_fallbackPriorities;
}

type ViewVariant = "admin" | "partner" | "professional" | "founder";

const pendingApproval = {
  title: "Book pet sitter for spring break trip — $280",
  reason: "Trip starts in 18 days. Preferred sitter has limited availability.",
  whoAffected: "Max (dog), Household",
  impact: "Secures reliable care during 7-day trip",
  policyRule: "Spending over $200 requires approval",
};

const ConciergeOverview = () => {
  const [variant, setVariant] = useState<ViewVariant>("admin");
  const { isDemoMode } = useDataMode();
  const navigate = useNavigate();
  const { data: tasks = [] } = useHouseholdTasks();
  const { data: events = [] } = useFamilyEvents();
  const kpiSummary = useMemo(() => deriveKPIs(tasks, events), [tasks, events]);
  const todaysPriorities = useMemo(() => derivePriorities(tasks, events), [tasks, events]);

  const conciergeMatters: MatterItem[] = useMemo(() => [
    { id: "cm1", title: "Permission slip due tomorrow", subtitle: "Alex — school field trip", urgency: "high" as const, action: "Handle" },
    { id: "cm2", title: "Plumber follow-up overdue 4 days", subtitle: "Kitchen leak estimate pending", urgency: "high" as const, action: "Call" },
    { id: "cm3", title: "Pet sitter booking needed", subtitle: "Spring break trip in 18 days", urgency: "medium" as const, action: "Book" },
    { id: "cm4", title: "Passport renewal approaching", subtitle: "Expires Aug 2026 — start process", urgency: "low" as const, action: "Plan" },
  ], []);

  const conciergePrepared: PreparedAction[] = useMemo(() => [
    { id: "cp1", title: "Travel prep checklist for spring break", description: "7-day trip checklist with pet sitter, packing, and reservations", type: "automation" as const, confidence: 0.91 },
    { id: "cp2", title: "Plumber follow-up message draft", description: "Requesting estimate timeline for kitchen leak repair", type: "draft" as const, confidence: 0.85 },
  ], []);

  const conciergeChanges: ChangeEvent[] = useMemo(() => [
    { id: "cc1", icon: <CheckSquare className="h-3 w-3 text-chart-2" />, title: "Soccer drop-off completed", subtitle: "Alex — on time", time: "8:30 AM" },
    { id: "cc2", icon: <ShoppingCart className="h-3 w-3 text-primary" />, title: "Grocery order delivered", subtitle: "Weekly essentials — $87", time: "Yesterday" },
    { id: "cc3", icon: <AlertCircle className="h-3 w-3 text-destructive" />, title: "HVAC maintenance overdue", subtitle: "Annual inspection — 4 days past due", time: "Yesterday" },
  ], []);

  const driftingItems = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    return tasks.filter((t: any) => t.status !== "done" && t.due_date && t.due_date < todayStr).slice(0, 4)
      .map((t: any) => ({ item: `${t.title} — ${Math.ceil((Date.now() - new Date(t.due_date).getTime()) / 86400000)}d overdue`, severity: (t.priority === "high" ? "high" : "medium") as "high" | "medium" | "low" }));
  }, [tasks]);

  const groceryAlerts = useMemo(() => {
    return tasks.filter((t: any) => ((t.category || "").toLowerCase().includes("grocer") || (t.category || "").toLowerCase().includes("shopping")) && t.status !== "done").slice(0, 3)
      .map((t: any) => ({ item: t.title, lastPurchased: t.due_date || "Unknown", cycle: "As needed", status: (t.priority === "high" ? "out" : "low") as "out" | "low" | "ok" }));
  }, [tasks]);

  const upcomingSchedule = useMemo(() => {
    const now = new Date();
    return events.filter((e: any) => e.event_date && e.event_date >= now.toISOString().slice(0, 10))
      .sort((a: any, b: any) => (a.event_date || "").localeCompare(b.event_date || ""))
      .slice(0, 6)
      .map((e: any) => ({ event: e.title, time: e.event_date, who: e.participants?.join(", ") || "Family", icon: Calendar }));
  }, [events]);

  const hasLiveData = isDemoMode || tasks.length > 0 || events.length > 0;

  if (!hasLiveData) {
    return (
      <motion.div className="space-y-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <DemoModeBadge />
        <SitaPageHeader title="Concierge" subtitle="Household operations and life logistics" />
        <EmptyStateCTA
          icon={Headphones}
          title="Welcome to your personal concierge"
          description="Add your first task or event."
          actions={[
            { label: "Add Task", icon: CheckSquare, to: "/concierge/tasks" },
            { label: "Schedule Event", icon: Calendar, to: "/concierge/appointments", variant: "secondary" },
          ]}
          tip="The concierge advisor learns your routines over time"
        />
      </motion.div>
    );
  }

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
      <DemoModeBadge />
      <AmbientHeader
        title="Family Command Center"
        subtitle="Household operations, schedule coordination, and life logistics"
        icon={<Heart className="h-5 w-5 text-accent" />}
        accentColor="hsl(var(--accent))"
        actions={
          <SitaTabs
            tabs={[
              { key: "admin", label: "Admin" },
              { key: "partner", label: "Shared" },
              { key: "professional", label: "Solo" },
              { key: "founder", label: "Founder" },
            ]}
            active={variant}
            onChange={(k) => setVariant(k as ViewVariant)}
          />
        }
      />

      {/* ═══ FAMILY MEMBERS STRIP ═══ */}
      <GlassCard glow="accent" intensity="medium" className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Users className="h-4 w-4 text-accent" />
          <p className="text-xs font-semibold text-foreground">Family Status Board</p>
          <span className="ml-auto text-[10px] bg-accent/10 text-accent rounded-full px-2 py-0.5 font-medium">Live</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <FamilyMemberCard name="You" role="Admin" avatar="👤" tasks={kpiSummary.todayCommitments} events={kpiSummary.appointmentPrep} status="busy" />
          <FamilyMemberCard name="Partner" role="Co-pilot" avatar="💑" tasks={2} events={1} status="free" />
          <FamilyMemberCard name="Alex" role="School" avatar="🎒" tasks={kpiSummary.schoolItems} events={0} status="away" />
          <FamilyMemberCard name="Maya" role="Activities" avatar="🎨" tasks={1} events={2} status="busy" />
        </div>
      </GlassCard>

      {/* ═══ WHAT MATTERS NOW ═══ */}
      <WhatMattersNow items={conciergeMatters} domain="concierge" />
      <PreparedActions actions={conciergePrepared} />
      <WhatChangedFeed events={conciergeChanges} />

      {/* ═══ OVERLOAD ASSESSMENT ═══ */}
      <OverloadCard
        level={kpiSummary.overdueHousehold > 3 ? "high" : kpiSummary.todayCommitments > 5 ? "moderate" : "low"}
        message={`${kpiSummary.todayCommitments} commitments today, ${kpiSummary.overdueHousehold} overdue items drifting.${kpiSummary.schoolItems > 0 ? ` ${kpiSummary.schoolItems} school items need attention.` : ""}`}
        recommendation={kpiSummary.overdueHousehold > 0 ? "Focus on overdue items first, then today's priorities." : "You're in good shape — stay on top of today's schedule."}
      />

      {/* ═══ BENTO GRID ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 auto-rows-min">

        {/* KPI Strip — 4×1 */}
        {[
          { label: "Today", value: kpiSummary.todayCommitments, icon: Calendar, color: "text-primary" },
          { label: "Overdue", value: kpiSummary.overdueHousehold, icon: AlertCircle, color: kpiSummary.overdueHousehold > 0 ? "text-destructive" : "text-chart-2" },
          { label: "Tomorrow Prep", value: kpiSummary.tomorrowPrep, icon: Clock, color: "text-accent" },
          { label: "Approvals", value: kpiSummary.urgentApprovals, icon: Shield, color: "text-amber-500" },
        ].map(kpi => (
          <BentoCell key={kpi.label}>
            <GlassCard glow="accent" intensity="subtle" className="p-3 h-full">
              <div className="flex items-center gap-2">
                <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
                <div className="flex-1">
                  <p className="text-[10px] text-muted-foreground">{kpi.label}</p>
                  <p className={`font-display text-xl font-bold ${kpi.color}`}>{kpi.value}</p>
                </div>
              </div>
            </GlassCard>
          </BentoCell>
        ))}

        {/* Today's Priorities — 2×2 tall */}
        <BentoCell span="col-span-1 md:col-span-2" row="row-span-2">
          <GlassCard glow="none" className="p-4 h-full max-h-[500px] overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-accent" />
                <p className="text-xs font-semibold text-foreground">Today's Priorities</p>
              </div>
              <span className="text-[10px] text-muted-foreground">{todaysPriorities.length} items</span>
            </div>
            <div className="space-y-2">
              {todaysPriorities.map((p, i) => (
                <PriorityCard key={i} title={p.title} due={p.due} category={p.category} who={p.who} icon={p.icon} urgency={p.urgency} prepNeeded={p.prepNeeded} linkedTo={p.linkedTo} />
              ))}
            </div>
          </GlassCard>
        </BentoCell>

        {/* Activity Timeline — 1×2 tall */}
        <BentoCell row="row-span-2">
          <GlassCard glow="none" className="p-4 h-full max-h-[500px] overflow-y-auto">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="h-4 w-4 text-primary" />
              <p className="text-xs font-semibold text-foreground">Activity Timeline</p>
            </div>
            <div>
              {upcomingSchedule.length > 0 ? upcomingSchedule.map((e, i) => (
                <TimelineEntry key={i} time={e.time} title={e.event} who={e.who} icon={Calendar} />
              )) : (
                <>
                  <TimelineEntry time="8:30 AM" title="Soccer drop-off" who="Alex" icon={Car} color="text-accent" />
                  <TimelineEntry time="10:00 AM" title="Plumber follow-up" who="You" icon={Wrench} color="text-amber-500" />
                  <TimelineEntry time="3:30 PM" title="Piano lesson" who="Maya" icon={GraduationCap} color="text-primary" />
                  <TimelineEntry time="5:00 PM" title="Grocery pick-up" who="Partner" icon={ShoppingCart} color="text-chart-2" />
                  <TimelineEntry time="6:30 PM" title="Family dinner" who="All" icon={Heart} color="text-accent" />
                </>
              )}
            </div>
          </GlassCard>
        </BentoCell>

        {/* What's Drifting — 1×2 tall */}
        <BentoCell row="row-span-2">
          <GlassCard glow="rose" intensity="subtle" className="p-4 h-full max-h-[500px] overflow-y-auto">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <p className="text-xs font-semibold text-foreground">What's Drifting</p>
            </div>
            <div className="space-y-2">
              {driftingItems.length > 0 ? driftingItems.map((d, i) => (
                <RiskCard key={i} title={d.item} severity={d.severity} />
              )) : (
                <>
                  <RiskCard title="Permission slip — 2d overdue" severity="high" />
                  <RiskCard title="HVAC maintenance call — 4d overdue" severity="medium" />
                  <RiskCard title="Insurance review — 1 week overdue" severity="medium" />
                  <RiskCard title="Passport renewal approaching" severity="low" />
                </>
              )}
            </div>
          </GlassCard>
        </BentoCell>

        {/* Supply Continuity — 2×1 */}
        <BentoCell span="col-span-1 md:col-span-2">
          <GlassCard glow="none" className="p-4 h-full">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-chart-2" />
                <p className="text-xs font-semibold text-foreground">Supply Continuity</p>
              </div>
              <button className="text-[10px] text-primary hover:underline">Grocery list →</button>
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              {(groceryAlerts.length > 0 ? groceryAlerts : [
                { item: "Milk", lastPurchased: "3 days ago", cycle: "Weekly", status: "low" as const },
                { item: "Dog food", lastPurchased: "1 week ago", cycle: "Bi-weekly", status: "out" as const },
                { item: "Bread", lastPurchased: "2 days ago", cycle: "Weekly", status: "ok" as const },
              ]).map((g, i) => (
                <GroceryContinuityCard key={i} {...g} />
              ))}
            </div>
          </GlassCard>
        </BentoCell>

        {/* Pending Approval — 1×1 */}
        <BentoCell>
          <GlassCard glow="gold" intensity="subtle" className="p-4 h-full">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-amber-500" />
              <p className="text-xs font-semibold text-foreground">Pending Approval</p>
            </div>
            <ApprovalCard
              title={pendingApproval.title}
              reason={pendingApproval.reason}
              whoAffected={pendingApproval.whoAffected}
              impact={pendingApproval.impact}
              riskLevel="review"
              policyRule={pendingApproval.policyRule}
            />
          </GlassCard>
        </BentoCell>

        {/* School & Activities — 1×1 */}
        <BentoCell>
          <GlassCard glow="none" className="p-4 h-full">
            <div className="flex items-center gap-2 mb-3">
              <GraduationCap className="h-4 w-4 text-primary" />
              <p className="text-xs font-semibold text-foreground">School & Activities</p>
            </div>
            <div className="space-y-2">
              {[
                { title: "Permission slip due", child: "Alex", urgency: "high" },
                { title: "Science project materials", child: "Alex", urgency: "medium" },
                { title: "Dance recital Saturday", child: "Maya", urgency: "medium" },
              ].map((s, i) => (
                <div key={i} className={`flex items-center gap-2 rounded-lg px-2.5 py-2 ${s.urgency === "high" ? "bg-destructive/5 border border-destructive/10" : "bg-secondary/30"}`}>
                  <div className={`h-2 w-2 rounded-full ${s.urgency === "high" ? "bg-destructive" : "bg-amber-500"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-medium text-foreground truncate">{s.title}</p>
                    <p className="text-[9px] text-muted-foreground">{s.child}</p>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </BentoCell>

        {/* Quick Actions — 2×1 */}
        <BentoCell span="col-span-1 md:col-span-2">
          <GlassCard glow="none" className="p-4 h-full">
            <HouseholdQuickActions actions={[
              { label: "Add Task", icon: CheckSquare },
              { label: "Schedule Event", icon: Calendar },
              { label: "Grocery List", icon: ShoppingCart },
              { label: "Book Service", icon: Wrench },
            ]} />
          </GlassCard>
        </BentoCell>

        {/* What Changed — 1×1 */}
        <BentoCell>
          <GlassCard glow="none" className="p-4 h-full max-h-60 overflow-y-auto">
            <p className="text-xs font-semibold text-foreground mb-3">What Changed</p>
            <div className="space-y-2">
              {DEMO_changedSinceYesterday.map((c, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  <p className="text-[10px] text-foreground">{c}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </BentoCell>

        {/* Concierge Advisor — 1×1 */}
        <BentoCell>
          <HouseholdAdvisor
            role="Concierge Advisor"
            icon={Sparkles}
            confidence="high"
            message="Permission slip and plumber call are time-sensitive — handle first. Passport renewal approaching the danger window."
            linkedItems={["Passport renewal", "Permission slip", "Plumber follow-up"]}
          />
        </BentoCell>

        {/* Family Boardroom — 2×1 */}
        <BentoCell span="col-span-1 md:col-span-2">
          <GlassCard glow="accent" intensity="medium" className="p-5 h-full">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-accent" />
                <SitaCardTitle>Family Boardroom</SitaCardTitle>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div className="grid grid-cols-3 gap-4 mb-3">
              <div className="text-center">
                <p className="font-display text-xl font-bold text-foreground">67%</p>
                <p className="text-[9px] text-muted-foreground">Last week done</p>
              </div>
              <div className="text-center">
                <p className="font-display text-xl font-bold text-foreground">3</p>
                <p className="text-[9px] text-muted-foreground">Carryover items</p>
              </div>
              <div className="text-center">
                <p className="font-display text-xl font-bold text-accent">1</p>
                <p className="text-[9px] text-muted-foreground">New priority</p>
              </div>
            </div>
            <div className="h-1.5 rounded-full bg-secondary/40 overflow-hidden mb-2">
              <motion.div className="h-full rounded-full bg-accent" initial={{ width: 0 }} animate={{ width: "67%" }} transition={{ duration: 0.8 }} />
            </div>
            <p className="text-[10px] text-muted-foreground">Monthly review recommended</p>

            {variant === "founder" && (
              <div className="mt-3 pt-3 border-t border-border/20">
                <p className="text-xs text-foreground">2 school logistics may affect your Tuesday client meetings.</p>
                <p className="text-[10px] text-primary mt-1">→ Consider rescheduling the 10 AM meeting</p>
              </div>
            )}
          </GlassCard>
        </BentoCell>
      </div>
    </motion.div>
  );
};

export default ConciergeOverview;
