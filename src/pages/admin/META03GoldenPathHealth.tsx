// ═══════════════════════════════════════════════════════════════
// SITA OS — META03: Golden Path Health (Phase 7)
// Real-time health board for the 15 canonical Golden Paths,
// computed from live armed kill switches via the Phase 6 evaluator.
// ═══════════════════════════════════════════════════════════════

import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { SitaPageHeader, SitaCard, SitaCardTitle } from "@/platform/sita/components/sita/SitaCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  CheckCircle2, AlertTriangle, AlertCircle, Route as RouteIcon, ShieldAlert, BookOpen,
  Layout, Cloud, Cog, Database, Lock, FileCheck2, FlaskConical, GitBranch, LifeBuoy,
} from "lucide-react";
import { GOLDEN_PATH_REGISTRY } from "@/lib/operations/golden-path-registry";
import { evaluateGoldenPaths, summarizeEvaluation } from "@/lib/operations/golden-path-evaluator";
import { getVerificationSummary } from "@/lib/operations/golden-path-verification-map";
import { useArmedKillSwitches } from "@/lib/meta-arch/use-armed-kill-switches";

const HEALTH_ICON: Record<string, React.ReactNode> = {
  healthy: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
  degraded: <AlertTriangle className="h-4 w-4 text-amber-500" />,
  blocked: <AlertCircle className="h-4 w-4 text-destructive" />,
};

const HEALTH_BADGE: Record<string, any> = {
  healthy: "secondary",
  degraded: "outline",
  blocked: "destructive",
};

const CRIT_BADGE: Record<string, any> = {
  P0: "destructive",
  P1: "outline",
  P2: "secondary",
};

function SummaryTile({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <SitaCard>
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <div className="text-2xl font-semibold text-foreground">{value}</div>
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
        </div>
      </div>
    </SitaCard>
  );
}

function DetailBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-xs">{children}</div>
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-border/30 pt-3">
      <div className="flex items-center gap-1.5 mb-1.5">
        {icon}
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{title}</span>
      </div>
      <div className="text-xs">{children}</div>
    </div>
  );
}

function DimensionTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  const ok = value > 0;
  return (
    <div className={`flex items-center gap-1.5 px-2 py-1 rounded border ${ok ? "border-emerald-500/30 bg-emerald-500/5" : "border-border/40"}`}>
      {icon}
      <span className="text-muted-foreground">{label}:</span>
      <span className={ok ? "text-emerald-500 font-medium" : "text-muted-foreground"}>{value}</span>
    </div>
  );
}

function DimRow({ icon, label, values }: { icon: React.ReactNode; label: string; values: ReadonlyArray<string> }) {
  return (
    <div className="flex items-start gap-1.5">
      <span className="flex items-center gap-1 text-muted-foreground shrink-0 w-[90px]">
        {icon}
        {label}:
      </span>
      <span className="text-foreground/80 font-mono text-[9px] break-all">
        {values.length === 0 ? <span className="text-muted-foreground/60">—</span> : values.join(", ")}
      </span>
    </div>
  );
}

