// ═══════════════════════════════════════════════════════════════
// ITC14 — Feature Verification Manifest Explorer
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { useSpecRegistry, STATUS_TIERS, type SpecRegistryEntry } from "@/hooks/use-implementation-truth";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { FileCheck, CheckCircle2, XCircle, AlertTriangle, Package, User, Activity } from "lucide-react";

interface ManifestArea {
  label: string;
  items: string[];
  score: number;
  status: "pass" | "fail" | "warn" | "empty";
}

function buildManifestAreas(spec: SpecRegistryEntry): ManifestArea[] {
  const area = (label: string, items: string[] | undefined, score: number): ManifestArea => {
    const arr = items || [];
    const status = arr.length === 0 ? "empty" : score >= 70 ? "pass" : score >= 30 ? "warn" : "fail";
    return { label, items: arr, score, status };
  };

  return [
    area("Routes", spec.required_routes, spec.ui_score || 0),
    area("Components", spec.required_components, spec.ui_score || 0),
    area("Contracts", spec.required_contracts, spec.contract_score || 0),
    area("Services", spec.required_services, spec.wiring_score || 0),
    area("Shells", spec.required_shells, (spec.required_shells?.length || 0) > 0 ? (spec.architecture_score || 0) : 0),
    area("Endpoints", spec.required_endpoints, (spec.required_endpoints?.length || 0) > 0 ? (spec.architecture_score || 0) : 0),
    area("Events", spec.required_events, spec.proof_score || 0),
    area("Proofs", spec.required_proofs, spec.proof_score || 0),
    area("Tests", spec.required_tests, spec.test_score || 0),
    area("Schemas", spec.required_schemas, (spec.required_schemas?.length || 0) > 0 ? (spec.architecture_score || 0) : 0),
    area("Docs", spec.required_docs, spec.docs_score || 0),
    area("Screens", spec.required_screens, spec.ui_score || 0),
    area("Projections", spec.required_projections, spec.proof_score || 0),
  ];
}

