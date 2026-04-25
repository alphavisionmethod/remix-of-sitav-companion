// ═══════════════════════════════════════════════════════════════
// SITA OS — Operating Pulse
// Daily, weekly, and domain-specific pulse summaries
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { SitaCard, SitaCardTitle, SitaSectionHeader } from "@/platform/sita/components/sita/SitaCard";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  useMissionControlSummary, useFounderCostSummary, useTrustSummary,
} from "@/hooks/use-mission-control-views";
import {
  BarChart3, TrendingUp, DollarSign, Shield, Users, Rocket,
  Heart, AlertTriangle, Target, Calendar, Clock, Sparkles,
  CheckCircle, Activity,
} from "lucide-react";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

interface PulseItem {
  label: string;
  value: string;
  trend?: string;
  direction?: "up" | "down" | "flat";
}

const dailyPulse: PulseItem[] = [
  { label: "Revenue Today", value: "$4,200", trend: "+12%", direction: "up" },
  { label: "Workflows Executed", value: "847", trend: "+5%", direction: "up" },
  { label: "Approvals Processed", value: "23", trend: "−2", direction: "down" },
  { label: "Receipts Generated", value: "1,204", trend: "+8%", direction: "up" },
  { label: "AI Tokens Used", value: "142K", trend: "within budget", direction: "flat" },
  { label: "Connector Calls", value: "3,891", trend: "normal", direction: "flat" },
];

const weeklyPulse: PulseItem[] = [
  { label: "Weekly Revenue", value: "$28.4K", trend: "+18% WoW", direction: "up" },
  { label: "New Customers", value: "12", trend: "+3 from last week", direction: "up" },
  { label: "Churn Risk", value: "2 accounts", trend: "$8.4K ARR at risk", direction: "down" },
  { label: "Trust Score Δ", value: "+2.1%", trend: "trending healthy", direction: "up" },
  { label: "Incident Count", value: "3", trend: "−1 from last week", direction: "up" },
  { label: "AI Cost Efficiency", value: "94%", trend: "above target", direction: "up" },
];

function PulseGrid({ items }: { items: PulseItem[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
{items.map((item, i) => (
        <motion.div key={item.label} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
          <div className="rounded-xl border border-border/50 bg-card/60 p-4 card-hover-lift">
            <p className="font-display text-xl font-bold text-foreground">{item.value}</p>
            <p className="text-[11px] text-muted-foreground mt-1">{item.label}</p>
            {item.trend && (
              <div className="flex items-center gap-1 mt-1.5">
                {item.direction === "up" ? <TrendingUp className="h-3 w-3 text-trust-safe" /> :
                 item.direction === "down" ? <AlertTriangle className="h-3 w-3 text-accent" /> :
                 <Activity className="h-3 w-3 text-muted-foreground" />}
                <span className={cn("text-[10px]",
                  item.direction === "up" ? "text-trust-safe" : item.direction === "down" ? "text-accent" : "text-muted-foreground"
                )}>{item.trend}</span>
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export default function OwnerPulsePage() {
  const summary = useMissionControlSummary();
  const cost = useFounderCostSummary();
  const trust = useTrustSummary();

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/5 via-card to-card p-6"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 shadow-lg shadow-primary/10">
            <BarChart3 className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">Operating Pulse</h1>
            <p className="text-sm text-muted-foreground">Boardroom-grade summary of your operating state</p>
          </div>
        </div>
      </motion.div>

      <Tabs defaultValue="daily" className="space-y-4">
        <TabsList className="bg-secondary/30 p-1 rounded-xl">
          <TabsTrigger value="daily" className="rounded-lg text-xs data-[state=active]:bg-card data-[state=active]:shadow-sm">
            <Clock className="h-3.5 w-3.5 mr-1.5" />Daily
          </TabsTrigger>
          <TabsTrigger value="weekly" className="rounded-lg text-xs data-[state=active]:bg-card data-[state=active]:shadow-sm">
            <Calendar className="h-3.5 w-3.5 mr-1.5" />Weekly
          </TabsTrigger>
          <TabsTrigger value="domains" className="rounded-lg text-xs data-[state=active]:bg-card data-[state=active]:shadow-sm">
            <Target className="h-3.5 w-3.5 mr-1.5" />By Domain
          </TabsTrigger>
        </TabsList>

        <TabsContent value="daily">
          <SitaSectionHeader title="Today's Pulse" subtitle={new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })} />
          <PulseGrid items={dailyPulse} />
        </TabsContent>

        <TabsContent value="weekly">
          <SitaSectionHeader title="This Week" subtitle="Monday – Today" />
          <PulseGrid items={weeklyPulse} />
        </TabsContent>

        <TabsContent value="domains" className="space-y-4">
          {[
            { domain: "Revenue", icon: DollarSign, items: [
              { label: "MRR", value: "$112K", trend: "+18%", direction: "up" as const },
              { label: "Pipeline", value: "$1.2M", trend: "23 deals", direction: "flat" as const },
              { label: "Churn Risk", value: "$234K", trend: "5 accounts", direction: "down" as const },
            ]},
            { domain: "Trust", icon: Shield, items: [
              { label: "Posture", value: trust.posture },
              { label: "Verification Health", value: `${trust.verificationHealth}%`, trend: "above SLO", direction: "up" as const },
              { label: "Proof Completeness", value: `${trust.proofCompleteness}%` },
            ]},
            { domain: "Product", icon: Rocket, items: [
              { label: "Canary Coverage", value: "15%", trend: "3 modules", direction: "flat" as const },
              { label: "Feature Flags", value: "12 active" },
              { label: "Release Stability", value: "98.5%", trend: "above target", direction: "up" as const },
            ]},
          ].map(d => (
            <div key={d.domain}>
              <SitaSectionHeader title={`${d.domain} Pulse`} />
              <PulseGrid items={d.items} />
            </div>
          ))}
        </TabsContent>
      </Tabs>

      <SitaCard hover={false} className="border-primary/10 bg-gradient-to-br from-primary/3 to-card">
        <SitaCardTitle sub="AI-generated executive summary">
          <Sparkles className="h-4 w-4 text-primary inline mr-2" />Boardroom Summary
        </SitaCardTitle>
        <div className="mt-3 space-y-2 text-xs text-muted-foreground leading-relaxed">
          <p>Revenue continues strong growth at +18% MoM. Pipeline is healthy with 23 active deals worth $1.2M. Trust posture is "{trust.posture}" — within acceptable range.</p>
          <p>Two degradation patterns flagged: Connector Gateway latency spikes and Workflow Engine retry increases. Neither has crossed SLO thresholds but both warrant monitoring.</p>
          <p>AI spend is at {cost.budgetUtilization}% of daily budget. No cost anomalies detected. {summary.incidentsSummary.open} active incidents, none critical to revenue.</p>
        </div>
      </SitaCard>
    </div>
  );
}
