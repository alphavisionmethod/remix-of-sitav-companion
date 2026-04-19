// ═══════════════════════════════════════════════════════════════
// SITA OS — Admin & Validation Truth Closure
// AdminValidationTruthPanel — read-only live truth view of:
//   /generated/admin-and-validation-closure/admin-and-validation-verification.json
// Mounted only inside /admin/ai-runtime as a tab.
// ═══════════════════════════════════════════════════════════════
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Gauge, FileCheck2, ExternalLink } from "lucide-react";

interface VerificationDoc {
  generatedAt: string;
  ok: boolean;
  status: "GREEN" | "RED";
  scope: string;
  deliverables_total: number;
  deliverables_present: number;
  validators_total: number;
  validators_passing_block: number;
  validators_warn_with_roadmap: number;
  edge_function_contract_coverage: { covered: number; total: number; percent: number; block_target_percent: number };
  ui_panels_added: string[];
  block_gates_added: number;
  warn_gates_with_roadmap: string[];
  failed_checks: string[];
}

const VERIFICATION_URL =
  "/generated/admin-and-validation-closure/admin-and-validation-verification.json";

function tone(ok: boolean) {
  return ok
    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
    : "bg-destructive/15 text-destructive border-destructive/30";
}

export default function AdminValidationTruthPanel() {
  const [doc, setDoc] = useState<VerificationDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(VERIFICATION_URL, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as VerificationDoc;
        if (!cancelled) {
          setDoc(data);
          setLoading(false);
        }
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
      <div className="text-xs text-muted-foreground py-12 text-center">
        Loading admin & validation truth…
      </div>
    );
  }
  if (error || !doc) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Unable to load admin-and-validation-verification.json. Run{" "}
          <code className="text-xs">npm run closure:admin-validation:emit</code> to regenerate.
        </AlertDescription>
      </Alert>
    );
  }

  const coveragePct = doc.edge_function_contract_coverage.percent;
  const coverageOk = coveragePct >= doc.edge_function_contract_coverage.block_target_percent;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Admin & Validation Truth</CardTitle>
          </div>
          <Badge variant="outline" className={tone(doc.ok)}>
            {doc.status}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="text-muted-foreground text-xs">
            Generated {new Date(doc.generatedAt).toLocaleString()} — scope:{" "}
            <span className="font-mono">{doc.scope}</span>
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Stat label="Deliverables" value={`${doc.deliverables_present}/${doc.deliverables_total}`} ok={doc.deliverables_present === doc.deliverables_total} />
            <Stat label="BLOCK gates passing" value={`${doc.validators_passing_block}/${doc.validators_total}`} ok={doc.validators_passing_block + doc.validators_warn_with_roadmap === doc.validators_total} />
            <Stat label="WARN w/ roadmap" value={`${doc.validators_warn_with_roadmap}`} ok={true} />
            <Stat label="Block gates added" value={`+${doc.block_gates_added}`} ok={true} />
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open("/admin/releases", "_self")}
            >
              <ExternalLink className="h-3 w-3 mr-1" /> Open release readiness
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open(VERIFICATION_URL, "_blank")}
            >
              <FileCheck2 className="h-3 w-3 mr-1" /> View raw verification JSON
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Gauge className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Edge-function contract coverage</CardTitle>
          </div>
          <Badge variant="outline" className={tone(coverageOk)}>
            {coveragePct}% / target {doc.edge_function_contract_coverage.block_target_percent}%
          </Badge>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p>
            <span className="font-semibold">{doc.edge_function_contract_coverage.covered}</span>{" "}
            of <span className="font-semibold">{doc.edge_function_contract_coverage.total}</span>{" "}
            edge functions have CORS + JWT + error/success contract tests.
          </p>
          <p className="text-xs text-muted-foreground">
            Gate is WARN-tier with explicit roadmap until ≥
            {doc.edge_function_contract_coverage.block_target_percent}% coverage promotes it to
            BLOCK. See <code>EDGE_FUNCTION_CONTRACT_EXPANSION_PLAN.md</code>.
          </p>
        </CardContent>
      </Card>

      {doc.failed_checks.length > 0 && (
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="text-base text-destructive">Failed checks</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm list-disc pl-5 space-y-1">
              {doc.failed_checks.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Stat({ label, value, ok }: { label: string; value: string; ok: boolean }) {
  return (
    <div className="rounded-md border bg-card p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-lg font-semibold ${ok ? "text-foreground" : "text-destructive"}`}>{value}</p>
    </div>
  );
}
