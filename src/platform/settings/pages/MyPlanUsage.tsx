// ═══════════════════════════════════════════════════════════════
// SITA OS — My Plan & AI Usage
// User-facing capacity language, usage bars, deep mode trigger
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Cpu, Zap, Shield, TrendingUp, Brain, Activity, Gauge,
  Sparkles, ChevronRight, ArrowUpCircle, Layers, CheckCircle2,
  AlertTriangle, Server, Eye, Target,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  PLANS, UPSELL_ADDONS, getPlanByTier, getApplicableAddons,
} from "@/lib/compute-governance";
import type { PlanTier } from "@/lib/compute-governance";
import {
  useComputeBudgetStatus,
  useAISpendSummary,
  useMarginSnapshot,
  useFairUseStatus,
} from "@/platform/governance/hooks/use-compute-governance";
import { toast } from "sonner";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

const TIER_ICONS: Record<PlanTier, typeof Cpu> = {
  personal: Zap,
  pro: Brain,
  business: Target,
  scale: Layers,
  enterprise: Shield,
};

const TIER_COLORS: Record<PlanTier, string> = {
  personal: "from-blue-500/20 to-blue-600/5 border-blue-500/20",
  pro: "from-primary/20 to-primary/5 border-primary/20",
  business: "from-amber-500/20 to-amber-600/5 border-amber-500/20",
  scale: "from-purple-500/20 to-purple-600/5 border-purple-500/20",
  enterprise: "from-rose-500/20 to-rose-600/5 border-rose-500/20",
};

