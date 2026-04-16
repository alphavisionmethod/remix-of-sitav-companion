// ═══════════════════════════════════════════════════════════════
// SITA OS — MOB01 Store Readiness Center
// Phase 12 — live iOS + Android deployability checklist scoreboard.
// Route: /admin/mobile/store-readiness (gated by audit.view)
// ═══════════════════════════════════════════════════════════════

import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Apple, Smartphone, CheckCircle2, AlertCircle, Clock, XCircle } from "lucide-react";
import {
  iosReadinessSummary,
  androidReadinessSummary,
  aggregateMobileReadiness,
  MIN_OS_VERSION,
  checkMinOSVersion,
} from "@/lib/mobile-platform/release";
import type { ReadinessItem, ReadinessStatus } from "@/lib/mobile-platform/release";
import { pushTokenLifecycle } from "@/lib/mobile-platform/services/push-token-lifecycle";

const STATUS_VARIANT: Record<ReadinessStatus, "default" | "secondary" | "outline" | "destructive"> = {
  ready: "default",
  partial: "secondary",
  deferred: "outline",
  missing: "destructive",
};

const STATUS_ICON: Record<ReadinessStatus, React.ComponentType<{ className?: string }>> = {
  ready: CheckCircle2,
  partial: AlertCircle,
  deferred: Clock,
  missing: XCircle,
};

function ItemRow({ item }: { item: ReadinessItem }) {
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
        <p className="text-xs text-muted-foreground mt-1 truncate">{item.evidence}</p>
        {item.remediation && (
          <p className="text-xs text-muted-foreground mt-1 italic">↳ {item.remediation}</p>
        )}
      </div>
    </div>
  );
}

export default function MOB01StoreReadinessCenter() {
  const ios = useMemo(() => iosReadinessSummary(), []);
  const android = useMemo(() => androidReadinessSummary(), []);
  const aggregate = useMemo(() => aggregateMobileReadiness(), []);
  const osCheck = useMemo(() => checkMinOSVersion(), []);
  const tokenHealth = useMemo(() => pushTokenLifecycle.health(), []);

  const iosPct = Math.round((ios.ready / ios.total) * 100);
  const androidPct = Math.round((android.ready / android.total) * 100);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Mobile Store Readiness</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Live deployability checklist for iOS App Store + Google Play Store.
        </p>
      </div>

      {/* Aggregate verdict */}
      <Card className={aggregate.ok ? "border-primary/50" : "border-destructive/50"}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {aggregate.ok ? <CheckCircle2 className="h-5 w-5 text-primary" /> : <XCircle className="h-5 w-5 text-destructive" />}
                Aggregate Verdict
              </CardTitle>
              <CardDescription>
                {aggregate.ok
                  ? "Both surfaces pass with honest defers on credential-gated items."
                  : "One or more surfaces have unresolved blockers."}
              </CardDescription>
            </div>
            <Badge variant={aggregate.ok ? "default" : "destructive"} className="text-sm">
              {aggregate.ok ? "READY" : "BLOCKED"}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Health strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Min OS Floor</p>
            <p className="text-sm font-medium mt-1">iOS {MIN_OS_VERSION.ios} · {MIN_OS_VERSION.androidLabel}</p>
            <Badge variant={osCheck.ok ? "default" : "destructive"} className="mt-2 text-[10px]">
              {osCheck.ok ? "device meets floor" : osCheck.reason ?? "below floor"}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Push Token</p>
            <p className="text-sm font-medium mt-1">
              {tokenHealth.hasToken ? `${tokenHealth.transport} · ${tokenHealth.os}` : "Not registered"}
            </p>
            <Badge variant={tokenHealth.hasToken ? "default" : "outline"} className="mt-2 text-[10px]">
              {tokenHealth.hasToken ? `age ${tokenHealth.ageMinutes}m` : "no token"}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Capacitor Config</p>
            <p className="text-sm font-medium mt-1">app.lovable.e245cf4061cc4143bfa4f97382e8d62d</p>
            <Badge variant="default" className="mt-2 text-[10px]">capacitor.config.ts ✓</Badge>
          </CardContent>
        </Card>
      </div>

      {/* Per-surface scoreboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Apple className="h-5 w-5" />
                iOS — App Store
              </CardTitle>
              <Badge variant={ios.ok ? "default" : "destructive"}>{ios.ok ? "READY" : "BLOCKED"}</Badge>
            </div>
            <CardDescription>
              {ios.ready}/{ios.total} ready · {ios.deferred} deferred · {ios.partial} partial · {ios.missing} missing
            </CardDescription>
            <Progress value={iosPct} className="mt-2 h-1.5" />
          </CardHeader>
          <CardContent className="space-y-2">
            {ios.items.map((it) => (
              <ItemRow key={it.id} item={it} />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Android — Play Store
              </CardTitle>
              <Badge variant={android.ok ? "default" : "destructive"}>{android.ok ? "READY" : "BLOCKED"}</Badge>
            </div>
            <CardDescription>
              {android.ready}/{android.total} ready · {android.deferred} deferred · {android.partial} partial · {android.missing} missing
            </CardDescription>
            <Progress value={androidPct} className="mt-2 h-1.5" />
          </CardHeader>
          <CardContent className="space-y-2">
            {android.items.map((it) => (
              <ItemRow key={it.id} item={it} />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
