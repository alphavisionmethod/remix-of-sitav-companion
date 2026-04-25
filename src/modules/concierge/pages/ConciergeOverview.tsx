import { toast } from "sonner";
// ═══════════════════════════════════════════════════════════════
// Concierge OS — Invisible Support Home
// Soft, warm, relieving — gentlest motion + most breathing room
// ═══════════════════════════════════════════════════════════════

import { useAuth } from "@/contexts/AuthContext";
import { HeroCard, QueueCard, ActionCard, TimelineCard, AdvisorCard, StatusCard } from "@/platform/sita/components/sita/cards";
import { DomainCard } from "@/platform/sita/components/sita/cards/DomainCard";
import { UrgencyBadge, FreshnessBadge } from "@/platform/sita/components/sita/badges";
import { ListReveal, ListRevealItem } from "@/platform/sita/components/sita/motion/AppTransitions";
import { AppSurface } from "@/platform/sita/components/sita/surfaces/AppSurface";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
import { SITA_TYPE } from "@/platform/design-system/sita-design-tokens";
import { PremiumEmptyState } from "@/platform/sita/components/sita/PremiumEmptyState";
import { useConciergeNavigation } from "@/contexts/ConciergeNavigationContext";
import { useHouseholdTasks, useFamilyEvents } from "@/hooks/use-sita-data";
import { useMemo } from "react";
import {
  CheckSquare, Calendar, AlertCircle, Heart, Clock, ShoppingCart,
  Plane, Headphones, ArrowRight, Home, Stethoscope, FileText
} from "lucide-react";


