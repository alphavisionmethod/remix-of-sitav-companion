// ═══════════════════════════════════════════════════════════════
// SITA OS — Advanced Trust Center
// Trust ladder, approval health, proof, verification, recovery
// ═══════════════════════════════════════════════════════════════

import { SitaCard, SitaCardTitle, SitaSectionHeader } from "@/components/sita/SitaCard";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTrustSummary, useRecoverySummary } from "@/hooks/use-mission-control-views";
import {
  Shield, CheckCircle, AlertTriangle, Lock, Eye, Zap,
  TrendingUp, Activity, FileCheck, RefreshCw, Users,
} from "lucide-react";

interface TrustLadderRung {
  level: number;
  name: string;
  description: string;
  current: boolean;
  achieved: boolean;
}

const ladder: TrustLadderRung[] = [
  { level: 1, name: "Basic Verification", description: "All actions produce receipts", current: false, achieved: true },
  { level: 2, name: "Policy Enforcement", description: "All domains have active policies", current: false, achieved: true },
  { level: 3, name: "Approval Governance", description: "High-risk actions require approval", current: false, achieved: true },
  { level: 4, name: "Proof Completeness", description: "95%+ actions have full proof chains", current: true, achieved: false },
  { level: 5, name: "Autonomous Trust", description: "System self-heals with verified rollbacks", current: false, achieved: false },
];

export default function OwnerTrustPage() {
  const trust = useTrustSummary();
  const recovery = useRecoverySummary();

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/5 via-card to-card p-6"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 shadow-lg shadow-primary/10">
            <Shield className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">Trust Center</h1>
            <p className="text-sm text-muted-foreground">Trust ladder, approval health, proof, verification posture</p>
          </div>
          <Badge variant="outline" className={cn("ml-auto text-sm", trust.overallScore >= 85 ? "bg-trust-verified/10 text-trust-safe" : "bg-accent/10 text-accent")}>
            Trust Score: {trust.overallScore}%
          </Badge>
        </div>
      </motion.div>

      {/* Trust metrics strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Overall Score", value: `${trust.overallScore}%`, icon: Shield },
          { label: "Approval Health", value: trust.approvalHealthLabel, icon: CheckCircle },
          { label: "Verification Rate", value: `${trust.verificationRate}%`, icon: FileCheck },
          { label: "Proof Completeness", value: `${trust.proofCompleteness}%`, icon: Lock },
          { label: "Recovery Ready", value: `${recovery.rollbackReady}`, icon: RefreshCw },
        ].map(k => (
          <div key={k.label} className="rounded-xl border border-border/50 bg-card/60 p-3 text-center">
            <k.icon className="h-4 w-4 text-primary mx-auto mb-1" />
            <p className="font-display text-lg font-bold text-foreground">{k.value}</p>
            <p className="text-[10px] text-muted-foreground">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Trust Ladder */}
      <SitaSectionHeader title="Trust Ladder" subtitle="Progressive trust maturity levels" />
      <SitaCard hover={false}>
        <div className="space-y-1">
          {ladder.map((rung, i) => (
            <motion.div key={rung.level} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              className={cn("flex items-center gap-4 rounded-xl p-4 transition-all",
                rung.current ? "border border-primary/20 bg-primary/5" : rung.achieved ? "bg-trust-verified/3" : "opacity-50"
              )}
            >
              <div className={cn("flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold shrink-0",
                rung.achieved ? "bg-trust-verified/10 text-trust-safe" : rung.current ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"
              )}>
                {rung.achieved ? <CheckCircle className="h-4 w-4" /> : rung.level}
              </div>
              <div className="flex-1">
                <p className={cn("text-sm font-semibold", rung.current ? "text-primary" : "text-foreground")}>{rung.name}</p>
                <p className="text-[11px] text-muted-foreground">{rung.description}</p>
              </div>
              {rung.current && <Badge className="bg-primary/10 text-primary text-[9px]">Current Level</Badge>}
              {rung.achieved && <Badge variant="outline" className="text-[9px] bg-trust-verified/10 text-trust-safe">Achieved</Badge>}
            </motion.div>
          ))}
        </div>
      </SitaCard>

      {/* Sensitive workflow warnings */}
      <SitaSectionHeader title="Sensitive Workflow Status" subtitle="Workflows requiring elevated trust" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {[
          { name: "Financial transfers > $5K", status: "approval-required", count: 3 },
          { name: "Connector credential rotation", status: "verified", count: 1 },
          { name: "Customer data export", status: "approval-required", count: 0 },
          { name: "Production deployment", status: "simulated-first", count: 2 },
        ].map(w => (
          <SitaCard key={w.name} hover className={cn(
            w.status === "approval-required" ? "border-accent/20" : w.status === "verified" ? "border-trust-verified/20" : "border-primary/15"
          )}>
            <div className="flex items-center gap-3">
              {w.status === "approval-required" ? <AlertTriangle className="h-4 w-4 text-accent shrink-0" /> :
               w.status === "verified" ? <CheckCircle className="h-4 w-4 text-trust-safe shrink-0" /> :
               <Eye className="h-4 w-4 text-primary shrink-0" />}
              <div className="flex-1">
                <p className="text-xs font-medium text-foreground">{w.name}</p>
                <p className="text-[10px] text-muted-foreground">{w.count} pending</p>
              </div>
              <Badge variant="outline" className="text-[9px]">{w.status.replace("-", " ")}</Badge>
            </div>
          </SitaCard>
        ))}
      </div>

      {/* Execution confidence */}
      <SitaCard hover={false}>
        <SitaCardTitle sub="Confidence by domain">Execution Confidence</SitaCardTitle>
        <div className="mt-3 space-y-3">
          {[
            { domain: "Finance", confidence: 96 },
            { domain: "Business", confidence: 93 },
            { domain: "Concierge", confidence: 89 },
            { domain: "System", confidence: 98 },
          ].map(d => (
            <div key={d.domain} className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-20">{d.domain}</span>
              <Progress value={d.confidence} className="h-2 flex-1" />
              <span className={cn("text-xs font-medium w-10 text-right", d.confidence >= 95 ? "text-trust-safe" : d.confidence >= 85 ? "text-primary" : "text-accent")}>{d.confidence}%</span>
            </div>
          ))}
        </div>
      </SitaCard>
    </div>
  );
}
