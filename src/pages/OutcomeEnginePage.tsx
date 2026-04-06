// ═══════════════════════════════════════════════════════════════
// SITA OS — Outcome Engine
// Category-defining surface: frames everything as outcomes,
// not features. "What are you trying to achieve?"
// ═══════════════════════════════════════════════════════════════

import { cn } from "@/lib/utils";
import { Target, TrendingUp, ArrowRight, Sparkles, Plus, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { OutcomeProgress } from "@/components/sita/primitives/OutcomeProgress";
import { InterventionCard } from "@/components/sita/primitives/InterventionCard";
import { SpilloverCard } from "@/components/sita/primitives/SpilloverBadge";
import { AutonomyLadder } from "@/components/sita/primitives/AutonomyLadder";
import { ExecutionChainTimeline, buildDefaultChain } from "@/components/sita/primitives/ExecutionChainTimeline";
import { KPITile, SectionHeader } from "@/components/sita/SitaComponents";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { DEMO_OUTCOMES, DEMO_INTERVENTIONS, DEMO_SPILLOVERS } from "@/lib/demo-data/outcome-engine";

const MOCK_OUTCOMES = DEMO_OUTCOMES;
const MOCK_INTERVENTIONS = DEMO_INTERVENTIONS;
const MOCK_SPILLOVERS = DEMO_SPILLOVERS;
    title: "Get more booked clients",
    description: "Increase booking rate from 22% to 35% by recovering stale leads and optimizing follow-up timing",
    progress: 42,
    domain: "business" as const,
    impact: "high" as const,
    blockers: ["4 leads cooling off — no follow-up in 5+ days", "Thursday schedule conflict blocking callback window"],
    nextAction: "Send follow-up to Sarah Chen at Bloom Studio",
  },
  {
    id: "O-2",
    title: "Stabilize monthly cash flow",
    description: "Reduce cash flow volatility by 40% through better bill timing, collections acceleration, and reserve buffers",
    progress: 67,
    domain: "money" as const,
    impact: "high" as const,
    blockers: ["Invoice INV-002 overdue by 10 days ($1,200)"],
    nextAction: "Send payment reminder to Bloom Studio",
  },
  {
    id: "O-3",
    title: "Create a calmer school week",
    description: "Eliminate Thursday scheduling conflicts and automate recurring logistics for school activities",
    progress: 55,
    domain: "concierge" as const,
    impact: "medium" as const,
    blockers: ["3 conflicts on Thursday", "Soccer pickup not delegated"],
    nextAction: "Reschedule dentist appointment to avoid Thursday overload",
  },
  {
    id: "O-4",
    title: "Reduce unnecessary spending",
    description: "Cut $2,400/year in wasted subscriptions and negotiate better rates on recurring services",
    progress: 28,
    domain: "money" as const,
    impact: "medium" as const,
    blockers: ["Adobe CC only 15% used", "Figma seats underutilized"],
    nextAction: "Review Adobe CC usage and consider downgrade",
  },
  {
    id: "O-5",
    title: "Free up 5 hours/week of founder time",
    description: "Delegate recurring operational tasks to reach target autonomous execution rate",
    progress: 34,
    domain: "cross-domain" as const,
    impact: "high" as const,
    blockers: ["3 recurring tasks still require manual approval", "Grocery compilation not fully trusted"],
    nextAction: "Promote 'Auto-pay bills under $500' to delegated-recurring",
  },
];

const MOCK_INTERVENTIONS = [
  {
    title: "Unblock Thursday — one reschedule fixes 3 domains",
    description: "Moving Maya's dentist from Thursday 10am to Monday 2pm clears the schedule conflict, opens a callback window for 2 cooling leads, and reduces household stress from triple-booking.",
    impact: "3 domains unblocked, 2h recovered, $24K pipeline re-engaged",
    affectedDomains: ["business", "concierge", "household"],
    urgency: "today" as const,
    effort: "quick" as const,
  },
  {
    title: "Send overdue invoice reminder to Bloom Studio",
    description: "INV-002 is 10 days overdue. Auto-reminder is drafted and policy-approved. One click to send.",
    impact: "$1,200 receivable recovery",
    affectedDomains: ["money", "business"],
    urgency: "now" as const,
    effort: "quick" as const,
  },
  {
    title: "Cancel or downgrade Adobe CC subscription",
    description: "Only 15% usage over 90 days. Cancellation saves $660/year. Draft notice prepared.",
    impact: "$660/year savings",
    affectedDomains: ["money"],
    urgency: "this-week" as const,
    effort: "moderate" as const,
  },
];

const MOCK_SPILLOVERS = [
  {
    from: "concierge" as const,
    to: "business" as const,
    impact: "high" as const,
    title: "Thursday overload hurting callbacks",
    description: "3 scheduling conflicts on Thursday are blocking your best callback window. 2 high-value leads have gone 5+ days without follow-up during this recurring conflict.",
    intervention: "Reschedule dentist to Monday — opens Thursday 10am-12pm for callbacks",
  },
  {
    from: "money" as const,
    to: "business" as const,
    impact: "medium" as const,
    title: "Overdue invoice creating collection anxiety",
    description: "Bloom Studio's overdue INV-002 is occupying mental bandwidth that could go toward pipeline development. The unresolved receivable is also impacting cash flow confidence.",
    intervention: "Send auto-reminder now — system estimates 78% collection probability within 48h",
  },
  {
    from: "business" as const,
    to: "household" as const,
    impact: "medium" as const,
    title: "Late-evening work sessions from lead backlog",
    description: "Stale lead queue is causing after-hours catch-up work 3 days this week, reducing family time and increasing next-day fatigue.",
    intervention: "Delegate morning lead triage to SITA — currently at suggest level, ready for approve-execute",
  },
];

