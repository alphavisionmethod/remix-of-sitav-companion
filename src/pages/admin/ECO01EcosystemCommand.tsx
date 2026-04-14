import { useState, useCallback, useSyncExternalStore } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Network, Terminal, Shield, FileCheck, Brain, Send, CheckCircle,
  XCircle, Clock, AlertTriangle, Cpu, Cloud, Smartphone, RefreshCw,
  ArrowRight, Zap, Lock, Eye, Activity, ChevronRight, BarChart3,
} from "lucide-react";
import { useRequireAdmin } from "@/hooks/useRequireAdmin";
import { PageSkeleton } from "@/components/sita/PageSkeleton";
import { ECOSubNav } from "@/components/admin/ECOSubNav";
import { getEcosystemOrchestrator } from "@/lib/services/ecosystem-orchestrator";
import type {
  EcosystemLayer, EcosystemCommand, DualAuthorityChallenge,
  LayerHealthReport, CommandLifecycleState, RiskClass,
  FeatureContract, CommandMemoryEntry, SystemGuarantee,
} from "@/lib/services/ecosystem-orchestrator/types";

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };

// ── Hook ────────────────────────────────────────────────────
function useEcosystem() {
  const orch = getEcosystemOrchestrator();
  const state = useSyncExternalStore(
    (cb) => orch.subscribe(cb),
    () => orch.getState(),
  );
  return { orch, state };
}

// ── Risk Badge ──────────────────────────────────────────────
function RiskBadge({ risk }: { risk: RiskClass }) {
  const colors: Record<RiskClass, string> = {
    low: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    medium: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    high: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    critical: "bg-red-500/10 text-red-500 border-red-500/20",
  };
  return <Badge variant="outline" className={`text-[10px] ${colors[risk]}`}>{risk}</Badge>;
}

// ── State Badge ─────────────────────────────────────────────
function StateBadge({ state }: { state: CommandLifecycleState }) {
  const colors: Record<string, string> = {
    submitted: "bg-muted text-muted-foreground",
    parsed: "bg-blue-500/10 text-blue-500",
    evaluated: "bg-blue-500/10 text-blue-500",
    routed: "bg-purple-500/10 text-purple-500",
    pending_approval: "bg-amber-500/10 text-amber-500",
    approved: "bg-emerald-500/10 text-emerald-500",
    dispatched: "bg-purple-500/10 text-purple-500",
    executing: "bg-blue-500/10 text-blue-500",
    verifying: "bg-blue-500/10 text-blue-500",
    completed: "bg-emerald-500/10 text-emerald-500",
    failed: "bg-red-500/10 text-red-500",
    rolled_back: "bg-orange-500/10 text-orange-500",
    denied: "bg-red-500/10 text-red-500",
  };
  return <Badge className={`text-[10px] border-0 ${colors[state] ?? ""}`}>{state.replace("_", " ")}</Badge>;
}

