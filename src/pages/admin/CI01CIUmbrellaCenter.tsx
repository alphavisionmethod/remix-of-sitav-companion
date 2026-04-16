// ═══════════════════════════════════════════════════════════════
// SITA OS — CI01 CI Umbrella Center
// Real-time health view of all CI gates, grouped by phase.
// Route: /admin/ci/umbrella (gated by audit.view)
// ═══════════════════════════════════════════════════════════════

import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CI_GATE_REGISTRY,
  validateCIUmbrellaIntegrity,
  blockerCount,
} from "@/lib/ci";
import type { CIGateEntry, CIGatePhase } from "@/lib/ci";

const PHASE_TITLES: Record<CIGatePhase, string> = {
  "phase-1-bounded-context": "1 — Bounded Context",
  "phase-2-runtime-tier": "2 — Runtime Tier",
  "phase-3-permissions": "3 — Permissions",
  "phase-4-kill-switches": "4 — Kill Switches",
  "phase-5-runbooks": "5 — Runbooks",
  "phase-6-golden-paths": "6 — Golden Paths",
  "phase-7-meta-arch": "7 — Meta-Architecture",
  "phase-8-ci-umbrella": "8 — CI Umbrella",
  "phase-9-reality-deployability": "9 — Reality & Deployability",
  "phase-10-completeness": "10 — Completeness",
};

function GateCard({ gate }: { gate: CIGateEntry }) {
  return (
    <div className="border rounded-lg p-3 space-y-2 bg-card">
      <div className="flex items-start justify-between gap-2">
        <div className="font-medium text-sm">{gate.title}</div>
        <Badge
          variant={gate.severity === "blocker" ? "destructive" : gate.severity === "warning" ? "outline" : "secondary"}
          className="text-[10px]"
        >
          {gate.severity}
        </Badge>
      </div>
      <p className="text-xs text-muted-foreground">{gate.description}</p>
      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <code className="truncate">{gate.script}</code>
        <span>{gate.owner}</span>
      </div>
      {gate.producesArtifact && (
        <div className="text-[11px] text-muted-foreground">
          → <code>{gate.producesArtifact}</code>
        </div>
      )}
    </div>
  );
}

export default function CI01CIUmbrellaCenter() {
  const integrity = useMemo(() => validateCIUmbrellaIntegrity(), []);
  const phases = Object.keys(PHASE_TITLES) as CIGatePhase[];
  const blockers = blockerCount();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">CI Umbrella</h1>
        <p className="text-muted-foreground">
          Master registry of all architectural CI gates across {phases.length} phases.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total gates</CardDescription>
            <CardTitle className="text-3xl">{CI_GATE_REGISTRY.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Blockers</CardDescription>
            <CardTitle className="text-3xl">{blockers}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Registry errors</CardDescription>
            <CardTitle className="text-3xl">{integrity.errorCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Integrity</CardDescription>
            <CardTitle className="text-3xl">
              <Badge variant={integrity.ok ? "default" : "destructive"}>
                {integrity.ok ? "OK" : "FAIL"}
              </Badge>
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="space-y-6">
        {phases.map((phase) => {
          const gates = CI_GATE_REGISTRY.filter((g) => g.phase === phase);
          if (gates.length === 0) return null;
          return (
            <Card key={phase}>
              <CardHeader>
                <CardTitle>{PHASE_TITLES[phase]}</CardTitle>
                <CardDescription>{gates.length} gate{gates.length === 1 ? "" : "s"}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {gates.map((g) => <GateCard key={g.id} gate={g} />)}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
