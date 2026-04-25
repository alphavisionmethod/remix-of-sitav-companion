import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { motion } from "framer-motion";
import { Rocket, CheckCircle2, AlertCircle, Clock, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";



const DeliveryReadinessBoard = () => {
  const { data: blueprints } = useQuery({
    queryKey: ["readiness-blueprints"],
    queryFn: async () => {
      const { data } = await fromTable("feature_blueprints").select("*").order("created_at", { ascending: false }).limit(50);
      return data ?? [];
    },
  });

  const { data: deps } = useQuery({
    queryKey: ["readiness-deps"],
    queryFn: async () => {
      const { data } = await fromTable("dependency_maps").select("*").limit(100);
      return data ?? [];
    },
  });

  const { data: remediations } = useQuery({
    queryKey: ["readiness-remediations"],
    queryFn: async () => {
      const { data } = await fromTable("remediation_suggestions").select("*").eq("status", "open").limit(50);
      return data ?? [];
    },
  });

  const totalFeatures = blueprints?.length ?? 0;
  const draftCount = (blueprints ?? []).filter((b: Record<string, any>) => b.status === "draft").length;
  const approvedCount = (blueprints ?? []).filter((b: Record<string, any>) => b.status === "approved").length;
  const openRemediations = remediations?.length ?? 0;
  const criticalRemediations = (remediations ?? []).filter((r: Record<string, any>) => r.priority === "critical").length;

  const overallReadiness = totalFeatures > 0 ? Math.round(((totalFeatures - draftCount) / totalFeatures) * 100) : 0;

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <Rocket className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Delivery Readiness Board</h1>
        </div>
        <p className="text-muted-foreground">Orchestrate what remains, what validates, what blocks launch</p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Features", value: totalFeatures, icon: CheckCircle2, color: "text-blue-400" },
          { label: "Draft / Not Ready", value: draftCount, icon: Clock, color: "text-amber-400" },
          { label: "Approved / Ready", value: approvedCount, icon: CheckCircle2, color: "text-green-400" },
          { label: "Open Remediations", value: openRemediations, icon: AlertCircle, color: criticalRemediations > 0 ? "text-red-400" : "text-amber-400" },
        ].map(card => (
          <Card key={card.label}>
            <CardContent className="pt-4 flex items-center gap-3">
              <card.icon className={`h-8 w-8 ${card.color}`} />
              <div>
                <div className="text-2xl font-bold">{card.value}</div>
                <div className="text-xs text-muted-foreground">{card.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Overall Delivery Readiness</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <Progress value={overallReadiness} className="h-4" />
          <div className="text-sm text-muted-foreground">{overallReadiness}% of features beyond draft stage</div>
        </CardContent>
      </Card>

      {criticalRemediations > 0 && (
        <Card className="border-red-500/30">
          <CardHeader><CardTitle className="flex items-center gap-2 text-red-400"><XCircle className="h-5 w-5" /> Critical Blockers ({criticalRemediations})</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {(remediations ?? []).filter((r: Record<string, any>) => r.priority === "critical").map((r: Record<string, any>) => (
              <div key={r.id} className="p-2 rounded border border-red-500/20 bg-red-500/5">
                <div className="text-sm font-medium">{r.gap_description}</div>
                <div className="text-xs text-muted-foreground mt-1">→ {r.suggested_action}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Feature Readiness Details</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {(blueprints ?? []).map((bp: Record<string, any>) => {
              const depMap = (deps ?? []).find((d: Record<string, any>) => d.feature_id === bp.feature_id);
              const depPct = depMap && depMap.total_count > 0 ? Math.round((depMap.resolved_count / depMap.total_count) * 100) : 0;
              return (
                <div key={bp.id} className="flex items-center justify-between p-2 rounded border">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{bp.title}</span>
                    <Badge variant="outline" className="text-xs">{bp.domain}</Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    {depMap && <span className="text-xs text-muted-foreground">Deps: {depPct}%</span>}
                    <Badge variant={bp.status === "approved" ? "default" : "secondary"}>{bp.status}</Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeliveryReadinessBoard;
