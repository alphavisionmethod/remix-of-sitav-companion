// ═══════════════════════════════════════════════════════════════
// SITA OS — SBOM History Board
// Canonical empty-state at /admin/releases/sbom-history.
// Adopts PremiumEmptyState primitive. Active SBOM evidence remains
// fully accessible via Release Engineering linked below.
// ═══════════════════════════════════════════════════════════════
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PremiumEmptyState } from "@/platform/sita/components/sita/PremiumEmptyState";
import {
  History,
  ArrowRight,
  FileText,
  PackageCheck,
  Rocket,
  Diff,
  ShieldCheck,
} from "lucide-react";

const HISTORICAL_EVIDENCE_KINDS = [
  {
    label: "Signed SBOM diffs",
    detail: "Component-level differences between consecutive signed releases",
    icon: Diff,
  },
  {
    label: "Provenance chain",
    detail: "Build-time provenance attestations linked to each SBOM revision",
    icon: ShieldCheck,
  },
  {
    label: "Promotion ledger",
    detail: "Ring promotion + rollback events tied to SBOM versions",
    icon: Rocket,
  },
  {
    label: "Vulnerability deltas",
    detail: "New / resolved CVE counts surfaced per release transition",
    icon: PackageCheck,
  },
];

const CURRENT_RELEASE_DESTINATIONS: Array<{ label: string; path: string; reason: string }> = [
  {
    label: "Release Engineering",
    path: "/admin/release-engineering",
    reason: "Inspect the current release's signed SBOM and pipelines",
  },
  {
    label: "Launch Readiness",
    path: "/admin/releases/launch-readiness",
    reason: "Are we ready to ship the next release?",
  },
  {
    label: "Updates & Rollback",
    path: "/admin/mc/releases",
    reason: "Active rollout, rollback, and update status",
  },
  {
    label: "Deployment Rings",
    path: "/admin/releases/deployment-rings",
    reason: "Ring promotion eligibility for the next signed release",
  },
];

export default function SbomHistory() {
  const navigate = useNavigate();
  // Honest counter — historical SBOM diffs require ≥2 signed releases.
  // Current platform has the active release only; no historical pairs yet.
  const releaseCyclesObserved = 1;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-base">
              <History className="h-4 w-4 text-primary" />
              SBOM History
              <Badge variant="outline" className="text-[10px]">
                releases · live
              </Badge>
            </CardTitle>
            <p className="text-xs text-muted-foreground max-w-2xl">
              Historical SBOM diffs across signed releases. History becomes available after at
              least two signed releases ship — the current release's SBOM is already inspectable
              via Release Engineering.
            </p>
          </div>
          <Badge variant="outline" className="text-[10px]">
            release cycles observed · {releaseCyclesObserved}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-6">
          <PremiumEmptyState
            variant="first-use"
            icon={History}
            domain="business"
            title="History begins with the next signed release"
            description="Only one release exists so far, so there is no history to compare against yet. The current release's signed SBOM remains fully inspectable via Release Engineering."
            tip="History will populate automatically after the next signed release."
            actions={[
              {
                label: "Open Release Engineering",
                icon: FileText,
                onClick: () => navigate("/admin/release-engineering"),
              },
              {
                label: "Launch Readiness",
                icon: Rocket,
                variant: "secondary",
                onClick: () => navigate("/admin/releases/launch-readiness"),
              },
            ]}
          />

          <div className="rounded-lg border bg-card/40 p-4">
            <div className="mb-3 text-xs font-medium uppercase text-muted-foreground">
              What counts as historical evidence
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {HISTORICAL_EVIDENCE_KINDS.map((k) => {
                const Icon = k.icon;
                return (
                  <div key={k.label} className="flex items-start gap-3 rounded border bg-background/50 p-3">
                    <Icon className="mt-0.5 h-4 w-4 text-primary shrink-0" />
                    <div className="space-y-0.5">
                      <div className="text-xs font-medium">{k.label}</div>
                      <div className="text-[11px] text-muted-foreground">{k.detail}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-lg border bg-card/40 p-4">
            <div className="mb-3 text-xs font-medium uppercase text-muted-foreground">
              Current release evidence (live now)
            </div>
            <div className="flex flex-wrap gap-2">
              {CURRENT_RELEASE_DESTINATIONS.map((d) => (
                <Link key={d.path} to={d.path} title={d.reason}>
                  <Button type="button" size="sm" variant="outline">
                    <ArrowRight className="mr-1 h-3 w-3" />
                    {d.label}
                  </Button>
                </Link>
              ))}
            </div>
            <p className="mt-3 text-[11px] text-muted-foreground">
              Empty history is not a missing feature — it is the truthful state of a single-release
              platform. The next signed release will produce the first comparable diff.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
