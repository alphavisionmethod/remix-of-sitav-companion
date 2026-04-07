import { SitaPageHeader, SitaCard, SitaCardTitle, SitaSectionHeader } from "@/components/sita/SitaCard";
import { KPITile, SitaTabs, RiskCard } from "@/components/sita/SitaComponents";
import { TrustBadge } from "@/components/sita/TrustBadge";
import { BoardroomSection, OverloadCard, HouseholdAdvisor } from "@/components/sita/HouseholdComponents";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3, Calendar, CheckSquare, AlertCircle, Heart, Users, ArrowRight, Clock, Shield,
  Plane, ShoppingCart, GraduationCap, Wrench, Gift, Sparkles, Target, FileText, TrendingUp
} from "lucide-react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";

const weeklyStats = {
  tasksCompleted: 12, tasksTotal: 18, eventsAttended: 6, eventsTotal: 7,
  providersContacted: 2, groceryRuns: 1, budgetSpent: "$186", budgetTarget: "$200",
  proofRecorded: 14, approvalsHandled: 3,
};

const priorities = [
  { item: "Kids' passport renewal — expires in 60 days", urgency: "high" as const, category: "Admin", action: "Start renewal process", why: "6–8 week processing time" },
  { item: "Birthday party venue — decision needed by Apr 10", urgency: "medium" as const, category: "Events", action: "Compare 3 venues", why: "Venue holds expire in 48h" },
  { item: "Oil change — 2 weeks overdue", urgency: "medium" as const, category: "Vehicle", action: "Schedule with Elite Auto", why: "Risk of engine damage" },
  { item: "Travel insurance — Cancún trip", urgency: "low" as const, category: "Travel", action: "Review and purchase", why: "Trip in 18 days" },
];

const carryover = [
  { item: "Annual home insurance review", weeks: 3 },
  { item: "Schedule HVAC maintenance", weeks: 2 },
  { item: "Update emergency contacts at school", weeks: 1 },
];

const nextMoves = [
  { move: "Begin passport renewal — both kids", why: "60-day expiration window, 6–8 week processing", confidence: "high" as const },
  { move: "Confirm birthday venue by Friday", why: "Venue holds for 48 hours only", confidence: "high" as const },
  { move: "Schedule oil change — Elite Auto", why: "2 weeks overdue, next available: Thursday", confidence: "medium" as const },
  { move: "Review travel insurance quotes", why: "Cancún trip in 18 days — coverage needed", confidence: "medium" as const },
  { move: "Defer home insurance review to next week", why: "No renewal deadline pressure this week", confidence: "high" as const },
  { move: "Book pet sitter for spring break", why: "Preferred sitter has limited slots", confidence: "high" as const },
];

const scheduleConflicts = [
  { conflict: "Emma's soccer match overlaps with family dinner — Saturday", resolution: "Move dinner to 7 PM" },
  { conflict: "Parent-teacher conference conflicts with your 10 AM client meeting — Tuesday", resolution: "Reschedule client meeting to 11 AM" },
];

const proofSummary = [
  { action: "12 tasks completed with proof", icon: CheckSquare },
  { action: "3 provider interactions logged", icon: Wrench },
  { action: "1 grocery run tracked — $87.42", icon: ShoppingCart },
  { action: "6 calendar events confirmed", icon: Calendar },
  { action: "2 school forms submitted", icon: GraduationCap },
  { action: "1 travel booking confirmed", icon: Plane },
];

const familyWellness = {
  routineAdherence: 82, stressLevel: "Moderate", mealPlanAdherence: 75,
  screenTime: "Within limits", exerciseGoals: "On track", familyDinners: "5 of 7 days",
};

type BoardroomView = "weekly" | "school" | "shopping" | "travel" | "monthly";

