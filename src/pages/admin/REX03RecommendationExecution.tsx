import REXSubNav from "@/platform/admin/components/admin/REXSubNav";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDistanceToNow } from "date-fns";



function useRecommendationExecution() {
  return useQuery({
    queryKey: ["rex03-recommendation-execution"],
    queryFn: async () => {
      const { data, error } = await fromTable("ai_workforce_recommendations")
        .select("id, title, status, role_key, domain, execution_binding_status, linked_remediation_program_id, outcome_verification_id, created_at, updated_at")
        .order("updated_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
    staleTime: 15_000,
  });
}

const statusColors: Record<string, string> = {
  new: "bg-blue-500/15 text-blue-400",
  approved: "bg-emerald-500/15 text-emerald-400",
  rejected: "bg-destructive/15 text-destructive",
  executed: "bg-emerald-500/15 text-emerald-400",
  outcome_verified: "bg-purple-500/15 text-purple-400",
  bound_to_execution: "bg-amber-500/15 text-amber-400",
  in_execution: "bg-amber-500/15 text-amber-400",
};

export default function REX03RecommendationExecution() {
  const { data: recs, isLoading } = useRecommendationExecution();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">REX03 — Recommendation → Execution</h1>
        <p className="text-muted-foreground">Per-recommendation lifecycle: status, approval, execution binding, outcome.</p>
      </div>
      <REXSubNav />

      <Card className="bg-card border-border">
        <CardHeader><CardTitle className="text-foreground">Recommendations ({recs?.length || 0})</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          {isLoading ? (
            <p className="text-muted-foreground">Loading…</p>
          ) : (recs || []).length === 0 ? (
            <p className="text-muted-foreground">No recommendations found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Execution</TableHead>
                  <TableHead>Program</TableHead>
                  <TableHead>Outcome</TableHead>
                  <TableHead>Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(recs || []).map((rec: Record<string, any>) => (
                  <TableRow key={rec.id}>
                    <TableCell className="text-foreground text-sm max-w-[200px] truncate">{rec.title || "Untitled"}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[rec.status] || "bg-muted text-muted-foreground"}>
                        {(rec.status || "new").replace(/_/g, " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">{rec.role_key || "—"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {rec.execution_binding_status || "unbound"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {rec.linked_remediation_program_id ? "✓ Linked" : "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {rec.outcome_verification_id ? "✓ Verified" : "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {formatDistanceToNow(new Date(rec.updated_at || rec.created_at), { addSuffix: true })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
