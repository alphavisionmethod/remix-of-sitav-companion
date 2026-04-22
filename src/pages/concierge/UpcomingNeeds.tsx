import { useAuth } from "@/contexts/AuthContext";
import { HeroCard, QueueCard, TimelineCard, StatusCard } from "@/components/sita/cards";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { SitaTabs } from "@/components/sita/SitaComponents";
import { PremiumEmptyState } from "@/components/sita/PremiumEmptyState";
import { ModuleAdvisorInsight } from "@/components/sita/domain-shared/ModuleAdvisorInsight";
import { ConciergePageWrapper, ConciergeEmptyState, SupportBurdenCard, ConciergeReviewQueue } from "@/components/concierge";
import { ConciergeAdvisorInsightCard } from "@/components/concierge/ConciergeAdvisorInsightCard";
import type { UpcomingObligation, ReviewItem } from "@/components/concierge";
import { UpcomingObligationsCard } from "@/components/concierge";
import { AppSurface } from "@/components/sita/surfaces/AppSurface";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, AlertCircle, Zap, Eye } from "lucide-react";
import { useDataMode } from "@/contexts/DataModeContext";


const OBLIGATIONS: UpcomingObligation[] = [
  { id: "u1", title: "Dentist appointment — Alex", type: "appointment", dueLabel: "Today 2:30 PM", who: "Alex", prepNeeded: true },
  { id: "u2", title: "Drop off UPS package", type: "errand", dueLabel: "Today", who: "You" },
  { id: "u3", title: "Hotel check-in confirmation", type: "reservation", dueLabel: "Tomorrow", prepNeeded: true },
  { id: "u4", title: "Permission slip deadline", type: "admin", dueLabel: "Tomorrow", who: "Alex" },
  { id: "u5", title: "Lake Tahoe trip begins", type: "travel", dueLabel: "In 12 days", who: "Family" },
  { id: "u6", title: "Mortgage payment auto-draft", type: "recurring", dueLabel: "In 3 days" },
  { id: "u7", title: "Plumber follow-up call", type: "errand", dueLabel: "Overdue 4 days", who: "You" },
  { id: "u8", title: "Spring break flight check-in", type: "travel", dueLabel: "In 16 days" },
  { id: "u9", title: "HVAC annual inspection", type: "recurring", dueLabel: "Overdue 1 week" },
  { id: "u10", title: "Restaurant reservation — anniversary", type: "reservation", dueLabel: "In 5 days", who: "Partner" },
  { id: "u11", title: "Car oil change", type: "errand", dueLabel: "This week" },
  { id: "u12", title: "Renew parking permit", type: "admin", dueLabel: "In 10 days" },
];

const REVIEW_ITEMS: ReviewItem[] = [
  { id: "r1", title: "Weekly grocery auto-order", reason: "New items added — review before submit", urgency: "medium" },
  { id: "r2", title: "Pet sitter booking — $280", reason: "Spending over $200 policy", urgency: "high" },
  { id: "r3", title: "Reschedule dentist proposal", reason: "AI detected conflict with soccer match", urgency: "medium" },
];

type UpcomingView = "today" | "3-day" | "week" | "burden";

