import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { emitLoopCompletion } from "@/hooks/use-flagship-loop-proof";
import { bindExecution } from "@/lib/services/rex/recommendation-engine";

const db = supabase as any;

export function useApprovalQueue(status?: string) {
  return useQuery({
    queryKey: ["approval-queue", status],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      let q = db
        .from("ai_workforce_approval_queue")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);
      if (status && status !== "all") q = q.eq("status", status);
      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    },
    staleTime: 15_000,
  });
}

export function useApproveApprovalItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      // 1. Mark approved on the canonical queue row
      const { data: updated, error } = await db
        .from("ai_workforce_approval_queue")
        .update({
          status: "approved",
          reviewer_user_id: user?.id,
          reviewer_comments: reason || null,
          decision_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select("id, recommendation_id")
        .maybeSingle();
      if (error) throw error;

      // 2. Receipt for the approval decision
      await emitLoopCompletion({
        loop_key: "admin-truth-recommendation-approval",
        step_key: "approval_decision",
        evidence: { approval_id: id, decision: "approved", recommendation_id: updated?.recommendation_id },
      });

      // 3. If linked to a recommendation, run the rest of the chain
      if (updated?.recommendation_id) {
        const { data: rec } = await db
          .from("ai_workforce_recommendations")
          .select("id, execution_required")
          .eq("id", updated.recommendation_id)
          .maybeSingle();
        if (rec?.execution_required) {
          try {
            await bindExecution(rec.id, id, { bindingType: "remediation_task", ownerTeam: "ops" });
          } catch (e) {
            console.error("[approval] bindExecution failed:", e);
          }
        }
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["approval-queue"] });
      qc.invalidateQueries({ queryKey: ["approvals"] });
      qc.invalidateQueries({ queryKey: ["pending-approvals"] });
      qc.invalidateQueries({ queryKey: ["admin-durable-state"] });
      qc.invalidateQueries({ queryKey: ["hq-queue"] });
      qc.invalidateQueries({ queryKey: ["rex02-approval-queue-stats"] });
      toast.success("Approval granted — execution bound");
    },
    onError: (e: Error) => toast.error("Approve failed: " + e.message),
  });
}

export function useRejectApprovalItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: updated, error } = await db
        .from("ai_workforce_approval_queue")
        .update({
          status: "rejected",
          reviewer_user_id: user?.id,
          reviewer_comments: reason || null,
          decision_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select("id, recommendation_id")
        .maybeSingle();
      if (error) throw error;

      if (updated?.recommendation_id) {
        await db
          .from("ai_workforce_recommendations")
          .update({
            lifecycle_status: "rejected",
            approval_decision_at: new Date().toISOString(),
            rejected_by_user_id: user?.id,
          })
          .eq("id", updated.recommendation_id);
      }

      await emitLoopCompletion({
        loop_key: "admin-truth-recommendation-approval",
        step_key: "approval_decision",
        evidence: { approval_id: id, decision: "rejected", recommendation_id: updated?.recommendation_id },
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["approval-queue"] });
      qc.invalidateQueries({ queryKey: ["approvals"] });
      qc.invalidateQueries({ queryKey: ["pending-approvals"] });
      qc.invalidateQueries({ queryKey: ["admin-durable-state"] });
      qc.invalidateQueries({ queryKey: ["hq-queue"] });
      qc.invalidateQueries({ queryKey: ["rex02-approval-queue-stats"] });
      toast.success("Approval rejected");
    },
    onError: (e: Error) => toast.error("Reject failed: " + e.message),
  });
}

export function useDismissApprovalItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await db
        .from("ai_workforce_approval_queue")
        .update({ status: "dismissed", decision_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["approval-queue"] });
      qc.invalidateQueries({ queryKey: ["approvals"] });
      qc.invalidateQueries({ queryKey: ["pending-approvals"] });
      qc.invalidateQueries({ queryKey: ["admin-durable-state"] });
      toast.success("Item dismissed");
    },
    onError: (e: Error) => toast.error("Dismiss failed: " + e.message),
  });
}
