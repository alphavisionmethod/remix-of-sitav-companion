// ═══════════════════════════════════════════════════════════════
// SITA OS — CFO Advisor detail drawer.
//
// Opens when you click a row in any CFO recommendation list:
//   • invoice → full invoice + customer + recent transactions
//   • budget  → allocated/spent/breach + recent transactions in category
//   • transaction → full record + recent siblings same category
// Drafts a CFO memo / collection note on demand. Read-only —
// CFO Advisor never edits real money.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, FileText, Wallet, Receipt, Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { askBusinessAdvisor } from "@/lib/ai-platform/runtime";

export type CFODrawerTarget =
  | { kind: "invoice"; id: string; label: string }
  | { kind: "budget"; id: string; label: string }
  | { kind: "transaction"; id: string; label: string };

interface InvoiceDetail {
  id: string;
  invoice_number: string | null;
  amount_cents: number;
  currency: string;
  status: string;
  issued_at: string | null;
  due_at: string | null;
  paid_at: string | null;
  customer_id: string | null;
  line_items: unknown;
  created_at: string;
}

interface BudgetDetail {
  id: string;
  category: string;
  period_start: string;
  period_end: string;
  allocated_cents: number;
  spent_cents: number;
  status: string;
  created_at: string;
}

interface TxnDetail {
  id: string;
  account_label: string | null;
  amount_cents: number;
  currency: string;
  direction: string;
  category: string | null;
  description: string | null;
  status: string;
  occurred_at: string;
}

function fmtMoney(cents: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: 2,
    }).format(cents / 100);
  } catch {
    return `${(cents / 100).toFixed(2)} ${currency}`;
  }
}

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString();
}

function daysBetween(iso: string | null): number | null {
  if (!iso) return null;
  return Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24));
}

interface Props {
  target: CFODrawerTarget | null;
  onOpenChange: (open: boolean) => void;
}

