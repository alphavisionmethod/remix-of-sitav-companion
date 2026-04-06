import { useQuery } from "@tanstack/react-query";
import { fetchFlagshipLoops } from "@/lib/services/flagship-loops/flagship-loop-service";
import { getDomainsByFlagshipLoop } from "@/lib/services/service-registry/service-ownership-registry";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSearchParams } from "react-router-dom";
import { Route, Server, ShieldCheck, AlertTriangle, Layers } from "lucide-react";

export default function FL02FlagshipLoopDetail() {
  const [searchParams] = useSearchParams();
  const loopKey = searchParams.get("loop") || "";

  const { data: loops, isLoading } = useQuery({
    queryKey: ["fl02-flagship-loop-detail"],
    queryFn: fetchFlagshipLoops,
    staleTime: 30_000,
  });

  const loop = (loops || []).find((l: any) => l.loop_key === loopKey);
  const domains = getDomainsByFlagshipLoop(loopKey);

  if (isLoading) return <p className="text-muted-foreground p-6">Loading…</p>;

  if (!loop) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">FL02 — Flagship Loop Detail</h1>
        <Card className="bg-card border-border">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              {loopKey ? `Loop "${loopKey}" not found.` : "No loop selected. Add ?loop=sign-in-dashboard-pulse to the URL."}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Available loops: sign-in-dashboard-pulse, files-ai-assist, boardroom-summary-decision, connected-services-sync, admin-truth-recommendation-approval
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const routes = Array.isArray(loop.routes) ? loop.routes : [];
  const capabilities = Array.isArray(loop.capabilities) ? loop.capabilities : [];
  const services = Array.isArray(loop.primary_services) ? loop.primary_services : [];
  const cjEntries = Array.isArray(loop.cj_entries) ? loop.cj_entries : [];
  const blockers = Array.isArray(loop.launch_blockers) ? loop.launch_blockers : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">FL02 — {loop.title}</h1>
        <p className="text-muted-foreground">{loop.target_persona} · Owner: {loop.owner}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <ShieldCheck className="h-5 w-5 mx-auto mb-2 text-emerald-400" />
            <p className="text-sm font-bold text-foreground">{loop.proof_status}</p>
            <p className="text-xs text-muted-foreground">Proof Status</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <Layers className="h-5 w-5 mx-auto mb-2 text-blue-400" />
            <p className="text-sm font-bold text-foreground">{loop.ux_quality}</p>
            <p className="text-xs text-muted-foreground">UX Quality</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <p className="text-sm font-bold text-foreground">{loop.launch_claim_status?.replace(/_/g, " ")}</p>
            <p className="text-xs text-muted-foreground">Launch Claim</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <p className="text-sm font-bold text-foreground">{loop.demo_vs_real}</p>
            <p className="text-xs text-muted-foreground">Demo vs Real</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader><CardTitle className="text-foreground flex items-center gap-2"><Route className="h-4 w-4" /> Routes ({routes.length})</CardTitle></CardHeader>
          <CardContent className="space-y-1">
            {routes.map((r: string) => (
              <Badge key={r} variant="outline" className="mr-1 mb-1 text-xs font-mono">{r}</Badge>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader><CardTitle className="text-foreground flex items-center gap-2"><Server className="h-4 w-4" /> Services ({services.length})</CardTitle></CardHeader>
          <CardContent className="space-y-1">
            {services.map((s: string) => (
              <Badge key={s} variant="outline" className="mr-1 mb-1 text-xs">{s}</Badge>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader><CardTitle className="text-foreground">Capabilities ({capabilities.length})</CardTitle></CardHeader>
          <CardContent className="space-y-1">
            {capabilities.map((c: string) => (
              <Badge key={c} variant="outline" className="mr-1 mb-1 text-xs">{c}</Badge>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader><CardTitle className="text-foreground">CJ Entries ({cjEntries.length})</CardTitle></CardHeader>
          <CardContent className="space-y-1">
            {cjEntries.map((e: string) => (
              <Badge key={e} variant="outline" className="mr-1 mb-1 text-xs">{e}</Badge>
            ))}
          </CardContent>
        </Card>
      </div>

      {blockers.length > 0 && (
        <Card className="bg-card border-border border-amber-500/30">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400" /> Launch Blockers ({blockers.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {blockers.map((b: string) => (
              <div key={b} className="flex items-center gap-2 text-sm text-amber-400">
                <AlertTriangle className="h-3 w-3" />
                {b}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {domains.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader><CardTitle className="text-foreground">Linked Service Domains ({domains.length})</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {domains.map((d) => (
              <div key={d.domain} className="flex items-center justify-between p-2 rounded bg-muted/30 border border-border">
                <div>
                  <p className="text-sm font-medium text-foreground">{d.displayName}</p>
                  <p className="text-xs text-muted-foreground">{d.primaryService}</p>
                </div>
                <Badge variant="outline">{d.launchCriticality}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