// ── Layer Health Card ───────────────────────────────────────
function LayerCard({ report, color, icon: Icon }: { report: LayerHealthReport; color: string; icon: React.ElementType }) {
  const statusColors = { online: "bg-emerald-500", degraded: "bg-amber-500", offline: "bg-red-500", maintenance: "bg-blue-500" };
  return (
    <motion.div variants={fadeUp}>
      <Card className="relative overflow-hidden">
        <div className={`absolute top-0 left-0 w-full h-0.5 ${color}`} />
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-lg ${color.replace("bg-", "bg-")}/10`}>
                <Icon className={`h-4 w-4 ${color.replace("bg-", "text-")}`} />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold uppercase">{report.layer} Layer</CardTitle>
                <CardDescription className="text-[10px]">{report.servicesTotal} services</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${statusColors[report.status]}`} />
              <span className="text-[10px] font-medium text-muted-foreground capitalize">{report.status}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">Health Score</span>
            <span className="text-lg font-bold text-foreground">{report.healthScore}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                report.healthScore >= 90 ? "bg-emerald-500" : report.healthScore >= 70 ? "bg-amber-500" : "bg-red-500"
              }`}
              style={{ width: `${report.healthScore}%` }}
            />
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-xs font-bold text-emerald-500">{report.servicesHealthy}</p>
              <p className="text-[9px] text-muted-foreground">Healthy</p>
            </div>
            <div>
              <p className="text-xs font-bold text-amber-500">{report.servicesDegraded}</p>
              <p className="text-[9px] text-muted-foreground">Degraded</p>
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">{report.activeWorkloads}</p>
              <p className="text-[9px] text-muted-foreground">Workloads</p>
            </div>
          </div>
          <div className="pt-1 border-t border-border/50">
            <p className="text-[9px] text-muted-foreground mb-1">Services</p>
            <div className="flex flex-wrap gap-1">
              {report.responsibilities.slice(0, 6).map((s) => (
                <Badge key={s} variant="outline" className="text-[8px] px-1 py-0">{s}</Badge>
              ))}
              {report.responsibilities.length > 6 && (
                <Badge variant="outline" className="text-[8px] px-1 py-0">+{report.responsibilities.length - 6}</Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Main Page Component
// ═══════════════════════════════════════════════════════════════
export default function ECO01EcosystemCommand() {
  const { isAdmin, loading: adminLoading } = useRequireAdmin();
  const { orch, state } = useEcosystem();
  const [commandInput, setCommandInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (!commandInput.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await orch.submitCommand(commandInput.trim(), "admin");
      setCommandInput("");
    } finally {
      setIsSubmitting(false);
    }
  }, [commandInput, isSubmitting, orch]);

  const handleApprove = useCallback(async (cmd: EcosystemCommand) => {
    if (cmd.dualAuthChallenge) {
      await orch.respondToChallenge(cmd.dualAuthChallenge.id, "approved");
    } else {
      await orch.approveCommand(cmd.id);
    }
  }, [orch]);

  const handleDeny = useCallback(async (cmd: EcosystemCommand) => {
    if (cmd.dualAuthChallenge) {
      await orch.respondToChallenge(cmd.dualAuthChallenge.id, "denied");
    } else {
      await orch.denyCommand(cmd.id);
    }
  }, [orch]);

  if (adminLoading) return <PageSkeleton rows={3} />;
  if (!isAdmin) return null;

  const insights = orch.getCommandMemoryInsights();
  const allCommands = [...state.activeCommands, ...state.commandHistory];

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto space-y-6">
      <ECOSubNav />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Network className="h-6 w-6 text-primary" />
            Ecosystem Command Center
          </h1>
          <p className="text-sm text-muted-foreground">Distributed OS · Cloud · App layer coordination</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => orch.refreshLayerHealth()}>
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
          Refresh Health
        </Button>
      </div>

      {/* Layer Health Ribbon */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <LayerCard report={state.layers.os} color="bg-emerald-500" icon={Cpu} />
        <LayerCard report={state.layers.cloud} color="bg-primary" icon={Cloud} />
        <LayerCard report={state.layers.app} color="bg-amber-500" icon={Smartphone} />
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="command" className="space-y-4">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="command" className="text-xs gap-1.5"><Terminal className="h-3 w-3" />Command Center</TabsTrigger>
          <TabsTrigger value="authority" className="text-xs gap-1.5"><Shield className="h-3 w-3" />Dual Authority</TabsTrigger>
          <TabsTrigger value="guarantees" className="text-xs gap-1.5"><FileCheck className="h-3 w-3" />Guarantees & Contracts</TabsTrigger>
          <TabsTrigger value="memory" className="text-xs gap-1.5"><Brain className="h-3 w-3" />Command Memory</TabsTrigger>
        </TabsList>

        {/* ── Tab: Command Center ──────────────────────────────── */}
        <TabsContent value="command" className="space-y-4">
          {/* Command Input */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter command... (e.g. 'Optimize performance', 'Deploy update', 'Lock device')"
                  value={commandInput}
                  onChange={(e) => setCommandInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  className="flex-1"
                />
                <Button onClick={handleSubmit} disabled={!commandInput.trim() || isSubmitting} size="sm">
                  <Send className="h-3.5 w-3.5 mr-1.5" />
                  {isSubmitting ? "Routing..." : "Submit"}
                </Button>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {["Check status", "Optimize performance", "Fix sync issues", "Deploy update", "Lock device"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setCommandInput(t)}
                    className="px-2 py-0.5 text-[10px] rounded-md bg-muted hover:bg-muted/80 text-muted-foreground transition-colors"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Active Commands */}
          {state.activeCommands.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  Active Commands ({state.activeCommands.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {state.activeCommands.map((cmd) => (
                  <div key={cmd.id} className="p-3 rounded-lg border border-border/50 bg-muted/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">{cmd.input}</span>
                      <StateBadge state={cmd.state} />
                    </div>
                    {cmd.intent && (
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <span>Intent: {cmd.intent.intent}</span>
                        <RiskBadge risk={cmd.intent.riskClass} />
                        <span>→ [{cmd.intent.targetLayers.join(", ")}]</span>
                      </div>
                    )}
                    {cmd.state === "pending_approval" && (
                      <div className="flex items-center gap-2 pt-1">
                        <Button size="sm" variant="default" onClick={() => handleApprove(cmd)} className="h-7 text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" />Approve
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDeny(cmd)} className="h-7 text-xs">
                          <XCircle className="h-3 w-3 mr-1" />Deny
                        </Button>
                        {cmd.dualAuthChallenge && (
                          <Badge variant="outline" className="text-[9px] bg-red-500/5 text-red-400 border-red-500/20">
                            <Lock className="h-2.5 w-2.5 mr-1" />Dual Authority Required
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Command History */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Command History ({state.commandHistory.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {state.commandHistory.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">No commands yet. Submit one above.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-[10px]">Command</TableHead>
                      <TableHead className="text-[10px]">Intent</TableHead>
                      <TableHead className="text-[10px]">Risk</TableHead>
                      <TableHead className="text-[10px]">Layers</TableHead>
                      <TableHead className="text-[10px]">State</TableHead>
                      <TableHead className="text-[10px]">Duration</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {state.commandHistory.slice(0, 20).map((cmd) => (
                      <TableRow key={cmd.id}>
                        <TableCell className="text-xs font-medium max-w-[200px] truncate">{cmd.input}</TableCell>
                        <TableCell className="text-[10px] text-muted-foreground">{cmd.intent?.intent ?? "—"}</TableCell>
                        <TableCell>{cmd.intent && <RiskBadge risk={cmd.intent.riskClass} />}</TableCell>
                        <TableCell className="text-[10px] text-muted-foreground">{cmd.intent?.targetLayers.join(", ") ?? "—"}</TableCell>
                        <TableCell><StateBadge state={cmd.state} /></TableCell>
                        <TableCell className="text-[10px] text-muted-foreground">
                          {cmd.completedAt ? `${((cmd.completedAt - cmd.createdAt) / 1000).toFixed(1)}s` : "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab: Dual Authority ──────────────────────────────── */}
        <TabsContent value="authority" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Shield className="h-4 w-4 text-red-500" />
                Dual Authority Challenges
              </CardTitle>
              <CardDescription className="text-xs">
                Critical actions requiring out-of-band approval for security
              </CardDescription>
            </CardHeader>
            <CardContent>
              {state.pendingChallenges.length === 0 && state.commandHistory.filter((c) => c.dualAuthChallenge).length === 0 ? (
                <div className="text-center py-8">
                  <Shield className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">No dual authority challenges.</p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Try commands like "Revoke device" or "Wipe fleet" to trigger dual authority.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {state.pendingChallenges.map((ch) => (
                    <div key={ch.id} className="p-4 rounded-lg border border-red-500/20 bg-red-500/5 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Lock className="h-4 w-4 text-red-500" />
                          <span className="text-sm font-semibold text-foreground">{ch.action}</span>
                        </div>
                        <RiskBadge risk={ch.riskLevel} />
                      </div>
                      <p className="text-xs text-muted-foreground">{ch.explanation}</p>
                      <div>
                        <p className="text-[10px] font-medium text-foreground mb-1">Consequences:</p>
                        <ul className="space-y-0.5">
                          {ch.consequences.map((c, i) => (
                            <li key={i} className="text-[10px] text-muted-foreground flex items-start gap-1">
                              <AlertTriangle className="h-2.5 w-2.5 text-amber-500 mt-0.5 flex-shrink-0" />
                              {c}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-7 text-xs"
                          onClick={() => {
                            const cmd = state.activeCommands.find((c) => c.id === ch.commandId);
                            if (cmd) handleApprove(cmd);
                          }}
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />Approve Action
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs"
                          onClick={() => {
                            const cmd = state.activeCommands.find((c) => c.id === ch.commandId);
                            if (cmd) handleDeny(cmd);
                          }}
                        >
                          <XCircle className="h-3 w-3 mr-1" />Deny
                        </Button>
                        <span className="text-[9px] text-muted-foreground ml-auto">
                          Expires: {new Date(ch.expiresAt).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))}
                  {/* Historical dual-auth */}
                  {state.commandHistory.filter((c) => c.dualAuthChallenge).slice(0, 10).map((cmd) => (
                    <div key={cmd.id} className="p-3 rounded-lg border border-border/50 bg-muted/10 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-medium text-foreground">{cmd.dualAuthChallenge!.action}</span>
                        <span className="text-[10px] text-muted-foreground ml-2">
                          {cmd.dualAuthChallenge!.status === "approved" ? "✓ Approved" : "✕ Denied"}
                        </span>
                      </div>
                      <StateBadge state={cmd.state} />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab: Guarantees & Contracts ───────────────────────── */}
        <TabsContent value="guarantees" className="space-y-4">
          {/* Contracts */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-primary" />
                Feature Ownership Contracts
              </CardTitle>
              <CardDescription className="text-xs">
                Defines which layer owns each responsibility — no duplication
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[10px]">Feature</TableHead>
                    <TableHead className="text-[10px]">
                      <span className="flex items-center gap-1"><Cpu className="h-3 w-3 text-emerald-500" />OS</span>
                    </TableHead>
                    <TableHead className="text-[10px]">
                      <span className="flex items-center gap-1"><Cloud className="h-3 w-3 text-primary" />Cloud</span>
                    </TableHead>
                    <TableHead className="text-[10px]">
                      <span className="flex items-center gap-1"><Smartphone className="h-3 w-3 text-amber-500" />App</span>
                    </TableHead>
                    <TableHead className="text-[10px]">Approval</TableHead>
                    <TableHead className="text-[10px]">Rollback</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {state.contracts.map((c) => (
                    <TableRow key={c.featureName}>
                      <TableCell className="text-xs font-medium">{c.featureName}</TableCell>
                      <TableCell className="text-[10px] text-muted-foreground max-w-[180px]">{c.osOwnership}</TableCell>
                      <TableCell className="text-[10px] text-muted-foreground max-w-[180px]">{c.cloudOwnership}</TableCell>
                      <TableCell className="text-[10px] text-muted-foreground max-w-[180px]">{c.appOwnership}</TableCell>
                      <TableCell>
                        {c.approvalRequired
                          ? <Badge variant="outline" className="text-[8px] bg-amber-500/10 text-amber-500 border-amber-500/20">Required</Badge>
                          : <Badge variant="outline" className="text-[8px]">No</Badge>
                        }
                      </TableCell>
                      <TableCell>
                        {c.rollbackExists
                          ? <Badge variant="outline" className="text-[8px] bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Yes</Badge>
                          : <Badge variant="outline" className="text-[8px] bg-red-500/10 text-red-400 border-red-500/20">No</Badge>
                        }
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Recent Guarantees from last commands */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Shield className="h-4 w-4 text-emerald-500" />
                Recent Guarantee Checks
              </CardTitle>
            </CardHeader>
            <CardContent>
              {state.commandHistory.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">Submit a command to see guarantee checks.</p>
              ) : (
                <div className="space-y-3">
                  {state.commandHistory.slice(0, 5).map((cmd) => (
                    <div key={cmd.id} className="p-3 rounded-lg border border-border/50 bg-muted/10 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-foreground">{cmd.input}</span>
                        <StateBadge state={cmd.state} />
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {cmd.guarantees.map((g, i) => {
                          const colors: Record<string, string> = {
                            verified: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
                            unverified: "bg-amber-500/10 text-amber-500 border-amber-500/20",
                            violated: "bg-red-500/10 text-red-500 border-red-500/20",
                            not_applicable: "bg-muted text-muted-foreground",
                          };
                          return (
                            <Badge key={i} variant="outline" className={`text-[8px] ${colors[g.status]}`}>
                              {g.status === "verified" ? "✓" : g.status === "violated" ? "✕" : "?"} {g.type.replace(/_/g, " ")}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab: Command Memory ──────────────────────────────── */}
        <TabsContent value="memory" className="space-y-4">
          {/* Insights */}
          <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Total Commands", value: insights.totalCommands, icon: Terminal, color: "text-primary" },
              { label: "Success Rate", value: `${insights.successRate}%`, icon: CheckCircle, color: "text-emerald-500" },
              { label: "Avg Duration", value: insights.avgDuration > 0 ? `${(insights.avgDuration / 1000).toFixed(1)}s` : "—", icon: Clock, color: "text-amber-500" },
              { label: "Risk Breakdown", value: `${insights.riskDistribution.critical} critical`, icon: AlertTriangle, color: "text-red-500" },
            ].map((m) => (
              <motion.div key={m.label} variants={fadeUp}>
                <Card>
                  <CardContent className="p-4 flex items-center gap-3">
                    <m.icon className={`h-5 w-5 ${m.color}`} />
                    <div>
                      <p className="text-lg font-bold text-foreground">{m.value}</p>
                      <p className="text-[10px] text-muted-foreground">{m.label}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Top Intents */}
          {insights.topIntents.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  Top Command Patterns
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {insights.topIntents.map((t) => (
                    <div key={t.intent} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                      <span className="text-xs font-medium text-foreground">{t.intent.replace(/_/g, " ")}</span>
                      <Badge variant="outline" className="text-[10px]">{t.count}×</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Memory Entries */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary" />
                Command Memory Log ({state.commandMemory.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {state.commandMemory.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">Command memory is empty. Submit commands to build the pattern library.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-[10px]">Intent</TableHead>
                      <TableHead className="text-[10px]">Risk</TableHead>
                      <TableHead className="text-[10px]">Outcome</TableHead>
                      <TableHead className="text-[10px]">Duration</TableHead>
                      <TableHead className="text-[10px]">Tags</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {state.commandMemory.slice(0, 20).map((m) => (
                      <TableRow key={m.id}>
                        <TableCell className="text-xs font-medium">{m.intent.replace(/_/g, " ")}</TableCell>
                        <TableCell><RiskBadge risk={m.riskClass} /></TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-[9px] ${
                            m.outcome === "success" ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-400"
                          }`}>
                            {m.outcome}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-[10px] text-muted-foreground">{(m.durationMs / 1000).toFixed(1)}s</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-0.5">
                            {m.patternTags.slice(0, 3).map((t) => (
                              <Badge key={t} variant="outline" className="text-[8px] px-1 py-0">{t}</Badge>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
