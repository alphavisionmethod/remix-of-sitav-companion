// ═══════════════════════════════════════════════════════════════
// SITA OS — /admin/ai-runtime/dependency-findings (Phase 3D)
// Operator drilldown into normalized npm audit findings + linked
// implementation suggestions. Admin AI engineering team only.
// ═══════════════════════════════════════════════════════════════
import { useEffect, useMemo, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, RefreshCw, Filter, ExternalLink, Inbox } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { EmptyState } from "@/platform/sita/components/sita/EmptyState";
import { Skeleton } from "@/components/primitives/feedback/Skeleton";

interface Finding {
  id: string;
  package_name: string;
  ecosystem: string;
  current_version: string | null;
  target_version: string | null;
  issue_class: string;
  severity: string;
  advisory_id: string;
  source_evidence: any;
  suggested_action: string | null;
  upgrade_risk: string;
  related_suggestion_id: string | null;
  created_at: string;
  updated_at: string;
}

const SEV_TONE: Record<string, string> = {
  critical: "bg-red-500/15 text-red-400 border-red-500/30",
  high: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  moderate: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  low: "bg-muted text-muted-foreground",
};

const RISK_TONE: Record<string, string> = {
  breaking: "bg-red-500/15 text-red-400",
  high: "bg-orange-500/15 text-orange-400",
  medium: "bg-amber-500/15 text-amber-400",
  low: "bg-green-500/15 text-green-400",
  unknown: "bg-muted text-muted-foreground",
};

export default function DependencyFindingsBoard() {
  const [findings, setFindings] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [ecoFilter, setEcoFilter] = useState<string>("all");

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("dependency_upgrade_findings")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) toast.error("Findings load failed", { description: error.message });
    else setFindings((data ?? []) as Finding[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const channel = supabase
      .channel("admin-dep-findings")
      .on("postgres_changes", { event: "*", schema: "public", table: "dependency_upgrade_findings" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [load]);

  const filtered = useMemo(() => findings.filter((f) => {
    if (severityFilter !== "all" && f.severity !== severityFilter) return false;
    if (ecoFilter !== "all" && f.ecosystem !== ecoFilter) return false;
    return true;
  }), [findings, severityFilter, ecoFilter]);

  const totals = useMemo(() => {
    const t = { total: findings.length, critical: 0, high: 0, moderate: 0, linked: 0 };
    for (const f of findings) {
      if (f.severity === "critical") t.critical++;
      if (f.severity === "high") t.high++;
      if (f.severity === "moderate") t.moderate++;
      if (f.related_suggestion_id) t.linked++;
    }
    return t;
  }, [findings]);

  const ecosystems = useMemo(() => Array.from(new Set(findings.map((f) => f.ecosystem))).sort(), [findings]);

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-7xl">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-primary" />
            Dependency Upgrade Findings
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Phase 3 — real ecosystem audit findings ingested by{" "}
            <code className="text-[11px]">internal-agent-dependency-scanner</code>. Severity ≥ moderate auto-creates an implementation suggestion.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
            Refresh
          </Button>
          <Button asChild variant="outline" size="sm">
            <a href="/docs/runbooks/dependency-upgrade-proposer.md" target="_blank" rel="noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" /> Runbook
            </a>
          </Button>
        </div>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card><CardContent className="p-3"><div className="text-xs text-muted-foreground">Total</div><div className="text-2xl font-semibold mt-0.5">{totals.total}</div></CardContent></Card>
        <Card className="bg-red-500/5"><CardContent className="p-3"><div className="text-xs text-muted-foreground">Critical</div><div className="text-2xl font-semibold mt-0.5 text-red-400">{totals.critical}</div></CardContent></Card>
        <Card className="bg-orange-500/5"><CardContent className="p-3"><div className="text-xs text-muted-foreground">High</div><div className="text-2xl font-semibold mt-0.5 text-orange-400">{totals.high}</div></CardContent></Card>
        <Card className="bg-amber-500/5"><CardContent className="p-3"><div className="text-xs text-muted-foreground">Moderate</div><div className="text-2xl font-semibold mt-0.5 text-amber-400">{totals.moderate}</div></CardContent></Card>
        <Card><CardContent className="p-3"><div className="text-xs text-muted-foreground">Linked to suggestions</div><div className="text-2xl font-semibold mt-0.5">{totals.linked}</div></CardContent></Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-3 flex flex-wrap items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)} className="h-8 px-2 text-xs rounded-md border bg-background">
            <option value="all">All severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="moderate">Moderate</option>
            <option value="low">Low</option>
          </select>
          <select value={ecoFilter} onChange={(e) => setEcoFilter(e.target.value)} className="h-8 px-2 text-xs rounded-md border bg-background">
            <option value="all">All ecosystems</option>
            {ecosystems.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
          <Badge variant="outline" className="ml-auto">{filtered.length} shown</Badge>
        </CardContent>
      </Card>

      {/* List */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="p-6 space-y-2">
            {loading ? (
              <>
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-2/5" />
              </>
            ) : (
              <EmptyState
                icon={<Inbox className="h-5 w-5" />}
                title="No dependency findings in this view"
                description="Findings appear after the dependency scanner ingests the latest npm audit output. If you expect results, run the scanner per the runbook or relax the severity / ecosystem filters above."
              />
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((f) => (
            <Card key={f.id}>
              <CardContent className="p-4 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-sm font-semibold">{f.package_name}</span>
                  <Badge variant="outline" className={cn("text-[10px]", SEV_TONE[f.severity])}>{f.severity}</Badge>
                  <Badge variant="outline" className="text-[10px]">{f.issue_class}</Badge>
                  <Badge variant="outline" className="text-[10px]">{f.ecosystem}</Badge>
                  <Badge variant="outline" className={cn("text-[10px]", RISK_TONE[f.upgrade_risk])}>risk: {f.upgrade_risk}</Badge>
                  <span className="ml-auto text-[11px] text-muted-foreground">{new Date(f.created_at).toLocaleString()}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {f.current_version && <>Current: <code>{f.current_version}</code></>}
                  {f.target_version && <> → Target: <code className="text-foreground">{f.target_version}</code></>}
                </div>
                {f.suggested_action && <p className="text-sm">{f.suggested_action}</p>}
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="text-muted-foreground font-mono">advisory: {f.advisory_id}</span>
                  {f.related_suggestion_id ? (
                    <Link
                      to="/admin/ai-runtime/suggestions"
                      className="text-primary hover:underline ml-auto"
                    >
                      View linked suggestion →
                    </Link>
                  ) : (
                    <Badge variant="outline" className="text-[10px] ml-auto">no suggestion (severity below threshold)</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
