// ═══════════════════════════════════════════════════════════════
// SITA OS — Mobile Concierge Client
// Errands and personal flows. Mutations may queue.
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import { enqueueMobileMutation } from "./_base";

export const conciergeMobileClient = {
  async listErrands() {
    const { data, error } = await supabase
      .from("appointments")
      .select("id,title,category,status,appointment_date,owner")
      .eq("category", "errand")
      .order("appointment_date", { ascending: true })
      .limit(25);
    if (error) throw error;
    return data ?? [];
  },

  async completeErrand(id: string) {
    const queued = await enqueueMobileMutation({
      domain: "concierge",
      verb: "errand.complete",
      payload: { id, status: "done" },
      optimisticSnapshot: { id, status: "done" },
    });
    if (queued.queued) return queued;
    const { error } = await supabase.from("appointments").update({ status: "done" }).eq("id", id);
    if (error) throw error;
    return { queued: false } as const;
  },
};