function ManifestAreaCard({ area }: { area: ManifestArea }) {
  return (
    <div className={`border rounded-lg p-3 ${area.status === "fail" ? "border-destructive/40" : area.status === "warn" ? "border-yellow-500/40" : area.status === "pass" ? "border-green-500/40" : "border-border"}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-medium text-foreground">{area.label}</span>
        {area.status === "pass" && <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />}
        {area.status === "fail" && <XCircle className="h-3.5 w-3.5 text-destructive" />}
        {area.status === "warn" && <AlertTriangle className="h-3.5 w-3.5 text-yellow-500" />}
        {area.status === "empty" && <span className="text-[8px] text-muted-foreground">N/A</span>}
      </div>
      {area.items.length > 0 ? (
        <>
          <div className="flex items-center gap-2 mb-1">
            <Progress value={area.score} className="flex-1 h-1.5" />
            <span className="text-[9px] text-muted-foreground">{area.score}%</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {area.items.map((item, i) => (
              <Badge key={i} variant="outline" className="text-[7px]">{item}</Badge>
            ))}
          </div>
        </>
      ) : (
        <div className="text-[9px] text-muted-foreground">No requirements defined</div>
      )}
    </div>
  );
}

function MissingExpectationsList({ areas }: { areas: ManifestArea[] }) {
  const missing = areas.filter(a => a.status === "fail" || (a.items.length > 0 && a.score === 0));
  if (missing.length === 0) {
    return <div className="flex items-center gap-2 text-green-500 text-[11px] py-4 justify-center"><CheckCircle2 className="h-4 w-4" /> All expectations met or N/A</div>;
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-[10px]">Area</TableHead>
          <TableHead className="text-[10px]">Required Items</TableHead>
          <TableHead className="text-[10px]">Score</TableHead>
          <TableHead className="text-[10px]">Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {missing.map(a => (
          <TableRow key={a.label}>
            <TableCell className="text-[11px] font-medium">{a.label}</TableCell>
            <TableCell className="text-[10px]">{a.items.length}</TableCell>
            <TableCell><div className="flex items-center gap-1"><Progress value={a.score} className="w-12 h-1.5" /><span className="text-[9px]">{a.score}%</span></div></TableCell>
            <TableCell><Badge variant="destructive" className="text-[8px]">FAILING</Badge></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default function ITC14ManifestExplorer() {
  const { data: specs, isLoading } = useSpecRegistry();
  const allSpecs = specs || [];
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedSpec = allSpecs.find(s => s.spec_id === selectedId);
  const areas = selectedSpec ? buildManifestAreas(selectedSpec) : [];
  const tier = selectedSpec ? STATUS_TIERS.find(t => t.value === selectedSpec.implementation_status) : null;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <FileCheck className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-semibold text-foreground">Feature Verification Manifest Explorer</h1>
          <Badge variant="outline" className="text-[8px]">ITC-14</Badge>
        </div>
        <p className="text-sm text-muted-foreground">Inspect per-feature manifests: required artifacts, validation outcomes, and missing expectations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Spec Selector */}
        <Card className="md:col-span-1">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Select Feature</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[600px] overflow-y-auto">
              {isLoading ? (
                <div className="text-[11px] text-muted-foreground text-center py-8">Loading…</div>
              ) : allSpecs.map(s => {
                const isActive = s.spec_id === selectedId;
                return (
                  <button
                    key={s.spec_id}
                    onClick={() => setSelectedId(s.spec_id)}
                    className={`w-full text-left px-4 py-2.5 border-b border-border/50 transition-colors hover:bg-muted/50 ${isActive ? "bg-primary/10 border-l-2 border-l-primary" : ""}`}
                  >
                    <div className="text-[11px] font-medium text-foreground">{s.canonical_name}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Progress value={s.overall_readiness || 0} className="w-16 h-1" />
                      <span className="text-[9px] text-muted-foreground">{s.overall_readiness}%</span>
                      <Badge variant="outline" className="text-[7px]">{s.owning_module}</Badge>
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Manifest Detail */}
        <div className="md:col-span-2 space-y-4">
          {!selectedSpec ? (
            <Card><CardContent className="pt-4 text-center py-16"><FileCheck className="h-8 w-8 mx-auto text-muted-foreground mb-2" /><div className="text-sm text-muted-foreground">Select a feature to inspect its verification manifest</div></CardContent></Card>
          ) : (
            <>
              {/* Feature Summary */}
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h2 className="text-base font-semibold text-foreground">{selectedSpec.canonical_name}</h2>
                      <div className="text-[10px] text-muted-foreground mt-0.5">{selectedSpec.description}</div>
                    </div>
                    <Badge variant="outline" className={`text-[8px] ${tier?.color}`}>{tier?.label}</Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-1.5"><User className="h-3 w-3 text-muted-foreground" /><span className="text-[10px]">{selectedSpec.owning_module}</span></div>
                    <div className="flex items-center gap-1.5"><Package className="h-3 w-3 text-muted-foreground" /><span className="text-[10px]">{selectedSpec.prompt_origin || "Unknown"}</span></div>
                    <div className="flex items-center gap-1.5">
                      <Progress value={selectedSpec.overall_readiness || 0} className="w-20 h-1.5" />
                      <span className="text-[10px] font-medium">{selectedSpec.overall_readiness}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 13 Artifact Areas */}
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Manifest: All 13 Artifact Categories</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {areas.map(a => <ManifestAreaCard key={a.label} area={a} />)}
                  </div>
                </CardContent>
              </Card>

              {/* Missing Expectations */}
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-destructive" />Missing Expectations</CardTitle></CardHeader>
                <CardContent className="p-0"><MissingExpectationsList areas={areas} /></CardContent>
              </Card>

              {/* Runtime Evidence Requirements */}
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Activity className="h-4 w-4" />Runtime Evidence Requirements</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="border border-border rounded-lg p-3">
                      <div className="text-[10px] font-medium text-foreground mb-1">Required Proofs</div>
                      {(selectedSpec.required_proofs || []).length > 0 ? (
                        <div className="flex flex-wrap gap-1">{selectedSpec.required_proofs.map((p, i) => <Badge key={i} variant="outline" className="text-[7px]">{p}</Badge>)}</div>
                      ) : <div className="text-[9px] text-muted-foreground">None defined</div>}
                    </div>
                    <div className="border border-border rounded-lg p-3">
                      <div className="text-[10px] font-medium text-foreground mb-1">Required Events</div>
                      {(selectedSpec.required_events || []).length > 0 ? (
                        <div className="flex flex-wrap gap-1">{selectedSpec.required_events.map((e, i) => <Badge key={i} variant="outline" className="text-[7px]">{e}</Badge>)}</div>
                      ) : <div className="text-[9px] text-muted-foreground">None defined</div>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-[10px] text-muted-foreground">Runtime Score:</span>
                    <Progress value={selectedSpec.runtime_score || 0} className="w-24 h-1.5" />
                    <span className={`text-[10px] font-medium ${(selectedSpec.runtime_score || 0) > 0 ? "text-green-500" : "text-destructive"}`}>{selectedSpec.runtime_score || 0}%</span>
                  </div>
                </CardContent>
              </Card>

              {/* Ownership */}
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><User className="h-4 w-4" />Ownership & Dependencies</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground w-24">Module:</span>
                      <Badge variant="outline" className="text-[9px]">{selectedSpec.owning_module}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground w-24">Prompt Origin:</span>
                      <span className="text-[10px] text-foreground">{selectedSpec.prompt_origin || "Unknown"}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[10px] text-muted-foreground w-24 shrink-0">Dependencies:</span>
                      {selectedSpec.dependencies.length > 0 ? (
                        <div className="flex flex-wrap gap-1">{selectedSpec.dependencies.map((d, i) => <Badge key={i} variant="outline" className="text-[7px]">{d}</Badge>)}</div>
                      ) : <span className="text-[9px] text-muted-foreground">None</span>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
