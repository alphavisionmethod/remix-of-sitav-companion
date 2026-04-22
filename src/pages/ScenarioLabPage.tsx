// ═══════════════════════════════════════════════════════════════
// SITA OS — Scenario Intelligence Lab
// Simulate decisions, forecasts, tradeoffs, stress tests
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FlaskConical, Play, BarChart3, TrendingUp, TrendingDown, Minus,
  Target, ArrowRight, Shield, AlertTriangle, CheckCircle2, Layers,
  DollarSign, Clock, Users, Zap,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useOSRuntime } from "@/hooks/useOSRuntime";
import type { ScenarioTemplate, ScenarioSimulation, ScenarioOutcome } from "@/packages/contracts";
import type { RealityLane, ConfidenceScore, SimulationResult } from "@/packages/reality-contracts";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { PageShell } from "@/components/sita/PageShell";

// ── Template Card ──────────────────────────────────────────────
function TemplateCard({ template, onRun }: { template: ScenarioTemplate; onRun: () => void }) {
  const typeColors: Record<string, string> = {
    decision: "text-primary", forecast: "text-sita-gold", tradeoff: "text-accent", stress_test: "text-destructive", spillover: "text-muted-foreground",
  };
  const typeIcons: Record<string, typeof FlaskConical> = {
    decision: Target, forecast: TrendingUp, tradeoff: BarChart3, stress_test: AlertTriangle, spillover: Layers,
  };
  const Icon = typeIcons[template.type] || FlaskConical;

  return (
    <PageShell>
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="rounded-2xl border border-border/50 bg-card/80 p-5 cursor-pointer hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all"
      onClick={onRun}
    >
<div className="flex items-center gap-3 mb-3">
        <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl bg-secondary/30", typeColors[template.type])}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-bold text-foreground font-display">{template.name}</h3>
          <p className="text-[10px] text-muted-foreground">{template.description}</p>
        </div>
        <Badge variant="outline" className={cn("text-[9px]", typeColors[template.type])}>{template.type.replace("_", " ")}</Badge>
      </div>
      <div className="flex flex-wrap gap-1 mb-3">
        {template.requiredInputs.map(inp => (
          <span key={inp.field} className="text-[9px] px-1.5 py-0.5 rounded-md bg-secondary/40 text-muted-foreground">{inp.label}</span>
        ))}
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-border/30">
        <span className="text-[9px] text-muted-foreground">Domain: {template.domain}</span>
        <div className="flex items-center gap-1 text-[10px] text-primary font-medium">
          <Play className="h-3 w-3" /> Run Simulation
        </div>
      </div>
    </motion.div>
    </PageShell>
  );
}

