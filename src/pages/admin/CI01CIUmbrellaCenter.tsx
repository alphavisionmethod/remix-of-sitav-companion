// ═══════════════════════════════════════════════════════════════
// SITA OS — CI01: CI Umbrella Center (Phase 8)
// Real-time view of every CI gate, grouped by phase, with severity
// badges, owner attribution, integrity report, and direct links to
// the underlying validator scripts.
// ═══════════════════════════════════════════════════════════════

import { useMemo, useState } from "react";
import { SitaPageHeader, SitaCard, SitaCardTitle } from "@/components/sita/SitaCard";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Layers,
  Lock,
  GitMerge,
  Rocket,
} from "lucide-react";
import {
  computeCIUmbrellaSnapshot,
  validateCIUmbrellaIntegrity,
  CI_PHASE_DISPLAY,
  type CIGateEntry,
  type CIGateSeverity,
} from "@/lib/ci";

const SEVERITY_BADGE: Record<CIGateSeverity, { variant: any; label: string }> = {
  blocker: { variant: "destructive", label: "Blocker" },
  high: { variant: "default", label: "High" },
  medium: { variant: "secondary", label: "Medium" },
  advisory: { variant: "outline", label: "Advisory" },
};

const TRIGGER_LABEL: Record<string, string> = {
  "pr-required": "PR (required)",
  "pr-advisory": "PR (advisory)",
  nightly: "Nightly",
  "release-gate": "Release gate",
  "deploy-gate": "Deploy gate",
  manual: "Manual",
};

export default function CI01CIUmbrellaCenter() {
  const snapshot = useMemo(() => computeCIUmbrellaSnapshot(), []);
  const integrity = useMemo(() => validateCIUmbrellaIntegrity(), []);
  const [filter, setFilter] = useState("");

  const gatesByPhase = useMemo(() => {
    const lc = filter.trim().toLowerCase();
    const map = new Map<string, CIGateEntry[]>();
    for (const g of snapshot.gates) {
      const matches =
        !lc ||
        g.gateId.toLowerCase().includes(lc) ||
        g.title.toLowerCase().includes(lc) ||
        g.owner.toLowerCase().includes(lc) ||
        (g.boundedContextId ?? "").toLowerCase().includes(lc);
      if (!matches) continue;
      const arr = map.get(g.phase) ?? [];
      arr.push(g);
      map.set(g.phase, arr);
    }
    return map;
  }, [snapshot.gates, filter]);

  return (
    <div className="p-4 md:p-6 max-w-[1500px] mx-auto space-y-6">
      <SitaPageHeader
        title="CI Umbrella Center"
        subtitle="Every CI gate that protects the platform — registered, classified, and integrity-checked."
      />

      {/* ── Top counters ───────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <SitaCard>
          <div className="flex items-center gap-3">
            <Layers className="h-5 w-5 text-primary" />
            <div>
              <div className="text-2xl font-semibold text-foreground">{snapshot.totals.gates}</div>
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Total gates</div>
            </div>
          </div>
        </SitaCard>
        <SitaCard>
          <div className="flex items-center gap-3">
            <Lock className="h-5 w-5 text-destructive" />
            <div>
              <div className="text-2xl font-semibold text-foreground">{snapshot.totals.blockers}</div>
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Blockers</div>
            </div>
          </div>
        </SitaCard>
        <SitaCard>
          <div className="flex items-center gap-3">
            <GitMerge className="h-5 w-5 text-muted-foreground" />
            <div>
              <div className="text-2xl font-semibold text-foreground">{snapshot.totals.mergeBlocking}</div>
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Merge-blocking</div>
            </div>
          </div>
        </SitaCard>
        <SitaCard>
          <div className="flex items-center gap-3">
            <Rocket className="h-5 w-5 text-primary" />
            <div>
              <div className="text-2xl font-semibold text-foreground">{snapshot.totals.releaseBlocking}</div>
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Release-blocking</div>
            </div>
          </div>
        </SitaCard>
        <SitaCard>
          <div className="flex items-center gap-3">
            {integrity.ok ? (
              <CheckCircle2 className="h-5 w-5 text-primary" />
            ) : (
              <AlertCircle className="h-5 w-5 text-destructive" />
            )}
            <div>
              <div className="text-2xl font-semibold text-foreground">
                {integrity.errorCount}
              </div>
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Integrity errors · {integrity.warningCount} warnings
              </div>
            </div>
          </div>
        </SitaCard>
      </div>

      {/* ── Integrity issues ──────────────────────── */}
      {integrity.issues.length > 0 && (
        <SitaCard>
          <SitaCardTitle>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" /> Integrity Issues
            </div>
          </SitaCardTitle>
          <ScrollArea className="max-h-[200px]">
            <ul className="space-y-1.5 text-xs">
              {integrity.issues.map((i, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <Badge variant={i.severity === "error" ? "destructive" : "outline"}>
                    {i.severity}
                  </Badge>
                  <span className="text-muted-foreground">
                    <span className="font-medium text-foreground">{i.gateId ?? "registry"}</span>{" "}
                    · {i.kind} · {i.message}
                  </span>
                </li>
              ))}
            </ul>
          </ScrollArea>
        </SitaCard>
      )}

      {/* ── Filter ────────────────────────────────── */}
      <Input
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Filter by gate id, title, owner, or context…"
        className="max-w-md"
      />

      {/* ── Gates by phase ────────────────────────── */}
      <div className="space-y-4">
        {snapshot.phases.map((phase) => {
          const gates = gatesByPhase.get(phase.phase) ?? [];
          if (gates.length === 0 && filter) return null;
          const meta = CI_PHASE_DISPLAY[phase.phase];
          return (
            <SitaCard key={phase.phase}>
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-foreground">
                      {meta?.name ?? phase.phase}
                    </div>
                    <div className="text-xs text-muted-foreground">{meta?.description}</div>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    {gates.length}/{phase.totalGates} shown · {phase.blockerGates} blockers
                  </div>
                </div>
                <div className="space-y-2">
                  {gates.map((g) => (
                    <div
                      key={g.gateId}
                      className="rounded border border-border/50 bg-background/40 p-3 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                            <span>{g.title}</span>
                            <Badge
                              variant={SEVERITY_BADGE[g.severity].variant}
                              className="text-[10px]"
                            >
                              {SEVERITY_BADGE[g.severity].label}
                            </Badge>
                            {g.blocksRelease && (
                              <Badge variant="outline" className="text-[10px]">
                                release-blocking
                              </Badge>
                            )}
                            {g.blocksMerge && (
                              <Badge variant="outline" className="text-[10px]">
                                merge-blocking
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">{g.description}</div>
                        </div>
                        <div className="text-right text-[11px] text-muted-foreground shrink-0">
                          {TRIGGER_LABEL[g.trigger] ?? g.trigger}
                          <div className="font-mono">{g.gateId}</div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                        <span>
                          owner: <span className="text-foreground">{g.owner}</span>
                        </span>
                        {g.boundedContextId && (
                          <span>
                            context: <span className="text-foreground">{g.boundedContextId}</span>
                          </span>
                        )}
                        {g.producesArtifact && (
                          <span>
                            produces: <span className="font-mono">{g.producesArtifact}</span>
                          </span>
                        )}
                        {g.readsArtifacts.length > 0 && (
                          <span>reads: {g.readsArtifacts.length} artifact(s)</span>
                        )}
                      </div>
                      <div className="text-[11px] font-mono text-muted-foreground/80 truncate">
                        {g.scriptPath}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </SitaCard>
          );
        })}
      </div>
    </div>
  );
}
