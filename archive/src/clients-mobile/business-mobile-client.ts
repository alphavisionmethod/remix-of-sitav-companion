// ═══════════════════════════════════════════════════════════════
// SITA OS — Mobile Business Client
// Mutations may queue (lightweight CRM updates).
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import { enqueueMobileMutation } from "./_base";

export const businessMobileClient = {
  async listAppointments() {
    const { data, error } = await supabase
      .from("appointments")
      .select("id,title,appointment_date,status,location")
      .order("appointment_date", { ascending: true })
      .limit(25);
    if (error) throw error;
    return data ?? [];
  },

  async markAppointmentStatus(id: string, status: string) {
    const queued = await enqueueMobileMutation({
      domain: "business",
      verb: "appointment.markStatus",
      payload: { id, status },
      optimisticSnapshot: { id, status },
    });
    if (queued.queued) return queued;
    const { error } = await supabase.from("appointments").update({ status }).eq("id", id);
    if (error) throw error;
    return { queued: false } as const;
  },
};
