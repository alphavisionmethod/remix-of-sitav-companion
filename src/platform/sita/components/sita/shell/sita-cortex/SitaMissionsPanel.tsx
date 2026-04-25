// ═══════════════════════════════════════════════════════════════
// SITA OS — Missions Panel (Phase G) — read-only summary
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState } from "react";
import { Target } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { listMissions, type SitaMission } from "@/lib/sita-cortex/missions";

export function SitaMissionsPanel() {
  const { user } = useAuth();
  const [missions, setMissions] = useState<SitaMission[]>([]);

  useEffect(() => {
    if (!user?.id) return;
    listMissions(user.id).then(setMissions).catch(() => setMissions([]));
  }, [user?.id]);

  return (
    <div className="rounded-2xl bg-background/40 backdrop-blur-xl border border-border p-4 space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <Target className="h-4 w-4 text-primary" /> Missions
      </div>
      {missions.length === 0 ? (
        <p className="text-xs text-muted-foreground">No active missions yet.</p>
      ) : (
        <ul className="space-y-2">
          {missions.slice(0, 5).map((m) => (
            <li key={m.id} className="text-xs text-foreground/80 flex justify-between gap-2">
              <span className="truncate">{m.title}</span>
              <span className="text-muted-foreground">{m.status}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}