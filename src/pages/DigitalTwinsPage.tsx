// ═══════════════════════════════════════════════════════════════
// SITA OS — Digital Twins Page
// Business/Money/Household/Unified operating twins
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Building2, Wallet, Home, Layers, HeartPulse, AlertTriangle,
  TrendingUp, TrendingDown, Minus, Target, BarChart3, Shield,
  Activity, Zap, Clock, ArrowRight,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useOSRuntime } from "@/hooks/useOSRuntime";
import type { TwinType } from "@/packages/contracts";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { PageShell } from "@/components/sita/PageShell";

// ── Seed Demo Twins ────────────────────────────────────────────
function useDemoTwins() {
  const { engines } = useOSRuntime();

  return useMemo(() => {
    const types: TwinType[] = ["business", "money", "household", "unified"];
    const twins = types.map(type => {
      let twin = engines.twins.getTwin(type, "default-user");
      if (!twin) {
        twin = engines.twins.createTwin(type, "default-user");

        // Seed signals
        if (type === "business") {
          engines.twins.addSignal(twin.id, { category: "revenue_risk", severity: "warning", title: "Pipeline thinning", description: "Deal pipeline value dropped 18% this month", trend: "worsening", detectedAt: new Date().toISOString() });
          engines.twins.addSignal(twin.id, { category: "underused_capacity", severity: "info", title: "Calendar capacity available", description: "32% of this week's slots are open", trend: "stable", detectedAt: new Date().toISOString() });
          engines.twins.addBottleneck(twin.id, { area: "Sales Follow-up", severity: "high", description: "Average follow-up time is 4.2 days", impact: "Losing 15% of warm leads", suggestedAction: "Enable auto follow-up", estimatedResolutionDays: 1 });
          engines.twins.addProjection(twin.id, { metric: "Monthly Revenue", current: 42000, projected30d: 45000, projected90d: 52000, confidence: 0.78, assumptions: ["Current pipeline converts at 22%", "No major churn"] });
        }
        if (type === "money") {
          engines.twins.addSignal(twin.id, { category: "cash_pressure", severity: "warning", title: "Cash runway shortening", description: "At current burn, runway is 4.8 months", trend: "worsening", detectedAt: new Date().toISOString() });
          engines.twins.addSignal(twin.id, { category: "opportunity_concentration", severity: "info", title: "Subscription savings available", description: "$340/mo in unused subscriptions detected", trend: "stable", detectedAt: new Date().toISOString() });
          engines.twins.addProjection(twin.id, { metric: "Cash Balance", current: 85000, projected30d: 72000, projected90d: 48000, confidence: 0.82, assumptions: ["Current expense run rate", "Accounts receivable at 30-day avg"] });
        }
        if (type === "household") {
          engines.twins.addSignal(twin.id, { category: "schedule_strain", severity: "warning", title: "Over-scheduled week ahead", description: "Next week has 3 scheduling conflicts", trend: "worsening", detectedAt: new Date().toISOString() });
          engines.twins.addSignal(twin.id, { category: "prep_risk", severity: "info", title: "School prep needed", description: "Science project due in 5 days — materials not ordered", trend: "stable", detectedAt: new Date().toISOString() });
        }
      }
      return twin;
    });
    return { twins, unified: engines.twins.getUnifiedView("default-user") };
  }, [engines.twins]);
}

// ── Twin Card ──────────────────────────────────────────────────
const twinMeta: Record<TwinType, { icon: typeof Building2; label: string; color: string }> = {
  business: { icon: Building2, label: "Business Twin", color: "text-primary" },
  money: { icon: Wallet, label: "Money Twin", color: "text-sita-gold" },
  household: { icon: Home, label: "Household Twin", color: "text-trust-safe" },
  unified: { icon: Layers, label: "Unified Twin", color: "text-accent" },
  operating: { icon: Activity, label: "Operating Twin", color: "text-foreground" },
};

