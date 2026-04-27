// ═══════════════════════════════════════════════════════════════
// ITC09 — Route & Component Inventory
// Reads route-manifest.json + reality_classifications
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRealityClassifications } from "@/platform/runtime/hooks/useRealityClassifications";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Route as RouteIcon, Search, CheckCircle2, AlertTriangle } from "lucide-react";

interface RouteEntry { path: string; component: string; domain: string }
interface RouteManifest { version: string; generatedAt: string; totalRoutes: number; routes: RouteEntry[] }

function useRouteManifest() {
  return useQuery({
    queryKey: ["route-manifest"],
    queryFn: async (): Promise<RouteManifest | null> => {
      try {
        const res = await fetch("/generated/route-manifest.json");
        if (!res.ok) return null;
        return res.json();
      } catch { return null; }
    },
    staleTime: 60_000,
  });
}

const CLASSIFICATION_COLORS: Record<string, string> = {
  presentational: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  simulated: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  persisted: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  proven: "bg-green-500/10 text-green-600 border-green-500/20",
};

export default function ITC09RouteInventory() {
  const { data: manifest, isLoading: loadingManifest } = useRouteManifest();
  const { data: classifications, isLoading: loadingClassifications } = useRealityClassifications();
  const [search, setSearch] = useState("");

  const classMap = new Map((classifications || []).map(c => [c.route_path, c]));

  const routes = (manifest?.routes || []).filter(r =>
    r.path.toLowerCase().includes(search.toLowerCase()) ||
    r.component.toLowerCase().includes(search.toLowerCase()) ||
    r.domain.toLowerCase().includes(search.toLowerCase())
  );

  const domains = [...new Set(routes.map(r => r.domain))].sort();
  const classifiedCount = routes.filter(r => classMap.has(r.path)).length;

  const isLoading = loadingManifest || loadingClassifications;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <RouteIcon className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-semibold text-foreground">Route & Component Inventory</h1>
          <Badge variant="outline" className="text-[8px]">ITC09</Badge>
        </div>
        <p className="text-sm text-muted-foreground">Unified route inventory with reality classification cross-reference</p>
      </div>

      {!manifest && !isLoading ? (
        <Card>
          <CardContent className="py-8 text-center">
            <AlertTriangle className="h-8 w-8 text-orange-500 mx-auto mb-3" />
            <div className="text-sm font-medium text-foreground mb-1">No Route Manifest Found</div>
            <div className="text-[11px] text-muted-foreground">
              Run <code className="bg-muted px-1 py-0.5 rounded text-[10px]">Run <code className="bg-muted px-1 py-0.5 rounded text-[10px]">npx tsx scripts/manifests/generate/generate-route-manifest.ts</code> to generate it.</code> to generate it.
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card><CardContent className="pt-4 text-center"><div className="text-2xl font-bold text-foreground">{manifest?.totalRoutes || 0}</div><div className="text-[10px] text-muted-foreground">Total Routes</div></CardContent></Card>
            <Card><CardContent className="pt-4 text-center"><div className="text-2xl font-bold text-foreground">{domains.length}</div><div className="text-[10px] text-muted-foreground">Domains</div></CardContent></Card>
            <Card><CardContent className="pt-4 text-center"><div className="text-2xl font-bold text-green-500">{classifiedCount}</div><div className="text-[10px] text-muted-foreground">Classified</div></CardContent></Card>
            <Card><CardContent className="pt-4 text-center"><div className="text-2xl font-bold text-orange-500">{routes.length - classifiedCount}</div><div className="text-[10px] text-muted-foreground">Unclassified</div></CardContent></Card>
          </div>

          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input placeholder="Search routes..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-8 text-sm" />
          </div>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Routes ({routes.length})</CardTitle>
                {manifest && <span className="text-[10px] text-muted-foreground">Generated: {new Date(manifest.generatedAt).toLocaleString()}</span>}
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[10px]">Route Path</TableHead>
                    <TableHead className="text-[10px]">Component</TableHead>
                    <TableHead className="text-[10px]">Domain</TableHead>
                    <TableHead className="text-[10px]">Reality State</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground text-sm">Loading...</TableCell></TableRow>
                  ) : routes.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground text-sm">No routes</TableCell></TableRow>
                  ) : routes.map((r, i) => {
                    const cl = classMap.get(r.path);
                    return (
                      <TableRow key={i}>
                        <TableCell className="text-[11px] font-mono">{r.path}</TableCell>
                        <TableCell className="text-[11px]">{r.component}</TableCell>
                        <TableCell><Badge variant="outline" className="text-[8px] h-4">{r.domain}</Badge></TableCell>
                        <TableCell>
                          {cl ? (
                            <Badge className={`text-[8px] h-4 ${CLASSIFICATION_COLORS[cl.classification] || ""}`}>
                              <CheckCircle2 className="h-2.5 w-2.5 mr-1" /> {cl.classification}
                            </Badge>
                          ) : (
                            <span className="text-[10px] text-muted-foreground italic">unclassified</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
