import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, Brain, Zap, Shield, HeartHandshake } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";

export default function DWE06AmbientAssistantCenter() {
  const { isDemoMode } = useDataMode();
  const [roles, setRoles] = useState<any[]>([]);
  const [interventions, setInterventions] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("assistant_role_presences").select("*").order("role_name").then(({ data }: any) => setRoles(data || []));
    supabase.from("proactive_interventions").select("*").order("created_at", { ascending: false }).limit(20).then(({ data }: any) => setInterventions(data || []));
  }, []);

  const roleIcons: Record<string, React.ReactNode> = {
    chief_of_staff: <Brain className="h-5 w-5 text-primary" />,
    executive_assistant: <HeartHandshake className="h-5 w-5 text-blue-500" />,
    strategist: <Zap className="h-5 w-5 text-yellow-500" />,
    risk_watcher: <Shield className="h-5 w-5 text-red-500" />,
  };

  return (
    <div className="space-y-6 p-6">
      <DemoModeBadge />
      <div>
        <h1 className="text-2xl font-bold text-foreground">DWE06 — Ambient Assistant Experience Center</h1>
        <p className="text-muted-foreground">Proactive roles, support intensity, calm mode, overload protection.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Active Roles</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{roles.filter((r: any) => r.active).length}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Roles</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{roles.length}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Recent Interventions</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{interventions.length}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Bot className="h-5 w-5" /> Assistant Roles</CardTitle></CardHeader>
        <CardContent>
          {roles.length === 0 ? <p className="text-sm text-muted-foreground">No assistant roles configured. Seed roles via the edge function.</p> : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {roles.map((r: any) => (
                <div key={r.id} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                  {roleIcons[r.role_key] || <Bot className="h-5 w-5" />}
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
              {interventions.map((i: any) => (
                <div key={i.id} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{i.intervention_type}</p>
                    <p className="text-xs text-muted-foreground">{i.description || "No description"}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">{i.status || "pending"}</Badge>
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