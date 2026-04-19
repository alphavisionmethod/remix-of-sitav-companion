// ═══════════════════════════════════════════════════════════════
// SITA OS — Security & Portability Truth Panel
// Live read of secret_rotation_log + verification artifact + portability status.
// Mounted only inside /admin/ai-runtime as a tab.
// ═══════════════════════════════════════════════════════════════
import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ShieldCheck, KeyRound, Network, RefreshCw, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface RotationRow {
  id: string;
  secret_class: string;
  secret_name: string;
  rotated_at: string;
  dry_run: boolean;
  cadence_due_at: string | null;
}
interface Verification {
  generatedAt: string;
  ok: boolean;
  status: "GREEN" | "YELLOW" | "RED";
  rotation: { overdue: number; dueSoon: number; fresh: number; noEvidence: number; controlPlaneBlocked: number } | null;
  adversarial: {
    rls: { evidenceCount: number };
    electron: { wired: boolean; drillEvidence: number };
    debugger: { wired: boolean; drillEvidence: number };
    session: { wired: boolean; runEvidence: number };
  } | null;
  portability: { violations: number; classified: number } | null;
  partner_blocked: string[];
  pending_human_execution: string[];
  errors: string[];
}

const VERIFICATION_URL = "/generated/security-and-portability-closure/security-and-portability-verification.json";

export default function SecurityAndPortabilityTruthPanel() {
  const [doc, setDoc] = useState<Verification | null>(null);
  const [rotations, setRotations] = useState<RotationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [verRes, rotRes] = await Promise.all([
        fetch(VERIFICATION_URL, { cache: "no-store" }).catch(() => null),
        supabase
          .from("secret_rotation_log" as never)
          .select("id, secret_class, secret_name, rotated_at, dry_run, cadence_due_at")
          .order("rotated_at", { ascending: false })
          .limit(20),
      ]);
      if (verRes && verRes.ok) setDoc((await verRes.json()) as Verification);
      if (rotRes && (rotRes as any).data) setRotations((rotRes as any).data as RotationRow[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  if (loading) {
    return <div className="text-xs text-muted-foreground py-12 text-center">Loading security & portability truth…</div>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Security & Portability Truth</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {doc && (
              <Badge
                variant="outline"
                className={
                  doc.status === "GREEN"
                    ? "bg-primary/15 text-primary border-primary/30"
                    : doc.status === "YELLOW"
                      ? "bg-muted text-muted-foreground border-border"
                      : "bg-destructive/15 text-destructive border-destructive/30"
                }
              >
                {doc.status}
              </Badge>
            )}
            <Button size="sm" variant="outline" onClick={() => void load()}>
              <RefreshCw className="h-3 w-3 mr-1" /> Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          {error && <Alert><AlertDescription>{error}</AlertDescription></Alert>}
          {!doc && (
            <Alert>
              <AlertDescription>
                No verification artifact yet — run <code className="text-xs">npm run closure:security-portability:emit</code>.
              </AlertDescription>
            </Alert>
          )}
          {doc && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Stat label="Rotation overdue" value={`${doc.rotation?.overdue ?? 0}`} />
                <Stat label="Adversarial wired" value={`${[doc.adversarial?.electron?.wired, doc.adversarial?.debugger?.wired, doc.adversarial?.session?.wired].filter(Boolean).length}/3`} />
                <Stat label="Portability violations" value={`${doc.portability?.violations ?? 0}`} />
                <Stat label="Classified files" value={`${doc.portability?.classified ?? 0}`} />
              </div>
              {doc.partner_blocked.length > 0 && (
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  Partner-blocked: {doc.partner_blocked.join(", ")}
                </p>
              )}
              {doc.pending_human_execution.length > 0 && (
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  Pending execution: {doc.pending_human_execution.join(", ")}
                </p>
              )}
              {doc.errors.length > 0 && (
                <p className="text-xs text-destructive">Errors: {doc.errors.join("; ")}</p>
              )}
            </>
          )}
          <div className="flex flex-wrap gap-2 pt-2">
            <Button size="sm" variant="outline" onClick={() => window.open(VERIFICATION_URL, "_blank")}>
              <ExternalLink className="h-3 w-3 mr-1" /> View raw verification JSON
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <KeyRound className="h-4 w-4" /> Recent secret rotations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {rotations.length === 0 ? (
            <Alert>
              <AlertDescription>
                No rotation log entries yet. Run <code className="text-xs">npm run security:rotate:dry-run</code> to populate the log.
              </AlertDescription>
            </Alert>
          ) : (
            <ul className="text-sm divide-y">
              {rotations.map((r) => (
                <li key={r.id} className="py-2 flex items-center justify-between gap-2">
                  <div>
                    <p className="font-medium">{r.secret_name} <span className="text-xs text-muted-foreground">[{r.secret_class}]</span></p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(r.rotated_at).toLocaleString()} · due: {r.cadence_due_at ? new Date(r.cadence_due_at).toLocaleDateString() : "—"}
                    </p>
                  </div>
                  <Badge variant="outline" className={r.dry_run ? "bg-muted text-muted-foreground border-border" : "bg-emerald-500/15 text-emerald-700 border-emerald-500/30"}>
                    {r.dry_run ? "DRY-RUN" : "APPLIED"}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Network className="h-4 w-4" /> Portability boundaries
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          {doc?.portability ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Stat label="Classified" value={`${doc.portability.classified}`} />
              <Stat label="Violations" value={`${doc.portability.violations}`} />
            </div>
          ) : (
            <Alert><AlertDescription>No portability status — run emitter.</AlertDescription></Alert>
          )}
          <p className="text-xs text-muted-foreground mt-2">
            4 shared hooks routed through the canonical <code>useRuntimeHost()</code> adapter. Second-abstraction prevention is enforced by <code>check-runtime-host-abstraction</code>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border bg-card p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}
