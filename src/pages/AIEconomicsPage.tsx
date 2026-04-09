// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Economics & Token Governance Page
// Model routing, budgets, spend dashboards, anomaly detection
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Cpu, DollarSign, Zap, BarChart3, AlertTriangle, Shield,
  TrendingUp, ArrowRight, Target, Clock, RefreshCw, Layers,
  CheckCircle2, XCircle, Activity,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useOSRuntime } from "@/lib/hooks/useOSRuntime";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";



// ── Seed demo usage ────────────────────────────────────────────
function useDemoEconomics() {
  const { engines } = useOSRuntime();

  return useMemo(() => {
    // Seed some usage records
    const domains = ["business", "finance", "concierge", "boardroom", "system"];
    const models = ["structured-state", "gemini-3-flash-preview", "gpt-4o-mini", "claude-sonnet-4-20250514"];
    const advisors = ["business-advisor", "money-advisor", "concierge-advisor", "trust-advisor"];

    for (let i = 0; i < 50; i++) {
      const domain = domains[i % domains.length];
      const model = models[Math.min(Math.floor(i / 15), 3)];
      const tier = (["no_llm", "cheap", "mid", "premium"] as const)[Math.min(Math.floor(i / 15), 3)];
      const tokens = model === "structured-state" ? 0 : Math.floor(Math.random() * 4000) + 200;
      const costMap: Record<string, number> = { "structured-state": 0, "gemini-3-flash-preview": 0.00015, "gpt-4o-mini": 0.0003, "claude-sonnet-4-20250514": 0.003 };

      engines.tokens.recordUsage({
        requestId: `req-${i}`,
        userId: "default-user",
        domain,
        model,
        tier,
        workflowId: `wf-${i}`,
        advisorId: advisors[i % advisors.length],
        inputTokens: Math.floor(tokens * 0.7),
        outputTokens: Math.floor(tokens * 0.3),
        totalTokens: tokens,
        cost: (tokens / 1000) * (costMap[model] || 0.001),
        cached: Math.random() > 0.7,
        compressed: false,
      });
    }

    // Set a budget
    engines.tokens.setBudget({
      id: "budget-daily-global",
      scope: "daily",
      scopeId: "global",
      limit: 100000,
      used: 0,
      remaining: 100000,
      period: "daily",
      hardLimit: false,
      alertThreshold: 80,
      overage: 0,
      lastReset: new Date().toISOString(),
    });

    const dashboard = engines.tokens.getDashboard("today");

    // Route some sample requests
    const routingExamples = [
      engines.tokens.routeRequest({ domain: "business", workflowType: "status_check", complexity: "trivial", userId: "u1", estimatedTokens: 0 }),
      engines.tokens.routeRequest({ domain: "finance", workflowType: "analysis", complexity: "moderate", userId: "u1", estimatedTokens: 2000 }),
      engines.tokens.routeRequest({ domain: "boardroom", workflowType: "strategy", complexity: "complex", userId: "u1", estimatedTokens: 5000 }),
      engines.tokens.routeRequest({ domain: "concierge", workflowType: "summary", complexity: "simple", userId: "u1", estimatedTokens: 500 }),
    ];

    return { dashboard, routingExamples };
  }, [engines.tokens]);
}

