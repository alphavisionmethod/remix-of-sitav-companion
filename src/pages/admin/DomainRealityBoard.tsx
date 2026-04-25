// ═══════════════════════════════════════════════════════════════
// SITA OS — Domain Reality Conversion Board (Phase 24.F)
// Live: domain_ownership_registry × manifest registry × completeness
// scoring × live DB schema (get_db_truth_snapshot RPC).
// ═══════════════════════════════════════════════════════════════

import { useEffect, useMemo, useState } from "react";
import { SitaPageHeader, SitaCard, SitaCardTitle } from "@/platform/sita/components/sita/SitaCard";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { SitaTabs } from "@/platform/sita/components/sita/SitaComponents";
import { CheckCircle, XCircle, Database, FileText, Layers, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getAllDomains, getAllDomainCompleteness } from "@/lib/domain-system/domain-registry";

interface OwnershipRow {
  domain_key: string;
  display_name: string;
  owning_service: string;
  plane: string;
  status: string;
}

const pathColor = (ok: boolean) =>
  ok ? "bg-primary/10 text-primary" : "bg-amber-500/10 text-amber-600";

export default function DomainRealityBoard() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [ownership, setOwnership] = useState<OwnershipRow[]>([]);
  const [liveTables, setLiveTables] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const manifests = useMemo(() => getAllDomains(), []);
  const completeness = useMemo(() => getAllDomainCompleteness(), []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [{ data: own }, { data: schema }] = await Promise.all([
        supabase
          .from("domain_ownership_registry")
          .select("domain_key,display_name,owning_service,plane,status")
          .in("domain_key", ["business-os", "finance-os", "concierge-os", "investment-office", "boardroom"]),
        supabase.rpc("get_db_truth_snapshot", { _op: "schema" }),
      ]);
      if (cancelled) return;
      setOwnership((own ?? []) as OwnershipRow[]);
      const tables = (schema as { tables?: unknown[] } | null)?.tables ?? [];
      setLiveTables(new Set(tables.map((t: any) => t.tablename as string)));
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const domains = manifests.filter((m) =>
    ["business", "finance", "concierge", "investment", "boardroom"].includes(m.id),
  );

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl space-y-6 p-6 flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading live domain truth…
      </div>
    );
  }

  const domain = domains[selectedIdx];
  const score = completeness.find((c) => c.domainId === domain.id);
  const owner = ownership.find((o) => o.domain_key.startsWith(domain.id));
  const ownerOk = !!owner;

  const entityRows = domain.entities.map((e) => ({
    name: e.name,
    table: e.dbTable,
    inLiveDb: e.dbTable ? liveTables.has(e.dbTable) : true,
  }));
  const present = entityRows.filter((r) => r.inLiveDb).length;
  const readiness = Math.round((present / Math.max(1, entityRows.length)) * 100);

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <SitaPageHeader
        title="Domain Reality Conversion Board"
        subtitle="Live: ownership registry × manifest registry × DB schema (Phase 24)"
      />

      <SitaTabs
        tabs={domains.map((d) => ({ key: d.id, label: d.name }))}
        active={domain.id}
        onChange={(tab) => setSelectedIdx(domains.findIndex((d) => d.id === tab))}
      />

      <SitaCard className="p-4">
        <div className="flex items-center justify-between mb-3">
          <SitaCardTitle>{domain.name} — Reality Map</SitaCardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Tables present</span>
            <span className="text-lg font-bold text-foreground">{readiness}%</span>
          </div>
        </div>
        <Progress value={readiness} className="h-2 mb-4" />

        <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
          <div>
            <div className="text-muted-foreground text-xs uppercase">Owner</div>
            <div className="flex items-center gap-2">
              {ownerOk ? <CheckCircle className="h-4 w-4 text-primary" /> : <XCircle className="h-4 w-4 text-destructive" />}
              {owner?.owning_service ?? "—"}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground text-xs uppercase">Plane</div>
            <div>{owner?.plane ?? "—"}</div>
          </div>
          <div>
            <div className="text-muted-foreground text-xs uppercase">Completeness</div>
            <div>{score ? `${score.totalScore}/100 (${score.grade})` : "—"}</div>
          </div>
          <div>
            <div className="text-muted-foreground text-xs uppercase">Workflows</div>
            <div>{domain.workflows.length}</div>
          </div>
        </div>

        <div className="space-y-1">
          <div className="grid grid-cols-3 text-[10px] font-medium text-muted-foreground uppercase px-3 py-1">
            <span>Entity</span>
            <span>DB Table</span>
            <span>In Live Schema</span>
          </div>
          {entityRows.map((r) => (
            <div key={r.name} className="grid grid-cols-3 items-center px-3 py-2 rounded-lg hover:bg-muted/30 text-sm">
              <span className="font-medium text-foreground flex items-center gap-2">
                <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                {r.name}
              </span>
              <span className="text-xs text-muted-foreground">{r.table ?? "—"}</span>
              <span>
                <Badge className={pathColor(r.inLiveDb)} variant="secondary">
                  {r.table ? (r.inLiveDb ? "present" : "missing") : "n/a"}
                </Badge>
              </span>
            </div>
          ))}
        </div>
      </SitaCard>

      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><Database className="h-3 w-3" /> Live tables = get_db_truth_snapshot(schema)</span>
        <span className="flex items-center gap-1"><Layers className="h-3 w-3" /> Ownership = domain_ownership_registry</span>
      </div>
    </div>
  );
}
