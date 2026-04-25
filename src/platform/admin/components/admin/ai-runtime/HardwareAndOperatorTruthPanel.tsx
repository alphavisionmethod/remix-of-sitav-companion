// ═══════════════════════════════════════════════════════════════
// SITA OS — Hardware & Operator Readiness Closure
// HardwareAndOperatorTruthPanel — live read of hardware_certification_runs +
// operator_drill_executions tables, plus the closure verification artifact.
// Mounted only inside /admin/ai-runtime as a tab.
// ═══════════════════════════════════════════════════════════════
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Cpu, Activity, FileCheck2, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface HardwareRun {
  id: string;
  run_id: string;
  device_class: string;
  device_model: string | null;
  overall_pass: boolean;
  run_at: string;
}
interface DrillRow {
  id: string;
  drill_id: string;
  scenario: string;
  operator_label: string | null;
  mttd_seconds: number | null;
  mttr_seconds: number | null;
  overall_pass: boolean;
  executed_at: string;
}
interface VerificationDoc {
  generatedAt: string;
  ok: boolean;
  status: "GREEN" | "YELLOW" | "RED";
  hardware_runs_total: number;
  operator_drills_total: number;
  observation_window_clean_days: number;
  partner_blocked: string[];
  pending_human_execution: string[];
}

const VERIFICATION_URL =
  "/generated/hardware-and-operator-closure/hardware-and-operator-verification.json";

export default function HardwareAndOperatorTruthPanel() {
  const [doc, setDoc] = useState<VerificationDoc | null>(null);
  const [hwRuns, setHwRuns] = useState<HardwareRun[]>([]);
  const [drills, setDrills] = useState<DrillRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [verRes, hwRes, drillRes] = await Promise.all([
          fetch(VERIFICATION_URL, { cache: "no-store" }).catch(() => null),
          supabase
            .from("hardware_certification_runs")
            .select("id, run_id, device_class, device_model, overall_pass, run_at")
            .order("run_at", { ascending: false })
            .limit(20),
          supabase
            .from("operator_drill_executions")
            .select("id, drill_id, scenario, operator_label, mttd_seconds, mttr_seconds, overall_pass, executed_at")
            .order("executed_at", { ascending: false })
            .limit(20),
        ]);
        if (cancelled) return;
        if (verRes && verRes.ok) {
          setDoc((await verRes.json()) as VerificationDoc);
        }
        if (hwRes?.data) setHwRuns(hwRes.data as HardwareRun[]);
        if (drillRes?.data) setDrills(drillRes.data as DrillRow[]);
        setLoading(false);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load");
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center text-xs text-muted-foreground py-12 text-center sm:py-16">
        Loading hardware & operator truth…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Hardware & Operator Readiness</CardTitle>
          </div>
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
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          {!doc && (
            <Alert>
              <AlertDescription>
                No verification artifact yet — run{" "}
                <code className="text-xs">npm run closure:hardware-operator:emit</code>.
              </AlertDescription>
            </Alert>
          )}
          {doc && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <Stat label="Hardware runs" value={`${doc.hardware_runs_total}`} />
                <Stat label="Operator drills" value={`${doc.operator_drills_total}`} />
                <Stat label="Clean obs days" value={`${doc.observation_window_clean_days}`} />
              </div>
              {doc.partner_blocked.length > 0 && (
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  Partner-blocked (real device required): {doc.partner_blocked.join(", ")}
                </p>
              )}
              {doc.pending_human_execution.length > 0 && (
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  Pending human execution: {doc.pending_human_execution.join(", ")}
                </p>
              )}
            </>
          )}
          <div className="flex flex-wrap gap-2 pt-2">
            <Button size="sm" variant="outline" onClick={() => window.open("/admin/health", "_self")}>
              <ExternalLink className="h-3 w-3 mr-1" /> Run drill (Health → DR)
            </Button>
            <Button size="sm" variant="outline" onClick={() => window.open(VERIFICATION_URL, "_blank")}>
              <FileCheck2 className="h-3 w-3 mr-1" /> View raw verification JSON
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-4 w-4" /> Recent operator drills
          </CardTitle>
        </CardHeader>
        <CardContent>
          {drills.length === 0 ? (
            <Alert>
              <AlertDescription>
                No operator drills recorded yet. Drills are written to{" "}
                <code className="text-xs">operator_drill_executions</code> by the{" "}
                <code className="text-xs">runbook-drill</code> edge function.
              </AlertDescription>
            </Alert>
          ) : (
            <ul className="text-sm divide-y">
              {drills.map((d) => (
                <li key={d.id} className="py-2 flex items-center justify-between gap-2">
                  <div>
                    <p className="font-medium">{d.scenario}</p>
                    <p className="text-xs text-muted-foreground">
                      {d.operator_label ?? "operator"} ·{" "}
                      MTTD {d.mttd_seconds ?? "—"}s · MTTR {d.mttr_seconds ?? "—"}s
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      d.overall_pass
                        ? "bg-emerald-500/15 text-emerald-700 border-emerald-500/30"
                        : "bg-destructive/15 text-destructive border-destructive/30"
                    }
                  >
                    {d.overall_pass ? "PASS" : "FAIL"}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Hardware certification runs</CardTitle>
        </CardHeader>
        <CardContent>
          {hwRuns.length === 0 ? (
            <Alert>
              <AlertDescription>
                No real-hardware certification runs recorded yet. This is honestly classified as{" "}
                <strong>partner-blocked</strong> — record a run with{" "}
                <code className="text-xs">os/scripts/record-hardware-certification-run.sh</code>.
              </AlertDescription>
            </Alert>
          ) : (
            <ul className="text-sm divide-y">
              {hwRuns.map((r) => (
                <li key={r.id} className="py-2 flex items-center justify-between gap-2">
                  <div>
                    <p className="font-medium">{r.device_class}{r.device_model ? ` · ${r.device_model}` : ""}</p>
                    <p className="text-xs text-muted-foreground">
                      {r.run_id} · {new Date(r.run_at).toLocaleString()}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      r.overall_pass
                        ? "bg-emerald-500/15 text-emerald-700 border-emerald-500/30"
                        : "bg-destructive/15 text-destructive border-destructive/30"
                    }
                  >
                    {r.overall_pass ? "PASS" : "FAIL"}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
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