export default function MyPlanUsage() {
  const [currentTier] = useState<PlanTier>("pro");
  const [deepModeActive, setDeepModeActive] = useState(false);

  const plan = getPlanByTier(currentTier)!;
  const addons = getApplicableAddons(currentTier);
  const TierIcon = TIER_ICONS[currentTier];

  const { data: budgetStatus } = useComputeBudgetStatus();
  const { data: spendSummary } = useAISpendSummary();
  const { data: fairUse } = useFairUseStatus(currentTier);

  const caps = plan.userFacingCapabilities;
  const ent = plan.entitlements;

  const handleDeepMode = () => {
    setDeepModeActive(true);
    toast.success("Deep Analysis Mode activated", {
      description: "Premium reasoning enabled for your next request. Uses 1 strategic review credit.",
    });
    setTimeout(() => setDeepModeActive(false), 30000);
  };

  // Usage bars data
  const usageBars = [
    {
      label: "Deep Reasoning",
      used: budgetStatus?.monthlySpentCents ? Math.round(budgetStatus.monthlySpentCents / 100) : 35,
      total: ent.deepReasoningMinutesPerMonth === -1 ? 999 : ent.deepReasoningMinutesPerMonth,
      unit: "min",
      icon: Brain,
      color: "bg-primary",
    },
    {
      label: "Connected Systems",
      used: 6,
      total: ent.connectedSystems === -1 ? 999 : ent.connectedSystems,
      unit: "",
      icon: Server,
      color: "bg-blue-500",
    },
    {
      label: "Active Automations",
      used: 8,
      total: ent.activeAutomationVolume === -1 ? 999 : ent.activeAutomationVolume,
      unit: "",
      icon: Zap,
      color: "bg-amber-500",
    },
    {
      label: "Strategic Reviews",
      used: 2,
      total: ent.premiumStrategicReviews === -1 ? 999 : ent.premiumStrategicReviews,
      unit: "/mo",
      icon: Target,
      color: "bg-purple-500",
    },
    {
      label: "Concurrent Monitors",
      used: 12,
      total: ent.activeMonitoringCapacity === -1 ? 999 : ent.activeMonitoringCapacity,
      unit: "",
      icon: Eye,
      color: "bg-emerald-500",
    },
    {
      label: "Agent Missions",
      used: 3,
      total: ent.maxSimultaneousAgentMissions === -1 ? 999 : ent.maxSimultaneousAgentMissions,
      unit: "",
      icon: Activity,
      color: "bg-rose-500",
    },
  ];

  return (
    <div className="p-4 md:p-6 max-w-[1000px] mx-auto space-y-6">
{/* Plan Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl border bg-gradient-to-br p-6 ${TIER_COLORS[currentTier]}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-card/60 backdrop-blur">
              <TierIcon className="h-7 w-7 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-foreground">{plan.name} Plan</h1>
                <Badge variant="secondary" className="text-xs">${(plan.monthlyPriceCents / 100).toFixed(0)}/mo</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">{plan.positioning}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="gap-1.5">
            <ArrowUpCircle className="h-3.5 w-3.5" />
            Upgrade
          </Button>
        </div>
      </motion.div>

      {/* Deep Mode Trigger */}
      <Card className="bg-gradient-to-r from-primary/5 via-card to-card border-primary/15">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Deep Analysis Mode</p>
              <p className="text-xs text-muted-foreground">
                Activate premium reasoning for your next request · Uses 1 strategic review credit
              </p>
            </div>
          </div>
          <Button
            onClick={handleDeepMode}
            disabled={deepModeActive}
            variant={deepModeActive ? "secondary" : "default"}
            size="sm"
            className="gap-1.5"
          >
            {deepModeActive ? (
              <>
                <Activity className="h-3.5 w-3.5 animate-pulse" />
                Active
              </>
            ) : (
              <>
                <Brain className="h-3.5 w-3.5" />
                Activate Deep Mode
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Capacity Usage Bars */}
      <Card className="bg-card/80 border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Gauge className="h-4 w-4 text-primary" />
            Your Operating Capacity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {usageBars.map((bar) => {
            const pct = bar.total > 0 ? Math.min(Math.round((bar.used / bar.total) * 100), 100) : 0;
            const isUnlimited = bar.total >= 999;
            return (
              <div key={bar.label} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <bar.icon className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs font-medium text-foreground">{bar.label}</span>
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">
                    {bar.used}{bar.unit} / {isUnlimited ? "∞" : `${bar.total}${bar.unit}`}
                  </span>
                </div>
                <Progress value={isUnlimited ? Math.min(pct, 30) : pct} className="h-1.5" />
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Budget Health */}
      {budgetStatus && (
        <Card className="bg-card/80 border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                Budget Health
              </CardTitle>
              <Badge
                variant={budgetStatus.status === "healthy" ? "secondary" : "destructive"}
                className="text-[10px]"
              >
                {budgetStatus.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 rounded-lg bg-secondary/20">
                <p className="text-lg font-bold text-foreground">{budgetStatus.utilizationPct}%</p>
                <p className="text-[10px] text-muted-foreground">Budget Used</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-secondary/20">
                <p className="text-lg font-bold text-foreground">${(budgetStatus.dailySpentCents / 100).toFixed(2)}</p>
                <p className="text-[10px] text-muted-foreground">Today's Spend</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-secondary/20">
                <p className="text-lg font-bold text-foreground">${(budgetStatus.monthlySpentCents / 100).toFixed(2)}</p>
                <p className="text-[10px] text-muted-foreground">This Month</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-secondary/20">
                <p className="text-lg font-bold text-foreground">{budgetStatus.activePolicies}</p>
                <p className="text-[10px] text-muted-foreground">Active Policies</p>
              </div>
            </div>
            <Progress value={budgetStatus.utilizationPct} className="h-2 mt-4" />
          </CardContent>
        </Card>
      )}

      {/* Fair Use Status */}
      {fairUse && (
        <Card className={`border-border/50 ${fairUse.healthy ? "bg-card/80" : "bg-destructive/5 border-destructive/20"}`}>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {fairUse.healthy ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-amber-400" />
              )}
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {fairUse.healthy ? "Within Fair Use" : "Fair Use Actions Recommended"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {fairUse.activeAdaptations.length === 0
                    ? "All usage is within your plan's fair use policy"
                    : `${fairUse.activeAdaptations.length} adaptation(s) active · ${fairUse.reason}`}
                </p>
              </div>
            </div>
            {!fairUse.healthy && (
              <Badge variant="destructive" className="text-[10px]">
                {fairUse.pressureLevel} pressure
              </Badge>
            )}
          </CardContent>
        </Card>
      )}

      {/* AI Spend by Capability */}
      {spendSummary && spendSummary.length > 0 && (
        <Card className="bg-card/80 border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              AI Spend by Capability
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {spendSummary.slice(0, 8).map((row) => (
              <div key={`${row.spend_date}-${row.capability_key}`} className="flex items-center justify-between p-2 rounded-lg bg-secondary/20">
                <div className="flex items-center gap-2">
                  <Cpu className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-foreground capitalize">{row.capability_key.replace(/-/g, " ")}</span>
                </div>
                <div className="flex items-center gap-3 text-[10px]">
                  <span className="text-muted-foreground">{row.request_count} req</span>
                  <span className="text-muted-foreground">{(row.total_tokens / 1000).toFixed(0)}k tok</span>
                  <span className="font-mono text-foreground">${row.total_cost_usd.toFixed(3)}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Capability Language — What's Included */}
      <Card className="bg-card/80 border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">What's Included in {plan.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(caps).map(([key, value]) => (
              <div key={key} className="flex items-start gap-2 p-2 rounded-lg bg-secondary/10">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-muted-foreground capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</p>
                  <p className="text-xs text-foreground">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upsell Add-ons */}
      {addons.length > 0 && (
        <Card className="bg-card/80 border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Available Add-ons
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {addons.map((addon) => (
              <div key={addon.addonId} className="p-3 rounded-lg border border-border/30 bg-secondary/10 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-foreground">{addon.name}</p>
                  <Badge variant="outline" className="text-[10px]">${(addon.monthlyPriceCents / 100).toFixed(0)}/mo</Badge>
                </div>
                <p className="text-[10px] text-muted-foreground">{addon.description}</p>
                <Button variant="outline" size="sm" className="w-full text-[10px] h-7">
                  Add to Plan
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Upgrade Path */}
      <Card className="bg-gradient-to-r from-primary/5 via-card to-card border-primary/15">
        <CardContent className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Upgrade Path</h3>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {PLANS.map((p) => (
              <div
                key={p.planId}
                className={`flex-shrink-0 p-3 rounded-xl border text-center min-w-[120px] ${
                  p.tier === currentTier
                    ? "border-primary/30 bg-primary/10"
                    : "border-border/30 bg-secondary/10"
                }`}
              >
                <p className="text-xs font-semibold text-foreground">{p.name}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {p.monthlyPriceCents === 0 ? "Custom" : `$${(p.monthlyPriceCents / 100).toFixed(0)}/mo`}
                </p>
                {p.tier === currentTier && (
                  <Badge variant="secondary" className="text-[9px] mt-1">Current</Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
