import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MANIFEST_REGISTRY, getManifestsByClass, getAuthoritativeManifests } from "@/lib/truth-manifests/manifest-registry";
import { generateHealthSummary } from "@/lib/truth-manifests/manifest-health-engine";
import type { ManifestHealthSummary } from "@/lib/truth-manifests/manifest-types";
import ArtifactOwnershipGraphCard from "@/platform/admin/components/admin/ArtifactOwnershipGraphCard";

const ManifestTruthDashboard = () => {
  const [summary, setSummary] = useState<ManifestHealthSummary | null>(null);

  useEffect(() => {
    setSummary(generateHealthSummary());
  }, []);

  const classColors: Record<string, string> = {
    structural: "bg-blue-500/20 text-blue-300",
    contract: "bg-purple-500/20 text-purple-300",
    runtime: "bg-orange-500/20 text-orange-300",
    compliance: "bg-green-500/20 text-green-300",
    informational: "bg-muted text-muted-foreground",
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Manifest Truth Dashboard</h1>
        <p className="text-muted-foreground">Registry of all {MANIFEST_REGISTRY.length} generated artifacts with health status</p>
      </div>

      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{summary.totalManifests}</p></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Healthy</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-green-400">{summary.healthyManifests}</p></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Unhealthy</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-red-400">{summary.unhealthyManifests}</p></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Authoritative</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-purple-400">{getAuthoritativeManifests().length}</p></CardContent></Card>
        </div>
      )}

      <ArtifactOwnershipGraphCard />

      <Card>
        <CardHeader><CardTitle>Manifest Registry</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Authority</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Validator</TableHead>
                <TableHead>CI Gate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MANIFEST_REGISTRY.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-mono text-xs">{m.id}</TableCell>
                  <TableCell><Badge className={classColors[m.class] || ""}>{m.class}</Badge></TableCell>
                  <TableCell><Badge variant={m.authority === "authoritative" ? "default" : "secondary"}>{m.authority}</Badge></TableCell>
                  <TableCell className="text-xs">{m.owner}</TableCell>
                  <TableCell>{m.validator ? <Badge className="bg-green-500/20 text-green-300">✓</Badge> : <Badge variant="outline">—</Badge>}</TableCell>
                  <TableCell>{m.ciGate ? <Badge className="bg-blue-500/20 text-blue-300">{m.ciGate}</Badge> : <Badge variant="outline">—</Badge>}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManifestTruthDashboard;
