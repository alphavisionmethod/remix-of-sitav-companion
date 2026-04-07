// ═══════════════════════════════════════════════════════════════
// SITA OS — Health Signal Mutations
// Consent toggles + readiness state overrides
// ═══════════════════════════════════════════════════════════════

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { toast } from "sonner";

export function useToggleSignalConsent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ signalType, consentScope, enabled }: { signalType: string; consentScope: string; enabled: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      if (enabled) {
        // Upsert: enable consent
        const { error } = await fromTable("health_signal_consents")
          .upsert({
            user_id: user.id,
            signal_type: signalType,
            consent_scope: consentScope,
            read_permission: true,
            revoked_at: null,
          }, { onConflict: "user_id,signal_type,consent_scope" });
        if (error) throw error;
      } else {
        // Revoke: set revoked_at
        const { error } = await fromTable("health_signal_consents")
          .update({ revoked_at: new Date().toISOString(), read_permission: false })
          .eq("user_id", user.id)
          .eq("signal_type", signalType)
          .eq("consent_scope", consentScope);
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
      const { error } = await fromTable("readiness_states")
        .update({ readiness_level: readinessLevel, assessed_at: new Date().toISOString() })
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
