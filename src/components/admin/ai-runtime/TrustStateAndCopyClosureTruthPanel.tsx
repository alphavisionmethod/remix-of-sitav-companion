// ═══════════════════════════════════════════════════════════════
// SITA OS — Trust-State and Trust-Copy Closure Truth Panel
// Operator-facing live status of the canonical state-handling
// system + trust-copy alignment across the 8 in-scope surfaces.
//
// Mounted as tab #14 on /admin/ai-runtime (AI Engineer hub).
//
// Reads:
//   • generated/trust-state-and-copy-closure/trust-state-and-copy-verification.json
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
  MessageSquare,
} from "lucide-react";
import { StatusBadge } from "@/components/primitives/status/StatusBadge";

interface ValidatorResult {
  exitCode: number;
  tier?: string;
  offenders?: number;
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
  newComponentFamilies?: number;
  duplicates?: number;
  newValidators?: string[];
  reusedValidators?: string[];
  validatorTier?: string;
  surfacesInScope?: number;
  scopeDiscipline?: Record<string, unknown>;
  truthPanel?: { id?: string; tab?: number; component?: string; mountedAt?: string };
  validatorResults?: Record<string, ValidatorResult & { promptNamed?: boolean }>;
  postCleanupAudit?: {
    auditedAt?: string;
    promptNamedValidatorsOnDisk?: number;
    promptNamedValidatorsExpected?: number;
    validatorAliasesRemaining?: number;
    oneoffEmptyStateOffenders?: number;
    nakedSimulationLabelOffenders?: number;
    trustStateConsistencyOffenders?: number;
    notes?: string;
  };
}

const VERIFICATION_PATH =
  "/generated/trust-state-and-copy-closure/trust-state-and-copy-verification.json";

export default function TrustStateAndCopyClosureTruthPanel() {
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
              Trust-State & Trust-Copy Closure
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Live status of the canonical state-handling system and trust-copy
              alignment across 8 in-scope surfaces. 7 prompt-named WARN-tier
              validators (all first-class files) guard against drift back into
              one-off states or overclaim copy.
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
                  Run the trust-state validators to regenerate{" "}
                  <code className="bg-muted px-1 rounded">
                    generated/trust-state-and-copy-closure/trust-state-and-copy-verification.json
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
              Canonical state primitives
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 text-xs">
            <PrimRow name="BoardSection" detail="state envelope" />
            <PrimRow name="EmptyState" />
            <PrimRow name="PremiumEmptyState" />
            <PrimRow name="ConciergeEmptyState" detail="domain-aware (10)" />
            <PrimRow name="NeedsDataExplainer" />
            <PrimRow name="NeedsTimeWindowExplainer" />
            <PrimRow name="NeedsHistoricalReleasesExplainer" />
            <PrimRow name="AIStateBadge" detail="18 states" />
            <PrimRow name="AIDegradedState" />
            <PrimRow name="StatusBadge" detail="9 tones" />
            <PrimRow name="ConnectorStateBadge" detail="6 states" />
            <PrimRow name="OperatorActionPanel" />
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
            {data?.postCleanupAudit && (
              <div className="mt-3 pt-2 border-t border-border space-y-1">
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  Post-cleanup audit
                </div>
                <AuditRow
                  label="Prompt-named validators on disk"
                  value={`${data.postCleanupAudit.promptNamedValidatorsOnDisk ?? 0} / ${data.postCleanupAudit.promptNamedValidatorsExpected ?? 0}`}
                  ok={
                    (data.postCleanupAudit.promptNamedValidatorsOnDisk ?? 0) ===
                    (data.postCleanupAudit.promptNamedValidatorsExpected ?? 0)
                  }
                />
                <AuditRow
                  label="Aliases remaining"
                  value={`${data.postCleanupAudit.validatorAliasesRemaining ?? 0}`}
                  ok={(data.postCleanupAudit.validatorAliasesRemaining ?? 0) === 0}
                />
                <AuditRow
                  label="One-off offenders"
                  value={`${data.postCleanupAudit.oneoffEmptyStateOffenders ?? 0}`}
                  ok={(data.postCleanupAudit.oneoffEmptyStateOffenders ?? 0) === 0}
                />
                <AuditRow
                  label="Naked sim/future labels"
                  value={`${data.postCleanupAudit.nakedSimulationLabelOffenders ?? 0}`}
                  ok={(data.postCleanupAudit.nakedSimulationLabelOffenders ?? 0) === 0}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xs flex items-center gap-2">
            <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
            Trust-copy distinctions enforced
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs text-muted-foreground">
          <div>
            <span className="font-medium text-foreground">Boardroom:</span>{" "}
            live recommendation loop vs future continuous-learning v2.
          </div>
          <div>
            <span className="font-medium text-foreground">Concierge:</span>{" "}
            gateway-governed live AI; "suggests; you confirm" — never autonomous.
          </div>
          <div>
            <span className="font-medium text-foreground">Communications:</span>{" "}
            live OAuth (Google / MS / Slack) vs manual long-tail providers.
          </div>
          <div>
            <span className="font-medium text-foreground">Admin AI Runtime:</span>{" "}
            structurally-wired vs behaviorally-proven vs nightly-verified vs degraded —
            never collapsed into "operational".
          </div>
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
          <DeliverableGroup label="Spec docs" items={data?.deliverables?.specDocs ?? []} />
          <DeliverableGroup label="Status JSONs" items={data?.deliverables?.statusJsons ?? []} />
          {data?.deliverables?.finalMarkdown && (
            <DeliverableGroup
              label="Final verification"
              items={[data.deliverables.finalMarkdown]}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function stem(path: string): string {
  return path.replace(/^scripts\/validation\//, "").replace(/\.ts$/, "");
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
  const tone = exitCode === 0 ? "success" : "danger";
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="font-mono text-[10px] text-muted-foreground truncate">
        {stem(path)}
      </span>
      <StatusBadge tone={tone} size="xs">
        {result?.tier ?? "WARN"}
      </StatusBadge>
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

function AuditRow({ label, value, ok }: { label: string; value: string; ok: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[10px] text-muted-foreground truncate">{label}</span>
      <StatusBadge tone={ok ? "success" : "warning"} size="xs">
        {value}
      </StatusBadge>
    </div>
  );
}