export default function OutcomeEnginePage() {
  const totalProgress = Math.round(MOCK_OUTCOMES.reduce((s, o) => s + o.progress, 0) / MOCK_OUTCOMES.length);

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      <DemoModeBadge />
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between"
      >
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--primary)/0.1)]">
              <Target className="h-5 w-5 text-[hsl(var(--primary))]" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">Outcome Engine</h1>
              <p className="text-sm text-muted-foreground">What you're trying to achieve — and what moves it forward</p>
            </div>
          </div>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs">
          <Plus className="h-3.5 w-3.5" /> Add Outcome
        </Button>
      </motion.div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPITile label="Overall Progress" value={`${totalProgress}%`} trend="up" icon={Target} sub="Across all outcomes" />
        <KPITile label="Active Outcomes" value={MOCK_OUTCOMES.length} icon={TrendingUp} sub="5 tracked" />
        <KPITile label="Interventions Ready" value={MOCK_INTERVENTIONS.length} trend="up" icon={Sparkles} sub="Cross-domain actions" />
        <KPITile label="Spillovers Detected" value={MOCK_SPILLOVERS.length} trend="down" icon={RefreshCw} sub="Life ↔ work impacts" />
      </div>

      <Tabs defaultValue="outcomes" className="space-y-6">
        <TabsList className="bg-secondary/40">
          <TabsTrigger value="outcomes">Outcomes</TabsTrigger>
          <TabsTrigger value="interventions">Interventions</TabsTrigger>
          <TabsTrigger value="spillovers">Spillovers</TabsTrigger>
          <TabsTrigger value="autonomy">Autonomy</TabsTrigger>
        </TabsList>

        {/* ── Outcomes Tab ────────────────────────────────── */}
        <TabsContent value="outcomes" className="space-y-4">
          <SectionHeader title="Active Outcomes" subtitle="What you're working toward" />
          <div className="grid gap-4 lg:grid-cols-2">
            {MOCK_OUTCOMES.map(o => (
              <OutcomeProgress
                key={o.id}
                title={o.title}
                description={o.description}
                progress={o.progress}
                blockers={o.blockers}
                nextAction={o.nextAction}
                impact={o.impact}
                domain={o.domain}
              />
            ))}
          </div>
        </TabsContent>

        {/* ── Interventions Tab ───────────────────────────── */}
        <TabsContent value="interventions" className="space-y-4">
          <SectionHeader title="Recommended Interventions" subtitle="One action that helps across modules" />
          <div className="grid gap-4 lg:grid-cols-2">
            {MOCK_INTERVENTIONS.map((intervention, i) => (
              <InterventionCard key={i} {...intervention} />
            ))}
          </div>
        </TabsContent>

        {/* ── Spillovers Tab ──────────────────────────────── */}
        <TabsContent value="spillovers" className="space-y-4">
          <SectionHeader title="Cross-Domain Spillovers" subtitle="How one area of your life affects another" />
          <div className="grid gap-4 lg:grid-cols-2">
            {MOCK_SPILLOVERS.map((s, i) => (
              <SpilloverCard key={i} {...s} />
            ))}
          </div>
        </TabsContent>

        {/* ── Autonomy Tab ────────────────────────────────── */}
        <TabsContent value="autonomy" className="space-y-6">
          <SectionHeader title="Autonomy Overview" subtitle="What runs without you — and what still needs you" />

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Sample autonomy ladders */}
            <div className="rounded-xl border border-border bg-card p-5">
              <h4 className="text-xs font-semibold text-muted-foreground mb-3">Bill Payments</h4>
              <AutonomyLadder
                currentRung="delegated-recurring"
                capabilityName="Auto-pay bills < $500"
                evidenceForPromotion={["30 consecutive successful payments", "Zero anomalies in 90 days"]}
              />
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <h4 className="text-xs font-semibold text-muted-foreground mb-3">Lead Follow-up</h4>
              <AutonomyLadder
                currentRung="suggest"
                capabilityName="Follow-up after 3 days silence"
                evidenceForPromotion={["5 successful follow-ups with positive outcome", "Owner approval rate > 90%"]}
                inShadowMode
              />
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <h4 className="text-xs font-semibold text-muted-foreground mb-3">Grocery Planning</h4>
              <AutonomyLadder
                currentRung="approve-execute"
                capabilityName="Weekly grocery compilation"
                evidenceForPromotion={["3 approved lists without edits"]}
                incidentForDowngrade="Last list missed allergy preference"
              />
            </div>
          </div>

          {/* Execution chain example */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h4 className="text-xs font-semibold text-muted-foreground mb-4">Current Execution Chain</h4>
            <ExecutionChainTimeline
              steps={buildDefaultChain("approval")}
              orientation="horizontal"
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
