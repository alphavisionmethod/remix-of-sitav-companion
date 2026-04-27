import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { useMockReplacements } from "@/hooks/useMockReplacements";
import { useRealityClassifications } from "@/platform/runtime/hooks/useRealityClassifications";
import { ShieldCheck, Activity, Database, Zap, CheckCircle2, AlertTriangle } from "lucide-react";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

export default function RuntimeRealityValidation() {
  const { data: replacements = [] } = useMockReplacements();
  const { data: classifications = [] } = useRealityClassifications();

  const completedMigrations = useMemo(() =>
    replacements.filter(m => m.migration_status === "completed" || m.migration_status === "validated"),
  [replacements]);

  const validatedCount = replacements.filter(m => m.migration_status === "validated").length;
  const completedCount = completedMigrations.length;
  const validationRate = completedCount > 0 ? Math.round((validatedCount / completedCount) * 100) : 0;

  const provenFeatures = useMemo(() =>
    classifications.filter(c => c.classification === "proven"),
  [classifications]);

  const persistedUnproven = useMemo(() =>
    classifications.filter(c => c.classification === "persisted"),
  [classifications]);

  return (
    <div className="space-y-6 p-6">
<div>
        <h1 className="text-2xl font-bold">Runtime Reality Validation</h1>
        <p className="text-sm text-muted-foreground">Validate migrated features are truly real — RCP12</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <ShieldCheck className="h-6 w-6 mx-auto mb-1 text-emerald-400" />
            <div className="text-2xl font-bold text-emerald-400">{validatedCount}</div>
            <div className="text-xs text-muted-foreground">Runtime Validated</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle2 className="h-6 w-6 mx-auto mb-1 text-blue-400" />
            <div className="text-2xl font-bold">{completedCount}</div>
            <div className="text-xs text-muted-foreground">Completed Migrations</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Activity className="h-6 w-6 mx-auto mb-1" />
            <div className="text-2xl font-bold">{validationRate}%</div>
            <Progress value={validationRate} className="mt-1" />
            <div className="text-xs text-muted-foreground">Validation Rate</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <AlertTriangle className="h-6 w-6 mx-auto mb-1 text-yellow-400" />
            <div className="text-2xl font-bold">{persistedUnproven.length}</div>
            <div className="text-xs text-muted-foreground">Persisted but unproven</div>
          </CardContent>
        </Card>
      </div>

      {/* Post-migration verification */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Database className="h-4 w-4" />Post-Migration Verification</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Feature</TableHead>
                <TableHead>Page</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Runtime Validated</TableHead>
                <TableHead>Evidence</TableHead>
                <TableHead>Completed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {completedMigrations.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No completed migrations yet</TableCell></TableRow>}
              {completedMigrations.map(m => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">{m.feature_name}</TableCell>
                  <TableCell className="font-mono text-xs">{m.page_path}</TableCell>
                  <TableCell><Badge variant="outline" className={m.migration_status === "validated" ? "text-emerald-400" : "text-blue-400"}>{m.migration_status}</Badge></TableCell>
                  <TableCell>{m.runtime_validated ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <AlertTriangle className="h-4 w-4 text-yellow-400" />}</TableCell>
                  <TableCell>{m.runtime_evidence.length > 0 ? <Badge variant="outline" className="text-emerald-400">{m.runtime_evidence.length} items</Badge> : <span className="text-xs text-muted-foreground">None</span>}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{m.done_at ? new Date(m.done_at).toLocaleDateString() : "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Proven features health */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Zap className="h-4 w-4" />Proven Features Health</CardTitle></CardHeader>
        <CardContent>
          {provenFeatures.length === 0 && <p className="text-xs text-muted-foreground">No proven features yet</p>}
          <div className="grid grid-cols-2 gap-2">
            {provenFeatures.map(f => (
              <div key={f.id} className="border border-emerald-500/20 rounded p-3">
                <div className="text-sm font-medium">{f.feature_name}</div>
                <div className="text-xs font-mono text-muted-foreground">{f.route_path}</div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-emerald-400 text-[10px]">Proven</Badge>
                  <span className="text-xs text-muted-foreground">Confidence: {f.confidence}%</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
