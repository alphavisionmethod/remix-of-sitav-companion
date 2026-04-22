// ═══════════════════════════════════════════════════════════════
// Phase 9A — Sovereign Deployment & DR board
// L3 ceiling: drills are recorded, real failover requires approval.
// ═══════════════════════════════════════════════════════════════
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdminControlPlaneShell } from "@/components/admin/shells/AdminControlPlaneShell";
import { ShieldAlert, CloudCog, FileCheck2, RefreshCw, Archive } from "lucide-react";
import { EmptyState } from "@/components/sita/EmptyState";
import { toast } from "sonner";

interface Drill {
  id: string; drill_key: string; drill_type: string; scope: string; status: string;
  rto_target_seconds: number; rto_actual_seconds: number | null;
  rpo_target_seconds: number; rpo_actual_seconds: number | null;
  data_integrity_pct: number | null; finished_at: string | null;
}
interface Artifact {
  id: string; release_tag: string; artifact_kind: string; artifact_name: string;
  sha256: string; verified: boolean; verified_at: string | null;
}
interface Bundle {
  id: string; bundle_key: string; period_start: string; period_end: string;
  record_count: number; status: string; created_at: string;
}

const statusColor: Record<string, string> = {
  passed: "bg-emerald-500/10 text-emerald-600",
  failed: "bg-red-500/10 text-red-600",
  scheduled: "bg-blue-500/10 text-blue-600",
  running: "bg-amber-500/10 text-amber-600",
  sealed: "bg-emerald-500/10 text-emerald-600",
  exported: "bg-blue-500/10 text-blue-600",
  staged: "bg-amber-500/10 text-amber-600",
};

export default function SovereignDeploymentDRBoard() {
  const [drills, setDrills] = useState<Drill[]>([]);
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(false);

  async function refresh() {
    setLoading(true);
    const [d, a, b] = await Promise.all([
      supabase.from("dr_drills").select("*").order("scheduled_at", { ascending: false }).limit(15),
      supabase.from("signed_release_artifacts").select("*").order("created_at", { ascending: false }).limit(20),
      supabase.from("audit_export_bundles").select("*").order("created_at", { ascending: false }).limit(10),
    ]);
    setDrills((d.data as Drill[]) ?? []);
    setArtifacts((a.data as Artifact[]) ?? []);
    setBundles((b.data as Bundle[]) ?? []);
    setLoading(false);
  }
  useEffect(() => { refresh(); }, []);

  async function runDrill() {
    const { error } = await supabase.functions.invoke("dr-drill-runner", {
      body: { drill_type: "failover", scope: "staging" },
    });
    if (error) toast.error(error.message); else { toast.success("DR drill recorded"); refresh(); }
  }

  async function bundleAudit() {
    const { error } = await supabase.functions.invoke("audit-export-bundler", { body: {} });
    if (error) toast.error(error.message); else { toast.success("Audit bundle sealed"); refresh(); }
  }

  return (
    <AdminControlPlaneShell contextScope="Sovereign Deployment & DR">
      <div className="p-4 sm:p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold flex items-center gap-2">
              <ShieldAlert className="h-6 w-6" /> Sovereign Deployment & DR
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              L3 hard ceiling — drills run automatically, production failover requires human approval.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={refresh} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Refresh
            </Button>
            <Button size="sm" onClick={runDrill}>Run DR drill</Button>
            <Button size="sm" variant="secondary" onClick={bundleAudit}>Bundle audit</Button>
          </div>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><CloudCog className="h-4 w-4" /> DR drills</CardTitle></CardHeader>
          <CardContent>
            {drills.length === 0 ? (
              <EmptyState
                icon={<CloudCog className="h-5 w-5" />}
                title="No DR drills recorded"
                description="Trigger a drill to validate restore-time and integrity targets without affecting production."
              />
            ) : (
              <div className="space-y-2">
                {drills.map(d => (
                  <div key={d.id} className="flex items-center justify-between text-sm border-b pb-2">
                    <div>
                      <div className="font-medium">{d.drill_key}</div>
                      <div className="text-xs text-muted-foreground">
                        {d.drill_type} · {d.scope} · RTO {d.rto_actual_seconds ?? "—"}/{d.rto_target_seconds}s · RPO {d.rpo_actual_seconds ?? "—"}/{d.rpo_target_seconds}s · integrity {d.data_integrity_pct ?? "—"}%
                      </div>
                    </div>
                    <Badge className={statusColor[d.status] ?? ""}>{d.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><FileCheck2 className="h-4 w-4" /> Signed release artifacts</CardTitle></CardHeader>
          <CardContent>
            {artifacts.length === 0 ? (
              <EmptyState
                icon={<FileCheck2 className="h-5 w-5" />}
                title="No signed release artifacts"
                description="Cosign-signed artifacts will land here automatically once a release publishes."
              />
            ) : (
              <div className="space-y-2">
                {artifacts.map(a => (
                  <div key={a.id} className="flex items-center justify-between text-sm border-b pb-2">
                    <div>
                      <div className="font-medium">{a.release_tag} · {a.artifact_name}</div>
                      <div className="text-xs text-muted-foreground font-mono">{a.artifact_kind} · sha256 {a.sha256.slice(0, 16)}…</div>
                    </div>
                    <Badge className={a.verified ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"}>
                      {a.verified ? "verified" : "unverified"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Immutable audit-export bundles</CardTitle></CardHeader>
          <CardContent>
            {bundles.length === 0 ? (
              <EmptyState
                icon={<Archive className="h-5 w-5" />}
                title="No audit bundles yet"
                description="Use “Bundle audit” to seal a tamper-evident export of the current period."
              />
            ) : (
              <div className="space-y-2">
                {bundles.map(b => (
                  <div key={b.id} className="flex items-center justify-between text-sm border-b pb-2">
                    <div>
                      <div className="font-medium">{b.bundle_key}</div>
                      <div className="text-xs text-muted-foreground">{b.record_count} records · {new Date(b.period_start).toLocaleDateString()} → {new Date(b.period_end).toLocaleDateString()}</div>
                    </div>
                    <Badge className={statusColor[b.status] ?? ""}>{b.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminControlPlaneShell>
  );
}
