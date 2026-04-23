import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Eye, CheckCircle, AlertTriangle, XCircle, RefreshCw, FileText, GitBranch, Layers, Search, Shield } from "lucide-react";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };

type ClaimStatus = "verified" | "drift" | "unverified" | "stale";
const claimColor: Record<ClaimStatus, string> = {
  verified: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  drift: "bg-red-500/10 text-red-500 border-red-500/20",
  unverified: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  stale: "bg-orange-500/10 text-orange-500 border-orange-500/20",
};

const DEMO_MANIFESTS = [
  { id: "mf-1", scope: "auth-service", generatedAt: "2026-04-05T10:00:00Z", claims: 8, verified: 8, drifts: 0, status: "aligned" as const },
  { id: "mf-2", scope: "connector-gateway", generatedAt: "2026-04-05T09:30:00Z", claims: 12, verified: 9, drifts: 2, status: "drift" as const },
  { id: "mf-3", scope: "workflow-engine", generatedAt: "2026-04-05T08:00:00Z", claims: 6, verified: 5, drifts: 0, status: "stale" as const },
  { id: "mf-4", scope: "ai-gateway", generatedAt: "2026-04-05T10:15:00Z", claims: 15, verified: 14, drifts: 1, status: "drift" as const },
  { id: "mf-5", scope: "notification-center", generatedAt: "2026-04-05T10:10:00Z", claims: 5, verified: 5, drifts: 0, status: "aligned" as const },
];

const DEMO_DOCS_DRIFT = [
  { id: "dd-1", doc: "ATLAS_OPERATIONS_AND_PLATFORM_TRUTH.md", claim: "Receipt chain coverage tracked in real-time", evidence: "Coverage computed on page load, not real-time", severity: "medium" as const, acknowledged: false },
  { id: "dd-2", doc: "MISSION_CONTROL_SHELL.md", claim: "12 tabs fully implemented", evidence: "11/12 tabs active, Safe Mode is placeholder", severity: "low" as const, acknowledged: true },
  { id: "dd-3", doc: "API Gateway docs", claim: "Rate limiting per-tenant", evidence: "Rate limiting is global, not per-tenant", severity: "high" as const, acknowledged: false },
];

const DEMO_ARCH_GATES = [
  { gate: "No hidden write paths", status: "passing" as const, lastChecked: "2026-04-05T10:20:00Z", evidence: "7/7 admin surfaces use canonical writes" },
  { gate: "Proof coverage >80%", status: "passing" as const, lastChecked: "2026-04-05T10:19:00Z", evidence: "87% capability coverage" },
  { gate: "No opaque fallbacks", status: "warning" as const, lastChecked: "2026-04-05T10:18:00Z", evidence: "2 surfaces use fallback without disclosure" },
  { gate: "Evidence-backed readiness", status: "passing" as const, lastChecked: "2026-04-05T10:15:00Z", evidence: "All promotion gates require evidence" },
  { gate: "Replay as first-class", status: "passing" as const, lastChecked: "2026-04-05T10:10:00Z", evidence: "Replay verification active on 25/27 capabilities" },
];

const manifestStatusColor: Record<string, string> = {
  aligned: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  drift: "bg-red-500/10 text-red-500 border-red-500/20",
  stale: "bg-amber-500/10 text-amber-500 border-amber-500/20",
};

