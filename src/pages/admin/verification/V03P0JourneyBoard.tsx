// ═══════════════════════════════════════════════════════
// SITA OS — V03: Journey Manifest Registry
// Full CUSTOMER_JOURNEY_REGISTRY browser with filters
// ═══════════════════════════════════════════════════════

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useVerificationSurfaces } from "@/lib/verification/verification-hooks";
import {
  CUSTOMER_JOURNEY_REGISTRY,
  type JourneyDefinition,
  type LaunchImpact,
} from "@/lib/customer-journey/journey-registry";
import {
  ShieldCheck, CheckCircle2, XCircle, Clock, Search, ChevronDown, ChevronRight,
  AlertTriangle, Target, Users
} from "lucide-react";

const IMPORTANCE_ORDER: LaunchImpact[] = ["launch_blocker", "pilot_blocker", "claim_risk", "important_non_blocker", "non_blocking"];
const IMPORTANCE_COLORS: Record<LaunchImpact, string> = {
  launch_blocker: "destructive",
  pilot_blocker: "default",
  claim_risk: "outline",
  important_non_blocker: "secondary",
  non_blocking: "secondary",
};

export default function V03JourneyManifestRegistry() {
  const [search, setSearch] = useState("");
  const [domainFilter, setDomainFilter] = useState("all");
  const [personaFilter, setPersonaFilter] = useState("all");
  const [importanceFilter, setImportanceFilter] = useState("all");
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());
  const { data: dbSurfaces } = useVerificationSurfaces();

  const surfaceMap = useMemo(() => {
    const m = new Map<string, Record<string, any>>();
    (dbSurfaces || []).forEach((s: Record<string, any>) => m.set(s.route_key, s));
    return m;
  }, [dbSurfaces]);

  const domains = useMemo(() => [...new Set(CUSTOMER_JOURNEY_REGISTRY.map((j) => j.domain))].sort(), []);
  const personas = useMemo(() => [...new Set(CUSTOMER_JOURNEY_REGISTRY.map((j) => j.persona))].sort(), []);

  // Domain warning: domains with fewer than 2 journeys
  const thinDomains = useMemo(() => {
    const counts = new Map<string, number>();
    CUSTOMER_JOURNEY_REGISTRY.forEach((j) => counts.set(j.domain, (counts.get(j.domain) || 0) + 1));
    return Array.from(counts.entries()).filter(([, c]) => c < 2).map(([d]) => d);
  }, []);

  const filtered = useMemo(() => {
    let list = CUSTOMER_JOURNEY_REGISTRY;
    if (domainFilter !== "all") list = list.filter((j) => j.domain === domainFilter);
    if (personaFilter !== "all") list = list.filter((j) => j.persona === personaFilter);
    if (importanceFilter !== "all") list = list.filter((j) => j.launchImportance === importanceFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (j) =>
          j.displayName.toLowerCase().includes(q) ||
          j.journeyKey.toLowerCase().includes(q) ||
          j.domain.toLowerCase().includes(q)
      );
    }
    return list;
  }, [domainFilter, personaFilter, importanceFilter, search]);

  // Stats
  const totalJourneys = CUSTOMER_JOURNEY_REGISTRY.length;
  const blockerCount = CUSTOMER_JOURNEY_REGISTRY.filter((j) => j.launchImportance === "launch_blocker" || j.launchImportance === "pilot_blocker").length;
  const importanceDist = useMemo(() => {
    const m = new Map<LaunchImpact, number>();
    CUSTOMER_JOURNEY_REGISTRY.forEach((j) => m.set(j.launchImportance, (m.get(j.launchImportance) || 0) + 1));
    return m;
  }, []);

  const toggleExpand = (key: string) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <div className="space-y-6 p-6" data-testid="verification-journey-registry">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-primary" />
          V03 — Journey Manifest Registry
        </h1>
        <p className="text-muted-foreground mt-1">Complete journey inventory with step drill-down, domain/persona/importance filters</p>
      </div>

      {/* KPI Band */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card><CardContent className="p-3 text-center">
          <div className="text-2xl font-bold text-primary">{totalJourneys}</div>
          <div className="text-[10px] text-muted-foreground">Total Journeys</div>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <div className="text-2xl font-bold text-destructive">{blockerCount}</div>
          <div className="text-[10px] text-muted-foreground">Launch/Pilot Blockers</div>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <div className="text-2xl font-bold text-blue-500">{domains.length}</div>
          <div className="text-[10px] text-muted-foreground">Domains</div>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <div className="text-2xl font-bold text-amber-500">{personas.length}</div>
          <div className="text-[10px] text-muted-foreground">Personas</div>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <div className="text-2xl font-bold text-destructive">{thinDomains.length}</div>
          <div className="text-[10px] text-muted-foreground">Thin Domains</div>
        </CardContent></Card>
      </div>

      {/* Importance Distribution */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold text-sm mb-2">Launch Importance Distribution</h3>
          <div className="flex flex-wrap gap-2">
            {IMPORTANCE_ORDER.map((imp) => (
              <Badge
                key={imp}
                variant={IMPORTANCE_COLORS[imp] as any}
                className="text-xs cursor-pointer"
                onClick={() => setImportanceFilter(importanceFilter === imp ? "all" : imp)}
              >
                {imp.replace(/_/g, " ")} ({importanceDist.get(imp) || 0})
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Thin Domain Warnings */}
      {thinDomains.length > 0 && (
        <Card className="border-amber-500/40">
          <CardContent className="p-4">
            <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Domains with &lt; 2 journeys registered
            </h3>
            <div className="flex flex-wrap gap-2">
              {thinDomains.map((d) => (
                <Badge key={d} variant="outline" className="text-xs">{d}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search journeys..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 h-9" />
        </div>
        <Tabs value={domainFilter} onValueChange={setDomainFilter}>
          <TabsList className="h-8 flex-wrap">
            <TabsTrigger value="all" className="text-[10px]">All domains</TabsTrigger>
            {domains.slice(0, 8).map((d) => (
              <TabsTrigger key={d} value={d} className="text-[10px]">{d}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <Tabs value={personaFilter} onValueChange={setPersonaFilter}>
          <TabsList className="h-8">
            <TabsTrigger value="all" className="text-[10px]">All personas</TabsTrigger>
            {personas.map((p) => (
              <TabsTrigger key={p} value={p} className="text-[10px]">{p}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Journey Cards */}
      <div className="space-y-2">
        {filtered.map((journey) => {
          const isExpanded = expandedKeys.has(journey.journeyKey);
          return (
            <Card key={journey.journeyKey} className="border-border/50">
              <CardContent className="p-0">
                <Collapsible open={isExpanded} onOpenChange={() => toggleExpand(journey.journeyKey)}>
                  <CollapsibleTrigger className="w-full p-4 flex items-center gap-3 hover:bg-muted/30 transition-colors text-left">
                    {isExpanded ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{journey.displayName}</span>
                        <Badge variant={IMPORTANCE_COLORS[journey.launchImportance] as any} className="text-[10px]">
                          {journey.launchImportance.replace(/_/g, " ")}
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">{journey.persona}</Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                        <span className="font-mono">{journey.domain}</span>
                        <span>•</span>
                        <span>{journey.steps.length} steps</span>
                        <span>•</span>
                        <span>{journey.routeFamily}</span>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-[10px]">{journey.steps.length} steps</Badge>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <div className="px-4 pb-4 border-t border-border/30 pt-3 space-y-3">
                      {/* Steps */}
                      <div className="space-y-1">
                        {journey.steps.map((step) => (
                          <div key={step.order} className="flex items-start gap-2 text-xs">
                            <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-[10px] font-bold text-primary">
                              {step.order}
                            </div>
                            <div>
                              <div className="font-medium">{step.name}</div>
                              <div className="text-muted-foreground">{step.expectedBehavior}</div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Metadata */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                        <div>
                          <div className="text-muted-foreground">Expected Outcome</div>
                          <div className="font-medium">{journey.expectedOutcome}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Owner</div>
                          <div className="font-mono">{journey.owner}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Modes</div>
                          <div className="flex gap-1">{journey.primaryModes.map((m) => <Badge key={m} variant="outline" className="text-[10px]">{m}</Badge>)}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Dependencies</div>
                          <div className="flex flex-wrap gap-1">
                            {journey.dependencies.length > 0
                              ? journey.dependencies.map((d) => <Badge key={d} variant="secondary" className="text-[10px]">{d}</Badge>)
                              : <span className="text-muted-foreground">none</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="text-xs text-muted-foreground">
        Showing {filtered.length} of {totalJourneys} journeys
      </div>
    </div>
  );
}
