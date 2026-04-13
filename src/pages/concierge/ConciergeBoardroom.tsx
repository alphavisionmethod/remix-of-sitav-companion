// ═══════════════════════════════════════════════════════════════
// SITA OS — Concierge Boardroom (Life Review Environment)
// New design system: BoardroomCinematic + ComparisonCard + ProofCard
// ═══════════════════════════════════════════════════════════════

import { HeroCard, SummaryCard, QueueCard, ProofCard, ComparisonCard, AdvisorCard, TimelineCard } from "@/components/sita/cards";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { BoardroomCinematic, ListReveal, ListRevealItem } from "@/components/sita/motion/AppTransitions";
import { SitaTabs } from "@/components/sita/SitaComponents";
import { ConciergePageWrapper } from "@/components/concierge";
import { useState } from "react";
import {
  Heart, Calendar, ShoppingCart, Clock, Sparkles, Target, Plane, Home
} from "lucide-react";

const weeklyStats = {
  tasksCompleted: 12, tasksTotal: 18, eventsAttended: 6, eventsTotal: 7,
  groceryRuns: 1, budgetSpent: "$186", budgetTarget: "$200",
  routineAdherence: 82,
};

const ConciergeBoardroom = () => {
  const [mode, setMode] = useState("weekly");
  const completionRate = Math.round((weeklyStats.tasksCompleted / weeklyStats.tasksTotal) * 100);

  return (
    <ConciergePageWrapper>
      <BoardroomCinematic domain="concierge">
        <div className="space-y-6">
          <PageTruthBanner />

          <SitaTabs
            tabs={[
              { key: "weekly", label: "Weekly Review" },
              { key: "logistics", label: "Logistics" },
              { key: "burden", label: "Burden Reduction" },
            ]}
            active={mode}
            onChange={setMode}
          />

          {/* Hero */}
          <HeroCard
            title={`Life Review — ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric" })}`}
            metric={`${completionRate}%`}
            subtitle="Weekly task completion — softer, calmer perspective"
            accentFrom="hsl(292 60% 55%)"
            accentTo="hsl(265 55% 58%)"
            icon={<Heart className="h-5 w-5 text-[hsl(292_60%_55%)]" />}
          />

          {/* KPI Summary */}
          <SummaryCard
            title="Household Pulse"
            icon={<Home className="h-4 w-4" />}
            kpis={[
              { label: "Tasks Done", value: `${weeklyStats.tasksCompleted}/${weeklyStats.tasksTotal}` },
              { label: "Events", value: `${weeklyStats.eventsAttended}/${weeklyStats.eventsTotal}` },
              { label: "Routine", value: `${weeklyStats.routineAdherence}%` },
              { label: "Budget", value: `${weeklyStats.budgetSpent}/${weeklyStats.budgetTarget}` },
            ]}
          />

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Upcoming Obligations */}
            <QueueCard
              title="Upcoming Obligations"
              items={[
                { id: "1", label: "School forms due Friday", urgency: "high" as const },
                { id: "2", label: "Grocery run — produce + essentials", urgency: "medium" as const },
                { id: "3", label: "Passport renewal — photos needed", urgency: "medium" as const },
                { id: "4", label: "Vet appointment — Saturday 10am", urgency: "low" as const },
                { id: "5", label: "Birthday party venue decision", urgency: "low" as const },
              ]}
            />

            {/* Timeline */}
            <TimelineCard
              title="Service Coordination"
              events={[
                { date: "Pending", label: "Plumber follow-up — kitchen sink", status: "warning" as const },
                { date: "Action", label: "Travel insurance — coverage pending", status: "error" as const },
                { date: "Thursday", label: "House cleaning — next visit", status: "success" as const },
                { date: "This week", label: "Tutoring — 2 sessions confirmed", status: "success" as const },
              ]}
            />

            {/* Burden Comparison */}
            <ComparisonCard
              title="Burden Reduction Opportunity"
              before="6 separate errands planned"
              after="3 batched outings"
              delta="-45 min"
              deltaPositive
              recommendation="Batch errands: pharmacy + grocery + dry cleaning to save ~45min"
            />

            {/* Proof Chain */}
            <ProofCard
              title="Life Data Provenance"
              chain={[
                { step: "Task tracker synced", status: "verified" },
                { step: "Calendar events loaded", status: "verified" },
                { step: "Grocery lists updated", status: "verified" },
                { step: "Wellness logs — self-reported", status: "partial" },
              ]}
              status="partial"
            />
          </div>

          {/* Advisor */}
          <AdvisorCard
            advisorName="Life Advisor"
            domain="concierge"
            insight={`Task completion: ${completionRate}% — ${completionRate >= 75 ? "on track" : "slightly behind"}. ${weeklyStats.tasksTotal - weeklyStats.tasksCompleted} tasks remaining. Focus on school forms deadline.`}
            confidence={completionRate >= 75 ? 85 : 65}
            accentColor="hsl(292 60% 55%)"
            action={{ label: "View Tasks", onClick: () => {} }}
          />
        </div>
      </BoardroomCinematic>
    </ConciergePageWrapper>
  );
};

export default ConciergeBoardroom;