const ConciergeOverview = () => {
  const { navigateTo } = useConciergeNavigation();
  const { data: tasks = [] } = useHouseholdTasks();
  const { data: events = [] } = useFamilyEvents();

  const hasLiveData = tasks.length > 0 || events.length > 0;

  const kpi = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const todayTasks = tasks.filter((t: any) => t.due_date?.startsWith(todayStr));
    const todayEvents = events.filter((e: any) => e.event_date?.startsWith(todayStr));
    const overdue = tasks.filter((t: any) => t.status !== "done" && t.due_date && t.due_date < todayStr);
    return {
      todayCount: todayTasks.length + todayEvents.length,
      overdueCount: overdue.length,
      upcomingEvents: events.filter((e: any) => e.event_date && e.event_date >= todayStr).length,
    };
  }, [tasks, events]);

  const queueItems = useMemo(() => [
    { id: "cp1", label: "Permission slip due tomorrow", meta: "Alex — school", urgency: "high" as const, badge: <UrgencyBadge urgency="high" /> },
    { id: "cp2", label: "Plumber follow-up overdue 4 days", meta: "Kitchen leak", urgency: "high" as const, badge: <FreshnessBadge freshness="expired" label="4 days overdue" /> },
    { id: "cp3", label: "Pet sitter booking needed", meta: "18 days", urgency: "normal" as const },
    { id: "cp4", label: "Passport renewal approaching", meta: "Aug 2026", urgency: "low" as const },
  ], []);

  const timelineEvents = useMemo(() => [
    { id: "cc1", title: "Soccer drop-off completed", timestamp: "8:30 AM", icon: <CheckSquare className="h-3 w-3 text-[hsl(152_55%_48%)]" />, accentColor: "hsl(152 55% 48%)" },
    { id: "cc2", title: "Grocery order delivered — $87", timestamp: "Yesterday", icon: <ShoppingCart className="h-3 w-3 text-[hsl(285_55%_55%)]" />, accentColor: "hsl(285 55% 55%)" },
    { id: "cc3", title: "HVAC maintenance overdue", timestamp: "Yesterday", detail: "Annual inspection — 4 days past due", icon: <AlertCircle className="h-3 w-3 text-[hsl(0_70%_55%)]" />, accentColor: "hsl(0 70% 55%)" },
  ], []);

  const handledItems = useMemo(() => [
    { label: "Grocery delivery confirmed", meta: "Today" },
    { label: "Soccer practice drop-off done", meta: "This morning" },
    { label: "Auto-pay: Internet bill processed", meta: "Yesterday" },
  ], []);

  if (!hasLiveData) {
    return (
      <PremiumEmptyState
        variant="first-use"
        icon={Headphones}
        title="Welcome to your personal concierge"
        description="Add your first task or event to start."
        actions={[
          { label: "Add Task", icon: CheckSquare, onClick: () => navigateTo("tasks") },
          { label: "Schedule Event", icon: Calendar, onClick: () => navigateTo("appointments"), variant: "secondary" as const },
        ]}
        tip="The concierge advisor learns your routines over time"
        domain="concierge"
      />
    );
  }

  return (
    <AppSurface level={0} className="space-y-6 p-0 border-0 rounded-none bg-transparent">
      <PageTruthBanner />

      <ListReveal className="space-y-6" domain="concierge">
        {/* Hero — Today's summary */}
        <ListRevealItem>
          <HeroCard
            title="Your Day"
            metric={`${kpi.todayCount || 4} items`}
            subtitle={`${kpi.overdueCount || 2} overdue · ${kpi.upcomingEvents || 7} this week · Support is active`}
            accentFrom="hsl(285 55% 55%)"
            accentTo="hsl(310 50% 48%)"
            icon={<Heart className="h-4 w-4 text-[hsl(285_55%_55%)]" />}
          />
        </ListRevealItem>

        {/* What's handled — relief-oriented */}
        <ListRevealItem>
          <StatusCard
            label={`${handledItems.length} things handled today`}
            status="healthy"
            icon={<CheckSquare className="h-4 w-4" />}
            lastChecked="Just now"
          />
        </ListRevealItem>

        {/* Two-column: Queue + Timeline */}
        <ListRevealItem>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <QueueCard
              title="What Needs You"
              items={queueItems}
              onItemClick={(id) => {
                if (id === "cp1") navigateTo("tasks");
              }}
            />
            <TimelineCard title="What Changed" events={timelineEvents} />
          </div>
        </ListRevealItem>

        {/* Prepared Actions */}
        <ListRevealItem>
          <div className="space-y-2">
            <ActionCard
              title="Travel prep checklist for spring break"
              description="7-day trip checklist with pet sitter, packing, reservations"
              accentColor="hsl(285 55% 55%)"
              onApprove={() => toast.info("Recommendation noted")}
              onDismiss={() => toast.info("Dismissed")}
              badge={<FreshnessBadge freshness="fresh" label="91% ready" />}
            />
            <ActionCard
              title="Plumber follow-up message draft"
              description="Requesting estimate timeline for kitchen leak repair"
              accentColor="hsl(285 55% 55%)"
              onApprove={() => toast.info("Recommendation noted")}
              onDismiss={() => toast.info("Dismissed")}
            />
          </div>
        </ListRevealItem>

        {/* Advisor */}
        <ListRevealItem>
          <AdvisorCard
            advisorName="Concierge Advisor"
            insight="Spring break trip in 18 days — 3 of 5 prep items still open. 2 overdue household tasks can be grouped into one errand run."
            confidence={88}
            domain="Concierge"
            accentColor="hsl(285 55% 55%)"
            action={{ label: "Review Travel Prep", onClick: () => navigateTo("travel") }}
          />
        </ListRevealItem>

        {/* Quick nav tiles */}
        <ListRevealItem>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Life Admin", count: "3 items", icon: FileText, path: "life-admin" },
              { label: "Errands", count: "2 pending", icon: ShoppingCart, path: "errands" },
              { label: "Travel", count: "1 trip", icon: Plane, path: "travel" },
              { label: "Appointments", count: "Next Thu", icon: Stethoscope, path: "appointments" },
            ].map(tile => (
              <DomainCard key={tile.label} onClick={() => navigateTo(tile.path)}
                className="group text-left micro-hover-lift micro-focus-glow micro-press"
              >
                <tile.icon className="h-4 w-4 text-[hsl(285_55%_55%)] mb-2" />
                <p className="text-[12px] font-semibold text-foreground">{tile.label}</p>
                <p className="text-[10px] text-muted-foreground">{tile.count}</p>
                <ArrowRight className="h-3 w-3 text-muted-foreground mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </DomainCard>
            ))}
          </div>
        </ListRevealItem>
      </ListReveal>
    </AppSurface>
  );
};

export default ConciergeOverview;
