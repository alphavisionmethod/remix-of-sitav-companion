import { useAuth } from "@/contexts/AuthContext";
import { SurfaceTrustStrip } from "@/components/sita/SurfaceTrustStrip";
import { ConciergePageWrapper } from "@/components/concierge";
import { KPITile, SitaTabs, RiskCard } from "@/components/sita/SitaComponents";
import { TrustBadge } from "@/components/sita/TrustBadge";
import { GlassCard } from "@/components/sita/PremiumPageComponents";
import { BoardroomSection, OverloadCard } from "@/components/sita/HouseholdComponents";
import { ConciergeAdvisorInsightCard, ConciergeEmptyState } from "@/components/concierge";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3, Calendar, CheckSquare, AlertCircle, Heart, Users, ArrowRight, Clock, Shield,
  Plane, ShoppingCart, GraduationCap, Wrench, Gift, Sparkles, Target, FileText, TrendingUp
} from "lucide-react";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { SITA_TYPE } from "@/platform/design-system/sita-design-tokens";
import { DEMO_carryover, DEMO_nextMoves, DEMO_priorities, DEMO_proofSummary, DEMO_scheduleConflicts } from "@/data/seed/concierge";


const weeklyStats = {
  tasksCompleted: 12, tasksTotal: 18, eventsAttended: 6, eventsTotal: 7,
  providersContacted: 2, groceryRuns: 1, budgetSpent: "$186", budgetTarget: "$200",
  proofRecorded: 14, approvalsHandled: 3,
};

const familyWellness = {
  routineAdherence: 82, stressLevel: "Moderate", mealPlanAdherence: 75,
  screenTime: "Within limits", exerciseGoals: "On track", familyDinners: "5 of 7 days",
};

type BoardroomView = "daily" | "weekly" | "school" | "shopping" | "travel" | "monthly";

