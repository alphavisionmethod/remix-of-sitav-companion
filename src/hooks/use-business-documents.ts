// ═══════════════════════════════════════════════════════════════
// SITA OS — useBusinessDocuments hook
//
// Aggregates the four document streams that surface in the
// BusinessDocuments page into a single normalized view-model:
//
//   • cloud_files   → attachments + images
//   • invoices      → invoice records
//   • quotes        → quote records
//   • proposals     → proposal records
//
// All sources are user-scoped; RLS protects them server-side.
// Empty results return [] (honest empty), not fixtures.
// ═══════════════════════════════════════════════════════════════

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const db = supabase as any;

export type BusinessDocumentCategory =
  | "quote"
  | "invoice"
  | "contract"
  | "proposal"
  | "attachment"
  | "image"
  | "intake"
  | "receipt";

export type BusinessDocumentType =
  | "pdf"
  | "doc"
  | "image"
  | "spreadsheet"
  | "contract"
  | "other";

export type BusinessDocumentStatus =
  | "active"
  | "draft"
  | "sent"
  | "signed"
  | "expired"
  | "archived";

export interface BusinessDocumentVM {
  id: string;
  name: string;
  type: BusinessDocumentType;
  category: BusinessDocumentCategory;
  size: string;
  sizeBytes: number;
  uploadedAt: string;
  uploadedAtISO: string;
  uploadedBy: string;
  linkedEntity?: string;
  linkedEntityType?: string;
  status: BusinessDocumentStatus;
  starred: boolean;
  previewable: boolean;
  tags: string[];
}

const BYTES_KB = 1024;
const BYTES_MB = BYTES_KB * 1024;
const BYTES_GB = BYTES_MB * 1024;

function formatSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "—";
  if (bytes >= BYTES_GB) return `${(bytes / BYTES_GB).toFixed(1)} GB`;
  if (bytes >= BYTES_MB) return `${(bytes / BYTES_MB).toFixed(1)} MB`;
  if (bytes >= BYTES_KB) return `${Math.round(bytes / BYTES_KB)} KB`;
  return `${bytes} B`;
}

function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) return "—";
  const diff = Date.now() - then;
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "just now";
  if (min < 60) return `${min} min${min === 1 ? "" : "s"} ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hour${hr === 1 ? "" : "s"} ago`;
  const d = Math.floor(hr / 24);
  if (d < 7) return `${d} day${d === 1 ? "" : "s"} ago`;
  const w = Math.floor(d / 7);
  if (w < 5) return `${w} week${w === 1 ? "" : "s"} ago`;
  const mo = Math.floor(d / 30);
  if (mo < 12) return `${mo} month${mo === 1 ? "" : "s"} ago`;
  return `${Math.floor(d / 365)} year${Math.floor(d / 365) === 1 ? "" : "s"} ago`;
}

function typeFromMime(mime: string | null | undefined): BusinessDocumentType {
  const m = (mime ?? "").toLowerCase();
  if (m.includes("pdf")) return "pdf";
  if (m.startsWith("image/")) return "image";
  if (m.includes("sheet") || m.includes("excel") || m.includes("csv")) return "spreadsheet";
  if (m.includes("word") || m.includes("document") || m.includes("text")) return "doc";
  return "other";
}

function categoryFromCloudFile(name: string, mime: string | null | undefined): BusinessDocumentCategory {
  const n = (name ?? "").toLowerCase();
  if (n.includes("invoice") || n.startsWith("inv-") || n.startsWith("inv_")) return "invoice";
  if (n.includes("quote") || n.startsWith("q-") || n.startsWith("qte")) return "quote";
  if (n.includes("contract") || n.includes("agreement") || n.includes("nda") || n.includes("msa")) return "contract";
  if (n.includes("proposal")) return "proposal";
  if (n.includes("receipt")) return "receipt";
  if (n.includes("intake")) return "intake";
  if ((mime ?? "").toLowerCase().startsWith("image/")) return "image";
  return "attachment";
}

