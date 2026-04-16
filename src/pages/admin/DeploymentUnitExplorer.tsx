import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DEPLOYMENT_UNITS } from "@/lib/deployment/deployment-unit-registry";
import { ROLLBACK_BEHAVIORS } from "@/lib/deployment/rollback-behavior-map";
import { HEALTH_PROBES } from "@/lib/deployment/health-probe-map";
import { DEPLOYMENT_CONSEQUENCES } from "@/lib/deployment/deployment-consequence-map";

const DeploymentUnitExplorer = () => {
  const impactColors: Record<string, string> = {
    "total-outage": "bg-red-500/20 text-red-300",
    "major-degradation": "bg-orange-500/20 text-orange-300",
    "partial-degradation": "bg-yellow-500/20 text-yellow-300",
    "no-impact": "bg-green-500/20 text-green-300",
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Deployment Unit Explorer</h1>
        <p className="text-muted-foreground">{DEPLOYMENT_UNITS.length} deployment units with health, rollback, and consequence mapping</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Units</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{DEPLOYMENT_UNITS.length}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Scalable</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-green-400">{DEPLOYMENT_UNITS.filter((u) => u.scalable).length}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Critical</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-red-400">{DEPLOYMENT_CONSEQUENCES.filter((c) => c.ifDown === "total-outage").length}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Health Monitored</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-blue-400">{HEALTH_PROBES.filter((p) => p.probeType !== "none").length}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Deployment Units</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Unit</TableHead>
                <TableHead>Runtime</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Rollback</TableHead>
                <TableHead>If Down</TableHead>
                <TableHead>Ports</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {DEPLOYMENT_UNITS.map((unit) => {
                const rollback = ROLLBACK_BEHAVIORS.find((r) => r.deploymentUnitId === unit.id);
                const consequence = DEPLOYMENT_CONSEQUENCES.find((c) => c.deploymentUnitId === unit.id);
                return (
                  <TableRow key={unit.id}>
                    <TableCell className="font-medium text-sm">{unit.name}</TableCell>
                    <TableCell><Badge variant="secondary">{unit.runtime}</Badge></TableCell>
                    <TableCell className="text-xs">{unit.owner}</TableCell>
                    <TableCell><Badge variant="outline">{rollback?.rollbackType ?? "unknown"}</Badge></TableCell>
                    <TableCell>{consequence && <Badge className={impactColors[consequence.ifDown]}>{consequence.ifDown}</Badge>}</TableCell>
                    <TableCell className="text-xs font-mono">{unit.ports.join(", ") || "—"}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeploymentUnitExplorer;
