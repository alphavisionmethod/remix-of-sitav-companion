// ═══════════════════════════════════════════════════════════════
// SITA OS — Advanced Policy Simulation Workspace
// Scenario builder + live rule evaluation + impact analysis
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useGovernanceSimulator } from "@/contexts/SitaKernelContext";
import type { SimulationResult } from "@/lib/services/governance-simulator";
import { SitaCard, SitaCardTitle, SitaSectionHeader } from "@/platform/sita/components/sita/SitaCard";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  ArrowLeft, Shield, Play, Plus, Trash2, AlertTriangle, CheckCircle,
  XCircle, Zap, Activity, Lock, Eye,
} from "lucide-react";
import type { PolicyScenario } from "@/packages/contracts";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

interface ScenarioInput {
  id: string;
  domain: string;
  capabilityId: string;
  riskTier: "low" | "medium" | "high" | "critical";
  amount?: number;
  isSimulation?: boolean;
}

const defaultScenarios: ScenarioInput[] = [
  { id: "s1", domain: "finance", capabilityId: "finance.transfer", riskTier: "high", amount: 8000 },
  { id: "s2", domain: "finance", capabilityId: "finance.budget.update", riskTier: "medium", amount: 500 },
  { id: "s3", domain: "business", capabilityId: "crm.lead.update", riskTier: "low" },
  { id: "s4", domain: "finance", capabilityId: "finance.transfer", riskTier: "critical", amount: 50000 },
];

