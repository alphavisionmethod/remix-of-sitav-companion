// ═══════════════════════════════════════════════════════════════
// SITA OS — Release Detail Page
// Summary, scope, rollout, canary, rollback, trust impact
// ═══════════════════════════════════════════════════════════════

import { useParams, useNavigate } from "react-router-dom";
import { SitaCard, SitaCardTitle, SitaSectionHeader } from "@/components/sita/SitaCard";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Rocket, ChevronLeft, CheckCircle, AlertTriangle, Shield, Wifi,
  RotateCcw, Play, Pause, Server, Clock, Users, Zap, Eye,
} from "lucide-react";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";

const releaseData = {
  id: "rel-241",
  version: "v2.4.1",
  title: "Connector Improvements & Trust Hardening",
  status: "canary" as const,
  rolloutPercent: 15,
  canaryHealth: 98.5,
  createdAt: new Date(Date.now() - 7200000).toISOString(),
  environments: ["staging", "canary", "production"],
  modules: [
    { name: "Connector Gateway", change: "Retry logic improvement", risk: "medium" },
    { name: "Trust Auditor", change: "New RLS policy generation", risk: "high" },
    { name: "Receipt Service", change: "Chain integrity optimization", risk: "low" },
  ],
  incidents: [] as string[],
  rollbackReady: true,
  trustImpact: "+1.2% projected trust score improvement",
  costImpact: "−$45/mo projected from retry optimization",
  ownerApprovalRequired: true,
  notes: "This release improves connector reliability and hardens trust policies. Canary looks healthy after 2 hours.",
};

export default function MissionReleaseDetailPage() {
  const { releaseId } = useParams();
  const navigate = useNavigate();
  const r = releaseData; // In production: fetch by releaseId

  return (
    <div className="p-4 md:p-6 max-w-[1200px] mx-auto space-y-6">
<motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/5 via-card to-card p-6"
      >
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/50 hover:bg-secondary transition-colors">
            <ChevronLeft className="h-5 w-5 text-muted-foreground" />
          </button>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 shadow-lg shadow-primary/10">
            <Rocket className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">{r.version}</h1>
            <p className="text-sm text-muted-foreground">{r.title}</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Badge className={cn("text-xs", r.status === "canary" ? "bg-accent/10 text-accent" : "bg-trust-verified/10 text-trust-safe")}>{r.status}</Badge>
            {r.rollbackReady && <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary">Rollback Ready</Badge>}
          </div>
        </div>
      </motion.div>

      {/* Rollout state */}
      <SitaCard hover={false}>
        <SitaCardTitle sub="Current deployment state">Rollout Progress</SitaCardTitle>
        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground w-24">Rollout</span>
            <Progress value={r.rolloutPercent} className="h-2.5 flex-1" />
            <span className="text-sm font-bold text-foreground w-12 text-right">{r.rolloutPercent}%</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground w-24">Canary Health</span>
            <Progress value={r.canaryHealth} className="h-2.5 flex-1" />
            <span className="text-sm font-bold text-trust-safe w-12 text-right">{r.canaryHealth}%</span>
          </div>
          <div className="flex gap-2 mt-3">
            {r.environments.map(env => (
              <Badge key={env} variant="outline" className={cn("text-[10px]",
                env === "canary" ? "bg-accent/10 text-accent border-accent/20" :
                env === "production" ? "bg-muted text-muted-foreground" : "bg-trust-verified/10 text-trust-safe"
              )}>{env}</Badge>
            ))}
          </div>
        </div>
      </SitaCard>

      {/* Modules impacted */}
      <SitaSectionHeader title="Modules Impacted" subtitle={`${r.modules.length} modules in this release`} />
      <div className="space-y-2">
        {r.modules.map((m, i) => (
          <motion.div key={m.name} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
            <SitaCard hover className={cn(m.risk === "high" ? "border-accent/20" : "")}>
              <div className="flex items-center gap-3">
                <Server className="h-4 w-4 text-primary shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-foreground">{m.name}</p>
                  <p className="text-[10px] text-muted-foreground">{m.change}</p>
                </div>
                <Badge variant="outline" className={cn("text-[9px]",
                  m.risk === "high" ? "bg-accent/10 text-accent" : m.risk === "medium" ? "bg-primary/10 text-primary" : ""
                )}>{m.risk} risk</Badge>
              </div>
            </SitaCard>
          </motion.div>
        ))}
      </div>

      {/* Impact summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SitaCard hover={false}>
          <SitaCardTitle sub="Projected change">Trust Impact</SitaCardTitle>
          <div className="mt-3 flex items-center gap-2">
            <Shield className="h-5 w-5 text-trust-safe" />
            <p className="text-sm text-foreground">{r.trustImpact}</p>
          </div>
        </SitaCard>
        <SitaCard hover={false}>
          <SitaCardTitle sub="Projected savings">Cost Impact</SitaCardTitle>
          <div className="mt-3 flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <p className="text-sm text-foreground">{r.costImpact}</p>
          </div>
        </SitaCard>
      </div>

      {/* Release controls */}
      <SitaCard hover={false} className="border-primary/10 bg-gradient-to-br from-primary/3 to-card">
        <SitaCardTitle sub="Owner release actions">Release Controls</SitaCardTitle>
        <div className="mt-4 flex flex-wrap gap-3">
          <button className="flex items-center gap-2 rounded-xl bg-trust-verified/10 px-4 py-2.5 text-xs font-medium text-trust-safe hover:bg-trust-verified/20 transition-colors">
            <Play className="h-3.5 w-3.5" /> Advance Rollout
          </button>
          <button className="flex items-center gap-2 rounded-xl bg-accent/10 px-4 py-2.5 text-xs font-medium text-accent hover:bg-accent/20 transition-colors">
            <Pause className="h-3.5 w-3.5" /> Pause Rollout
          </button>
          <button className="flex items-center gap-2 rounded-xl bg-destructive/10 px-4 py-2.5 text-xs font-medium text-destructive hover:bg-destructive/20 transition-colors">
            <RotateCcw className="h-3.5 w-3.5" /> Rollback
          </button>
          <button className="flex items-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
            <Eye className="h-3.5 w-3.5" /> View Simulation
          </button>
        </div>
        {r.ownerApprovalRequired && (
          <div className="mt-3 flex items-center gap-2 text-[10px] text-accent">
            <AlertTriangle className="h-3 w-3" /> Owner approval required to advance beyond canary
          </div>
        )}
      </SitaCard>

      {/* Notes */}
      <SitaCard hover={false}>
        <SitaCardTitle>Release Notes</SitaCardTitle>
        <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{r.notes}</p>
        <p className="mt-2 text-[10px] text-muted-foreground">Created {new Date(r.createdAt).toLocaleString()}</p>
      </SitaCard>
    </div>
  );
}
