// ═══════════════════════════════════════════════════════════════
// SITA OS — Operator Home (Workflow-First Landing)
//
// Default landing for the operator deployment profile. Surfaces
// the 8 canonical operator workflows as actionable cards plus
// at-a-glance signals (incidents / release gate / verification /
// support queue / kill-switch posture). Composition only — every
// metric and link delegates to existing admin surfaces.
// ═══════════════════════════════════════════════════════════════

import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ADMIN_WORKFLOWS } from "@/lib/admin/admin-workflow-registry";
import { getDeploymentProfile } from "@/lib/runtime/deployment-profile";
import { ChevronRight, ShieldAlert, Activity, GitBranch, LifeBuoy, Lock } from "lucide-react";

const SIGNAL_TILES = [
  { key: "incidents",    label: "Open Incidents",    href: "/admin/observability/incidents", icon: ShieldAlert, hint: "Live incident command" },
  { key: "release-gate", label: "Release Gate",      href: "/admin/release",                  icon: GitBranch,   hint: "Readiness · rings · rollback" },
  { key: "verification", label: "Verification",      href: "/admin/verification",             icon: Activity,    hint: "Truth · drift · reality audit" },
  { key: "support",      label: "Support Queue",     href: "/admin/support",                  icon: LifeBuoy,    hint: "Customer cases · diagnostics" },
  { key: "killswitch",   label: "Kill-Switch Posture", href: "/admin/security",               icon: Lock,        hint: "Privileged controls" },
];

export default function OperatorHome() {
  const profile = getDeploymentProfile();

  return (
    <div className="space-y-8 p-6">
      <header className="space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Operator Home</h1>
          <Badge variant="outline" className="border-primary/40 text-primary">
            {profile.displayName}
          </Badge>
        </div>
        <p className="text-muted-foreground">
          Workflow-first landing. Pick a canonical workflow or jump to a signal that needs attention.
        </p>
      </header>

      {/* ── Signal strip ───────────────────────────────────────── */}
      <section aria-labelledby="signals-heading" className="space-y-3">
        <h2 id="signals-heading" className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          At-a-glance signals
        </h2>
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
          {SIGNAL_TILES.map(({ key, label, href, icon: Icon, hint }) => (
            <Link key={key} to={href} className="group">
              <Card className="h-full transition-colors group-hover:border-primary/50">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Icon className="h-4 w-4 text-primary" />
                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                  <CardTitle className="text-base">{label}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-muted-foreground">{hint}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Canonical workflows ────────────────────────────────── */}
      <section aria-labelledby="workflows-heading" className="space-y-3">
        <h2 id="workflows-heading" className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Canonical operator workflows
        </h2>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {ADMIN_WORKFLOWS.map((wf) => (
            <Card key={wf.key} className="flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <span className="rounded-md bg-primary/10 p-2 text-primary">
                    <wf.icon className="h-5 w-5" aria-hidden />
                  </span>
                  <CardTitle className="text-lg">{wf.label}</CardTitle>
                </div>
                <CardDescription>{wf.description}</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto space-y-3">
                <p className="text-xs italic text-muted-foreground">{wf.whenToUse}</p>
                <div className="flex flex-wrap gap-2">
                  <Button asChild size="sm" variant="default">
                    <Link to={wf.primaryRoute}>Enter workflow</Link>
                  </Button>
                  {wf.supportingRoutes.slice(0, 2).map((s) => (
                    <Button key={s.route} asChild size="sm" variant="ghost">
                      <Link to={s.route}>{s.label}</Link>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
