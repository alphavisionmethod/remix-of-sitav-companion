// ═══════════════════════════════════════════════════════════════
// SITA OS — Mobile Approvals Client
// Approvals are server-of-record. Mobile may READ offline; mutations
// (decide) require online + biometric. Never queued silently.
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import { sampleNetworkSnapshot } from "@/lib/mobile-platform";

export interface ApprovalDecisionInput {
  requestId: string;
  decision: "approved" | "rejected";
  rationale?: string;
  biometricToken: string;
}

export const approvalsMobileClient = {
  async listPending() {
    const { data, error } = await supabase
      .from("admin_action_confirmations")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw error;
    return data ?? [];
  },

  async decide(input: ApprovalDecisionInput): Promise<{ ok: true } | { ok: false; reason: string }> {
    if (sampleNetworkSnapshot().tier === "offline") {
      return { ok: false, reason: "Approvals require an online connection on mobile." };
    }
    if (!input.biometricToken) {
      return { ok: false, reason: "Biometric proof is required to decide an approval." };
    }
    const { error } = await supabase
      .from("admin_action_confirmations")
      .update({
        status: input.decision,
        ...(input.decision === "approved" ? { approved_at: new Date().toISOString() } : { rejected_at: new Date().toISOString() }),
      })
      .eq("id", input.requestId);
    if (error) return { ok: false, reason: error.message };
    return { ok: true };
  },
};
