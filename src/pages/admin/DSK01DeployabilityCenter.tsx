// ═══════════════════════════════════════════════════════════════
// SITA OS — DSK01 Desktop Deployability Center
// Phase 14 — live 11-item Desktop / Electron deployability scoreboard.
// Route: /admin/desktop/deployability (gated by audit.view)
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
import { Monitor, CheckCircle2, AlertCircle, Clock, XCircle, Shield, Lock } from "lucide-react";
import { desktopReadinessSummary } from "@/lib/runtime/desktop/release";
import type {
  DesktopReadinessItem,
  DesktopReadinessStatus,
} from "@/lib/runtime/desktop/release";
import { BRIDGE_METHOD_COUNT } from "@/lib/runtime/desktop/electron-bridge-contract";

const STATUS_VARIANT: Record<DesktopReadinessStatus, "default" | "secondary" | "outline" | "destructive"> = {
  ready: "default",
  partial: "secondary",
  deferred: "outline",
  missing: "destructive",
};

const STATUS_ICON: Record<DesktopReadinessStatus, React.ComponentType<{ className?: string }>> = {
  ready: CheckCircle2,
  partial: AlertCircle,
  deferred: Clock,
  missing: XCircle,
};

function ItemRow({ item }: { item: DesktopReadinessItem }) {
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

export default function DSK01DeployabilityCenter() {
  const summary = useMemo(() => desktopReadinessSummary(), []);
  const pct = Math.round((summary.ready / summary.total) * 100);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Desktop Deployability</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Live 11-item Desktop Host / Electron Checklist (Phase 14).
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
                  ? "Desktop host ready: sandbox enforced, preload bridge typed & minimal, signing wired, fallbacks complete."
                  : "One or more desktop items have unresolved blockers."}
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
            <p className="text-xs text-muted-foreground">Renderer Sandbox</p>
            <p className="text-sm font-medium mt-1">contextIsolation + sandbox + no node</p>
            <Badge variant="default" className="mt-2 text-[10px]">
              <Shield className="h-3 w-3 mr-1" />
              Hardened webPreferences
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Preload Bridge Surface</p>
            <p className="text-sm font-medium mt-1">
              {BRIDGE_METHOD_COUNT} methods · 7 categories
            </p>
            <Badge variant="default" className="mt-2 text-[10px]">
              <Lock className="h-3 w-3 mr-1" />
              1:1 contract verified
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Code Signing</p>
            <p className="text-sm font-medium mt-1">macOS · Windows · Linux</p>
            <Badge variant="default" className="mt-2 text-[10px]">
              osxSign · osxNotarize · windowsSign
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Scoreboard */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Desktop — Electron Host (Tier 2)
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
