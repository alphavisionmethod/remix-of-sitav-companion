// ═══════════════════════════════════════════════════════════════
// SITA OS — Spillover Dashboard
// Cross-domain intelligence: how life affects business, money
// affects family, and what single intervention helps the most
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ArrowLeftRight, TrendingDown, Shield, Sparkles, AlertTriangle, Activity } from "lucide-react";
import { motion } from "framer-motion";
import { SpilloverCard, SpilloverBadge } from "@/components/sita/primitives/SpilloverBadge";
import { InterventionCard } from "@/components/sita/primitives/InterventionCard";
import { KPITile, SectionHeader } from "@/components/sita/SitaComponents";
import { ConfidenceBar } from "@/components/sita/primitives/ConfidenceBar";
import { AutonomyLadder } from "@/components/sita/primitives/AutonomyLadder";
import { SectionSkeleton } from "@/components/sita/SectionSkeleton";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { PageShell } from "@/components/sita/PageShell";


// Production fallback — seed data removed
const SPILLOVER_DOMAINS: any[] = [];

// ── Spillover data ───────────────────────────────────────────

// ── Spillover graph (simplified visual) ──────────────────────

const SpilloverGraph = () => {
  return (
  <div className="relative aspect-square max-w-[280px] mx-auto">
    <svg viewBox="0 0 100 100" className="w-full h-full">
      {/* Connection lines */}
      {([] as never[]).map((s, i) => {
        const from = ([] as never[]).find(d => d.id === s.from);
        const to = ([] as never[]).find(d => d.id === s.to);
        if (!from || !to) return null;
        const opacity = s.impact === "high" ? 0.6 : s.impact === "medium" ? 0.35 : 0.15;
        const width = s.impact === "high" ? 1.5 : s.impact === "medium" ? 1 : 0.5;
        return (
          <line
            key={i}
            x1={from.x} y1={from.y} x2={to.x} y2={to.y}
            stroke="hsl(var(--destructive))"
            strokeWidth={width}
            strokeOpacity={opacity}
            strokeDasharray={s.impact === "low" ? "2,2" : undefined}
          />
        );
      })}
    </svg>
    {/* Domain nodes */}
    {([] as never[]).map(d => (
      <div
        key={d.id}
        className="absolute flex flex-col items-center gap-1"
        style={{ left: `${d.x}%`, top: `${d.y}%`, transform: "translate(-50%, -50%)" }}
      >
        <div
          className="h-8 w-8 rounded-full border-2 flex items-center justify-center text-[10px] font-bold"
          style={{ borderColor: d.color, backgroundColor: `${d.color}15`, color: d.color }}
        >
          {d.label[0]}
        </div>
        <span className="text-[9px] font-medium text-muted-foreground">{d.label}</span>
      </div>
    ))}
  </div>
);
};

export default function SpilloverDashboard() {
  const highCount = ([] as never[]).filter(s => s.impact === "high").length;
  const medCount = ([] as never[]).filter(s => s.impact === "medium").length;

  return (
    <PageShell>
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
{/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--trust-review)/0.1)]">
            <ArrowLeftRight className="h-5 w-5 text-[hsl(var(--trust-review))]" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">Spillover Intelligence</h1>
            <p className="text-sm text-muted-foreground">How one area of your life affects another — and what to do about it</p>
          </div>
        </div>
      </motion.div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPITile label="Active Spillovers" value={([] as never[]).length} trend="down" icon={ArrowLeftRight} sub="Cross-domain impacts" />
        <KPITile label="High Impact" value={highCount} trend="down" icon={AlertTriangle} sub="Urgent attention needed" />
        <KPITile label="Domains Affected" value={4} icon={Activity} sub="All interconnected" />
        <KPITile label="Interventions Ready" value={([] as never[]).length} trend="up" icon={Sparkles} sub="Cross-cutting fixes" />
      </div>

      {/* Main content grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Spillover graph + confidence + autonomy */}
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Domain Interconnection</h3>
            <SpilloverGraph />
            <div className="mt-4 space-y-2">
              <ConfidenceBar value={72} label="System Confidence" />
              <p className="text-[10px] text-muted-foreground">
                Based on 14 days of cross-domain pattern analysis
              </p>
            </div>
          </div>

          {/* Autonomy Ladder — shows current spillover engine autonomy */}
          <div className="rounded-xl border border-border bg-card p-5">
            <AutonomyLadder
              currentRung="suggest"
              capabilityName="Spillover Engine"
              evidenceForPromotion={[
                "3 successful intervention suggestions accepted",
                "0 false positive spillovers in 7 days",
              ]}
              compact
            />
          </div>

          {/* Active badges */}
          <div className="rounded-xl border border-border bg-card p-4">
            <h4 className="text-xs font-semibold text-muted-foreground mb-3">Active Flows</h4>
            <div className="flex flex-wrap gap-2">
              {([] as never[]).map((s, i) => (
                <SpilloverBadge key={i} from={s.from} to={s.to} impact={s.impact} description={s.title} />
              ))}
            </div>
          </div>
        </div>

        {/* Right: Spillover cards + interventions */}
        <div className="lg:col-span-2 space-y-6">
          <SectionHeader title="Top Interventions" subtitle="Single actions that fix multiple spillovers" />
          <div className="grid gap-4 md:grid-cols-2">
            {([] as never[]).map((intervention, i) => (
              <InterventionCard key={i} {...intervention} />
            ))}
          </div>

          <SectionHeader title="Active Spillovers" subtitle="Ordered by impact severity" />
          <div className="grid gap-4 md:grid-cols-2">
            {([] as never[]).map((s, i) => (
              <SpilloverCard key={i} {...s} />
            ))}
          </div>
        </div>
      </div>
    </div>
    </PageShell>
  );
}
