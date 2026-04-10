// ═══════════════════════════════════════════════════════════════
// ITC07 — Implementation Map
// Per-spec artifact presence: routes, components, services, contracts
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { useSpecRegistry, type SpecRegistryEntry } from "@/hooks/use-implementation-truth";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Map, CheckCircle2, XCircle, ChevronDown, ChevronRight, Search } from "lucide-react";

type ArtifactType = "required_routes" | "required_components" | "required_services" | "required_contracts" | "required_events" | "required_tests" | "required_proofs";

const ARTIFACT_SECTIONS: { key: ArtifactType; label: string }[] = [
  { key: "required_routes", label: "Routes" },
  { key: "required_components", label: "Components" },
  { key: "required_services", label: "Services" },
  { key: "required_contracts", label: "Contracts" },
  { key: "required_events", label: "Events" },
  { key: "required_tests", label: "Tests" },
  { key: "required_proofs", label: "Proofs" },
];

function ArtifactList({ items }: { items: string[] }) {
  if (!items || items.length === 0) return <span className="text-[10px] text-muted-foreground italic">None specified</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {items.map((item, i) => (
        <Badge key={i} variant="outline" className="text-[9px] font-mono h-5">
          {item}
        </Badge>
      ))}
    </div>
  );
}

function SpecCard({ spec }: { spec: SpecRegistryEntry }) {
  const [open, setOpen] = useState(false);

  const totalArtifacts = ARTIFACT_SECTIONS.reduce((sum, s) => {
    const arr = (spec as any)[s.key] as string[] | null;
    return sum + (arr?.length || 0);
  }, 0);

  const filledSections = ARTIFACT_SECTIONS.filter(s => {
    const arr = (spec as any)[s.key] as string[] | null;
    return arr && arr.length > 0;
  }).length;

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2 cursor-pointer" onClick={() => setOpen(!open)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {open ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
            <CardTitle className="text-sm">{spec.canonical_name}</CardTitle>
            <Badge variant="outline" className="text-[8px] h-4 font-mono">{spec.spec_id}</Badge>
          </div>
          <div className="flex items-center gap-2">
            {filledSections === ARTIFACT_SECTIONS.length ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
            ) : (
              <XCircle className="h-3.5 w-3.5 text-orange-500" />
            )}
            <span className="text-[10px] text-muted-foreground">{totalArtifacts} artifacts · {filledSections}/{ARTIFACT_SECTIONS.length} sections</span>
          </div>
        </div>
      </CardHeader>
      {open && (
        <CardContent className="pt-0 space-y-3">
          <div className="text-[10px] text-muted-foreground">Module: <span className="text-foreground">{spec.owning_module}</span></div>
          {ARTIFACT_SECTIONS.map(section => {
            const arr = (spec as any)[section.key] as string[] | null;
            return (
              <div key={section.key}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-medium text-muted-foreground">{section.label}</span>
                  <Badge variant={arr && arr.length > 0 ? "default" : "secondary"} className="text-[8px] h-4">
                    {arr?.length || 0}
                  </Badge>
                </div>
                <ArtifactList items={arr || []} />
              </div>
            );
          })}
        </CardContent>
      )}
    </Card>
  );
}

export default function ITC07ImplementationMap() {
  const { data: specs, isLoading } = useSpecRegistry();
  const [search, setSearch] = useState("");

  const filtered = (specs || []).filter(s =>
    s.canonical_name.toLowerCase().includes(search.toLowerCase()) ||
    s.spec_id.toLowerCase().includes(search.toLowerCase()) ||
    s.owning_module.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Map className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-semibold text-foreground">Implementation Map</h1>
          <Badge variant="outline" className="text-[8px]">ITC07</Badge>
        </div>
        <p className="text-sm text-muted-foreground">Per-spec artifact inventory — routes, components, services, contracts, events, tests, proofs</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input placeholder="Search specs..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-8 text-sm" />
      </div>

      {isLoading ? (
        <div className="text-sm text-muted-foreground py-8 text-center">Loading specs...</div>
      ) : filtered.length === 0 ? (
        <div className="text-sm text-muted-foreground py-8 text-center">No specs found. Seed specs from the Spec Registry page.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map(spec => <SpecCard key={spec.id} spec={spec} />)}
        </div>
      )}
    </div>
  );
}
