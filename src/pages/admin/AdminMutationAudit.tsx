import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Database, CheckCircle, AlertTriangle, XCircle, Clock, Shield, RefreshCw, Eye, Undo2, GitBranch, Layers, ArrowRight, FileCheck } from "lucide-react";
import { DEMO_MUTATIONS, type DemoMutationRecord, type DurabilityStatus } from "@/data/seed/durability";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { useDataMode } from "@/contexts/DataModeContext";

const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };

const statusConfig: Record<DurabilityStatus, { color: string; icon: typeof CheckCircle; label: string }> = {
  persisted: { color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", icon: CheckCircle, label: "Persisted" },
  pending: { color: "bg-amber-500/10 text-amber-500 border-amber-500/20", icon: Clock, label: "Pending" },
  failed: { color: "bg-red-500/10 text-red-500 border-red-500/20", icon: XCircle, label: "Failed" },
  noncanonical: { color: "bg-orange-500/10 text-orange-500 border-orange-500/20", icon: AlertTriangle, label: "Non-canonical" },
};

const WRITE_PATHS = [
  { id: "wp-1", surface: "PolicySimulator", method: "policy.create", canonical: true, durableStore: "Supabase RLS", projectionImpact: ["DashboardMetrics", "ProofCoverage"], receiptSupport: true },
  { id: "wp-2", surface: "UserManagement", method: "user.role.update", canonical: true, durableStore: "Supabase RLS", projectionImpact: ["UserProfiles", "PermissionCache"], receiptSupport: true },
  { id: "wp-3", surface: "ConnectorGateway", method: "connector.refresh", canonical: true, durableStore: "Supabase RLS", projectionImpact: ["ConnectorHealth"], receiptSupport: false },
  { id: "wp-4", surface: "WorkflowReplay", method: "workflow.retry", canonical: false, durableStore: "In-memory only", projectionImpact: ["WorkflowRuns"], receiptSupport: false },
  { id: "wp-5", surface: "ApprovalQueue", method: "approval.override", canonical: false, durableStore: "Supabase (no RLS)", projectionImpact: ["ApprovalState", "AuditLog"], receiptSupport: true },
  { id: "wp-6", surface: "IncidentCommand", method: "incident.resolve", canonical: true, durableStore: "Supabase RLS", projectionImpact: ["IncidentSummary", "SLOBurn"], receiptSupport: true },
  { id: "wp-7", surface: "MissionControl", method: "agent.pause", canonical: true, durableStore: "Supabase RLS", projectionImpact: ["AgentTelemetry"], receiptSupport: true },
];

const LINEAGE_GAPS = [
  { id: "lg-1", mutationId: "mut-003", gap: "Persistence not confirmed — write in-flight", severity: "high" as const, surface: "UserManagement", detectedAt: "2026-04-05T10:18:30Z" },
  { id: "lg-2", mutationId: "mut-004", gap: "Non-canonical write path — no durable store ref", severity: "critical" as const, surface: "WorkflowReplay", detectedAt: "2026-04-05T10:15:15Z" },
  { id: "lg-3", mutationId: "mut-005", gap: "Approval override bypassed standard policy evaluation", severity: "high" as const, surface: "ApprovalQueue", detectedAt: "2026-04-05T10:10:45Z" },
];

const AdminDurabilityBoard = () => {
  const { isDemoMode } = useDataMode();
  const [tab, setTab] = useState("mutations");
  const [mutFilter, setMutFilter] = useState("all");
  const [selectedMutation, setSelectedMutation] = useState<DemoMutationRecord | null>(null);

  const filtered = mutFilter === "all" ? DEMO_MUTATIONS : ([] as typeof DEMO_MUTATIONS).filter(m => m.durabilityStatus === mutFilter);
  const persistedPct = Math.round((([] as typeof DEMO_MUTATIONS).filter(m => m.durabilityStatus === "persisted").length / ([] as typeof DEMO_MUTATIONS).length) * 100);
  const lineagePct = Math.round((([] as typeof DEMO_MUTATIONS).filter(m => m.lineageComplete).length / ([] as typeof DEMO_MUTATIONS).length) * 100);
  const canonicalPct = Math.round((([] as typeof DEMO_MUTATIONS).filter(m => m.canonicalWritePath).length / ([] as typeof DEMO_MUTATIONS).length) * 100);

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
<div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <Database className="h-6 w-6 text-primary" /> Admin Durability Board
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Mutation persistence truth · Write-path registry · Lineage gaps · Provenance inspector</p>
        </div>
        <Button variant="outline" size="sm"><RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Refresh</Button>
      </div>

      <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">
        <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {[
            { label: "Persistence Rate", value: `${persistedPct}%`, color: persistedPct === 100 ? "text-emerald-500" : "text-amber-500" },
            { label: "Lineage Completion", value: `${lineagePct}%`, color: lineagePct === 100 ? "text-emerald-500" : "text-amber-500" },
            { label: "Canonical Write Rate", value: `${canonicalPct}%`, color: canonicalPct === 100 ? "text-emerald-500" : "text-orange-500" },
            { label: "Lineage Gaps", value: String(LINEAGE_GAPS.length), color: LINEAGE_GAPS.length === 0 ? "text-emerald-500" : "text-red-500" },
          ].map((m) => (
            <Card key={m.label}>
              <CardContent className="p-4">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">{m.label}</p>
                <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="mutations">Recent Mutations</TabsTrigger>
            <TabsTrigger value="write-paths">Write-Path Registry</TabsTrigger>
            <TabsTrigger value="lineage-gaps">Lineage Gaps</TabsTrigger>
            <TabsTrigger value="provenance">Provenance Inspector</TabsTrigger>
          </TabsList>

          <TabsContent value="mutations" className="mt-4 space-y-2">
            <div className="flex gap-1 mb-3">
              {["all", "persisted", "pending", "failed", "noncanonical"].map(f => (
                <Button key={f} variant={mutFilter === f ? "default" : "outline"} size="sm" className="text-[10px] h-6 capitalize" onClick={() => setMutFilter(f)}>{f}</Button>
              ))}
            </div>
            {filtered.map((mut) => {
              const cfg = statusConfig[mut.durabilityStatus];
              const StatusIcon = cfg.icon;
              return (
                <div key={mut.id} className="p-3 rounded-lg border hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => { setSelectedMutation(mut); setTab("provenance"); }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <StatusIcon className={`h-4 w-4 ${cfg.color.split(" ")[1]}`} />
                      <span className="text-sm font-medium text-foreground">{mut.mutationType}</span>
                      <Badge variant="outline" className={`text-[9px] ${cfg.color}`}>{cfg.label}</Badge>
                    </div>
                    <span className="text-[10px] text-muted-foreground">{new Date(mut.submittedAt).toLocaleTimeString()}</span>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                    <span>Actor: <span className="text-foreground">{mut.actor}</span></span>
                    <span>Surface: <span className="text-foreground">{mut.surface}</span></span>
                    <span>Target: <span className="text-foreground font-mono">{mut.targetId}</span></span>
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    {mut.canonicalWritePath ? (
                      <Badge variant="outline" className="text-[9px] bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Canonical</Badge>
                    ) : (
                      <Badge variant="outline" className="text-[9px] bg-orange-500/10 text-orange-500 border-orange-500/20">Non-canonical path</Badge>
                    )}
                    {mut.lineageComplete ? (
                      <Badge variant="outline" className="text-[9px] bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Lineage ✓</Badge>
                    ) : (
                      <Badge variant="outline" className="text-[9px] bg-amber-500/10 text-amber-500 border-amber-500/20">Lineage incomplete</Badge>
                    )}
                    {mut.rollbackEligible && (
                      <Badge variant="outline" className="text-[9px] bg-blue-500/10 text-blue-500 border-blue-500/20"><Undo2 className="h-2.5 w-2.5 mr-0.5" /> Rollbackable</Badge>
                    )}
                    {mut.proofRef && (
                      <Badge variant="outline" className="text-[9px] bg-primary/10 text-primary border-primary/20"><Eye className="h-2.5 w-2.5 mr-0.5" /> {mut.proofRef}</Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </TabsContent>

          <TabsContent value="write-paths" className="mt-4">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Canonical Write Path Registry</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {WRITE_PATHS.map(wp => (
                  <div key={wp.id} className="p-3 rounded-lg border hover:bg-muted/30 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Layers className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">{wp.surface}</span>
                        <Badge variant="outline" className="text-[9px] font-mono">{wp.method}</Badge>
                      </div>
                      {wp.canonical ? (
                        <Badge variant="outline" className="text-[9px] bg-emerald-500/10 text-emerald-500 border-emerald-500/20"><CheckCircle className="h-2.5 w-2.5 mr-0.5" /> Canonical</Badge>
                      ) : (
                        <Badge variant="outline" className="text-[9px] bg-orange-500/10 text-orange-500 border-orange-500/20"><AlertTriangle className="h-2.5 w-2.5 mr-0.5" /> Non-canonical</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-[10px] text-muted-foreground mb-2">
                      <span>Store: <span className="text-foreground">{wp.durableStore}</span></span>
                      <span>Receipt: {wp.receiptSupport ? <span className="text-emerald-500">✓</span> : <span className="text-red-500">✗</span>}</span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] text-muted-foreground mr-1">Projection impact:</span>
                      {wp.projectionImpact.map(p => (
                        <Badge key={p} variant="secondary" className="text-[9px] px-1.5 py-0">{p}</Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="lineage-gaps" className="mt-4">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-500" /> Lineage Gaps ({LINEAGE_GAPS.length})</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {LINEAGE_GAPS.map(lg => (
                  <div key={lg.id} className={`p-3 rounded-lg border ${lg.severity === "critical" ? "border-red-500/30 bg-red-500/5" : "border-amber-500/20"}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <XCircle className={`h-4 w-4 ${lg.severity === "critical" ? "text-red-500" : "text-amber-500"}`} />
                        <span className="text-sm font-medium text-foreground">{lg.gap}</span>
                        <Badge variant="outline" className={`text-[9px] ${lg.severity === "critical" ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20"}`}>{lg.severity}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                      <span>Mutation: <span className="text-foreground font-mono">{lg.mutationId}</span></span>
                      <span>Surface: <span className="text-foreground">{lg.surface}</span></span>
                      <span>Detected: {new Date(lg.detectedAt).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="provenance" className="mt-4">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Provenance Inspector</CardTitle></CardHeader>
              <CardContent>
                {selectedMutation ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-muted/30 border">
                      <h3 className="text-sm font-semibold text-foreground mb-3">Mutation: {selectedMutation.mutationType}</h3>
                      <div className="grid grid-cols-2 gap-3 text-[11px]">
                        <div><span className="text-muted-foreground">Actor:</span> <span className="text-foreground">{selectedMutation.actor}</span></div>
                        <div><span className="text-muted-foreground">Surface:</span> <span className="text-foreground">{selectedMutation.surface}</span></div>
                        <div><span className="text-muted-foreground">Target:</span> <span className="text-foreground font-mono">{selectedMutation.targetId}</span></div>
                        <div><span className="text-muted-foreground">Submitted:</span> <span className="text-foreground">{new Date(selectedMutation.submittedAt).toLocaleString()}</span></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Execution Chain</h4>
                      {[
                        { step: "Policy Evaluation", status: selectedMutation.canonicalWritePath ? "passed" : "bypassed", detail: selectedMutation.canonicalWritePath ? "Standard policy path evaluated" : "Policy evaluation was bypassed" },
                        { step: "Persistence", status: selectedMutation.durabilityStatus === "persisted" ? "confirmed" : selectedMutation.durabilityStatus === "pending" ? "in-flight" : "failed", detail: selectedMutation.durabilityStatus === "persisted" ? "Write confirmed in durable store" : "Write not yet confirmed" },
                        { step: "Lineage", status: selectedMutation.lineageComplete ? "complete" : "incomplete", detail: selectedMutation.lineageComplete ? "Full audit chain established" : "Lineage chain has gaps" },
                        { step: "Receipt", status: selectedMutation.proofRef ? "generated" : "missing", detail: selectedMutation.proofRef || "No receipt generated" },
                        { step: "Rollback", status: selectedMutation.rollbackEligible ? "eligible" : "ineligible", detail: selectedMutation.rollbackEligible ? "Rollback path available" : "No rollback path" },
                      ].map((s, i) => (
                        <div key={i} className="flex items-start gap-3 p-2.5 rounded border">
                          <div className={`p-1 rounded ${s.status === "confirmed" || s.status === "passed" || s.status === "complete" || s.status === "generated" || s.status === "eligible" ? "bg-emerald-500/10" : s.status === "in-flight" ? "bg-amber-500/10" : "bg-red-500/10"}`}>
                            {s.status === "confirmed" || s.status === "passed" || s.status === "complete" || s.status === "generated" || s.status === "eligible" ? (
                              <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                            ) : s.status === "in-flight" ? (
                              <Clock className="h-3.5 w-3.5 text-amber-500" />
                            ) : (
                              <XCircle className="h-3.5 w-3.5 text-red-500" />
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-medium text-foreground">{s.step}</p>
                            <p className="text-[10px] text-muted-foreground">{s.detail}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground text-xs">
                    <Eye className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    Select a mutation from the Recent Mutations tab to inspect its provenance
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default AdminDurabilityBoard;