function TwinDetailView({ twinType }: { twinType: TwinType }) {
  const { twins } = useDemoTwins();
  const twin = twins.find(t => t.type === twinType);
  if (!twin) return null;
  const meta = twinMeta[twinType];
  const Icon = meta.icon;
  const trendIcon = { improving: TrendingUp, stable: Minus, worsening: TrendingDown };

  return (
    <PageShell>
    <div className="space-y-5">
{/* Health Hero */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-border/40 bg-gradient-to-br from-card via-card to-secondary/10 p-5"
      >
        <div className="flex items-center gap-4 mb-4">
          <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/30", meta.color)}>
            <Icon className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-foreground font-display">{meta.label}</h2>
            <p className="text-xs text-muted-foreground">{twin.signals.length} active signals · {twin.bottlenecks.length} bottlenecks</p>
          </div>
          <div className="text-center">
            <p className={cn("text-3xl font-bold font-display", twin.healthScore >= 70 ? "text-trust-safe" : twin.healthScore >= 40 ? "text-accent" : "text-destructive")}>
              {twin.healthScore}
            </p>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Health</p>
          </div>
        </div>
        <Progress value={twin.healthScore} className="h-2" />
      </motion.div>

      {/* Signals */}
      {twin.signals.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="h-3 w-3" /> Active Signals
          </h3>
          {twin.signals.map(s => {
            const TrendIcon = trendIcon[s.trend];
            return (
              <motion.div key={s.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                className={cn("rounded-xl border p-3 flex items-start gap-3",
                  s.severity === "critical" ? "border-destructive/20 bg-destructive/5" :
                  s.severity === "warning" ? "border-accent/20 bg-accent/5" :
                  "border-border/30 bg-card/60"
                )}
              >
                <AlertTriangle className={cn("h-4 w-4 mt-0.5 shrink-0",
                  s.severity === "critical" ? "text-destructive" : s.severity === "warning" ? "text-accent" : "text-muted-foreground"
                )} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground">{s.title}</p>
                  <p className="text-[10px] text-muted-foreground">{s.description}</p>
                </div>
                <div className="flex items-center gap-1">
                  <TrendIcon className={cn("h-3 w-3", s.trend === "improving" ? "text-trust-safe" : s.trend === "worsening" ? "text-destructive" : "text-muted-foreground")} />
                  <span className="text-[9px] text-muted-foreground">{s.trend}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Projections */}
      {twin.projections.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <BarChart3 className="h-3 w-3" /> Projections
          </h3>
          {twin.projections.map(p => (
            <div key={p.metric} className="rounded-xl border border-border/30 bg-card/60 p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-foreground">{p.metric}</p>
                <Badge variant="outline" className="text-[9px]">{Math.round(p.confidence * 100)}% confidence</Badge>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center rounded-lg bg-secondary/20 p-2">
                  <p className="text-sm font-bold font-display text-foreground">${(p.current / 1000).toFixed(0)}k</p>
                  <p className="text-[9px] text-muted-foreground">Current</p>
                </div>
                <div className="text-center rounded-lg bg-primary/5 p-2">
                  <p className="text-sm font-bold font-display text-primary">${(p.projected30d / 1000).toFixed(0)}k</p>
                  <p className="text-[9px] text-muted-foreground">30-day</p>
                </div>
                <div className="text-center rounded-lg bg-primary/10 p-2">
                  <p className="text-sm font-bold font-display text-primary">${(p.projected90d / 1000).toFixed(0)}k</p>
                  <p className="text-[9px] text-muted-foreground">90-day</p>
                </div>
              </div>
              <div className="mt-2 space-y-0.5">
                {p.assumptions.map((a, i) => (
                  <p key={i} className="text-[9px] text-muted-foreground">• {a}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bottlenecks */}
      {twin.bottlenecks.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Target className="h-3 w-3" /> Bottlenecks
          </h3>
          {twin.bottlenecks.map(b => (
            <div key={b.id} className="rounded-xl border border-accent/15 bg-accent/5 p-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-semibold text-foreground">{b.area}</p>
                <Badge variant="outline" className={cn("text-[9px]",
                  b.severity === "critical" ? "text-destructive" : b.severity === "high" ? "text-accent" : "text-muted-foreground"
                )}>{b.severity}</Badge>
              </div>
              <p className="text-[10px] text-muted-foreground mb-1">{b.description}</p>
              <p className="text-[10px] text-accent font-medium">Impact: {b.impact}</p>
              <div className="flex items-center gap-1.5 mt-2 text-[10px] text-primary">
                <Zap className="h-3 w-3" />
                <span>{b.suggestedAction} · ~{b.estimatedResolutionDays}d</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    </PageShell>
  );
}

// ── Main Page ──────────────────────────────────────────────────
export default function DigitalTwinsPage() {
  const { unified } = useDemoTwins();
  const [activeTab, setActiveTab] = useState<string>("overview");

  return (
    <div className="p-4 md:p-6 max-w-[1200px] mx-auto space-y-6">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/5 via-card to-card p-6"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15">
            <Layers className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground font-display">Digital Twins</h1>
            <p className="text-sm text-muted-foreground">Live operating models of your business, money, and household</p>
          </div>
          <div className="hidden md:block text-center">
            <p className={cn("text-3xl font-bold font-display", unified.aggregateHealth >= 70 ? "text-trust-safe" : "text-accent")}>
              {Math.round(unified.aggregateHealth)}
            </p>
            <p className="text-[9px] text-muted-foreground">Aggregate Health</p>
          </div>
        </div>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted/30 border border-border/40 h-9 p-0.5">
          <TabsTrigger value="overview" className="text-[11px] h-8 px-3 data-[state=active]:bg-card">
            <Layers className="h-3 w-3 mr-1.5" />Overview
          </TabsTrigger>
          <TabsTrigger value="business" className="text-[11px] h-8 px-3 data-[state=active]:bg-card">
            <Building2 className="h-3 w-3 mr-1.5" />Business
          </TabsTrigger>
          <TabsTrigger value="money" className="text-[11px] h-8 px-3 data-[state=active]:bg-card">
            <Wallet className="h-3 w-3 mr-1.5" />Money
          </TabsTrigger>
          <TabsTrigger value="household" className="text-[11px] h-8 px-3 data-[state=active]:bg-card">
            <Home className="h-3 w-3 mr-1.5" />Household
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {unified.twins.filter(t => t.type !== "unified").map(twin => {
              const meta = twinMeta[twin.type];
              const Icon = meta.icon;
              return (
                <motion.div key={twin.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-border/40 bg-card/80 p-4 cursor-pointer hover:border-primary/30 transition-all"
                  onClick={() => setActiveTab(twin.type)}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <Icon className={cn("h-5 w-5", meta.color)} />
                    <span className="text-sm font-bold text-foreground font-display">{meta.label}</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] text-muted-foreground">{twin.signals.length} signals · {twin.bottlenecks.length} bottlenecks</span>
                    <span className={cn("text-lg font-bold font-display", twin.healthScore >= 70 ? "text-trust-safe" : "text-accent")}>{twin.healthScore}</span>
                  </div>
                  <Progress value={twin.healthScore} className="h-1.5" />
                </motion.div>
              );
            })}
          </div>

          {/* Top Signals Across Twins */}
          {unified.topSignals.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Top Cross-Domain Signals</h3>
              {unified.topSignals.slice(0, 5).map(s => (
                <div key={s.id} className="flex items-center gap-3 rounded-xl border border-border/30 bg-card/60 p-3">
                  <AlertTriangle className={cn("h-4 w-4 shrink-0", s.severity === "critical" ? "text-destructive" : "text-accent")} />
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-foreground">{s.title}</p>
                    <p className="text-[10px] text-muted-foreground">{s.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="business" className="mt-5"><TwinDetailView twinType="business" /></TabsContent>
        <TabsContent value="money" className="mt-5"><TwinDetailView twinType="money" /></TabsContent>
        <TabsContent value="household" className="mt-5"><TwinDetailView twinType="household" /></TabsContent>
      </Tabs>
    </div>
  );
}
