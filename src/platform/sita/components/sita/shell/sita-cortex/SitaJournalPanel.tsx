// ═══════════════════════════════════════════════════════════════
// SITA OS — Journal Panel (Phase G) — read-only daily reflections
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState } from "react";
import { BookOpen } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { listRecentJournal, type SitaJournalEntry } from "@/lib/sita-cortex/reflection";

export function SitaJournalPanel() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<SitaJournalEntry[]>([]);

  useEffect(() => {
    if (!user?.id) return;
    listRecentJournal(user.id, 7).then(setEntries).catch(() => setEntries([]));
  }, [user?.id]);

  return (
    <div className="rounded-2xl bg-background/40 backdrop-blur-xl border border-border p-4 space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <BookOpen className="h-4 w-4 text-primary" /> Sita Journal
      </div>
      {entries.length === 0 ? (
        <p className="text-xs text-muted-foreground">No reflections yet — comes online after the first nightly run.</p>
      ) : (
        <ul className="space-y-2">
          {entries.slice(0, 3).map((e) => (
            <li key={e.id} className="text-xs text-foreground/80">
              <div className="font-medium">{e.entry_date}</div>
              <div className="text-muted-foreground truncate">{e.summary?.headline ?? "—"}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}