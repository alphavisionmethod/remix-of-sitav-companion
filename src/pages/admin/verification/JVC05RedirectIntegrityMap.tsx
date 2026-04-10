// ═══════════════════════════════════════════════════════
// SITA OS — JVC05: Redirect Integrity Map
// Visualize navigation correctness, detect dead ends/loops
// ═══════════════════════════════════════════════════════

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { SURFACE_REGISTRY, type SurfaceEntry } from "@/lib/verification/surface-registry";
import { useVerificationRuns } from "@/lib/verification/verification-hooks";
import { ArrowRight, AlertTriangle, GitBranch, Search, Shield, XCircle, CheckCircle2, RotateCcw } from "lucide-react";

const ALL_ROUTES = [...new Set(SURFACE_REGISTRY.filter(s => s.surfaceClass === "page").map(s => s.routePath))];

function detectLoops(redirects: SurfaceEntry[]): string[][] {
  const loops: string[][] = [];
  const graph = new Map<string, string>();
  redirects.forEach(r => { if (r.redirectTarget) graph.set(r.routePath, r.redirectTarget); });
  graph.forEach((_, start) => {
    const visited = new Set<string>();
    let current: string | undefined = start;
    const path: string[] = [];
    while (current && !visited.has(current)) {
      visited.add(current);
      path.push(current);
      current = graph.get(current);
    }
    if (current && visited.has(current)) {
      const loopStart = path.indexOf(current);
      loops.push(path.slice(loopStart));
    }
  });
  return loops;
}

function findDeadEnds(): string[] {
  const routesWithOutbound = new Set(SURFACE_REGISTRY.filter(s => s.actionType === "navigation" || s.redirectTarget).map(s => s.routePath));
  return ALL_ROUTES.filter(r => !routesWithOutbound.has(r) && !r.includes("*"));
}