const UpcomingNeeds = () => {
  const { isDemo: isDemoMode } = useAuth();
  const { isDemoMode } = useDataMode();
  const [view, setView] = useState<UpcomingView>("today");

  const todayItems = OBLIGATIONS.filter(o => o.dueLabel.startsWith("Today") || o.dueLabel.startsWith("Overdue"));
  const threeDayItems = OBLIGATIONS.filter(o => !o.dueLabel.includes("week") && !o.dueLabel.includes("10") && !o.dueLabel.includes("12") && !o.dueLabel.includes("16"));
  const overdueCount = OBLIGATIONS.filter(o => o.dueLabel.includes("Overdue")).length;

  const filterForView = () => {
  const { isDemo: isDemoMode } = useAuth();
    switch (view) {
      case "today": return todayItems;
      case "3-day": return threeDayItems;
      default: return OBLIGATIONS;
    }
  };

  const queueItems = filterForView().map(o => ({
    id: o.id,
    label: o.title,
    meta: o.dueLabel,
    urgency: ((o.dueLabel.includes("Overdue") ? "critical" : o.dueLabel.startsWith("Today") ? "high" : "normal") as "critical" | "high" | "normal"),
  }));

  const timelineEvents = OBLIGATIONS.slice(0, 6).map(o => ({
    id: o.id,
    title: o.title,
    timestamp: o.dueLabel,
    detail: o.who || undefined,
    accentColor: o.dueLabel.includes("Overdue") ? "hsl(0 70% 55%)" : "hsl(285 55% 55%)",
  }));

  if (!isDemoMode) {
    return (
      <ConciergePageWrapper className="space-y-5">
        <PageTruthBanner truthState="live" />
        <HeroCard title="Upcoming & Needs Handling" metric="0" subtitle="One calm surface for everything that needs your attention" accentFrom="hsl(285 55% 55%)" accentTo="hsl(310 50% 48%)" icon={<Calendar className="h-5 w-5 text-[hsl(285_55%_65%)]" />} />
        <PremiumEmptyState icon={Calendar} title="No upcoming obligations" description="Your schedule is open. When appointments, errands, and deadlines come up, they'll appear here." variant="first-use" domain="concierge" />
      </ConciergePageWrapper>
    );
  }

  return (
    <ConciergePageWrapper className="space-y-5">
      <PageTruthBanner truthState="demo" />

      <HeroCard
        title="Upcoming & Needs Handling"
        metric={`${OBLIGATIONS.length} obligations`}
        subtitle="One calm surface for everything that needs your attention"
        accentFrom="hsl(285 55% 55%)"
        accentTo="hsl(310 50% 48%)"
        icon={<Calendar className="h-5 w-5 text-[hsl(285_55%_65%)]" />}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <StatusCard label="Today" status={todayItems.length > 0 ? "degraded" : "healthy"} lastChecked={`${todayItems.length}`} icon={<Zap className="h-3.5 w-3.5" />} />
        <StatusCard label="This Week" status="healthy" lastChecked={`${OBLIGATIONS.length}`} icon={<Calendar className="h-3.5 w-3.5" />} />
        <StatusCard label="Overdue" status={overdueCount > 0 ? "down" : "healthy"} lastChecked={`${overdueCount}`} icon={<AlertCircle className="h-3.5 w-3.5" />} />
        <StatusCard label="Prep Needed" status="healthy" lastChecked={`${OBLIGATIONS.filter(o => o.prepNeeded).length}`} icon={<Eye className="h-3.5 w-3.5" />} />
      </div>

      <SitaTabs
        tabs={[
          { key: "today", label: "Today", count: todayItems.length },
          { key: "3-day", label: "Next 3 Days", count: threeDayItems.length },
          { key: "week", label: "This Week", count: OBLIGATIONS.length },
          { key: "burden", label: "By Burden" },
        ]}
        active={view}
        onChange={k => setView(k as UpcomingView)}
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {view === "burden" ? (
            <>
              <QueueCard title="NEEDS HANDLING" items={OBLIGATIONS.filter(o => o.dueLabel.includes("Overdue") || o.dueLabel.startsWith("Today") || o.dueLabel.startsWith("Tomorrow")).map(o => ({ id: o.id, label: o.title, meta: o.dueLabel, urgency: "critical" as const }))} maxVisible={10} />
              <QueueCard title="CAN WAIT" items={OBLIGATIONS.filter(o => !o.dueLabel.includes("Overdue") && !o.dueLabel.startsWith("Today") && !o.dueLabel.startsWith("Tomorrow")).map(o => ({ id: o.id, label: o.title, meta: o.dueLabel, urgency: "normal" as const }))} maxVisible={10} />
            </>
          ) : (
            <QueueCard title={view === "today" ? "TODAY" : view === "3-day" ? "NEXT 3 DAYS" : "THIS WEEK"} items={queueItems} maxVisible={12} />
          )}

          <TimelineCard title="Timeline" events={timelineEvents} maxVisible={5} />
        </div>

        <div className="space-y-4">
          <SupportBurdenCard
            overall={58}
            categories={[
              { label: "Appointments", load: 40, trend: "flat" },
              { label: "Errands", load: 65, trend: "up" },
              { label: "Travel prep", load: 75, trend: "up" },
              { label: "Admin", load: 50, trend: "down" },
              { label: "Recurring", load: 30, trend: "flat" },
            ]}
            recommendation="Travel prep is driving most of the load. Handle the UPS drop-off and plumber call to free up mental space."
          />

          <ConciergeReviewQueue items={REVIEW_ITEMS} />

          <ModuleAdvisorInsight
            advisorName="Upcoming Advisor"
            domain="concierge"
            confidence={92}
            insight="Alex's dentist appointment today needs the insurance card. The plumber follow-up is 4 days overdue. Permission slip can be handled during school drop-off tomorrow."
            linkedItems={["Dentist prep", "Plumber follow-up", "Permission slip"]}
          />
        </div>
      </div>
    </ConciergePageWrapper>
  );
};

export default UpcomingNeeds;
