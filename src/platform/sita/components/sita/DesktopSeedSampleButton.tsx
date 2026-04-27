// ═══════════════════════════════════════════════════════════════
// SITA OS — Admin: Seed Desktop Widgets Sample Data (C-009)
// Admin-only button (gated by useIsAdmin + !isDemoMode) that inserts
// one row each into deals, holdings, household_tasks, calendar_events,
// notifications. Mirrors C-007/C-008 seed pattern. Lives inside
// WidgetPicker; invalidates desktop-* query keys to refresh widgets.
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { useIsAdmin } from "@/platform/auth/hooks/useIsAdmin";
import { useAuth } from "@/contexts/AuthContext";
import { useDataMode } from "@/contexts/DataModeContext";
import { fromTable } from "@/lib/supabase-helpers";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function DesktopSeedSampleButton() {
  const isAdmin = useIsAdmin();
  const { user } = useAuth();
  const { isDemoMode } = useDataMode();
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);

  if (!isAdmin || isDemoMode || !user) return null;

  const handleSeed = async () => {
    setBusy(true);
    const tag = new Date().toISOString().slice(11, 19);
    try {
      const today = new Date().toISOString().slice(0, 10);
      const results = await Promise.all([
        fromTable("deals").insert({
          user_id: user.id,
          title: `Sample deal ${tag}`,
          value_cents: 1_500_000,
          stage: "proposal",
          status: "proposal",
          probability: 0.5,
        }),
        fromTable("holdings").insert({
          user_id: user.id,
          symbol: "DEMO",
          quantity: 10,
          avg_cost_cents: 10_000,
          current_value_cents: 12_000,
          status: "open",
          metadata: { sector: "Tech" },
        }),
        fromTable("household_tasks").insert({
          user_id: user.id,
          title: `Sample household task ${tag}`,
          status: "pending",
          due_date: today,
          metadata: { priority: "medium" },
        }),
        fromTable("calendar_events").insert({
          user_id: user.id,
          title: `Sample event ${tag}`,
          event_date: today,
          start_time: new Date(Date.now() + 60 * 60_000).toISOString(),
          domain: "business",
          event_type: "meeting",
          source: "manual",
        }),
        fromTable("notifications").insert({
          user_id: user.id,
          title: `Sample desktop notification ${tag}`,
          body: "Inserted by admin desktop seed action.",
          urgency: "medium",
          domain: "business",
          read: false,
        }),
      ]);

      const errors = results.map((r) => r.error).filter(Boolean);
      if (errors.length > 0) {
        console.error("[DesktopSeedSampleButton] errors:", errors);
        toast.error(`Partial seed: ${errors.length} of 5 failed. See console.`);
      } else {
        toast.success("Seeded 1 deal + 1 holding + 1 task + 1 event + 1 notification.");
      }

      // Refresh all desktop widget queries
      await qc.invalidateQueries({ predicate: (q) => Array.isArray(q.queryKey) && typeof q.queryKey[0] === "string" && (q.queryKey[0] as string).startsWith("desktop-") });
    } catch (e) {
      console.error("[DesktopSeedSampleButton] exception:", e);
      toast.error("Seed failed. See console.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      onClick={handleSeed}
      disabled={busy}
      data-testid="desktop-seed-sample"
      title="Admin: insert one sample row into deals + holdings + tasks + calendar + notifications"
      className="inline-flex items-center gap-1.5 rounded-lg border border-amber-400/30 bg-amber-400/10 px-2.5 py-1 text-[11px] font-semibold text-amber-200 hover:bg-amber-400/20 transition-colors disabled:opacity-50"
    >
      {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
      {busy ? "Seeding…" : "Seed sample data"}
    </button>
  );
}
