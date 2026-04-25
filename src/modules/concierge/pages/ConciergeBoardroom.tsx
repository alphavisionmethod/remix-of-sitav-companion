import { toast } from "sonner";
// ═══════════════════════════════════════════════════════════════
// SITA OS — Concierge Boardroom (Life Review Environment)
// New design system: BoardroomCinematic + ComparisonCard + ProofCard
// ═══════════════════════════════════════════════════════════════

import { HeroCard, SummaryCard, QueueCard, ProofCard, ComparisonCard, AdvisorCard, TimelineCard } from "@/components/sita/cards";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
import { BoardroomCinematic } from "@/platform/sita/components/sita/motion/AppTransitions";
import { SitaTabs } from "@/platform/sita/components/sita/SitaComponents";
import { DomainAdvisorBoard } from "@/platform/sita/components/sita/domain-shared/DomainAdvisorBoard";
import { ConciergePageWrapper } from "@/components/concierge";
import { AITruthDisclosure } from "@/components/primitives/status/AITruthDisclosure";
import { EvidenceLink } from "@/components/primitives/actions/EvidenceLink";
import { useState } from "react";
import { Heart, Home } from "lucide-react";

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

          <div className="flex flex-wrap items-center gap-2">
            <AITruthDisclosure
              mode="live-gateway"
              verifiedAt={new Date().toISOString()}
              to="/admin/ai-runtime/nightly-truth"
            />
            <EvidenceLink
              to="/admin/ai-runtime/connector-truth"
              label="Connector truth"
              kind="integration"
              variant="ghost"
              size="sm"
            />
          </div>

          <SitaTabs
            tabs={[
              { key: "weekly", label: "Weekly Review" },
              { key: "logistics", label: "Logistics" },
              { key: "burden", label: "Burden Reduction" },
            ]}
            active={mode}
            onChange={setMode}
          />

          <HeroCard
            title={`Life Review — ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric" })}`}
            metric={`${completionRate}%`}
            subtitle="Weekly task completion — softer, calmer perspective"
            accentFrom="hsl(292 60% 55%)"
            accentTo="hsl(265 55% 58%)"
            icon={<Heart className="h-5 w-5 text-[hsl(292_60%_55%)]" />}
          />

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
            <QueueCard
              title="Upcoming Obligations"
              items={[
                { id: "1", label: "School forms due Friday", urgency: "high" as const },
                { id: "2", label: "Grocery run — produce + essentials", urgency: "normal" as const },
                { id: "3", label: "Passport renewal — photos needed", urgency: "normal" as const },
                { id: "4", label: "Vet appointment — Saturday 10am", urgency: "low" as const },
                { id: "5", label: "Birthday party venue decision", urgency: "low" as const },
              ]}
            />

            <TimelineCard
              title="Service Coordination"
              events={[
                { id: "t1", title: "Plumber follow-up — kitchen sink", timestamp: "Pending", accentColor: "hsl(38 85% 58%)" },
                { id: "t2", title: "Travel insurance — coverage pending", timestamp: "Action needed", accentColor: "hsl(0 70% 55%)" },
                { id: "t3", title: "House cleaning — next visit", timestamp: "Thursday", accentColor: "hsl(152 55% 48%)" },
                { id: "t4", title: "Tutoring — 2 sessions confirmed", timestamp: "This week", accentColor: "hsl(152 55% 48%)" },
              ]}
            />

            <ComparisonCard
              title="Burden Reduction Opportunity"
              before={{ label: "Current", value: "6 separate errands" }}
              after={{ label: "Optimized", value: "3 batched outings" }}
              delta="-45 min"
              deltaPositive
              recommendation="Batch errands: pharmacy + grocery + dry cleaning to save ~45min"
            />

            <ProofCard
              title="Life Data Provenance"
              chain={[
                { label: "Task tracker synced", verified: true },
                { label: "Calendar events loaded", verified: true },
                { label: "Grocery lists updated", verified: true },
                { label: "Wellness logs — self-reported", verified: false },
              ]}
              status="pending"
            />
          </div>

          <DomainAdvisorBoard domain="concierge" />

          <AdvisorCard
            advisorName="Life Advisor"
            domain="concierge"
            insight={`Task completion: ${completionRate}% — ${completionRate >= 75 ? "on track" : "slightly behind"}. ${weeklyStats.tasksTotal - weeklyStats.tasksCompleted} tasks remaining. Focus on school forms deadline.`}
            confidence={completionRate >= 75 ? 85 : 65}
            accentColor="hsl(292 60% 55%)"
            action={{ label: "View Tasks", onClick: () => toast.info("Task view planned — coming in a future update") }}
          />
        </div>
      </BoardroomCinematic>
    </ConciergePageWrapper>
  );
};

export default ConciergeBoardroom;
