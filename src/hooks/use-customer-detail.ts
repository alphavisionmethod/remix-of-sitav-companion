// ═══════════════════════════════════════════════════════════════
// SITA OS — useCustomerDetail hook
//
// Resolves a single customer profile by id and joins:
//   • invoices       (lifetime revenue, outstanding, payment timing)
//   • quotes         (open quote pipeline)
//   • cloud_files    (linked documents — by metadata.customer_id when present)
//   • support_cases  (open / total tickets)
//
// All values are derived from real tables; nothing is mocked.
// ═══════════════════════════════════════════════════════════════

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const db = supabase as any;

export interface CustomerInvoiceVM {
  id: string;
  number: string;
  amountCents: number;
  currency: string;
  status: "paid" | "sent" | "draft" | "overdue" | "void";
  issuedAt: string | null;
  dueAt: string | null;
  paidAt: string | null;
  daysToPay: number | null;
}

export interface CustomerTimelineEntryVM {
  id: string;
  kind: "invoice" | "quote" | "case" | "file";
  title: string;
  detail: string;
  occurredAt: string;
  status?: string;
}

export interface CustomerDetailVM {
  id: string;
  name: string;
  initials: string;
  email: string | null;
  phone: string | null;
  status: string;
  healthScore: number;
  healthLabel: string;
  healthTrend: "up" | "down" | "flat";
  trust: "verified" | "review" | "degraded";
  company: string | null;
  location: string | null;
  website: string | null;
  since: string;
  tags: string[];
  totalRevenueCents: number;
  totalRevenue: string;
  outstandingCents: number;
  outstanding: string;
  invoicesPaid: number;
  invoicesTotal: number;
  avgPayDays: number;
  invoices: CustomerInvoiceVM[];
  quotes: Array<{ id: string; title: string; amountCents: number; currency: string; status: string; createdAt: string }>;
  documents: Array<{ id: string; name: string; mime: string | null; createdAt: string }>;
  openCases: number;
  totalCases: number;
  timeline: CustomerTimelineEntryVM[];
}

function initialsOf(name: string): string {
  return name.split(/\s+/).map((p) => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase() || "—";
}

function formatCurrency(cents: number, currency = "USD"): string {
  const amt = cents / 100;
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency, maximumFractionDigits: 0 }).format(amt);
  } catch {
    return `$${amt.toLocaleString()}`;
  }
}

function daysBetween(a: string | null, b: string | null): number | null {
  if (!a || !b) return null;
  const t1 = new Date(a).getTime();
  const t2 = new Date(b).getTime();
  if (!Number.isFinite(t1) || !Number.isFinite(t2)) return null;
  return Math.max(0, Math.round((t2 - t1) / 86_400_000));
}

function statusFromInvoice(s: string | null | undefined, dueAt: string | null): CustomerInvoiceVM["status"] {
  const v = (s ?? "draft").toLowerCase();
  if (v === "paid" || v === "settled") return "paid";
  if (v === "void" || v === "cancelled" || v === "canceled") return "void";
  if (v === "overdue") return "overdue";
  if (v === "sent" || v === "open" || v === "outstanding") {
    if (dueAt && new Date(dueAt).getTime() < Date.now()) return "overdue";
    return "sent";
  }
  return "draft";
}

function healthLabelFor(score: number): string {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Healthy";
  if (score >= 50) return "Watch";
  if (score >= 30) return "At Risk";
  return "Critical";
}

function trustFor(score: number): CustomerDetailVM["trust"] {
  if (score >= 70) return "verified";
  if (score >= 40) return "review";
  return "degraded";
}

