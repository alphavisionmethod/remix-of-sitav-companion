import DWESubNav from "@/platform/admin/components/admin/DWESubNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, Brain, Zap, Shield, HeartHandshake } from "lucide-react";
import { fromTable } from "@/lib/supabase-helpers";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import type { AssistantRolePresenceRow, ProactiveInterventionRow } from "@/lib/types/dwe-types";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
import { DemoOnlyBanner } from "@/platform/trust/components/claim-safety/DemoOnlyBanner";

export default function DWE06AmbientAssistantCenter() {
  const { user } = useAuth();

  const { data: roles = [] } = useQuery<AssistantRolePresenceRow[]>({
    queryKey: ["dwe06-roles", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await fromTable("assistant_role_presences").select("*").order("role_name");
      return (data ?? []) as AssistantRolePresenceRow[];
    },
  });

  const { data: interventions = [] } = useQuery<ProactiveInterventionRow[]>({
    queryKey: ["dwe06-interventions", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await fromTable("proactive_interventions").select("*").order("created_at", { ascending: false }).limit(20);
      return (data ?? []) as ProactiveInterventionRow[];
    },
  });

  const roleIcons: Record<string, React.ReactNode> = {
    chief_of_staff: <Brain className="h-5 w-5 text-primary" />,
    executive_assistant: <HeartHandshake className="h-5 w-5 text-accent-foreground" />,
    strategist: <Zap className="h-5 w-5 text-warning" />,
    risk_watcher: <Shield className="h-5 w-5 text-destructive" />,
  };

  return (
    <div className="space-y-6 p-6">
      <DWESubNav />
      <DemoOnlyBanner surfaceId="DWE06" />
<div>
        <h1 className="text-2xl font-bold text-foreground">DWE06 — Ambient Assistant Experience Center</h1>
        <p className="text-muted-foreground">Proactive roles, support intensity, calm mode, overload protection.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Active Roles</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{roles.filter((r) => r.active).length}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Roles</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{roles.length}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Recent Interventions</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{interventions.length}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Bot className="h-5 w-5" /> Assistant Roles</CardTitle></CardHeader>
        <CardContent>
          {roles.length === 0 ? <p className="text-sm text-muted-foreground">No assistant roles configured. Seed roles via the edge function.</p> : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {roles.map((r) => (
                <div key={r.id} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                  {roleIcons[r.role_key ?? ""] || <Bot className="h-5 w-5" />}
                  <div className="flex-1">
                    <p className="font-medium text-sm">{r.role_name}</p>
                    <p className="text-xs text-muted-foreground">{r.tone || "neutral"} tone · {r.proactive_mode || "calm"}</p>
                  </div>
                  <Badge variant={r.active ? "default" : "secondary"} className="text-xs">{r.active ? "Active" : "Inactive"}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Recent Proactive Interventions</CardTitle></CardHeader>
        <CardContent>
          {interventions.length === 0 ? <p className="text-sm text-muted-foreground">No proactive interventions recorded yet.</p> : (
            <div className="space-y-2">
              {interventions.map((i) => (
                <div key={i.id} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                  <Zap className="h-4 w-4 text-warning" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{i.intervention_type}</p>
                    <p className="text-xs text-muted-foreground">{i.explanation || "No explanation"}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">{i.delivered ? "Delivered" : "Pending"}</Badge>
                  <span className="text-xs text-muted-foreground">{new Date(i.created_at).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
