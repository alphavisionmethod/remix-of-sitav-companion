// ═══════════════════════════════════════════════════════════════
// SITA OS — SRE05: Chaos Testing Framework
// Deliberate fault injection with policy controls
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { AdminPageHeader } from "@/platform/sita/components/sita/admin/AdminPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { CANONICAL_SCENARIOS, type GameDayScenario } from "@/lib/services/game-day-orchestrator";
import { toast } from "sonner";
import {
  Bomb, CheckCircle2, XCircle, AlertTriangle, Play, Shield, Server,
  Clock, Wifi, HardDrive, RefreshCw, Copy, Timer, Zap, Download, FileText
} from "lucide-react";
import { getChaosExperiments, type ChaosExperiment } from "@/lib/services/engineering-governance";

const FAULT_ICON: Record<string, React.ElementType> = {
  service_crash: Server, db_latency: Clock, storage_failure: HardDrive,
  websocket_fanout: Wifi, network_drop: Wifi, packet_loss: Wifi,
  cache_corruption: HardDrive, duplicate_events: Copy, clock_skew: Timer,
  rollout_interrupt: RefreshCw,
};

const FAULT_COLOR: Record<string, string> = {
  service_crash: "text-red-400", db_latency: "text-amber-400", storage_failure: "text-purple-400",
  websocket_fanout: "text-cyan-400", network_drop: "text-orange-400", packet_loss: "text-orange-300",
  cache_corruption: "text-pink-400", duplicate_events: "text-blue-400", clock_skew: "text-teal-400",
  rollout_interrupt: "text-emerald-400",
};

const DEG_COLOR: Record<string, string> = {
  none: "text-trust-safe", minor: "text-blue-400", moderate: "text-amber-400", severe: "text-destructive",
};

