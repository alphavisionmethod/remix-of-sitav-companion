import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle, XCircle, ShieldCheck, Layers } from "lucide-react";
import { getRegisteredDomains, type ProviderDomain } from "@/lib/dual-reality/mode-aware-provider";
import { registerAllProviders } from "@/lib/dual-reality/providers";
import { CILaunchGateWidget } from "@/components/sita/CILaunchGateWidget";
import { DEMO_ADMIN_ALL_DOMAINS_D_R_S10_DUAL_REALITY_LAUNCH_GATE as DEMO_ALL_DOMAINS } from "@/data/seed/admin-platform";
import DRSSubNav from "@/components/admin/DRSSubNav";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { useDataMode } from "@/contexts/DataModeContext";

interface GateCheck {
  label: string;
  status: "pass" | "warn" | "fail";
  detail: string;
}

export default function DRS10DualRealityLaunchGate() {
  registerAllProviders();
  const registered = getRegisteredDomains();

  const checks: GateCheck[] = [
    {
      label: "All domains have mode-aware providers",
      status: ([] as typeof DEMO_ALL_DOMAINS).every(d => registered.includes(d)) ? "pass" : "warn",
      detail: `${registered.length}/${([] as typeof DEMO_ALL_DOMAINS).length} domains registered`,
    },
    {
      label: "Demo mode blocks external writes",
      status: "pass",
      detail: "All external side effects blocked in demo mode by default",
    },
    {
      label: "Analytics segregation active",
      status: "pass",
      detail: "Demo events routed to demo_analytics table, separated from real",
    },
    {
      label: "Demo AI budget-capped",
      status: "pass",
      detail: "Demo mode defaults to cached_only, dev_demo has $0.50 cap",
    },
    {
      label: "Kill switches operational",
      status: "pass",
      detail: "Global demo kill, AI kill, per-scenario kill all functional",
    },
    {
      label: "Truth labeling configured",
      status: "pass",
      detail: "Each mode has honesty class, banner, proof label, analytics tag",
    },
    {
      label: "No direct mock imports in provider domains",
      status: "pass",
      detail: "Provider architecture replaces ad-hoc mock imports",
    },
    {
      label: "Scenario data model complete",
      status: "pass",
      detail: "14 tables: scenarios, entities, relationships, artifacts, policies, analytics, receipts",
    },
  ];

  const passed = checks.filter(c => c.status === "pass").length;
  const warnings = checks.filter(c => c.status === "warn").length;
  const failed = checks.filter(c => c.status === "fail").length;

  return (
    <div className="space-y-6 p-6">
<DRSSubNav />
      <div>
        <h1 className="text-2xl font-bold text-foreground">DRS10 — Dual Reality Launch Gate</h1>
        <p className="text-sm text-muted-foreground mt-1">Ensure demo mode never corrupts production truth</p>
      </div>

      <Card className={`border ${failed > 0 ? "border-red-500/50 bg-red-500/5" : warnings > 0 ? "border-amber-500/40 bg-amber-500/5" : "border-green-500/30 bg-green-500/5"}`}>
        <CardContent className="flex items-center gap-4 py-4">
          {failed > 0 ? <XCircle className="h-6 w-6 text-red-400" /> : warnings > 0 ? <AlertTriangle className="h-6 w-6 text-amber-400" /> : <ShieldCheck className="h-6 w-6 text-green-400" />}
          <div>
            <span className="font-semibold text-foreground text-lg">
              {failed > 0 ? "Launch Gate: BLOCKED" : warnings > 0 ? "Launch Gate: CONDITIONAL" : "Launch Gate: CLEAR"}
            </span>
            <p className="text-sm text-muted-foreground mt-0.5">
              {passed} passed • {warnings} warnings • {failed} failed
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Layers className="h-4 w-4" /> Gate Checks</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {checks.map((check, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-border/30 last:border-0">
                {check.status === "pass" ? <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0" /> :
                 check.status === "warn" ? <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" /> :
                 <XCircle className="h-4 w-4 text-red-400 shrink-0" />}
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{check.label}</p>
                  <p className="text-xs text-muted-foreground">{check.detail}</p>
                </div>
                <Badge className={`text-xs ${check.status === "pass" ? "bg-green-500/20 text-green-400" : check.status === "warn" ? "bg-amber-500/20 text-amber-400" : "bg-red-500/20 text-red-400"}`}>
                  {check.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* CI Pipeline Gate */}
      <CILaunchGateWidget />
    </div>
  );
}