function statusFromInvoice(s: string | null | undefined): BusinessDocumentStatus {
  const v = (s ?? "draft").toLowerCase();
  if (v === "sent" || v === "open" || v === "outstanding") return "sent";
  if (v === "paid" || v === "settled" || v === "signed") return "signed";
  if (v === "void" || v === "cancelled" || v === "canceled") return "archived";
  if (v === "overdue") return "expired";
  return "draft";
}

function statusFromQuote(s: string | null | undefined): BusinessDocumentStatus {
  const v = (s ?? "draft").toLowerCase();
  if (v === "sent") return "sent";
  if (v === "accepted" || v === "won" || v === "signed") return "signed";
  if (v === "rejected" || v === "lost") return "archived";
  if (v === "expired") return "expired";
  return "draft";
}

function statusFromProposal(s: string | null | undefined): BusinessDocumentStatus {
  const v = (s ?? "draft").toLowerCase();
  if (v === "sent" || v === "viewed") return "sent";
  if (v === "accepted" || v === "signed") return "signed";
  if (v === "rejected" || v === "expired") return v === "expired" ? "expired" : "archived";
  return "draft";
}

async function fetchAll(userId: string) {
  // Run reads in parallel — they're independent reads, no shared writes.
  const [filesRes, invoicesRes, quotesRes, proposalsRes] = await Promise.all([
    db.from("cloud_files").select("id,name,size,mime_type,created_at,updated_at,deleted").eq("user_id", userId).eq("deleted", false).order("created_at", { ascending: false }).limit(200),
    db.from("invoices").select("id,invoice_number,amount_cents,currency,status,issued_at,due_at,created_at,customer_id").eq("user_id", userId).order("created_at", { ascending: false }).limit(200),
    db.from("quotes").select("id,title,amount_cents,currency,status,expires_at,created_at,customer_id").eq("user_id", userId).order("created_at", { ascending: false }).limit(200),
    db.from("proposals").select("id,title,scope,status,sent_at,decided_at,created_at,customer_id").eq("user_id", userId).order("created_at", { ascending: false }).limit(200),
  ]);
  return {
    files: (filesRes?.data ?? []) as any[],
    invoices: (invoicesRes?.data ?? []) as any[],
    quotes: (quotesRes?.data ?? []) as any[],
    proposals: (proposalsRes?.data ?? []) as any[],
  };
}

export interface UseBusinessDocumentsResult {
  documents: BusinessDocumentVM[];
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  error: Error | null;
  refetch: () => void;
  counts: {
    total: number;
    quotes: number;
    invoices: number;
    contracts: number;
    proposals: number;
    attachments: number;
    images: number;
    expired: number;
    signed: number;
  };
}

