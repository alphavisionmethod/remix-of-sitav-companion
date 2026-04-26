// SITA OS — CRM Finance Linkage Component (Phase 4: live)
// Cross-domain integration: CRM ↔ Finance OS via crm_customer_link bridge.
// Reads real customers + invoices for a contact (or company) and offers a
// "Bill this contact" CTA that hands off to QuotesWorkspace with the
// crm_contact_id pre-filled.

import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Receipt, AlertTriangle, Clock, CheckCircle, CreditCard,
  Banknote, Sparkles, ExternalLink, FileText, Plus, Link2, ArrowRight,
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { fromTable } from "@/lib/supabase-helpers";
import { useAuth } from "@/contexts/AuthContext";
import { setLinkedContext } from "@/platform/sita/components/sita/CrossAppAction";
import { toast } from "sonner";

interface InvoiceRow {
  id: string;
  invoice_number: string | null;
  amount_cents: number | null;
  status: string;
  issued_at: string | null;
  due_at: string | null;
  paid_at: string | null;
  customer_id: string | null;
  crm_contact_id: string | null;
  crm_company_id: string | null;
}

interface QuoteRow {
  id: string;
  title: string | null;
  amount_cents: number | null;
  status: string;
  expires_at: string | null;
  created_at: string;
  customer_id: string | null;
  crm_contact_id: string | null;
  crm_company_id: string | null;
  converted_invoice_id: string | null;
}

interface CRMFinanceLinkageProps {
  entityType: "contact" | "company";
  entityId: string;
  entityName: string;
  healthScore?: number;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  paid:    { label: "Paid",    color: "bg-green-500/15 text-green-400 border-green-500/25",   icon: <CheckCircle className="h-3 w-3" /> },
  sent:    { label: "Sent",    color: "bg-yellow-500/15 text-yellow-400 border-yellow-500/25", icon: <Clock className="h-3 w-3" /> },
  pending: { label: "Pending", color: "bg-yellow-500/15 text-yellow-400 border-yellow-500/25", icon: <Clock className="h-3 w-3" /> },
  overdue: { label: "Overdue", color: "bg-red-500/15 text-red-400 border-red-500/25",         icon: <AlertTriangle className="h-3 w-3" /> },
  partial: { label: "Partial", color: "bg-orange-500/15 text-orange-400 border-orange-500/25", icon: <CreditCard className="h-3 w-3" /> },
  draft:   { label: "Draft",   color: "bg-muted text-muted-foreground border-border/50",       icon: <Receipt className="h-3 w-3" /> },
};

function statusOf(inv: InvoiceRow): string {
  if (inv.status === "paid") return "paid";
  if (inv.due_at && new Date(inv.due_at) < new Date() && inv.status !== "paid") return "overdue";
  return inv.status || "draft";
}

