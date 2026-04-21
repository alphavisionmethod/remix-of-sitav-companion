import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Archive, GitMerge, Trash2, Check, Copy, ArrowRight } from "lucide-react";
import {
  ADMIN_PAGE_INVENTORY,
  generateConsolidationReport,
  type ConsolidationRecommendation,
  type RouteRemap,
  type ConsolidationAction,
} from "@/lib/admin/admin-consolidation-explorer";
import { useToast } from "@/hooks/use-toast";

const ACTION_ICONS: Record<ConsolidationAction, React.ReactNode> = {
  merge: <GitMerge className="h-4 w-4" />,
  archive: <Archive className="h-4 w-4" />,
  deprecate: <Trash2 className="h-4 w-4" />,
  keep: <Check className="h-4 w-4" />,
  promote: <ArrowRight className="h-4 w-4" />,
};

const ACTION_COLORS: Record<ConsolidationAction, string> = {
  merge: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  archive: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  deprecate: "bg-red-500/10 text-red-400 border-red-500/30",
  keep: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  promote: "bg-purple-500/10 text-purple-400 border-purple-500/30",
};

export default function AdminConsolidationExplorer() {
  const { toast } = useToast();
  const report = useMemo(() => generateConsolidationReport(), []);
  const [selectedRemaps, setSelectedRemaps] = useState<Set<string>>(new Set());

  const toggleRemap = (oldRoute: string) => {
    setSelectedRemaps(prev => {
      const next = new Set(prev);
      next.has(oldRoute) ? next.delete(oldRoute) : next.add(oldRoute);
      return next;
    });
  };

  const copyRemapConfig = () => {
    const selected = report.routeRemaps.filter(r => selectedRemaps.has(r.oldRoute));
    const config = selected.map(r => `{ from: "${r.oldRoute}", to: "${r.newRoute}", type: "${r.redirectType}" }`).join(",\n  ");
    const output = `export const ADMIN_ROUTE_REMAPS = [\n  ${config}\n];\n`;
    navigator.clipboard.writeText(output);
    toast({ title: "Copied", description: `${selected.length} route remaps copied to clipboard` });
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin Consolidation Explorer</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {report.totalAdminPages} admin pages analyzed • {report.recommendations.length} recommendations
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-blue-500/10 text-blue-400">{report.mergeCount} merge</Badge>
          <Badge variant="outline" className="bg-amber-500/10 text-amber-400">{report.archiveCount} archive</Badge>
          <Badge variant="outline" className="bg-red-500/10 text-red-400">{report.deprecateCount} deprecate</Badge>
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400">{report.keepCount} keep</Badge>
        </div>
      </div>

      <Tabs defaultValue="inventory">
        <TabsList>
          <TabsTrigger value="inventory">Page Inventory</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="remaps">Route Remaps</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Page</TableHead>
                    <TableHead>Domain</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead className="text-center">Tabs</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead className="text-center">Score</TableHead>
                    <TableHead>Overlaps</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ADMIN_PAGE_INVENTORY.map(page => (
                    <TableRow key={page.id}>
                      <TableCell className="font-medium">{page.displayName}</TableCell>
                      <TableCell><Badge variant="outline">{page.domain}</Badge></TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{page.route}</TableCell>
                      <TableCell className="text-center">{page.tabCount}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          page.estimatedUsageFrequency === "daily" ? "text-emerald-400" :
                          page.estimatedUsageFrequency === "weekly" ? "text-blue-400" :
                          "text-amber-400"
                        }>{page.estimatedUsageFrequency}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={
                          page.consolidationScore >= 35 ? "text-red-400 font-bold" :
                          page.consolidationScore >= 20 ? "text-amber-400" :
                          "text-muted-foreground"
                        }>{page.consolidationScore}</span>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {page.overlapsWith.length > 0 ? page.overlapsWith.join(", ") : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="mt-4 space-y-3">
          {report.recommendations.map((rec, i) => (
            <Card key={i}>
              <CardContent className="py-4 flex items-start gap-4">
                <div className={`p-2 rounded-md border ${ACTION_COLORS[rec.action]}`}>
                  {ACTION_ICONS[rec.action]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{rec.action.toUpperCase()}</span>
                    <span className="font-mono text-xs text-muted-foreground">{rec.sourceRoute}</span>
                    {rec.targetRoute && (
                      <>
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        <span className="font-mono text-xs text-muted-foreground">{rec.targetRoute}</span>
                      </>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{rec.reason}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline">Impact: {rec.impactLevel}</Badge>
                    {rec.breakingChange && <Badge variant="destructive">Breaking Change</Badge>}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {report.recommendations.length === 0 && (
            <Card><CardContent className="py-8 text-center text-muted-foreground">No consolidation recommendations at this time.</CardContent></Card>
          )}
        </TabsContent>

        <TabsContent value="remaps" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Generated Route Remaps</CardTitle>
              <Button variant="outline" size="sm" onClick={copyRemapConfig} disabled={selectedRemaps.size === 0}>
                <Copy className="h-3.5 w-3.5 mr-1.5" />
                Copy Selected ({selectedRemaps.size})
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10" />
                    <TableHead>Old Route</TableHead>
                    <TableHead>New Route</TableHead>
                    <TableHead>Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.routeRemaps.map(remap => (
                    <TableRow
                      key={remap.oldRoute}
                      className="cursor-pointer"
                      onClick={() => toggleRemap(remap.oldRoute)}
                    >
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedRemaps.has(remap.oldRoute)}
                          onChange={() => toggleRemap(remap.oldRoute)}
                          className="rounded"
                        />
                      </TableCell>
                      <TableCell className="font-mono text-xs">{remap.oldRoute}</TableCell>
                      <TableCell className="font-mono text-xs">{remap.newRoute}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{remap.redirectType}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}