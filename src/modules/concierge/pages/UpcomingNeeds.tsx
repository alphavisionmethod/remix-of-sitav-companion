// ═══════════════════════════════════════════════════════════════
// SITA OS — Upcoming & Needs Handling (Honest-Degraded)
//
// Manifest classification: `degraded` (no upcoming-obligations data
// hook wired into this surface). Live mode renders an honest empty
// queue. Demo mode (isDemo === true) renders the rich preview from
// `concierge-upcoming-needs-demo` fixtures.
// ═══════════════════════════════════════════════════════════════
import { useAuth } from "@/contexts/AuthContext";
import { useRealityModeSafe } from "@/lib/dual-reality/reality-mode-context";
import { HeroCard, QueueCard, TimelineCard, StatusCard } from "@/platform/sita/components/sita/cards";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
import { SitaTabs } from "@/platform/sita/components/sita/SitaComponents";
import { PremiumEmptyState } from "@/platform/sita/components/sita/PremiumEmptyState";
import { ModuleAdvisorInsight } from "@/platform/sita/components/sita/domain-shared/ModuleAdvisorInsight";
import { ConciergePageWrapper, SupportBurdenCard, ConciergeReviewQueue } from "@/modules/concierge/components/concierge";
import { ConciergeAdvisorInsightCard } from "@/modules/concierge/components/concierge/ConciergeAdvisorInsightCard";
import { useState } from "react";
import { Calendar, Clock, AlertCircle, Zap, Eye } from "lucide-react";
import {
  UPCOMING_OBLIGATIONS_DEMO,
  UPCOMING_REVIEW_ITEMS_DEMO,
} from "@/data/fixtures/mock-data/concierge-upcoming-needs-demo";

type UpcomingView = "today" | "3-day" | "week" | "burden";

