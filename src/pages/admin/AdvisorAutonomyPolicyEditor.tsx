import { usePolicyDecision } from "@/platform/trust/hooks/use-policy-decision";
import { AdminControlPlaneShell as AdminShell } from "@/platform/admin/components/admin/shells/AdminControlPlaneShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Shield, AlertOctagon, Play, Pause, Lock } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BoardAPI, type AutonomyPolicy } from "@/lib/services/board-api-client";
import { toast } from "sonner";

const DOMAINS = ["global", "revenue", "finance", "operations", "clients", "team", "communications", "scheduling"];
const LEVEL_LABELS = ["Observe Only", "Suggest", "Draft", "Auto-Low-Risk", "Auto-Medium", "Full Auto"];

export default function AdvisorAutonomyPolicyEditor() {
  const __policy = usePolicyDecision({ domain: "admin", riskClass: "R4", actor: "platform-admin" }); void __policy;
  const queryClient = useQueryClient();
  const policiesQuery = useQuery({ queryKey: ["admin-autonomy"], queryFn: () => BoardAPI.getAutonomy() });
  const policies = policiesQuery.data?.policies ?? [];

  const getPolicyForDomain = (domain: string): Partial<AutonomyPolicy> => {
    return policies.find(p => p.domain === domain) ?? { domain, autonomy_level: 1, emergency_stop: false };
  };

  const upsertMutation = useMutation({
    mutationFn: (payload: Partial<AutonomyPolicy>) => BoardAPI.upsertAutonomy(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-autonomy"] });
      toast.success("Autonomy policy updated");
    },
  });

  const emergencyStopMutation = useMutation({
    mutationFn: () => BoardAPI.emergencyStop(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-autonomy"] });
      toast.warning("Emergency stop activated — all automation paused");
    },
  });

  const resumeMutation = useMutation({
    mutationFn: () => BoardAPI.resume(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-autonomy"] });
      toast.success("Automation resumed");
    },
  });

  const globalPolicy = getPolicyForDomain("global");
  const isEmergencyStopped = policies.some(p => p.emergency_stop);

  return (
    <AdminShell contextScope="Autonomy Policy Editor">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              Autonomy Policy Editor
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Domain permission matrix, thresholds, and emergency controls</p>
          </div>
          {isEmergencyStopped ? (
            <Button variant="default" onClick={() => resumeMutation.mutate()} className="gap-2">
              <Play className="h-4 w-4" /> Resume Automation
            </Button>
          ) : (
            <Button variant="destructive" onClick={() => emergencyStopMutation.mutate()} className="gap-2">
              <AlertOctagon className="h-4 w-4" /> Emergency Stop
            </Button>
          )}
        </div>

        {isEmergencyStopped && (
          <Card className="border-destructive bg-destructive/5 p-4">
            <div className="flex items-center gap-2">
              <AlertOctagon className="h-5 w-5 text-destructive" />
              <p className="text-sm font-medium text-destructive">Emergency Stop Active — All advisor automation is paused</p>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {DOMAINS.map(domain => {
            const policy = getPolicyForDomain(domain);
            const level = policy.autonomy_level ?? 1;
            return (
              <Card key={domain} className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium capitalize">{domain}</span>
                  </div>
                  <Badge variant={level >= 4 ? "destructive" : level >= 2 ? "default" : "secondary"} className="text-[9px]">
                    L{level} — {LEVEL_LABELS[level] ?? "Unknown"}
                  </Badge>
                </div>
                <Slider
                  value={[level]}
                  onValueChange={([v]) => upsertMutation.mutate({ domain, autonomy_level: v })}
                  max={5}
                  step={1}
                  className="w-full"
                />
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  {domain !== "global" && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Communication</span>
                        <Switch
                          checked={policy.allow_communication ?? false}
                          onCheckedChange={(v) => upsertMutation.mutate({ domain, allow_communication: v })}
                          className="scale-75"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Scheduling</span>
                        <Switch
                          checked={policy.allow_scheduling ?? false}
                          onCheckedChange={(v) => upsertMutation.mutate({ domain, allow_scheduling: v })}
                          className="scale-75"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Financial</span>
                        <Switch
                          checked={policy.allow_financial ?? false}
                          onCheckedChange={(v) => upsertMutation.mutate({ domain, allow_financial: v })}
                          className="scale-75"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Client-facing</span>
                        <Switch
                          checked={policy.allow_client_facing ?? false}
                          onCheckedChange={(v) => upsertMutation.mutate({ domain, allow_client_facing: v })}
                          className="scale-75"
                        />
                      </div>
                    </>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </AdminShell>
  );
}
