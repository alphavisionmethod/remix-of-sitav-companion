import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
import { useDataMode } from "@/contexts/DataModeContext";
  Eye, Play, TrendingUp, TrendingDown, Minus, AlertTriangle,
  CheckCircle, Sparkles, BarChart3, ChevronDown, RefreshCw,
  DollarSign, Activity, Shield, Users, Zap
} from "lucide-react";

interface SimulationMetric {
  label: string;
  current: number;
  projected: number;
  unit: string;
  icon: React.ElementType;
  direction: "higher_better" | "lower_better";
}

interface SimulationScenario {
  id: string;
  question: string;
  description: string;
  metrics: SimulationMetric[];
  confidence: number;
  risks: string[];
  recommendation: string;
}

const DEMO_SCENARIOS: SimulationScenario[] = [
  {
    id: "rollout-20",
    question: "What happens if I roll this out to 20%?",
    description: "Expanding the current canary from 10% to 20% of production users.",
    metrics: [
      { label: "Sync Success Rate", current: 98.2, projected: 97.8, unit: "%", icon: Activity, direction: "higher_better" },
      { label: "P95 Latency", current: 240, projected: 255, unit: "ms", icon: TrendingUp, direction: "lower_better" },
      { label: "Error Rate", current: 0.3, projected: 0.5, unit: "%", icon: AlertTriangle, direction: "lower_better" },
      { label: "User Satisfaction", current: 94, projected: 93, unit: "%", icon: Users, direction: "higher_better" },
    ],
    confidence: 87,
    risks: ["Minor latency increase during rollout window", "Possible retry storm if sync queue backs up"],
    recommendation: "Safe to proceed. Monitor P95 latency closely during first 30 minutes.",
  },
  {
    id: "reduce-ai-40",
    question: "What happens if I reduce AI spend by 40%?",
    description: "Switching 40% of AI tasks to budget models and increasing cache aggressiveness.",
    metrics: [
      { label: "AI Cost / Day", current: 47.20, projected: 28.30, unit: "$", icon: DollarSign, direction: "lower_better" },
      { label: "Response Quality", current: 92, projected: 86, unit: "%", icon: Sparkles, direction: "higher_better" },
      { label: "Cache Hit Rate", current: 64, projected: 78, unit: "%", icon: Zap, direction: "higher_better" },
      { label: "Suggestion Relevance", current: 88, projected: 79, unit: "%", icon: BarChart3, direction: "higher_better" },
    ],
    confidence: 82,
    risks: ["Suggestion quality may drop for complex financial queries", "Some advisor responses may feel less nuanced"],
    recommendation: "Consider a 25% reduction first. The quality drop becomes noticeable above 35%.",
  },
  {
    id: "tighten-trust",
    question: "What happens if I tighten trust rules?",
    description: "Reducing trust threshold from 0.7 to 0.5, requiring more verification prompts.",
    metrics: [
      { label: "False Positive Rate", current: 2.1, projected: 5.8, unit: "%", icon: Shield, direction: "lower_better" },
      { label: "Blocked Threats", current: 98.5, projected: 99.7, unit: "%", icon: Shield, direction: "higher_better" },
      { label: "User Friction Score", current: 12, projected: 28, unit: "pts", icon: Users, direction: "lower_better" },
      { label: "Session Drop-off", current: 1.2, projected: 3.4, unit: "%", icon: TrendingDown, direction: "lower_better" },
    ],
    confidence: 91,
    risks: ["Significant increase in trust prompts for legitimate users", "Possible support ticket spike (est. 15-20%)"],
    recommendation: "Not recommended at this threshold. Try 0.6 first to balance security and UX.",
  },
];

interface SimulationPreviewProps {
  compact?: boolean;
}

export function SimulationPreview({ compact = false }: SimulationPreviewProps) {
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  const handleRun = (id: string) => {
  const { isDemoMode } = useDataMode();
    setRunning(true);
    setActiveScenario(id);
    setTimeout(() => setRunning(false), 1500);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <Eye className="h-4 w-4 text-violet-400" />
        <h3 className="text-sm font-semibold text-foreground">Executive Simulations</h3>
        <Badge variant="outline" className="text-[9px] text-violet-400 border-violet-500/20">What-If</Badge>
      </div>

      <div className="space-y-2">
        {DEMO_SCENARIOS.map((scenario) => {
          const isActive = activeScenario === scenario.id;
          return (
            <div key={scenario.id} className={cn(
              "rounded-xl border transition-all",
              isActive ? "bg-white/[0.04] border-violet-500/20" : "bg-white/[0.02] border-white/[0.06]"
            )}>
              {/* Question header */}
              <button
                onClick={() => handleRun(scenario.id)}
                className="w-full p-3 text-left flex items-center justify-between gap-3"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold text-foreground">{scenario.question}</h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{scenario.description}</p>
                </div>
                {isActive && !running ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                ) : (
                  <Play className="h-4 w-4 text-violet-400 shrink-0" />
                )}
              </button>

              {/* Results */}
              <AnimatePresence>
                {isActive && !running && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-3 pb-3 space-y-3 border-t border-white/[0.04] pt-3">
                      {/* Confidence */}
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground">Confidence:</span>
                        <Progress value={scenario.confidence} className="flex-1 h-1.5" />
                        <span className="text-[10px] font-medium text-foreground">{scenario.confidence}%</span>
                      </div>

                      {/* Metric comparisons */}
                      <div className="grid grid-cols-2 gap-2">
                        {scenario.metrics.map((m) => {
                          const delta = m.projected - m.current;
                          const isImprovement = m.direction === "higher_better" ? delta > 0 : delta < 0;
                          const isNeutral = Math.abs(delta) < 0.5;
                          const MetricIcon = m.icon;
                          return (
                            <div key={m.label} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2">
                              <div className="flex items-center gap-1.5 mb-1">
                                <MetricIcon className="h-3 w-3 text-muted-foreground" />
                                <span className="text-[9px] text-muted-foreground">{m.label}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-mono text-muted-foreground">
                                  {m.current}{m.unit}
                                </span>
                                <span className="text-[10px] text-muted-foreground">→</span>
                                <span className={cn(
                                  "text-xs font-mono font-semibold",
                                  isNeutral ? "text-muted-foreground" : isImprovement ? "text-emerald-400" : "text-red-400"
                                )}>
                                  {m.projected}{m.unit}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Risks */}
                      {scenario.risks.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-[10px] font-medium text-amber-400 flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" /> Risks
                          </span>
                          {scenario.risks.map((risk, i) => (
                            <p key={i} className="text-[10px] text-muted-foreground pl-4">• {risk}</p>
                          ))}
                        </div>
                      )}

                      {/* Recommendation */}
                      <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-2">
                        <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-medium mb-0.5">
                          <Sparkles className="h-3 w-3" /> Recommendation
                        </div>
                        <p className="text-[10px] text-muted-foreground">{scenario.recommendation}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Loading state */}
              {isActive && running && (
                <div className="px-3 pb-3 pt-2 border-t border-white/[0.04]">
                  <div className="flex items-center gap-2 text-[10px] text-violet-400">
                    <RefreshCw className="h-3 w-3 animate-spin" />
                    Running simulation...
                  </div>
                  <Progress value={65} className="mt-2 h-1" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
