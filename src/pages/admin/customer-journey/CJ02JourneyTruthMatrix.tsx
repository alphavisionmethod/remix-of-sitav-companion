// ═══════════════════════════════════════════════════════
// SITA OS — CJ02: Journey Truth Matrix
// Full list of all journeys and current status
// ═══════════════════════════════════════════════════════

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCustomerJourneys } from "@/lib/customer-journey/journey-hooks";
import { JOURNEY_STATUS_CONFIG, LAUNCH_IMPACT_CONFIG } from "@/lib/customer-journey/journey-registry";
import { Table, Loader2 } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";

export default function CJ02JourneyTruthMatrix() {
  const { data: journeys, isLoading } = useCustomerJourneys();
  const [filter, setFilter] = useState("");

  const filtered = (journeys ?? []).filter((j: any) =>
    !filter || j.journey_key.toLowerCase().includes(filter.toLowerCase()) ||
    j.display_name.toLowerCase().includes(filter.toLowerCase()) ||
    j.domain.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-6 p-6" data-testid="cj02-truth-matrix">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Table className="h-6 w-6 text-primary" />
          CJ02 — Journey Truth Matrix
        </h1>
        <p className="text-muted-foreground mt-1">Full list of all journeys with current status and launch impact</p>
      </div>

      <Input
        placeholder="Filter by key, name, or domain..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="max-w-md"
      />

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="space-y-2">
          {/* Header */}
          <div className="grid grid-cols-12 gap-2 px-4 text-xs font-semibold text-muted-foreground">
            <div className="col-span-3">Journey</div>
            <div className="col-span-2">Domain</div>
            <div>Persona</div>
            <div>Mode</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Launch Impact</div>
            <div>Verified</div>
          </div>

          {filtered.map((j: any) => {
            const statusCfg = JOURNEY_STATUS_CONFIG[j.current_status] || JOURNEY_STATUS_CONFIG.unverified;
            const impactCfg = LAUNCH_IMPACT_CONFIG[j.launch_importance] || LAUNCH_IMPACT_CONFIG.non_blocking;
            return (
              <Card key={j.id}>
                <CardContent className="p-3 grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-3">
                    <div className="font-medium text-sm">{j.display_name}</div>
                    <div className="font-mono text-[10px] text-muted-foreground">{j.journey_key}</div>
                  </div>
                  <div className="col-span-2 text-sm capitalize">{j.domain}</div>
                  <div className="text-xs capitalize">{j.persona}</div>
                  <div className="text-xs">{(j.primary_modes || []).join(", ")}</div>
                  <div className="col-span-2">
                    <Badge variant="outline" className={`${statusCfg.color} text-[10px]`}>{statusCfg.label}</Badge>
                  </div>
                  <div className="col-span-2">
                    <Badge variant="outline" className={`${impactCfg.color} text-[10px]`}>{impactCfg.label}</Badge>
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {j.last_verified_at ? new Date(j.last_verified_at).toLocaleDateString() : "Never"}
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {filtered.length === 0 && (
            <Card><CardContent className="py-8 text-center text-muted-foreground">No journeys found. Seed from registry first.</CardContent></Card>
          )}
        </div>
      )}
    </div>
  );
}
