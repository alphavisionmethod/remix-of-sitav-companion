import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { useAuth } from "@/contexts/AuthContext";
import { emitRegisteredTrustAction } from "@/platform/trust/registry/emit-registered";
import type { TrustActionKey } from "@/platform/trust/registry/trust-action-registry";
import {
  withApprovalGate,
  type ApprovalGateResult,
} from "@/lib/trust/request-approval";
import { emitClientReceipt } from "@/lib/trust/emit-client-receipt";

function useUserId() {
  const { user } = useAuth();
  return user?.id;
}

// ─── Trust wrapper (Phase 7.4) ──────────────────────────────
// Mirrors the CRM pattern in `use-crm-data.ts` so every concierge
// mutation produces a registry-driven receipt and respects authority
// gating (block / ask / pre-approved). Pure pass-through on success.
function withTrust<TArgs, TResult>(
  action: TrustActionKey,
  fn: (args: TArgs) => Promise<TResult>,
  describe?: (args: TArgs) => string,
) {
  return async (args: TArgs): Promise<TResult> => {
    const entityRef = deriveConciergeEntityRef(action, args);
    const decision = await emitRegisteredTrustAction(action, {
      payload: {
        args: args as unknown as Record<string, unknown>,
        ...(entityRef ? { entity_ref: entityRef } : {}),
      },
      impactSummary: describe?.(args),
    });
    if (decision.blocked) {
      throw new Error(
        decision.blockedReason ??
          `Action ${action} blocked by trust authority engine.`,
      );
    }
    return fn(args);
  };
}

// ─── Concierge entity-ref derivation (Phase 7.4) ────────────
// Action keys follow `concierge.<entity>.<verb>`. We map the prefix
// to a canonical proof entity_type and pull `id` from the args. Pure
// function — no IO. The proof trail uses these to filter receipts.
const CONCIERGE_ACTION_KEY_TO_ENTITY: Record<string, string> = {
  "concierge.errand": "errand",
  "concierge.grocery_list": "grocery_list",
  "concierge.grocery_item": "grocery_item",
  "concierge.gift": "gift",
  "concierge.provider": "provider",
  "concierge.appointment": "appointment",
  "concierge.automation": "automation",
  "concierge.document": "document",
  "concierge.recurring": "recurring_obligation",
  "concierge.travel": "travel_plan",
  "concierge.reservation": "reservation",
  "concierge.contact": "contact",
  "concierge.household_task": "household_task",
};

export function deriveConciergeEntityRef(
  action: string,
  args: unknown,
): { entity_type: string; entity_id?: string; related?: Record<string, string> } | null {
  const prefix = Object.keys(CONCIERGE_ACTION_KEY_TO_ENTITY)
    .filter((k) => action === k || action.startsWith(`${k}.`))
    .sort((a, b) => b.length - a.length)[0];
  if (!prefix) return null;
  const entity_type = CONCIERGE_ACTION_KEY_TO_ENTITY[prefix];

  const a = (args ?? {}) as Record<string, unknown>;
  const id =
    typeof a.id === "string" ? a.id :
    typeof (a as { entity_id?: unknown }).entity_id === "string"
      ? (a as { entity_id: string }).entity_id
      : undefined;

  const related: Record<string, string> = {};
  if (typeof a.list_id === "string") related.list_id = a.list_id;
  if (typeof a.bundle_id === "string") related.bundle_id = a.bundle_id;
  if (typeof a.household_id === "string") related.household_id = a.household_id;
  if (typeof a.provider_id === "string") related.provider_id = a.provider_id;
  if (typeof a.appointment_id === "string") related.appointment_id = a.appointment_id;
  if (typeof a.errand_id === "string") related.errand_id = a.errand_id;

  return {
    entity_type,
    ...(id ? { entity_id: id } : {}),
    ...(Object.keys(related).length ? { related } : {}),
  };
}

export function useTravelPlans() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["travel-plans", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await fromTable("travel_plans").select("*").eq("user_id", uid!).order("start_date");
      return data ?? [];
    },
  });
}

