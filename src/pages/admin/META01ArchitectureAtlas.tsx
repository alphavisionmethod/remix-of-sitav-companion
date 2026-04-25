// ═══════════════════════════════════════════════════════════════
// SITA OS — META01: Architecture Atlas (Phase 7)
// Single read-only view that surfaces the canonical lattice:
//   Bounded Contexts × Kill Switches × Runbooks × Golden Paths
// plus a live Registry Integrity report.
// ═══════════════════════════════════════════════════════════════

import { useMemo } from "react";
import { Link } from "react-router-dom";
import { SitaPageHeader, SitaCard, SitaCardTitle } from "@/platform/sita/components/sita/SitaCard";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertTriangle, AlertCircle, Network, ShieldAlert, BookOpen, Route as RouteIcon } from "lucide-react";
import {
  computeMetaArchSnapshot,
  validateRegistryIntegrity,
  getCounts,
} from "@/lib/meta-arch";
import { useArmedKillSwitches } from "@/lib/meta-arch/use-armed-kill-switches";

const HEALTH_BADGE: Record<string, { variant: any; label: string }> = {
  healthy: { variant: "secondary", label: "Healthy" },
  degraded: { variant: "outline", label: "Degraded" },
  blocked: { variant: "destructive", label: "Blocked" },
  unknown: { variant: "outline", label: "Unknown" },
};

export default function META01ArchitectureAtlas() {
  const { armed, isLoading } = useArmedKillSwitches();
  const counts = useMemo(() => getCounts(), []);
  const snapshot = useMemo(() => computeMetaArchSnapshot(armed), [armed]);
  const integrity = useMemo(() => validateRegistryIntegrity(), []);

  return (
    <div className="p-4 md:p-6 max-w-[1500px] mx-auto space-y-6">
      <SitaPageHeader
        title="Architecture Atlas"
        subtitle="Unified view of bounded contexts, kill switches, runbooks, and golden paths."
      />

      {/* ── Top counters ─────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SitaCard>
          <div className="flex items-center gap-3">
            <Network className="h-5 w-5 text-primary" />
            <div>
              <div className="text-2xl font-semibold text-foreground">{counts.contexts}</div>
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Bounded Contexts</div>
            </div>
          </div>
        </SitaCard>
        <SitaCard>
          <div className="flex items-center gap-3">
            <ShieldAlert className="h-5 w-5 text-destructive" />
            <div>
              <div className="text-2xl font-semibold text-foreground">{counts.killSwitches}</div>
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Kill Switches · {snapshot.totals.armedKillSwitches} armed
              </div>
            </div>
          </div>
        </SitaCard>
        <SitaCard>
          <div className="flex items-center gap-3">
            <BookOpen className="h-5 w-5 text-primary" />
            <div>
              <div className="text-2xl font-semibold text-foreground">{counts.runbooks}</div>
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Runbooks</div>
            </div>
          </div>
        </SitaCard>
        <SitaCard>
          <div className="flex items-center gap-3">
            <RouteIcon className="h-5 w-5 text-primary" />
            <div>
              <div className="text-2xl font-semibold text-foreground">{counts.goldenPaths}</div>
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Golden Paths · {snapshot.totals.blockedGoldenPaths} blocked
              </div>
            </div>
          </div>
        </SitaCard>
      </div>

      {/* ── Integrity report ─────────────────────── */}
      <SitaCard>
        <div className="flex items-center justify-between mb-3">
          <SitaCardTitle>Registry Integrity</SitaCardTitle>
          <Badge variant={integrity.ok ? "secondary" : "destructive"}>
            {integrity.ok ? (
              <span className="inline-flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> {integrity.errorCount} errors · {integrity.warningCount} warnings
              </span>
            ) : (
              <span className="inline-flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> {integrity.errorCount} errors · {integrity.warningCount} warnings
              </span>
            )}
          </Badge>
        </div>
        {integrity.issues.length === 0 ? (
          <p className="text-xs text-muted-foreground">All cross-registry references resolve.</p>
        ) : (
          <ScrollArea className="h-48">
            <ul className="space-y-1.5 pr-3">
              {integrity.issues.map((iss, idx) => (
                <li key={idx} className="text-xs flex items-start gap-2">
                  {iss.severity === "error" ? (
                    <AlertCircle className="h-3.5 w-3.5 text-destructive mt-0.5 shrink-0" />
                  ) : (
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
                  )}
                  <span className="text-muted-foreground">
                    <span className="font-mono text-foreground">[{iss.registry}/{iss.subject}]</span> {iss.message}
                  </span>
                </li>
              ))}
            </ul>
          </ScrollArea>
        )}
      </SitaCard>

      {/* ── Context lattice ─────────────────────── */}
      <SitaCard>
        <div className="flex items-center justify-between mb-3">
          <SitaCardTitle>Bounded Context Lattice</SitaCardTitle>
          {isLoading && <span className="text-[10px] text-muted-foreground">Loading live state…</span>}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="text-left text-[10px] uppercase tracking-wide text-muted-foreground">
              <tr className="border-b border-border/50">
                <th className="py-2 pr-3">Context</th>
                <th className="py-2 pr-3">Owner</th>
                <th className="py-2 pr-3">Health</th>
                <th className="py-2 pr-3">Switches</th>
                <th className="py-2 pr-3">Runbooks</th>
                <th className="py-2 pr-3">Paths</th>
              </tr>
            </thead>
            <tbody>
              {snapshot.contexts.map((c) => {
                const badge = HEALTH_BADGE[c.health];
                return (
                  <tr key={c.contextId} className="border-b border-border/20 hover:bg-secondary/20">
                    <td className="py-2 pr-3 font-medium text-foreground">{c.contextName}<div className="text-[10px] text-muted-foreground font-mono">{c.contextId}</div></td>
                    <td className="py-2 pr-3 text-muted-foreground">{c.owner}</td>
                    <td className="py-2 pr-3"><Badge variant={badge.variant} className="text-[10px]">{badge.label}</Badge></td>
                    <td className="py-2 pr-3 text-muted-foreground">
                      {c.killSwitches.length}
                      {c.armedKillSwitches.length > 0 && (
                        <Badge variant="destructive" className="ml-2 text-[9px]">{c.armedKillSwitches.length} armed</Badge>
                      )}
                    </td>
                    <td className="py-2 pr-3 text-muted-foreground">{c.runbooks.length}</td>
                    <td className="py-2 pr-3 text-muted-foreground">
                      {c.goldenPaths.length}
                      {c.blockedGoldenPaths.length > 0 && (
                        <Badge variant="destructive" className="ml-2 text-[9px]">{c.blockedGoldenPaths.length} blocked</Badge>
                      )}
                      {c.degradedGoldenPaths.length > 0 && (
                        <Badge variant="outline" className="ml-2 text-[9px]">{c.degradedGoldenPaths.length} degraded</Badge>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SitaCard>

      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline" size="sm">
          <Link to="/admin/meta-arch/control-plane">Open Control Plane Center</Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link to="/admin/meta-arch/golden-paths">Open Golden Path Health</Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link to="/admin/founder/runbooks">Runbook Library</Link>
        </Button>
      </div>
    </div>
  );
}
