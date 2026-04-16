import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getCriticalConsequences, buildRuntimeConsequenceMap, type RuntimeConsequenceEntry } from "@/lib/truth-manifests/manifest-runtime-consequence-map";

const ManifestDriftTriage = () => {
  const [consequences, setConsequences] = useState<RuntimeConsequenceEntry[]>([]);
  const [critical, setCritical] = useState<RuntimeConsequenceEntry[]>([]);

  useEffect(() => {
    setConsequences(buildRuntimeConsequenceMap());
    setCritical(getCriticalConsequences());
  }, []);

  const severityColors: Record<string, string> = {
    critical: "bg-red-500/20 text-red-300",
    high: "bg-orange-500/20 text-orange-300",
    medium: "bg-yellow-500/20 text-yellow-300",
    low: "bg-blue-500/20 text-blue-300",
    none: "bg-muted text-muted-foreground",
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Manifest Drift Triage</h1>
        <p className="text-muted-foreground">Runtime and release consequences of manifest drift — {critical.length} critical items</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {["critical", "high", "medium", "low"].map((sev) => (
          <Card key={sev}>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground capitalize">{sev}</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-bold">{consequences.filter((c) => c.severity === sev).length}</p></CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Drift Consequence Map</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Manifest</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Runtime Consequence</TableHead>
                <TableHead>Release Consequence</TableHead>
                <TableHead>Affected</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {consequences.filter((c) => c.severity !== "none").map((c) => (
                <TableRow key={c.manifestId}>
                  <TableCell className="font-mono text-xs">{c.manifestId}</TableCell>
                  <TableCell><Badge className={severityColors[c.severity]}>{c.severity}</Badge></TableCell>
                  <TableCell className="text-xs max-w-48 truncate">{c.runtimeConsequence}</TableCell>
                  <TableCell className="text-xs max-w-48 truncate">{c.releaseConsequence}</TableCell>
                  <TableCell className="text-xs">{c.affectedSurfaces.join(", ")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManifestDriftTriage;
