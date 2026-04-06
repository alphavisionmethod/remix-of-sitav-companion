import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useApproveApprovalItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await (supabase as any)
        .from("approval_queue")
        .update({ status: "approved", reviewed_by: user?.id, review_notes: reason || null, reviewed_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
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
        .update({ status: "rejected", reviewed_by: user?.id, review_notes: reason || null, reviewed_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
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
        .update({ status: "dismissed", reviewed_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["approvals"] });
      qc.invalidateQueries({ queryKey: ["admin-durable-state"] });
      toast.success("Item dismissed");
    },
    onError: (e) => toast.error("Dismiss failed: " + e.message),
  });
}