// ── Simulation Runner ──────────────────────────────────────────
function SimulationRunner({ template, onClose }: { template: ScenarioTemplate; onClose: () => void }) {
  const { engines } = useOSRuntime();
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [result, setResult] = useState<ScenarioSimulation | null>(null);

  const runSim = () => {
    const outcomes: ScenarioOutcome[] = [
      {
        label: "Best Case",
        probability: 0.25,
        impact: { revenue: 15000, cost: -2000, time: -10, trust: 5, risk: -20 },
        tradeoffs: ["Higher short-term investment", "Team ramp-up needed"],
        recommendation: "Proceed with phased rollout",
        confidence: 0.72,
      },
      {
        label: "Base Case",
        probability: 0.55,
        impact: { revenue: 8000, cost: 0, time: 0, trust: 2, risk: 0 },
        tradeoffs: ["Status quo maintained", "Moderate upside"],
        recommendation: "Acceptable — monitor weekly",
        confidence: 0.85,
      },
      {
        label: "Worst Case",
        probability: 0.20,
        impact: { revenue: -5000, cost: 3000, time: 15, trust: -10, risk: 30 },
        tradeoffs: ["Revenue loss risk", "Increased operational load"],
        recommendation: "Prepare rollback plan",
        confidence: 0.68,
      },
    ];

    const sim = engines.scenarios.simulate({
      type: template.type,
      title: template.name,
      description: `Simulation of ${template.name} with custom inputs`,
      domain: template.domain,
      inputs,
      outcomes,
      confidence: 0.78,
      evidenceIds: [],
      advisorReasoning: [
        { advisorId: "business-advisor", reasoning: "Revenue impact is moderate with good upside potential" },
        { advisorId: "risk-advisor", reasoning: "Worst case is manageable with proper safeguards" },
      ],
    });
    setResult(sim);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-3xl rounded-2xl border border-border/50 bg-card shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-foreground font-display">{template.name}</h2>
            <p className="text-xs text-muted-foreground">{template.description}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-sm">✕</button>
        </div>

        {!result ? (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Inputs</h3>
            {template.requiredInputs.map(inp => (
              <div key={inp.field} className="space-y-1">
                <label className="text-xs text-muted-foreground">{inp.label}</label>
                <input
                  type={inp.type === "number" ? "number" : "text"}
                  value={inputs[inp.field] || ""}
                  onChange={e => setInputs({ ...inputs, [inp.field]: e.target.value })}
                  className="w-full rounded-xl border border-border/40 bg-secondary/20 px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50"
                  placeholder={`Enter ${inp.label.toLowerCase()}`}
                />
              </div>
            ))}
            <button
              onClick={runSim}
              className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors mt-4"
            >
              <Play className="h-4 w-4" /> Run Simulation
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Summary */}
            <div className="rounded-xl border border-primary/10 bg-primary/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <FlaskConical className="h-4 w-4 text-primary" />
                <span className="text-sm font-bold text-foreground font-display">Simulation Complete</span>
                <Badge variant="outline" className="text-[9px] ml-auto">{Math.round(result.confidence * 100)}% confidence</Badge>
              </div>
            </div>

            {/* Outcomes */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Outcomes</h3>
              {result.outcomes.map((o, i) => (
                <div key={i} className={cn("rounded-xl border p-4",
                  o.label === "Best Case" ? "border-trust-safe/20 bg-trust-safe/5" :
                  o.label === "Worst Case" ? "border-destructive/20 bg-destructive/5" :
                  "border-border/30 bg-card/60"
                )}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-foreground">{o.label}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[9px]">{Math.round(o.probability * 100)}% likely</Badge>
                      <Badge variant="outline" className="text-[9px]">{Math.round(o.confidence * 100)}% conf</Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-5 gap-2 mb-3">
                    {Object.entries(o.impact).map(([key, val]) => (
                      <div key={key} className="text-center rounded-lg bg-secondary/20 p-1.5">
                        <p className={cn("text-xs font-bold font-display", (val ?? 0) > 0 ? "text-trust-safe" : (val ?? 0) < 0 ? "text-destructive" : "text-foreground")}>
                          {(val ?? 0) > 0 ? "+" : ""}{key === "time" ? `${val}d` : key === "trust" || key === "risk" ? `${val}%` : `$${((val ?? 0) / 1000).toFixed(1)}k`}
                        </p>
                        <p className="text-[8px] text-muted-foreground capitalize">{key}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-primary font-medium">→ {o.recommendation}</p>
                </div>
              ))}
            </div>

            {/* Advisor Reasoning */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Advisor Analysis</h3>
              {result.advisorReasoning.map(a => (
                <div key={a.advisorId} className="flex items-start gap-2 rounded-lg bg-secondary/20 px-3 py-2">
                  <Shield className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] font-semibold text-foreground capitalize">{a.advisorId.replace("-", " ")}</p>
                    <p className="text-[10px] text-muted-foreground">{a.reasoning}</p>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={onClose}
              className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <CheckCircle2 className="h-3.5 w-3.5" /> Done
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── Main Page ──────────────────────────────────────────────────
export default function ScenarioLabPage() {
  const { engines } = useOSRuntime();
  const [activeTemplate, setActiveTemplate] = useState<ScenarioTemplate | null>(null);
  const templates = engines.scenarios.getTemplates();
  const history = engines.scenarios.getSimulations();

  return (
    <div className="p-4 md:p-6 max-w-[1200px] mx-auto space-y-6">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/5 via-card to-card p-6"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15">
            <FlaskConical className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground font-display">Scenario Lab</h1>
            <p className="text-sm text-muted-foreground">Simulate decisions before committing — see best, base, and worst case outcomes</p>
          </div>
        </div>
      </motion.div>

      <Tabs defaultValue="templates">
        <TabsList className="bg-muted/30 border border-border/40 h-9 p-0.5">
          <TabsTrigger value="templates" className="text-[11px] h-8 px-3 data-[state=active]:bg-card">
            <FlaskConical className="h-3 w-3 mr-1.5" />Templates
          </TabsTrigger>
          <TabsTrigger value="history" className="text-[11px] h-8 px-3 data-[state=active]:bg-card">
            <Clock className="h-3 w-3 mr-1.5" />History ({history.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="mt-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map(t => (
              <TemplateCard key={t.id} template={t} onRun={() => setActiveTemplate(t)} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-5">
          {history.length === 0 ? (
            <div className="rounded-xl border border-border/30 bg-card/60 p-8 text-center">
              <FlaskConical className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-foreground font-semibold">No simulations yet</p>
              <p className="text-xs text-muted-foreground">Run a scenario template to see results here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map(sim => (
                <div key={sim.id} className="rounded-xl border border-border/30 bg-card/60 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-foreground">{sim.title}</p>
                      <p className="text-[10px] text-muted-foreground">{sim.type} · {sim.domain} · {Math.round(sim.confidence * 100)}% conf</p>
                    </div>
                    <span className="text-[9px] text-muted-foreground">{new Date(sim.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <AnimatePresence>
        {activeTemplate && (
          <SimulationRunner template={activeTemplate} onClose={() => setActiveTemplate(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
