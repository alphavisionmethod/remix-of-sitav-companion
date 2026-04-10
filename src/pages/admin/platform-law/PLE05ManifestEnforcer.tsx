import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, AlertTriangle, CheckCircle, Target, TrendingUp } from "lucide-react";
import { MANIFEST_REQUIREMENTS, getManifestCompletionRate, type ManifestRequirement } from "@/lib/platform-law/platform-law-registry";

const PLE05ManifestEnforcer = () => {
  const [selected, setSelected] = useState<ManifestRequirement | null>(null);
  const overallRate = getManifestCompletionRate();
  const p0Required = MANIFEST_REQUIREMENTS.filter(m => m.requiredForP0);
  const p0Rate = p0Required.length > 0 ? Math.round(p0Required.reduce((s, m) => s + m.completionRate, 0) / p0Required.length) : 0;
  const lowestCoverage = [...MANIFEST_REQUIREMENTS].sort((a, b) => a.completionRate - b.completionRate)[0];

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10"><FileText className="h-6 w-6 text-primary" /></div>
        <div>
          <h1 className="text-2xl font-bold">Manifest Requirement Enforcer</h1>
          <p className="text-sm text-muted-foreground">{MANIFEST_REQUIREMENTS.length} manifest types · {overallRate}% overall coverage · {p0Required.length} required for P0</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Manifest Types", value: MANIFEST_REQUIREMENTS.length, color: "text-blue-400" },
          { label: "Overall Coverage", value: `${overallRate}%`, color: overallRate >= 70 ? "text-emerald-400" : "text-amber-400" },
          { label: "P0 Avg Coverage", value: `${p0Rate}%`, color: p0Rate >= 70 ? "text-emerald-400" : "text-red-400" },
          { label: "Lowest Coverage", value: `${lowestCoverage?.completionRate ?? 0}%`, color: "text-red-400" },
        ].map(k => (
          <Card key={k.label} className="bg-card/50"><CardContent className="p-3 text-center">
            <div className={`text-xl font-bold ${k.color}`}>{k.value}</div>
            <div className="text-[10px] text-muted-foreground">{k.label}</div>
          </CardContent></Card>
        ))}
      </div>

      {/* Coverage by Type */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Coverage by Manifest Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...MANIFEST_REQUIREMENTS].sort((a, b) => a.completionRate - b.completionRate).map(m => (
              <div key={m.id} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{m.type}</span>
                    {m.requiredForP0 && <Badge variant="destructive" className="text-[10px]">P0</Badge>}
                    {m.requiredForP1 && !m.requiredForP0 && <Badge variant="secondary" className="text-[10px]">P1</Badge>}
                  </div>
                  <span className="font-mono text-xs">{m.compliantFeatures}/{m.totalFeatures} ({m.completionRate}%)</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${m.completionRate >= 80 ? "bg-emerald-500" : m.completionRate >= 50 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${m.completionRate}%` }} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detail Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">ID</TableHead>
                  <TableHead>Manifest Type</TableHead>
                  <TableHead className="w-20">Domain</TableHead>
                  <TableHead className="w-16">P0</TableHead>
                  <TableHead className="w-16">P1</TableHead>
                  <TableHead className="w-28 text-right">Compliance</TableHead>
                  <TableHead className="w-20 text-right">Missing</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MANIFEST_REQUIREMENTS.map(m => (
                  <TableRow key={m.id} className={`cursor-pointer hover:bg-muted/30 ${m.completionRate < 50 ? "bg-red-500/5" : ""}`} onClick={() => setSelected(m)}>
                    <TableCell className="font-mono text-xs">{m.id}</TableCell>
                    <TableCell>
                      <div className="font-medium text-sm">{m.type}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-[250px]">{m.description}</div>
                    </TableCell>
                    <TableCell className="text-xs">{m.domain}</TableCell>
                    <TableCell>{m.requiredForP0 ? <CheckCircle className="h-3.5 w-3.5 text-red-400" /> : <span className="text-muted-foreground">—</span>}</TableCell>
                    <TableCell>{m.requiredForP1 ? <CheckCircle className="h-3.5 w-3.5 text-amber-400" /> : <span className="text-muted-foreground">—</span>}</TableCell>
                    <TableCell className="text-right font-mono text-xs">{m.compliantFeatures}/{m.totalFeatures}</TableCell>
                    <TableCell className="text-right"><span className={`font-mono text-xs ${m.totalFeatures - m.compliantFeatures > 0 ? "text-red-400" : "text-emerald-400"}`}>{m.totalFeatures - m.compliantFeatures}</span></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Critical Gaps */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-400" /> Critical Coverage Gaps (P0 Required, &lt;60%)</CardTitle>
        </CardHeader>
        <CardContent>
          {MANIFEST_REQUIREMENTS.filter(m => m.requiredForP0 && m.completionRate < 60).length === 0 ? (
            <div className="flex items-center gap-2 text-emerald-400 text-sm"><CheckCircle className="h-4 w-4" /> All P0 manifest types above 60% coverage</div>
          ) : (
            <div className="space-y-2">
              {MANIFEST_REQUIREMENTS.filter(m => m.requiredForP0 && m.completionRate < 60).map(m => (
                <div key={m.id} className="p-3 rounded bg-red-500/10 border border-red-500/20">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm text-red-400">{m.type}</span>
                    <span className="text-red-400 font-mono text-xs">{m.completionRate}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{m.totalFeatures - m.compliantFeatures} features missing this manifest. Domain: {m.domain}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PLE05ManifestEnforcer;
