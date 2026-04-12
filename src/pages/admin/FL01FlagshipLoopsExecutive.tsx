import { useAction } from "@/hooks/use-action";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchFlagshipLoops,
  seedFlagshipLoops,
  getOverallTruthScore,
  getLoopGrade,
  getImportanceBadge,
  getStatusBadge,
} from "@/lib/core-services/flagship-loops/flagship-loop-service";
import { getDomainsByFlagshipLoop } from "@/lib/core-services/service-registry/service-ownership-registry";
import { supabase } from "@/integrations/supabase/client";
const db = supabase as any;
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Rocket,
  ShieldCheck,
  AlertTriangle,
  Zap,
  RefreshCw,
  Target,
  Activity,
  Eye,
  Palette,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useDataMode } from "@/contexts/DataModeContext";



function TruthRing({ pct, size = 80 }: { pct: number; size?: number }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;
  const { grade, color } = getLoopGrade(pct);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth="4" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={pct >= 80 ? "hsl(var(--chart-2))" : pct >= 60 ? "hsl(var(--chart-4))" : "hsl(var(--destructive))"}
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-lg font-bold ${color}`}>{pct}%</span>
        <span className={`text-[10px] font-semibold ${color}`}>{grade}</span>
      </div>
    </div>
  );
}

function DimensionBar({ label, score, icon }: { label: string; score: number; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-4 h-4 text-muted-foreground">{icon}</div>
      <span className="text-xs text-muted-foreground w-16 shrink-0">{label}</span>
      <div className="flex-1">
        <Progress value={score} className="h-1.5" />
      </div>
      <span className="text-xs font-mono text-foreground w-8 text-right">{score}</span>
    </div>
  );
}

export default function FL01FlagshipLoopsExecutive() {
  const { isDemoMode } = useDataMode();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data: loops, isLoading } = useQuery({
    queryKey: ["fl01-flagship-loops"],
    queryFn: fetchFlagshipLoops,
    staleTime: 30_000,
  });

  // Fetch latest verification runs for proof overlay
  const { data: verificationRuns } = useQuery({
    queryKey: ["fl01-verification-runs"],
    queryFn: async () => {
      const { data } = await db.from("journey_verification_runs")
        .select("*")
        .order("completed_at", { ascending: false })
        .limit(50);
      return data || [];
    },
    staleTime: 60_000,
  });

  const seedMutation = useAction("admin", "seed.run", {
    invalidateKeys: [["fl01-flagship-loops"]],
  });

  const loopList = loops || [];
  const overallTruth = getOverallTruthScore(loopList);
  const { grade: overallGrade, color: overallColor } = getLoopGrade(overallTruth);
  const criticalCount = loopList.filter((l: Record<string, any>) => l.launch_importance === "launch_critical").length;
  const activeCount = loopList.filter((l: Record<string, any>) => l.status === "active").length;
  const blockerCount = loopList.reduce((s: number,  l: Record<string, any>) => s + (Array.isArray(l.launch_blockers) ? l.launch_blockers.length : 0), 0);

  // Map verification runs to loop keys for proof overlay
  const loopProofMap = new Map<string, { passed: number; failed: number; lastRun: string; confidence: string; commitSha: string }>();
  const LOOP_KEY_TO_JOURNEY_PATTERNS: Record<string, string[]> = {
    "loop1_auth_dashboard": ["auth", "dashboard", "sign-in", "sign-out"],
    "loop2_files_ai": ["files", "ai-assist", "upload"],
    "loop3_boardroom": ["boardroom", "summary", "decision"],
    "loop4_connectors_sync": ["connector", "sync", "connected"],
    "loop5_admin_truth": ["admin", "verification", "approval", "truth"],
  };

  for (const run of ((verificationRuns || []) as Array<Record<string, unknown>>)) {
    for (const [loopKey, patterns] of Object.entries(LOOP_KEY_TO_JOURNEY_PATTERNS)) {
      const summary = String(run.summary || "").toLowerCase();
      if (patterns.some(p => summary.includes(p))) {
        const existing = loopProofMap.get(loopKey);
        if (!existing || new Date(String(run.completed_at)) > new Date(existing.lastRun)) {
          loopProofMap.set(loopKey, {
            passed: Number(run.steps_passed) || 0,
            failed: Number(run.steps_failed) || 0,
            lastRun: String(run.completed_at),
            confidence: String(run.proof_confidence || "inferred"),
            commitSha: String(run.commit_sha || ""),
          });
        }
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">FL01 — Flagship Loops Executive</h1>
          <p className="text-muted-foreground text-sm">5 flagship product loops — health, truth, proof, and launch readiness.</p>
        </div>
        <Button
          onClick={() => seedMutation.mutate({})}
          disabled={seedMutation.isPending}
          size="sm"
          variant={loopList.length === 0 ? "default" : "outline"}
        >
          {loopList.length === 0 ? <Rocket className="h-4 w-4 mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
          {loopList.length === 0 ? "Seed Flagship Loops" : "Refresh Data"}
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="bg-card border-border animate-pulse h-24" />
          ))}
        </div>
      ) : loopList.length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="p-12 text-center">
            <Rocket className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium text-foreground mb-1">No flagship loops defined</p>
            <p className="text-muted-foreground text-sm mb-4">Click "Seed Flagship Loops" to initialize the 5 core product loops.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Executive Summary Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-card border-border">
              <CardContent className="p-4 flex items-center gap-3">
                <TruthRing pct={overallTruth} size={56} />
                <div>
                  <p className="text-xs text-muted-foreground">Overall Truth</p>
                  <p className={`text-xl font-bold ${overallColor}`}>{overallTruth}%</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="h-4 w-4 text-destructive" />
                  <p className="text-xs text-muted-foreground">Launch Critical</p>
                </div>
                <p className="text-2xl font-bold text-foreground">{criticalCount}</p>
                <p className="text-xs text-muted-foreground">of {loopList.length} loops</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <p className="text-xs text-muted-foreground">Active</p>
                </div>
                <p className="text-2xl font-bold text-foreground">{activeCount}</p>
                <p className="text-xs text-muted-foreground">loops operational</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                  <p className="text-xs text-muted-foreground">Total Blockers</p>
                </div>
                <p className="text-2xl font-bold text-foreground">{blockerCount}</p>
                <p className="text-xs text-muted-foreground">across all loops</p>
              </CardContent>
            </Card>
          </div>

          {/* Loop Cards */}
          <div className="space-y-4">
          {loopList.map((loop: Record<string, any>) => {
              const domains = getDomainsByFlagshipLoop(loop.loop_key);
              const blockers = Array.isArray(loop.launch_blockers) ? loop.launch_blockers : [];
              const routes = Array.isArray(loop.routes) ? loop.routes : [];
              const services = Array.isArray(loop.primary_services) ? loop.primary_services : [];
              const nextActions = Array.isArray(loop.next_actions) ? loop.next_actions : [];
              const importance = getImportanceBadge(loop.launch_importance || "");
              const status = getStatusBadge(loop.status || "");
              const truthPct = loop.truth_pct || 0;
              const proof = loopProofMap.get(loop.loop_key);

              return (
                <Card
                  key={loop.id}
                  className="bg-card border-border hover:border-primary/30 transition-colors cursor-pointer"
                  onClick={() => navigate(`/admin/fl02-flagship-loop-detail?loop=${loop.loop_key}`)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-5">
                      {/* Truth Ring */}
                      <div className="shrink-0 hidden sm:block">
                        <TruthRing pct={truthPct} size={72} />
                      </div>

                      {/* Main Content */}
                      <div className="flex-1 min-w-0 space-y-3">
                        {/* Title Row */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-semibold text-foreground">{loop.title}</h3>
                          <Badge className={`text-xs ${importance.color}`}>
                            {importance.icon} {importance.label}
                          </Badge>
                          <Badge className={`text-xs ${status.color}`}>
                            {status.label}
                          </Badge>
                          <span className="text-xs text-muted-foreground ml-auto hidden md:inline">
                            {loop.target_persona} · {routes.length} routes · {services.length} services · {domains.length} domains
                          </span>
                        </div>

                        {/* Description */}
                        {loop.description && (
                          <p className="text-xs text-muted-foreground leading-relaxed">{loop.description}</p>
                        )}

                        {/* Dimension Scores */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-1.5">
                          <DimensionBar label="Structure" score={loop.structural_score || 0} icon={<Zap className="h-3 w-3" />} />
                          <DimensionBar label="Runtime" score={loop.runtime_score || 0} icon={<Activity className="h-3 w-3" />} />
                          <DimensionBar label="Proof" score={loop.proof_score || 0} icon={<Eye className="h-3 w-3" />} />
                          <DimensionBar label="UX" score={loop.ux_score || 0} icon={<Palette className="h-3 w-3" />} />
                        </div>

                        {/* E2E Proof Overlay */}
                        {proof && (
                          <div className="flex items-center gap-3 p-2 rounded bg-muted/30 border border-border">
                            <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                            <span className="text-xs text-muted-foreground">
                              E2E: <span className="text-emerald-400 font-semibold">{proof.passed}✅</span>
                              {proof.failed > 0 && <span className="text-destructive font-semibold ml-1">{proof.failed}❌</span>}
                              {" · "}
                              <Badge variant="outline" className="text-[10px] ml-1">{proof.confidence}</Badge>
                              {proof.commitSha && <span className="font-mono ml-1">{proof.commitSha.slice(0, 7)}</span>}
                              {" · "}
                              <span>{new Date(proof.lastRun).toLocaleDateString()}</span>
                            </span>
                          </div>
                        )}

                        {/* Blockers + Next Actions */}
                        <div className="flex flex-col md:flex-row gap-4">
                          {blockers.length > 0 && (
                            <div className="flex items-start gap-1.5 text-xs text-amber-400">
                              <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />
                              <span>{blockers.length} blocker{blockers.length !== 1 ? "s" : ""}: {blockers.slice(0, 2).join(", ")}{blockers.length > 2 ? "…" : ""}</span>
                            </div>
                          )}
                          {nextActions.length > 0 && (
                            <div className="flex items-start gap-1.5 text-xs text-blue-400">
                              <Clock className="h-3 w-3 mt-0.5 shrink-0" />
                              <span>Next: {nextActions[0]}</span>
                            </div>
                          )}
                        </div>

                        {/* Bottom Row */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="text-[10px]">{loop.demo_vs_real}</Badge>
                          <Badge variant="outline" className="text-[10px]">UX: {loop.ux_quality}</Badge>
                          <Badge variant="outline" className="text-[10px]">{loop.launch_claim_status?.replace(/_/g, " ")}</Badge>
                          <div className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                            <span>View Detail</span>
                            <ArrowRight className="h-3 w-3" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
