// ═══════════════════════════════════════════════════════════════
// SITA OS — Health Signal Mutations
// Consent toggles + readiness state overrides
// ═══════════════════════════════════════════════════════════════

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable, fromDynamicTable } from "@/lib/supabase-helpers";
import { toast } from "sonner";

export function useToggleSignalConsent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ signalType, consentScope, enabled }: { signalType: string; consentScope: string; enabled: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      if (enabled) {
        const { error } = await fromTable("health_signal_consents")
          .upsert({
            user_id: user.id,
            signal_category: signalType,
            consented: true,
            consent_granted_at: new Date().toISOString(),
            consent_revoked_at: null,
            share_with_advisors: consentScope === "advisors",
            share_with_routing: consentScope === "routing",
          }, { onConflict: "user_id,signal_category" });
        if (error) throw error;
      } else {
        const { error } = await fromTable("health_signal_consents")
          .update({ consent_revoked_at: new Date().toISOString(), consented: false })
          .eq("user_id", user.id)
          .eq("signal_category", signalType);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["health-signal-consents"] });
      toast.success("Consent updated");
    },
    onError: (e: Error) => toast.error(`Failed: ${e.message}`),
  });
}

export function useUpdateReadinessState() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, readinessLevel }: { id: string; readinessLevel: string }) => {
      const { error } = await fromDynamicTable("readiness_states")
        .update({ readiness_level: readinessLevel })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["readiness-states"] });
      toast.success("Readiness state updated");
    },
    onError: (e: Error) => toast.error(`Failed: ${e.message}`),
  });
}
