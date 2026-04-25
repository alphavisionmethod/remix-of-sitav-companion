// ═══════════════════════════════════════════════════════════════
// SITA OS — META02: Control Plane Center (Phase 7)
// Live Kill-Switch matrix with cross-links into bounded context,
// runbook, and impacted Golden Paths. Read-only review surface;
// arming is performed in AR08KillSwitchCenter.
// ═══════════════════════════════════════════════════════════════

import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { SitaPageHeader, SitaCard, SitaCardTitle } from "@/platform/sita/components/sita/SitaCard";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShieldAlert, ArrowRight, Network, BookOpen, Route as RouteIcon } from "lucide-react";
import { KILL_SWITCH_REGISTRY } from "@/lib/control-plane/kill-switch-registry";
import { getDependentsOn } from "@/lib/control-plane/kill-switch-dependency-map";
import { getEnforcementPoints } from "@/lib/control-plane/kill-switch-enforcement-map";
import { getGoldenPathIdsForKillSwitch } from "@/lib/operations/golden-path-cross-link";
import { resolveContextById, resolveRunbookById } from "@/lib/meta-arch";
import { useArmedKillSwitches } from "@/lib/meta-arch/use-armed-kill-switches";

const IMPACT_VARIANT: Record<string, any> = {
  contained: "secondary",
  significant: "outline",
  critical: "destructive",
};