const UpcomingNeeds = () => {
  const { user } = useAuth();
  const { isDemo } = useRealityModeSafe();
  const [view, setView] = useState<UpcomingView>("today");

  // ── Live mode: render an honest empty queue ────────────────────
  if (!isDemo) {
    return (
      <ConciergePageWrapper className="space-y-5">
        <PageTruthBanner truthState="partial" />
        <HeroCard
          title="Upcoming & Needs Handling"
          metric="0"
          subtitle="One calm surface for everything that needs your attention"
          accentFrom="hsl(285 55% 55%)"
          accentTo="hsl(310 50% 48%)"
          icon={<Calendar className="h-5 w-5 text-[hsl(285_55%_65%)]" />}
        />
        <PremiumEmptyState
          icon={Calendar}
          title={user ? "No upcoming obligations yet" : "Sign in to see your upcoming needs"}
          description={
            user
              ? "Once a calendar, errand, or reservation source is connected, items requiring attention will appear here."
              : "Sign in and connect your calendar or reservations source to populate this surface."
          }
          variant="first-use"
          domain="concierge"
        />
      </ConciergePageWrapper>
    );
  }

  // ── Demo mode: rich sample workspace ───────────────────────────
  const obligations = UPCOMING_OBLIGATIONS_DEMO;
  const todayItems = obligations.filter((o) => o.dueLabel.startsWith("Today") || o.dueLabel.startsWith("Overdue"));
  const threeDayItems = obligations.filter(
    (o) => !o.dueLabel.includes("week") && !o.dueLabel.includes("10") && !o.dueLabel.includes("12") && !o.dueLabel.includes("16"),
  );
  const overdueCount = obligations.filter((o) => o.dueLabel.includes("Overdue")).length;

  const filterForView = () => {
    switch (view) {
      case "today":
        return todayItems;
      case "3-day":
        return threeDayItems;
      default:
        return obligations;
    }
  };

  const queueItems = filterForView().map((o) => ({
    id: o.id,
    label: o.title,
    meta: o.dueLabel,
    urgency: ((o.dueLabel.includes("Overdue") ? "critical" : o.dueLabel.startsWith("Today") ? "high" : "normal") as "critical" | "high" | "normal"),
  }));

  const timelineEvents = obligations.slice(0, 6).map((o) => ({
    id: o.id,
    title: o.title,
    timestamp: o.dueLabel,
    detail: o.who || undefined,
    accentColor: o.dueLabel.includes("Overdue") ? "hsl(0 70% 55%)" : "hsl(285 55% 55%)",
  }));

  return (
    <ConciergePageWrapper className="space-y-5">
      <PageTruthBanner truthState="demo" />
      <HeroCard
        title="Upcoming & Needs Handling"
        metric={`${obligations.length} obligations`}
        subtitle="One calm surface for everything that needs your attention"
        accentFrom="hsl(285 55% 55%)"
        accentTo="hsl(310 50% 48%)"
        icon={<Calendar className="h-5 w-5 text-[hsl(285_55%_65%)]" />}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <StatusCard label="Today"       status={todayItems.length > 0 ? "degraded" : "healthy"}             lastChecked={`${todayItems.length}`}                          icon={<Zap         className="h-3.5 w-3.5" />} />
        <StatusCard label="This Week"   status="healthy"                                                     lastChecked={`${obligations.length}`}                         icon={<Calendar    className="h-3.5 w-3.5" />} />
        <StatusCard label="Overdue"     status={overdueCount > 0 ? "down" : "healthy"}                       lastChecked={`${overdueCount}`}                               icon={<AlertCircle className="h-3.5 w-3.5" />} />
        <StatusCard label="Prep Needed" status="healthy"                                                     lastChecked={`${obligations.filter((o) => o.prepNeeded).length}`} icon={<Eye         className="h-3.5 w-3.5" />} />
      </div>

      <SitaTabs
        tabs={[
          { key: "today",  label: "Today",         count: todayItems.length      },
          { key: "3-day",  label: "Next 3 Days",   count: threeDayItems.length   },
          { key: "week",   label: "This Week",     count: obligations.length     },
          { key: "burden", label: "By Burden" },
        ]}
        active={view}
        onChange={(k) => setView(k as UpcomingView)}
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {view === "burden" ? (
            <>
              <QueueCard
                title="NEEDS HANDLING"
                items={obligations
                  .filter((o) => o.dueLabel.includes("Overdue") || o.dueLabel.startsWith("Today") || o.dueLabel.startsWith("Tomorrow"))
                  .map((o) => ({ id: o.id, label: o.title, meta: o.dueLabel, urgency: "critical" as const }))}
                maxVisible={10}
              />
              <QueueCard
                title="CAN WAIT"
                items={obligations
                  .filter((o) => !o.dueLabel.includes("Overdue") && !o.dueLabel.startsWith("Today") && !o.dueLabel.startsWith("Tomorrow"))
                  .map((o) => ({ id: o.id, label: o.title, meta: o.dueLabel, urgency: "normal" as const }))}
                maxVisible={10}
              />
            </>
          ) : (
            <QueueCard
              title={view === "today" ? "TODAY" : view === "3-day" ? "NEXT 3 DAYS" : "THIS WEEK"}
              items={queueItems}
              maxVisible={12}
            />
          )}

          <TimelineCard title="Timeline" events={timelineEvents} maxVisible={5} />
        </div>

        <div className="space-y-4">
          <SupportBurdenCard
            overall={58}
            categories={[
              { label: "Appointments", load: 40, trend: "flat" },
              { label: "Errands",      load: 65, trend: "up"   },
              { label: "Travel prep",  load: 75, trend: "up"   },
              { label: "Admin",        load: 50, trend: "down" },
              { label: "Recurring",    load: 30, trend: "flat" },
            ]}
            recommendation="Travel prep is driving most of the load. Handle the UPS drop-off and plumber call to free up mental space."
          />

          <ConciergeReviewQueue items={[...UPCOMING_REVIEW_ITEMS_DEMO]} />

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
