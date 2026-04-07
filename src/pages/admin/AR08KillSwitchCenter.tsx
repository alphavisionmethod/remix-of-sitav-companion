// ═══════════════════════════════════════════════════════════════
// SITA OS — AR08: Kill Switch & Safety Center
// ═══════════════════════════════════════════════════════════════

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SitaPageHeader, SitaCard, SitaCardTitle } from "@/components/sita/SitaCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Shield, AlertTriangle, Zap, Bot, Heart, Wrench } from "lucide-react";
import { toast } from "sonner";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";

const SCOPES = [
  { scope: "global", label: "Global Kill Switch", description: "Stops ALL recurring automation", icon: Shield, color: "text-destructive" },
  { scope: "domain", scope_id: "self-healing", label: "Self-Healing", description: "Disable self-healing execution", icon: Heart, color: "text-accent" },
  { scope: "domain", scope_id: "agent", label: "Agent Execution", description: "Disable agent scheduler jobs", icon: Bot, color: "text-primary" },
  { scope: "domain", scope_id: "maintenance", label: "Maintenance", description: "Disable system maintenance jobs", icon: Wrench, color: "text-muted-foreground" },
  { scope: "job_class", scope_id: "agent_heartbeat", label: "Agent Heartbeats", description: "Disable heartbeat checks only", icon: Zap, color: "text-accent" },
];

export default function AR08KillSwitchCenter() {
  const { isDemoMode } = useDataMode();
  const queryClient = useQueryClient();
  const { data: switches = [] } = useQuery({
    queryKey: ["kill-switches"],
    queryFn: async () => {
      const { data } = await supabase.from("automation_kill_switches").select("*");
      return data || [];
    },
  });

  const isEnabled = (scope: string, scopeId?: string) => {
    return switches.some((s: any) =>
      s.scope === scope && (scopeId ? s.scope_id === scopeId : !s.scope_id) && s.enabled
    );
  };

  const toggleMutation = useMutation({
    mutationFn: async ({ scope, scopeId, enable }: { scope: string; scopeId?: string; enable: boolean }) => {
      const existing = switches.find((s: any) =>
        s.scope === scope && (scopeId ? s.scope_id === scopeId : !s.scope_id)
      );

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      if (existing) {
        await supabase.from("automation_kill_switches")
          .update({
            enabled: enable,
            activated_at: enable ? new Date().toISOString() : (existing as any).activated_at,
            deactivated_at: enable ? null : new Date().toISOString(),
            reason: enable ? "Manual activation" : undefined,
          })
          .eq("id", (existing as any).id);
      } else {
        await supabase.from("automation_kill_switches").insert({
          user_id: user.id,
          scope,
          scope_id: scopeId || null,
          enabled: enable,
          reason: "Manual activation",
          activated_by: "operator",
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kill-switches"] });
      toast.success("Kill switch updated");
    },
  });

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto space-y-6">
      <DemoModeBadge />
      <SitaPageHeader
        title="Kill Switch & Safety Center"
        subtitle="Control automation safety — disable recurring execution globally or by domain"
      />

      <div className="space-y-3">
        {SCOPES.map((s) => {
          const active = isEnabled(s.scope, s.scope_id);
          return (
            <SitaCard key={`${s.scope}-${s.scope_id}`} className={active ? "border-destructive/30 bg-destructive/5" : ""}>
              <div className="flex items-center gap-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${active ? "bg-destructive/10" : "bg-secondary/30"}`}>
                  <s.icon className={`h-5 w-5 ${active ? "text-destructive" : s.color}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{s.label}</p>
                  <p className="text-[10px] text-muted-foreground">{s.description}</p>
                </div>
                {active && <Badge variant="destructive" className="text-[9px]">ACTIVE</Badge>}
                <Switch
                  checked={active}
                  onCheckedChange={(checked) =>
                    toggleMutation.mutate({ scope: s.scope, scopeId: s.scope_id, enable: checked })
                  }
                />
              </div>
            </SitaCard>
          );
        })}
      </div>

      {switches.filter((s: any) => s.enabled).length > 0 && (
        <SitaCard className="border-destructive/30">
          <SitaCardTitle className="text-destructive flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" /> Active Kill Switches
          </SitaCardTitle>
          <div className="space-y-1 mt-2">
            {switches.filter((s: any) => s.enabled).map((s: any) => (
              <div key={s.id} className="text-xs text-destructive">
                {s.scope}{s.scope_id ? `:${s.scope_id}` : ""} — {s.reason || "No reason"}
                <span className="text-muted-foreground ml-2">{s.activated_at ? new Date(s.activated_at).toLocaleString() : ""}</span>
              </div>
            ))}
          </div>
        </SitaCard>
      )}
    </div>
  );
}
