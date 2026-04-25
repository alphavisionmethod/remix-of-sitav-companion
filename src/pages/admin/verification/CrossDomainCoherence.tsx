// ═══════════════════════════════════════════════════════════════
// SITA OS — Cross-Domain Coherence Board
// Canonical empty-state at /admin/verification/cross-domain-coherence.
// Adopts the canonical PremiumEmptyState primitive (no duplicate).
// ═══════════════════════════════════════════════════════════════
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PremiumEmptyState } from "@/platform/sita/components/sita/PremiumEmptyState";
import {
  Network,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  GitBranch,
  Activity,
} from "lucide-react";

const SIGNAL_SOURCES = [
  {
    label: "Verification incidents",
    detail: "Surface inventory, journey, or interaction failures spanning ≥2 domains",
    icon: ShieldCheck,
  },
  {
    label: "Trust-tier transitions",
    detail: "Trust ladder downgrades that propagate to release / approvals",
    icon: GitBranch,
  },
  {
    label: "Cross-council disagreements",
    detail: "Internal advisor councils returning conflicting verdicts on the same change",
    icon: Activity,
  },
  {
    label: "Federated incident propagation",
    detail: "Single-domain incidents that escalate to cross-domain failure triage",
    icon: AlertTriangle,
  },
];

const CANONICAL_DESTINATIONS: Array<{ label: string; path: string; reason: string }> = [
  {
    label: "Surface Inventory (V01)",
    path: "/admin/verification?tab=launch-honesty",
    reason: "Inspect single-domain verification truth right now",
  },
  {
    label: "Failure Triage (V05)",
    path: "/admin/verification?tab=launch-honesty",
    reason: "Review per-domain failure clusters",
  },
  {
    label: "Active Incidents",
    path: "/admin/health/incidents",
    reason: "Live incidents that may foreshadow coherence drift",
  },
  {
    label: "Error Patrol",
    path: "/admin/health/error-patrol",
    reason: "Autonomous repairs across domains",
  },
];

export default function CrossDomainCoherence() {
  const navigate = useNavigate();
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-base">
              <Network className="h-4 w-4 text-primary" />
              Cross-Domain Coherence
              <Badge variant="outline" className="text-[10px]">
                verification · live
              </Badge>
            </CardTitle>
            <p className="text-xs text-muted-foreground max-w-2xl">
              Detects when verification, trust, and incident signals correlate across more than one
              admin domain. Activates when at least one cross-domain pattern is observed in the
              last 24 hours. No correlated signals right now — this board stays calm by design.
            </p>
          </div>
          <Badge variant="outline" className="border-emerald-500/50 text-emerald-600 dark:text-emerald-400">
            0 cross-domain signals · 24h window
          </Badge>
        </CardHeader>
        <CardContent className="space-y-6">
          <PremiumEmptyState
            variant="no-data"
            icon={Network}
            domain="business"
            title="No cross-domain coherence signals"
            description="This board activates when verification, trust, or incident events span more than one admin domain. Per-domain boards remain the source of truth meanwhile."
            tip="Inspect Failure Triage and Active Incidents below for single-domain signals."
            actions={[
              {
                label: "Open Failure Triage",
                icon: ShieldCheck,
                onClick: () => navigate("/admin/verification?tab=launch-honesty"),
              },
              {
                label: "Open Incidents",
                icon: AlertTriangle,
                variant: "secondary",
                onClick: () => navigate("/admin/health/incidents"),
              },
            ]}
          />

          <div className="rounded-lg border bg-card/40 p-4">
            <div className="mb-3 text-xs font-medium uppercase text-muted-foreground">
              What populates this board
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {SIGNAL_SOURCES.map((s) => {
                const Icon = s.icon;
                return (
                  <div key={s.label} className="flex items-start gap-3 rounded border bg-background/50 p-3">
                    <Icon className="mt-0.5 h-4 w-4 text-primary shrink-0" />
                    <div className="space-y-0.5">
                      <div className="text-xs font-medium">{s.label}</div>
                      <div className="text-[11px] text-muted-foreground">{s.detail}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-lg border bg-card/40 p-4">
            <div className="mb-3 text-xs font-medium uppercase text-muted-foreground">
              Canonical destinations meanwhile
            </div>
            <div className="flex flex-wrap gap-2">
              {CANONICAL_DESTINATIONS.map((d) => (
                <Link key={d.path} to={d.path} title={d.reason}>
                  <Button type="button" size="sm" variant="outline">
                    <ArrowRight className="mr-1 h-3 w-3" />
                    {d.label}
                  </Button>
                </Link>
              ))}
            </div>
            <p className="mt-3 text-[11px] text-muted-foreground">
              Emptiness here does not imply error. Single-domain evidence remains canonical and
              fully observable through the linked boards above.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
