// ═══════════════════════════════════════════════════════════════
// SITA OS — Admin Coherence Closure Truth Panel
// Operator-facing live status of the Admin Coherence and
// Responsive Quality Closure pass.
//
// Mounted as tab #13 on /admin/ai-runtime (AI Engineer hub).
//
// Reads:
//   • generated/admin-coherence-and-responsive-closure/admin-coherence-and-responsive-verification.json
//   • the 3 status JSONs (admin-coherence-status, responsive-surface-status, admin-semantics-status)
//
// Strict scope discipline: surfaces validator state + spec doc links,
// no destructive actions, no fake-live data.
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
  Smartphone,
} from "lucide-react";
import { StatusBadge } from "@/components/primitives/status/StatusBadge";

interface BucketState {
  before?: number;
  after?: number;
  status?: string;
  wrapped?: number;
  rationale?: string;
}

interface VerificationJson {
  generatedAt?: string;
  scope?: string;
  verdict?: string;
  deliverables?: {
    auditDocs?: string[];
    specDocs?: string[];
    statusJsons?: string[];
    finalMarkdown?: string;
  };
  newComponents?: string[];
  newValidators?: string[];
  validatorTier?: string;
  domainsAudited?: number;
  newComponentFamilies?: number;
  duplicates?: number;
  scopeDiscipline?: Record<string, unknown>;
  postCleanupAudit?: {
    ranAt?: string;
    buckets?: Record<string, BucketState>;
    validatorResults?: Record<string, { exitCode: number; offenders: number; tier?: string; classification?: string }>;
  };
}

const VERIFICATION_PATH =
  "/generated/admin-coherence-and-responsive-closure/admin-coherence-and-responsive-verification.json";

export default function AdminCoherenceClosureTruthPanel() {
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
              Admin Coherence & Responsive Closure
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Live status of the canonical primitives, spec docs, and 7 WARN-tier
              validators that protect against admin UX coherence and narrow-width regressions.
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
                  Run <code className="bg-muted px-1 rounded">closure:admin-coherence:run-all</code>{" "}
                  to regenerate.
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
                  {data.domainsAudited ?? 0} domains audited
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
              Canonical primitives reused
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 text-xs">
            <Row name="PremiumEmptyState" tone="success" />
            <Row name="EmptyState" tone="success" />
            <Row name="StatusBadge" tone="success" />
            <Row name="BoardSection" tone="success" />
            <Row name="OperatorActionPanel" tone="info" detail="new (composition)" />
            <Row name="NeedsDataExplainer" tone="info" detail="new (wraps PremiumEmptyState)" />
            <Row name="NeedsTimeWindowExplainer" tone="info" detail="new (wraps PremiumEmptyState)" />
            <Row name="NeedsHistoricalReleasesExplainer" tone="info" detail="new (wraps PremiumEmptyState)" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xs flex items-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground" />
              WARN-tier validators ({data?.newValidators?.length ?? 7})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 text-xs">
            {(data?.newValidators ?? []).map((v) => (
              <div key={v} className="flex items-center justify-between gap-2">
                <span className="font-mono text-[10px] text-muted-foreground truncate">
                  {v.replace(/^scripts\/validation\//, "")}
                </span>
                <StatusBadge tone="success" size="xs">WARN</StatusBadge>
              </div>
            ))}
            {!data && (
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
            <FileText className="h-3.5 w-3.5 text-muted-foreground" />
            Deliverables
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5 text-xs">
          <DeliverableGroup
            label="Audit docs"
            items={data?.deliverables?.auditDocs ?? []}
          />
          <DeliverableGroup
            label="Spec docs"
            items={data?.deliverables?.specDocs ?? []}
          />
          <DeliverableGroup
            label="Status JSONs"
            items={data?.deliverables?.statusJsons ?? []}
          />
          {data?.deliverables?.finalMarkdown && (
            <DeliverableGroup
              label="Final verification"
              items={[data.deliverables.finalMarkdown]}
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xs flex items-center gap-2">
            <Smartphone className="h-3.5 w-3.5 text-muted-foreground" />
            Responsive scope
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs text-muted-foreground">
          <div>
            <span className="font-medium text-foreground">/desktop:</span>{" "}
            honest narrow-width disclosure banner mounted (gated to <code className="bg-muted px-1 rounded">md:hidden</code>).
          </div>
          <div>
            <span className="font-medium text-foreground">/boardroom/briefing:</span>{" "}
            audit completed — no edits required (composes shadcn Card; responsive by default).
          </div>
          <div>
            <span className="font-medium text-foreground">/admin/*:</span>{" "}
            unwrapped <code className="bg-muted px-1 rounded">&lt;table&gt;</code> regression-guarded
            by <code className="bg-muted px-1 rounded">check-responsive-operator-surfaces</code>.
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xs flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground" />
            Post-cleanup audit
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs">
          {data?.postCleanupAudit?.buckets ? (
            Object.entries(data.postCleanupAudit.buckets).map(([key, b]) => {
              const cleared = b.status === "cleared";
              const tone = cleared ? "success" : "warning";
              const label =
                key === "rawEmptyStates"
                  ? "Raw empty-state strings"
                  : key === "unwrappedTables"
                  ? "Unwrapped table elements"
                  : key === "narrowWidthBriefing"
                  ? "Boardroom briefing narrow-width"
                  : key === "hardcodedColorSemantics"
                  ? "Hardcoded color classes"
                  : key;
              return (
                <div key={key} className="flex items-center justify-between gap-2">
                  <span className="text-foreground/80 truncate">{label}</span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {b.before ?? 0} → {b.after ?? 0}
                      {b.wrapped ? ` (${b.wrapped} wrapped)` : ""}
                    </span>
                    <StatusBadge tone={tone} size="xs">
                      {cleared ? "cleared" : "tracked"}
                    </StatusBadge>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-muted-foreground text-[11px]">
              Cleanup audit data loads from the verification artifact.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Row({
  name,
  tone,
  detail,
}: {
  name: string;
  tone: "success" | "info" | "warning";
  detail?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="font-mono text-[10px] text-foreground truncate">{name}</span>
      <div className="flex items-center gap-1.5 shrink-0">
        {detail && <span className="text-[10px] text-muted-foreground">{detail}</span>}
        <StatusBadge tone={tone} size="xs">
          {tone === "success" ? "canonical" : "shipped"}
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
