import { SitaPageHeader, SitaCard, SitaCardTitle, SitaSectionHeader } from "@/components/sita/SitaCard";
import { KPITile, RiskCard, EmptyState, SitaTabs } from "@/components/sita/SitaComponents";
import { TrustBadge } from "@/components/sita/TrustBadge";
import { PriorityCard, QuickActionBar, HouseholdAdvisor, OverloadCard, GroceryContinuityCard, PrepCard, ApprovalCard } from "@/components/sita/HouseholdComponents";
import { EmptyStateCTA } from "@/components/sita/EmptyStateCTA";
import { useHouseholdTasks, useFamilyEvents } from "@/hooks/use-sita-data";
import { useDataMode } from "@/contexts/DataModeContext";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  CheckSquare, Calendar, AlertCircle, Heart, Clock, ShoppingCart, Plane, Users, Wrench, ArrowRight,
  GraduationCap, Stethoscope, Gift, FileText, Shield, Sparkles, Car, Home, Bell, BarChart3, Headphones
} from "lucide-react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";

/* ============ MOCK DATA ============ */
const kpiSummary = {
  todayCommitments: 6, tomorrowPrep: 3, schoolItems: 4, overdueHousehold: 2,
  groceryAlerts: 1, appointmentPrep: 2, travelItems: 1, urgentApprovals: 1,
};

const todaysPriorities = [
  { title: "Soccer practice carpool — Emma", due: "4:00 PM", category: "Family", who: "Emma", icon: Users, urgency: "high" as const, prepNeeded: "Shin guards + water bottle" },
  { title: "Permission slip — Science Museum field trip", due: "Tomorrow morning", category: "School", who: "Emma", icon: GraduationCap, urgency: "high" as const, linkedTo: "Lincoln Elementary" },
  { title: "Grocery run — 14 items (low-stock alerts)", due: "Today", category: "Shopping", who: "You", icon: ShoppingCart, urgency: "medium" as const, prepNeeded: "List ready in app" },
  { title: "Call plumber — kitchen leak follow-up", due: "Before noon", category: "Home", who: "You", icon: Wrench, urgency: "medium" as const, linkedTo: "Ref #4421 — Mike's Plumbing" },
  { title: "Review travel insurance quotes — Cancún", due: "This week", category: "Travel", who: "You", icon: Plane, urgency: "low" as const, linkedTo: "Spring Break trip" },
  { title: "Annual physical prep — fasting reminder", due: "Night before Apr 10", category: "Health", who: "You", icon: Stethoscope, urgency: "low" as const },
];

const driftingItems = [
  { item: "Oil change — 2 weeks overdue", severity: "high" as const },
  { item: "Kids' passport renewal — expires in 60 days", severity: "high" as const },
  { item: "Annual home insurance review — 3 weeks deferred", severity: "medium" as const },
  { item: "Thank-you to Johnsons — 3 days overdue", severity: "low" as const },
];

const upcomingSchedule = [
  { event: "Soccer practice", time: "Today 4:00 PM", who: "Emma", icon: Users },
  { event: "Piano lesson", time: "Tomorrow 3:30 PM", who: "Liam", icon: Calendar },
  { event: "Parent-teacher conference", time: "Next Tuesday 9 AM", who: "Parents", icon: GraduationCap },
  { event: "Dentist — kids checkup", time: "Next Thursday 10 AM", who: "Emma & Liam", icon: Stethoscope },
  { event: "Family dinner — Chez Marie", time: "Saturday 6:00 PM", who: "Everyone", icon: Heart },
  { event: "HVAC maintenance", time: "Apr 8, 2–4 PM", who: "Home", icon: Wrench },
];

const schoolAlerts = [
  { title: "Permission slip due tomorrow — Science Museum", child: "Emma", urgency: "high" },
  { title: "Spring tuition payment — $2,400", child: "Liam", urgency: "high" },
  { title: "Bus pass renewal overdue", child: "Liam", urgency: "high" },
  { title: "Science fair materials needed by Apr 12", child: "Liam", urgency: "medium" },
];

const groceryAlerts = [
  { item: "Laundry detergent", lastPurchased: "3 weeks ago", cycle: "Monthly", status: "out" as const },
  { item: "Olive oil", lastPurchased: "5 weeks ago", cycle: "6 weeks", status: "low" as const },
  { item: "Kids' yogurt tubes", lastPurchased: "1 week ago", cycle: "Weekly", status: "ok" as const },
];

const recentProof = [
  { action: "Grocery order placed — 14 items", time: "Today 9:15 AM", verified: true },
  { action: "Dentist appointment confirmed", time: "Yesterday 2:30 PM", verified: true },
  { action: "Permission slip signed — Emma", time: "Yesterday 7:45 AM", verified: true },
  { action: "HVAC maintenance scheduled", time: "Mar 30", verified: true },
];

