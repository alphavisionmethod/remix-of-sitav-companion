// SITA OS — Phase 10 client hooks: PDF, e-sign, comm dispatch, calendar sync.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { syncAppointmentEverywhere } from "@/lib/business/appointment-calendar-sync";
import { fromTable } from "@/lib/supabase-helpers";

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
      toast.success(
        d.byte_size
          ? `PDF generated (${Math.round(d.byte_size / 1024)} KB) — use Download to open it`
          : "PDF generated — use Download to open it",
      );
    },
    onError: (e: Error) => toast.error(`PDF failed: ${e.message}`),
  });
}

// ── Download an invoice PDF from its stored verifiable path ──
// Honest: only works if a PDF has actually been generated. The
// signed URL is short-lived (60s) and minted on demand.
export function useDownloadInvoicePdf() {
  return useMutation({
    mutationFn: async (invoice_id: string): Promise<{ url: string; path: string }> => {
      const { data: inv, error } = await fromTable("invoices")
        .select("metadata")
        .eq("id", invoice_id)
        .maybeSingle();
      if (error) throw new Error(error.message);
      const meta = (inv?.metadata ?? {}) as Record<string, unknown>;
      const path = (meta.pdf_path as string | undefined) ?? null;
      if (!path) {
        throw new Error("No PDF on file — generate one first");
      }
      const { data: signed, error: sErr } = await supabase.storage
        .from("business-documents")
        .createSignedUrl(path, 120);
      if (sErr || !signed?.signedUrl) {
        throw new Error(sErr?.message ?? "Could not sign PDF URL");
      }
      return { url: signed.signedUrl, path };
    },
    onSuccess: ({ url }) => {
      window.open(url, "_blank", "noopener,noreferrer");
    },
    onError: (e: Error) => toast.error(e.message),
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

// ── Pending signatures for a document ───────────────────────
export function usePendingSignatures(
  document_type: "invoice" | "proposal" | "contract",
  document_id: string | undefined,
) {
  return useQuery({
    queryKey: ["pending-signatures", document_type, document_id],
    queryFn: async () => {
      if (!document_id) return [];
      const { data, error } = await fromTable("document_signatures")
        .select("id, signer_email, signer_name, sign_token, status, sent_at, expires_at")
        .eq("document_type", document_type)
        .eq("document_id", document_id)
        .in("status", ["pending", "sent", "viewed"])
        .order("created_at", { ascending: false });
      if (error) return [];
      return data ?? [];
    },
    enabled: !!document_id,
    staleTime: 5_000,
  });
}

// ── Resend a pending signature link ─────────────────────────
// Composes the public sign URL from sign_token, dispatches via
// business-dispatch-comm, and stamps the signature row so we
// have a verifiable resend audit trail.
export function useResendSignatureLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      signature_id: string;
      document_type: "invoice" | "proposal" | "contract";
      document_id: string;
      document_label?: string;
    }) => {
      const { data: sig, error } = await fromTable("document_signatures")
        .select("id, signer_email, signer_name, sign_token, status, evidence")
        .eq("id", params.signature_id)
        .maybeSingle();
      if (error || !sig) throw new Error(error?.message ?? "Signature not found");
      if (!sig.sign_token) throw new Error("Signature link is missing a token");
      if (!sig.signer_email) throw new Error("No signer email on file");
      if (!["pending", "sent", "viewed"].includes(String(sig.status))) {
        throw new Error(`Cannot resend — signature is ${sig.status}`);
      }
      const sign_url = `${window.location.origin}/sign/${sig.sign_token}`;
      const label = params.document_label ?? `${params.document_type} ${params.document_id.slice(0, 8)}`;
      const dispatchResp = await invoke<{
        ok: boolean;
        status: "sent" | "failed" | "skipped";
        provider: string;
        deferred: boolean;
        error_message: string | null;
      }>("business-dispatch-comm", {
        channel: "email",
        recipient: sig.signer_email,
        subject: `Reminder: please sign ${label}`,
        message_text:
          `Hi${sig.signer_name ? ` ${sig.signer_name}` : ""},\n\n` +
          `This is a reminder that ${label} is awaiting your signature.\n\n` +
          `Open the secure signing link below:\n${sign_url}\n\n` +
          `Thanks.`,
        subject_type: params.document_type,
        subject_id: params.document_id,
      });
      const prevEvidence = (sig.evidence as Record<string, unknown> | null) ?? {};
      const resends = Array.isArray(prevEvidence.resends) ? prevEvidence.resends as unknown[] : [];
      await fromTable("document_signatures")
        .update({
          evidence: {
            ...prevEvidence,
            resends: [
              ...resends,
              {
                at: new Date().toISOString(),
                provider: dispatchResp.provider,
                status: dispatchResp.status,
                deferred: dispatchResp.deferred,
                error: dispatchResp.error_message,
              },
            ],
            last_resend_at: new Date().toISOString(),
          },
          sent_at: new Date().toISOString(),
        })
        .eq("id", sig.id);
      return { dispatch: dispatchResp, sign_url };
    },
    onSuccess: ({ dispatch }) => {
      qc.invalidateQueries({ queryKey: ["pending-signatures"] });
      qc.invalidateQueries({ queryKey: ["dispatch-log"] });
      if (dispatch.deferred) {
        toast.info(`${dispatch.provider} not connected — resend logged as deferred.`);
      } else if (dispatch.status === "sent") {
        toast.success(`Signature link resent via ${dispatch.provider}`);
      } else {
        toast.error(dispatch.error_message ?? "Resend failed");
      }
    },
    onError: (e: Error) => toast.error(`Resend failed: ${e.message}`),
  });
}

// ── Calendar sync status reader for one or many appointments ──
export interface AppointmentSyncBadgeData {
  provider: "internal" | "google" | "outlook";
  status: "pending" | "synced" | "failed" | "conflict" | "deleted";
  lastSyncedAt: string | null;
  lastError: string | null;
}

export function useAppointmentSyncStatus(appointmentIds: string[]) {
  const key = [...appointmentIds].sort().join(",");
  return useQuery({
    queryKey: ["appointment-sync-status", key],
    queryFn: async () => {
      const map = new Map<string, AppointmentSyncBadgeData[]>();
      if (!appointmentIds.length) return map;
      const { data, error } = await fromTable("calendar_sync_links")
        .select("appointment_id, provider, sync_status, last_synced_at, last_error")
        .in("appointment_id", appointmentIds);
      if (error || !data) return map;
      for (const row of data) {
        const id = row.appointment_id as string;
        const list = map.get(id) ?? [];
        list.push({
          provider: row.provider as AppointmentSyncBadgeData["provider"],
          status: row.sync_status as AppointmentSyncBadgeData["status"],
          lastSyncedAt: (row.last_synced_at as string | null) ?? null,
          lastError: (row.last_error as string | null) ?? null,
        });
        map.set(id, list);
      }
      return map;
    },
    enabled: appointmentIds.length > 0,
    staleTime: 10_000,
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