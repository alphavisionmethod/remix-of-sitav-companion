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

export default function OutcomeEnginePage() {
  const totalProgress = Math.round(DEMO_OUTCOMES.reduce((s, o) => s + o.progress, 0) / DEMO_OUTCOMES.length);

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
        <KPITile label="Active Outcomes" value={DEMO_OUTCOMES.length} icon={TrendingUp} sub="5 tracked" />
        <KPITile label="Interventions Ready" value={DEMO_INTERVENTIONS.length} trend="up" icon={Sparkles} sub="Cross-domain actions" />
        <KPITile label="Spillovers Detected" value={DEMO_SPILLOVERS.length} trend="down" icon={RefreshCw} sub="Life ↔ work impacts" />
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
            {DEMO_OUTCOMES.map(o => (
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
            {DEMO_INTERVENTIONS.map((intervention, i) => (
              <InterventionCard key={i} {...intervention} />
            ))}
          </div>
        </TabsContent>

        {/* ── Spillovers Tab ──────────────────────────────── */}
        <TabsContent value="spillovers" className="space-y-4">
          <SectionHeader title="Cross-Domain Spillovers" subtitle="How one area of your life affects another" />
          <div className="grid gap-4 lg:grid-cols-2">
            {DEMO_SPILLOVERS.map((s, i) => (
              <SpilloverCard key={i} {...s} />
            ))}
          </div>
        </TabsContent>

        {/* ── Autonomy Tab ────────────────────────────────── */}
        <TabsContent value="autonomy" className="space-y-6">
          <SectionHeader title="Autonomy Overview" subtitle="What runs without you — and what still needs you" />

          <div className="grid gap-6 lg:grid-cols-3">
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
