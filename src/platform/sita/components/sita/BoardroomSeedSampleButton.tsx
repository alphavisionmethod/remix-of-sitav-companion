// ═══════════════════════════════════════════════════════════════
// SITA OS — Admin: Seed Boardroom Sample Data
// Admin-only button (gated by useIsAdmin) that inserts one row each
// into notifications + ai_workforce_recommendations + ai_workforce_approval_queue
// to prove the live Boardroom loop end-to-end without manual SQL.
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { useIsAdmin } from "@/platform/auth/hooks/useIsAdmin";
import { useAuth } from "@/contexts/AuthContext";
import { useDataMode } from "@/contexts/DataModeContext";
import { fromTable } from "@/lib/supabase-helpers";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function BoardroomSeedSampleButton() {
  const isAdmin = useIsAdmin();
  const { user } = useAuth();
  const { isDemoMode } = useDataMode();
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);

  // Hide for non-admins, demo mode, or unauthenticated
  if (!isAdmin || isDemoMode || !user) return null;

  const handleSeed = async () => {
    setBusy(true);
    const stamp = new Date().toISOString();
    const tag = stamp.slice(11, 19);
    try {
      const [n, r, a] = await Promise.all([
        fromTable("notifications").insert({
          user_id: user.id,
          title: `Boardroom sample notification ${tag}`,
          body: "Inserted by admin seed action — proves live Boardroom loop.",
          urgency: "normal",
          domain: "business",
          read: false,
        }),
        fromTable("ai_workforce_recommendations").insert({
          user_id: user.id,
          role_key: "rex",
          task_key: "boardroom_seed",
          domain: "business",
          title: `Sample recommendation ${tag}`,
          summary: "Admin-seeded recommendation to verify live Boardroom wiring.",
          severity: "low",
          confidence: 0.85,
          status: "new",
          lifecycle_status: "open",
          execution_required: false,
          outcome_verification_required: false,
        }),
        fromTable("ai_workforce_approval_queue").insert({
          user_id: user.id,
          title: `Sample approval ${tag}`,
          summary: "Admin-seeded approval to verify Boardroom approval pipeline.",
          priority: "normal",
          status: "pending",
          escalated: false,
        }),
      ]);

      const errors = [n.error, r.error, a.error].filter(Boolean);
      if (errors.length > 0) {
        console.error("[BoardroomSeedSampleButton] errors:", errors);
        toast.error(`Partial seed: ${errors.length} of 3 failed. See console.`);
      } else {
        toast.success("Seeded 1 notification + 1 recommendation + 1 approval.");
      }

      // Force refresh of all boardroom queries
      await qc.invalidateQueries({ queryKey: ["boardroom-notifications"] });
      await qc.invalidateQueries({ queryKey: ["boardroom-recommendations"] });
      await qc.invalidateQueries({ queryKey: ["boardroom-approvals"] });
    } catch (e) {
      console.error("[BoardroomSeedSampleButton] exception:", e);
      toast.error("Seed failed. See console.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      onClick={handleSeed}
      disabled={busy}
      data-testid="boardroom-seed-sample"
      title="Admin: insert one sample notification + recommendation + approval"
      className="inline-flex items-center gap-1.5 rounded-lg border border-accent/30 bg-accent/10 px-2.5 py-1 text-[10px] font-semibold text-accent hover:bg-accent/20 transition-colors disabled:opacity-50"
    >
      {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
      {busy ? "Seeding…" : "Seed sample"}
    </button>
  );
}