// ── Main Page ──────────────────────────────────────────────────
export default function AIEconomicsPage() {
  const { isDemoMode } = useDataMode();
  const { dashboard, routingExamples } = useDemoEconomics();

  const tierColors: Record<string, string> = {
    no_llm: "text-trust-safe", cheap: "text-primary", mid: "text-sita-gold", premium: "text-accent",
  };

  return (
    <div className="p-4 md:p-6 max-w-[1200px] mx-auto space-y-6">
      <DemoModeBadge />
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/5 via-card to-card p-6"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15">
            <Cpu className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground font-display">AI Economics</h1>
            <p className="text-sm text-muted-foreground">Token governance, model routing, budget controls, and efficiency metrics</p>
          </div>
          <div className="hidden md:flex gap-4">
            <div className="text-center">
              <p className="text-lg font-bold font-display text-foreground">${dashboard.totalSpend.toFixed(3)}</p>
              <p className="text-[9px] text-muted-foreground">Today's Spend</p>
            </div>
            <div className="text-center">
              <p className={cn("text-lg font-bold font-display", dashboard.efficiencyScore >= 80 ? "text-trust-safe" : "text-accent")}>
                {Math.round(dashboard.efficiencyScore)}%
              </p>
              <p className="text-[9px] text-muted-foreground">Efficiency</p>
            </div>
          </div>
        </div>
      </motion.div>

      <Tabs defaultValue="overview">
        <TabsList className="bg-muted/30 border border-border/40 h-9 p-0.5">
          <TabsTrigger value="overview" className="text-[11px] h-8 px-3 data-[state=active]:bg-card">
            <BarChart3 className="h-3 w-3 mr-1.5" />Overview
          </TabsTrigger>
          <TabsTrigger value="routing" className="text-[11px] h-8 px-3 data-[state=active]:bg-card">
            <Layers className="h-3 w-3 mr-1.5" />Model Routing
          </TabsTrigger>
          <TabsTrigger value="anomalies" className="text-[11px] h-8 px-3 data-[state=active]:bg-card">
            <AlertTriangle className="h-3 w-3 mr-1.5" />Anomalies ({dashboard.anomalies.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-5 space-y-5">
          {/* Spend by Model */}
          <div className="rounded-xl border border-border/30 bg-card/60 p-5">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Cpu className="h-3 w-3" /> Spend by Model
            </h3>
            <div className="space-y-3">
              {dashboard.byModel.map((m: any, i: number) => {
                const maxTokens = Math.max(...dashboard.byModel.map((x: any) => x.tokens));
                return (
                  <motion.div key={m.model} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3"
                  >
                    <span className="text-[10px] font-mono text-muted-foreground w-40 truncate">{m.model}</span>
                    <div className="flex-1 h-2 rounded-full bg-muted/30 overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${(m.tokens / maxTokens) * 100}%` }}
                        className="h-full rounded-full bg-primary/60" transition={{ duration: 0.6 }} />
                    </div>
                    <span className="text-[10px] font-mono text-foreground w-14 text-right">{(m.tokens / 1000).toFixed(1)}k</span>
                    <span className="text-[10px] text-muted-foreground w-16 text-right">${m.cost.toFixed(4)}</span>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Spend by Domain */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-border/30 bg-card/60 p-5">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">By Domain</h3>
              {dashboard.byDomain.map((d: any) => (
                <div key={d.domain} className="flex items-center justify-between py-1.5 border-b border-border/10 last:border-0">
                  <span className="text-xs text-foreground capitalize">{d.domain}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono text-muted-foreground">{(d.tokens / 1000).toFixed(1)}k tokens</span>
                    <span className="text-[10px] font-mono text-foreground">${d.cost.toFixed(4)}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-border/30 bg-card/60 p-5">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">By Advisor</h3>
              {dashboard.byAdvisor.map((a: any) => (
                <div key={a.advisorId} className="flex items-center justify-between py-1.5 border-b border-border/10 last:border-0">
                  <span className="text-xs text-foreground capitalize">{a.advisorId.replace(/-/g, " ")}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono text-muted-foreground">{(a.tokens / 1000).toFixed(1)}k</span>
                    <span className="text-[10px] font-mono text-foreground">${a.cost.toFixed(4)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Forecast */}
          <div className="rounded-xl border border-sita-gold/15 bg-sita-gold/5 p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-sita-gold" />
              <span className="text-xs font-semibold text-sita-gold">Forecast</span>
            </div>
            <p className="text-xs text-muted-foreground">
              At current usage, projected daily spend is <span className="font-bold text-foreground">${dashboard.forecastedSpend.toFixed(3)}</span>.
              Efficiency score: {Math.round(dashboard.efficiencyScore)}% (cache hit rate).
            </p>
          </div>
        </TabsContent>

        <TabsContent value="routing" className="mt-5 space-y-4">
          <div className="rounded-xl border border-border/30 bg-card/60 p-5">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Recent Routing Decisions</h3>
            {routingExamples.map((r, i) => (
              <motion.div key={r.requestId} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3 py-2.5 border-b border-border/10 last:border-0"
              >
                <div className={cn("flex items-center justify-center w-7 h-7 rounded-lg bg-secondary/30", tierColors[r.selectedTier])}>
                  {r.selectedTier === "no_llm" ? <Zap className="h-3.5 w-3.5" /> : <Cpu className="h-3.5 w-3.5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground">{r.domain} / {r.workflowType}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{r.reason}</p>
                </div>
                <Badge variant="outline" className={cn("text-[9px]", tierColors[r.selectedTier])}>
                  {r.selectedTier === "no_llm" ? "No LLM" : r.selectedModel}
                </Badge>
              </motion.div>
            ))}
          </div>

          {/* Routing Rules */}
          <div className="rounded-xl border border-primary/10 bg-primary/5 p-4">
            <h3 className="text-xs font-semibold text-foreground mb-3">Routing Rules</h3>
            <div className="space-y-2">
              {[
                { rule: "Trivial tasks → No LLM (structured state)", icon: Zap, color: "text-trust-safe" },
                { rule: "Simple tasks → Flash model (cheapest)", icon: DollarSign, color: "text-primary" },
                { rule: "Moderate tasks → Mid-tier model", icon: Target, color: "text-sita-gold" },
                { rule: "Complex/Critical → Premium model", icon: Shield, color: "text-accent" },
                { rule: "Budget constrained → Auto-downgrade tier", icon: AlertTriangle, color: "text-destructive" },
              ].map((r, i) => (
                <div key={i} className="flex items-center gap-2 text-[10px]">
                  <r.icon className={cn("h-3 w-3 shrink-0", r.color)} />
                  <span className="text-muted-foreground">{r.rule}</span>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="anomalies" className="mt-5 space-y-3">
          {dashboard.anomalies.length === 0 ? (
            <div className="rounded-xl border border-trust-safe/15 bg-trust-safe/5 p-6 text-center">
              <CheckCircle2 className="h-6 w-6 text-trust-safe mx-auto mb-2" />
              <p className="text-sm font-semibold text-foreground">No anomalies detected</p>
              <p className="text-xs text-muted-foreground">Token usage is within normal bounds</p>
            </div>
          ) : (
            dashboard.anomalies.map((a: any) => (
              <div key={a.id} className={cn("rounded-xl border p-4",
                a.severity === "critical" ? "border-destructive/20 bg-destructive/5" :
                a.severity === "warning" ? "border-accent/20 bg-accent/5" :
                "border-border/30 bg-card/60"
              )}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={cn("h-4 w-4", a.severity === "critical" ? "text-destructive" : "text-accent")} />
                    <span className="text-xs font-semibold text-foreground capitalize">{a.type.replace(/_/g, " ")}</span>
                  </div>
                  <Badge variant="outline" className="text-[9px]">{a.severity}</Badge>
                </div>
                <p className="text-[10px] text-muted-foreground mb-1">{a.description}</p>
                <p className="text-[10px] text-primary">Suggested: {a.suggestedAction}</p>
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