export default function META03GoldenPathHealth() {
  const { armed, isLoading } = useArmedKillSwitches();
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState<string | null>(GOLDEN_PATH_REGISTRY[0]?.pathId ?? null);

  const evaluations = useMemo(() => evaluateGoldenPaths(armed), [armed]);
  const summary = useMemo(() => summarizeEvaluation(evaluations), [evaluations]);
  const evalById = useMemo(() => new Map(evaluations.map((e) => [e.pathId, e])), [evaluations]);

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return GOLDEN_PATH_REGISTRY;
    return GOLDEN_PATH_REGISTRY.filter(
      (p) =>
        p.pathId.toLowerCase().includes(q) ||
        p.title.toLowerCase().includes(q) ||
        p.ownerTeam.toLowerCase().includes(q) ||
        p.criticality.toLowerCase().includes(q)
    );
  }, [filter]);

  const selectedPath = useMemo(
    () => GOLDEN_PATH_REGISTRY.find((p) => p.pathId === selected) ?? null,
    [selected]
  );
  const selectedEval = selectedPath ? evalById.get(selectedPath.pathId) : null;
  const verification = selectedPath ? getVerificationSummary(selectedPath.pathId) : null;

  return (
    <div className="p-4 md:p-6 max-w-[1500px] mx-auto space-y-6">
      <SitaPageHeader
        title="Golden Path Health"
        subtitle="Live status of the 15 canonical end-to-end journeys, blended with armed kill-switch state."
      />

      {/* ── Summary tiles ─────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryTile label="Total" value={summary.total} icon={<RouteIcon className="h-5 w-5 text-primary" />} />
        <SummaryTile label="Healthy" value={summary.healthy} icon={<CheckCircle2 className="h-5 w-5 text-emerald-500" />} />
        <SummaryTile label="Degraded" value={summary.degraded} icon={<AlertTriangle className="h-5 w-5 text-amber-500" />} />
        <SummaryTile label="Blocked" value={summary.blocked} icon={<AlertCircle className="h-5 w-5 text-destructive" />} />
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* ── Path list ─────────────────────── */}
        <SitaCard className="col-span-12 md:col-span-5">
          <div className="flex items-center justify-between mb-3">
            <SitaCardTitle>Golden Paths</SitaCardTitle>
            {isLoading && <span className="text-[10px] text-muted-foreground">Loading…</span>}
          </div>
          <Input
            placeholder="Filter…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="mb-3 h-8 text-xs"
          />
          <ScrollArea className="h-[520px] pr-2">
            <ul className="space-y-1.5">
              {filtered.map((p) => {
                const ev = evalById.get(p.pathId);
                const isSelected = p.pathId === selected;
                return (
                  <li key={p.pathId}>
                    <button
                      type="button"
                      onClick={() => setSelected(p.pathId)}
                      className={`w-full text-left px-3 py-2 rounded-md border transition-colors text-xs ${
                        isSelected ? "border-primary bg-primary/10" : "border-border/40 hover:bg-secondary/30"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[10px] text-muted-foreground">{p.pathId}</span>
                        <div className="flex items-center gap-1.5">
                          <Badge variant={CRIT_BADGE[p.criticality]} className="text-[9px]">{p.criticality}</Badge>
                          {ev && HEALTH_ICON[ev.health]}
                        </div>
                      </div>
                      <div className="font-medium text-foreground mt-0.5">{p.title}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">Owner: {p.ownerTeam}</div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </ScrollArea>
        </SitaCard>

        {/* ── Detail ─────────────────────── */}
        <SitaCard className="col-span-12 md:col-span-7">
          {!selectedPath || !selectedEval ? (
            <p className="text-xs text-muted-foreground">Select a path to view health and recovery options.</p>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-mono text-[10px] text-muted-foreground">{selectedPath.pathId}</div>
                  <SitaCardTitle>{selectedPath.title}</SitaCardTitle>
                  <p className="text-xs text-muted-foreground mt-1">{selectedPath.summary}</p>
                </div>
                <Badge variant={HEALTH_BADGE[selectedEval.health]} className="text-[10px]">
                  {selectedEval.health}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <DetailBlock label="Criticality">
                  <Badge variant={CRIT_BADGE[selectedPath.criticality]} className="text-[10px]">{selectedPath.criticality}</Badge>
                </DetailBlock>
                <DetailBlock label="Owner team"><span className="text-foreground">{selectedPath.ownerTeam}</span></DetailBlock>
                <DetailBlock label="Steps">{selectedPath.steps.length}</DetailBlock>
              </div>

              {selectedEval.blockedBy.length > 0 && (
                <Section icon={<ShieldAlert className="h-3.5 w-3.5 text-destructive" />} title="Blocked by armed switches">
                  <div className="flex flex-wrap gap-1">
                    {selectedEval.blockedBy.map((sw) => (
                      <Badge key={sw} variant="destructive" className="text-[10px] font-mono">{sw}</Badge>
                    ))}
                  </div>
                </Section>
              )}

              {selectedEval.degradedSteps.length > 0 && (
                <Section icon={<AlertTriangle className="h-3.5 w-3.5 text-amber-500" />} title="Degraded steps">
                  <div className="flex flex-wrap gap-1">
                    {selectedEval.degradedSteps.map((s) => (
                      <Badge key={s} variant="outline" className="text-[10px] font-mono">{s}</Badge>
                    ))}
                  </div>
                </Section>
              )}

              <Section icon={<BookOpen className="h-3.5 w-3.5" />} title="Recovery runbooks">
                {selectedPath.recoveryRunbookRefs.length === 0 ? (
                  <span className="text-muted-foreground">none</span>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {selectedPath.recoveryRunbookRefs.map((rb) => (
                      <Badge key={rb} variant="outline" className="text-[10px] font-mono">{rb}</Badge>
                    ))}
                  </div>
                )}
              </Section>

              {verification && (
                <Section icon={<CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />} title="Verification coverage">
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <span className="text-muted-foreground">e2e:</span>
                    <span className="text-foreground">{verification.hasE2E ? "✓" : "—"}</span>
                    <span className="text-muted-foreground">runtime probe:</span>
                    <span className="text-foreground">{verification.hasProbe ? "✓" : "—"}</span>
                    <span className="text-muted-foreground">receipt:</span>
                    <span className="text-foreground">{verification.hasReceiptCheck ? "✓" : "—"}</span>
                  </div>
                </Section>
              )}

              {/* ── Phase 29 — 11-Dimension Reality Map ─────── */}
              <Section icon={<GitBranch className="h-3.5 w-3.5 text-primary" />} title="Reality Map (11 dimensions)">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5 text-[10px] mb-3">
                  <DimensionTile icon={<FileCheck2 className="h-3 w-3" />} label="Release gates" value={selectedPath.releaseGateRefs.length} />
                  <DimensionTile icon={<LifeBuoy className="h-3 w-3" />} label="Support fallback" value={selectedPath.supportFallbackUrl ? 1 : 0} />
                  <DimensionTile icon={<BookOpen className="h-3 w-3" />} label="Recovery runbooks" value={selectedPath.recoveryRunbookRefs.length} />
                </div>
                {selectedPath.releaseGateRefs.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {selectedPath.releaseGateRefs.map((g) => (
                      <Badge key={g} variant="outline" className="text-[10px] font-mono">{g}</Badge>
                    ))}
                  </div>
                )}
                <ScrollArea className="h-[220px] pr-2">
                  <ul className="space-y-2">
                    {selectedPath.steps.map((s) => (
                      <li key={s.stepId} className="border border-border/30 rounded-md p-2 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-foreground">{s.order}. {s.title}</span>
                          <span className="font-mono text-[9px] text-muted-foreground">{s.stepId}</span>
                        </div>
                        <div className="grid grid-cols-1 gap-1 text-[10px]">
                          <DimRow icon={<Layout className="h-3 w-3" />} label="Screen" values={s.screenComponentRef ? [s.screenComponentRef] : []} />
                          <DimRow icon={<RouteIcon className="h-3 w-3" />} label="Route" values={[s.routePattern]} />
                          <DimRow icon={<Cloud className="h-3 w-3" />} label="Edge fns" values={s.edgeFunctionRefs} />
                          <DimRow icon={<Cog className="h-3 w-3" />} label="Services" values={s.serviceRefs} />
                          <DimRow icon={<Database className="h-3 w-3" />} label="Tables" values={s.tableRefs} />
                          <DimRow icon={<Lock className="h-3 w-3" />} label="Policies" values={s.policyRefs} />
                          <DimRow icon={<FileCheck2 className="h-3 w-3" />} label="Receipts" values={s.expectedReceipts} />
                          <DimRow icon={<FlaskConical className="h-3 w-3" />} label="Verifications" values={s.verifications as ReadonlyArray<string>} />
                          <DimRow icon={<BookOpen className="h-3 w-3" />} label="Runbooks" values={s.recoveryRunbookRefs} />
                        </div>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              </Section>

              <div className="flex flex-wrap gap-2 pt-2">
                <Button asChild size="sm" variant="outline">
                  <Link to="/admin/meta-arch/control-plane">Inspect related switches →</Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link to="/admin/founder/runbooks">Open runbook library →</Link>
                </Button>
                {selectedPath.supportFallbackUrl && (
                  <Button asChild size="sm" variant="default">
                    <Link to={selectedPath.supportFallbackUrl}>
                      <LifeBuoy className="h-3.5 w-3.5 mr-1.5" />
                      Open support fallback →
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          )}
        </SitaCard>
      </div>
    </div>
  );
}
