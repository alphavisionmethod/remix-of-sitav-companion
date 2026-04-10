// ═══════════════════════════════════════════════════════
// SITA OS — JVC06: Page Load Integrity Board
// Route health, shell assignments, state coverage
// ═══════════════════════════════════════════════════════

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useVerificationSurfaces } from "@/lib/verification/verification-hooks";
import { SURFACE_REGISTRY, type SurfaceEntry, type SurfaceShell } from "@/lib/verification/surface-registry";
import {
  Monitor, CheckCircle2, XCircle, AlertTriangle, Search, Layers, Server, Shield, Loader2, AlertCircle
} from "lucide-react";

export default function JVC06PageLoadIntegrity() {
  const [search, setSearch] = useState("");
  const [shellFilter, setShellFilter] = useState("all");
  const { data: dbSurfaces } = useVerificationSurfaces();

  const pages = useMemo(() => SURFACE_REGISTRY.filter((s) => s.surfaceClass === "page"), []);
  const surfaceMap = useMemo(() => {
    const m = new Map<string, Record<string, any>>();
    (dbSurfaces || []).forEach((s: Record<string, any>) => m.set(s.route_key, s));
    return m;
  }, [dbSurfaces]);

  // Shell distribution
  const shellGroups = useMemo(() => {
    const m = new Map<SurfaceShell, SurfaceEntry[]>();
    pages.forEach((p) => {
      if (!m.has(p.shell)) m.set(p.shell, []);
      m.get(p.shell)!.push(p);
    });
    return m;
  }, [pages]);

  // Backend dependency analysis
  const withBackend = pages.filter((p) => !!p.backendDependency);
  const withoutBackend = pages.filter((p) => !p.backendDependency);

  // Verified pages
  const verifiedPages = pages.filter((p) => surfaceMap.get(p.routeKey)?.verification_status === "pass");
  const failedPages = pages.filter((p) => surfaceMap.get(p.routeKey)?.verification_status === "fail");
  const untestedPages = pages.filter((p) => {
    const status = surfaceMap.get(p.routeKey)?.verification_status;
    return !status || status === "untested";
  });

  // Honesty class distribution
  const honestyDist = useMemo(() => {
    const m = new Map<string, number>();
    pages.forEach((p) => m.set(p.launchHonestyClass, (m.get(p.launchHonestyClass) || 0) + 1));
    return m;
  }, [pages]);

  // Filtered list
  const filtered = useMemo(() => {
    let list = pages;
    if (shellFilter !== "all") list = list.filter((p) => p.shell === shellFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.routeKey.toLowerCase().includes(q) ||
          p.actionLabel.toLowerCase().includes(q) ||
          p.routePath.toLowerCase().includes(q) ||
          p.domain.toLowerCase().includes(q)
      );
    }
    return list;
  }, [pages, shellFilter, search]);

  const coveragePct = pages.length > 0 ? Math.round((verifiedPages.length / pages.length) * 100) : 0;

  return (
    <div className="space-y-6 p-6" data-testid="jvc06-page-load-integrity">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Monitor className="h-6 w-6 text-primary" />
          JVC06 — Page Load Integrity Board
        </h1>
        <p className="text-muted-foreground mt-1">
          Route health, shell assignments, data dependencies, and state coverage
        </p>
      </div>

      {/* KPI Band */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <Card><CardContent className="p-3 text-center">
          <div className="text-2xl font-bold text-primary">{pages.length}</div>
          <div className="text-[10px] text-muted-foreground">Total Pages</div>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <div className="text-2xl font-bold text-green-500">{verifiedPages.length}</div>
          <div className="text-[10px] text-muted-foreground">Verified Load</div>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <div className="text-2xl font-bold text-destructive">{failedPages.length}</div>
          <div className="text-[10px] text-muted-foreground">Failed Load</div>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <div className="text-2xl font-bold text-muted-foreground">{untestedPages.length}</div>
          <div className="text-[10px] text-muted-foreground">Untested</div>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <div className="text-2xl font-bold text-blue-500">{withBackend.length}</div>
          <div className="text-[10px] text-muted-foreground">Backend Deps</div>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <div className="text-2xl font-bold text-amber-500">{shellGroups.size}</div>
          <div className="text-[10px] text-muted-foreground">Shell Types</div>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <div className="text-2xl font-bold">{coveragePct}%</div>
          <div className="text-[10px] text-muted-foreground">Coverage</div>
          <Progress value={coveragePct} className="mt-1 h-1" />
        </CardContent></Card>
      </div>

      {/* Shell Assignment Map */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            Shell Assignment Map
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {Array.from(shellGroups.entries()).map(([shell, entries]) => {
              const verified = entries.filter((e) => surfaceMap.get(e.routeKey)?.verification_status === "pass").length;
              return (
                <Card key={shell} className="border-border/50">
                  <CardContent className="p-3 text-center">
                    <div className="font-mono text-sm font-bold text-primary">{shell}</div>
                    <div className="text-2xl font-bold mt-1">{entries.length}</div>
                    <div className="text-[10px] text-muted-foreground">pages</div>
                    <Progress value={entries.length > 0 ? (verified / entries.length) * 100 : 0} className="mt-2 h-1" />
                    <div className="text-[10px] text-muted-foreground mt-1">{verified}/{entries.length} verified</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Data Dependency Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <Server className="h-4 w-4 text-blue-500" />
              Pages with Backend Dependencies ({withBackend.length})
            </h3>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {withBackend.map((p) => {
                const status = surfaceMap.get(p.routeKey)?.verification_status || "untested";
                return (
                  <div key={p.routeKey} className="flex items-center gap-2 text-xs">
                    {status === "pass" ? <CheckCircle2 className="h-3 w-3 text-green-500 shrink-0" /> :
                     status === "fail" ? <XCircle className="h-3 w-3 text-destructive shrink-0" /> :
                     <Loader2 className="h-3 w-3 text-muted-foreground shrink-0" />}
                    <span className="font-mono truncate">{p.routePath}</span>
                    <span className="text-muted-foreground ml-auto text-[10px] truncate max-w-[120px]">{p.backendDependency}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <Shield className="h-4 w-4 text-amber-500" />
              Launch Honesty Distribution
            </h3>
            <div className="space-y-2">
              {Array.from(honestyDist.entries()).map(([cls, count]) => (
                <div key={cls} className="flex items-center gap-2">
                  <Badge variant={cls === "real" ? "default" : cls === "demo_governed" ? "outline" : "secondary"} className="text-[10px] w-28 justify-center">
                    {cls}
                  </Badge>
                  <Progress value={(count / pages.length) * 100} className="flex-1 h-2" />
                  <span className="text-xs text-muted-foreground w-8 text-right">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Missing State Alerts */}
      {untestedPages.length > 0 && (
        <Card className="border-amber-500/40">
          <CardContent className="p-4">
            <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              Missing Verification — Pages with No Load Evidence ({untestedPages.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {untestedPages.slice(0, 15).map((p) => (
                <div key={p.routeKey} className="flex items-center gap-2 text-xs p-2 bg-muted/30 rounded">
                  <AlertTriangle className="h-3 w-3 text-amber-500 shrink-0" />
                  <span className="font-mono truncate">{p.routePath}</span>
                  <Badge variant="secondary" className="text-[10px] ml-auto">{p.testPriority}</Badge>
                </div>
              ))}
              {untestedPages.length > 15 && (
                <div className="text-xs text-muted-foreground p-2">+{untestedPages.length - 15} more</div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Page Inventory Grid */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-lg">Page Inventory</h3>
            <div className="flex items-center gap-2">
              <Tabs value={shellFilter} onValueChange={setShellFilter}>
                <TabsList className="h-8">
                  <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                  {Array.from(shellGroups.keys()).map((s) => (
                    <TabsTrigger key={s} value={s} className="text-xs">{s}</TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
              <div className="relative w-56">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search pages..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 h-9" />
              </div>
            </div>
          </div>

          <div className="max-h-[500px] overflow-y-auto border rounded">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Route</TableHead>
                  <TableHead className="text-xs">Label</TableHead>
                  <TableHead className="text-xs">Shell</TableHead>
                  <TableHead className="text-xs">Domain</TableHead>
                  <TableHead className="text-xs">Backend Dep</TableHead>
                  <TableHead className="text-xs">Honesty</TableHead>
                  <TableHead className="text-xs">Priority</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((page) => {
                  const status = surfaceMap.get(page.routeKey)?.verification_status || "untested";
                  return (
                    <TableRow key={page.routeKey}>
                      <TableCell className="font-mono text-xs">{page.routePath}</TableCell>
                      <TableCell className="text-xs">{page.actionLabel}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">{page.shell}</Badge>
                      </TableCell>
                      <TableCell className="text-xs">{page.domain}</TableCell>
                      <TableCell className="text-xs font-mono max-w-[120px] truncate">
                        {page.backendDependency || <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={page.launchHonestyClass === "real" ? "default" : "secondary"}
                          className="text-[10px]"
                        >
                          {page.launchHonestyClass}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={page.testPriority === "P0" ? "destructive" : page.testPriority === "P1" ? "default" : "secondary"}
                          className="text-[10px]"
                        >
                          {page.testPriority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {status === "pass" ? <CheckCircle2 className="h-4 w-4 text-green-500" /> :
                         status === "fail" ? <XCircle className="h-4 w-4 text-destructive" /> :
                         <Loader2 className="h-4 w-4 text-muted-foreground" />}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            Showing {filtered.length} of {pages.length} pages
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
