import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { INFRA_DOC_CLASSIFICATIONS, getOverallInfraCoverage } from "@/lib/runtime/reality-classification-registry";
import { getInfraCoverageStats, getMissingClaims } from "@/lib/runtime/infra-implementation-coverage-map";

const InfraRealityClassificationBoard = () => {
  const overallCoverage = getOverallInfraCoverage();
  const coverageStats = getInfraCoverageStats();
  const missingClaims = getMissingClaims();

  const tierColors: Record<string, string> = {
    "production-backed": "bg-green-500/20 text-green-300",
    prototype: "bg-yellow-500/20 text-yellow-300",
    simulated: "bg-blue-500/20 text-blue-300",
    "spec-only": "bg-muted text-muted-foreground",
    "partially-implemented": "bg-orange-500/20 text-orange-300",
    experimental: "bg-purple-500/20 text-purple-300",
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Infra Reality Classification</h1>
        <p className="text-muted-foreground">Honest classification of {INFRA_DOC_CLASSIFICATIONS.length} infra architecture documents</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Avg Coverage</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{overallCoverage.avgCoverage}%</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Claims Implemented</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-green-400">{coverageStats.implemented}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Partial</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-yellow-400">{coverageStats.partial}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Missing</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-red-400">{coverageStats.missing}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Document Classifications</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document</TableHead>
                <TableHead>Reality Tier</TableHead>
                <TableHead>Coverage</TableHead>
                <TableHead>Code Paths</TableHead>
                <TableHead>Prod Ready</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {INFRA_DOC_CLASSIFICATIONS.map((doc) => (
                <TableRow key={doc.docPath}>
                  <TableCell className="font-medium text-sm">{doc.docName}</TableCell>
                  <TableCell><Badge className={tierColors[doc.realityTier]}>{doc.realityTier}</Badge></TableCell>
                  <TableCell><div className="flex items-center gap-2"><Progress value={doc.implementationCoverage} className="w-20 h-2" /><span className="text-xs">{doc.implementationCoverage}%</span></div></TableCell>
                  <TableCell className="text-xs">{doc.relatedCodePaths.length}</TableCell>
                  <TableCell>{doc.productionReady ? <Badge className="bg-green-500/20 text-green-300">Yes</Badge> : <Badge variant="outline">No</Badge>}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {missingClaims.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Missing Implementation Claims ({missingClaims.length})</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {missingClaims.map((mc, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <Badge variant="outline" className="text-xs">{mc.docName}</Badge>
                  <span className="text-muted-foreground">{mc.claim}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InfraRealityClassificationBoard;
