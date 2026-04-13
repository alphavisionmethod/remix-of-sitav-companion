import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { SitaPageHeader } from "@/components/sita/SitaCard";
import { useNavigate } from "react-router-dom";
import {
  Activity, Shield, Database, Rocket, Plug, Briefcase, FileCheck, Lock,
  CheckCircle, GitBranch, Eye, Layers, BarChart3, AlertTriangle, Cpu, Server
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";

const surfaces = [
  { id: "ops", label: "Operations Command Center", desc: "Service health, SLO burn, alerts, incidents, runbooks", route: "/atlas/operations", icon: Activity, status: "live", metrics: "6 services • 5 SLOs • 8 runbooks", health: 96 },
  { id: "admin", label: "Admin Durability Board", desc: "Write-path durability, mutation provenance, audit lineage", route: "/atlas/admin", icon: Shield, status: "live", metrics: "9 write paths • 8 mutations tracked", health: 100 },
  { id: "proj", label: "Projection Control Center", desc: "Read-model freshness, truth classification, rebuild queue", route: "/atlas/projections", icon: Database, status: "live", metrics: "14 projections • 8 surfaces classified", health: 78 },
  { id: "proof", label: "Proof Coverage Board", desc: "Canonical chain, replay/rollback verification, proof gaps", route: "/atlas/proof", icon: GitBranch, status: "live", metrics: "29 capabilities • 8 domains • chain explorer", health: 95 },
  { id: "deploy", label: "Deployment Truth Center", desc: "Ring promotion, CI/CD truth, HA/DR, cert/secret health", route: "/atlas/deployment", icon: Rocket, status: "live", metrics: "3 rings • 10 CI stages • 4 certs", health: 92 },
  { id: "conn", label: "Connector Control Center", desc: "Connector lifecycle, health matrix, capability registry", route: "/atlas/connectors", icon: Plug, status: "live", metrics: "5 connectors • lifecycle FSM • audit timeline", health: 88 },
  { id: "conc", label: "Concierge Command Center", desc: "Task continuity, SLA tracking, cross-module health", route: "/atlas/concierge", icon: Briefcase, status: "live", metrics: "5 tasks • 6 continuity checks • 5 SLAs", health: 90 },
  { id: "truth", label: "Platform Truth Registry", desc: "Manifest sync, arch gates, docs drift, generated truth", route: "/atlas/truth-registry", icon: Eye, status: "live", metrics: "7 manifests • 8 arch gates • 10 claims", health: 85 },
  { id: "sec", label: "Data Protection Posture", desc: "Encryption, key rotation, compliance, data classification", route: "/atlas/data-protection", icon: Lock, status: "live", metrics: "8 domains • 5 keys • 7 compliance items", health: 97 },
  { id: "val", label: "Validation Command Center", desc: "Test coverage, cross-domain E2E, arch gates, blockers", route: "/atlas/validation", icon: CheckCircle, status: "live", metrics: "109 tests • 8 cross-domain • 7 arch gates", health: 91 },
  { id: "infra", label: "Operational Infra Monitor", desc: "DB pools, replica lag, cert expiry, storage pressure", route: "/atlas/infrastructure", icon: Server, status: "live", metrics: "6 infra checks • pool/lag/cert/storage", health: 94 },
];

const aggregateHealth = Math.round(surfaces.reduce((s, p) => s + p.health, 0) / surfaces.length);

const recentActivity = [
  { action: "CI pipeline passed (10/10 stages)", time: "30m ago", program: "deploy" },
  { action: "Projection rebuild queued: cross-domain-kpis", time: "1h ago", program: "proj" },
  { action: "Secret rotation verified for LOVABLE_API_KEY", time: "2h ago", program: "sec" },
  { action: "Cross-domain E2E: 7/8 flows verified", time: "3h ago", program: "val" },
  { action: "Concierge SLA missed: Medical Scheduling", time: "4h ago", program: "conc" },
];

export default function AtlasHub() {
  const navigate = useNavigate();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto max-w-7xl space-y-6 p-6">
<SitaPageHeader title="ATLAS Closure Program" subtitle="Unified operator truth layer — aggregate health, program progress, cross-program dependencies, and recent activity" />

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-2">
        {[
          { label: "Aggregate Health", value: `${aggregateHealth}%`, color: aggregateHealth >= 90 ? "text-green-400" : "text-amber-400" },
          { label: "Programs Active", value: surfaces.length, color: "text-green-400" },
          { label: "Programs ≥ 95%", value: surfaces.filter(s => s.health >= 95).length, color: "text-blue-400" },
          { label: "Programs < 85%", value: surfaces.filter(s => s.health < 85).length, color: surfaces.some(s => s.health < 85) ? "text-red-400" : "text-green-400" },
          { label: "Status", value: "Live", color: "text-green-400" },
        ].map((k, i) => (
          <Card key={i} className="bg-card/50 border-border/50">
            <CardContent className="p-3 text-center">
              <p className={cn("text-2xl font-bold", k.color)}>{k.value}</p>
              <p className="text-[9px] text-muted-foreground">{k.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Aggregate closure progress */}
      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-foreground">Overall Closure Progress</p>
            <p className={cn("text-sm font-bold", aggregateHealth >= 90 ? "text-green-400" : "text-amber-400")}>{aggregateHealth}%</p>
          </div>
          <Progress value={aggregateHealth} className="h-2 mb-3" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {surfaces.map(s => (
              <div key={s.id} className="flex items-center gap-2 cursor-pointer hover:bg-muted/20 rounded p-1.5 transition-colors" onClick={() => navigate(s.route)}>
                <div className={cn("w-2 h-2 rounded-full", s.health >= 95 ? "bg-green-400" : s.health >= 85 ? "bg-amber-400" : "bg-red-400")} />
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] text-foreground truncate">{s.label.replace(" Command Center", "").replace(" Control Center", "").replace(" Truth Center", "").replace(" Posture Board", "").replace(" Coverage Board", "")}</p>
                </div>
                <p className={cn("text-[9px] font-bold", s.health >= 95 ? "text-green-400" : s.health >= 85 ? "text-amber-400" : "text-red-400")}>{s.health}%</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent activity feed */}
      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-4">
          <p className="text-xs font-semibold text-foreground mb-3">Recent Closure Activity</p>
          <div className="space-y-2">
            {recentActivity.map((a, i) => (
              <div key={i} className="flex items-center justify-between p-2 bg-muted/20 rounded">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <p className="text-[10px] text-foreground">{a.action}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[8px]">{a.program}</Badge>
                  <p className="text-[9px] text-muted-foreground">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {surfaces.map((s, idx) => (
          <motion.div key={s.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}>
            <Card
              className="bg-card/50 border-border/50 cursor-pointer hover:bg-muted/30 hover:border-primary/30 transition-all group"
              onClick={() => navigate(s.route)}
            >
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <s.icon className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                    <p className="text-xs font-semibold text-foreground">{s.label}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Progress value={s.health} className="w-10 h-1.5" />
                    <Badge variant="default" className={cn("text-[8px]", s.health >= 95 ? "bg-green-500/20 text-green-400 border-green-500/30" : s.health >= 85 ? "bg-amber-500/20 text-amber-400 border-amber-500/30" : "bg-red-500/20 text-red-400 border-red-500/30")}>{s.health}%</Badge>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed">{s.desc}</p>
                <p className="text-[9px] text-primary/70">{s.metrics}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}