export function useGroceryLists() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["grocery-lists", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await fromTable("grocery_lists").select("*").eq("user_id", uid!).order("created_at", { ascending: false });
      return data ?? [];
    },
  });
}

export function useGroceryItems(listId?: string) {
  const uid = useUserId();
  return useQuery({
    queryKey: ["grocery-items", uid, listId],
    enabled: !!uid && !!listId,
    queryFn: async () => {
      const { data } = await fromTable("grocery_items").select("*").eq("user_id", uid!).eq("list_id", listId!);
      return data ?? [];
    },
  });
}

export function useServiceProvidersList() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["service-providers-list", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await fromTable("service_providers_list").select("*").eq("user_id", uid!);
      return data ?? [];
    },
  });
}

export function useSchoolActivities() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["school-activities", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await fromTable("school_activities").select("*").eq("user_id", uid!);
      return data ?? [];
    },
  });
}

export function useGiftTracker() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["gift-tracker", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await fromTable("gift_tracker").select("*").eq("user_id", uid!).order("target_date");
      return data ?? [];
    },
  });
}

export function useAppointments() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["appointments", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await fromTable("appointments").select("*").eq("user_id", uid!).order("appointment_date");
      return data ?? [];
    },
  });
}

// ═══ New Concierge Hooks ═══
// Canonical table: `errands` (Phase 24.1 — replaces legacy `concierge_errands`)

export function useErrands() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["errands", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await fromTable("errands").select("*").eq("user_id", uid!).order("due_date");
      return data ?? [];
    },
  });
}

export function useCreateErrand() {
  const uid = useUserId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: withTrust(
      "concierge.errand.create",
      async (errand: {
        title: string;
        location?: string;
        priority?: string;
        estimated_minutes?: number;
        combinable?: boolean;
        due_date?: string;
        bundle_id?: string;
        notes?: string;
        status?: string;
      }) => {
        const { data, error } = await fromTable("errands")
          .insert({ ...errand, user_id: uid! })
          .select()
          .single();
        if (error) throw error;
        return data;
      },
      (e) => `Create errand: ${e.title}`,
    ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["errands"] }),
  });
}

export function useUpdateErrand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: withTrust(
      "concierge.errand.update",
      async ({ id, ...updates }: { id: string; [key: string]: any }) => {
        const { data, error } = await fromTable("errands")
          .update(updates)
          .eq("id", id)
          .select()
          .single();
        if (error) throw error;
        return data;
      },
      (a) => `Update errand ${a.id}`,
    ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["errands"] }),
  });
}

export function useDeleteErrand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: withTrust(
      "concierge.errand.delete",
      async (id: string) => {
        const { error } = await fromTable("errands").delete().eq("id", id);
        if (error) throw error;
      },
      (id) => `Delete errand ${id}`,
    ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["errands"] }),
  });
}

// ─── Bulk errand delete (Phase 7.4) ─────────────────────────
// High blast radius — many household tasks could disappear at once.
// Routed through the canonical approval queue. On approval the queued
// item is executed via the canonical approve→bindExecution chain; this
// hook is the *request* surface only and does not execute inline at
// or above the gate threshold.
export interface BulkDeleteErrandsInput {
  ids: string[];
  reason?: string;
  /** Demo bypass — when true the gate is skipped and the deletes run inline. */
  skip?: boolean;
}