export default function SRE05ChaosTestingFramework() {
  const [experiments] = useState<ChaosExperiment[]>(getChaosExperiments);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drillResults, setDrillResults] = useState<any[]>([]);
  const [runningDrill, setRunningDrill] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("experiments");

  useEffect(() => {
    loadDrillResults();
  }, []);

  async function loadDrillResults() {
    const { data } = await supabase
      .from("chaos_drill_results" as never)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100) as unknown as { data: any[] | null };
    if (data) setDrillResults(data);
  }

  async function runDrill(scenario: GameDayScenario) {
    setRunningDrill(scenario.scenario_id);
    try {
      const { data, error } = await supabase.functions.invoke("chaos-drill-runner", {
        body: {
          scenario_id: scenario.scenario_id,
          scenario_name: scenario.name,
          blast_radius: scenario.blast_radius,
          expected_detection_seconds: scenario.expected_detection_seconds,
          expected_recovery_seconds: scenario.expected_recovery_seconds,
          kill_switch_to_test: scenario.kill_switch_to_test,
        },
      });
      if (error) throw error;
      toast.success(`Drill complete: ${data?.outcome === "pass" ? "PASSED ✅" : "FAILED ❌"}`);
      await loadDrillResults();
    } catch (err) {
      toast.error(`Drill failed: ${String(err)}`);
    } finally {
      setRunningDrill(null);
    }
  }

  function downloadEvidence() {
    const blob = new Blob([JSON.stringify(drillResults, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chaos-drill-evidence-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const selected = experiments.find(e => e.id === selectedId);
  const survivedCount = experiments.filter(e => e.last_run?.survived).length;
  const failedCount = experiments.filter(e => e.last_run && !e.last_run.survived).length;
  const totalRuns = experiments.reduce((s, e) => s + e.run_count, 0);

  return (
    <div className="space-y-6 p-6">
      <AdminPageHeader
        icon={Bomb}
        title="Chaos Testing Framework"
        subtitle="Deliberate breakage in controlled environments — never uncontrolled in production"
        accent="destructive"
      />

      {/* Policy Banner */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 flex items-center gap-3"
      >
        <Shield className="h-5 w-5 text-amber-400 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-foreground">Environment-Scoped & Policy-Controlled</p>
          <p className="text-xs text-muted-foreground">All chaos experiments are scoped to staging/sandbox/canary only. Production fault injection requires explicit policy approval.</p>
        </div>
      </motion.div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Experiments", value: experiments.length, icon: Bomb, color: "text-primary" },
          { label: "Survived", value: survivedCount, icon: CheckCircle2, color: "text-trust-safe" },
          { label: "Failed", value: failedCount, icon: XCircle, color: failedCount > 0 ? "text-destructive" : "text-trust-safe" },
          { label: "Total Runs", value: totalRuns, icon: Zap, color: "text-sita-gold" },
          { label: "Game Day Drills", value: drillResults.length, icon: FileText, color: "text-primary" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.05 }}>
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

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="experiments">Chaos Experiments</TabsTrigger>
          <TabsTrigger value="gameday">Game Day Evidence ({drillResults.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="experiments" className="mt-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {experiments.map((exp, i) => {
          const FIcon = FAULT_ICON[exp.fault_type] || Bomb;
          const r = exp.last_run;
          return (
            <motion.div key={exp.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.04 }}>
              <Card
                className={`border-border/50 bg-card/80 cursor-pointer transition-all hover:border-primary/30 ${selectedId === exp.id ? "border-primary/50 ring-1 ring-primary/20" : ""}`}
                onClick={() => setSelectedId(exp.id)}
              >
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-muted/40 shrink-0">
                      <FIcon className={`h-5 w-5 ${FAULT_COLOR[exp.fault_type]}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">{exp.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{exp.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="text-[10px] h-4">{exp.fault_type.replace(/_/g, " ")}</Badge>
                    <Badge variant="outline" className="text-[10px] h-4">{exp.environment}</Badge>
                    {exp.policy_approved ? (
                      <Badge variant="outline" className="text-[10px] h-4 text-trust-safe border-trust-verified/30 gap-0.5"><CheckCircle2 className="h-2.5 w-2.5" />Approved</Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] h-4 text-amber-400 border-amber-500/30 gap-0.5"><AlertTriangle className="h-2.5 w-2.5" />Needs Approval</Badge>
                    )}
                  </div>

                  {r && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {r.survived ? (
                            <Badge variant="outline" className="text-[10px] h-4 text-trust-safe border-trust-verified/30">Survived</Badge>
                          ) : (
                            <Badge variant="destructive" className="text-[10px] h-4">Failed</Badge>
                          )}
                          {r.self_recovered && <Badge variant="outline" className="text-[10px] h-4 text-blue-400 border-blue-500/30">Self-Recovered</Badge>}
                        </div>
                        <span className={`text-[10px] font-mono ${DEG_COLOR[r.degradation_level]}`}>{r.degradation_level}</span>
                      </div>
                      {r.incident_signals_detected.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {r.incident_signals_detected.map((sig, j) => (
                            <Badge key={j} variant="outline" className="text-[10px] h-4 text-amber-400 border-amber-500/30">{sig}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>{exp.run_count} runs</span>
                    {r && <span>{new Date(r.ran_at).toLocaleDateString()}</span>}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
        </TabsContent>

        <TabsContent value="gameday" className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Run canonical game-day scenarios and review evidence</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => void loadDrillResults()}>
                <RefreshCw className="mr-2 h-4 w-4" /> Refresh
              </Button>
              {drillResults.length > 0 && (
                <Button variant="outline" size="sm" onClick={downloadEvidence}>
                  <Download className="mr-2 h-4 w-4" /> Export Evidence
                </Button>
              )}
            </div>
          </div>

          {/* Scenario Runner */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {CANONICAL_SCENARIOS.map((scenario) => {
              const pastRuns = drillResults.filter((r: any) => r.drill_type === scenario.scenario_id);
              const lastRun = pastRuns[0];
              const isRunning = runningDrill === scenario.scenario_id;
              return (
                <Card key={scenario.scenario_id} className="border-border/50 bg-card/80">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{scenario.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{scenario.description}</p>
                      </div>
                      <Badge variant="outline" className="text-[10px] shrink-0">{scenario.criticality}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="outline" className="text-[10px] h-4">{scenario.category}</Badge>
                      <Badge variant="outline" className="text-[10px] h-4">{scenario.blast_radius}</Badge>
                      <Badge variant="outline" className="text-[10px] h-4">KS: {scenario.kill_switch_to_test}</Badge>
                    </div>
                    {lastRun && (
                      <div className="flex items-center gap-2">
                        {lastRun.outcome === "pass" ? (
                          <Badge variant="outline" className="text-[10px] text-trust-safe border-trust-verified/30">Last: Pass</Badge>
                        ) : (
                          <Badge variant="destructive" className="text-[10px]">Last: Fail</Badge>
                        )}
                        <span className="text-[10px] text-muted-foreground">{pastRuns.length} runs</span>
                      </div>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full text-xs gap-1.5"
                      disabled={isRunning}
                      onClick={() => void runDrill(scenario)}
                    >
                      <Play className={`h-3 w-3 ${isRunning ? "animate-spin" : ""}`} />
                      {isRunning ? "Running…" : "Run Drill"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Drill History */}
          {drillResults.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-sm">Drill History</CardTitle></CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[320px]">
                  <div className="divide-y">
                    {drillResults.map((r: any) => (
                      <div key={r.id} className="p-4 hover:bg-accent/30 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {r.outcome === "pass" ? (
                              <CheckCircle2 className="h-4 w-4 text-trust-safe" />
                            ) : (
                              <XCircle className="h-4 w-4 text-destructive" />
                            )}
                            <span className="text-sm font-medium">{r.scenario_name || r.drill_type}</span>
                            <Badge variant={r.outcome === "pass" ? "outline" : "destructive"} className="text-[10px]">{r.outcome}</Badge>
                          </div>
                          <span className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</span>
                        </div>
                        <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                          <span>Detection: {r.detection_seconds}s</span>
                          <span>Recovery: {r.recovery_seconds}s</span>
                          <span>Blast: {r.blast_radius}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
