// ═══════════════════════════════════════════════════════════════
// SITA OS — Backend Topology & DB Health Dashboard
// Admin page: edge function classifications + table health scores
// ═══════════════════════════════════════════════════════════════

import { useBackendTopologyHealth } from "@/admin/hooks/useBackendTopologyHealth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle2, AlertTriangle, XCircle, Database, Zap, Shield, Users } from "lucide-react";

const CATEGORY_COLORS: Record<string, string> = {
  admin: "bg-red-500/20 text-red-400 border-red-500/30",
  advisor: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  agent: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  ai: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  cloud: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  connector: "bg-green-500/20 text-green-400 border-green-500/30",
  finance: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  notification: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  os: "bg-slate-500/20 text-slate-300 border-slate-500/30",
  platform: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  user: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  compliance: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  intelligence: "bg-violet-500/20 text-violet-400 border-violet-500/30",
  unknown: "bg-muted text-muted-foreground border-border",
};

export default function BackendTopologyDashboard() {
  const { topology, dbHealth, categoryCounts, ownerCounts, functionDetails } = useBackendTopologyHealth();

  const topologyScore = topology.stats.totalFunctions > 0
    ? Math.round(
        ((topology.stats.categorized + topology.stats.authed + topology.stats.owned +
          topology.stats.contextMapped + topology.stats.contractMapped + topology.stats.tableMapped) /
          (topology.stats.totalFunctions * 6)) * 100
      )
    : 0;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Backend Topology & DB Health</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Edge function classifications, ownership mappings, and database health scores
        </p>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2"><Zap className="h-4 w-4" /> Edge Functions</CardDescription>
            <CardTitle className="text-3xl">{topology.stats.totalFunctions}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {topology.valid
                ? <><CheckCircle2 className="h-4 w-4 text-green-400" /><span className="text-sm text-green-400">Topology Valid</span></>
                : <><XCircle className="h-4 w-4 text-red-400" /><span className="text-sm text-red-400">{topology.errors.length} errors</span></>
              }
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2"><Shield className="h-4 w-4" /> Topology Coverage</CardDescription>
            <CardTitle className="text-3xl">{topologyScore}%</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={topologyScore} className="h-2" />
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2"><Database className="h-4 w-4" /> DB Health Score</CardDescription>
            <CardTitle className="text-3xl">{dbHealth.healthScore}/100</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={dbHealth.healthScore} className="h-2" />
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2"><Users className="h-4 w-4" /> RLS Coverage</CardDescription>
            <CardTitle className="text-3xl">{dbHealth.rlsCoverage}%</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              {dbHealth.totalTables} tables · {dbHealth.auditedTables} audited · {dbHealth.dependencyEdges} dep edges
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Topology Errors/Warnings ── */}
      {(topology.errors.length > 0 || topology.warnings.length > 0) && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Topology Issues</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {topology.errors.map((e, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <XCircle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
                <span className="text-red-300">{e}</span>
              </div>
            ))}
            {topology.warnings.map((w, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <AlertTriangle className="h-4 w-4 text-yellow-400 mt-0.5 shrink-0" />
                <span className="text-yellow-300">{w}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* ── DB Health Issues ── */}
      {dbHealth.issues.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Database Issues</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {dbHealth.issues.map((issue, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <AlertTriangle className="h-4 w-4 text-yellow-400 mt-0.5 shrink-0" />
                <span className="text-yellow-300">{issue}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* ── Category Breakdown ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Functions by Category</CardTitle>
            <CardDescription>{Object.keys(categoryCounts).length} categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.entries(categoryCounts)
                .sort(([, a], [, b]) => b - a)
                .map(([cat, count]) => (
                  <Badge key={cat} variant="outline" className={`${CATEGORY_COLORS[cat] || CATEGORY_COLORS.unknown} text-xs`}>
                    {cat}: {count}
                  </Badge>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Functions by Owner</CardTitle>
            <CardDescription>{Object.keys(ownerCounts).length} teams</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(ownerCounts)
                .sort(([, a], [, b]) => b - a)
                .map(([owner, count]) => (
                  <div key={owner} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{owner}</span>
                    <Badge variant="secondary" className="text-xs">{count}</Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Coverage Matrix ── */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg">Topology Coverage Matrix</CardTitle>
          <CardDescription>Per-dimension coverage for all {topology.stats.totalFunctions} functions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {([
              ["Categorized", topology.stats.categorized],
              ["Auth Mapped", topology.stats.authed],
              ["Owned", topology.stats.owned],
              ["Context", topology.stats.contextMapped],
              ["Contract", topology.stats.contractMapped],
              ["Table Map", topology.stats.tableMapped],
            ] as const).map(([label, val]) => {
              const pct = Math.round((val / topology.stats.totalFunctions) * 100);
              return (
                <div key={label} className="text-center">
                  <div className="text-2xl font-bold text-foreground">{val}/{topology.stats.totalFunctions}</div>
                  <Progress value={pct} className="h-1.5 mt-1" />
                  <div className="text-xs text-muted-foreground mt-1">{label}</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ── Function Registry Table ── */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg">Edge Function Registry</CardTitle>
          <CardDescription>All {functionDetails.length} registered functions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-h-[500px] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Function</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {functionDetails.map(f => (
                  <TableRow key={f.name}>
                    <TableCell className="font-mono text-xs">{f.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`${CATEGORY_COLORS[f.category] || CATEGORY_COLORS.unknown} text-xs`}>
                        {f.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{f.owner}</TableCell>
                    <TableCell>
                      <Badge variant={f.status === "active" ? "default" : "secondary"} className="text-xs">
                        {f.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
