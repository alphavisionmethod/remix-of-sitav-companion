// SITA OS — Phase 10 client hooks: PDF, e-sign, comm dispatch, calendar sync.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { syncAppointmentEverywhere } from "@/lib/business/appointment-calendar-sync";

async function invoke<T>(name: string, body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke(name, { body });
  if (error) throw new Error(error.message || "Edge function error");
  return data as T;
}

// ── Invoice PDF ──────────────────────────────────────────────
export function useGenerateInvoicePdf() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (invoice_id: string) =>
      invoke<{ ok: boolean; pdf_path: string; signed_url: string | null; byte_size: number }>(
        "business-pdf-generate",
        { action: "invoice", invoice_id },
      ),
    onSuccess: (d) => {
      qc.invalidateQueries({ queryKey: ["invoices"] });
      qc.invalidateQueries({ queryKey: ["invoice-receipts"] });
      if (d.signed_url) {
        window.open(d.signed_url, "_blank", "noopener,noreferrer");
        toast.success(`PDF generated (${Math.round(d.byte_size / 1024)} KB)`);
      } else {
        toast.success("PDF generated");
      }
    },
    onError: (e: Error) => toast.error(`PDF failed: ${e.message}`),
  });
}

// ── E-sign request ──────────────────────────────────────────
export function useRequestSignature() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: {
      document_type: "proposal" | "contract" | "invoice";
      document_id: string;
      signer_email: string;
      signer_name?: string;
    }) => invoke<{ ok: boolean; signature_id: string; sign_url: string; expires_at: string }>(
      "business-esign-request",
      params,
    ),
    onSuccess: (d) => {
      qc.invalidateQueries({ queryKey: ["proposals"] });
      navigator.clipboard?.writeText(d.sign_url).catch(() => {});
      toast.success("Sign link copied to clipboard");
    },
    onError: (e: Error) => toast.error(`E-sign request failed: ${e.message}`),
  });
}

// ── Communication dispatch ─────────────────────────────────
export function useDispatchComm() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: {
      channel: "email" | "sms";
      recipient: string;
      subject?: string;
      message_text: string;
      message_html?: string;
      template_key?: string;
      subject_type?: string;
      subject_id?: string;
    }) => invoke<{
      ok: boolean; status: "sent" | "failed" | "skipped"; provider: string;
      deferred: boolean; error_message: string | null;
    }>("business-dispatch-comm", { subject_type: "ad_hoc", ...params }),
    onSuccess: (d) => {
      qc.invalidateQueries({ queryKey: ["invoice-receipts"] });
      qc.invalidateQueries({ queryKey: ["dispatch-log"] });
      if (d.deferred) {
        toast.info(`${d.provider} not connected — logged as deferred. Connect in Integrations.`);
      } else if (d.status === "sent") {
        toast.success(`Dispatched via ${d.provider}`);
      } else {
        toast.error(d.error_message ?? "Dispatch failed");
      }
    },
    onError: (e: Error) => toast.error(`Dispatch failed: ${e.message}`),
  });
}

// ── Calendar sync ──────────────────────────────────────────
export function useSyncAppointmentToCalendar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (appointmentId: string) => syncAppointmentEverywhere(appointmentId),
    onSuccess: (results) => {
      qc.invalidateQueries({ queryKey: ["unified-calendar"] });
      qc.invalidateQueries({ queryKey: ["appointments"] });
      qc.invalidateQueries({ queryKey: ["scheduled-appointments"] });
      const internal = results.find(r => r.provider === "internal");
      if (internal?.ok) toast.success("Synced to internal calendar");
      else toast.error(internal?.error ?? "Sync failed");
    },
    onError: (e: Error) => toast.error(`Sync failed: ${e.message}`),
  });
}

// ── Dispatch log reader (for proof trails) ─────────────────
export function useDispatchLog(subjectType: string, subjectId: string | undefined) {
  return useQuery({
    queryKey: ["dispatch-log", subjectType, subjectId],
    queryFn: async () => {
      if (!subjectId) return [];
      const { data, error } = await supabase
        .from("business_dispatch_log" as never)
        .select("id, channel, provider, recipient, status, error_message, created_at")
        .eq("subject_type", subjectType)
        .eq("subject_id", subjectId)
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) return [];
      return data ?? [];
    },
    enabled: !!subjectId,
    staleTime: 5_000,
  });
}