export function useBulkDeleteErrands() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      input: BulkDeleteErrandsInput,
    ): Promise<ApprovalGateResult<{ deleted: number }>> => {
      const { ids, reason, skip } = input;
      if (!ids.length) return { gated: false, result: { deleted: 0 } };

      // Risk scales with batch size.
      const riskTier = ids.length >= 25 ? "critical" : "high";

      const gated = await withApprovalGate(
        async () => {
          // Inline execution path (only reached when skip=true or queue
          // unavailable). Emit one canonical receipt per row so the
          // proof trail stays complete.
          let deleted = 0;
          for (const id of ids) {
            try {
              const { error } = await fromTable("errands").delete().eq("id", id);
              if (error) throw error;
              await emitClientReceipt({
                actionType: "concierge.errand.bulk_delete",
                summary: `Bulk delete errand ${id}`,
                payload: {
                  id,
                  entity_ref: { entity_type: "errand", entity_id: id },
                },
                riskTier: "high",
                status: "executed",
              });
              deleted += 1;
            } catch (err) {
              await emitClientReceipt({
                actionType: "concierge.errand.bulk_delete",
                summary: `Bulk delete errand ${id} (failed)`,
                payload: { id },
                riskTier: "high",
                status: "failed",
                metadata: { error: err instanceof Error ? err.message : String(err) },
              });
            }
          }
          return { deleted };
        },
        {
          actionType: "concierge.errand.bulk_delete",
          title: `Bulk delete ${ids.length} errand${ids.length === 1 ? "" : "s"}`,
          justification:
            reason ??
            `Operator requested bulk deletion of ${ids.length} errands. Action is irreversible.`,
          riskTier,
          payload: { ids, count: ids.length },
          launchImplications: `Removes ${ids.length} errand records from the household queue.`,
          skip,
        },
      );
      return gated;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["errands"] }),
  });
}

export function useRecurringObligations() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["concierge-recurring-obligations", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await fromTable("concierge_recurring_obligations").select("*").eq("user_id", uid!).order("next_due");
      return data ?? [];
    },
  });
}

export function useConciergeAutomations() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["concierge-automations", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await fromTable("concierge_automations").select("*").eq("user_id", uid!).order("created_at", { ascending: false });
      return data ?? [];
    },
  });
}

export function useConciergeDocuments() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["concierge-documents", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await fromTable("concierge_documents").select("*").eq("user_id", uid!).order("created_at", { ascending: false });
      return data ?? [];
    },
  });
}

// ─── Grocery mutations (Phase 7.4) ──────────────────────────
export function useCreateGroceryList() {
  const uid = useUserId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: withTrust(
      "concierge.grocery_list.create",
      async (input: { name: string; household_id?: string; notes?: string }) => {
        const { data, error } = await fromTable("grocery_lists")
          .insert({ ...input, user_id: uid! })
          .select()
          .single();
        if (error) throw error;
        return data;
      },
      (i) => `Create grocery list "${i.name}"`,
    ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["grocery-lists"] }),
  });
}

export function useCreateGroceryItem() {
  const uid = useUserId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: withTrust(
      "concierge.grocery_item.create",
      async (input: { list_id: string; name: string; quantity?: number; status?: string; notes?: string }) => {
        const { data, error } = await fromTable("grocery_items")
          .insert({ ...input, user_id: uid! })
          .select()
          .single();
        if (error) throw error;
        return data;
      },
      (i) => `Add grocery item "${i.name}"`,
    ),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["grocery-items"] });
      if (vars?.list_id) qc.invalidateQueries({ queryKey: ["grocery-items", undefined, vars.list_id] });
    },
  });
}

export function useUpdateGroceryItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: withTrust(
      "concierge.grocery_item.update",
      async ({ id, ...updates }: { id: string; [key: string]: any }) => {
        const { data, error } = await fromTable("grocery_items")
          .update(updates)
          .eq("id", id)
          .select()
          .single();
        if (error) throw error;
        return data;
      },
      (a) => `Update grocery item ${a.id}`,
    ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["grocery-items"] }),
  });
}

export function useDeleteGroceryItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: withTrust(
      "concierge.grocery_item.delete",
      async (id: string) => {
        const { error } = await fromTable("grocery_items").delete().eq("id", id);
        if (error) throw error;
      },
      (id) => `Remove grocery item ${id}`,
    ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["grocery-items"] }),
  });
}

// ─── Gift tracker mutations (Phase 7.4) ─────────────────────
export function useCreateGiftPlan() {
  const uid = useUserId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: withTrust(
      "concierge.gift.create",
      async (input: {
        recipient: string;
        occasion?: string;
        budget_cents?: number;
        target_date?: string;
        status?: string;
        notes?: string;
      }) => {
        const { data, error } = await fromTable("gift_tracker")
          .insert({ ...input, user_id: uid! })
          .select()
          .single();
        if (error) throw error;
        return data;
      },
      (i) => `Track gift for ${i.recipient}`,
    ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["gift-tracker"] }),
  });
}

