// ═══════════════════════════════════════════════════════
// SITA OS — JVC07: Form Verification Center
// Track form field validation, submit, persist, redirect
// ═══════════════════════════════════════════════════════

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { SURFACE_REGISTRY } from "@/lib/verification/surface-registry";
import { useVerificationRuns } from "@/lib/verification/verification-hooks";
import { FileText, CheckCircle2, XCircle, Shield, Database, ArrowRight, AlertTriangle } from "lucide-react";

export default function JVC07FormVerificationCenter() {
  const [selectedForm, setSelectedForm] = useState<string | null>(null);
  const { data: runs } = useVerificationRuns();

  const formSurfaces = useMemo(() =>
    SURFACE_REGISTRY.filter(s => s.surfaceClass === "form" || s.formFields),
    []
  );

  const totalForms = formSurfaces.length;
  const withPersistence = formSurfaces.filter(s => s.expectedPersistence).length;
  const withProof = formSurfaces.filter(s => s.proofReceiptRequired).length;
  const totalFields = formSurfaces.reduce((acc, s) => acc + (s.formFields?.length || 0), 0);

  const formRuns = useMemo(() => {
    if (!runs) return {};
    const map: Record<string, { pass: number; fail: number; total: number }> = {};
    formSurfaces.forEach(f => {
      const matching = (runs as any[]).filter(r => r.route_key === f.routeKey);
      map[f.routeKey] = {
        pass: matching.filter(r => r.passed).length,
        fail: matching.filter(r => !r.passed).length,
        total: matching.length,
      };
    });
    return map;
  }, [runs, formSurfaces]);

  const selectedFormEntry = formSurfaces.find(f => f.routeKey === selectedForm);

  return (
    <div className="space-y-6 p-6" data-testid="jvc07-form-verification">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          JVC07 — Form Verification Center
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Field validation, submission outcomes, persistence, and proof linkage</p>
      </div>

      {/* KPI Band */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-4 text-center">
          <div className="text-2xl font-bold">{totalForms}</div>
          <div className="text-xs text-muted-foreground">Registered Forms</div>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <div className="text-2xl font-bold">{totalFields}</div>
          <div className="text-xs text-muted-foreground">Total Fields</div>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <div className="text-2xl font-bold text-blue-400">{withPersistence}</div>
          <div className="text-xs text-muted-foreground">Persistence Required</div>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <div className="text-2xl font-bold text-purple-400">{withProof}</div>
          <div className="text-xs text-muted-foreground">Proof Required</div>
        </CardContent></Card>
      </div>

      {/* Form Registry Table */}
      <Card>
        <CardHeader><CardTitle className="text-sm">Form Registry</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Form</TableHead>
                <TableHead className="text-xs">Route</TableHead>
                <TableHead className="text-xs">Fields</TableHead>
                <TableHead className="text-xs">Action</TableHead>
                <TableHead className="text-xs">Persistence</TableHead>
                <TableHead className="text-xs">Backend</TableHead>
                <TableHead className="text-xs">Priority</TableHead>
                <TableHead className="text-xs">Runs</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {formSurfaces.map(f => {
                const stats = formRuns[f.routeKey] || { pass: 0, fail: 0, total: 0 };
                return (
                  <TableRow key={f.routeKey} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedForm(f.routeKey)}>
                    <TableCell className="text-xs font-medium">{f.actionLabel}</TableCell>
                    <TableCell className="text-xs font-mono">{f.routePath}</TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {(f.formFields || []).map(field => (
                          <Badge key={field} variant="outline" className="text-[10px]">{field}</Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">{f.actionType}</Badge></TableCell>
                    <TableCell>
                      {f.expectedPersistence ? (
                        <Database className="h-3 w-3 text-blue-400" />
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground">{f.backendDependency || "—"}</TableCell>
                    <TableCell><Badge variant={f.testPriority === "P0" ? "destructive" : "outline"} className="text-xs">{f.testPriority}</Badge></TableCell>
                    <TableCell>
                      {stats.total > 0 ? (
                        <div className="flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                          <span className="text-xs">{stats.pass}</span>
                          {stats.fail > 0 && <>
                            <XCircle className="h-3 w-3 text-destructive" />
                            <span className="text-xs">{stats.fail}</span>
                          </>}
                        </div>
                      ) : (
                        <Badge variant="outline" className="text-[10px]">untested</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Validation Coverage */}
      <Card>
        <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Shield className="h-4 w-4" /> Validation Coverage</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {formSurfaces.map(f => {
              const fieldCount = f.formFields?.length || 0;
              const coverage = fieldCount > 0 ? 100 : 0;
              return (
                <div key={f.routeKey} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">{f.actionLabel}</span>
                    <span className="text-xs text-muted-foreground">{fieldCount} fields</span>
                  </div>
                  <Progress value={coverage} className="h-1.5" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected Form Detail */}
      {selectedFormEntry && (
        <Card className="border-primary/30">
          <CardHeader><CardTitle className="text-sm">{selectedFormEntry.actionLabel} — Detail</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div><span className="text-muted-foreground">Route:</span> <span className="font-mono">{selectedFormEntry.routePath}</span></div>
              <div><span className="text-muted-foreground">Action:</span> {selectedFormEntry.actionType}</div>
              <div><span className="text-muted-foreground">Backend:</span> <span className="font-mono">{selectedFormEntry.backendDependency || "none"}</span></div>
              <div><span className="text-muted-foreground">Selector:</span> <span className="font-mono">{selectedFormEntry.actionSelector || "none"}</span></div>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Expected Result:</span>
              <p className="text-xs mt-1">{selectedFormEntry.expectedResult}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Fields:</span>
              <div className="flex gap-2 mt-1 flex-wrap">
                {(selectedFormEntry.formFields || []).map(f => (
                  <Badge key={f} variant="outline">{f}</Badge>
                ))}
              </div>
            </div>
            <div className="flex gap-4 text-xs">
              <div className="flex items-center gap-1">
                {selectedFormEntry.expectedPersistence ? <CheckCircle2 className="h-3 w-3 text-emerald-400" /> : <XCircle className="h-3 w-3 text-muted-foreground" />}
                Persistence Required
              </div>
              <div className="flex items-center gap-1">
                {selectedFormEntry.proofReceiptRequired ? <CheckCircle2 className="h-3 w-3 text-purple-400" /> : <XCircle className="h-3 w-3 text-muted-foreground" />}
                Proof/Receipt
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Duplicate Submit Protection */}
      <Card>
        <CardHeader><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-400" /> Duplicate Submit Risk</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {formSurfaces.filter(f => f.expectedPersistence && f.actionType === "submit").map(f => (
              <div key={f.routeKey} className="flex items-center justify-between p-2 rounded-md bg-muted/30">
                <span className="text-xs font-medium">{f.actionLabel}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">write operation</Badge>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  <Badge variant="outline" className="text-[10px]">needs debounce guard</Badge>
                </div>
              </div>
            ))}
            {formSurfaces.filter(f => f.expectedPersistence && f.actionType === "submit").length === 0 && (
              <p className="text-xs text-muted-foreground">No high-risk duplicate submit forms detected</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
