import type { Invoice, CRMAccount } from "@/domains/business";
import { daysAhead, daysAgo } from "./business-fixtures";

export function makeInvoice(overrides: Partial<Invoice> = {}): Invoice {
  return {
    id: "inv-1",
    accountId: "acct-1",
    amount: 1000,
    dueDate: daysAhead(15),
    status: "pending",
    ...overrides,
  };
}

export function makeOverdueInvoice(daysOverdue: number, amount = 1000, id = "inv-overdue"): Invoice {
  return {
    id,
    accountId: "acct-1",
    amount,
    dueDate: daysAgo(daysOverdue),
    status: "overdue",
  };
}

export function makeCRMAccount(overrides: Partial<CRMAccount> = {}): CRMAccount {
  return {
    id: "acct-1",
    name: "Acme Inc",
    industry: "SaaS",
    healthScore: 75,
    ...overrides,
  };
}