import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Layers, CheckCircle, AlertTriangle, Download, RefreshCw, GitBranch, Shield, Undo2, FileText, Eye, Scale, Clock } from "lucide-react";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };

const stepColor: Record<string, string> = { verified: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", pending: "bg-amber-500/10 text-amber-500 border-amber-500/20", missing: "bg-red-500/10 text-red-500 border-red-500/20" };

const DEMO_BUNDLES = [
  { id: "eb1", name: "Q1 2026 Platform Actions", entries: 47, format: "compliance", status: "ready", createdAt: "2026-04-01" },
  { id: "eb2", name: "Release v2.14 Evidence", entries: 12, format: "pr-ready", status: "ready", createdAt: "2026-04-08" },
  { id: "eb3", name: "Investor Due Diligence Pack", entries: 89, format: "compliance", status: "building", createdAt: "2026-04-10" },
];

const DEMO_MIGRATIONS = [
  { id: "ms1", title: "Database Schema v4.2 Migration", decision: "Approved with rollback plan", actor: "CTO", date: "2026-04-05", evidenceCount: 8, rollbackReady: true },
  { id: "ms2", title: "AI Model Provider Switch (Anthropic → Mixed)", decision: "Approved — phased rollout", actor: "Founder Council", date: "2026-04-03", evidenceCount: 14, rollbackReady: true },
  { id: "ms3", title: "Payment Gateway Migration", decision: "Deferred — insufficient testing evidence", actor: "CTO", date: "2026-03-28", evidenceCount: 3, rollbackReady: false },
];

const DEMO_ROLLBACK_EVIDENCE = [
  { id: "re1", action: "AI Routing Override — Advisory Capability", rolledBackAt: "2026-04-10T08:05:00Z", reason: "Latency spike detected (p95 > 2s)", restorePoint: "Snapshot SP-441", verified: true },
  { id: "re2", action: "Budget Policy BP-3 Update", rolledBackAt: "2026-04-08T14:30:00Z", reason: "Operator reversal — threshold too aggressive", restorePoint: "Snapshot SP-438", verified: true },
  { id: "re3", action: "Connector Config — Slack Webhook", rolledBackAt: "2026-04-06T11:00:00Z", reason: "Webhook URL misconfigured — delivery failures", restorePoint: "Snapshot SP-435", verified: false },
];

const DEMO_COMPLIANCE = [
  { id: "ct1", regulation: "SOC 2 Type II", status: "compliant", lastAudit: "2026-03-15", gaps: 0, evidenceEntries: 142 },
  { id: "ct2", regulation: "GDPR Article 30", status: "compliant", lastAudit: "2026-03-20", gaps: 0, evidenceEntries: 67 },
  { id: "ct3", regulation: "ISO 27001 Annex A", status: "partial", lastAudit: "2026-02-28", gaps: 3, evidenceEntries: 89 },
  { id: "ct4", regulation: "PCI DSS v4.0", status: "not_applicable", lastAudit: "—", gaps: 0, evidenceEntries: 0 },
];

const InvestorProofLedger = () => {
  const [tab, setTab] = useState("ledger");
  const fullProof = ([] as any[]).filter(p => p.proofChain.every(s => s.status === "verified")).length;

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
<div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <Layers className="h-6 w-6 text-primary" /> Investor-Grade Proof Ledger
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Open-book platform governance — every material action receipted, exportable, and compliance-ready</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm"><Download className="h-3.5 w-3.5 mr-1.5" /> Export Bundle</Button>
          <Button variant="outline" size="sm"><RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Refresh</Button>
        </div>
      </div>

      <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Full Proof", value: `${fullProof}/${([] as any[]).length}`, color: "text-emerald-500" },
          { label: "Rollback Evidence", value: String(([] as any[]).filter(p => p.rollbackEvidence).length), color: "text-foreground" },
          { label: "Exportable", value: String(([] as any[]).filter(p => p.exportable).length), color: "text-foreground" },
          { label: "Evidence Bundles", value: String(([] as any[]).length), color: "text-blue-500" },
          { label: "Compliance Trails", value: String(([] as any[]).filter(c => c.status === "compliant").length), color: "text-emerald-500" },
        ].map(m => (
          <motion.div key={m.label} variants={fadeUp}>
            <Card className="hover:-translate-y-0.5 transition-transform">
              <CardContent className="p-3.5">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">{m.label}</p>
                <p className={`text-xl font-bold ${m.color}`}>{m.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-secondary/50 flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="ledger" className="text-xs">Proof Ledger</TabsTrigger>
          <TabsTrigger value="bundles" className="text-xs">Evidence Bundles</TabsTrigger>
          <TabsTrigger value="migrations" className="text-xs">Migration Snapshots</TabsTrigger>
          <TabsTrigger value="rollback" className="text-xs">Rollback Evidence</TabsTrigger>
          <TabsTrigger value="compliance" className="text-xs">Compliance Trails</TabsTrigger>
        </TabsList>

        <TabsContent value="ledger" className="mt-4">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Proof Ledger</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {([] as any[]).map(p => (
                <div key={p.id} className="p-4 rounded-lg border hover:bg-muted/30 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium text-foreground">{p.action}</p>
                      <p className="text-[10px] text-muted-foreground">By {p.actor} · {new Date(p.timestamp).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {p.rollbackEvidence && <Badge variant="outline" className="text-[9px] bg-blue-500/10 text-blue-500 border-blue-500/20"><Undo2 className="h-2.5 w-2.5 mr-0.5" /> Rollback</Badge>}
                      {p.approvalContext && <Badge variant="outline" className="text-[9px] bg-emerald-500/10 text-emerald-500 border-emerald-500/20"><Shield className="h-2.5 w-2.5 mr-0.5" /> Approved</Badge>}
                      {p.exportable && <Button variant="ghost" size="sm" className="h-6 text-[10px]"><Download className="h-3 w-3 mr-1" /> Export</Button>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    {p.proofChain.map((step, i) => (
                      <div key={step.step} className="flex items-center gap-1">
                        {i > 0 && <GitBranch className="h-3 w-3 text-muted-foreground rotate-90" />}
                        <Badge variant="outline" className={`text-[9px] ${stepColor[step.status]}`}>
                          {step.status === "verified" && <CheckCircle className="h-2.5 w-2.5 mr-0.5" />}
                          {step.status === "missing" && <AlertTriangle className="h-2.5 w-2.5 mr-0.5" />}
                          {step.step}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bundles" className="mt-4 space-y-3">
          {([] as any[]).map(b => (
            <Card key={b.id} className="hover:bg-muted/20 transition-colors">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">{b.name}</p>
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-1">
                    <span>{b.entries} entries</span>
                    <Badge variant="outline" className="text-[9px]">{b.format}</Badge>
                    <span>Created: {b.createdAt}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`text-[9px] ${b.status === "ready" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20"}`}>
                    {b.status}
                  </Badge>
                  {b.status === "ready" && <Button variant="outline" size="sm" className="h-6 text-[10px]"><Download className="h-3 w-3 mr-1" /> Download</Button>}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="migrations" className="mt-4 space-y-3">
          {([] as any[]).map(m => (
            <Card key={m.id} className="hover:bg-muted/20 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-foreground">{m.title}</span>
                  <Badge variant="outline" className={`text-[9px] ${m.rollbackReady ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20"}`}>
                    {m.rollbackReady ? "Rollback Ready" : "No Rollback"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-1">Decision: {m.decision}</p>
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                  <span>By: {m.actor}</span>
                  <span>Date: {m.date}</span>
                  <span>Evidence: {m.evidenceCount} artifacts</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="rollback" className="mt-4 space-y-3">
          {([] as any[]).map(r => (
            <Card key={r.id} className={`hover:bg-muted/20 transition-colors ${!r.verified ? "border-amber-500/20" : ""}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-foreground">{r.action}</span>
                  <Badge variant="outline" className={`text-[9px] ${r.verified ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20"}`}>
                    {r.verified ? "Verified" : "Unverified"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">Reason: {r.reason}</p>
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-1">
                  <span>Restore: {r.restorePoint}</span>
                  <span>Rolled back: {new Date(r.rolledBackAt).toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="compliance" className="mt-4 space-y-3">
          {([] as any[]).map(c => (
            <Card key={c.id} className="hover:bg-muted/20 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Scale className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold text-foreground">{c.regulation}</span>
                  </div>
                  <Badge variant="outline" className={`text-[9px] ${c.status === "compliant" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : c.status === "partial" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : "bg-muted text-muted-foreground border-border"}`}>
                    {c.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                  <span>Last audit: {c.lastAudit}</span>
                  <span>Gaps: {c.gaps}</span>
                  <span>Evidence: {c.evidenceEntries} entries</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InvestorProofLedger;
