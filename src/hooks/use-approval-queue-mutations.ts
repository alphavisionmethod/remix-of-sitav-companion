import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { toast } from "sonner";
import { emitLoopCompletion } from "@/hooks/use-flagship-loop-proof";

export function useApprovalQueue(status?: string) {
  return useQuery({
    queryKey: ["approval-queue", status],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      let q = fromTable("approval_queue").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50);
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
      const { error } = await (supabase as any)
        .from("approval_queue")
        .update({ status: "approved", reviewed_by: user?.id, decision_reason: reason || null, decided_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
      await emitLoopCompletion({
        loop_key: "admin-truth-recommendation-approval",
        step_key: "approval_decision",
        evidence: { approval_id: id, decision: "approved" },
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["approval-queue"] });
      qc.invalidateQueries({ queryKey: ["approvals"] });
      qc.invalidateQueries({ queryKey: ["admin-durable-state"] });
      toast.success("Approval granted");
    },
    onError: (e) => toast.error("Approve failed: " + e.message),
  });
}

export function useRejectApprovalItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await (supabase as any)
        .from("approval_queue")
        .update({ status: "rejected", reviewed_by: user?.id, decision_reason: reason || null, decided_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["approval-queue"] });
      qc.invalidateQueries({ queryKey: ["approvals"] });
      qc.invalidateQueries({ queryKey: ["admin-durable-state"] });
      toast.success("Approval rejected");
    },
    onError: (e) => toast.error("Reject failed: " + e.message),
  });
}

export function useDismissApprovalItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from("approval_queue")
        .update({ status: "dismissed", decided_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["approval-queue"] });
      qc.invalidateQueries({ queryKey: ["approvals"] });
      qc.invalidateQueries({ queryKey: ["admin-durable-state"] });
      toast.success("Item dismissed");
    },
    onError: (e) => toast.error("Dismiss failed: " + e.message),
  });
}
