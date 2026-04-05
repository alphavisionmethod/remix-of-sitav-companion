import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Shield, ShieldOff, Zap } from "lucide-react";
import { getKillSwitchState } from "@/lib/dual-reality/demo-policy-engine";

export default function DRS06DemoPolicySafety() {
  const killState = getKillSwitchState();

  const { data: profiles, isLoading } = useQuery({
    queryKey: ["drs06-profiles"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await (supabase as any).from("demo_policy_profiles").select("*").eq("user_id", user.id);
      return data ?? [];
    },
  });

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">DRS06 — Demo Policy & Safety Board</h1>
        <p className="text-sm text-muted-foreground mt-1">Govern demo mode safety controls and kill switches</p>
      </div>

      <Card className={`border ${killState.demoModeGlobal ? "border-red-500/50 bg-red-500/5" : "border-green-500/30 bg-green-500/5"}`}>
        <CardContent className="flex items-center gap-4 py-4">
          {killState.demoModeGlobal ? <ShieldOff className="h-5 w-5 text-red-400" /> : <Shield className="h-5 w-5 text-green-400" />}
          <div>
            <span className="font-semibold text-foreground">{killState.demoModeGlobal ? "Demo Mode KILLED Globally" : "Demo Mode Active"}</span>
            <p className="text-xs text-muted-foreground mt-0.5">
              AI live calls: {killState.demoAILiveCalls ? "killed" : "allowed"} • Simulated writes: {killState.demoSimulatedWrites ? "killed" : "allowed"} • Killed scenarios: {killState.demoSpecificScenarios.length}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Zap className="h-4 w-4" /> Default Safety Matrix</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            {[
              { label: "External Writes", blocked: true }, { label: "Connector Writes", blocked: true },
              { label: "Live Notifications", blocked: true }, { label: "Approval Execution", blocked: true },
              { label: "Billing", blocked: true }, { label: "AI (demo default)", blocked: false, note: "cached_only" },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-2 rounded-lg border border-border p-2">
                <div className={`h-2 w-2 rounded-full ${item.blocked ? "bg-red-400" : "bg-amber-400"}`} />
                <span className="text-xs text-foreground">{item.label}</span>
                <Badge variant="outline" className="text-[10px] ml-auto">{item.blocked ? "blocked" : item.note ?? "allowed"}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {isLoading ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mx-auto" /> : (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Policy Profiles ({profiles?.length ?? 0})</CardTitle></CardHeader>
          <CardContent>
            {(profiles?.length ?? 0) === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No custom policy profiles yet</p>
            ) : (
              <div className="space-y-2">
                {profiles?.map((p: any) => (
                  <div key={p.id} className="flex items-center gap-3 text-sm border-b border-border/30 py-2 last:border-0">
                    <span className="font-medium text-foreground">{p.name}</span>
                    <Badge variant="outline" className="text-xs">AI: {p.ai_execution_mode}</Badge>
                    <Badge variant="outline" className="text-xs">{p.receipt_mode}</Badge>
                    <Badge variant="outline" className="text-xs">{p.analytics_mode}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
