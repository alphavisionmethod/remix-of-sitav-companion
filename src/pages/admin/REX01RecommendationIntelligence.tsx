import REXSubNav from "@/platform/admin/components/admin/REXSubNav";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, CheckCircle2, XCircle, Clock, TrendingUp, AlertTriangle } from "lucide-react";



function useRecommendationStats() {
  return useQuery({
    queryKey: ["rex01-recommendation-stats"],
    queryFn: async () => {
      const { data, error } = await fromTable("ai_workforce_recommendations")
        .select("status, execution_binding_status, role_key, domain, created_at");
      if (error) throw error;
      const recs = data || [];
      const total = recs.length;
      const byStatus: Record<string, number> = {};
      const byDomain: Record<string, number> = {};
      recs.forEach((r: Record<string, any>) => {
        byStatus[r.status || "new"] = (byStatus[r.status || "new"] || 0) + 1;
        byDomain[r.domain || "unknown"] = (byDomain[r.domain || "unknown"] || 0) + 1;
      });
      const bound = recs.filter((r: Record<string, any>) => r.execution_binding_status === "bound" || r.execution_binding_status === "verified").length;
      return { total, byStatus, byDomain, bound };
    },
    staleTime: 30_000,
  });
}

function useRecommendationScores() {
  return useQuery({
    queryKey: ["rex01-recommendation-scores"],
    queryFn: async () => {
      const { data, error } = await fromTable("ai_workforce_recommendation_scores")
        .select("score_overall, score_accuracy, score_usefulness, score_actionability");
      if (error) throw error;
      const scores = data || [];
      if (scores.length === 0) return { avgOverall: 0, avgAccuracy: 0, avgUsefulness: 0, avgActionability: 0, count: 0 };
      const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
      return {
        avgOverall: avg(scores.map((s: Record<string, any>) => s.score_overall || 0)),
        avgAccuracy: avg(scores.filter((s: Record<string, any>) => s.score_accuracy).map((s: Record<string, any>) => s.score_accuracy)),
        avgUsefulness: avg(scores.filter((s: Record<string, any>) => s.score_usefulness).map((s: Record<string, any>) => s.score_usefulness)),
        avgActionability: avg(scores.filter((s: Record<string, any>) => s.score_actionability).map((s: Record<string, any>) => s.score_actionability)),
        count: scores.length,
      };
    },
    staleTime: 30_000,
  });
}

export default function REX01RecommendationIntelligence() {
  const { data: stats, isLoading: statsLoading } = useRecommendationStats();
  const { data: scores, isLoading: scoresLoading } = useRecommendationScores();

  const statusCards = [
    { label: "Total", value: stats?.total || 0, icon: BarChart3, color: "text-blue-400" },
    { label: "Approved", value: stats?.byStatus?.approved || 0, icon: CheckCircle2, color: "text-emerald-400" },
    { label: "Rejected", value: stats?.byStatus?.rejected || 0, icon: XCircle, color: "text-destructive" },
    { label: "Pending", value: (stats?.byStatus?.new || 0) + (stats?.byStatus?.triaged || 0) + (stats?.byStatus?.under_review || 0), icon: Clock, color: "text-amber-400" },
    { label: "Executed", value: stats?.byStatus?.executed || 0, icon: TrendingUp, color: "text-emerald-400" },
    { label: "Bound", value: stats?.bound || 0, icon: AlertTriangle, color: "text-purple-400" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">REX01 — Recommendation Intelligence</h1>
        <p className="text-muted-foreground">Volume, quality, acceptance rates, and execution binding across all recommendations.</p>
      </div>
      <REXSubNav />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statusCards.map((card) => (
          <Card key={card.label} className="bg-card border-border">
            <CardContent className="p-4 text-center">
              <card.icon className={`h-5 w-5 mx-auto mb-2 ${card.color}`} />
              <p className="text-2xl font-bold text-foreground">{statsLoading ? "—" : card.value}</p>
              <p className="text-xs text-muted-foreground">{card.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader><CardTitle className="text-foreground">Quality Scores (Avg)</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {scoresLoading ? (
              <p className="text-muted-foreground">Loading…</p>
            ) : scores?.count === 0 ? (
              <p className="text-muted-foreground">No scores recorded yet.</p>
            ) : (
              <>
                {[
                  { label: "Overall", value: scores?.avgOverall },
                  { label: "Accuracy", value: scores?.avgAccuracy },
                  { label: "Usefulness", value: scores?.avgUsefulness },
                  { label: "Actionability", value: scores?.avgActionability },
                ].map((s) => (
                  <div key={s.label} className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{s.label}</span>
                    <Badge variant="outline" className="font-mono">{(s.value || 0).toFixed(1)}/10</Badge>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground mt-2">{scores?.count} scores total</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader><CardTitle className="text-foreground">By Status</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {statsLoading ? (
              <p className="text-muted-foreground">Loading…</p>
            ) : (
              Object.entries(stats?.byStatus || {}).sort(([, a], [, b]) => (b as number) - (a as number)).map(([status, count]) => (
                <div key={status} className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground capitalize">{status.replace(/_/g, " ")}</span>
                  <Badge variant="secondary">{count as number}</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader><CardTitle className="text-foreground">By Domain</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {statsLoading ? (
              <p className="text-muted-foreground">Loading…</p>
            ) : (
              Object.entries(stats?.byDomain || {}).map(([domain, count]) => (
                <Badge key={domain} variant="outline" className="text-sm">
                  {domain}: {count as number}
                </Badge>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
