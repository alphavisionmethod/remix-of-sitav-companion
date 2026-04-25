import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Loader2, Shield, ShieldOff, Zap, FileText } from "lucide-react";
import { getKillSwitchState, setKillSwitch, loadKillSwitches } from "@/lib/dual-reality/demo-policy-engine";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import DRSSubNav from "@/platform/admin/components/admin/DRSSubNav";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";



export default function DRS06DemoPolicySafety() {
  const queryClient = useQueryClient();
  const [killState, setKillState] = useState(getKillSwitchState());

  // Load kill switches from DB on mount
  useEffect(() => {
    loadKillSwitches().then(() => setKillState(getKillSwitchState()));
  }, []);

  const { data: profiles, isLoading: profilesLoading } = useQuery({
    queryKey: ["drs06-profiles"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await fromTable("demo_policy_profiles").select("*").eq("user_id", user.id);
      return data ?? [];
    },
  });

  const { data: recentReceipts = [], isLoading: receiptsLoading } = useQuery({
    queryKey: ["drs06-receipts"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await fromTable("demo_receipts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);
      return data ?? [];
    },
  });

  async function toggleSwitch(key: "demoModeGlobal" | "demoAILiveCalls" | "demoSimulatedWrites") {
    const newVal = !killState[key];
    await setKillSwitch(key, newVal, `Toggled via DRS06 board`);
    setKillState(getKillSwitchState());
    toast.success(`${key} ${newVal ? "enabled" : "disabled"}`);
    queryClient.invalidateQueries({ queryKey: ["drs06-receipts"] });
  }

  return (
    <div className="space-y-6 p-6">
<DRSSubNav />
      <div>
        <h1 className="text-2xl font-bold text-foreground">DRS06 — Demo Policy & Safety Board</h1>
        <p className="text-sm text-muted-foreground mt-1">Govern demo mode safety controls and kill switches</p>
      </div>

      {/* Kill Switch Controls */}
      <Card className={`border ${killState.demoModeGlobal ? "border-red-500/50 bg-red-500/5" : "border-green-500/30 bg-green-500/5"}`}>
        <CardContent className="py-4 space-y-3">
          <div className="flex items-center gap-4">
            {killState.demoModeGlobal ? <ShieldOff className="h-5 w-5 text-red-400" /> : <Shield className="h-5 w-5 text-green-400" />}
            <div className="flex-1">
              <span className="font-semibold text-foreground">{killState.demoModeGlobal ? "Demo Mode KILLED Globally" : "Demo Mode Active"}</span>
              <p className="text-xs text-muted-foreground mt-0.5">
                Killed scenarios: {killState.demoSpecificScenarios.length}
              </p>
            </div>
          </div>
          <div className="grid gap-2 pl-9">
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">Global Kill Switch</span>
              <Switch checked={killState.demoModeGlobal} onCheckedChange={() => toggleSwitch("demoModeGlobal")} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">Kill AI Live Calls</span>
              <Switch checked={killState.demoAILiveCalls} onCheckedChange={() => toggleSwitch("demoAILiveCalls")} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">Kill Simulated Writes</span>
              <Switch checked={killState.demoSimulatedWrites} onCheckedChange={() => toggleSwitch("demoSimulatedWrites")} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Safety Matrix */}
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

      {/* Recent Demo Receipts */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2"><FileText className="h-4 w-4" /> Recent Demo Receipts ({recentReceipts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {receiptsLoading ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mx-auto" /> :
           recentReceipts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No demo receipts logged yet — receipts appear as policy decisions are made</p>
          ) : (
            <div className="space-y-1 max-h-48 overflow-auto">
              {recentReceipts.map((r: Record<string, any>) => (
                <div key={r.id} className="flex items-center gap-2 text-xs border-b border-border/20 py-1 last:border-0">
                  <Badge variant="outline" className="text-[10px]">{r.receipt_type}</Badge>
                  <span className="text-muted-foreground flex-1 truncate">{r.summary}</span>
                  <span className="text-muted-foreground/60">{new Date(r.created_at).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Policy Profiles */}
      {profilesLoading ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mx-auto" /> : (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Policy Profiles ({profiles?.length ?? 0})</CardTitle></CardHeader>
          <CardContent>
            {(profiles?.length ?? 0) === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No custom policy profiles yet</p>
            ) : (
              <div className="space-y-2">
                {profiles?.map((p: Record<string, any>) => (
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
