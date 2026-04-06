// ═══════════════════════════════════════════════════════
// SITA OS — CJ02: Journey Truth Matrix
// Full list with multi-filters, proof confidence, owner, mode coverage
// ═══════════════════════════════════════════════════════

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCustomerJourneys } from "@/lib/customer-journey/journey-hooks";
import { useJourneySummaryView } from "@/lib/customer-journey/journey-ingestion-hooks";
import { JOURNEY_STATUS_CONFIG, LAUNCH_IMPACT_CONFIG } from "@/lib/customer-journey/journey-registry";
import { Table, Loader2, Filter } from "lucide-react";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const PROOF_CONFIDENCE_CONFIG: Record<string, { label: string; color: string }> = {
  verified_e2e: { label: "E2E Verified", color: "bg-emerald-500/15 text-emerald-400" },
  verified_interaction: { label: "Interaction", color: "bg-blue-500/15 text-blue-400" },
  verified_component_only: { label: "Component", color: "bg-amber-500/15 text-amber-400" },
  manually_confirmed: { label: "Manual", color: "bg-purple-500/15 text-purple-400" },
  unverified: { label: "Unverified", color: "bg-muted text-muted-foreground" },
};

export default function CJ02JourneyTruthMatrix() {
  const { data: journeys, isLoading: legacyLoading } = useCustomerJourneys();
  const { data: summaryView, isLoading: viewLoading } = useJourneySummaryView();
  const [search, setSearch] = useState("");
  const [domainFilter, setDomainFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [impactFilter, setImpactFilter] = useState("all");
  const [surfaceFilter, setSurfaceFilter] = useState("all");
  const [ownerFilter, setOwnerFilter] = useState("all");

  const isLoading = legacyLoading && viewLoading;

  // Prefer summary view data, fall back to legacy
  const allJourneys = useMemo(() => {
    if ((summaryView ?? []).length > 0) {
      return (summaryView ?? []).map((j: any) => ({
        id: j.journey_id || j.id,
        journey_key: j.journey_key,
        display_name: j.display_name,
        domain: j.domain_family || j.domain,
        persona: j.persona,
        primary_modes: j.supported_modes || j.primary_modes || [],
        current_status: j.current_status || "unverified",
        launch_importance: j.launch_importance || j.priority_class,
        proof_confidence: j.proof_confidence || "unverified",
        owner: j.owner_team || j.owner,
        surface_class: j.surface_class || "web_app",
        last_verified_at: j.last_verified_at,
      }));
    }
    return (journeys ?? []).map((j: any) => ({
      ...j,
      proof_confidence: "unverified",
      surface_class: "web_app",
    }));
  }, [summaryView, journeys]);

  // Extract unique filter values
  const domains = useMemo(() => [...new Set(allJourneys.map((j: any) => j.domain as string))].sort(), [allJourneys]);
  const statuses = useMemo(() => [...new Set(allJourneys.map((j: any) => j.current_status as string))].sort(), [allJourneys]);
  const owners = useMemo(() => [...new Set(allJourneys.map((j: any) => j.owner as string).filter(Boolean))].sort(), [allJourneys]);
  const surfaces = useMemo(() => [...new Set(allJourneys.map((j: any) => j.surface_class as string).filter(Boolean))].sort(), [allJourneys]);

  const filtered = useMemo(() => {
    return allJourneys.filter((j: any) => {
      if (search && !j.journey_key.toLowerCase().includes(search.toLowerCase()) &&
          !j.display_name.toLowerCase().includes(search.toLowerCase())) return false;
      if (domainFilter !== "all" && j.domain !== domainFilter) return false;
      if (statusFilter !== "all" && j.current_status !== statusFilter) return false;
      if (impactFilter !== "all" && j.launch_importance !== impactFilter) return false;
      if (surfaceFilter !== "all" && j.surface_class !== surfaceFilter) return false;
      if (ownerFilter !== "all" && j.owner !== ownerFilter) return false;
      return true;
    });
  }, [allJourneys, search, domainFilter, statusFilter, impactFilter, surfaceFilter, ownerFilter]);

  return (
    <div className="space-y-6 p-6" data-testid="cj02-truth-matrix">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Table className="h-6 w-6 text-primary" />
          CJ02 — Journey Truth Matrix
        </h1>
        <p className="text-muted-foreground mt-1">Full list of all journeys with current status, proof confidence, and launch impact</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search key or name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-48"
        />
        <Select value={domainFilter} onValueChange={setDomainFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Domain" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Domains</SelectItem>
            {domains.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {statuses.map((s) => <SelectItem key={s} value={s}>{JOURNEY_STATUS_CONFIG[s]?.label || s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={impactFilter} onValueChange={setImpactFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Launch Impact" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Impact</SelectItem>
            {Object.entries(LAUNCH_IMPACT_CONFIG).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={surfaceFilter} onValueChange={setSurfaceFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Surface" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Surfaces</SelectItem>
            {surfaces.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={ownerFilter} onValueChange={setOwnerFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Owner" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Owners</SelectItem>
            {owners.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground ml-auto">{filtered.length} of {allJourneys.length} journeys</span>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="space-y-1">
          {/* Header */}
          <div className="grid grid-cols-16 gap-1 px-4 py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide border-b">
            <div className="col-span-3">Journey</div>
            <div className="col-span-2">Domain</div>
            <div>Persona</div>
            <div>Surface</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Launch Impact</div>
            <div className="col-span-2">Proof</div>
            <div>Owner</div>
            <div>Modes</div>
            <div>Verified</div>
          </div>

          {filtered.map((j: any) => {
            const statusCfg = JOURNEY_STATUS_CONFIG[j.current_status] || JOURNEY_STATUS_CONFIG.unverified;
            const impactCfg = LAUNCH_IMPACT_CONFIG[j.launch_importance] || LAUNCH_IMPACT_CONFIG.non_blocking;
            const proofCfg = PROOF_CONFIDENCE_CONFIG[j.proof_confidence] || PROOF_CONFIDENCE_CONFIG.unverified;
            const modes = Array.isArray(j.primary_modes) ? j.primary_modes : [];
            return (
              <div key={j.id} className="grid grid-cols-16 gap-1 px-4 py-2 items-center border-b border-border/30 hover:bg-muted/20 transition-colors">
                <div className="col-span-3">
                  <div className="font-medium text-sm truncate">{j.display_name}</div>
                  <div className="font-mono text-[10px] text-muted-foreground truncate">{j.journey_key}</div>
                </div>
                <div className="col-span-2 text-xs capitalize">{j.domain}</div>
                <div className="text-[10px] capitalize">{j.persona}</div>
                <div className="text-[10px]">{j.surface_class}</div>
                <div className="col-span-2">
                  <Badge variant="outline" className={`${statusCfg.color} text-[10px]`}>{statusCfg.label}</Badge>
                </div>
                <div className="col-span-2">
                  <Badge variant="outline" className={`${impactCfg.color} text-[10px]`}>{impactCfg.label}</Badge>
                </div>
                <div className="col-span-2">
                  <Badge variant="outline" className={`${proofCfg.color} text-[10px]`}>{proofCfg.label}</Badge>
                </div>
                <div className="text-[10px] text-muted-foreground truncate">{j.owner || "—"}</div>
                <div className="text-[10px]">
                  {modes.map((m: string) => (
                    <span key={m} className="inline-block mr-1 px-1 rounded bg-muted text-[9px]">{m}</span>
                  ))}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  {j.last_verified_at ? new Date(j.last_verified_at).toLocaleDateString() : "Never"}
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <Card><CardContent className="py-8 text-center text-muted-foreground">No journeys match filters. Seed from registry first.</CardContent></Card>
          )}
        </div>
      )}
    </div>
  );
}