export function useUpdateGiftPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: withTrust(
      "concierge.gift.update",
      async ({ id, ...updates }: { id: string; [key: string]: any }) => {
        const { data, error } = await fromTable("gift_tracker")
          .update(updates)
          .eq("id", id)
          .select()
          .single();
        if (error) throw error;
        return data;
      },
      (a) => `Update gift ${a.id}`,
    ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["gift-tracker"] }),
  });
}

// ─── Service-provider mutations (Phase 7.4) ─────────────────
export function useCreateServiceProvider() {
  const uid = useUserId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: withTrust(
      "concierge.provider.create",
      async (input: { name: string; category?: string; phone?: string; email?: string; rating?: number; notes?: string }) => {
        const { data, error } = await fromTable("service_providers_list")
          .insert({ ...input, user_id: uid! })
          .select()
          .single();
        if (error) throw error;
        return data;
      },
      (i) => `Add provider "${i.name}"`,
    ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["service-providers-list"] }),
  });
}

export function useUpdateServiceProvider() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: withTrust(
      "concierge.provider.update",
      async ({ id, ...updates }: { id: string; [key: string]: any }) => {
        const { data, error } = await fromTable("service_providers_list")
          .update(updates)
          .eq("id", id)
          .select()
          .single();
        if (error) throw error;
        return data;
      },
      (a) => `Update provider ${a.id}`,
    ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["service-providers-list"] }),
  });
}

export function useDeleteServiceProvider() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: withTrust(
      "concierge.provider.delete",
      async (id: string) => {
        const { error } = await fromTable("service_providers_list").delete().eq("id", id);
        if (error) throw error;
      },
      (id) => `Remove provider ${id}`,
    ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["service-providers-list"] }),
  });
}

// ─── Concierge appointment mutations (Phase 7.4) ────────────
// Distinct from `health.appointment.*` — household / non-medical scope.
export function useCreateConciergeAppointment() {
  const uid = useUserId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: withTrust(
      "concierge.appointment.create",
      async (input: {
        title: string;
        appointment_date: string;
        location?: string;
        provider_id?: string;
        notes?: string;
        status?: string;
      }) => {
        const { data, error } = await fromTable("appointments")
          .insert({ ...input, user_id: uid! })
          .select()
          .single();
        if (error) throw error;
        return data;
      },
      (i) => `Create appointment "${i.title}"`,
    ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["appointments"] }),
  });
}

export function useUpdateConciergeAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: withTrust(
      "concierge.appointment.update",
      async ({ id, ...updates }: { id: string; [key: string]: any }) => {
        const { data, error } = await fromTable("appointments")
          .update(updates)
          .eq("id", id)
          .select()
          .single();
        if (error) throw error;
        return data;
      },
      (a) => `Update appointment ${a.id}`,
    ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["appointments"] }),
  });
}

export function useCancelConciergeAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: withTrust(
      "concierge.appointment.cancel",
      async (id: string) => {
        const { data, error } = await fromTable("appointments")
          .update({ status: "cancelled" })
          .eq("id", id)
          .select()
          .single();
        if (error) throw error;
        return data;
      },
      (id) => `Cancel appointment ${id}`,
    ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["appointments"] }),
  });
}

// ─── Concierge automation mutations (Phase 7.4) ─────────────
// Activation is high-risk and routed through the approval gate; create,
// pause, delete are emitted as receipts only.
export function useCreateConciergeAutomation() {
  const uid = useUserId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: withTrust(
      "concierge.automation.create",
      async (input: {
        name: string;
        trigger: string;
        action: string;
        active?: boolean;
        config?: Record<string, unknown>;
      }) => {
        const { data, error } = await fromTable("concierge_automations")
          .insert({ ...input, user_id: uid! })
          .select()
          .single();
        if (error) throw error;
        return data;
      },
      (i) => `Create automation "${i.name}"`,
    ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["concierge-automations"] }),
  });
}

