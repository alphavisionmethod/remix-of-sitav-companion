import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { SitaPageHeader } from "@/platform/sita/components/sita/SitaCard";
import { ManifestDriftIndicator } from "@/platform/sita/components/sita/truth/ManifestDriftIndicator";
import { DegradedStateBanner } from "@/platform/sita/components/sita/truth/DegradedStateBanner";
import { StalenessIndicator } from "@/platform/sita/components/sita/truth/StalenessIndicator";
import {
  FileCheck, GitCompare, CheckCircle, XCircle, AlertTriangle, Database,
  Shield, Eye, RefreshCw, BookOpen, Layers, Clock, Cpu, ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

const now = new Date();
const h = (hours: number) => new Date(now.getTime() - hours * 3600000).toISOString();

const manifests = [
  { artifact: "supabase/types.ts", sourceHash: "a3f8c2d1", runtimeHash: "a3f8c2d1", lastChecked: h(0.1), autoSync: true },
  { artifact: "capability-registry.json", sourceHash: "b7e4a190", runtimeHash: "b7e4a190", lastChecked: h(0.5), autoSync: true },
  { artifact: "rls-policy-manifest.sql", sourceHash: "c9d2f3e8", runtimeHash: "c9d2f3e8", lastChecked: h(1), autoSync: false },
  { artifact: "edge-function-index.json", sourceHash: "d1a8b4c7", runtimeHash: "d1a8b4c7", lastChecked: h(2), autoSync: true },
  { artifact: "advisor-registry.json", sourceHash: "e5f2c890", runtimeHash: "e5f2c891", lastChecked: h(4), autoSync: true },
  { artifact: "connector-schema.json", sourceHash: "f3a7d2e1", runtimeHash: "f3a7d2e1", lastChecked: h(6), autoSync: false },
  { artifact: "brand-kit-tokens.json", sourceHash: "1b2c3d4e", runtimeHash: "1b2c3d4f", lastChecked: h(8), autoSync: false },
];

const capabilityClaims = [
  { claim: "RLS enforced on all user tables", verified: true, evidence: "89 tables checked, all RLS enabled", domain: "security", automationStatus: "automated" as const },
  { claim: "All admin mutations produce receipts", verified: true, evidence: "Receipt chain intact, 0 breaks", domain: "audit", automationStatus: "automated" as const },
  { claim: "Approval bypass prevention active", verified: true, evidence: "Policy gate enforced on all write actions", domain: "governance", automationStatus: "automated" as const },
  { claim: "Projection freshness < 5min for critical surfaces", verified: false, evidence: "2 projections exceed threshold", domain: "truth", automationStatus: "automated" as const },
  { claim: "All connectors have health monitoring", verified: true, evidence: "5/5 connectors monitored", domain: "connectors", automationStatus: "automated" as const },
  { claim: "Secret rotation within 90-day window", verified: true, evidence: "All secrets within rotation window", domain: "security", automationStatus: "automated" as const },
  { claim: "Edge functions have CORS headers", verified: true, evidence: "All functions include corsHeaders", domain: "security", automationStatus: "manual" as const },
  { claim: "Backup restore tested within 7 days", verified: true, evidence: "Last DR drill: 2 days ago", domain: "deployment", automationStatus: "manual" as const },
  { claim: "All advisor actions are audited", verified: true, evidence: "Audit triggers active on advisor tables", domain: "ai-team", automationStatus: "automated" as const },
  { claim: "Concierge tasks have durability tracking", verified: false, evidence: "2 task types missing persistence", domain: "concierge", automationStatus: "manual" as const },
];

const docsRuntimeDrift = [
  { doc: "Architecture Overview", section: "Data Model", status: "synced" as const, lastVerified: h(2), coverage: 95 },
  { doc: "Security Posture", section: "RLS Policies", status: "synced" as const, lastVerified: h(1), coverage: 100 },
  { doc: "Deployment Guide", section: "Ring Promotion", status: "synced" as const, lastVerified: h(4), coverage: 90 },
  { doc: "API Reference", section: "Edge Functions", status: "drifted" as const, lastVerified: h(24), coverage: 75 },
  { doc: "Connector Guide", section: "Available Integrations", status: "synced" as const, lastVerified: h(6), coverage: 85 },
  { doc: "AI Team Spec", section: "Advisor Registry", status: "drifted" as const, lastVerified: h(48), coverage: 60 },
];

const archGates = [
  { gate: "No direct DB access in components", status: "passed" as const, lastRun: h(0.5), evidence: "All queries via hooks" },
  { gate: "RLS on every public schema table", status: "passed" as const, lastRun: h(0.5), evidence: "89/89 verified" },
  { gate: "No circular dependency chains", status: "passed" as const, lastRun: h(0.5), evidence: "0 cycles" },
  { gate: "Edge functions ≤ 50KB", status: "passed" as const, lastRun: h(0.5), evidence: "Max: 32KB" },
  { gate: "Semantic tokens only (no raw colors)", status: "failed" as const, lastRun: h(0.5), evidence: "3 violations in components" },
  { gate: "No secrets in client code", status: "passed" as const, lastRun: h(0.5), evidence: "0 secrets found" },
  { gate: "Receipt chain unbroken", status: "passed" as const, lastRun: h(1), evidence: "All chains verified" },
  { gate: "Approval gate on all admin write paths", status: "passed" as const, lastRun: h(1), evidence: "9/9 paths gated" },
];

const generatedTruthFiles = [
  { file: "supabase/types.ts", source: "Supabase CLI", freshness: "live" as const, lastGenerated: h(0.1), size: "89 tables" },
  { file: "capability-registry.json", source: "Code analysis", freshness: "live" as const, lastGenerated: h(0.5), size: "24 capabilities" },
  { file: "rls-policy-manifest.sql", source: "Migration scan", freshness: "live" as const, lastGenerated: h(1), size: "178 policies" },
  { file: "edge-function-index.json", source: "Function scan", freshness: "live" as const, lastGenerated: h(2), size: "6 functions" },
  { file: "advisor-registry.json", source: "DB query", freshness: "stale" as const, lastGenerated: h(4), size: "8 advisors" },
  { file: "connector-schema.json", source: "DB + config", freshness: "stale" as const, lastGenerated: h(8), size: "12 providers" },
];

export default function PlatformTruthRegistry() {
  const [tab, setTab] = useState("manifests");
  const drifted = manifests.filter(m => m.sourceHash !== m.runtimeHash).length;
  const claimsVerified = capabilityClaims.filter(c => c.verified).length;
  const docsSynced = docsRuntimeDrift.filter(d => d.status === "synced").length;
  const gatesPassed = archGates.filter(g => g.status === "passed").length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto max-w-7xl space-y-6 p-6">
<SitaPageHeader title="Platform Truth Registry" subtitle="Manifest sync, capability verification, docs drift, architecture gates, generated truth freshness, and claim automation" />

      {drifted > 0 && (
        <DegradedStateBanner severity="warning" reason={`${drifted} manifest(s) drifted from source — generated artifacts may not match runtime`} impact="Capability claims may be stale" dismissible />
      )}

      <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Manifests Synced", value: `${manifests.length - drifted}/${manifests.length}`, color: drifted === 0 ? "text-green-400" : "text-amber-400" },
          { label: "Claims Verified", value: `${claimsVerified}/${capabilityClaims.length}`, color: claimsVerified === capabilityClaims.length ? "text-green-400" : "text-amber-400" },
          { label: "Docs Synced", value: `${docsSynced}/${docsRuntimeDrift.length}`, color: docsSynced === docsRuntimeDrift.length ? "text-green-400" : "text-amber-400" },
          { label: "Arch Gates", value: `${gatesPassed}/${archGates.length}`, color: gatesPassed === archGates.length ? "text-green-400" : "text-amber-400" },
          { label: "Gen Files Fresh", value: `${generatedTruthFiles.filter(f => f.freshness === "live").length}/${generatedTruthFiles.length}`, color: "text-blue-400" },
          { label: "Total Drift", value: drifted + docsRuntimeDrift.filter(d => d.status === "drifted").length, color: "text-red-400" },
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
            { value: "manifests", label: "Manifests", icon: GitCompare },
            { value: "claims", label: "Claims", icon: Shield },
            { value: "archgates", label: "Arch Gates", icon: Layers },
            { value: "drift", label: "Docs Drift", icon: BookOpen },
            { value: "generated", label: "Generated Truth", icon: Cpu },
            { value: "inspect", label: "Inspector", icon: Eye },
          ].map(t => (
            <TabsTrigger key={t.value} value={t.value} className="text-[10px] h-7 px-2.5 gap-1"><t.icon className="h-3 w-3" />{t.label}</TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-4 space-y-3">
          <TabsContent value="manifests">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold">Generated Manifests ({manifests.length})</h3>
              <Button variant="ghost" size="sm" className="text-[10px] gap-1 h-6" onClick={() => toast.success("Re-syncing all manifests")}><RefreshCw className="w-3 h-3" /> Re-sync All</Button>
            </div>
            <div className="space-y-2">
              {manifests.map(m => (
                <div key={m.artifact} className="flex items-center justify-between p-2.5 bg-muted/20 rounded-lg">
                  <ManifestDriftIndicator artifact={m.artifact} sourceHash={m.sourceHash} runtimeHash={m.runtimeHash} lastChecked={m.lastChecked} />
                  <div className="flex items-center gap-2 ml-2">
                    {m.autoSync && <Badge variant="outline" className="text-[8px]">Auto-sync</Badge>}
                    {m.sourceHash !== m.runtimeHash && (
                      <Button variant="ghost" size="sm" className="text-[9px] h-5" onClick={() => toast.success(`Syncing ${m.artifact}`)}><RefreshCw className="w-2.5 h-2.5" /></Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="claims">
            <h3 className="text-xs font-semibold mb-3">Capability Claim Verification</h3>
            <div className="space-y-1.5">
              {capabilityClaims.map(c => (
                <div key={c.claim} className="flex items-center justify-between p-2.5 bg-muted/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    {c.verified ? <CheckCircle className="w-3.5 h-3.5 text-green-400" /> : <XCircle className="w-3.5 h-3.5 text-red-400" />}
                    <div>
                      <p className="text-[10px] font-medium text-foreground">{c.claim}</p>
                      <p className="text-[9px] text-muted-foreground">{c.evidence}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={cn("text-[8px]", c.automationStatus === "automated" ? "text-green-400" : "text-amber-400")}>{c.automationStatus}</Badge>
                    <Badge variant="outline" className="text-[8px]">{c.domain}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="archgates">
            <h3 className="text-xs font-semibold mb-3">Architecture Gate Visibility</h3>
            <div className="space-y-1.5">
              {archGates.map(g => (
                <div key={g.gate} className="flex items-center justify-between p-2.5 bg-muted/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    {g.status === "passed" ? <CheckCircle className="w-3.5 h-3.5 text-green-400" /> : <XCircle className="w-3.5 h-3.5 text-red-400" />}
                    <div>
                      <p className="text-[10px] font-medium text-foreground">{g.gate}</p>
                      <p className="text-[9px] text-muted-foreground">{g.evidence}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StalenessIndicator lastUpdated={g.lastRun} thresholdSeconds={3600} />
                    <Badge variant={g.status === "passed" ? "default" : "destructive"} className="text-[9px] capitalize">{g.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="drift">
            <h3 className="text-xs font-semibold mb-3">Documentation vs Runtime</h3>
            <div className="space-y-1.5">
              {docsRuntimeDrift.map(d => (
                <div key={d.doc + d.section} className="flex items-center justify-between p-2.5 bg-muted/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    {d.status === "synced" ? <CheckCircle className="w-3.5 h-3.5 text-green-400" /> : <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
                    <div>
                      <p className="text-[10px] font-medium text-foreground">{d.doc}</p>
                      <p className="text-[9px] text-muted-foreground">{d.section}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={d.coverage} className="w-12 h-1.5" />
                    <Badge variant="outline" className="text-[8px]">{d.coverage}%</Badge>
                    <Badge variant={d.status === "synced" ? "default" : "destructive"} className="text-[9px] capitalize">{d.status}</Badge>
                    <StalenessIndicator lastUpdated={d.lastVerified} thresholdSeconds={86400} />
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="generated">
            <h3 className="text-xs font-semibold mb-3">Generated Truth File Freshness</h3>
            <div className="space-y-1.5">
              {generatedTruthFiles.map(f => (
                <div key={f.file} className="flex items-center justify-between p-2.5 bg-muted/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileCheck className={cn("w-3.5 h-3.5", f.freshness === "live" ? "text-green-400" : "text-amber-400")} />
                    <div>
                      <p className="text-[10px] font-mono text-foreground">{f.file}</p>
                      <p className="text-[9px] text-muted-foreground">{f.source} • {f.size}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={f.freshness === "live" ? "default" : "secondary"} className="text-[8px] capitalize">{f.freshness}</Badge>
                    <StalenessIndicator lastUpdated={f.lastGenerated} thresholdSeconds={7200} />
                    <Button variant="ghost" size="sm" className="h-5 text-[9px]" onClick={() => toast.success(`Regenerating ${f.file}`)}><RefreshCw className="w-2.5 h-2.5" /></Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="inspect">
            <h3 className="text-xs font-semibold mb-3">Generated Truth Inspector</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { label: "Type Definitions", source: "supabase/types.ts", tables: 89, synced: true },
                { label: "RLS Policy Set", source: "migration files", policies: 178, synced: true },
                { label: "Edge Function Registry", source: "supabase/functions/", functions: 6, synced: true },
                { label: "Capability Registry", source: "capabilities table", capabilities: 24, synced: true },
                { label: "Advisor Registry", source: "advisor_registry table", advisors: 8, synced: false },
                { label: "Connector Schema", source: "integration_providers", providers: 12, synced: true },
              ].map(item => (
                <Card key={item.label} className="bg-card/50 border-border/50">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[10px] font-semibold text-foreground">{item.label}</p>
                      {item.synced ? <CheckCircle className="w-3 h-3 text-green-400" /> : <AlertTriangle className="w-3 h-3 text-amber-400" />}
                    </div>
                    <p className="text-[9px] text-muted-foreground">{item.source}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </motion.div>
  );
}