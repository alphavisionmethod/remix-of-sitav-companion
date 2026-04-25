import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Zap, Database, DollarSign } from "lucide-react";
import { evaluateAIPolicy } from "@/lib/dual-reality/demo-policy-engine";
import DRSSubNav from "@/platform/admin/components/admin/DRSSubNav";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

export default function DRS07DemoAIControl() {
  const demoAI = evaluateAIPolicy("demo");
  const realAI = evaluateAIPolicy("real");
  const sandboxAI = evaluateAIPolicy("sandbox");

  const modes = [
    { key: "real", label: "Real Mode", ...realAI },
    { key: "demo", label: "Demo Mode", ...demoAI },
    { key: "sandbox", label: "Sandbox Mode", ...sandboxAI },
  ];

  return (
    <div className="space-y-6 p-6">
<DRSSubNav />
      <div>
        <h1 className="text-2xl font-bold text-foreground">DRS07 — Demo AI Control Center</h1>
        <p className="text-sm text-muted-foreground mt-1">Control AI behavior across reality modes</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {modes.map(m => (
          <Card key={m.key}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Brain className="h-4 w-4" /> {m.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <div className={`h-3 w-3 rounded-full ${m.allowed ? "bg-green-400" : "bg-red-400"}`} />
                <span className="text-sm font-semibold text-foreground">{m.allowed ? "Live AI Allowed" : "Live AI Blocked"}</span>
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between"><span className="text-muted-foreground">Mode</span><Badge variant="outline" className="text-xs">{m.mode}</Badge></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Prefer Cached</span><span className="text-foreground">{m.preferCached ? "Yes" : "No"}</span></div>
                {m.budgetCapCents !== undefined && (
                  <div className="flex justify-between"><span className="text-muted-foreground">Budget Cap</span><span className="text-foreground">${(m.budgetCapCents / 100).toFixed(2)}</span></div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Database className="h-4 w-4" /> Demo AI Strategy</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-3 rounded-lg bg-secondary/20 p-3">
              <Zap className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <div><p className="font-medium text-foreground">Cached Responses</p><p className="text-xs text-muted-foreground">Investor demos use precomputed, scenario-grounded AI outputs for speed and repeatability</p></div>
            </div>
            <div className="flex items-start gap-3 rounded-lg bg-secondary/20 p-3">
              <DollarSign className="h-4 w-4 text-green-400 shrink-0 mt-0.5" />
              <div><p className="font-medium text-foreground">Cost Control</p><p className="text-xs text-muted-foreground">Demo AI has strict budget caps. No premium inference burned on demos without explicit approval</p></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
