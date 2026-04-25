import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { SitaPageHeader } from "@/platform/sita/components/sita/SitaCard";
import { DurabilityStateBadge } from "@/platform/sita/components/sita/truth/DurabilityStateBadge";
import { StalenessIndicator } from "@/platform/sita/components/sita/truth/StalenessIndicator";
import { ReplayabilityBadge } from "@/platform/sita/components/sita/truth/ReplayabilityBadge";
import { RollbackabilityBadge } from "@/platform/sita/components/sita/truth/RollbackabilityBadge";
import { DegradedStateBanner } from "@/platform/sita/components/sita/truth/DegradedStateBanner";
import {
  Shield, CheckCircle, XCircle, AlertTriangle, Clock, FileCheck, Database,
  Activity, Eye, RotateCcw, Undo2, GitBranch, Lock, Layers, Zap, Search
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

const now = new Date();
const h = (hours: number) => new Date(now.getTime() - hours * 3600000).toISOString();

const mutations = [
  { id: "m1", action: "Toggle safe mode ON", actor: "owner@sita.io", domain: "mission-control", durability: "persisted" as const, time: h(0.5), receiptId: "rcpt-sm-1", policyPath: "safe-mode.toggle", projectionImpact: ["mission-overview", "ai-team-state"], replayable: true, rollbackable: true, auditVisible: true },
  { id: "m2", action: "Pause agent: cost-sentinel", actor: "owner@sita.io", domain: "ai-team", durability: "persisted" as const, time: h(1), receiptId: "rcpt-ag-1", policyPath: "agent.lifecycle.pause", projectionImpact: ["ai-team-state"], replayable: true, rollbackable: true, auditVisible: true },
  { id: "m3", action: "Approve invoice #INV-2024-087", actor: "owner@sita.io", domain: "approvals", durability: "persisted" as const, time: h(2), receiptId: "rcpt-ap-1", policyPath: "approval.decide", projectionImpact: ["approval-queue", "timeline-feed"], replayable: true, rollbackable: false, auditVisible: true },
  { id: "m4", action: "Update connector: Google Ads credentials", actor: "owner@sita.io", domain: "connectors", durability: "persisted" as const, time: h(4), receiptId: "rcpt-cn-1", policyPath: "connector.update.credentials", projectionImpact: ["connector-health"], replayable: false, rollbackable: true, auditVisible: true },
  { id: "m5", action: "Promote release to Ring 1", actor: "owner@sita.io", domain: "deployment", durability: "persisted" as const, time: h(6), receiptId: "rcpt-dp-1", policyPath: "release.promote", projectionImpact: ["deployment-state"], replayable: false, rollbackable: true, auditVisible: true },
  { id: "m6", action: "Dismiss degraded state banner", actor: "owner@sita.io", domain: "ui-state", durability: "transient" as const, time: h(0.1), policyPath: "ui.dismiss", projectionImpact: [], replayable: false, rollbackable: false, auditVisible: false },
  { id: "m7", action: "Update advisor persona: Money Advisor", actor: "owner@sita.io", domain: "registry", durability: "persisted" as const, time: h(8), receiptId: "rcpt-rg-1", policyPath: "advisor.update.persona", projectionImpact: ["ai-team-state", "advisor-registry"], replayable: true, rollbackable: true, auditVisible: true },
  { id: "m8", action: "Reset projection: cross-domain-kpis", actor: "owner@sita.io", domain: "truth", durability: "persisted" as const, time: h(3), receiptId: "rcpt-tr-1", policyPath: "projection.rebuild", projectionImpact: ["cross-domain-kpis"], replayable: true, rollbackable: false, auditVisible: true },
];

const writePathRegistry = [
  { path: "mission-control.safe-mode", canonical: true, persisted: true, receipted: true, policyGated: true, writeTarget: "platform_mutation_receipts" },
  { path: "agent.lifecycle.*", canonical: true, persisted: true, receipted: true, policyGated: true, writeTarget: "agent_signals + audit_logs" },
  { path: "approval.decide", canonical: true, persisted: true, receipted: true, policyGated: true, writeTarget: "approval_queue + audit_logs" },
  { path: "connector.update.*", canonical: true, persisted: true, receipted: true, policyGated: true, writeTarget: "connector_configs + audit_logs" },
  { path: "release.promote", canonical: true, persisted: true, receipted: true, policyGated: true, writeTarget: "platform_launch_gates" },
  { path: "advisor.update.*", canonical: true, persisted: true, receipted: true, policyGated: false, writeTarget: "advisor_registry + audit_logs" },
  { path: "projection.rebuild", canonical: true, persisted: true, receipted: true, policyGated: false, writeTarget: "platform_projection_states" },
  { path: "ui.dismiss", canonical: false, persisted: false, receipted: false, policyGated: false, writeTarget: "localStorage (transient)" },
  { path: "ui.preference.*", canonical: false, persisted: false, receipted: false, policyGated: false, writeTarget: "sessionStorage (transient)" },
];

const lineageGaps = [
  { path: "ui.dismiss", severity: "low" as const, reason: "Non-critical UI state, transient by design", remediation: "Acceptable — no lineage required" },
  { path: "ui.preference.*", severity: "low" as const, reason: "Session-scoped preference, non-durable by design", remediation: "Acceptable — no lineage required" },
];

const provenanceDetail = {
  mutation: mutations[0],
  policyEvaluation: { rule: "safe-mode.toggle requires owner role", result: "passed", evaluatedAt: h(0.5), actor: "owner@sita.io" },
  persistenceEvidence: { table: "platform_mutation_receipts", rowId: "rcpt-sm-1", confirmedAt: h(0.5), writeLatency: "12ms" },
  projectionEffects: [
    { projection: "mission-overview", stateChange: "safe_mode: false → true", lag: "0ms" },
    { projection: "ai-team-state", stateChange: "automation_paused: false → true", lag: "45ms" },
  ],
  relatedReceipts: [
    { id: "rcpt-sm-1", type: "mutation", chain: "intact" },
    { id: "rcpt-sm-0", type: "prior-state", chain: "intact" },
  ],
  rollbackOptions: { available: true, method: "Toggle safe mode OFF", estimatedImpact: "Resumes all automation" },
};

export default function AdminDurabilityBoard() {
  const [tab, setTab] = useState("mutations");
  const [inspectIdx, setInspectIdx] = useState<number | null>(null);
  const persisted = mutations.filter(m => m.durability === "persisted").length;
  const transient = mutations.filter(m => m.durability === "transient").length;
  const receipted = mutations.filter(m => m.receiptId).length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto max-w-7xl space-y-6 p-6">
<SitaPageHeader title="Admin Durability Board" subtitle="Write-path durability, mutation provenance, audit lineage, canonical path registry, and persistence evidence" />

      {transient > 0 && (
        <DegradedStateBanner severity="info" reason={`${transient} mutation(s) are transient/non-durable`} impact="These UI-level actions are not audit-tracked by design" dismissible />
      )}

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: "Total Mutations", value: mutations.length, color: "text-foreground" },
          { label: "Persisted", value: persisted, color: "text-green-400" },
          { label: "Transient", value: transient, color: transient > 0 ? "text-amber-400" : "text-green-400" },
          { label: "Receipted", value: `${receipted}/${mutations.length}`, color: receipted === mutations.length ? "text-green-400" : "text-amber-400" },
          { label: "Lineage Gaps", value: lineageGaps.length, color: lineageGaps.length > 0 ? "text-amber-400" : "text-green-400" },
        ].map((k, i) => (
          <Card key={i} className="bg-card/50 border-border/50">
            <CardContent className="p-3 text-center">
              <p className={cn("text-2xl font-bold", k.color)}>{k.value}</p>
              <p className="text-[9px] text-muted-foreground">{k.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-muted/30 border border-border/40 h-8 p-0.5 gap-0.5 flex-wrap">
          {[
            { value: "mutations", label: "Recent Mutations", icon: Activity },
            { value: "paths", label: "Write Path Registry", icon: GitBranch },
            { value: "gaps", label: "Lineage Gaps", icon: AlertTriangle },
            { value: "provenance", label: "Provenance Inspector", icon: Search },
          ].map(t => (
            <TabsTrigger key={t.value} value={t.value} className="text-[10px] h-7 px-2.5 gap-1"><t.icon className="h-3 w-3" />{t.label}</TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-4 space-y-3">
          <TabsContent value="mutations">
            {mutations.map((m, idx) => (
              <div key={m.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg mb-2 cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => { setInspectIdx(idx); setTab("provenance"); }}>
                <div className="flex items-center gap-3">
                  {m.durability === "persisted" ? <Database className="w-4 h-4 text-green-400" /> : <Clock className="w-4 h-4 text-muted-foreground" />}
                  <div>
                    <p className="text-xs font-medium text-foreground">{m.action}</p>
                    <p className="text-[10px] text-muted-foreground">{m.actor} • {m.domain} • {m.policyPath}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap justify-end">
                  <DurabilityStateBadge state={m.durability} compact />
                  <ReplayabilityBadge replayable={m.replayable} />
                  <RollbackabilityBadge rollbackable={m.rollbackable} />
                  {m.receiptId && <Badge variant="outline" className="text-[8px] text-green-400 border-green-500/30"><FileCheck className="w-2 h-2 mr-0.5" />{m.receiptId}</Badge>}
                  {m.auditVisible && <Badge variant="outline" className="text-[8px]"><Eye className="w-2 h-2 mr-0.5" />Audited</Badge>}
                  <StalenessIndicator lastUpdated={m.time} thresholdSeconds={3600} />
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="paths">
            <h3 className="text-xs font-semibold mb-3">Canonical Write Path Registry ({writePathRegistry.length} paths)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-[10px]">
                <thead><tr className="text-muted-foreground border-b border-border/30">
                  <th className="text-left py-2 px-2">Write Path</th>
                  <th className="text-center py-2">Canonical</th>
                  <th className="text-center py-2">Persisted</th>
                  <th className="text-center py-2">Receipted</th>
                  <th className="text-center py-2">Policy-Gated</th>
                  <th className="text-left py-2 px-2">Write Target</th>
                </tr></thead>
                <tbody>{writePathRegistry.map(wp => (
                  <tr key={wp.path} className="border-t border-border/20">
                    <td className="py-2 px-2 font-mono text-foreground">{wp.path}</td>
                    {[wp.canonical, wp.persisted, wp.receipted, wp.policyGated].map((v, i) => (
                      <td key={i} className="text-center">{v ? <CheckCircle className="w-3 h-3 text-green-400 inline" /> : <XCircle className="w-3 h-3 text-red-400/50 inline" />}</td>
                    ))}
                    <td className="py-2 px-2 text-muted-foreground">{wp.writeTarget}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="gaps">
            <h3 className="text-xs font-semibold mb-3">Lineage Gaps ({lineageGaps.length})</h3>
            {lineageGaps.length === 0 ? (
              <div className="p-6 text-center bg-green-500/5 border border-green-500/20 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-400 mx-auto mb-2" />
                <p className="text-sm text-green-400">No critical lineage gaps</p>
              </div>
            ) : (
              lineageGaps.map(g => (
                <Card key={g.path} className={cn("mb-2", g.severity === "low" ? "bg-muted/20 border-border/50" : "bg-amber-500/5 border-amber-500/20")}>
                  <CardContent className="p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-foreground">{g.path}</span>
                      <Badge variant={g.severity === "low" ? "secondary" : "destructive"} className="text-[8px] capitalize">{g.severity}</Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{g.reason}</p>
                    <p className="text-[10px] text-primary">{g.remediation}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="provenance">
            <h3 className="text-xs font-semibold mb-3">Mutation Provenance Inspector</h3>
            {(() => {
              const m = inspectIdx !== null ? mutations[inspectIdx] : mutations[0];
              const p = provenanceDetail;
              return (
                <div className="space-y-3">
                  <Card className="bg-card/50 border-border/50">
                    <CardHeader className="pb-2"><CardTitle className="text-xs">Action Summary</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-foreground font-medium">{m.action}</span>
                        <DurabilityStateBadge state={m.durability} />
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[10px]">
                        <div><span className="text-muted-foreground">Actor:</span> <span className="text-foreground">{m.actor}</span></div>
                        <div><span className="text-muted-foreground">Domain:</span> <span className="text-foreground">{m.domain}</span></div>
                        <div><span className="text-muted-foreground">Policy Path:</span> <span className="text-foreground font-mono">{m.policyPath}</span></div>
                        <div><span className="text-muted-foreground">Receipt:</span> <span className="text-foreground font-mono">{m.receiptId || "none"}</span></div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-card/50 border-border/50">
                    <CardHeader className="pb-2"><CardTitle className="text-xs">Policy Evaluation</CardTitle></CardHeader>
                    <CardContent className="text-[10px] space-y-1">
                      <div className="flex items-center gap-2"><Shield className="w-3 h-3 text-green-400" /><span className="text-foreground">{p.policyEvaluation.rule}</span></div>
                      <div><span className="text-muted-foreground">Result:</span> <Badge variant="default" className="text-[8px]">{p.policyEvaluation.result}</Badge></div>
                    </CardContent>
                  </Card>

                  <Card className="bg-card/50 border-border/50">
                    <CardHeader className="pb-2"><CardTitle className="text-xs">Persistence Evidence</CardTitle></CardHeader>
                    <CardContent className="text-[10px] space-y-1">
                      <div><span className="text-muted-foreground">Table:</span> <span className="font-mono text-foreground">{p.persistenceEvidence.table}</span></div>
                      <div><span className="text-muted-foreground">Row ID:</span> <span className="font-mono text-foreground">{p.persistenceEvidence.rowId}</span></div>
                      <div><span className="text-muted-foreground">Write Latency:</span> <span className="text-foreground">{p.persistenceEvidence.writeLatency}</span></div>
                    </CardContent>
                  </Card>

                  <Card className="bg-card/50 border-border/50">
                    <CardHeader className="pb-2"><CardTitle className="text-xs">Projection Effects ({p.projectionEffects.length})</CardTitle></CardHeader>
                    <CardContent className="space-y-1.5">
                      {p.projectionEffects.map(pe => (
                        <div key={pe.projection} className="flex items-center justify-between p-2 bg-muted/20 rounded">
                          <div>
                            <p className="text-[10px] font-mono text-foreground">{pe.projection}</p>
                            <p className="text-[9px] text-muted-foreground">{pe.stateChange}</p>
                          </div>
                          <span className="text-[9px] text-muted-foreground">{pe.lag} lag</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-2 gap-3">
                    <Card className="bg-card/50 border-border/50">
                      <CardHeader className="pb-2"><CardTitle className="text-xs">Related Receipts</CardTitle></CardHeader>
                      <CardContent className="space-y-1">
                        {p.relatedReceipts.map(r => (
                          <div key={r.id} className="flex items-center justify-between text-[10px]">
                            <span className="font-mono text-foreground">{r.id}</span>
                            <div className="flex items-center gap-1.5">
                              <Badge variant="outline" className="text-[8px]">{r.type}</Badge>
                              <Badge variant={r.chain === "intact" ? "default" : "destructive"} className="text-[8px]">{r.chain}</Badge>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                    <Card className="bg-card/50 border-border/50">
                      <CardHeader className="pb-2"><CardTitle className="text-xs">Rollback Options</CardTitle></CardHeader>
                      <CardContent className="text-[10px] space-y-2">
                        {p.rollbackOptions.available ? (
                          <>
                            <div className="flex items-center gap-1.5"><Undo2 className="w-3 h-3 text-green-400" /><span className="text-foreground">{p.rollbackOptions.method}</span></div>
                            <p className="text-muted-foreground">{p.rollbackOptions.estimatedImpact}</p>
                            <Button variant="outline" size="sm" className="text-[10px] h-6 gap-0.5"><Undo2 className="w-2.5 h-2.5" />Execute Rollback</Button>
                          </>
                        ) : (
                          <p className="text-muted-foreground">No rollback available for this action</p>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              );
            })()}
          </TabsContent>
        </div>
      </Tabs>
    </motion.div>
  );
}
