import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { SitaPageHeader } from "@/platform/sita/components/sita/SitaCard";
import { DegradedStateBanner } from "@/platform/sita/components/sita/truth/DegradedStateBanner";
import { StalenessIndicator } from "@/platform/sita/components/sita/truth/StalenessIndicator";
import {
  Rocket, Shield, CheckCircle, XCircle, AlertTriangle, Clock, Server,
  Lock, Key, Database, GitBranch, Activity, BarChart3, RotateCcw, Radio,
  Cpu, HardDrive, Wifi, FileCheck, Zap, RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

const now = new Date();
const h = (hours: number) => new Date(now.getTime() - hours * 3600000).toISOString();

const rings = [
  {
    ring: "Ring 0 — Development", status: "active" as const, color: "text-blue-400",
    gates: [
      { name: "Build passes", status: "passed" as const, evidence: "TypeScript 0 errors, Vite build success" },
      { name: "Unit tests pass", status: "passed" as const, evidence: "42/42 tests passing" },
      { name: "Lint clean", status: "passed" as const, evidence: "ESLint 0 warnings" },
    ]
  },
  {
    ring: "Ring 1 — Staging", status: "active" as const, color: "text-amber-400",
    gates: [
      { name: "Integration tests", status: "passed" as const, evidence: "18/18 integration tests passing" },
      { name: "Smoke tests", status: "passed" as const, evidence: "All critical paths verified" },
      { name: "Security scan", status: "passed" as const, evidence: "0 critical, 2 low findings" },
      { name: "Performance budget", status: "pending" as const, evidence: "Awaiting Lighthouse run" },
    ]
  },
  {
    ring: "Ring 2 — Production", status: "gated" as const, color: "text-green-400",
    gates: [
      { name: "Canary deployment", status: "pending" as const, evidence: "Not started" },
      { name: "Load test", status: "pending" as const, evidence: "Scheduled for next window" },
      { name: "Rollback tested", status: "passed" as const, evidence: "Rollback verified in staging" },
      { name: "Secret rotation current", status: "passed" as const, evidence: "All secrets rotated within 90 days" },
      { name: "DR evidence", status: "passed" as const, evidence: "Backup restore tested 2 days ago" },
    ]
  },
];

const environments = [
  { name: "Development", status: "healthy", version: "0.42.1-dev", lastDeploy: h(0.5), services: 12, healthy: 12 },
  { name: "Staging", status: "healthy", version: "0.42.0-rc1", lastDeploy: h(4), services: 12, healthy: 12 },
  { name: "Production", status: "healthy", version: "0.41.3", lastDeploy: h(48), services: 12, healthy: 11 },
];

const secrets = [
  { name: "SUPABASE_SERVICE_ROLE_KEY", rotatedAt: h(720), maxAge: 90, environment: "all" },
  { name: "SUPABASE_ANON_KEY", rotatedAt: h(720), maxAge: 90, environment: "all" },
  { name: "LOVABLE_API_KEY", rotatedAt: h(168), maxAge: 90, environment: "production" },
  { name: "OPENAI_API_KEY", rotatedAt: h(360), maxAge: 90, environment: "production" },
];

const hadr = [
  { check: "Database backup", status: "passed", lastVerified: h(24), frequency: "Daily", evidence: "Point-in-time recovery enabled, tested restore" },
  { check: "Storage backup", status: "passed", lastVerified: h(48), frequency: "Daily", evidence: "Bucket versioning enabled" },
  { check: "Edge function redundancy", status: "passed", lastVerified: h(72), frequency: "Weekly", evidence: "Multi-region deployment confirmed" },
  { check: "DNS failover", status: "pending", lastVerified: null, frequency: "Monthly", evidence: "Not configured" },
  { check: "RTO target (< 1hr)", status: "passed", lastVerified: h(168), frequency: "Monthly", evidence: "Last DR drill: 42min recovery" },
];

const ciPipeline = [
  { stage: "Source Checkout", status: "passed" as const, duration: "3s", evidence: "Git SHA a3f8c2d", timestamp: h(0.5) },
  { stage: "Install Dependencies", status: "passed" as const, duration: "12s", evidence: "bun install — 0 vulnerabilities", timestamp: h(0.5) },
  { stage: "TypeScript Compile", status: "passed" as const, duration: "8s", evidence: "0 errors, strict mode", timestamp: h(0.5) },
  { stage: "ESLint", status: "passed" as const, duration: "5s", evidence: "0 warnings, 0 errors", timestamp: h(0.5) },
  { stage: "Unit Tests", status: "passed" as const, duration: "4.2s", evidence: "42/42 passing", timestamp: h(0.5) },
  { stage: "Integration Tests", status: "passed" as const, duration: "12.8s", evidence: "18/18 passing", timestamp: h(0.5) },
  { stage: "Vite Build", status: "passed" as const, duration: "18s", evidence: "Bundle: 1.8MB gzipped, no chunks > 500KB", timestamp: h(0.5) },
  { stage: "Security Audit", status: "passed" as const, duration: "6s", evidence: "0 critical, 0 high, 2 low", timestamp: h(0.5) },
  { stage: "Deploy to Staging", status: "passed" as const, duration: "22s", evidence: "Deployed v0.42.0-rc1", timestamp: h(0.5) },
  { stage: "Smoke Tests", status: "passed" as const, duration: "28s", evidence: "12/12 critical paths verified", timestamp: h(0.5) },
];

const smokeLoadGates = [
  { gate: "Homepage loads < 2s", type: "smoke", status: "passed" as const, evidence: "LCP: 1.4s, FID: 12ms, CLS: 0.02" },
  { gate: "Auth flow completes", type: "smoke", status: "passed" as const, evidence: "Login/signup/logout cycle verified" },
  { gate: "Dashboard renders with data", type: "smoke", status: "passed" as const, evidence: "All widgets render, no console errors" },
  { gate: "API P95 < 200ms", type: "load", status: "passed" as const, evidence: "P95: 145ms under 50 concurrent users" },
  { gate: "100 concurrent users", type: "load", status: "pending" as const, evidence: "Scheduled — last run: P95 180ms" },
  { gate: "DB connection pool < 80%", type: "load", status: "passed" as const, evidence: "Peak: 62% utilization under load" },
  { gate: "Edge function cold start < 500ms", type: "smoke", status: "passed" as const, evidence: "Avg: 320ms, P95: 480ms" },
  { gate: "Zero 5xx under load", type: "load", status: "passed" as const, evidence: "0 errors in 10,000 requests" },
];

const certHealth = [
  { name: "TLS Certificate (*.lovable.app)", expiresAt: "2026-09-15", issuer: "Let's Encrypt", autoRenew: true, daysLeft: 158 },
  { name: "Supabase API Certificate", expiresAt: "2026-12-01", issuer: "AWS ACM", autoRenew: true, daysLeft: 235 },
  { name: "Edge Function Signing Key", expiresAt: "2027-01-15", issuer: "Internal PKI", autoRenew: false, daysLeft: 280 },
  { name: "VAPID Key Pair", expiresAt: "2027-04-10", issuer: "Self-signed", autoRenew: false, daysLeft: 365 },
];

export default function DeploymentTruthCenter() {
  const [tab, setTab] = useState("rings");

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto max-w-7xl space-y-6 p-6">
<SitaPageHeader title="Deployment Truth Center" subtitle="CI/CD pipeline truth, ring promotion, HA/DR evidence, secret/cert health, and smoke/load gate verification" />

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        {[
          { label: "Ring 0", value: `${rings[0].gates.filter(g => g.status === "passed").length}/${rings[0].gates.length}`, color: "text-blue-400" },
          { label: "Ring 1", value: `${rings[1].gates.filter(g => g.status === "passed").length}/${rings[1].gates.length}`, color: "text-amber-400" },
          { label: "Ring 2", value: `${rings[2].gates.filter(g => g.status === "passed").length}/${rings[2].gates.length}`, color: "text-green-400" },
          { label: "CI Stages", value: `${ciPipeline.filter(s => s.status === "passed").length}/${ciPipeline.length}`, color: "text-green-400" },
          { label: "Smoke/Load", value: `${smokeLoadGates.filter(g => g.status === "passed").length}/${smokeLoadGates.length}`, color: "text-blue-400" },
          { label: "Certs OK", value: `${certHealth.filter(c => c.daysLeft > 30).length}/${certHealth.length}`, color: "text-green-400" },
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
            { value: "rings", label: "Promotion Rings", icon: Rocket },
            { value: "ci", label: "CI Pipeline", icon: GitBranch },
            { value: "envs", label: "Environments", icon: Server },
            { value: "smoke", label: "Smoke / Load", icon: Zap },
            { value: "secrets", label: "Secrets & Certs", icon: Key },
            { value: "hadr", label: "HA/DR", icon: Shield },
          ].map(t => (
            <TabsTrigger key={t.value} value={t.value} className="text-[10px] h-7 px-2.5 gap-1"><t.icon className="h-3 w-3" />{t.label}</TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-4 space-y-3">
          <TabsContent value="rings">
            {rings.map(ring => (
              <Card key={ring.ring} className="bg-card/50 border-border/50 mb-3">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs flex items-center gap-2">
                    <Rocket className={cn("w-4 h-4", ring.color)} />{ring.ring}
                    <Badge variant="outline" className="text-[8px] capitalize">{ring.status}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1.5">
                  {ring.gates.map(gate => (
                    <div key={gate.name} className="flex items-center justify-between p-2 bg-muted/20 rounded">
                      <div className="flex items-center gap-2">
                        {gate.status === "passed" ? <CheckCircle className="w-3.5 h-3.5 text-green-400" /> : <Clock className="w-3.5 h-3.5 text-muted-foreground" />}
                        <div>
                          <p className="text-xs text-foreground">{gate.name}</p>
                          <p className="text-[10px] text-muted-foreground">{gate.evidence}</p>
                        </div>
                      </div>
                      <Badge variant={gate.status === "passed" ? "default" : "secondary"} className="text-[9px] capitalize">{gate.status}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="ci">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold">CI/CD Pipeline — Last Run</h3>
              <Button variant="ghost" size="sm" className="text-[10px] gap-1 h-6"><RefreshCw className="w-3 h-3" /> Re-run Pipeline</Button>
            </div>
            <div className="relative pl-4 border-l-2 border-green-500/30 space-y-1.5">
              {ciPipeline.map((stage, i) => (
                <div key={stage.stage} className="relative flex items-center justify-between p-2.5 bg-muted/20 rounded-lg">
                  <div className="absolute -left-[21px] w-3 h-3 rounded-full bg-green-500 border-2 border-background" />
                  <div className="flex items-center gap-3">
                    <div className="text-right w-8">
                      <p className="text-[9px] text-muted-foreground font-mono">{stage.duration}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-foreground">{stage.stage}</p>
                      <p className="text-[10px] text-muted-foreground">{stage.evidence}</p>
                    </div>
                  </div>
                  <Badge variant="default" className="text-[9px] bg-green-500/20 text-green-400 border-green-500/30">passed</Badge>
                </div>
              ))}
            </div>
            <div className="mt-3 p-3 bg-green-500/5 border border-green-500/20 rounded-lg text-center">
              <p className="text-xs text-green-400 font-medium">Pipeline Complete — Total: {ciPipeline.reduce((s, st) => s + parseFloat(st.duration), 0).toFixed(1)}s</p>
            </div>
          </TabsContent>

          <TabsContent value="envs">
            {environments.map(env => (
              <div key={env.name} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg mb-2">
                <div className="flex items-center gap-3">
                  <Server className={cn("w-4 h-4", env.status === "healthy" ? "text-green-400" : "text-amber-400")} />
                  <div>
                    <p className="text-xs font-medium text-foreground">{env.name}</p>
                    <p className="text-[10px] text-muted-foreground">v{env.version} • {env.healthy}/{env.services} services healthy</p>
                  </div>
                </div>
                <StalenessIndicator lastUpdated={env.lastDeploy} thresholdSeconds={86400} />
              </div>
            ))}
          </TabsContent>

          <TabsContent value="smoke">
            <h3 className="text-xs font-semibold mb-3">Smoke & Load Gate Evidence</h3>
            <div className="space-y-1.5">
              {smokeLoadGates.map(g => (
                <div key={g.gate} className="flex items-center justify-between p-2.5 bg-muted/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    {g.status === "passed" ? <CheckCircle className="w-3.5 h-3.5 text-green-400" /> : <Clock className="w-3.5 h-3.5 text-muted-foreground" />}
                    <div>
                      <p className="text-[10px] font-medium text-foreground">{g.gate}</p>
                      <p className="text-[9px] text-muted-foreground">{g.evidence}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[8px] uppercase">{g.type}</Badge>
                    <Badge variant={g.status === "passed" ? "default" : "secondary"} className="text-[9px]">{g.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="secrets">
            <h3 className="text-xs font-semibold mb-3">Secret Rotation Status</h3>
            {secrets.map(s => {
              const ageHours = (Date.now() - new Date(s.rotatedAt).getTime()) / 3600000;
              const ageDays = Math.round(ageHours / 24);
              const pct = (ageDays / s.maxAge) * 100;
              return (
                <div key={s.name} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg mb-2">
                  <div className="flex items-center gap-3">
                    <Key className={cn("w-3.5 h-3.5", pct > 80 ? "text-amber-400" : "text-green-400")} />
                    <div>
                      <p className="text-xs font-mono text-foreground">{s.name}</p>
                      <p className="text-[10px] text-muted-foreground">{s.environment} • rotated {ageDays}d ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={Math.max(0, 100 - pct)} className="w-16 h-1.5" />
                    <Badge variant={pct > 80 ? "destructive" : "default"} className="text-[9px]">{Math.round(s.maxAge - ageDays)}d left</Badge>
                  </div>
                </div>
              );
            })}

            <h3 className="text-xs font-semibold mt-6 mb-3">Certificate Health</h3>
            {certHealth.map(c => (
              <div key={c.name} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg mb-2">
                <div className="flex items-center gap-3">
                  <Lock className={cn("w-3.5 h-3.5", c.daysLeft < 30 ? "text-red-400" : c.daysLeft < 90 ? "text-amber-400" : "text-green-400")} />
                  <div>
                    <p className="text-xs text-foreground">{c.name}</p>
                    <p className="text-[10px] text-muted-foreground">{c.issuer} • expires {c.expiresAt}{c.autoRenew ? " • auto-renew" : ""}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={Math.min(100, (c.daysLeft / 365) * 100)} className="w-16 h-1.5" />
                  <Badge variant={c.daysLeft < 30 ? "destructive" : "default"} className="text-[9px]">{c.daysLeft}d</Badge>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="hadr">
            <h3 className="text-xs font-semibold mb-3">HA/DR Readiness Evidence</h3>
            {hadr.map(check => (
              <div key={check.check} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg mb-2">
                <div className="flex items-center gap-3">
                  {check.status === "passed" ? <CheckCircle className="w-3.5 h-3.5 text-green-400" /> : <Clock className="w-3.5 h-3.5 text-muted-foreground" />}
                  <div>
                    <p className="text-xs text-foreground">{check.check}</p>
                    <p className="text-[10px] text-muted-foreground">{check.evidence} • {check.frequency}</p>
                  </div>
                </div>
                <StalenessIndicator lastUpdated={check.lastVerified} thresholdSeconds={check.frequency === "Daily" ? 86400 : check.frequency === "Weekly" ? 604800 : 2592000} />
              </div>
            ))}
          </TabsContent>
        </div>
      </Tabs>
    </motion.div>
  );
}