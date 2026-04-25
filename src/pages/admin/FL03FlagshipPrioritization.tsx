import { AdminControlPlaneShell as AdminShell } from "@/platform/admin/components/admin/shells/AdminControlPlaneShell";
import FLSubNav from "@/platform/admin/components/admin/FLSubNav";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Target, TrendingUp, AlertTriangle, Zap, ArrowRight,
  CheckCircle2, Clock, BarChart3
} from "lucide-react";

const FLAGSHIP_LOOPS = [
  {
    key: "FL-AUTH-DASH",
    name: "Sign In → Dashboard → Pulse",
    recommendations: 4,
    remediationTasks: 6,
    blockers: 1,
    completionPct: 78,
    priority: "P0" as const,
  },
  {
    key: "FL-FILES-AI",
    name: "Files → AI Assist",
    recommendations: 3,
    remediationTasks: 5,
    blockers: 2,
    completionPct: 62,
    priority: "P0" as const,
  },
  {
    key: "FL-BOARDROOM",
    name: "Boardroom → Summary → Decision",
    recommendations: 5,
    remediationTasks: 8,
    blockers: 3,
    completionPct: 45,
    priority: "P0" as const,
  },
  {
    key: "FL-CONNECTORS",
    name: "Connected Services → Sync → Insight",
    recommendations: 2,
    remediationTasks: 4,
    blockers: 1,
    completionPct: 55,
    priority: "P1" as const,
  },
  {
    key: "FL-ADMIN-TRUTH",
    name: "Admin Truth → Recommendation → Approval",
    recommendations: 6,
    remediationTasks: 10,
    blockers: 2,
    completionPct: 70,
    priority: "P0" as const,
  },
];

const totalWork = FLAGSHIP_LOOPS.reduce((s, l) => s + l.recommendations + l.remediationTasks, 0);
const flagshipWork = totalWork;
const breadthWork = 23; // simulated non-flagship breadth items
const flagshipRatio = Math.round((flagshipWork / (flagshipWork + breadthWork)) * 100);

const priorityColor = (p: string) =>
  p === "P0" ? "text-destructive" : "text-amber-500";

export default function FL03FlagshipPrioritization() {
  return (
    <AdminShell contextScope="FL03 — Flagship Prioritization">
      <FLSubNav />

      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            FL03 — Flagship Loop Prioritization Board
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Engineering attention allocation — breadth vs. flagship-critical work
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-primary/20">
            <CardContent className="pt-4 pb-3 text-center">
              <div className="text-2xl font-bold text-primary">{flagshipRatio}%</div>
              <div className="text-[10px] text-muted-foreground mt-1">Flagship-Critical Ratio</div>
              <Progress value={flagshipRatio} className="mt-2 h-1.5" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3 text-center">
              <div className="text-2xl font-bold">{FLAGSHIP_LOOPS.reduce((s, l) => s + l.blockers, 0)}</div>
              <div className="text-[10px] text-muted-foreground mt-1">Active Blockers</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3 text-center">
              <div className="text-2xl font-bold">{FLAGSHIP_LOOPS.reduce((s, l) => s + l.recommendations, 0)}</div>
              <div className="text-[10px] text-muted-foreground mt-1">Linked Recommendations</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3 text-center">
              <div className="text-2xl font-bold">{FLAGSHIP_LOOPS.reduce((s, l) => s + l.remediationTasks, 0)}</div>
              <div className="text-[10px] text-muted-foreground mt-1">Remediation Tasks</div>
            </CardContent>
          </Card>
        </div>

        {/* Attention Allocation */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              Engineering Attention Allocation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1">
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-primary font-medium">Flagship-Critical ({flagshipWork} items)</span>
                  <span className="text-muted-foreground">Breadth ({breadthWork} items)</span>
                </div>
                <div className="h-4 rounded-full overflow-hidden bg-muted flex">
                  <div className="bg-primary h-full transition-all" style={{ width: `${flagshipRatio}%` }} />
                  <div className="bg-muted-foreground/30 h-full flex-1" />
                </div>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground">
              <Zap className="inline h-3 w-3 mr-1 text-amber-500" />
              Recommendation: Maintain ≥70% flagship allocation. Current ratio is healthy.
            </p>
          </CardContent>
        </Card>

        {/* Per-Loop Breakdown */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold">Per-Loop Impact & Priority</h2>
          {FLAGSHIP_LOOPS.map(loop => (
            <Card key={loop.key} className="hover:border-primary/30 transition-colors">
              <CardContent className="py-3 px-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`text-[9px] font-mono ${priorityColor(loop.priority)}`}>
                      {loop.priority}
                    </Badge>
                    <span className="text-xs font-medium">{loop.name}</span>
                  </div>
                  <Badge variant="secondary" className="text-[9px] font-mono">{loop.key}</Badge>
                </div>
                <div className="grid grid-cols-4 gap-4 mt-2">
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <TrendingUp className="h-3 w-3 text-blue-500" />
                    <span>{loop.recommendations} recommendations</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <ArrowRight className="h-3 w-3 text-emerald-500" />
                    <span>{loop.remediationTasks} tasks</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <AlertTriangle className="h-3 w-3 text-destructive" />
                    <span>{loop.blockers} blockers</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px]">
                    {loop.completionPct >= 70 ? (
                      <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                    ) : (
                      <Clock className="h-3 w-3 text-amber-500" />
                    )}
                    <span>{loop.completionPct}% complete</span>
                  </div>
                </div>
                <Progress value={loop.completionPct} className="mt-2 h-1" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