export default function PolicySimulatorPage() {
  const gov = useGovernanceSimulator();
  const navigate = useNavigate();
  const [scenarios, setScenarios] = useState<ScenarioInput[]>(defaultScenarios);
  const [result, setResult] = useState<SimulationResult | null>(null);

  const addScenario = () => {
    setScenarios(s => [...s, {
      id: `s${Date.now()}`, domain: "business", capabilityId: "crm.contact.view", riskTier: "low",
    }]);
  };

  const removeScenario = (id: string) => setScenarios(s => s.filter(x => x.id !== id));

  const updateScenario = (id: string, field: string, value: string | number | boolean) => {
    setScenarios(s => s.map(x => x.id === id ? { ...x, [field]: value } : x));
  };

  const runSimulation = () => {
    const sim = gov.runComplianceAudit(scenarios.map(s => ({
      domain: s.domain, capabilityId: s.capabilityId, riskTier: s.riskTier,
      amount: s.amount, isSimulation: s.isSimulation,
    })));
    setResult(sim);
  };

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto space-y-5">
<button onClick={() => navigate("/mission-control")} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" /> Mission Control
      </button>

      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/5 via-card to-card p-6"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 shadow-lg shadow-primary/10">
              <Shield className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-foreground">Policy Simulation Workspace</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Build scenarios, evaluate rules, and preview impact before making policy changes
              </p>
            </div>
          </div>
          <button onClick={runSimulation}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
          >
            <Play className="h-4 w-4" /> Run Simulation
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Scenario Builder */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <SitaSectionHeader title="Scenarios" subtitle={`${scenarios.length} configured`} />
            <button onClick={addScenario} className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-[11px] text-muted-foreground hover:bg-secondary transition-colors">
              <Plus className="h-3 w-3" /> Add
            </button>
          </div>

          {scenarios.map((s, i) => (
            <motion.div key={s.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className="rounded-xl border border-border bg-card/80 p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-[10px] font-mono text-muted-foreground">Scenario #{i + 1}</span>
                <button onClick={() => removeScenario(s.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-muted-foreground">Domain</label>
                  <select value={s.domain} onChange={e => updateScenario(s.id, "domain", e.target.value)}
                    className="w-full mt-0.5 rounded-lg border border-border bg-background px-2 py-1.5 text-xs text-foreground"
                  >
                    <option value="finance">Finance</option>
                    <option value="business">Business</option>
                    <option value="concierge">Concierge</option>
                    <option value="connector">Connector</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground">Risk Tier</label>
                  <select value={s.riskTier} onChange={e => updateScenario(s.id, "riskTier", e.target.value)}
                    className="w-full mt-0.5 rounded-lg border border-border bg-background px-2 py-1.5 text-xs text-foreground"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground">Capability</label>
                  <input value={s.capabilityId} onChange={e => updateScenario(s.id, "capabilityId", e.target.value)}
                    className="w-full mt-0.5 rounded-lg border border-border bg-background px-2 py-1.5 text-xs text-foreground"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground">Amount ($)</label>
                  <input type="number" value={s.amount || ""} onChange={e => updateScenario(s.id, "amount", Number(e.target.value))}
                    className="w-full mt-0.5 rounded-lg border border-border bg-background px-2 py-1.5 text-xs text-foreground"
                    placeholder="Optional"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 mt-2 cursor-pointer">
                <input type="checkbox" checked={s.isSimulation || false} onChange={e => updateScenario(s.id, "isSimulation", e.target.checked)}
                  className="rounded border-border"
                />
                <span className="text-[11px] text-muted-foreground">Simulation only (dry run)</span>
              </label>
            </motion.div>
          ))}
        </div>

        {/* Results */}
        <div className="space-y-4">
          <SitaSectionHeader title="Simulation Results" subtitle={result ? `${result.durationMs}ms · ${result.summary.totalScenarios} scenarios` : "Run simulation to see results"} />

          {result ? (
            <>
              {/* Summary */}
              <SitaCard hover={false}>
                <div className="grid grid-cols-4 gap-3">
                  <div className="text-center">
                    <p className="font-display text-xl font-bold text-foreground">{(result.summary.overallCompliance * 100).toFixed(0)}%</p>
                    <p className="text-[10px] text-muted-foreground">Compliance</p>
                  </div>
                  <div className="text-center">
                    <p className="font-display text-xl font-bold text-trust-safe">{result.summary.passed}</p>
                    <p className="text-[10px] text-muted-foreground">Passed</p>
                  </div>
                  <div className="text-center">
                    <p className="font-display text-xl font-bold text-destructive">{result.summary.blocked}</p>
                    <p className="text-[10px] text-muted-foreground">Blocked</p>
                  </div>
                  <div className="text-center">
                    <p className="font-display text-xl font-bold text-accent">{result.summary.riskBreaches}</p>
                    <p className="text-[10px] text-muted-foreground">Risk Breaches</p>
                  </div>
                </div>
              </SitaCard>

              {/* Per-scenario results */}
              <div className="space-y-2">
                {result.results.map((r, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                    className="rounded-xl border border-border bg-card/80 p-4"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={cn("h-2.5 w-2.5 rounded-full",
                        r.policyResult.effect === "allow" ? "bg-trust-safe" :
                        r.policyResult.effect === "deny" ? "bg-destructive" : "bg-accent"
                      )} />
                      <span className="text-xs font-medium text-foreground flex-1">{r.label}</span>
                      <Badge variant="outline" className={cn("text-[9px]",
                        r.policyResult.effect === "allow" ? "bg-trust-verified/10 text-trust-safe" :
                        r.policyResult.effect === "deny" ? "bg-destructive/10 text-destructive" : "bg-accent/10 text-accent"
                      )}>{r.policyResult.effect}</Badge>
                    </div>
                    {r.policyResult.reason && (
                      <p className="text-[11px] text-muted-foreground">{r.policyResult.reason}</p>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Recommendations */}
              {result.summary.recommendations.length > 0 && (
                <SitaCard hover={false} className="border-primary/15 bg-primary/3">
                  <SitaCardTitle>Recommendations</SitaCardTitle>
                  <div className="mt-3 space-y-1.5">
                    {result.summary.recommendations.map((r, i) => (
                      <p key={i} className="text-xs text-foreground">• {r}</p>
                    ))}
                  </div>
                </SitaCard>
              )}
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-border p-16 text-center">
              <Shield className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-sm font-semibold text-foreground">No simulation run yet</p>
              <p className="text-xs text-muted-foreground mt-1">Configure scenarios and click "Run Simulation"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