export function CRMFinanceLinkage({ entityType, entityId, entityName, healthScore }: CRMFinanceLinkageProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Step 1: find any linked customer ids via the bridge.
  const linksQuery = useQuery({
    queryKey: ["crm-customer-link", entityType, entityId, user?.id],
    enabled: !!user && entityType === "contact",
    queryFn: async () => {
      const { data, error } = await fromTable("crm_customer_link")
        .select("id, customer_id, link_source, created_at, customers(display_name, primary_email)")
        .eq("user_id", user!.id)
        .eq("crm_contact_id", entityId)
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return (data ?? []) as Array<{
        id: string;
        customer_id: string;
        link_source: string;
        created_at: string;
        customers: { display_name: string; primary_email: string | null } | null;
      }>;
    },
  });

  const customerIds = useMemo(
    () => Array.from(new Set((linksQuery.data ?? []).map((l) => l.customer_id))),
    [linksQuery.data],
  );

  // Step 2: pull invoices that match either crm_contact_id directly or the linked customer ids.
  const invoicesQuery = useQuery<InvoiceRow[]>({
    queryKey: ["crm-finance-linkage:invoices", entityType, entityId, customerIds, user?.id],
    enabled: !!user,
    queryFn: async () => {
      if (!user) return [];
      // Build OR filter: crm_contact_id eq, or customer_id in list.
      const filters: string[] = [];
      if (entityType === "contact") filters.push(`crm_contact_id.eq.${entityId}`);
      if (entityType === "company") filters.push(`crm_company_id.eq.${entityId}`);
      if (customerIds.length > 0) filters.push(`customer_id.in.(${customerIds.join(",")})`);
      if (filters.length === 0) return [];
      const { data, error } = await fromTable("invoices")
        .select("id, invoice_number, amount_cents, status, issued_at, due_at, paid_at, customer_id, crm_contact_id, crm_company_id")
        .eq("user_id", user.id)
        .or(filters.join(","))
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw new Error(error.message);
      return (data ?? []) as InvoiceRow[];
    },
  });

  // Step 3: pull quotes the same way.
  const quotesQuery = useQuery<QuoteRow[]>({
    queryKey: ["crm-finance-linkage:quotes", entityType, entityId, customerIds, user?.id],
    enabled: !!user,
    queryFn: async () => {
      if (!user) return [];
      const filters: string[] = [];
      if (entityType === "contact") filters.push(`crm_contact_id.eq.${entityId}`);
      if (entityType === "company") filters.push(`crm_company_id.eq.${entityId}`);
      if (customerIds.length > 0) filters.push(`customer_id.in.(${customerIds.join(",")})`);
      if (filters.length === 0) return [];
      const { data, error } = await fromTable("quotes")
        .select("id, title, amount_cents, status, expires_at, created_at, customer_id, crm_contact_id, crm_company_id, converted_invoice_id")
        .eq("user_id", user.id)
        .or(filters.join(","))
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw new Error(error.message);
      return (data ?? []) as QuoteRow[];
    },
  });

  const invoices = invoicesQuery.data ?? [];
  const quotes = quotesQuery.data ?? [];
  const links = linksQuery.data ?? [];

  const totalPaidCents = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + (i.amount_cents ?? 0), 0);
  const overdueInvoices = invoices.filter((i) => statusOf(i) === "overdue");
  const pendingInvoices = invoices.filter((i) => i.status !== "paid" && statusOf(i) !== "overdue");
  const totalOutstanding = [...overdueInvoices, ...pendingInvoices].reduce((s, i) => s + (i.amount_cents ?? 0), 0);

  const handleBill = () => {
    if (entityType !== "contact") {
      toast.info("Billing from companies coming next — open a contact for now");
      return;
    }
    setLinkedContext({
      entityType: "contact",
      entityId,
      entityLabel: entityName,
    });
    navigate("/business/quotes");
  };

  const isLoading = linksQuery.isLoading || invoicesQuery.isLoading || quotesQuery.isLoading;
  const hasAny = invoices.length > 0 || quotes.length > 0 || links.length > 0;

  return (
    <div className="space-y-4">
      {/* Bridge / actions header */}
      <Card className="border-border/50 bg-gradient-to-br from-card to-card/80">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Link2 className="h-4 w-4 text-primary" /> CRM ↔ Finance Bridge
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {entityType === "contact" ? (
            links.length > 0 ? (
              <div className="space-y-1.5">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Linked billing customer{links.length > 1 ? "s" : ""}</p>
                <ul className="space-y-1">
                  {links.map((l) => (
                    <li key={l.id} className="flex items-center gap-2 text-sm text-foreground">
                      <CheckCircle className="h-3.5 w-3.5 text-green-400 shrink-0" />
                      <span className="font-medium">{l.customers?.display_name ?? "Customer"}</span>
                      {l.customers?.primary_email && (
                        <span className="text-xs text-muted-foreground truncate">· {l.customers.primary_email}</span>
                      )}
                      <span className="ml-auto text-[10px] text-muted-foreground">{l.link_source.replace(/-/g, " ")}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-border/40 p-3 text-xs text-muted-foreground">
                No billing customer linked yet. Creating an invoice or quote will link one automatically.
              </div>
            )
          ) : (
            <p className="text-xs text-muted-foreground">
              Company-level billing rolls up from linked contacts.
            </p>
          )}

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="h-8 text-xs gap-1.5"
              onClick={handleBill}
              disabled={entityType !== "contact"}
            >
              <Plus className="h-3.5 w-3.5" /> Bill this {entityType}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1.5"
              onClick={() => navigate("/business/invoices")}
            >
              <ExternalLink className="h-3.5 w-3.5" /> Open Finance OS
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Revenue Snapshot — derived from real invoices */}
      <Card className="border-border/50 bg-card/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" /> Revenue Snapshot
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-muted/20 border border-border/30 text-center">
              <p className="text-lg font-bold text-foreground">${(totalPaidCents / 100).toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Paid (lifetime)</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/20 border border-border/30 text-center">
              <p className="text-lg font-bold text-foreground">${(totalOutstanding / 100).toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Outstanding</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/20 border border-border/30 text-center">
              <p className="text-lg font-bold text-foreground">{invoices.length}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Invoices</p>
            </div>
          </div>
          {!isLoading && !hasAny && (
            <p className="mt-3 text-xs text-muted-foreground text-center">
              No revenue data yet. Click "Bill this {entityType}" to draft the first quote.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Outstanding alert */}
      {overdueInvoices.length > 0 && (
        <div className="p-3 rounded-lg bg-red-500/8 border border-red-500/20 flex items-start gap-3">
          <AlertTriangle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-400">{overdueInvoices.length} Overdue Invoice{overdueInvoices.length > 1 ? "s" : ""}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              ${(overdueInvoices.reduce((s, i) => s + (i.amount_cents ?? 0), 0) / 100).toLocaleString()} outstanding
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="shrink-0 h-7 text-xs gap-1 border-red-500/30 text-red-400 hover:bg-red-500/10"
            onClick={() => navigate("/business/collections")}
          >
            Collections
          </Button>
        </div>
      )}

      {/* Invoice list */}
      <Card className="border-border/50 bg-card/50">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Receipt className="h-4 w-4 text-primary" /> Invoices
              {totalOutstanding > 0 && (
                <Badge variant="outline" className="text-[10px] bg-yellow-500/10 text-yellow-400 border-yellow-500/25">
                  ${(totalOutstanding / 100).toLocaleString()} outstanding
                </Badge>
              )}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <p className="p-4 text-xs text-muted-foreground">Loading…</p>
          ) : invoices.length === 0 ? (
            <p className="p-4 text-xs text-muted-foreground">No invoices yet for this {entityType}.</p>
          ) : (
            <div className="divide-y divide-border/30">
              {invoices.map((inv) => {
                const s = statusOf(inv);
                const cfg = STATUS_CONFIG[s] ?? STATUS_CONFIG.draft;
                const daysOverdue = s === "overdue" && inv.due_at ? differenceInDays(new Date(), new Date(inv.due_at)) : 0;
                return (
                  <button
                    key={inv.id}
                    onClick={() => {
                      setLinkedContext({ entityType: "invoice", entityId: inv.id, entityLabel: inv.invoice_number ?? "Invoice" });
                      navigate("/business/invoices");
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-muted/20 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border ${cfg.color}`}>
                          {cfg.icon} {cfg.label}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{inv.invoice_number ?? "(no number)"}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {inv.issued_at ? `Issued ${format(new Date(inv.issued_at), "MMM d")}` : "Not issued"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <p className="text-sm font-semibold text-foreground">${((inv.amount_cents ?? 0) / 100).toLocaleString()}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {s === "paid" && inv.paid_at ? `Paid ${format(new Date(inv.paid_at), "MMM d")}` :
                           s === "overdue" ? `${daysOverdue}d overdue` :
                           inv.due_at ? `Due ${format(new Date(inv.due_at), "MMM d")}` : "No due date"}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quote list */}
      <Card className="border-border/50 bg-card/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" /> Quotes
            <Badge variant="outline" className="text-[10px]">{quotes.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <p className="p-4 text-xs text-muted-foreground">Loading…</p>
          ) : quotes.length === 0 ? (
            <p className="p-4 text-xs text-muted-foreground">No quotes yet.</p>
          ) : (
            <div className="divide-y divide-border/30">
              {quotes.map((q) => (
                <button
                  key={q.id}
                  onClick={() => {
                    setLinkedContext({ entityType: "quote", entityId: q.id, entityLabel: q.title ?? "Quote" });
                    navigate("/business/quotes");
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-muted/20 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{q.title ?? "(Untitled quote)"}</p>
                      <p className="text-xs text-muted-foreground capitalize">{q.status}{q.converted_invoice_id ? " · invoiced" : ""}</p>
                    </div>
                    <div className="text-right shrink-0 ml-3 flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">${((q.amount_cents ?? 0) / 100).toLocaleString()}</p>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
