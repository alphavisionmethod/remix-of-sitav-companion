import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMockReplacements } from "@/hooks/useMockReplacements";
import { useRealityClassifications } from "@/hooks/useRealityClassifications";
import { FileCode, AlertTriangle, Layers } from "lucide-react";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

interface MockSourceEntry {
  source: string;
  pages: string[];
  domains: Set<string>;
  count: number;
  criticalCount: number;
  forbidden: boolean;
  replacementTarget: string | null;
}

export default function MockSourceInventory() {
  const { data: replacements = [] } = useMockReplacements();
  const { data: classifications = [] } = useRealityClassifications();

  const inventory = useMemo(() => {
    const map = new Map<string, MockSourceEntry>();

    replacements.forEach(m => {
      const entry = map.get(m.mock_source) ?? {
        source: m.mock_source, pages: [], domains: new Set<string>(),
        count: 0, criticalCount: 0, forbidden: false, replacementTarget: null,
      };
      entry.count++;
      if (!entry.pages.includes(m.page_path)) entry.pages.push(m.page_path);
      const domain = m.page_path.split("/")[1] || "root";
      entry.domains.add(domain);
      if (m.migration_priority === "critical") { entry.criticalCount++; entry.forbidden = true; }
      if (m.real_backend_target) entry.replacementTarget = m.real_backend_target;
      map.set(m.mock_source, entry);
    });

    // Also pull mock_sources from classifications
    classifications.forEach(c => {
      c.mock_sources.forEach(src => {
        if (!map.has(src)) {
          map.set(src, {
            source: src, pages: [c.route_path], domains: new Set([c.domain]),
            count: 1, criticalCount: c.launch_impact === "blocking" ? 1 : 0,
            forbidden: c.launch_impact === "blocking", replacementTarget: c.backend_target,
          });
        }
      });
    });

    return [...map.values()].sort((a, b) => b.criticalCount - a.criticalCount || b.count - a.count);
  }, [replacements, classifications]);

  return (
    <div className="space-y-6 p-6">
<div>
        <h1 className="text-2xl font-bold">Mock Source Inventory</h1>
        <p className="text-sm text-muted-foreground">All mock/demo/hardcoded sources used by runtime routes — RCP05</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <FileCode className="h-6 w-6 text-muted-foreground" />
            <div><div className="text-2xl font-bold">{inventory.length}</div><div className="text-xs text-muted-foreground">Mock sources tracked</div></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-destructive" />
            <div><div className="text-2xl font-bold">{inventory.filter(e => e.forbidden).length}</div><div className="text-xs text-muted-foreground">Forbidden in production</div></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Layers className="h-6 w-6 text-blue-400" />
            <div><div className="text-2xl font-bold">{new Set(inventory.flatMap(e => [...e.domains])).size}</div><div className="text-xs text-muted-foreground">Domains affected</div></div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mock Source</TableHead>
                <TableHead>Pages</TableHead>
                <TableHead>Domains</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Criticality</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Replacement Target</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventory.length === 0 && (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No mock sources inventoried yet</TableCell></TableRow>
              )}
              {inventory.map(e => (
                <TableRow key={e.source}>
                  <TableCell className="font-mono text-xs">{e.source}</TableCell>
                  <TableCell className="text-xs max-w-[200px] truncate">{e.pages.join(", ")}</TableCell>
                  <TableCell>{[...e.domains].map(d => <Badge key={d} variant="outline" className="mr-1 text-xs">{d}</Badge>)}</TableCell>
                  <TableCell>{e.count}</TableCell>
                  <TableCell>{e.criticalCount > 0 ? <Badge variant="destructive">Critical</Badge> : <Badge variant="outline">Normal</Badge>}</TableCell>
                  <TableCell>{e.forbidden ? <Badge variant="destructive">Forbidden</Badge> : <Badge variant="outline">Allowed</Badge>}</TableCell>
                  <TableCell className="font-mono text-xs">{e.replacementTarget || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
