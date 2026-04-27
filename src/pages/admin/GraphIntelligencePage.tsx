import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGraphEngine } from "@/platform/orchestration/hooks/useGraphEngine";
import { Network, Eye, Shield, BarChart3 } from "lucide-react";

export default function GraphIntelligencePage() {
  const engine = useGraphEngine();
  const stats = engine.getStats();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Graph Intelligence</h1>
        <p className="text-muted-foreground">Node/edge explorer, lineage viewer, drift detection, and privacy audit</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Network className="h-4 w-4" /> Nodes</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{stats.nodes}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><BarChart3 className="h-4 w-4" /> Edges</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{stats.edges}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Eye className="h-4 w-4" /> Lineage Chains</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{stats.lineageChains}</p></CardContent>
        </Card>
      </div>

      <Tabs defaultValue="explorer">
        <TabsList>
          <TabsTrigger value="explorer">Node Explorer</TabsTrigger>
          <TabsTrigger value="lineage">Lineage Viewer</TabsTrigger>
          <TabsTrigger value="drift">Drift Detection</TabsTrigger>
          <TabsTrigger value="privacy">Privacy Audit</TabsTrigger>
        </TabsList>

        <TabsContent value="explorer">
          <Card>
            <CardHeader><CardTitle>Node & Edge Explorer</CardTitle></CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Explore 16 canonical node types and 18 edge types. Traverse the graph with configurable depth, 
                direction, and type filters. Build evidence packs from connected nodes.
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                {["user", "device", "workspace", "file", "command", "approval", "app", "incident", "policy", "release", "timeline", "automation"].map(t => (
                  <Badge key={t} variant="outline">{t}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lineage">
          <Card>
            <CardHeader><CardTitle>Lineage Viewer</CardTitle></CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Track data, decision, AI, command, and release lineage chains with full provenance and integrity verification.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drift">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-4 w-4" /> Drift Report</CardTitle></CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Detect orphaned edges, missing nodes, and graph inconsistencies. Generate reconciliation plans with auto-correction capabilities.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy">
          <Card>
            <CardHeader><CardTitle>Privacy Audit</CardTitle></CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                GDPR-compliant access auditing, consent verification, and sensitive relationship masking across 6 privacy levels.
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                {["public", "workspace", "private", "sensitive", "restricted", "system_only"].map(l => (
                  <Badge key={l} variant="secondary">{l}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
