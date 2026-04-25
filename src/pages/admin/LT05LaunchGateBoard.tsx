import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Rocket, CheckCircle, XCircle, AlertTriangle, Shield } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { CILaunchGateWidget } from "@/platform/sita/components/sita/CILaunchGateWidget";
import LTSubNav from "@/platform/admin/components/admin/LTSubNav";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

const LT05LaunchGateBoard = () => {
  const { data: gates } = useQuery({
    queryKey: ["launch-gates"],
    queryFn: async () => {
      const { data } = await fromTable("launch_gates").select("*").order("created_at", { ascending: false }).limit(10);
      return data ?? [];
    },
  });

  const { data: criteria } = useQuery({
    queryKey: ["launch-gate-criteria"],
    queryFn: async () => {
      const { data } = await fromTable("launch_gate_criteria").select("*").order("category").limit(100);
      return data ?? [];
    },
  });

  const { data: blockers } = useQuery({
    queryKey: ["launch-blockers"],
    queryFn: async () => {
      const { data } = await fromTable("launch_blockers").select("*").eq("resolved", false).order("created_at", { ascending: false }).limit(50);
      return data ?? [];
    },
  });

  const gate = gates?.[0];
  const metCriteria = criteria?.filter((c: Record<string, any>) => c.status === "met").length ?? 0;
  const totalCriteria = criteria?.length ?? 0;
  const truthScore = totalCriteria > 0 ? Math.round((metCriteria / totalCriteria) * 100) : 0;

  const stateConfig: Record<string, { color: string; icon: any; label: string }> = {
    blocked: { color: "destructive", icon: XCircle, label: "Blocked" },
    conditionally_eligible: { color: "secondary", icon: AlertTriangle, label: "Conditionally Eligible" },
    pilot_ready: { color: "secondary", icon: Shield, label: "Pilot Ready" },
    internal_ready: { color: "default", icon: CheckCircle, label: "Internal Ready" },
    launch_ready: { color: "default", icon: Rocket, label: "Launch Ready" },
    production_hardened: { color: "default", icon: Rocket, label: "Production Hardened" },
  };

  const currentState = stateConfig[gate?.state ?? "blocked"] ?? stateConfig.blocked;

  return (
    <div className="space-y-6 p-6">
      <LTSubNav />
<div>
        <h1 className="text-2xl font-bold">Launch Gate Board</h1>
        <p className="text-sm text-muted-foreground">Central launch-readiness truth surface</p>
      </div>

      {/* CI Pipeline Integration */}
      <CILaunchGateWidget />

      <Card className="border-2">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <currentState.icon className="h-10 w-10" />
              <div>
                <h2 className="text-2xl font-bold">{currentState.label}</h2>
                <p className="text-sm text-muted-foreground">Current launch state</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{truthScore}%</div>
              <p className="text-sm text-muted-foreground">Truth threshold: {gate?.truth_threshold ? Number(gate.truth_threshold) * 100 : 80}%</p>
            </div>
          </div>
          <Progress value={truthScore} className="mt-4" />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-sm text-muted-foreground mb-1">Criteria Met</div>
            <div className="text-3xl font-bold">{metCriteria}/{totalCriteria}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-sm text-muted-foreground mb-1">Active Blockers</div>
            <div className="text-3xl font-bold text-destructive">{blockers?.length ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-sm text-muted-foreground mb-1">Promotion</div>
            <Badge variant={truthScore >= 80 && (blockers?.length ?? 0) === 0 ? "default" : "destructive"}>
              {truthScore >= 80 && (blockers?.length ?? 0) === 0 ? "Eligible" : "Blocked"}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Blockers */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><XCircle className="h-5 w-5 text-destructive" />Active Blockers</CardTitle></CardHeader>
        <CardContent>
          {blockers && blockers.length > 0 ? (
            <div className="space-y-2">
              {blockers.map((b: Record<string, any>) => (
                <div key={b.id} className="flex items-center justify-between p-3 rounded border border-destructive/20">
                  <div>
                    <p className="font-medium">{b.title}</p>
                    <p className="text-xs text-muted-foreground">{b.source} · {b.severity}</p>
                    {b.description && <p className="text-xs text-muted-foreground mt-1">{b.description}</p>}
                  </div>
                  <Badge variant="destructive">{b.severity}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No active blockers. Gate criteria determine eligibility.</p>
          )}
        </CardContent>
      </Card>

      {/* Criteria */}
      <Card>
        <CardHeader><CardTitle>Gate Criteria</CardTitle></CardHeader>
        <CardContent>
          {criteria && criteria.length > 0 ? (
            <div className="space-y-2">
              {criteria.map((c: Record<string, any>) => (
                <div key={c.id} className="flex items-center justify-between p-2 rounded border">
                  <div>
                    <span className="font-medium">{c.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">{c.category}</span>
                    {c.required && <Badge variant="outline" className="ml-2 text-xs">Required</Badge>}
                  </div>
                  <Badge variant={c.status === "met" ? "default" : "destructive"}>{c.status}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No gate criteria defined yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LT05LaunchGateBoard;