const pendingApproval = {
  title: "Book pet sitter for spring break trip — $280",
  reason: "Trip starts in 18 days. Preferred sitter (Sarah M.) has limited availability.",
  whoAffected: "Max (dog), Household",
  impact: "Secures reliable care during 7-day trip",
  policyRule: "Spending over $200 requires approval",
};

const changedSinceYesterday = [
  "HVAC maintenance confirmed for Apr 8",
  "New grocery alerts: laundry detergent (out), olive oil (low)",
  "Bus pass renewal moved to overdue status",
  "Mom's birthday gift ordered — arrives Apr 11",
];

type ViewVariant = "admin" | "partner" | "professional" | "founder";

const ConciergeOverview = () => {
  const [variant, setVariant] = useState<ViewVariant>("admin");
  const { isDemoMode } = useDataMode();
  const { data: tasks = [] } = useHouseholdTasks();
  const { data: events = [] } = useFamilyEvents();

  const hasLiveData = isDemoMode || tasks.length > 0 || events.length > 0;

  if (!hasLiveData) {
    return (
      <motion.div className="space-y-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <DemoModeBadge />
        <SitaPageHeader title="Concierge" subtitle="Household operations and life logistics" />
        <EmptyStateCTA
          icon={Headphones}
          title="Welcome to your personal concierge"
          description="Add your first task, appointment, or family event. Your AI concierge will help coordinate schedules and prep everything."
          actions={[
            { label: "Add Task", icon: CheckSquare, to: "/concierge/tasks" },
            { label: "Schedule Appointment", icon: Calendar, to: "/concierge/appointments", variant: "secondary" },
            { label: "Plan Travel", icon: Plane, to: "/concierge/travel", variant: "secondary" },
          ]}
          tip="The concierge advisor learns your routines over time"
        />
      </motion.div>
    );
  }

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <SitaPageHeader
        title="Concierge"
        subtitle="Household operations, family schedule, and life logistics command center"
        actions={
          <div className="flex items-center gap-2">
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
          </div>
        }
      />

      {/* Summary Strip */}
      <div className="grid gap-2 grid-cols-4 lg:grid-cols-8">
        {[
          { label: "Today", value: kpiSummary.todayCommitments, icon: Calendar },
          { label: "Tomorrow Prep", value: kpiSummary.tomorrowPrep, icon: Clock },
          { label: "School", value: kpiSummary.schoolItems, icon: GraduationCap },
          { label: "Overdue", value: kpiSummary.overdueHousehold, icon: AlertCircle },
          { label: "Grocery", value: kpiSummary.groceryAlerts, icon: ShoppingCart },
          { label: "Appt Prep", value: kpiSummary.appointmentPrep, icon: Stethoscope },
          { label: "Travel", value: kpiSummary.travelItems, icon: Plane },
          { label: "Approvals", value: kpiSummary.urgentApprovals, icon: Shield },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-xl border border-border bg-card p-3 text-center transition-all hover:shadow-card-hover">
            <kpi.icon className="h-3.5 w-3.5 text-muted-foreground mx-auto mb-1" />
            <p className="font-display text-lg font-bold text-foreground">{kpi.value}</p>
            <p className="text-[10px] text-muted-foreground">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Overload Assessment */}
      <OverloadCard
        level="moderate"
        message="Your household has 6 commitments today with 2 overdue items drifting. School logistics are adding pressure this week — 4 items need attention across both children."
        recommendation="Defer the insurance review and oil change to next week. Focus today on the permission slip, grocery run, and plumber call."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Priorities */}
          <div className="space-y-3">
            <SitaSectionHeader title="Today's Priorities" subtitle={`${todaysPriorities.length} items — sorted by urgency`} />
            {todaysPriorities.map((p, i) => (
              <PriorityCard
                key={i} title={p.title} due={p.due} category={p.category} who={p.who}
                icon={p.icon} urgency={p.urgency} prepNeeded={p.prepNeeded} linkedTo={p.linkedTo}
              />
            ))}
          </div>

          {/* What's Drifting */}
          <div className="space-y-3">
            <SitaSectionHeader title="What's Drifting" subtitle="Items that need attention before they become problems" />
            {driftingItems.map((d, i) => (
              <RiskCard key={i} title={d.item} severity={d.severity} />
            ))}
          </div>

          {/* Pending Approval */}
          <div className="space-y-3">
            <SitaSectionHeader title="Urgent Approvals" subtitle="1 action waiting for your decision" />
            <ApprovalCard
              title={pendingApproval.title}
              reason={pendingApproval.reason}
              whoAffected={pendingApproval.whoAffected}
              impact={pendingApproval.impact}
              riskLevel="review"
              policyRule={pendingApproval.policyRule}
            />
          </div>

          {/* School Alerts */}
          <div className="space-y-3">
            <SitaSectionHeader title="School & Activity Alerts" subtitle={`${schoolAlerts.length} items this week`} />
            {schoolAlerts.map((s, i) => (
              <SitaCard key={i} lane={s.urgency === "high" ? "action" : undefined} className="p-3.5">
                <div className="flex items-center gap-3">
                  <GraduationCap className="h-4 w-4 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{s.title}</p>
                    <p className="text-xs text-muted-foreground">{s.child}</p>
                  </div>
                  <TrustBadge level={s.urgency === "high" ? "high-impact" : "review"} label={s.urgency} size="sm" />
                </div>
              </SitaCard>
            ))}
          </div>

          {/* Grocery Continuity */}
          <div className="space-y-3">
            <SitaSectionHeader title="Supply Continuity" subtitle="Recurring items that need attention" />
            {groceryAlerts.map((g, i) => (
              <GroceryContinuityCard key={i} item={g.item} lastPurchased={g.lastPurchased} cycle={g.cycle} status={g.status} />
            ))}
          </div>

          {/* Quick Actions */}
          <QuickActionBar actions={[
            { label: "Add Task", icon: CheckSquare },
            { label: "Schedule Event", icon: Calendar },
            { label: "Grocery List", icon: ShoppingCart },
            { label: "Book Service", icon: Wrench },
          ]} />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Upcoming Schedule */}
          <div className="space-y-3">
            <SitaSectionHeader title="Upcoming Schedule" />
            {upcomingSchedule.map((e, i) => (
              <SitaCard key={i} className="p-3.5">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-primary/8 p-2 shrink-0"><e.icon className="h-4 w-4 text-primary" /></div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">{e.event}</p>
                    <p className="text-xs text-muted-foreground">{e.time} · {e.who}</p>
                  </div>
                </div>
              </SitaCard>
            ))}
          </div>

          {/* What Changed */}
          <SitaCard hover={false}>
            <SitaCardTitle sub="Updates since yesterday">What Changed</SitaCardTitle>
            <div className="mt-3 space-y-2">
              {changedSinceYesterday.map((c, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  <p className="text-xs text-foreground">{c}</p>
                </div>
              ))}
            </div>
          </SitaCard>

          {/* Recent Proof */}
          <div className="space-y-3">
            <SitaSectionHeader title="Recent Proof" />
            {recentProof.map((p, i) => (
              <SitaCard key={i} className="p-3">
                <div className="flex items-center gap-3">
                  <Shield className={`h-3.5 w-3.5 shrink-0 ${p.verified ? "text-chart-2" : "text-amber-500"}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-foreground truncate">{p.action}</p>
                    <p className="text-[10px] text-muted-foreground">{p.time}</p>
                  </div>
                </div>
              </SitaCard>
            ))}
          </div>

          {/* Concierge Advisor */}
          <HouseholdAdvisor
            role="Concierge Advisor"
            icon={Sparkles}
            confidence="high"
            message="Your week is moderately loaded. The permission slip and plumber call are time-sensitive — handle those first. Passport renewal is approaching the danger window (6–8 week processing). I recommend starting that process this week and deferring the insurance review."
            linkedItems={["Passport renewal", "Permission slip", "Plumber follow-up"]}
          />

          {/* Family Boardroom Preview */}
          <SitaCard className="p-4">
            <div className="flex items-center justify-between mb-2">
              <SitaCardTitle>Family Boardroom</SitaCardTitle>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">Last review: 5 days ago</p>
            <p className="text-xs text-muted-foreground mt-1">3 carryover items · 1 new priority · Monthly review recommended</p>
            <div className="mt-2 h-1 w-full rounded-full bg-muted overflow-hidden">
              <div className="h-full w-2/3 rounded-full bg-primary" />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">67% of last week's items completed</p>
          </SitaCard>

          {/* Cross-Domain */}
          {variant === "founder" && (
            <SitaCard hover={false} lane="changed" className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-4 w-4 text-accent" />
                <SitaCardTitle>Business Crossover</SitaCardTitle>
              </div>
              <p className="text-xs text-foreground">Household overload is moderate this week. 2 school logistics items may affect your Tuesday availability for client meetings.</p>
              <p className="text-xs text-primary mt-1">→ Consider rescheduling the 10 AM Tuesday meeting</p>
            </SitaCard>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ConciergeOverview;
