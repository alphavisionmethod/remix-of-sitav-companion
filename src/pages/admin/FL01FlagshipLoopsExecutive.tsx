import { useQuery } from "@tanstack/react-query";
import { fetchFlagshipLoops, seedFlagshipLoops } from "@/lib/services/flagship-loops/flagship-loop-service";
import { getDomainsByFlagshipLoop } from "@/lib/services/service-registry/service-ownership-registry";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Rocket, ShieldCheck, AlertTriangle, Zap, RefreshCw } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const proofColors: Record<string, string> = {
  verified: "bg-emerald-500/15 text-emerald-400",
  partial: "bg-amber-500/15 text-amber-400",
  unverified: "bg-muted text-muted-foreground",
};

const claimColors: Record<string, string> = {
  claimable: "bg-emerald-500/15 text-emerald-400",
  claimable_with_qualifier: "bg-amber-500/15 text-amber-400",
  not_claimable: "bg-destructive/15 text-destructive",
  internal_only: "bg-blue-500/15 text-blue-400",
};

export default function FL01FlagshipLoopsExecutive() {
  const queryClient = useQueryClient();
  const { data: loops, isLoading } = useQuery({
    queryKey: ["fl01-flagship-loops"],
    queryFn: fetchFlagshipLoops,
    staleTime: 30_000,
  });

  const seedMutation = useMutation({
    mutationFn: seedFlagshipLoops,
    onSuccess: (results) => {
      const seeded = results.filter((r) => r.status === "seeded").length;
      toast.success(`Seeded ${seeded} flagship loops`);
      queryClient.invalidateQueries({ queryKey: ["fl01-flagship-loops"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">FL01 — Flagship Loops Executive</h1>
          <p className="text-muted-foreground">5 flagship product loops: health, proof, blockers, launch readiness.</p>
        </div>
        {(loops || []).length === 0 && (
          <Button onClick={() => seedMutation.mutate()} disabled={seedMutation.isPending} size="sm">
            <Rocket className="h-4 w-4 mr-2" />
            Seed Flagship Loops
          </Button>
        )}
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : (loops || []).length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="p-8 text-center">
            <Rocket className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">No flagship loops defined yet. Click "Seed Flagship Loops" to initialize.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(loops || []).map((loop: any) => {
            const domains = getDomainsByFlagshipLoop(loop.loop_key);
            const blockers = Array.isArray(loop.launch_blockers) ? loop.launch_blockers : [];
            return (
              <Card key={loop.id} className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-foreground text-base">{loop.title}</CardTitle>
                  <p className="text-xs text-muted-foreground">{loop.target_persona} · {loop.owner}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-1.5">
                    <Badge className={proofColors[loop.proof_status] || proofColors.unverified}>
                      <ShieldCheck className="h-3 w-3 mr-1" />
                      {loop.proof_status}
                    </Badge>
                    <Badge className={claimColors[loop.launch_claim_status] || claimColors.not_claimable}>
                      {loop.launch_claim_status?.replace(/_/g, " ")}
                    </Badge>
                    <Badge variant="outline" className="text-xs">{loop.demo_vs_real}</Badge>
                    <Badge variant="outline" className="text-xs">UX: {loop.ux_quality}</Badge>
                  </div>

                  {blockers.length > 0 && (
                    <div className="flex items-center gap-1 text-xs text-amber-400">
                      <AlertTriangle className="h-3 w-3" />
                      {blockers.length} blocker{blockers.length !== 1 ? "s" : ""}
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground">
                    {domains.length} service domain{domains.length !== 1 ? "s" : ""} ·{" "}
                    {(Array.isArray(loop.routes) ? loop.routes : []).length} routes
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