const FamilyBoardroom = () => {
  const [view, setView] = useState<BoardroomView>("daily");

  return (
    <ConciergePageWrapper className="space-y-6">
      <PageTruthBanner />

      {(
        <ConciergeEmptyState domain="generic" title="No review data yet" description="Your boardroom will populate with insights once you start tracking tasks, events, and obligations across concierge surfaces." />
      )}

      {false && (<>
      <SitaTabs
        tabs={[
          { key: "daily", label: "Daily Pulse" },
          { key: "weekly", label: "Weekly Review" },
          { key: "school", label: "School" },
          { key: "shopping", label: "Shopping" },
          { key: "travel", label: "Travel" },
          { key: "monthly", label: "Monthly" },
        ]}
        active={view}
        onChange={(k) => setView(k as BoardroomView)}
      />

      {/* ═══ DAILY PULSE MODE ═══ */}
      {view === "daily" && (
        <GlassCard glow="accent" intensity="medium" className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="h-4 w-4 text-accent" />
            <p className="text-sm font-semibold text-foreground">Today's Pulse</p>
            <span className="ml-auto text-[10px] bg-accent/10 text-accent rounded-full px-2 py-0.5 font-medium">Quick Glance</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-3 mb-4">
            <div className="text-center p-3 rounded-xl bg-secondary/20">
              <p className="font-display text-2xl font-bold text-foreground">{weeklyStats.tasksCompleted}</p>
              <p className="text-[10px] text-muted-foreground">Tasks done today</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-secondary/20">
              <p className="font-display text-2xl font-bold text-foreground">3</p>
              <p className="text-[10px] text-muted-foreground">Need handling</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-secondary/20">
              <p className="font-display text-2xl font-bold text-accent">2</p>
              <p className="text-[10px] text-muted-foreground">Prepared for you</p>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-medium text-foreground">🔑 Top 3 for Today</p>
            {([] as typeof DEMO_priorities).slice(0, 3).map((p, i) => (
              <div key={i} className="flex items-center gap-2 rounded-lg bg-secondary/30 px-3 py-2">
                <span className="text-xs font-bold text-primary">{i + 1}</span>
                <span className="text-xs text-foreground">{p.item}</span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground mt-3 pt-3 border-t border-border/20">
            💡 Overall feel: {weeklyStats.tasksCompleted > 10 ? "Productive day — keep momentum" : "Light day — good time to tackle deferred items"}
          </p>
        </GlassCard>
      )}

      {/* Performance Strip */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <KPITile label="Tasks Done" value={`${weeklyStats.tasksCompleted}/${weeklyStats.tasksTotal}`} icon={CheckSquare} sub={`${Math.round((weeklyStats.tasksCompleted / weeklyStats.tasksTotal) * 100)}% completion`} trend="up" />
        <KPITile label="Events" value={`${weeklyStats.eventsAttended}/${weeklyStats.eventsTotal}`} icon={Calendar} sub="1 weather cancellation" />
        <KPITile label="Grocery" value={weeklyStats.budgetSpent} icon={ShoppingCart} sub={`of ${weeklyStats.budgetTarget} target`} trend="up" />
        <KPITile label="Proof" value={String(weeklyStats.proofRecorded)} icon={Shield} sub="Verified records" />
        <KPITile label="Wellness" value={`${familyWellness.routineAdherence}%`} icon={Heart} sub="Routine adherence" trend="up" />
      </div>

      {/* Trust metadata */}
      <SurfaceTrustStrip config={{
        evidenceGrade: "C",
        gradeLabel: "Observed",
        dataSources: [
          "Task tracker",
          "Calendar events",
          "Grocery lists",
          "Wellness logs",
        ],
        lastRefreshed: new Date(),
        assumptions: [
          { statement: "Completion rates reflect tasks marked done — untracked tasks not included", impact: "high" },
          { statement: "Wellness metrics based on self-reported routine adherence", impact: "medium" },
          { statement: "Budget figures are estimates against household targets", impact: "low" },
        ],
        caveats: [
          "Demo data — connect real calendars and task lists for accurate metrics",
        ],
      }} />

      {/* Overload Assessment */}
      <OverloadCard
        level="moderate"
        message="This week had moderate household pressure — school logistics added significant coordination overhead. 6 tasks remain from last week's plan. Travel prep is adding forward pressure."
        recommendation="Focus on the 4 high-priority items this week. Defer insurance review and garage cleanup. Consider delegating the school forms to your partner."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* This Week's Priorities */}
          <BoardroomSection title="This Week's Priorities" icon={Target}>
            {([] as typeof DEMO_priorities).map((p, i) => (
              <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_9%)] p-4 micro-hover-lift" key={i} >
                <div className="flex items-start gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary shrink-0">{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-foreground">{p.item}</p>
                      <span className="rounded-md bg-secondary px-1.5 py-px text-[10px] text-muted-foreground">{p.category}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{p.why}</p>
                    <p className="text-xs text-primary mt-1">→ {p.action}</p>
                  </div>
                  <TrustBadge level={p.urgency === "high" ? "high-impact" : p.urgency === "medium" ? "review" : "safe"} label={p.urgency} size="sm" />
                </div>
              </div>
            ))}
          </BoardroomSection>

          {/* Schedule Conflicts */}
          <BoardroomSection title="Schedule Conflicts" icon={AlertCircle}>
            {([] as typeof DEMO_scheduleConflicts).map((c, i) => (
              <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_9%)] p-4 micro-hover-lift" key={i} >
                <p className="text-sm font-medium text-foreground">{c.conflict}</p>
                <div className="mt-2 rounded-lg bg-accent/5 border border-accent/10 px-3 py-2">
                  <p className="text-xs text-accent flex items-center gap-1"><Sparkles className="h-3 w-3" /> {c.resolution}</p>
                </div>
              </div>
            ))}
          </BoardroomSection>

          {/* Recommended Next Moves */}
          <BoardroomSection title="Recommended Next Moves" icon={ArrowRight}>
            {([] as typeof DEMO_nextMoves).map((m, i) => (
              <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_9%)] p-4 micro-hover-lift" key={i} >
                <div className="flex items-start gap-3">
                  <ArrowRight className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{m.move}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{m.why}</p>
                  </div>
                  <TrustBadge level={m.confidence === "high" ? "verified" : "review"} label={m.confidence} size="sm" />
                </div>
              </div>
            ))}
          </BoardroomSection>

          {/* Carryover */}
          <BoardroomSection title="Carryover Items" icon={Clock}>
            {([] as typeof DEMO_carryover).map((item, i) => (
              <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_9%)] p-3.5 micro-hover-lift border-amber-500/15" key={i} >
                <div className="flex items-center gap-3">
                  <Clock className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                  <span className="text-sm text-foreground flex-1">{item.item}</span>
                  <span className="text-[10px] text-amber-600">{item.weeks}w carried</span>
                </div>
              </div>
            ))}
          </BoardroomSection>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Proof Summary */}
          <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_9%)] p-4 micro-hover-lift">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-4 w-4 text-chart-2" />
              <h4 className="text-[13px] font-semibold text-[hsl(0_0%_85%)]">Proof Summary</h4>
            </div>
            <div className="space-y-2">
              {([] as typeof DEMO_proofSummary).map((p, i) => (
                <div key={i} className="flex items-center gap-2">
                  <p.icon className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-foreground">{p.action}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Family Wellness */}
          <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_9%)] p-4 micro-hover-lift">
            <div className="flex items-center gap-2 mb-3">
              <Heart className="h-4 w-4 text-primary" />
              <h4 className="text-[13px] font-semibold text-[hsl(0_0%_85%)]">Family Wellness</h4>
            </div>
            <div className="space-y-2.5">
              <div>
                <div className="flex justify-between mb-1"><span className="text-xs text-muted-foreground">Routine Adherence</span><span className="text-xs font-medium text-foreground">{familyWellness.routineAdherence}%</span></div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden"><div className="h-full rounded-full bg-primary" style={{ width: `${familyWellness.routineAdherence}%` }} /></div>
              </div>
              <div>
                <div className="flex justify-between mb-1"><span className="text-xs text-muted-foreground">Meal Plan</span><span className="text-xs font-medium text-foreground">{familyWellness.mealPlanAdherence}%</span></div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden"><div className="h-full rounded-full bg-accent" style={{ width: `${familyWellness.mealPlanAdherence}%` }} /></div>
              </div>
              {Object.entries(familyWellness).filter(([k]) => !["routineAdherence", "mealPlanAdherence"].includes(k)).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-xs text-muted-foreground capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</span>
                  <span className="text-xs font-medium text-foreground">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Review Status */}
          <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_9%)] p-4 micro-hover-lift" >
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="h-4 w-4 text-primary" />
              <h4 className="text-[13px] font-semibold text-[hsl(0_0%_85%)]">Review Cadence</h4>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-muted-foreground">Last weekly review</span><span className="text-foreground">5 days ago</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Last monthly review</span><span className="text-foreground">3 weeks ago</span></div>
              <div className="border-t border-border/30 pt-2">
                <p className="text-primary font-medium">Monthly review recommended this weekend</p>
              </div>
            </div>
          </div>

          {/* Boardroom Advisor */}
          <ConciergeAdvisorInsightCard insight={{
            role: "Household Operations Advisor",
            message: "Your household is operating at 67% task completion rate — slightly below your 75% target. School logistics drove most of the overhead this week. Travel prep is adding forward pressure. Recommend a focused 30-minute family sync this Sunday to align on the passport renewal and birthday venue decision.",
            linkedItems: ["Weekly review", "Task completion trend", "Travel prep"],
            confidence: "high",
          }} />

          {/* Cross-Domain */}
          <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_9%)] p-4 micro-hover-lift" >
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-accent" />
              <h4 className="text-[13px] font-semibold text-[hsl(0_0%_85%)]">Cross-Domain View</h4>
            </div>
            <div className="space-y-1.5 text-xs">
              <p className="text-foreground">💰 Grocery spending 7% under budget</p>
              <p className="text-foreground">💼 Tuesday school conflict may affect work calendar</p>
              <p className="text-foreground">✈️ Travel budget at 29% of annual allocation</p>
              <p className="text-foreground">📁 3 new documents filed this week</p>
            </div>
          </div>
        </div>
      </div>
      </>)}
    </ConciergePageWrapper>
  );
};

export default FamilyBoardroom;