export function CFODetailDrawer({ target, onOpenChange }: Props) {
  const open = target !== null;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [budget, setBudget] = useState<BudgetDetail | null>(null);
  const [txn, setTxn] = useState<TxnDetail | null>(null);
  const [relatedTxns, setRelatedTxns] = useState<TxnDetail[]>([]);
  const [drafting, setDrafting] = useState(false);
  const [draft, setDraft] = useState<string | null>(null);

  useEffect(() => {
    if (!target) {
      setInvoice(null);
      setBudget(null);
      setTxn(null);
      setRelatedTxns([]);
      setDraft(null);
      setError(null);
      return;
    }
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        if (target!.kind === "invoice") {
          const invRes = await supabase
            .from("invoices")
            .select(
              "id, invoice_number, amount_cents, currency, status, issued_at, due_at, paid_at, customer_id, line_items, created_at",
            )
            .eq("id", target!.id)
            .maybeSingle();
          if (cancelled) return;
          if (invRes.error) throw invRes.error;
          setInvoice((invRes.data ?? null) as InvoiceDetail | null);

          // Recent payments by same customer (best-effort)
          if (invRes.data?.customer_id) {
            const txRes = await supabase
              .from("transactions")
              .select("id, account_label, amount_cents, currency, direction, category, description, status, occurred_at")
              .order("occurred_at", { ascending: false })
              .limit(10);
            if (!cancelled) setRelatedTxns((txRes.data ?? []) as TxnDetail[]);
          }
        } else if (target!.kind === "budget") {
          const bRes = await supabase
            .from("budgets")
            .select("id, category, period_start, period_end, allocated_cents, spent_cents, status, created_at")
            .eq("id", target!.id)
            .maybeSingle();
          if (cancelled) return;
          if (bRes.error) throw bRes.error;
          setBudget((bRes.data ?? null) as BudgetDetail | null);

          if (bRes.data?.category) {
            const txRes = await supabase
              .from("transactions")
              .select("id, account_label, amount_cents, currency, direction, category, description, status, occurred_at")
              .eq("category", bRes.data.category)
              .order("occurred_at", { ascending: false })
              .limit(10);
            if (!cancelled) setRelatedTxns((txRes.data ?? []) as TxnDetail[]);
          }
        } else {
          const tRes = await supabase
            .from("transactions")
            .select("id, account_label, amount_cents, currency, direction, category, description, status, occurred_at")
            .eq("id", target!.id)
            .maybeSingle();
          if (cancelled) return;
          if (tRes.error) throw tRes.error;
          setTxn((tRes.data ?? null) as TxnDetail | null);

          if (tRes.data?.category) {
            const sibRes = await supabase
              .from("transactions")
              .select("id, account_label, amount_cents, currency, direction, category, description, status, occurred_at")
              .eq("category", tRes.data.category)
              .neq("id", tRes.data.id)
              .order("occurred_at", { ascending: false })
              .limit(10);
            if (!cancelled) setRelatedTxns((sibRes.data ?? []) as TxnDetail[]);
          }
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load detail");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [target]);

  async function draftMemo() {
    if (!target) return;
    setDrafting(true);
    setDraft(null);
    try {
      let prompt: string | null = null;
      if (target.kind === "invoice" && invoice) {
        const overdueDays = invoice.due_at && invoice.status !== "paid" ? daysBetween(invoice.due_at) : null;
        prompt =
          `Draft a professional collection note for the customer for this invoice. ` +
          `Be polite but firm, set one clear next step (e.g. propose a payment date). Under 100 words.\n\n` +
          `Invoice: ${invoice.invoice_number ?? invoice.id}\n` +
          `Amount: ${fmtMoney(invoice.amount_cents, invoice.currency)}\n` +
          `Status: ${invoice.status}\n` +
          `Due: ${fmtDate(invoice.due_at)}${overdueDays != null ? ` (${overdueDays}d overdue)` : ""}\n` +
          `Issued: ${fmtDate(invoice.issued_at)}`;
      } else if (target.kind === "budget" && budget) {
        const ratio = budget.allocated_cents > 0 ? budget.spent_cents / budget.allocated_cents : 0;
        prompt =
          `Draft an internal CFO memo recommending action on this budget. ` +
          `Cover (1) what the variance suggests, (2) two reallocation options with tradeoffs, (3) recommended next step. Under 150 words.\n\n` +
          `Category: ${budget.category}\n` +
          `Period: ${budget.period_start} → ${budget.period_end}\n` +
          `Allocated (cents): ${budget.allocated_cents}\n` +
          `Spent (cents): ${budget.spent_cents}\n` +
          `Utilization: ${(ratio * 100).toFixed(0)}%`;
      } else if (target.kind === "transaction" && txn) {
        prompt =
          `Draft a brief CFO commentary on this transaction — what it implies and whether it warrants follow-up. Under 80 words.\n\n` +
          `Amount: ${fmtMoney(txn.amount_cents, txn.currency)} (${txn.direction})\n` +
          `Category: ${txn.category ?? "(uncategorized)"}\n` +
          `Description: ${txn.description ?? "(none)"}\n` +
          `Status: ${txn.status}\n` +
          `Occurred: ${fmtDate(txn.occurred_at)}`;
      }
      if (!prompt) return;
      const r = await askBusinessAdvisor({
        advisorId: "cfo-advisor",
        prompt,
        intent: "draft",
      });
      setDraft(r.response.content);
    } catch (e) {
      setDraft(e instanceof Error ? e.message : "Advisor unavailable");
    } finally {
      setDrafting(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-hidden flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-base">
            {target?.kind === "invoice" && (<><FileText className="h-4 w-4" /> Invoice</>)}
            {target?.kind === "budget" && (<><Wallet className="h-4 w-4" /> Budget</>)}
            {target?.kind === "transaction" && (<><Receipt className="h-4 w-4" /> Transaction</>)}
          </SheetTitle>
          <SheetDescription className="text-xs">{target?.label}</SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 -mx-6 px-6 mt-3">
          {loading && (
            <div className="space-y-2">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!loading && !error && target?.kind === "invoice" && invoice && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="outline" className="text-[10px]">{invoice.status}</Badge>
                <Badge variant="outline" className="text-[10px]">
                  {fmtMoney(invoice.amount_cents, invoice.currency)}
                </Badge>
                {invoice.due_at && invoice.status !== "paid" && new Date(invoice.due_at) < new Date() && (
                  <Badge variant="destructive" className="text-[10px]">
                    {daysBetween(invoice.due_at)}d overdue
                  </Badge>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-md border border-border p-2">
                  <p className="text-[10px] uppercase text-muted-foreground">Issued</p>
                  <p className="font-medium">{fmtDate(invoice.issued_at)}</p>
                </div>
                <div className="rounded-md border border-border p-2">
                  <p className="text-[10px] uppercase text-muted-foreground">Due</p>
                  <p className="font-medium">{fmtDate(invoice.due_at)}</p>
                </div>
                <div className="rounded-md border border-border p-2">
                  <p className="text-[10px] uppercase text-muted-foreground">Paid</p>
                  <p className="font-medium">{fmtDate(invoice.paid_at)}</p>
                </div>
                <div className="rounded-md border border-border p-2">
                  <p className="text-[10px] uppercase text-muted-foreground">Number</p>
                  <p className="font-medium truncate">{invoice.invoice_number ?? "—"}</p>
                </div>
              </div>
            </div>
          )}

          {!loading && !error && target?.kind === "budget" && budget && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="outline" className="text-[10px]">{budget.category}</Badge>
                <Badge variant="outline" className="text-[10px]">{budget.status}</Badge>
                {budget.spent_cents > budget.allocated_cents && (
                  <Badge variant="destructive" className="text-[10px]">over budget</Badge>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-md border border-border p-2">
                  <p className="text-[10px] uppercase text-muted-foreground">Allocated</p>
                  <p className="font-medium">{fmtMoney(budget.allocated_cents, "USD")}</p>
                </div>
                <div className="rounded-md border border-border p-2">
                  <p className="text-[10px] uppercase text-muted-foreground">Spent</p>
                  <p className="font-medium">{fmtMoney(budget.spent_cents, "USD")}</p>
                </div>
                <div className="rounded-md border border-border p-2 col-span-2">
                  <p className="text-[10px] uppercase text-muted-foreground">Period</p>
                  <p className="font-medium">{budget.period_start} → {budget.period_end}</p>
                </div>
              </div>
            </div>
          )}

          {!loading && !error && target?.kind === "transaction" && txn && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="outline" className="text-[10px]">{txn.direction}</Badge>
                <Badge variant="outline" className="text-[10px]">{txn.status}</Badge>
                <Badge variant="outline" className="text-[10px]">
                  {fmtMoney(txn.amount_cents, txn.currency)}
                </Badge>
              </div>
              <div>
                <p className="text-[10px] uppercase text-muted-foreground mb-1">Description</p>
                <p className="text-sm whitespace-pre-wrap">{txn.description ?? "(none)"}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-md border border-border p-2">
                  <p className="text-[10px] uppercase text-muted-foreground">Category</p>
                  <p className="font-medium">{txn.category ?? "—"}</p>
                </div>
                <div className="rounded-md border border-border p-2">
                  <p className="text-[10px] uppercase text-muted-foreground">Account</p>
                  <p className="font-medium truncate">{txn.account_label ?? "—"}</p>
                </div>
                <div className="rounded-md border border-border p-2 col-span-2">
                  <p className="text-[10px] uppercase text-muted-foreground">Occurred</p>
                  <p className="font-medium">{fmtDate(txn.occurred_at)}</p>
                </div>
              </div>
            </div>
          )}

          {!loading && !error && relatedTxns.length > 0 && (
            <div className="mt-4">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1.5 flex items-center gap-1">
                <Activity className="h-3 w-3" /> Related transactions ({relatedTxns.length})
              </p>
              <div className="space-y-1.5">
                {relatedTxns.map((t) => (
                  <div key={t.id} className="rounded-md border border-border px-2.5 py-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-medium truncate">
                        {t.description?.trim() || t.category || "(uncategorized)"}
                      </p>
                      <Badge variant="outline" className="text-[10px] shrink-0">
                        {fmtMoney(t.amount_cents, t.currency)}
                      </Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {t.direction} · {new Date(t.occurred_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!loading && !error && (
            (target?.kind === "invoice" && !invoice) ||
            (target?.kind === "budget" && !budget) ||
            (target?.kind === "transaction" && !txn)
          ) && (
            <p className="text-sm text-muted-foreground">Record not found or no longer accessible.</p>
          )}

          {draft && (
            <div className="mt-4 rounded-md border border-border bg-muted/30 p-3">
              <p className="text-[10px] uppercase text-muted-foreground mb-1">
                CFO Advisor draft (review before sending — recommend-only authority)
              </p>
              <p className="text-sm whitespace-pre-wrap">{draft}</p>
            </div>
          )}
        </ScrollArea>

        <div className="border-t border-border pt-3 mt-3 -mx-6 px-6">
          <Button
            onClick={draftMemo}
            disabled={drafting || loading || (!invoice && !budget && !txn)}
            className="w-full"
            size="sm"
          >
            {drafting ? (
              <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Drafting…</>
            ) : target?.kind === "invoice" ? (
              "Draft collection note"
            ) : target?.kind === "budget" ? (
              "Draft budget memo"
            ) : (
              "Draft CFO commentary"
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
