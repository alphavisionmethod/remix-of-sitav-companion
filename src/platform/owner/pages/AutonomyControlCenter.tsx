// ═══════════════════════════════════════════════════════════════
// SITA OS — Autonomy Control Center (owner surface, Phase 5)
// Calm, owner-facing JIT approval surface backed by the same
// queue the controllers populate. Focused on "what needs me?"
// rather than ops detail.
// ═══════════════════════════════════════════════════════════════

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, ShieldCheck, Brain } from "lucide-react";
import { AutonomyApprovalQueue } from "@/components/autonomy/AutonomyApprovalQueue";
import { AutonomyReflectionTimeline } from "@/components/autonomy/AutonomyReflectionTimeline";
import { AutonomyMissionsPanel } from "@/components/autonomy/AutonomyMissionsPanel";
import { AutonomyKillSwitch } from "@/components/autonomy/AutonomyKillSwitch";
import { useAutonomyFleet } from "@/hooks/useAutonomyFleet";

export default function AutonomyControlCenter() {
  const { totals, loading } = useAutonomyFleet();

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <header className="space-y-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-semibold">Autonomy Control Center</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Your advisors propose work. You approve. Reversible drafts only — nothing client-facing
          ever runs without your tap.
        </p>
      </header>

      <AutonomyKillSwitch variant="banner" />

      <section className="grid grid-cols-3 gap-3">
        <MiniStat label="Waiting on you" value={totals.awaitingApproval} loading={loading} accent="warning" />
        <MiniStat label="Quietly observing" value={totals.inIdle} loading={loading} />
        <MiniStat label="Held safely" value={totals.circuitOpen} loading={loading} accent="destructive" />
      </section>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">What needs your call</CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <AutonomyApprovalQueue compact />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">What your advisors learned</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <AutonomyReflectionTimeline compact limit={15} />
        </CardContent>
      </Card>

      <AutonomyMissionsPanel ownerView compact />

      <AutonomyKillSwitch />
    </div>
  );
}

function MiniStat({
  label,
  value,
  loading,
  accent,
}: {
  label: string;
  value: number;
  loading: boolean;
  accent?: "warning" | "destructive";
}) {
  const tone =
    accent === "warning"
      ? "text-accent"
      : accent === "destructive"
      ? "text-destructive"
      : "text-foreground";
  return (
    <Card>
      <CardContent className="p-3">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className={`mt-1 text-2xl font-semibold tabular-nums ${tone}`}>
          {loading ? "—" : value}
        </div>
      </CardContent>
    </Card>
  );
}