const PlatformTruthRegistry = () => {
  
  const [tab, setTab] = useState("claims");
  const verified = ([] as any[]).filter(c => c.status === "verified").length;
  const drifts = ([] as any[]).filter(c => c.status === "drift").length;

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
<div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <Eye className="h-6 w-6 text-primary" /> Platform Truth Registry
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Claims vs evidence · Manifest alignment · Docs drift · Architecture gates</p>
        </div>
        <Button variant="outline" size="sm"><RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Verify All</Button>
      </div>

      <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">
        <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card><CardContent className="p-4"><p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Verified Claims</p><p className="text-2xl font-bold text-emerald-500">{verified}/{([] as any[]).length}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Drift Detected</p><p className="text-2xl font-bold text-red-500">{drifts}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Manifests Aligned</p><p className="text-2xl font-bold text-emerald-500">{([] as any[]).filter(m => m.status === "aligned").length}/{([] as any[]).length}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Docs Drift Issues</p><p className="text-2xl font-bold text-amber-500">{([] as any[]).filter(d => !d.acknowledged).length}</p></CardContent></Card>
        </motion.div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="claims">Capability Claims</TabsTrigger>
            <TabsTrigger value="manifests">Manifest Alignment</TabsTrigger>
            <TabsTrigger value="docs-drift">Docs/Runtime Drift</TabsTrigger>
            <TabsTrigger value="arch-gates">Architecture Gates</TabsTrigger>
          </TabsList>

          <TabsContent value="claims" className="mt-4 space-y-2">
            {([] as any[]).map(c => (
              <div key={c.id} className="p-3 rounded-lg border hover:bg-muted/30 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">{c.capability}</span>
                    <Badge variant="outline" className={`text-[9px] ${claimColor[c.status]}`}>{c.status}</Badge>
                  </div>
                  <span className="text-[10px] text-muted-foreground">{new Date(c.lastChecked).toLocaleTimeString()}</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-[10px] mb-2">
                  <div><span className="text-muted-foreground">Claimed: </span><span className="text-foreground">{c.claimedStatus}</span></div>
                  <div><span className="text-muted-foreground">Evidence: </span><span className="text-foreground">{c.runtimeEvidence}</span></div>
                </div>
                {c.remediation && <div className="flex items-center gap-1.5 text-[10px] text-amber-500 mt-1"><AlertTriangle className="h-3 w-3" /> {c.remediation}</div>}
              </div>
            ))}
          </TabsContent>

          <TabsContent value="manifests" className="mt-4">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Manifest Sync Registry</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {([] as any[]).map(mf => (
                  <div key={mf.id} className="p-3 rounded-lg border hover:bg-muted/30 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground font-mono">{mf.scope}</span>
                        <Badge variant="outline" className={`text-[9px] capitalize ${manifestStatusColor[mf.status]}`}>{mf.status}</Badge>
                      </div>
                      <span className="text-[10px] text-muted-foreground">{new Date(mf.generatedAt).toLocaleTimeString()}</span>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                      <span>Claims: <span className="text-foreground">{mf.claims}</span></span>
                      <span>Verified: <span className="text-emerald-500">{mf.verified}</span></span>
                      <span>Drifts: <span className={mf.drifts > 0 ? "text-red-500" : "text-foreground"}>{mf.drifts}</span></span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="docs-drift" className="mt-4">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold flex items-center gap-2"><GitBranch className="h-4 w-4 text-primary" /> Docs/Runtime Drift</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {([] as any[]).map(dd => (
                  <div key={dd.id} className={`p-3 rounded-lg border ${dd.acknowledged ? "opacity-60" : dd.severity === "high" ? "border-red-500/30" : ""}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">{dd.doc}</span>
                        <Badge variant="outline" className={`text-[9px] ${dd.severity === "high" ? "bg-red-500/10 text-red-500 border-red-500/20" : dd.severity === "medium" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : "bg-blue-500/10 text-blue-500 border-blue-500/20"}`}>{dd.severity}</Badge>
                        {dd.acknowledged && <Badge variant="outline" className="text-[9px]">Acknowledged</Badge>}
                      </div>
                      {!dd.acknowledged && <Button variant="outline" size="sm" className="h-6 text-[10px]">Acknowledge</Button>}
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-[10px]">
                      <div><span className="text-muted-foreground">Claim: </span><span className="text-foreground">{dd.claim}</span></div>
                      <div><span className="text-muted-foreground">Evidence: </span><span className="text-foreground">{dd.evidence}</span></div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="arch-gates" className="mt-4">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold flex items-center gap-2"><Shield className="h-4 w-4 text-primary" /> Architecture Gate Compliance</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {([] as any[]).map(g => (
                  <div key={g.gate} className="p-3 rounded-lg border hover:bg-muted/30 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {g.status === "passing" ? <CheckCircle className="h-4 w-4 text-emerald-500" /> : <AlertTriangle className="h-4 w-4 text-amber-500" />}
                        <span className="text-sm font-medium text-foreground">{g.gate}</span>
                        <Badge variant="outline" className={`text-[9px] ${g.status === "passing" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20"}`}>{g.status}</Badge>
                      </div>
                      <span className="text-[10px] text-muted-foreground">{new Date(g.lastChecked).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{g.evidence}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default PlatformTruthRegistry;
