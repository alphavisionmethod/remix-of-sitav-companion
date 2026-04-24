// ═══════════════════════════════════════════════════════════════
// SITA OS — WorldModelPanel (Jarvis Bridge)
// First-ever visible surface of sita_world_state. Shows what Sita
// currently believes about the user's world.
// ═══════════════════════════════════════════════════════════════

import { Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useWorldModel } from "@/lib/sita-cortex/useWorldModel";

function fmtAgo(ts: number): string {
  const sec = Math.floor((Date.now() - ts) / 1000);
  if (sec < 60) return `${sec}s ago`;
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  return `${Math.floor(sec / 3600)}h ago`;
}

export function WorldModelPanel() {
  const { snapshot } = useWorldModel();
  const wm = snapshot;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-primary" /> World model
          <Badge variant="outline" className="text-[10px] ml-auto">{fmtAgo(wm.ts)}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <Row label="Focused app" value={wm.focused_app ?? "—"} />
        <Row label="Open windows" value={String(wm.open_windows.length)} />
        <Row label="Active intent" value={wm.active_intent ?? "—"} />
        <Row label="Mood" value={wm.mood ?? "—"} />
        {wm.finance_posture && (
          <>
            <Row label="Cash runway" value={wm.finance_posture.cash_runway_days != null ? `${wm.finance_posture.cash_runway_days}d` : "—"} />
            <Row label="Bills due (7d)" value={wm.finance_posture.bills_due_7d != null ? String(wm.finance_posture.bills_due_7d) : "—"} />
          </>
        )}
        <Row label="Calendar (48h)" value={wm.calendar_next_48h?.length != null ? String(wm.calendar_next_48h.length) : "—"} />
        <Row label="Concierge tasks" value={wm.concierge_open_tasks != null ? String(wm.concierge_open_tasks) : "—"} />
      </CardContent>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border/20 pb-1.5 last:border-0 last:pb-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="font-mono text-xs">{value}</span>
    </div>
  );
}