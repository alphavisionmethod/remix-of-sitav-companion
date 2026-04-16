// ═══════════════════════════════════════════════════════════════
// SITA OS — WEB01 Web Deployability Center
// Phase 13 — live 13-item Web deployability scoreboard.
// Route: /admin/web/deployability (gated by audit.view)
// ═══════════════════════════════════════════════════════════════

import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Globe, CheckCircle2, AlertCircle, Clock, XCircle, Shield } from "lucide-react";
import {
  webReadinessSummary,
  MIN_BROWSER_VERSION,
  checkMinBrowserVersion,
} from "@/lib/web-platform/release";
import type { WebReadinessItem, WebReadinessStatus } from "@/lib/web-platform/release";

const STATUS_VARIANT: Record<WebReadinessStatus, "default" | "secondary" | "outline" | "destructive"> = {
  ready: "default",
  partial: "secondary",
  deferred: "outline",
  missing: "destructive",
};

const STATUS_ICON: Record<WebReadinessStatus, React.ComponentType<{ className?: string }>> = {
  ready: CheckCircle2,
  partial: AlertCircle,
  deferred: Clock,
  missing: XCircle,
};

function ItemRow({ item }: { item: WebReadinessItem }) {
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
            <Badge variant="destructive" className="text-[10px]">blocker</Badge>
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

export default function WEB01DeployabilityCenter() {
  const summary = useMemo(() => webReadinessSummary(), []);
  const browserCheck = useMemo(() => checkMinBrowserVersion(), []);
  const pct = Math.round((summary.ready / summary.total) * 100);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Web Deployability</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Live 13-item Web Deployability Checklist (Phase 13).
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
                  ? "Web surface ready: SW iframe-guarded, CSP aligned, push icons resolved, error boundaries wired."
                  : "One or more web items have unresolved blockers."}
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
            <p className="text-xs text-muted-foreground">Min Browser Floor</p>
            <p className="text-sm font-medium mt-1">
              Chrome {MIN_BROWSER_VERSION.chrome} · Safari {MIN_BROWSER_VERSION.safari} · Firefox {MIN_BROWSER_VERSION.firefox} · Edge {MIN_BROWSER_VERSION.edge}
            </p>
            <Badge variant={browserCheck.ok ? "default" : "destructive"} className="mt-2 text-[10px]">
              {browserCheck.ok
                ? `${browserCheck.browser} ${browserCheck.version ?? ""} meets floor`
                : `${browserCheck.browser} ${browserCheck.version ?? "?"} below floor`}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Service Worker Posture</p>
            <p className="text-sm font-medium mt-1">Iframe + preview-host guarded</p>
            <Badge variant="default" className="mt-2 text-[10px]">
              <Shield className="h-3 w-3 mr-1" />
              SW only on prod hosts
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">CSP Origin</p>
            <p className="text-sm font-medium mt-1 truncate">fctupowhcljejygjfpty.supabase.co</p>
            <Badge variant="default" className="mt-2 text-[10px]">
              meta + nginx aligned
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Scoreboard */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Web — Production SPA
            </CardTitle>
            <Badge variant={summary.ok ? "default" : "destructive"}>
              {summary.ok ? "READY" : "BLOCKED"}
            </Badge>
          </div>
          <CardDescription>
            {summary.ready}/{summary.total} ready · {summary.partial} partial · {summary.deferred} deferred · {summary.missing} missing
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