export default function JVC05RedirectIntegrityMap() {
  const [search, setSearch] = useState("");
  const { data: runs } = useVerificationRuns();

  const redirectSurfaces = useMemo(() =>
    SURFACE_REGISTRY.filter(s => s.surfaceClass === "redirect" || s.redirectTarget),
    []
  );

  const loops = useMemo(() => detectLoops(redirectSurfaces), [redirectSurfaces]);
  const deadEnds = useMemo(() => findDeadEnds(), []);

  const authRedirects = redirectSurfaces.filter(s => s.domain === "auth");
  const otherRedirects = redirectSurfaces.filter(s => s.domain !== "auth");

  const filtered = redirectSurfaces.filter(s =>
    !search || s.routeKey.toLowerCase().includes(search.toLowerCase()) || s.actionLabel.toLowerCase().includes(search.toLowerCase())
  );

  const brokenRedirects = redirectSurfaces.filter(s => {
    if (!s.redirectTarget || s.redirectTarget.includes("*")) return false;
    return !ALL_ROUTES.includes(s.redirectTarget) && !SURFACE_REGISTRY.some(sr => sr.routePath === s.redirectTarget);
  });

  const totalRedirects = redirectSurfaces.length;
  const verified = runs?.filter((r: any) => redirectSurfaces.some(s => s.routeKey === r.route_key) && r.passed).length || 0;

  return (
    <div className="space-y-6 p-6" data-testid="jvc05-redirect-integrity">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <GitBranch className="h-6 w-6 text-primary" />
          JVC05 — Redirect Integrity Map
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Navigation correctness, dead ends, loops, and auth flows</p>
      </div>

      {/* KPI Band */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card><CardContent className="pt-4 text-center">
          <div className="text-2xl font-bold">{totalRedirects}</div>
          <div className="text-xs text-muted-foreground">Total Redirects</div>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <div className="text-2xl font-bold text-emerald-400">{verified}</div>
          <div className="text-xs text-muted-foreground">Verified</div>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <div className="text-2xl font-bold text-destructive">{brokenRedirects.length}</div>
          <div className="text-xs text-muted-foreground">Broken</div>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <div className="text-2xl font-bold text-amber-400">{deadEnds.length}</div>
          <div className="text-xs text-muted-foreground">Dead Ends</div>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <div className="text-2xl font-bold text-orange-400">{loops.length}</div>
          <div className="text-xs text-muted-foreground">Loop Risks</div>
        </CardContent></Card>
      </div>

      {/* Auth Redirect Flow */}
      <Card>
        <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Shield className="h-4 w-4" /> Auth & Permission Redirect Flows</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {authRedirects.map(r => (
              <div key={r.routeKey} className="flex items-center gap-3 p-2 rounded-md bg-muted/30">
                <Badge variant="outline" className="text-xs font-mono">{r.routePath}</Badge>
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                <Badge variant="outline" className="text-xs font-mono">{r.redirectTarget || "—"}</Badge>
                <span className="text-xs text-muted-foreground ml-auto">{r.actionLabel}</span>
                <CheckCircle2 className="h-3 w-3 text-emerald-400" />
              </div>
            ))}
            {authRedirects.length === 0 && <p className="text-xs text-muted-foreground">No auth redirects registered</p>}
          </div>
        </CardContent>
      </Card>

      {/* Loop Warnings */}
      {loops.length > 0 && (
        <Card className="border-orange-500/30">
          <CardHeader><CardTitle className="text-sm flex items-center gap-2 text-orange-400"><RotateCcw className="h-4 w-4" /> Redirect Loop Risks</CardTitle></CardHeader>
          <CardContent>
            {loops.map((loop, i) => (
              <div key={i} className="flex items-center gap-2 p-2 bg-orange-500/10 rounded-md mb-2">
                {loop.map((step, j) => (
                  <span key={j} className="flex items-center gap-1">
                    <Badge variant="outline" className="text-xs font-mono">{step}</Badge>
                    {j < loop.length - 1 && <ArrowRight className="h-3 w-3 text-orange-400" />}
                  </span>
                ))}
                <ArrowRight className="h-3 w-3 text-orange-400" />
                <Badge variant="outline" className="text-xs font-mono text-orange-400">{loop[0]}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Dead End Warnings */}
      {deadEnds.length > 0 && (
        <Card className="border-amber-500/30">
          <CardHeader><CardTitle className="text-sm flex items-center gap-2 text-amber-400"><AlertTriangle className="h-4 w-4" /> Dead End Routes</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {deadEnds.map(de => (
                <Badge key={de} variant="outline" className="text-xs font-mono">{de}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Broken Redirects */}
      {brokenRedirects.length > 0 && (
        <Card className="border-destructive/30">
          <CardHeader><CardTitle className="text-sm flex items-center gap-2 text-destructive"><XCircle className="h-4 w-4" /> Broken Redirects</CardTitle></CardHeader>
          <CardContent>
            {brokenRedirects.map(r => (
              <div key={r.routeKey} className="flex items-center gap-3 p-2 rounded-md bg-destructive/10 mb-1">
                <Badge variant="outline" className="text-xs font-mono">{r.routePath}</Badge>
                <ArrowRight className="h-3 w-3 text-destructive" />
                <Badge variant="destructive" className="text-xs font-mono">{r.redirectTarget}</Badge>
                <span className="text-xs text-muted-foreground ml-auto">{r.actionLabel}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Full Redirect Registry */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Redirect Registry</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-3 w-3 text-muted-foreground" />
              <Input placeholder="Search redirects..." value={search} onChange={e => setSearch(e.target.value)} className="pl-7 h-8 text-xs" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Route Key</TableHead>
                <TableHead className="text-xs">Source</TableHead>
                <TableHead className="text-xs">Target</TableHead>
                <TableHead className="text-xs">Domain</TableHead>
                <TableHead className="text-xs">Priority</TableHead>
                <TableHead className="text-xs">Label</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(s => (
                <TableRow key={s.routeKey}>
                  <TableCell className="text-xs font-mono">{s.routeKey}</TableCell>
                  <TableCell className="text-xs font-mono">{s.routePath}</TableCell>
                  <TableCell className="text-xs font-mono">{s.redirectTarget || "—"}</TableCell>
                  <TableCell><Badge variant="outline" className="text-xs">{s.domain}</Badge></TableCell>
                  <TableCell><Badge variant={s.testPriority === "P0" ? "destructive" : "outline"} className="text-xs">{s.testPriority}</Badge></TableCell>
                  <TableCell className="text-xs">{s.actionLabel}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
