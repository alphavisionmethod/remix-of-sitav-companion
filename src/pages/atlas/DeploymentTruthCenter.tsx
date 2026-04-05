import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { SitaPageHeader } from "@/components/sita/SitaCard";
import { DegradedStateBanner } from "@/components/sita/truth/DegradedStateBanner";
import { StalenessIndicator } from "@/components/sita/truth/StalenessIndicator";
import {
  Rocket, Shield, CheckCircle, XCircle, AlertTriangle, Clock, Server,
  Lock, Key, Database, GitBranch, Activity, BarChart3, RotateCcw, Radio
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

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

export default function DeploymentTruthCenter() {
  const [tab, setTab] = useState("rings");

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto max-w-7xl space-y-6 p-6">
      <SitaPageHeader title="Deployment Truth Center" subtitle="Ring-based promotion, environment readiness, secret integrity, HA/DR evidence, and release verification" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Ring 0 Gates", value: `${rings[0].gates.filter(g => g.status === "passed").length}/${rings[0].gates.length}`, color: "text-blue-400" },
          { label: "Ring 1 Gates", value: `${rings[1].gates.filter(g => g.status === "passed").length}/${rings[1].gates.length}`, color: "text-amber-400" },
          { label: "Ring 2 Gates", value: `${rings[2].gates.filter(g => g.status === "passed").length}/${rings[2].gates.length}`, color: "text-green-400" },
          { label: "Environments Healthy", value: `${environments.filter(e => e.status === "healthy").length}/${environments.length}`, color: "text-green-400" },
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
            { value: "envs", label: "Environments", icon: Server },
            { value: "secrets", label: "Secret Integrity", icon: Key },
            { value: "hadr", label: "HA/DR Evidence", icon: Shield },
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
                        {gate.status === "passed" ? <CheckCircle className="w-3.5 h-3.5 text-green-400" /> : gate.status === "pending" ? <Clock className="w-3.5 h-3.5 text-muted-foreground" /> : <XCircle className="w-3.5 h-3.5 text-red-400" />}
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

          <TabsContent value="secrets">
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
          </TabsContent>

          <TabsContent value="hadr">
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
