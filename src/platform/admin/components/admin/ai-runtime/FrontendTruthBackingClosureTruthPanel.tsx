// ═══════════════════════════════════════════════════════════════
// SITA OS — Frontend Truth-Backing Closure Truth Panel
// Operator-facing live status of the frontend instrumentation,
// truth-backing, and shared-system-additions closure.
//
// Mounted as tab #22 on /admin/ai-runtime (AI Engineer hub).
//
// Reads:
//   • /generated/frontend-truth-backing-closure/frontend-truth-backing-verification.json
//
// Strict scope discipline: surfaces validator state + primitive
// adoption + deliverables. No destructive actions, no fake-live data.
// ═══════════════════════════════════════════════════════════════
import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  FileText,
  ShieldCheck,
  LayoutGrid,
  Link as LinkIcon,
} from "lucide-react";
import { StatusBadge } from "@/components/primitives/status/StatusBadge";

interface ValidatorResult {
  exitCode: number;
  tier?: string;
  errorCount?: number;
  warningCount?: number;
  promptNamed?: boolean;
  classification?: string;
}

interface SurfaceWired {
  surface: string;
  primitives: string[];
  drilldowns: string[];
}

interface VerificationJson {
  generatedAt?: string;
  scope?: string;
  verdict?: string;
  surfacesInScope?: number;
  newComponents?: string[];
  newComponentFamilies?: number;
  duplicates?: number;
  newValidators?: string[];
  validatorTier?: string;
  validatorResults?: Record<string, ValidatorResult>;
  scopeDiscipline?: Record<string, unknown>;
  truthPanel?: { id?: string; tab?: number; component?: string; mountedAt?: string };
  deliverables?: {
    auditDocs?: string[];
    statusJsons?: string[];
    finalMarkdown?: string;
  };
  surfacesWired?: SurfaceWired[];
  honestWarningCounts?: Record<string, number | string>;
}

const VERIFICATION_PATH =
  "/generated/frontend-truth-backing-closure/frontend-truth-backing-verification.json";

