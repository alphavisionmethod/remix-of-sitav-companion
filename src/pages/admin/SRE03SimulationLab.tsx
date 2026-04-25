// ═══════════════════════════════════════════════════════════════
// SITA OS — SRE03: Simulation Lab & Digital Twin
// Scenario library, execution, results visualization
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { motion } from "framer-motion";
import { AdminPageHeader } from "@/platform/sita/components/sita/admin/AdminPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  FlaskConical, CheckCircle2, AlertTriangle, XCircle, Play, Clock,
  Wifi, HardDrive, Zap, Shield, Rocket, Bomb, Server, Activity
} from "lucide-react";
import { getSimulationScenarios, type SimulationScenario } from "@/lib/services/engineering-governance";

const CAT_ICON: Record<string, React.ElementType> = {
  load: Server, latency: Clock, failure: XCircle, network: Wifi,
  storage: HardDrive, security: Shield, rollout: Rocket, chaos: Bomb,
};

const CAT_COLOR: Record<string, string> = {
  load: "text-blue-400", latency: "text-amber-400", failure: "text-red-400",
  network: "text-cyan-400", storage: "text-purple-400", security: "text-orange-400",
  rollout: "text-emerald-400", chaos: "text-pink-400",
};

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  passed: { color: "text-trust-safe", bg: "bg-trust-verified/10", label: "PASSED" },
  degraded: { color: "text-amber-400", bg: "bg-amber-500/10", label: "DEGRADED" },
  failed: { color: "text-destructive", bg: "bg-destructive/10", label: "FAILED" },
};

export default function SRE03SimulationLab() {
  const [scenarios] = useState<SimulationScenario[]>(getSimulationScenarios);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = scenarios.find(s => s.id === selectedId);
  const passedCount = scenarios.filter(s => s.last_result?.status === "passed").length;
  const degradedCount = scenarios.filter(s => s.last_result?.status === "degraded").length;
  const totalRuns = scenarios.reduce((s, sc) => s + sc.run_count, 0);

  return (
    <div className="space-y-6 p-6">
      <AdminPageHeader
        icon={FlaskConical}
        title="Simulation Lab & Digital Twin"
        subtitle="Model the platform under realistic and adversarial conditions before reaching users"
        accent="accent"
      />

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Scenarios", value: scenarios.length, icon: FlaskConical, color: "text-primary" },
          { label: "Passed", value: passedCount, icon: CheckCircle2, color: "text-trust-safe" },
          { label: "Degraded", value: degradedCount, icon: AlertTriangle, color: "text-amber-400" },
          { label: "Total Runs", value: totalRuns, icon: Activity, color: "text-sita-gold" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}>
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <s.icon className={`h-5 w-5 ${s.color} shrink-0`} />
                <div>
                  <p className="text-2xl font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scenario List */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="text-sm font-semibold text-foreground px-1">Scenario Library</h3>
          {scenarios.map((sc, i) => {
            const CIcon = CAT_ICON[sc.category] || FlaskConical;
            const status = sc.last_result ? STATUS_CONFIG[sc.last_result.status] : null;
            return (
              <motion.div key={sc.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                <Card
                  className={`border-border/50 bg-card/80 cursor-pointer transition-all hover:border-primary/30 ${selectedId === sc.id ? "border-primary/50 ring-1 ring-primary/20" : ""}`}
                  onClick={() => setSelectedId(sc.id)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-lg bg-muted/40 shrink-0`}>
                        <CIcon className={`h-4 w-4 ${CAT_COLOR[sc.category]}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{sc.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-[10px] h-4">{sc.category}</Badge>
                          {status && <span className={`text-[10px] font-mono ${status.color}`}>{status.label}</span>}
                          <span className="text-[10px] text-muted-foreground">{sc.run_count} runs</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-2">
          {selected ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <Card className="border-border/50 bg-card/80">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{selected.name}</CardTitle>
                    <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                      <Play className="h-3 w-3" /> Run Simulation
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{selected.description}</p>

                  {/* Parameters */}
                  <div>
                    <p className="text-xs font-semibold text-foreground mb-2">Parameters</p>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(selected.params).map(([k, v]) => (
                        <div key={k} className="flex items-center justify-between p-2 rounded-lg bg-muted/20 border border-border/30">
                          <span className="text-xs text-muted-foreground">{k.replace(/_/g, " ")}</span>
                          <span className="text-xs font-mono text-foreground">{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Last Result */}
                  {selected.last_result && (() => {
                    const r = selected.last_result!;
                    const cfg = STATUS_CONFIG[r.status];
                    return (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-semibold text-foreground">Last Result</p>
                          <Badge className={`text-[10px] h-5 ${cfg.bg} ${cfg.color} border-0`}>{cfg.label}</Badge>
                          <span className="text-[10px] text-muted-foreground">{new Date(r.ran_at).toLocaleString()}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(r.metrics).map(([k, v]) => (
                            <div key={k} className="flex items-center justify-between p-2 rounded-lg bg-muted/20 border border-border/30">
                              <span className="text-xs text-muted-foreground">{k.replace(/_/g, " ")}</span>
                              <span className="text-xs font-mono text-foreground">{typeof v === "number" && v < 1 ? `${(v * 100).toFixed(1)}%` : String(v)}</span>
                            </div>
                          ))}
                        </div>

                        {r.recovery_time_ms ? (
                          <div className="flex items-center gap-2 text-xs">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground">Recovery Time:</span>
                            <span className="font-mono text-foreground">{(r.recovery_time_ms / 1000).toFixed(1)}s</span>
                          </div>
                        ) : null}

                        {r.incidents_detected.length > 0 && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Incidents Detected:</p>
                            <div className="flex flex-wrap gap-1">
                              {r.incidents_detected.map((inc, j) => (
                                <Badge key={j} variant="outline" className="text-[10px] h-5 text-amber-400 border-amber-500/30">{inc}</Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        <div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                            <span>Duration</span>
                            <span>{(r.duration_ms / 1000).toFixed(0)}s</span>
                          </div>
                          <Progress value={100} className="h-1.5" />
                        </div>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <Card className="border-border/50 bg-card/80 h-64 flex items-center justify-center">
              <div className="text-center">
                <FlaskConical className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Select a scenario to view details</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
