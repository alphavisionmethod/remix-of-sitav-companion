// ═══════════════════════════════════════════════════════════════
// Concierge OS — Invisible Support Home
// Relief-first: what's handled → what needs you → advisor
// ═══════════════════════════════════════════════════════════════

import { OperatingStateHero, WhatMattersNow, PreparedActions, WhatChangedFeed, PriorityQueue } from "@/components/sita/domain-shared";
import { DomainAdvisorCard } from "@/components/advisors/DomainAdvisorCard";
import type { MatterItem, ChangeEvent, PreparedAction, HeroMetric, PriorityItem } from "@/components/sita/domain-shared";
import { ConciergeHomeSummary, ConciergePageWrapper, ConciergeCommandActionPreview } from "@/components/concierge";
import type { CommandSuggestion } from "@/components/concierge";
import { GlassCard } from "@/components/sita/PremiumPageComponents";
import { EmptyStateCTA } from "@/components/sita/EmptyStateCTA";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useNavigate } from "react-router-dom";
import { useHouseholdTasks, useFamilyEvents } from "@/hooks/use-sita-data";
import { useDataMode } from "@/contexts/DataModeContext";
import { motion } from "framer-motion";
import { useMemo } from "react";
import {
  CheckSquare, Calendar, AlertCircle, Heart, Clock, ShoppingCart,
  Plane, Users, Headphones, ArrowRight, Home, Stethoscope, Gift, FileText
} from "lucide-react";

