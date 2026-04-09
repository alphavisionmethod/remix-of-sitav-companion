// ═══════════════════════════════════════════════════════
// SITA OS — V03: P0 Journey Board
// Pass/fail for launch-critical journeys
// ═══════════════════════════════════════════════════════

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useVerificationSurfaces, useVerificationRuns } from "@/lib/verification/verification-hooks";
import { getP0Surfaces } from "@/lib/verification/surface-registry";
import { ShieldCheck, CheckCircle2, XCircle, Clock } from "lucide-react";
import { useDataMode } from "@/contexts/DataModeContext";



const journeyFamilies = [
  { key: "auth", label: "Identity / Auth", routes: ["auth.login", "auth.login.submit", "auth.signup", "auth.signup.submit", "auth.signout"] },
  { key: "files", label: "Files", routes: ["files.page", "files.upload"] },
  { key: "ai", label: "AI / Advisors", routes: ["advisors.page", "advisors.chat.send"] },
  { key: "boardroom", label: "Boardroom", routes: ["boardroom.page", "boardroom.refresh"] },
  { key: "approvals", label: "Approvals", routes: ["approvals.page", "approvals.approve", "approvals.reject"] },
  { key: "connectors", label: "Connectors", routes: ["connectors.page"] },
  { key: "admin", label: "Admin OS", routes: ["admin.ai_runtime", "admin.team", "admin.approvals"] },
  { key: "navigation", label: "Core Navigation", routes: ["nav.home", "nav.sidebar"] },
];

export default function P0JourneyBoard() {
  const { isDemoMode } = useDataMode();
  const { data: dbSurfaces } = useVerificationSurfaces();
  const { data: runs } = useVerificationRuns();
  const p0s = getP0Surfaces();

  const surfaceMap = new Map((dbSurfaces || []).map((s: any) => [s.route_key, s]));

  return (
    <div className="space-y-6 p-6" data-testid="verification-p0-journeys">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-primary" />
          V03 — P0 Journey Board
        </h1>
        <p className="text-muted-foreground mt-1">Launch-critical journey verification status</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {journeyFamilies.map((family) => {
          const steps = family.routes.map((routeKey) => {
            const surface = surfaceMap.get(routeKey);
            const status = surface?.verification_status || "untested";
            const p0Entry = p0s.find((p) => p.routeKey === routeKey);
            return { routeKey, status, label: p0Entry?.actionLabel || routeKey };
          });
          const allPass = steps.every((s) => s.status === "pass");
          const anyFail = steps.some((s) => s.status === "fail");
          const journeyStatus = allPass ? "pass" : anyFail ? "fail" : "untested";

          return (
            <Card key={family.key} className={journeyStatus === "fail" ? "border-destructive/50" : journeyStatus === "pass" ? "border-green-500/50" : ""}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{family.label}</h3>
                  {journeyStatus === "pass" && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                  {journeyStatus === "fail" && <XCircle className="h-5 w-5 text-destructive" />}
                  {journeyStatus === "untested" && <Clock className="h-5 w-5 text-muted-foreground" />}
                </div>
                <div className="space-y-1">
                  {steps.map((step) => (
                    <div key={step.routeKey} className="flex items-center gap-2 text-sm">
                      {step.status === "pass" ? <CheckCircle2 className="h-3 w-3 text-green-500" /> : step.status === "fail" ? <XCircle className="h-3 w-3 text-destructive" /> : <Clock className="h-3 w-3 text-muted-foreground" />}
                      <span className={step.status === "fail" ? "text-destructive" : "text-muted-foreground"}>{step.label}</span>
                    </div>
                  ))}
                </div>
                <Badge variant={journeyStatus === "pass" ? "default" : journeyStatus === "fail" ? "destructive" : "secondary"} className="text-xs">
                  {steps.filter((s) => s.status === "pass").length}/{steps.length} verified
                </Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
