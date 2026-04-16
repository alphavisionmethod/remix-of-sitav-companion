// ═══════════════════════════════════════════════════════════════
// SITA OS — Mobile Proof Client
// Proof is immutable. Mobile reads only.
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";

export const proofMobileClient = {
  async listRecent(limit = 30) {
    const { data, error } = await supabase
      .from("boardroom_decision_receipts")
      .select("id,approved_motion,rationale_summary,status,created_at")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data ?? [];
  },
};
