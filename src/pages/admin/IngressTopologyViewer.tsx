import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { INGRESS_NODES } from "@/lib/deployment/ingress-topology-registry";
import { EDGE_INGRESS_CLASSIFICATIONS } from "@/lib/deployment/edge-ingress-classification";

const IngressTopologyViewer = () => {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Ingress Topology Viewer</h1>
        <p className="text-muted-foreground">{INGRESS_NODES.length} ingress nodes handling {EDGE_INGRESS_CLASSIFICATIONS.length} traffic classes</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Ingress Nodes</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Technology</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Environments</TableHead>
                <TableHead>TLS</TableHead>
                <TableHead>Rate Limit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {INGRESS_NODES.map((node) => (
                <TableRow key={node.id}>
                  <TableCell className="font-medium text-sm">{node.name}</TableCell>
                  <TableCell><Badge variant="secondary">{node.technology}</Badge></TableCell>
                  <TableCell className="text-xs">{node.roles.map((r) => <Badge key={r} variant="outline" className="mr-1 mb-1 text-xs">{r}</Badge>)}</TableCell>
                  <TableCell className="text-xs">{node.environments.join(", ")}</TableCell>
                  <TableCell>{node.tlsTermination ? <Badge className="bg-green-500/20 text-green-300">✓</Badge> : <Badge variant="outline">—</Badge>}</TableCell>
                  <TableCell>{node.rateLimiting ? <Badge className="bg-blue-500/20 text-blue-300">✓</Badge> : <Badge variant="outline">—</Badge>}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Traffic Classifications</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Traffic Class</TableHead>
                <TableHead>Handled By</TableHead>
                <TableHead>Auth</TableHead>
                <TableHead>Rate Limited</TableHead>
                <TableHead>Cacheable</TableHead>
                <TableHead>Volume</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {EDGE_INGRESS_CLASSIFICATIONS.map((cls) => (
                <TableRow key={cls.trafficClass}>
                  <TableCell className="font-mono text-xs">{cls.trafficClass}</TableCell>
                  <TableCell className="text-xs">{cls.handledBy.join(", ")}</TableCell>
                  <TableCell>{cls.authRequired ? <Badge className="bg-orange-500/20 text-orange-300">Required</Badge> : <Badge variant="outline">No</Badge>}</TableCell>
                  <TableCell>{cls.rateLimited ? "✓" : "—"}</TableCell>
                  <TableCell>{cls.cacheable ? "✓" : "—"}</TableCell>
                  <TableCell><Badge variant="secondary">{cls.expectedVolume}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default IngressTopologyViewer;