export function useBusinessDocuments(): UseBusinessDocumentsResult {
  const userQuery = useQuery({
    queryKey: ["auth", "user"],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      return data.user ?? null;
    },
    staleTime: 60_000,
  });
  const userId = userQuery.data?.id ?? null;

  const docsQuery = useQuery({
    queryKey: ["business-documents", userId],
    enabled: !!userId,
    staleTime: 30_000,
    queryFn: async () => {
      if (!userId) return { files: [], invoices: [], quotes: [], proposals: [] };
      return fetchAll(userId);
    },
  });

  const documents = useMemo<BusinessDocumentVM[]>(() => {
    const data = docsQuery.data;
    if (!data) return [];
    const out: BusinessDocumentVM[] = [];

    for (const f of data.files) {
      const category = categoryFromCloudFile(f.name, f.mime_type);
      out.push({
        id: `file:${f.id}`,
        name: f.name ?? "Untitled",
        type: typeFromMime(f.mime_type),
        category,
        size: formatSize(Number(f.size ?? 0)),
        sizeBytes: Number(f.size ?? 0),
        uploadedAt: formatRelative(f.created_at),
        uploadedAtISO: f.created_at,
        uploadedBy: "You",
        status: "active",
        starred: false,
        previewable: typeFromMime(f.mime_type) !== "other",
        tags: [category, ...(f.mime_type ? [String(f.mime_type).split("/")[1] ?? "file"] : [])].filter(Boolean) as string[],
      });
    }

    for (const i of data.invoices) {
      const num = i.invoice_number ?? `INV-${String(i.id).slice(0, 8)}`;
      const cur = (i.currency ?? "USD").toUpperCase();
      const amt = Number(i.amount_cents ?? 0) / 100;
      out.push({
        id: `invoice:${i.id}`,
        name: `${num} — ${cur} ${amt.toFixed(2)}`,
        type: "pdf",
        category: "invoice",
        size: "—",
        sizeBytes: 0,
        uploadedAt: formatRelative(i.created_at),
        uploadedAtISO: i.created_at,
        uploadedBy: "System",
        linkedEntity: i.customer_id ? `Customer ${String(i.customer_id).slice(0, 8)}` : undefined,
        linkedEntityType: i.customer_id ? "Customer" : undefined,
        status: statusFromInvoice(i.status),
        starred: false,
        previewable: true,
        tags: ["invoice", cur.toLowerCase(), i.status ?? "draft"].filter(Boolean) as string[],
      });
    }

    for (const q of data.quotes) {
      const cur = (q.currency ?? "USD").toUpperCase();
      const amt = Number(q.amount_cents ?? 0) / 100;
      out.push({
        id: `quote:${q.id}`,
        name: `${q.title ?? "Quote"} — ${cur} ${amt.toFixed(2)}`,
        type: "pdf",
        category: "quote",
        size: "—",
        sizeBytes: 0,
        uploadedAt: formatRelative(q.created_at),
        uploadedAtISO: q.created_at,
        uploadedBy: "You",
        linkedEntity: q.customer_id ? `Customer ${String(q.customer_id).slice(0, 8)}` : undefined,
        linkedEntityType: q.customer_id ? "Customer" : undefined,
        status: statusFromQuote(q.status),
        starred: false,
        previewable: true,
        tags: ["quote", q.status ?? "draft"].filter(Boolean) as string[],
      });
    }

    for (const p of data.proposals) {
      out.push({
        id: `proposal:${p.id}`,
        name: p.title ?? "Proposal",
        type: "doc",
        category: "proposal",
        size: "—",
        sizeBytes: 0,
        uploadedAt: formatRelative(p.created_at),
        uploadedAtISO: p.created_at,
        uploadedBy: "You",
        linkedEntity: p.customer_id ? `Customer ${String(p.customer_id).slice(0, 8)}` : undefined,
        linkedEntityType: p.customer_id ? "Customer" : undefined,
        status: statusFromProposal(p.status),
        starred: false,
        previewable: true,
        tags: ["proposal", p.status ?? "draft"].filter(Boolean) as string[],
      });
    }

    out.sort((a, b) => new Date(b.uploadedAtISO).getTime() - new Date(a.uploadedAtISO).getTime());
    return out;
  }, [docsQuery.data]);

  const counts = useMemo(() => ({
    total: documents.length,
    quotes: documents.filter((d) => d.category === "quote" || d.category === "proposal").length,
    invoices: documents.filter((d) => d.category === "invoice" || d.category === "receipt").length,
    contracts: documents.filter((d) => d.category === "contract").length,
    proposals: documents.filter((d) => d.category === "proposal").length,
    attachments: documents.filter((d) => d.category === "attachment" || d.category === "intake").length,
    images: documents.filter((d) => d.type === "image").length,
    expired: documents.filter((d) => d.status === "expired").length,
    signed: documents.filter((d) => d.status === "signed").length,
  }), [documents]);

  return {
    documents,
    isLoading: userQuery.isLoading || docsQuery.isLoading,
    isError: !!docsQuery.error,
    isEmpty: !docsQuery.isLoading && documents.length === 0,
    error: (docsQuery.error as Error | null) ?? null,
    refetch: () => docsQuery.refetch(),
    counts,
  };
}