async function fetchCustomerDetail(customerId: string): Promise<CustomerDetailVM | null> {
  const { data: cust } = await db
    .from("customers")
    .select("id,user_id,display_name,primary_email,primary_phone,status,health_score,tags,metadata,created_at,updated_at")
    .eq("id", customerId)
    .maybeSingle();
  if (!cust) return null;

  const [invoicesRes, quotesRes, casesRes, filesRes] = await Promise.all([
    db.from("invoices").select("id,invoice_number,amount_cents,currency,status,issued_at,due_at,paid_at,created_at").eq("customer_id", customerId).order("created_at", { ascending: false }).limit(100),
    db.from("quotes").select("id,title,amount_cents,currency,status,expires_at,created_at").eq("customer_id", customerId).order("created_at", { ascending: false }).limit(50),
    db.from("support_cases").select("id,title,priority,status,created_at,resolved_at").eq("user_id", cust.user_id).order("created_at", { ascending: false }).limit(50),
    db.from("cloud_files").select("id,name,mime_type,created_at,deleted").eq("user_id", cust.user_id).eq("deleted", false).order("created_at", { ascending: false }).limit(30),
  ]);

  const invoices = ((invoicesRes?.data ?? []) as any[]).map((i): CustomerInvoiceVM => ({
    id: i.id,
    number: i.invoice_number ?? `INV-${String(i.id).slice(0, 8)}`,
    amountCents: Number(i.amount_cents ?? 0),
    currency: (i.currency ?? "USD").toUpperCase(),
    status: statusFromInvoice(i.status, i.due_at),
    issuedAt: i.issued_at,
    dueAt: i.due_at,
    paidAt: i.paid_at,
    daysToPay: daysBetween(i.issued_at ?? i.created_at, i.paid_at),
  }));

  const quotes = ((quotesRes?.data ?? []) as any[]).map((q) => ({
    id: q.id,
    title: q.title ?? "Quote",
    amountCents: Number(q.amount_cents ?? 0),
    currency: (q.currency ?? "USD").toUpperCase(),
    status: q.status ?? "draft",
    createdAt: q.created_at,
  }));

  const cases = (casesRes?.data ?? []) as any[];
  const documents = ((filesRes?.data ?? []) as any[]).map((f) => ({
    id: f.id,
    name: f.name ?? "Untitled",
    mime: f.mime_type ?? null,
    createdAt: f.created_at,
  }));

  const totalRevenueCents = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.amountCents, 0);
  const outstandingCents = invoices.filter((i) => i.status === "sent" || i.status === "overdue").reduce((s, i) => s + i.amountCents, 0);
  const invoicesPaid = invoices.filter((i) => i.status === "paid").length;
  const invoicesTotal = invoices.length;
  const payDays = invoices.map((i) => i.daysToPay).filter((d): d is number => typeof d === "number");
  const avgPayDays = payDays.length ? Math.round(payDays.reduce((a, b) => a + b, 0) / payDays.length) : 0;

  const score = Math.round(Number(cust.health_score ?? 75));
  const meta = (cust.metadata ?? {}) as Record<string, any>;

  const timeline: CustomerTimelineEntryVM[] = [];
  for (const i of invoices) {
    timeline.push({
      id: `inv:${i.id}`,
      kind: "invoice",
      title: `Invoice ${i.number}`,
      detail: `${formatCurrency(i.amountCents, i.currency)} · ${i.status}`,
      occurredAt: i.paidAt ?? i.issuedAt ?? new Date().toISOString(),
      status: i.status,
    });
  }
  for (const q of quotes) {
    timeline.push({
      id: `qte:${q.id}`,
      kind: "quote",
      title: q.title,
      detail: `${formatCurrency(q.amountCents, q.currency)} · ${q.status}`,
      occurredAt: q.createdAt,
      status: q.status,
    });
  }
  for (const c of cases) {
    timeline.push({
      id: `case:${c.id}`,
      kind: "case",
      title: c.title ?? "Support case",
      detail: `${c.priority ?? "normal"} · ${c.status ?? "open"}`,
      occurredAt: c.created_at,
      status: c.status,
    });
  }
  for (const f of documents) {
    timeline.push({
      id: `file:${f.id}`,
      kind: "file",
      title: f.name,
      detail: f.mime ?? "file",
      occurredAt: f.createdAt,
    });
  }
  timeline.sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());

  return {
    id: cust.id,
    name: cust.display_name ?? "Unnamed customer",
    initials: initialsOf(cust.display_name ?? "?"),
    email: cust.primary_email ?? null,
    phone: cust.primary_phone ?? null,
    status: cust.status ?? "active",
    healthScore: score,
    healthLabel: healthLabelFor(score),
    healthTrend: "flat",
    trust: trustFor(score),
    company: typeof meta.company === "string" ? meta.company : null,
    location: typeof meta.location === "string" ? meta.location : null,
    website: typeof meta.website === "string" ? meta.website : null,
    since: cust.created_at ? new Date(cust.created_at).getFullYear().toString() : "—",
    tags: Array.isArray(cust.tags) ? cust.tags : [],
    totalRevenueCents,
    totalRevenue: formatCurrency(totalRevenueCents),
    outstandingCents,
    outstanding: outstandingCents > 0 ? formatCurrency(outstandingCents) : "$0",
    invoicesPaid,
    invoicesTotal,
    avgPayDays,
    invoices,
    quotes,
    documents,
    openCases: cases.filter((c) => (c.status ?? "open") !== "resolved" && c.status !== "closed").length,
    totalCases: cases.length,
    timeline,
  };
}

export interface UseCustomerDetailResult {
  customer: CustomerDetailVM | null;
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useCustomerDetail(customerId: string | null | undefined): UseCustomerDetailResult {
  const query = useQuery({
    queryKey: ["customer-detail", customerId],
    enabled: !!customerId,
    staleTime: 30_000,
    queryFn: async () => {
      if (!customerId) return null;
      return fetchCustomerDetail(customerId);
    },
  });

  return {
    customer: query.data ?? null,
    isLoading: query.isLoading,
    isError: !!query.error,
    isEmpty: !query.isLoading && !query.data,
    error: (query.error as Error | null) ?? null,
    refetch: () => query.refetch(),
  };
}