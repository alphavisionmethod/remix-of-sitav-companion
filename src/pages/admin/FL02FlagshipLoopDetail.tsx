import { useQuery } from "@tanstack/react-query";
import {
  fetchFlagshipLoops,
  getLoopGrade,
  getImportanceBadge,
  getStatusBadge,
} from "@/lib/services/flagship-loops/flagship-loop-service";
import { getDomainsByFlagshipLoop } from "@/lib/services/service-registry/service-ownership-registry";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Route,
  Server,
  ShieldCheck,
  AlertTriangle,
  Layers,
  Activity,
  Eye,
  Palette,
  Zap,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDataMode } from "@/contexts/DataModeContext";

function ScoreCard({ label, score, icon, description }: { label: string; score: number; icon: React.ReactNode; description: string }) {
  const { grade, color } = getLoopGrade(score);
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="text-muted-foreground">{icon}</div>
          <span className="text-sm font-medium text-foreground">{label}</span>
          <span className={`text-sm font-bold ml-auto ${color}`}>{score}/100 ({grade})</span>
        </div>
        <Progress value={score} className="h-2 mb-1.5" />
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

export default function FL02FlagshipLoopDetail() {
  const { isDemoMode } = useDataMode();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
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
              Available: sign-in-dashboard-pulse, files-ai-assist, boardroom-summary-decision, connected-services-sync, admin-truth-recommendation-approval
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
  const nextActions = Array.isArray(loop.next_actions) ? loop.next_actions : [];
  const truthPct = loop.truth_pct || 0;
  const { grade, color } = getLoopGrade(truthPct);
  const importance = getImportanceBadge(loop.launch_importance || "");
  const status = getStatusBadge(loop.status || "");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/fl01-flagship-loops")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold text-foreground">{loop.title}</h1>
            <Badge className={`text-xs ${importance.color}`}>{importance.icon} {importance.label}</Badge>
            <Badge className={`text-xs ${status.color}`}>{status.label}</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">{loop.description || `${loop.target_persona} · Owner: ${loop.owner}`}</p>
        </div>
        <div className="text-center shrink-0">
          <div className={`text-3xl font-bold ${color}`}>{truthPct}%</div>
          <div className={`text-xs font-semibold ${color}`}>Grade {grade}</div>
        </div>
      </div>

      {/* Dimension Scores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ScoreCard label="Structural" score={loop.structural_score || 0} icon={<Zap className="h-4 w-4" />} description="Routes, components, services, schema exist" />
        <ScoreCard label="Runtime" score={loop.runtime_score || 0} icon={<Activity className="h-4 w-4" />} description="Live connections, edge functions, providers" />
        <ScoreCard label="Proof" score={loop.proof_score || 0} icon={<Eye className="h-4 w-4" />} description="Playwright tests, journey evidence, CI gates" />
        <ScoreCard label="UX Quality" score={loop.ux_score || 0} icon={<Palette className="h-4 w-4" />} description="Polish, empty states, error handling, trust" />
      </div>

      {/* Status Overview */}
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

      {/* Next Actions */}
      {nextActions.length > 0 && (
        <Card className="bg-card border-border border-blue-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-foreground flex items-center gap-2 text-base">
              <Clock className="h-4 w-4 text-blue-400" />
              Next Actions ({nextActions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {nextActions.map((action: string, i: number) => (
                <div key={i} className="flex items-start gap-2 p-2 rounded bg-blue-500/5 border border-blue-500/10">
                  <span className="text-xs font-bold text-blue-400 shrink-0 mt-0.5">{i + 1}.</span>
                  <span className="text-sm text-foreground">{action}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Launch Blockers */}
      {blockers.length > 0 && (
        <Card className="bg-card border-border border-amber-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-foreground flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              Launch Blockers ({blockers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="text-muted-foreground">Blocker</TableHead>
                  <TableHead className="text-muted-foreground w-24">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {blockers.map((b: string) => (
                  <TableRow key={b} className="border-border">
                    <TableCell className="text-sm text-foreground font-mono">{b}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-amber-400 border-amber-500/30 text-xs">Pending</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Routes + Services + Capabilities + CJ Entries */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-foreground flex items-center gap-2 text-base">
              <Route className="h-4 w-4" /> Routes ({routes.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-1.5">
            {routes.map((r: string) => (
              <Badge key={r} variant="outline" className="text-xs font-mono">{r}</Badge>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-foreground flex items-center gap-2 text-base">
              <Server className="h-4 w-4" /> Services ({services.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-1.5">
            {services.map((s: string) => (
              <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-foreground text-base">Capabilities ({capabilities.length})</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-1.5">
            {capabilities.map((c: string) => (
              <Badge key={c} variant="outline" className="text-xs">{c}</Badge>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-foreground text-base">Journey Entries ({cjEntries.length})</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-1.5">
            {cjEntries.map((e: string) => (
              <Badge key={e} variant="outline" className="text-xs">{e}</Badge>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Linked Service Domains */}
      {domains.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-foreground text-base">Linked Service Domains ({domains.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {domains.map((d) => (
              <div key={d.domain} className="flex items-center justify-between p-2.5 rounded bg-muted/30 border border-border">
                <div>
                  <p className="text-sm font-medium text-foreground">{d.displayName}</p>
                  <p className="text-xs text-muted-foreground">{d.primaryService}</p>
                </div>
                <Badge variant="outline" className="text-xs">{d.launchCriticality}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
