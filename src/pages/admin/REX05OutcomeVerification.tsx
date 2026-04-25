import REXSubNav from "@/platform/admin/components/admin/REXSubNav";
import { useQuery } from "@tanstack/react-query";
import { fetchOutcomeVerifications } from "@/lib/core-services/recommendation-execution/recommendation-loop-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle2, XCircle, TrendingUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";



export default function REX05OutcomeVerification() {
  const { data: verifications, isLoading } = useQuery({
    queryKey: ["rex05-outcome-verifications"],
    queryFn: fetchOutcomeVerifications,
    staleTime: 30_000,
  });

  const verified = verifications?.filter((v: Record<string, any>) => v.verified) || [];
  const avgScoreAdj = verified.length > 0
    ? verified.reduce((acc: number,  v: Record<string, any>) => acc + (v.score_adjustment || 0), 0) / verified.length
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">REX05 — Outcome Verification</h1>
        <p className="text-muted-foreground">Post-execution truth: expected vs actual improvement, journey delta, score adjustments.</p>
      </div>
      <REXSubNav />

      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <CheckCircle2 className="h-5 w-5 mx-auto mb-2 text-emerald-400" />
            <p className="text-2xl font-bold text-foreground">{isLoading ? "—" : verified.length}</p>
            <p className="text-xs text-muted-foreground">Verified Outcomes</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <XCircle className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
            <p className="text-2xl font-bold text-foreground">{isLoading ? "—" : (verifications?.length || 0) - verified.length}</p>
            <p className="text-xs text-muted-foreground">Pending Verification</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-5 w-5 mx-auto mb-2 text-blue-400" />
            <p className="text-2xl font-bold text-foreground">{isLoading ? "—" : avgScoreAdj.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground">Avg Score Adjustment</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader><CardTitle className="text-foreground">Outcome Records</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          {isLoading ? (
            <p className="text-muted-foreground">Loading…</p>
          ) : (verifications || []).length === 0 ? (
            <p className="text-muted-foreground">No outcome verifications recorded yet. Execute recommendations and verify their outcomes.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Expected</TableHead>
                  <TableHead>Actual</TableHead>
                  <TableHead>Score Δ</TableHead>
                  <TableHead>Verified</TableHead>
                  <TableHead>When</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(verifications || []).map((v: Record<string, any>) => (
                  <TableRow key={v.id}>
                    <TableCell className="text-foreground text-sm max-w-[200px] truncate">{v.expected_improvement || "—"}</TableCell>
                    <TableCell className="text-foreground text-sm max-w-[200px] truncate">{v.actual_improvement || "—"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">{v.score_adjustment > 0 ? "+" : ""}{v.score_adjustment || 0}</Badge>
                    </TableCell>
                    <TableCell>
                      {v.verified ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <XCircle className="h-4 w-4 text-muted-foreground" />
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(v.created_at), { addSuffix: true })}
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
