// ═══════════════════════════════════════════════════════════════
// SITA OS — Business OS: Invoice Linking Service
// Links invoices to quotes and tracks conversion
// ═══════════════════════════════════════════════════════════════

import type { Invoice } from "@/domains/business";

export interface InvoiceLink {
  invoiceId: string;
  quoteId: string;
  proposalId: string;
  accountId: string;
  linkedAt: string;
  variance: number; // % difference from quote
}

export function linkInvoiceToQuote(invoice: Invoice, quoteId: string, quoteTotalCents: number): InvoiceLink {
  const invoiceCents = invoice.amount * 100;
  const variance = quoteTotalCents > 0 ? Math.round(((invoiceCents - quoteTotalCents) / quoteTotalCents) * 100) : 0;

  return {
    invoiceId: invoice.id,
    quoteId,
    proposalId: "",
    accountId: invoice.accountId,
    linkedAt: new Date().toISOString(),
    variance,
  };
}

export function detectUnlinkedInvoices(invoices: Invoice[], linkedIds: Set<string>): Invoice[] {
  return invoices.filter(inv => !linkedIds.has(inv.id));
}

export function computeQuoteToInvoiceRate(totalQuotes: number, totalInvoices: number): number {
  return totalQuotes > 0 ? Math.round((totalInvoices / totalQuotes) * 100) : 0;
}

