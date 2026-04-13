import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { SitaPageHeader } from "@/components/sita/SitaCard";
import { Shield, CheckCircle, XCircle, AlertTriangle, GitBranch, RotateCcw, Eye, FileCheck, Link2, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";

const proofDomains = [
  { domain: "approvals", capabilities: [
    { name: "approval-request", hasReceipt: true, hasEvent: true, policyGated: true, replayable: true, rollbackable: false },
    { name: "approval-decision", hasReceipt: true, hasEvent: true, policyGated: true, replayable: true, rollbackable: true },
    { name: "approval-bypass", hasReceipt: true, hasEvent: true, policyGated: true, replayable: false, rollbackable: false },
    { name: "approval-escalation", hasReceipt: true, hasEvent: true, policyGated: false, replayable: true, rollbackable: false },
  ]},
  { domain: "execution", capabilities: [
    { name: "envelope-execute", hasReceipt: true, hasEvent: true, policyGated: true, replayable: true, rollbackable: true },
    { name: "dry-run-execute", hasReceipt: true, hasEvent: true, policyGated: false, replayable: true, rollbackable: false },
    { name: "simulation-execute", hasReceipt: true, hasEvent: true, policyGated: false, replayable: true, rollbackable: false },
    { name: "partial-failure", hasReceipt: true, hasEvent: true, policyGated: false, replayable: true, rollbackable: true },
  ]},
  { domain: "receipts", capabilities: [
    { name: "receipt-generation", hasReceipt: true, hasEvent: true, policyGated: false, replayable: true, rollbackable: false },
    { name: "receipt-verification", hasReceipt: true, hasEvent: true, policyGated: false, replayable: true, rollbackable: false },
    { name: "chain-append", hasReceipt: true, hasEvent: true, policyGated: false, replayable: true, rollbackable: false },
  ]},
  { domain: "policy", capabilities: [
    { name: "policy-evaluation", hasReceipt: true, hasEvent: true, policyGated: false, replayable: true, rollbackable: false },
    { name: "policy-override", hasReceipt: true, hasEvent: true, policyGated: true, replayable: false, rollbackable: true },
    { name: "trust-boundary-check", hasReceipt: true, hasEvent: true, policyGated: false, replayable: true, rollbackable: false },
  ]},
  { domain: "rollback", capabilities: [
    { name: "rollback-initiate", hasReceipt: true, hasEvent: true, policyGated: true, replayable: false, rollbackable: false },
    { name: "rollback-execute", hasReceipt: true, hasEvent: true, policyGated: true, replayable: false, rollbackable: false },
    { name: "state-restore", hasReceipt: true, hasEvent: true, policyGated: false, replayable: true, rollbackable: false },
  ]},
  { domain: "connectors", capabilities: [
    { name: "connector-sync", hasReceipt: true, hasEvent: true, policyGated: false, replayable: true, rollbackable: false },
    { name: "connector-auth", hasReceipt: true, hasEvent: true, policyGated: true, replayable: false, rollbackable: true },
    { name: "connector-failure", hasReceipt: true, hasEvent: true, policyGated: false, replayable: false, rollbackable: false },
    { name: "connector-recovery", hasReceipt: false, hasEvent: true, policyGated: false, replayable: false, rollbackable: false },
  ]},
  { domain: "agents", capabilities: [
    { name: "agent-action", hasReceipt: true, hasEvent: true, policyGated: true, replayable: true, rollbackable: true },
    { name: "agent-escalation", hasReceipt: true, hasEvent: true, policyGated: false, replayable: true, rollbackable: false },
    { name: "agent-override", hasReceipt: false, hasEvent: true, policyGated: true, replayable: false, rollbackable: true },
  ]},
  { domain: "degraded-mode", capabilities: [
    { name: "degraded-entry", hasReceipt: true, hasEvent: true, policyGated: false, replayable: false, rollbackable: false },
    { name: "degraded-exit", hasReceipt: true, hasEvent: true, policyGated: false, replayable: false, rollbackable: false },
    { name: "fallback-activation", hasReceipt: true, hasEvent: true, policyGated: false, replayable: false, rollbackable: false },
  ]},
];

const totalCaps = proofDomains.reduce((s, d) => s + d.capabilities.length, 0);
const coveredReceipts = proofDomains.reduce((s, d) => s + d.capabilities.filter(c => c.hasReceipt).length, 0);
const coveredEvents = proofDomains.reduce((s, d) => s + d.capabilities.filter(c => c.hasEvent).length, 0);
const coveredReplay = proofDomains.reduce((s, d) => s + d.capabilities.filter(c => c.replayable).length, 0);
const coveredRollback = proofDomains.reduce((s, d) => s + d.capabilities.filter(c => c.rollbackable).length, 0);

const chainEntries = [
  { id: "ch-1", action: "create-invoice", proof: ["receipt", "event", "policy-check"], branch: "canonical", integrity: "intact" as const },
  { id: "ch-2", action: "approval-decision", proof: ["receipt", "event", "policy-check", "approval-proof"], branch: "canonical", integrity: "intact" as const },
  { id: "ch-3", action: "send-email", proof: ["receipt", "event", "communication-proof"], branch: "canonical", integrity: "intact" as const },
  { id: "ch-4", action: "connector-sync", proof: ["receipt", "event"], branch: "side-effect", integrity: "intact" as const },
  { id: "ch-5", action: "agent-override", proof: ["event"], branch: "admin", integrity: "break" as const },
  { id: "ch-6", action: "rollback-execute", proof: ["receipt", "event", "rollback-proof"], branch: "recovery", integrity: "intact" as const },
];

export default function ProofCoverageBoard() {
  const [tab, setTab] = useState("matrix");

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto max-w-7xl space-y-6 p-6">
<SitaPageHeader title="Proof Coverage Board" subtitle="Canonical proof matrix, chain exploration, replay/rollback verification, and capability traceability" />

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: "Receipt Coverage", value: `${Math.round((coveredReceipts / totalCaps) * 100)}%`, sub: `${coveredReceipts}/${totalCaps}`, color: coveredReceipts === totalCaps ? "text-green-400" : "text-amber-400" },
          { label: "Event Coverage", value: `${Math.round((coveredEvents / totalCaps) * 100)}%`, sub: `${coveredEvents}/${totalCaps}`, color: "text-green-400" },
          { label: "Replay Coverage", value: `${Math.round((coveredReplay / totalCaps) * 100)}%`, sub: `${coveredReplay}/${totalCaps}`, color: "text-blue-400" },
          { label: "Rollback Coverage", value: `${Math.round((coveredRollback / totalCaps) * 100)}%`, sub: `${coveredRollback}/${totalCaps}`, color: "text-blue-400" },
          { label: "Chain Breaks", value: chainEntries.filter(c => c.integrity === "break").length, color: chainEntries.some(c => c.integrity === "break") ? "text-red-400" : "text-green-400" },
        ].map((k, i) => (
          <Card key={i} className="bg-card/50 border-border/50">
            <CardContent className="p-3 text-center">
              <p className={cn("text-2xl font-bold", k.color)}>{k.value}</p>
              <p className="text-[9px] text-muted-foreground">{k.label}</p>
              {k.sub && <p className="text-[9px] text-muted-foreground">{k.sub}</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-muted/30 border border-border/40 h-8 p-0.5 gap-0.5 flex-wrap">
          {[
            { value: "matrix", label: "Coverage Matrix", icon: Shield },
            { value: "chain", label: "Chain Explorer", icon: GitBranch },
            { value: "replay", label: "Replay Verification", icon: RotateCcw },
            { value: "rollback", label: "Rollback Verification", icon: Zap },
            { value: "breaks", label: "Chain Breaks", icon: AlertTriangle },
          ].map(t => (
            <TabsTrigger key={t.value} value={t.value} className="text-[10px] h-7 px-2.5 gap-1"><t.icon className="h-3 w-3" />{t.label}</TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-4 space-y-3">
          <TabsContent value="matrix">
            {proofDomains.map(domain => (
              <Card key={domain.domain} className="bg-card/50 border-border/50 mb-3">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-foreground capitalize">{domain.domain}</p>
                    <Progress value={(domain.capabilities.filter(c => c.hasReceipt).length / domain.capabilities.length) * 100} className="w-20 h-1.5" />
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-[10px]">
                      <thead><tr className="text-muted-foreground">
                        <th className="text-left py-1">Capability</th>
                        <th className="text-center py-1">Receipt</th>
                        <th className="text-center py-1">Event</th>
                        <th className="text-center py-1">Policy</th>
                        <th className="text-center py-1">Replay</th>
                        <th className="text-center py-1">Rollback</th>
                      </tr></thead>
                      <tbody>{domain.capabilities.map(cap => (
                        <tr key={cap.name} className="border-t border-border/20">
                          <td className="py-1.5 font-mono text-foreground">{cap.name}</td>
                          {[cap.hasReceipt, cap.hasEvent, cap.policyGated, cap.replayable, cap.rollbackable].map((v, i) => (
                            <td key={i} className="text-center">{v ? <CheckCircle className="w-3 h-3 text-green-400 inline" /> : <XCircle className="w-3 h-3 text-red-400/50 inline" />}</td>
                          ))}
                        </tr>
                      ))}</tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="chain">
            <h3 className="text-xs font-semibold mb-3">Canonical Chain Explorer</h3>
            <div className="relative pl-4 border-l border-border/40 space-y-3">
              {chainEntries.map(e => (
                <div key={e.id} className="relative">
                  <div className={cn("absolute -left-[21px] w-2.5 h-2.5 rounded-full border-2", e.integrity === "intact" ? "bg-green-400 border-green-500" : "bg-red-400 border-red-500")} />
                  <div className="p-3 bg-muted/20 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-foreground">{e.action}</span>
                        <Badge variant="outline" className="text-[8px]">{e.branch}</Badge>
                      </div>
                      {e.integrity === "break" && <Badge variant="destructive" className="text-[8px]">Chain Break</Badge>}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {e.proof.map(p => <Badge key={p} variant="outline" className="text-[8px] text-green-400 border-green-500/30">{p}</Badge>)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="replay">
            <h3 className="text-xs font-semibold mb-3">Replay Verification Matrix</h3>
            {proofDomains.map(d => {
              const replayable = d.capabilities.filter(c => c.replayable);
              if (replayable.length === 0) return null;
              return (
                <Card key={d.domain} className="bg-card/50 border-border/50 mb-2">
                  <CardContent className="p-3">
                    <p className="text-xs font-semibold text-foreground capitalize mb-2">{d.domain}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {replayable.map(c => (
                        <div key={c.name} className="flex items-center gap-1 px-2 py-1 bg-blue-500/10 border border-blue-500/20 rounded text-[9px]">
                          <RotateCcw className="w-2.5 h-2.5 text-blue-400" />
                          <span className="text-foreground">{c.name}</span>
                          {c.rollbackable && <Badge variant="outline" className="text-[7px] ml-1">+rollback</Badge>}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="rollback">
            <h3 className="text-xs font-semibold mb-3">Rollback Verification Center</h3>
            {proofDomains.map(d => {
              const rollbackable = d.capabilities.filter(c => c.rollbackable);
              const nonRollbackable = d.capabilities.filter(c => !c.rollbackable);
              if (rollbackable.length === 0 && nonRollbackable.length === 0) return null;
              return (
                <Card key={d.domain} className="bg-card/50 border-border/50 mb-2">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-foreground capitalize">{d.domain}</p>
                      <span className="text-[9px] text-muted-foreground">{rollbackable.length}/{d.capabilities.length} rollbackable</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {rollbackable.map(c => (
                        <div key={c.name} className="flex items-center gap-1 px-2 py-1 bg-green-500/10 border border-green-500/20 rounded text-[9px]">
                          <CheckCircle className="w-2.5 h-2.5 text-green-400" />
                          <span className="text-foreground">{c.name}</span>
                        </div>
                      ))}
                      {nonRollbackable.map(c => (
                        <div key={c.name} className="flex items-center gap-1 px-2 py-1 bg-muted/20 border border-border/30 rounded text-[9px]">
                          <XCircle className="w-2.5 h-2.5 text-red-400/50" />
                          <span className="text-muted-foreground">{c.name}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="breaks">
            <h3 className="text-xs font-semibold mb-3">Chain Break Investigation</h3>
            {chainEntries.filter(e => e.integrity === "break").length === 0 ? (
              <div className="p-6 text-center bg-green-500/5 border border-green-500/20 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-400 mx-auto mb-2" />
                <p className="text-sm text-green-400">No chain breaks detected</p>
              </div>
            ) : (
              chainEntries.filter(e => e.integrity === "break").map(e => (
                <Card key={e.id} className="bg-red-500/5 border-red-500/20 mb-2">
                  <CardContent className="p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      <span className="text-xs font-semibold text-red-400">{e.action}</span>
                      <Badge variant="destructive" className="text-[8px]">{e.branch} branch</Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground">Missing proof artifacts: Receipt not generated for this mutation. Expected canonical chain link not found.</p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="text-[10px] h-6">Investigate</Button>
                      <Button variant="outline" size="sm" className="text-[10px] h-6">Add Missing Receipt</Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </div>
      </Tabs>
    </motion.div>
  );
}