const FamilyBoardroom = () => {
  const [view, setView] = useState<BoardroomView>("weekly");

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <DemoModeBadge />
      <SitaPageHeader title="Family Boardroom" subtitle="Weekly review — priorities, performance, and recommended next moves" />

      <SitaTabs
        tabs={[
          { key: "weekly", label: "Weekly Review" },
          { key: "school", label: "School Review" },
          { key: "shopping", label: "Shopping Review" },
          { key: "travel", label: "Travel Review" },
          { key: "monthly", label: "Monthly Review" },
        ]}
        active={view}
        onChange={(k) => setView(k as BoardroomView)}
      />

      {/* Performance Strip */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <KPITile label="Tasks Done" value={`${weeklyStats.tasksCompleted}/${weeklyStats.tasksTotal}`} icon={CheckSquare} sub={`${Math.round((weeklyStats.tasksCompleted / weeklyStats.tasksTotal) * 100)}% completion`} trend="up" />
        <KPITile label="Events" value={`${weeklyStats.eventsAttended}/${weeklyStats.eventsTotal}`} icon={Calendar} sub="1 weather cancellation" />
        <KPITile label="Grocery" value={weeklyStats.budgetSpent} icon={ShoppingCart} sub={`of ${weeklyStats.budgetTarget} target`} trend="up" />
        <KPITile label="Proof" value={String(weeklyStats.proofRecorded)} icon={Shield} sub="Verified records" />
        <KPITile label="Wellness" value={`${familyWellness.routineAdherence}%`} icon={Heart} sub="Routine adherence" trend="up" />
      </div>

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
            {priorities.map((p, i) => (
              <SitaCard key={i} className="p-4">
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
              </SitaCard>
            ))}
          </BoardroomSection>

          {/* Schedule Conflicts */}
          <BoardroomSection title="Schedule Conflicts" icon={AlertCircle}>
            {scheduleConflicts.map((c, i) => (
              <SitaCard key={i} lane="action" className="p-4">
                <p className="text-sm font-medium text-foreground">{c.conflict}</p>
                <div className="mt-2 rounded-lg bg-accent/5 border border-accent/10 px-3 py-2">
                  <p className="text-xs text-accent flex items-center gap-1"><Sparkles className="h-3 w-3" /> {c.resolution}</p>
                </div>
              </SitaCard>
            ))}
          </BoardroomSection>

          {/* Recommended Next Moves */}
          <BoardroomSection title="Recommended Next Moves" icon={ArrowRight}>
            {nextMoves.map((m, i) => (
              <SitaCard key={i} className="p-4">
                <div className="flex items-start gap-3">
                  <ArrowRight className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{m.move}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{m.why}</p>
                  </div>
                  <TrustBadge level={m.confidence === "high" ? "verified" : "review"} label={m.confidence} size="sm" />
                </div>
              </SitaCard>
            ))}
          </BoardroomSection>

          {/* Carryover */}
          <BoardroomSection title="Carryover Items" icon={Clock}>
            {carryover.map((item, i) => (
              <SitaCard key={i} className="p-3.5 border-amber-500/15">
                <div className="flex items-center gap-3">
                  <Clock className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                  <span className="text-sm text-foreground flex-1">{item.item}</span>
                  <span className="text-[10px] text-amber-600">{item.weeks}w carried</span>
                </div>
              </SitaCard>
            ))}
          </BoardroomSection>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Proof Summary */}
          <SitaCard className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-4 w-4 text-chart-2" />
              <SitaCardTitle>Proof Summary</SitaCardTitle>
            </div>
            <div className="space-y-2">
              {proofSummary.map((p, i) => (
                <div key={i} className="flex items-center gap-2">
                  <p.icon className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-foreground">{p.action}</span>
                </div>
              ))}
            </div>
          </SitaCard>

          {/* Family Wellness */}
          <SitaCard className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Heart className="h-4 w-4 text-primary" />
              <SitaCardTitle>Family Wellness</SitaCardTitle>
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
          </SitaCard>

          {/* Review Status */}
          <SitaCard hover={false} className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="h-4 w-4 text-primary" />
              <SitaCardTitle>Review Cadence</SitaCardTitle>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-muted-foreground">Last weekly review</span><span className="text-foreground">5 days ago</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Last monthly review</span><span className="text-foreground">3 weeks ago</span></div>
              <div className="border-t border-border/30 pt-2">
                <p className="text-primary font-medium">Monthly review recommended this weekend</p>
              </div>
            </div>
          </SitaCard>

          {/* Boardroom Advisor */}
          <HouseholdAdvisor
            role="Household Operations Advisor"
            icon={Sparkles}
            confidence="high"
            message="Your household is operating at 67% task completion rate — slightly below your 75% target. School logistics drove most of the overhead this week. Travel prep is adding forward pressure. Recommend a focused 30-minute family sync this Sunday to align on the passport renewal and birthday venue decision."
            linkedItems={["Weekly review", "Task completion trend", "Travel prep"]}
          />

          {/* Cross-Domain */}
          <SitaCard hover={false} lane="changed" className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-accent" />
              <SitaCardTitle>Cross-Domain View</SitaCardTitle>
            </div>
            <div className="space-y-1.5 text-xs">
              <p className="text-foreground">💰 Grocery spending 7% under budget</p>
              <p className="text-foreground">💼 Tuesday school conflict may affect work calendar</p>
              <p className="text-foreground">✈️ Travel budget at 29% of annual allocation</p>
              <p className="text-foreground">📁 3 new documents filed this week</p>
            </div>
          </SitaCard>
        </div>
      </div>
    </motion.div>
  );
};

export default FamilyBoardroom;
