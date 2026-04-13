// ═══════════════════════════════════════════════════════════════
// SITA OS — Concierge Boardroom (Life Review Environment)
// ═══════════════════════════════════════════════════════════════

import { SitaCard, SitaCardTitle, SitaSectionHeader } from "@/components/sita/SitaCard";
import { KPITile, SitaTabs } from "@/components/sita/SitaComponents";
import { SurfaceTrustStrip } from "@/components/sita/SurfaceTrustStrip";
import { DomainAdvisorCard } from "@/components/advisors/DomainAdvisorCard";
import { ListStagger, ListStaggerItem } from "@/components/sita/motion/AppTransitions";
import { ConciergePageWrapper } from "@/components/concierge";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Heart, CheckSquare, Calendar, ShoppingCart, Shield, Clock,
  ArrowRight, Sparkles, Target, AlertCircle, Plane, Home
} from "lucide-react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";

const weeklyStats = {
  tasksCompleted: 12, tasksTotal: 18, eventsAttended: 6, eventsTotal: 7,
  groceryRuns: 1, budgetSpent: "$186", budgetTarget: "$200",
  routineAdherence: 82,
};

const ConciergeBoardroom = () => {
  const { isDemoMode } = useDataMode();
  const [mode, setMode] = useState("weekly");

  const completionRate = Math.round((weeklyStats.tasksCompleted / weeklyStats.tasksTotal) * 100);

  return (
    <ConciergePageWrapper className="space-y-6">
      <DemoModeBadge />

      <SitaTabs
        tabs={[
          { key: "weekly", label: "Weekly Review" },
          { key: "logistics", label: "Logistics" },
          { key: "burden", label: "Burden Reduction" },
        ]}
        active={mode}
        onChange={setMode}
      />

      {/* Hero KPIs */}
      <SitaCard hover={false} className="p-6 bg-gradient-to-r from-fuchsia-500/5 to-purple-500/5 border-fuchsia-500/20">
        <div className="flex items-center gap-3 mb-5">
          <div className="rounded-xl bg-gradient-to-br from-fuchsia-500 to-purple-500 p-2.5"><Heart className="h-5 w-5 text-white" /></div>
          <div>
            <h2 className="font-display text-lg font-bold text-foreground">Life Review — {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric" })}</h2>
            <p className="text-xs text-muted-foreground">Softer, calmer perspective on household operations</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div><p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Tasks Done</p><p className="mt-1 font-display text-2xl font-bold text-foreground">{weeklyStats.tasksCompleted}/{weeklyStats.tasksTotal}</p></div>
          <div><p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Completion</p><p className="mt-1 font-display text-2xl font-bold text-trust-verified">{completionRate}%</p></div>
          <div><p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Events</p><p className="mt-1 font-display text-2xl font-bold text-foreground">{weeklyStats.eventsAttended}/{weeklyStats.eventsTotal}</p></div>
          <div><p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Routine</p><p className="mt-1 font-display text-2xl font-bold text-foreground">{weeklyStats.routineAdherence}%</p></div>
        </div>
      </SitaCard>

      <SurfaceTrustStrip config={{
        evidenceGrade: "C",
        gradeLabel: "Observed",
        dataSources: ["Task tracker", "Calendar events", "Grocery lists", "Wellness logs"],
        lastRefreshed: new Date(),
        assumptions: [
          { statement: "Completion rates reflect tasks marked done", impact: "high" },
          { statement: "Wellness metrics are self-reported", impact: "medium" },
        ],
        caveats: isDemoMode ? ["Demo data — connect calendars and task lists for accuracy"] : undefined,
      }} />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Obligations */}
        <SitaCard hover={false}>
          <SitaCardTitle sub="What's pressing this week"><Clock className="h-4 w-4 inline mr-2" />Upcoming Obligations</SitaCardTitle>
          <ListStagger className="mt-4 space-y-2">
            {[
              { text: "School forms due Friday", urgency: "high", icon: Calendar },
              { text: "Grocery run — produce + essentials", urgency: "medium", icon: ShoppingCart },
              { text: "Passport renewal — photos needed", urgency: "medium", icon: AlertCircle },
              { text: "Vet appointment — Saturday 10am", urgency: "low", icon: Heart },
              { text: "Birthday party venue decision", urgency: "low", icon: Sparkles },
            ].map((item, i) => (
              <ListStaggerItem key={i}>
                <div className={`flex items-center gap-3 rounded-xl p-3 ${item.urgency === "high" ? "bg-urgency-high/10" : "bg-secondary/20"}`}>
                  <item.icon className={`h-4 w-4 shrink-0 ${item.urgency === "high" ? "text-urgency-high" : "text-muted-foreground"}`} />
                  <p className="text-sm text-foreground flex-1">{item.text}</p>
                  <span className="text-[10px] text-muted-foreground font-medium">{item.urgency}</span>
                </div>
              </ListStaggerItem>
            ))}
          </ListStagger>
        </SitaCard>

        {/* Logistics Pressure */}
        <SitaCard hover={false}>
          <SitaCardTitle sub="Coordination overhead"><Home className="h-4 w-4 inline mr-2" />Logistics Pressure</SitaCardTitle>
          <div className="mt-4 space-y-3">
            <div className="p-3 rounded-xl bg-secondary/20">
              <div className="flex justify-between mb-1"><span className="text-xs text-muted-foreground">Household task load</span><span className="text-xs font-medium">{weeklyStats.tasksTotal - weeklyStats.tasksCompleted} remaining</span></div>
              <div className="h-2 rounded-full bg-muted overflow-hidden"><div className="h-full rounded-full bg-primary" style={{ width: `${completionRate}%` }} /></div>
            </div>
            <div className="p-3 rounded-xl bg-secondary/20">
              <div className="flex justify-between mb-1"><span className="text-xs text-muted-foreground">Grocery budget</span><span className="text-xs font-medium">{weeklyStats.budgetSpent} / {weeklyStats.budgetTarget}</span></div>
              <div className="h-2 rounded-full bg-muted overflow-hidden"><div className="h-full rounded-full bg-accent" style={{ width: "93%" }} /></div>
            </div>
            <div className="p-3 rounded-xl bg-secondary/20">
              <div className="flex justify-between mb-1"><span className="text-xs text-muted-foreground">Routine adherence</span><span className="text-xs font-medium">{weeklyStats.routineAdherence}%</span></div>
              <div className="h-2 rounded-full bg-muted overflow-hidden"><div className="h-full rounded-full bg-trust-verified" style={{ width: `${weeklyStats.routineAdherence}%` }} /></div>
            </div>
          </div>
        </SitaCard>

        {/* Burden Reduction */}
        <SitaCard hover={false}>
          <SitaCardTitle sub="Opportunities to simplify"><Target className="h-4 w-4 inline mr-2" />Burden Reduction</SitaCardTitle>
          <div className="mt-4 space-y-2">
            {[
              "Batch errands: pharmacy + grocery + dry cleaning (save ~45min)",
              "Delegate school forms to partner",
              "Set up auto-renewal for pet prescriptions",
              "Defer garage cleanup to next weekend",
            ].map((move, i) => (
              <div key={i} className="flex items-start gap-2 rounded-lg bg-accent/5 p-2.5">
                <Sparkles className="h-3.5 w-3.5 text-accent shrink-0 mt-0.5" />
                <p className="text-xs text-foreground">{move}</p>
              </div>
            ))}
          </div>
        </SitaCard>

        {/* Service Coordination */}
        <SitaCard hover={false}>
          <SitaCardTitle sub="Provider and travel status"><Plane className="h-4 w-4 inline mr-2" />Service Coordination</SitaCardTitle>
          <div className="mt-4 space-y-2">
            {[
              { text: "Plumber follow-up — kitchen sink (pending quote)", status: "waiting" },
              { text: "Travel insurance — flights booked, coverage pending", status: "action" },
              { text: "House cleaning — next visit Thursday", status: "scheduled" },
              { text: "Tutoring — 2 sessions this week confirmed", status: "confirmed" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-secondary/20">
                <div className={`w-2 h-2 rounded-full shrink-0 ${item.status === "action" ? "bg-urgency-high" : item.status === "waiting" ? "bg-amber-400" : "bg-trust-verified"}`} />
                <p className="text-xs text-foreground flex-1">{item.text}</p>
                <span className="text-[9px] text-muted-foreground">{item.status}</span>
              </div>
            ))}
          </div>
        </SitaCard>
      </div>

      {/* Concierge Advisor */}
      <DomainAdvisorCard
        domain="concierge"
        advisorName="Life Advisor"
        advisorRole="Household Operations"
        insights={[
          { label: "Completion rate", value: `${completionRate}%`, trend: completionRate >= 75 ? "up" : "down" },
          { label: "Tasks remaining", value: String(weeklyStats.tasksTotal - weeklyStats.tasksCompleted) },
          { label: "Routine adherence", value: `${weeklyStats.routineAdherence}%` },
        ]}
        recommendation={`Operating at ${completionRate}% completion — ${completionRate >= 75 ? "on track" : "slightly behind"}. Focus on the school forms deadline and consider batching errands to save coordination time.`}
        confidence={completionRate >= 75 ? 85 : 68}
      />
    </ConciergePageWrapper>
  );
};

export default ConciergeBoardroom;
