// ═══════════════════════════════════════════════════════════════
// SITA OS — APP01 Appliance Deployability Center
// Phase 15 — live 12-item VMware / ISO / Appliance scoreboard.
// Route: /admin/appliance/deployability (gated by audit.view)
// ═══════════════════════════════════════════════════════════════

import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Server, CheckCircle2, AlertCircle, Clock, XCircle, HardDrive, Network } from "lucide-react";
import { applianceReadinessSummary } from "@/lib/runtime/appliance/release";
import type {
  ApplianceReadinessItem,
  ApplianceReadinessStatus,
} from "@/lib/runtime/appliance/release";
import { APPLIANCE_RUNTIME_CONTRACT } from "@/lib/runtime/appliance/appliance-runtime-contract";

const STATUS_VARIANT: Record<ApplianceReadinessStatus, "default" | "secondary" | "outline" | "destructive"> = {
  ready: "default",
  partial: "secondary",
  deferred: "outline",
  missing: "destructive",
};

const STATUS_ICON: Record<ApplianceReadinessStatus, React.ComponentType<{ className?: string }>> = {
  ready: CheckCircle2,
  partial: AlertCircle,
  deferred: Clock,
  missing: XCircle,
};

function ItemRow({ item }: { item: ApplianceReadinessItem }) {
  const Icon = STATUS_ICON[item.status];
  return (
    <div className="flex items-start gap-3 rounded-md border border-border bg-card/50 px-3 py-2.5">
      <Icon className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-foreground">{item.title}</span>
          <Badge variant={STATUS_VARIANT[item.status]} className="text-[10px] uppercase">
            {item.status}
          </Badge>
          {item.blocker && item.status !== "ready" && (
            <Badge variant="destructive" className="text-[10px]">
              blocker
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1 break-words">{item.evidence}</p>
        {item.remediation && (
          <p className="text-xs text-muted-foreground mt-1 italic">↳ {item.remediation}</p>
        )}
      </div>
    </div>
  );
}

export default function APP01ApplianceDeployabilityCenter() {
  const summary = useMemo(() => applianceReadinessSummary(), []);
  const pct = Math.round((summary.ready / summary.total) * 100);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Appliance Deployability</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Live 12-item VMware / ISO / Appliance Checklist (Phase 15).
        </p>
      </div>

      {/* Aggregate verdict */}
      <Card className={summary.ok ? "border-primary/50" : "border-destructive/50"}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {summary.ok ? (
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                ) : (
                  <XCircle className="h-5 w-5 text-destructive" />
                )}
                Aggregate Verdict
              </CardTitle>
              <CardDescription>
                {summary.ok
                  ? "Appliance ready: ISO/OVA pipelines real, first-boot deterministic, OTA + recovery wired, claims truthful."
                  : "One or more appliance items have unresolved blockers."}
              </CardDescription>
            </div>
            <Badge variant={summary.ok ? "default" : "destructive"} className="text-sm">
              {summary.ok ? "READY" : "BLOCKED"}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Health strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Build Pipelines</p>
            <p className="text-sm font-medium mt-1">ISO (xorriso) · OVA (qemu-img + OVF)</p>
            <Badge variant="default" className="mt-2 text-[10px]">
              <HardDrive className="h-3 w-3 mr-1" />
              Reproducible
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">First Boot</p>
            <p className="text-sm font-medium mt-1">
              {APPLIANCE_RUNTIME_CONTRACT.firstBootPhases.length} phases ·{" "}
              {APPLIANCE_RUNTIME_CONTRACT.runtimeServices.length} services
            </p>
            <Badge variant="default" className="mt-2 text-[10px]">
              <Network className="h-3 w-3 mr-1" />
              Deterministic order
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Honesty</p>
            <p className="text-sm font-medium mt-1">
              {APPLIANCE_RUNTIME_CONTRACT.honestCapabilities.length} honest ·{" "}
              {APPLIANCE_RUNTIME_CONTRACT.roadmapCapabilities.length} roadmap
            </p>
            <Badge variant="default" className="mt-2 text-[10px]">
              No overclaims
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Scoreboard */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Appliance — VMware / ISO Runtime (Tier 3)
            </CardTitle>
            <Badge variant={summary.ok ? "default" : "destructive"}>
              {summary.ok ? "READY" : "BLOCKED"}
            </Badge>
          </div>
          <CardDescription>
            {summary.ready}/{summary.total} ready · {summary.partial} partial · {summary.deferred} deferred ·{" "}
            {summary.missing} missing
          </CardDescription>
          <Progress value={pct} className="mt-2 h-1.5" />
        </CardHeader>
        <CardContent className="space-y-2">
          {summary.items.map((it) => (
            <ItemRow key={it.id} item={it} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
