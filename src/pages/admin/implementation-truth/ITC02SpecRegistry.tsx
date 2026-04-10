// ═══════════════════════════════════════════════════════════════
// ITC02 — Spec Registry (10-dimension, full artifact sections, drift badge)
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { useSpecRegistry, useDeleteSpec, STATUS_TIERS, ALL_DIMENSIONS, type SpecRegistryEntry, type ImplementationStatus } from "@/hooks/use-implementation-truth";
import { useSeedSpecs } from "@/hooks/use-spec-seed";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, Database, Trash2, Search, Loader2, BookOpen } from "lucide-react";

function StatusBadge({ status }: { status: ImplementationStatus }) {
  const tier = STATUS_TIERS.find(t => t.value === status);
  return <Badge variant="outline" className={`text-[8px] ${tier?.color || ""}`}>{tier?.label || status}</Badge>;
}

function DriftBadge({ state }: { state: string }) {
  if (state === "aligned") return <Badge variant="outline" className="text-[7px] text-green-500 border-green-500/30">Aligned</Badge>;
  if (state === "drifted") return <Badge variant="destructive" className="text-[7px]">Drifted</Badge>;
  if (state === "partial") return <Badge variant="secondary" className="text-[7px] text-yellow-500">Partial</Badge>;
  return <Badge variant="outline" className="text-[7px]">Unknown</Badge>;
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[9px] text-muted-foreground w-28 shrink-0">{label}</span>
      <Progress value={value} className="flex-1 h-1.5" />
      <span className={`text-[9px] w-6 text-right ${value >= 80 ? "text-green-500" : value >= 50 ? "text-yellow-500" : "text-destructive"}`}>{value}</span>
    </div>
  );
}

const ARTIFACT_KEYS: { key: keyof SpecRegistryEntry; label: string }[] = [
  { key: "required_routes", label: "Routes" },
  { key: "required_screens", label: "Screens" },
  { key: "required_components", label: "Components" },
  { key: "required_shells", label: "Shells" },
  { key: "required_services", label: "Services" },
  { key: "required_contracts", label: "Contracts" },
  { key: "required_endpoints", label: "Endpoints" },
  { key: "required_schemas", label: "Schemas" },
  { key: "required_events", label: "Events" },
  { key: "required_tests", label: "Tests" },
  { key: "required_proofs", label: "Proofs" },
  { key: "required_projections", label: "Projections" },
  { key: "required_docs", label: "Docs" },
];

export default function ITC02SpecRegistry() {
  const { data: specs, isLoading } = useSpecRegistry();
  const deleteMut = useDeleteSpec();
  const seedMut = useSeedSpecs();
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = (specs || []).filter(s =>
    s.canonical_name.toLowerCase().includes(search.toLowerCase()) ||
    s.owning_module.toLowerCase().includes(search.toLowerCase()) ||
    s.spec_id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-semibold text-foreground">Spec Registry</h1>
          <Badge variant="outline" className="text-[8px]">ITC-02</Badge>
        </div>
        <p className="text-sm text-muted-foreground">Canonical record of every major platform system and its verification state</p>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="Search specs…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-8 text-sm" />
        </div>
        <Button size="sm" variant="outline" onClick={() => seedMut.mutate()} disabled={seedMut.isPending}>
          {seedMut.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Database className="h-3 w-3 mr-1" />}
          Seed Canonical Specs
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8"></TableHead>
                <TableHead className="text-[10px]">Spec</TableHead>
                <TableHead className="text-[10px]">Module</TableHead>
                <TableHead className="text-[10px]">Status</TableHead>
                <TableHead className="text-[10px]">Drift</TableHead>
                <TableHead className="text-[10px]">Readiness</TableHead>
                <TableHead className="text-[10px]">Artifacts</TableHead>
                <TableHead className="w-8"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground text-[11px] py-8">Loading…</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground text-[11px] py-8">No specs found</TableCell></TableRow>
              ) : filtered.map(spec => {
                const totalArtifacts = ARTIFACT_KEYS.reduce((sum, a) => {
                  const arr = spec[a.key];
                  return sum + (Array.isArray(arr) ? arr.length : 0);
                }, 0);

                return (
                  <Collapsible key={spec.spec_id} open={expanded === spec.spec_id} onOpenChange={open => setExpanded(open ? spec.spec_id : null)} asChild>
                    <>
                      <CollapsibleTrigger asChild>
                        <TableRow className="cursor-pointer">
                          <TableCell className="w-8 pr-0">
                            {expanded === spec.spec_id ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                          </TableCell>
                          <TableCell>
                            <div className="text-[11px] font-medium">{spec.canonical_name}</div>
                            <div className="text-[9px] text-muted-foreground">{spec.spec_id}</div>
                          </TableCell>
                          <TableCell className="text-[10px]">{spec.owning_module}</TableCell>
                          <TableCell><StatusBadge status={spec.implementation_status} /></TableCell>
                          <TableCell><DriftBadge state={spec.drift_state || "unknown"} /></TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <Progress value={spec.overall_readiness} className="w-14 h-1.5" />
                              <span className="text-[10px]">{spec.overall_readiness}%</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-[10px]">{totalArtifacts}</TableCell>
                          <TableCell>
                            {spec.user_id !== "demo" && (
                              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={e => { e.stopPropagation(); deleteMut.mutate(spec.id); }}>
                                <Trash2 className="h-3 w-3 text-destructive" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      </CollapsibleTrigger>
                      <CollapsibleContent asChild>
                        <TableRow>
                          <TableCell colSpan={8} className="bg-muted/30 px-6 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <div className="text-[10px] text-muted-foreground">{spec.description}</div>
                                <div className="text-[9px]"><strong>Prompt:</strong> {spec.prompt_origin || "—"}</div>
                                <div className="text-[9px]"><strong>Dependencies:</strong> {spec.dependencies?.join(", ") || "—"}</div>
                                {ARTIFACT_KEYS.map(a => {
                                  const arr = spec[a.key];
                                  const items = Array.isArray(arr) ? arr : [];
                                  if (items.length === 0) return null;
                                  return (
                                    <div key={a.key} className="text-[9px]">
                                      <strong>{a.label}:</strong> {items.join(", ")}
                                    </div>
                                  );
                                })}
                              </div>
                              <div className="space-y-1.5">
                                <div className="text-[10px] font-medium mb-2">10-Dimension Scores</div>
                                {ALL_DIMENSIONS.map(d => (
                                  <ScoreBar key={d.key} label={d.label} value={(spec[d.key] as number) || 0} />
                                ))}
                                <div className="border-t pt-1.5 mt-1.5">
                                  <ScoreBar label="Overall" value={spec.overall_readiness} />
                                </div>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      </CollapsibleContent>
                    </>
                  </Collapsible>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