export function usePauseConciergeAutomation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: withTrust(
      "concierge.automation.pause",
      async (id: string) => {
        const { data, error } = await fromTable("concierge_automations")
          .update({ active: false })
          .eq("id", id)
          .select()
          .single();
        if (error) throw error;
        return data;
      },
      (id) => `Pause automation ${id}`,
    ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["concierge-automations"] }),
  });
}

export function useDeleteConciergeAutomation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: withTrust(
      "concierge.automation.delete",
      async (id: string) => {
        const { error } = await fromTable("concierge_automations").delete().eq("id", id);
        if (error) throw error;
      },
      (id) => `Delete automation ${id}`,
    ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["concierge-automations"] }),
  });
}

export interface ActivateConciergeAutomationInput {
  id: string;
  name?: string;
  reason?: string;
  /** Demo bypass — when true the gate is skipped and the activation runs inline. */
  skip?: boolean;
}

/**
 * Activate a concierge automation. Routed through the approval queue
 * because an active automation can take future actions on the
 * household's behalf without further confirmation.
 */
export function useActivateConciergeAutomation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      input: ActivateConciergeAutomationInput,
    ): Promise<ApprovalGateResult<{ id: string }>> => {
      const { id, name, reason, skip } = input;
      const gated = await withApprovalGate(
        async () => {
          const { error } = await fromTable("concierge_automations")
            .update({ active: true })
            .eq("id", id);
          if (error) throw error;
          await emitClientReceipt({
            actionType: "concierge.automation.activate",
            summary: `Activate concierge automation ${name ?? id}`,
            payload: { id, entity_ref: { entity_type: "automation", entity_id: id } },
            riskTier: "high",
            status: "executed",
          });
          return { id };
        },
        {
          actionType: "concierge.automation.activate",
          title: `Activate concierge automation${name ? `: ${name}` : ""}`,
          justification:
            reason ??
            "Activating an automation grants it standing authority to act on the household's behalf.",
          riskTier: "high",
          payload: { id, name },
          launchImplications:
            "Future executions of this automation will run without per-action confirmation until paused.",
          skip,
        },
      );
      return gated;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["concierge-automations"] }),
  });
}

// ─── Concierge document mutations (Phase 7.4) ───────────────
export function useCreateConciergeDocument() {
  const uid = useUserId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: withTrust(
      "concierge.document.create",
      async (input: {
        title: string;
        category?: string;
        url?: string;
        related_entity_type?: string;
        related_entity_id?: string;
        notes?: string;
      }) => {
        const { data, error } = await fromTable("concierge_documents")
          .insert({ ...input, user_id: uid! })
          .select()
          .single();
        if (error) throw error;
        return data;
      },
      (i) => `Attach document "${i.title}"`,
    ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["concierge-documents"] }),
  });
}

export function useDeleteConciergeDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: withTrust(
      "concierge.document.delete",
      async (id: string) => {
        const { error } = await fromTable("concierge_documents").delete().eq("id", id);
        if (error) throw error;
      },
      (id) => `Delete document ${id}`,
    ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["concierge-documents"] }),
  });
}

// ─── Recurring obligation mutations (Phase 7.4) ─────────────
export function useCreateRecurringObligation() {
  const uid = useUserId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: withTrust(
      "concierge.recurring.create",
      async (input: {
        title: string;
        cadence: string;
        next_due?: string;
        amount_cents?: number;
        category?: string;
        notes?: string;
      }) => {
        const { data, error } = await fromTable("concierge_recurring_obligations")
          .insert({ ...input, user_id: uid! })
          .select()
          .single();
        if (error) throw error;
        return data;
      },
      (i) => `Create recurring "${i.title}"`,
    ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["concierge-recurring-obligations"] }),
  });
}

export function useUpdateRecurringObligation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: withTrust(
      "concierge.recurring.update",
      async ({ id, ...updates }: { id: string; [key: string]: any }) => {
        const { data, error } = await fromTable("concierge_recurring_obligations")
          .update(updates)
          .eq("id", id)
          .select()
          .single();
        if (error) throw error;
        return data;
      },
      (a) => `Update recurring ${a.id}`,
    ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["concierge-recurring-obligations"] }),
  });
}
