import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SitaPageHeader } from "@/components/sita/SitaCard";
import { useNavigate } from "react-router-dom";
import {
  Activity, Shield, Database, Rocket, Plug, Briefcase, FileCheck, Lock,
  CheckCircle, GitBranch, Eye, Layers, BarChart3, AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";

const surfaces = [
  { id: "ops", label: "Operations Command Center", desc: "Service health, SLO burn, alerts, incidents, runbooks", route: "/atlas/operations", icon: Activity, status: "live", metrics: "6 services • 5 SLOs • 8 runbooks" },
  { id: "admin", label: "Admin Durability Board", desc: "Write-path durability, mutation provenance, audit lineage", route: "/atlas/admin", icon: Shield, status: "live", metrics: "9 write paths • 8 mutations tracked" },
  { id: "proj", label: "Projection Control Center", desc: "Read-model freshness, truth classification, rebuild queue", route: "/atlas/projections", icon: Database, status: "live", metrics: "14 projections • 8 surfaces classified" },
  { id: "proof", label: "Proof Coverage Board", desc: "Canonical chain, replay/rollback verification, proof gaps", route: "/atlas/proof", icon: GitBranch, status: "live", metrics: "29 capabilities • 8 domains • chain explorer" },
  { id: "deploy", label: "Deployment Truth Center", desc: "Ring promotion, environment gates, secret integrity, HA/DR", route: "/atlas/deployment", icon: Rocket, status: "live", metrics: "3 rings • 3 environments • 5 HA/DR checks" },
  { id: "conn", label: "Connector Control Center", desc: "Connector lifecycle, health matrix, capability registry", route: "/atlas/connectors", icon: Plug, status: "live", metrics: "5 connectors • lifecycle FSM • audit timeline" },
  { id: "conc", label: "Concierge Command Center", desc: "Task continuity, household state, travel execution", route: "/atlas/concierge", icon: Briefcase, status: "live", metrics: "5 tasks • travel itinerary • receipt feed" },
  { id: "truth", label: "Platform Truth Registry", desc: "Manifest sync, capability claim verification, docs drift", route: "/atlas/truth-registry", icon: Eye, status: "live", metrics: "7 manifests • 10 claims • 6 docs sections" },
  { id: "sec", label: "Data Protection Posture", desc: "Encryption coverage, secret integrity, sensitive data", route: "/atlas/data-protection", icon: Lock, status: "live", metrics: "8 domains • 4 secrets • 8 policies" },
  { id: "val", label: "Validation Command Center", desc: "Test coverage, readiness scores, launch blockers", route: "/atlas/validation", icon: CheckCircle, status: "live", metrics: "109 tests • 12 readiness items • 6 blockers" },
];

export default function AtlasHub() {
  const navigate = useNavigate();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto max-w-7xl space-y-6 p-6">
      <DemoModeBadge />
      <SitaPageHeader title="ATLAS Closure Program" subtitle="Unified operator truth layer — admin durability, projection truth, proof coverage, deployment gates, ops command, and launch readiness" />

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-2">
        {[
          { label: "Operator Surfaces", value: surfaces.length, color: "text-primary" },
          { label: "Programs Active", value: "A–J", color: "text-green-400" },
          { label: "Components", value: 19, color: "text-blue-400" },
          { label: "DB Tables", value: 6, color: "text-foreground" },
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
                  <Badge variant="default" className="text-[8px] bg-green-500/20 text-green-400 border-green-500/30">{s.status}</Badge>
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