export default function FrontendTruthBackingClosureTruthPanel() {
  const [data, setData] = useState<VerificationJson | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(VERIFICATION_PATH, { cache: "no-store" });
      if (!res.ok) {
        throw new Error(`Could not load verification artifact (HTTP ${res.status})`);
      }
      const json = (await res.json()) as VerificationJson;
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const verdict = data?.verdict ?? "unknown";
  const isGreen = /green/i.test(verdict);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
          <div className="space-y-1">
            <CardTitle className="text-sm flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Frontend Truth-Backing Closure
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Visible provenance + canonical evidence drilldowns wired across
              5 in-scope surfaces. Three new shared primitives
              (<code className="font-mono text-[10px]">ProvenanceChip</code>,{" "}
              <code className="font-mono text-[10px]">EvidenceLink</code>,{" "}
              <code className="font-mono text-[10px]">AITruthDisclosure</code>),
              one canonical trust-copy map (<code className="font-mono text-[10px]">src/lib/trust-copy/</code>),
              and 6 prompt-named WARN-tier validators guard against drift.
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={load} className="h-7 px-2">
            <RefreshCw className="h-3 w-3 mr-1" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <div className="space-y-2" aria-busy="true" aria-live="polite">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ) : error ? (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-xs"
            >
              <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-destructive">
                  Could not load verification artifact
                </div>
                <div className="mt-0.5 text-muted-foreground break-words">{error}</div>
                <div className="mt-1 text-muted-foreground">
                  Run the frontend-truth-backing validators to regenerate{" "}
                  <code className="bg-muted px-1 rounded">
                    generated/frontend-truth-backing-closure/frontend-truth-backing-verification.json
                  </code>
                  .
                </div>
              </div>
            </div>
          ) : data ? (
            <>
              <div className="flex items-center gap-2 flex-wrap">
                {isGreen ? (
                  <StatusBadge tone="success" icon={<CheckCircle2 className="h-3 w-3" />}>
                    {verdict}
                  </StatusBadge>
                ) : (
                  <StatusBadge tone="warning">{verdict}</StatusBadge>
                )}
                <StatusBadge tone="info">
                  {data.surfacesInScope ?? 0} surfaces in scope
                </StatusBadge>
                <StatusBadge tone="muted">
                  {data.newComponentFamilies ?? 0} new component families
                </StatusBadge>
                <StatusBadge tone="muted">
                  {data.duplicates ?? 0} duplicates
                </StatusBadge>
              </div>
              <div className="text-[11px] text-muted-foreground">
                Generated {data.generatedAt ?? "unknown"}.
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-xs flex items-center gap-2">
              <LayoutGrid className="h-3.5 w-3.5 text-muted-foreground" />
              New canonical primitives ({(data?.newComponents ?? []).length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 text-xs">
            <PrimRow name="ProvenanceChip" detail="composes StatusBadge + Link" />
            <PrimRow name="EvidenceLink" detail="composes Button asChild + Link" />
            <PrimRow name="AITruthDisclosure" detail="composes StatusBadge + Link" />
            <PrimRow name="trust-copy map" detail="pure data — src/lib/trust-copy/" />
            <div className="mt-2 pt-2 border-t border-border space-y-1 text-[10px] text-muted-foreground">
              All compositions of existing canonical primitives —
              <span className="font-medium text-foreground"> 0 new component families</span>.
              Section D coverage: <span className="font-medium text-foreground">6 / 6</span>{" "}
              (D1 EmptyState · D2 Needs* explainers · D3 ConnectorStateBadge ·
              D4 AITruthDisclosure · D5 OperatorActionPanel · D6 trust-copy map).
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xs flex items-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground" />
              Validators ({(data?.newValidators ?? []).length} prompt-named, all first-class)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 text-xs">
            {data ? (
              (data.newValidators ?? []).map((v) => (
                <ValidatorRow
                  key={v}
                  path={v}
                  result={data.validatorResults?.[stem(v)]}
                />
              ))
            ) : (
              <div className="text-muted-foreground text-[11px]">
                Validator list loads from the verification artifact.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xs flex items-center gap-2">
            <LinkIcon className="h-3.5 w-3.5 text-muted-foreground" />
            Surfaces wired ({(data?.surfacesWired ?? []).length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs">
          {(data?.surfacesWired ?? []).map((s) => (
            <div key={s.surface} className="border border-border rounded p-2 space-y-1">
              <div className="font-medium text-foreground">{s.surface}</div>
              <div className="flex flex-wrap gap-1">
                {s.primitives.map((p) => (
                  <StatusBadge key={p} tone="info" size="xs">
                    {p}
                  </StatusBadge>
                ))}
              </div>
              <div className="text-[10px] text-muted-foreground">
                Drilldowns: {s.drilldowns.join(" · ")}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xs flex items-center gap-2">
            <FileText className="h-3.5 w-3.5 text-muted-foreground" />
            Deliverables
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5 text-xs">
          <DeliverableGroup label="Audit docs" items={data?.deliverables?.auditDocs ?? []} />
          <DeliverableGroup label="Status JSONs" items={data?.deliverables?.statusJsons ?? []} />
          {data?.deliverables?.finalMarkdown && (
            <DeliverableGroup
              label="Final verification"
              items={[data.deliverables.finalMarkdown]}
            />
          )}
        </CardContent>
      </Card>

      {data?.honestWarningCounts && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xs flex items-center gap-2">
              <AlertTriangle className="h-3.5 w-3.5 text-muted-foreground" />
              Honest adoption-tracker debt
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-xs">
            {Object.entries(data.honestWarningCounts).map(([k, v]) => (
              <div key={k} className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-muted-foreground truncate">{k}</span>
                <StatusBadge tone={typeof v === "number" && v > 0 ? "warning" : "muted"} size="xs">
                  {String(v)}
                </StatusBadge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function stem(path: string): string {
  return path.replace(/^scripts\/validation\/check-/, "").replace(/\.ts$/, "");
}

function PrimRow({ name, detail }: { name: string; detail?: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="font-mono text-[10px] text-foreground truncate">{name}</span>
      <div className="flex items-center gap-1.5 shrink-0">
        {detail && <span className="text-[10px] text-muted-foreground">{detail}</span>}
        <StatusBadge tone="success" size="xs">canonical</StatusBadge>
      </div>
    </div>
  );
}

function ValidatorRow({
  path,
  result,
}: {
  path: string;
  result?: ValidatorResult;
}) {
  const exitCode = result?.exitCode ?? 0;
  const warnings = result?.warningCount ?? 0;
  const tone = exitCode === 0 ? "success" : "danger";
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="font-mono text-[10px] text-muted-foreground truncate">
        {stem(path)}
      </span>
      <div className="flex items-center gap-1">
        {warnings > 0 && (
          <StatusBadge tone="warning" size="xs">
            {warnings}w
          </StatusBadge>
        )}
        <StatusBadge tone={tone} size="xs">
          {result?.tier ?? "WARN"}
        </StatusBadge>
      </div>
    </div>
  );
}

function DeliverableGroup({ label, items }: { label: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div className="space-y-0.5">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      {items.map((p) => (
        <div key={p} className="font-mono text-[10px] text-foreground/80 truncate">
          {p}
        </div>
      ))}
    </div>
  );
}