export default function META02ControlPlaneCenter() {
  const { armed } = useArmedKillSwitches();
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState<string | null>(KILL_SWITCH_REGISTRY[0]?.switchId ?? null);

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return KILL_SWITCH_REGISTRY;
    return KILL_SWITCH_REGISTRY.filter(
      (s) =>
        s.switchId.toLowerCase().includes(q) ||
        s.displayName.toLowerCase().includes(q) ||
        s.boundedContextId?.toLowerCase().includes(q) ||
        s.target.toLowerCase().includes(q)
    );
  }, [filter]);

  const selectedSwitch = useMemo(
    () => KILL_SWITCH_REGISTRY.find((s) => s.switchId === selected) ?? null,
    [selected]
  );

  const ctx = selectedSwitch?.boundedContextId
    ? resolveContextById(selectedSwitch.boundedContextId)
    : null;
  const runbook = selectedSwitch?.runbookRef
    ? resolveRunbookById(selectedSwitch.runbookRef)
    : null;
  const enforcementPoints = selectedSwitch ? getEnforcementPoints(selectedSwitch.switchId) : [];
  const dependents = selectedSwitch ? getDependentsOn(selectedSwitch.switchId) : [];
  const impactedPaths = selectedSwitch ? getGoldenPathIdsForKillSwitch(selectedSwitch.switchId) : [];

  return (
    <div className="p-4 md:p-6 max-w-[1500px] mx-auto space-y-6">
      <SitaPageHeader
        title="Control Plane Center"
        subtitle="Inspect kill switches, their enforcement layers, dependencies, and impact radius."
      />

      <div className="grid grid-cols-12 gap-4">
        {/* ── Switch list ─────────────────────────── */}
        <SitaCard className="col-span-12 md:col-span-5">
          <div className="flex items-center justify-between mb-3">
            <SitaCardTitle>Kill Switch Registry</SitaCardTitle>
            <Badge variant="secondary" className="text-[10px]">{KILL_SWITCH_REGISTRY.length} total</Badge>
          </div>
          <Input
            placeholder="Filter by ID, target, or context…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="mb-3 h-8 text-xs"
          />
          <ScrollArea className="h-[520px] pr-2">
            <ul className="space-y-1.5">
              {filtered.map((sw) => {
                const isArmed = armed.has(sw.switchId);
                const isSelected = sw.switchId === selected;
                return (
                  <li key={sw.switchId}>
                    <button
                      type="button"
                      onClick={() => setSelected(sw.switchId)}
                      className={`w-full text-left px-3 py-2 rounded-md border transition-colors text-xs ${
                        isSelected
                          ? "border-primary bg-primary/10"
                          : "border-border/40 hover:bg-secondary/30"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[10px] text-muted-foreground">{sw.switchId}</span>
                        {isArmed && <Badge variant="destructive" className="text-[9px]">ARMED</Badge>}
                      </div>
                      <div className="font-medium text-foreground mt-0.5">{sw.displayName}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={IMPACT_VARIANT[sw.impactLevel] ?? "outline"} className="text-[9px]">
                          {sw.impactLevel}
                        </Badge>
                        {sw.boundedContextId && (
                          <span className="text-[10px] text-muted-foreground font-mono">{sw.boundedContextId}</span>
                        )}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </ScrollArea>
        </SitaCard>

        {/* ── Detail panel ─────────────────────────── */}
        <SitaCard className="col-span-12 md:col-span-7">
          {!selectedSwitch ? (
            <p className="text-xs text-muted-foreground">Select a switch to inspect its impact.</p>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-mono text-[10px] text-muted-foreground">{selectedSwitch.switchId}</div>
                  <SitaCardTitle>{selectedSwitch.displayName}</SitaCardTitle>
                  <p className="text-xs text-muted-foreground mt-1">{selectedSwitch.description}</p>
                </div>
                <ShieldAlert className="h-5 w-5 text-destructive" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <DetailBlock label="Impact level"><Badge variant={IMPACT_VARIANT[selectedSwitch.impactLevel]} className="text-[10px]">{selectedSwitch.impactLevel}</Badge></DetailBlock>
                <DetailBlock label="Owner team"><span className="text-foreground">{selectedSwitch.ownerTeam}</span></DetailBlock>
                <DetailBlock label="Bounded context">
                  {ctx ? (
                    <span className="text-foreground">{ctx.contextName}</span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </DetailBlock>
                <DetailBlock label="Cooldown">{selectedSwitch.cooldownMs / 1000}s</DetailBlock>
                <DetailBlock label="Dual approval">{selectedSwitch.requiresDualApproval ? "Required" : "No"}</DetailBlock>
                <DetailBlock label="Default state">{selectedSwitch.defaultState}</DetailBlock>
              </div>

              <CrossLinkSection icon={<Network className="h-3.5 w-3.5" />} title="Enforcement points">
                {enforcementPoints.length === 0 ? (
                  <span className="text-muted-foreground">none registered</span>
                ) : (
                  <ul className="space-y-1">
                    {enforcementPoints.map((p, idx) => (
                      <li key={idx} className="font-mono text-[10px] text-muted-foreground">
                        <Badge variant="outline" className="text-[9px] mr-2">{p.layer}</Badge>
                        {p.enforcedAt} · {p.symbol}
                      </li>
                    ))}
                  </ul>
                )}
              </CrossLinkSection>

              <CrossLinkSection icon={<ArrowRight className="h-3.5 w-3.5" />} title="Dependents (cascade if armed)">
                {dependents.length === 0 ? (
                  <span className="text-muted-foreground">none</span>
                ) : (
                  <ul className="space-y-1">
                    {dependents.map((d, idx) => (
                      <li key={idx} className="text-[10px] text-muted-foreground">
                        <Badge variant="outline" className="text-[9px] font-mono mr-2">{d.fromSwitchId}</Badge>
                        <span className="font-mono">{d.relation}</span>
                        <span className="ml-2">{d.rationale}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </CrossLinkSection>

              <CrossLinkSection icon={<RouteIcon className="h-3.5 w-3.5" />} title="Impacted Golden Paths">
                {impactedPaths.length === 0 ? (
                  <span className="text-muted-foreground">none</span>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {impactedPaths.map((p) => (
                      <Badge key={p} variant="outline" className="text-[10px] font-mono">{p}</Badge>
                    ))}
                  </div>
                )}
              </CrossLinkSection>

              <CrossLinkSection icon={<BookOpen className="h-3.5 w-3.5" />} title="Recovery runbook">
                {runbook ? (
                  <div className="space-y-1">
                    <div className="text-foreground">{runbook.title}</div>
                    <div className="text-muted-foreground">{runbook.description}</div>
                    <div className="font-mono text-[10px] text-muted-foreground">{runbook.markdownRef}</div>
                  </div>
                ) : (
                  <span className="text-muted-foreground">no runbook attached</span>
                )}
              </CrossLinkSection>

              <div className="flex gap-2 pt-2">
                <Button asChild size="sm" variant="outline">
                  <Link to="/admin/automation/kill-switches">Toggle in AR08 →</Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link to="/admin/meta-arch/golden-paths">View Golden Path health →</Link>
                </Button>
              </div>
            </div>
          )}
        </SitaCard>
      </div>
    </div>
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

function CrossLinkSection({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
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
