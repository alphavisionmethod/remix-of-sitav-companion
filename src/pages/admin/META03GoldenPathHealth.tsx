// ═══════════════════════════════════════════════════════════════
// SITA OS — META03: Golden Path Health (Phase 7)
// Real-time health board for the 15 canonical Golden Paths,
// computed from live armed kill switches via the Phase 6 evaluator.
// ═══════════════════════════════════════════════════════════════

import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { SitaPageHeader, SitaCard, SitaCardTitle } from "@/components/sita/SitaCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, AlertTriangle, AlertCircle, Route as RouteIcon, ShieldAlert, BookOpen } from "lucide-react";
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
                    <span className="text-foreground">{verification.hasRuntimeProbe ? "✓" : "—"}</span>
                    <span className="text-muted-foreground">receipt:</span>
                    <span className="text-foreground">{verification.hasReceipt ? "✓" : "—"}</span>
                  </div>
                </Section>
              )}

              <div className="flex gap-2 pt-2">
                <Button asChild size="sm" variant="outline">
                  <Link to="/admin/meta-arch/control-plane">Inspect related switches →</Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link to="/admin/founder/runbooks">Open runbook library →</Link>
                </Button>
              </div>
            </div>
          )}
        </SitaCard>
      </div>
    </div>
  );
}

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