const ConciergeOverview = () => {
  const navigate = useNavigate();
  const { isDemoMode } = useDataMode();
  const { data: tasks = [] } = useHouseholdTasks();
  const { data: events = [] } = useFamilyEvents();

  const hasLiveData = isDemoMode || tasks.length > 0 || events.length > 0;

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

  const heroMetrics: HeroMetric[] = useMemo(() => [
    { label: "Today", value: `${kpi.todayCount || 4}`, icon: Calendar },
    { label: "Overdue", value: `${kpi.overdueCount || 2}`, change: kpi.overdueCount > 0 ? "Needs attention" : "Clear", changeDirection: kpi.overdueCount > 0 ? "down" as const : "up" as const, icon: Clock },
    { label: "This Week", value: `${kpi.upcomingEvents || 7}`, icon: CheckSquare },
  ], [kpi]);

  const priorities: PriorityItem[] = useMemo(() => [
    { id: "cp1", title: "Permission slip due tomorrow", subtitle: "Alex — school field trip", urgency: "high" as const, icon: FileText, actionLabel: "Handle", onAction: () => navigate("/concierge/tasks") },
    { id: "cp2", title: "Plumber follow-up overdue 4 days", subtitle: "Kitchen leak estimate pending", urgency: "high" as const, icon: Home, actionLabel: "Call" },
    { id: "cp3", title: "Pet sitter booking needed", subtitle: "Spring break trip in 18 days", urgency: "medium" as const, icon: Heart, actionLabel: "Book" },
    { id: "cp4", title: "Passport renewal approaching", subtitle: "Expires Aug 2026 — start process", urgency: "low" as const, icon: FileText, actionLabel: "Plan" },
  ], [navigate]);

  const prepared: PreparedAction[] = useMemo(() => [
    { id: "cp1", title: "Travel prep checklist for spring break", description: "7-day trip checklist with pet sitter, packing, reservations", type: "automation" as const, confidence: 0.91 },
    { id: "cp2", title: "Plumber follow-up message draft", description: "Requesting estimate timeline for kitchen leak repair", type: "draft" as const, confidence: 0.85 },
  ], []);

  const changes: ChangeEvent[] = useMemo(() => [
    { id: "cc1", icon: <CheckSquare className="h-3 w-3 text-[hsl(152_55%_48%)]" />, title: "Soccer drop-off completed", subtitle: "Alex — on time", time: "8:30 AM" },
    { id: "cc2", icon: <ShoppingCart className="h-3 w-3 text-primary" />, title: "Grocery order delivered", subtitle: "Weekly essentials — $87", time: "Yesterday" },
    { id: "cc3", icon: <AlertCircle className="h-3 w-3 text-destructive" />, title: "HVAC maintenance overdue", subtitle: "Annual inspection — 4 days past due", time: "Yesterday" },
  ], []);

  const commandSuggestions: CommandSuggestion[] = useMemo(() => [
    { id: "c1", label: "What's slipping?" },
    { id: "c2", label: "Group tomorrow's errands" },
    { id: "c3", label: "Prep travel checklist" },
    { id: "c4", label: "Show pending approvals" },
  ], []);

  const advisorInsights = useMemo(() => [
    { id: "ca1", text: "Spring break trip in 18 days — 3 of 5 prep items still open", confidence: 88, action: "Review", onAction: () => navigate("/concierge/travel") },
    { id: "ca2", text: "2 overdue household tasks can be grouped into one errand run", confidence: 79 },
  ], [navigate]);

  // What's been handled (relief-oriented)
  const handledItems = useMemo(() => [
    { title: "Grocery delivery confirmed", time: "Today" },
    { title: "Soccer practice drop-off done", time: "This morning" },
    { title: "Auto-pay: Internet bill processed", time: "Yesterday" },
  ], []);

  if (!hasLiveData) {
    return (
      <motion.div className="space-y-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <EmptyStateCTA
          icon={Headphones}
          title="Welcome to your personal concierge"
          description="Add your first task or event to start."
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
    <ConciergePageWrapper className="space-y-4">
      <DemoModeBadge />

      {/* Relief-first summary */}
      <ConciergeHomeSummary
        todayCount={kpi.todayCount || 4}
        preparedCount={prepared.length}
        slippingCount={kpi.overdueCount || 2}
        automationMode="active"
      />

      {/* Operating state */}
      <OperatingStateHero
        metrics={heroMetrics}
        accentFrom="hsl(285 55% 55%)"
        accentTo="hsl(310 50% 48%)"
      />

      {/* What's handled — relief */}
      <GlassCard glow="none" className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <CheckSquare className="h-4 w-4 text-[hsl(152_55%_48%)]" />
          <p className="text-xs font-semibold text-foreground">What's Handled</p>
        </div>
        <div className="space-y-1.5">
          {handledItems.map((item, i) => (
            <div key={i} className="flex items-center gap-2 py-1">
              <div className="h-1.5 w-1.5 rounded-full bg-[hsl(152_55%_48%)]" />
              <span className="text-[11px] text-muted-foreground flex-1">{item.title}</span>
              <span className="text-[9px] text-muted-foreground">{item.time}</span>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Command suggestions */}
      <ConciergeCommandActionPreview suggestions={commandSuggestions} />

      {/* Two-column */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PriorityQueue items={priorities} title="What Needs You" accentColor="hsl(285 55% 55%)" />
        <WhatChangedFeed events={changes} />
      </div>

      <PreparedActions actions={prepared} />

      <DomainAdvisorCard domain="concierge" insights={advisorInsights} />

      {/* Navigation tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { label: "Life Admin", count: "3 items", icon: FileText, path: "/concierge/life-admin" },
          { label: "Errands", count: "2 pending", icon: ShoppingCart, path: "/concierge/errands" },
          { label: "Travel", count: "1 trip", icon: Plane, path: "/concierge/travel" },
          { label: "Appointments", count: "Next Thu", icon: Stethoscope, path: "/concierge/appointments" },
        ].map(tile => (
          <button key={tile.label} onClick={() => navigate(tile.path)}
            className="group rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-3 text-left hover:bg-[hsl(0_0%_100%/0.05)] transition-colors">
            <tile.icon className="h-4 w-4 text-[hsl(285_55%_55%)] mb-2" />
            <p className="text-[12px] font-semibold text-foreground">{tile.label}</p>
            <p className="text-[10px] text-muted-foreground">{tile.count}</p>
            <ArrowRight className="h-3 w-3 text-muted-foreground mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        ))}
      </div>
    </ConciergePageWrapper>
  );
};

export default ConciergeOverview;
