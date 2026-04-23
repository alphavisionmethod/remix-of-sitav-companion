// SITA OS — Money Data Service (Mode-Aware, Fully Advanced)
import { supabase } from "@/integrations/supabase/client";
import { fromTable, fromDynamicTable } from "@/lib/supabase-helpers";
import type { RealityModeKey } from "@/lib/dual-reality/reality-mode-registry";
import { resolveByMode, type ModeAwareResult } from "@/hooks/useRealityProvider";

// ── Types ──

export interface ReserveSaving {
  id: string; name: string; current_amount: number; target_amount: number;
  category: string; contribution_amount: number; notes: string;
  auto_contribute: boolean; priority: number;
}

export interface FinancialAccount {
  id: string; name: string; institution: string; account_type: string;
  balance: number; currency: string; trend: number; last_synced_at: string | null;
}

export interface MoneyPolicy {
  id: string; title: string; description: string; category: string;
  enabled: boolean; threshold: number | null; icon_key: string | null;
}

export interface MoneyApprovalItem {
  id: string; action_type: string; action_summary: string; status: string;
  proposed_action: any; reviewed_by: string | null; created_at: string;
}

export interface MoneyProofItem {
  id: string; action: string; category: string; actor: string;
  details: any; created_at: string;
}

export interface FinancialDocument {
  id: string; name: string; doc_type: string; classification: string;
  sensitivity: string; linked_to: string | null; extracted_data: any;
  boardroom_relevant: boolean; proof_relevant: boolean; status: string;
  created_at: string;
}

export interface CashWindow {
  day: string; inflows: number; outflows: number; net: number; balance: number; stress: boolean;
}

export interface MoneyKPIs {
  totalBalance: number; safeToSpend: number; billsDue7d: number; billsDue7dCount: number;
  reserveHealth: number; subscriptionMonthly: number; subscriptionCount: number;
  estWaste: number; wasteCount: number; receivables: number; receivableCount: number;
  monthlyBurn: number;
}

// ── Demo Data ──

const RESERVES: ReserveSaving[] = [
  { id: "r1", name: "Emergency Fund", current_amount: 50000, target_amount: 75000, category: "emergency", contribution_amount: 2000, notes: "6-month runway", auto_contribute: true, priority: 1 },
  { id: "r2", name: "Tax Reserve", current_amount: 18000, target_amount: 25000, category: "tax", contribution_amount: 1500, notes: "Q2 estimated payments", auto_contribute: true, priority: 2 },
  { id: "r3", name: "Opportunity Fund", current_amount: 32000, target_amount: 50000, category: "opportunity", contribution_amount: 3000, notes: "Deal-ready capital", auto_contribute: false, priority: 3 },
];

const ACCOUNTS: FinancialAccount[] = [
  { id: "a1", name: "Business Checking", institution: "Chase", account_type: "checking", balance: 14230, currency: "USD", trend: 320, last_synced_at: new Date().toISOString() },
  { id: "a2", name: "Business Savings", institution: "Chase", account_type: "savings", balance: 28500, currency: "USD", trend: 0, last_synced_at: new Date().toISOString() },
  { id: "a3", name: "Personal Checking", institution: "Wells Fargo", account_type: "checking", balance: 3840, currency: "USD", trend: -210, last_synced_at: new Date().toISOString() },
  { id: "a4", name: "Emergency Fund", institution: "Ally", account_type: "savings", balance: 12000, currency: "USD", trend: 0, last_synced_at: new Date().toISOString() },
];

const POLICIES: MoneyPolicy[] = [
  { id: "p1", title: "Transfer approval threshold", description: "Require approval for transfers exceeding this amount", category: "Approvals", enabled: true, threshold: 500, icon_key: "Shield" },
  { id: "p2", title: "Tax payment approval", description: "Require approval for tax payments above this amount", category: "Approvals", enabled: true, threshold: 1000, icon_key: "DollarSign" },
  { id: "p3", title: "Low balance alert", description: "Alert when any account drops below threshold", category: "Alerts", enabled: true, threshold: 4000, icon_key: "AlertTriangle" },
  { id: "p4", title: "Subscription waste detection", description: "Flag subscriptions with low usage automatically", category: "Intelligence", enabled: true, threshold: null, icon_key: "CreditCard" },
  { id: "p5", title: "Auto-pay confirmation", description: "Notify before auto-pay executes for bills over threshold", category: "Alerts", enabled: true, threshold: 500, icon_key: "Bell" },
  { id: "p6", title: "Reserve auto-contribution", description: "Automatically contribute to savings goals monthly", category: "Automation", enabled: true, threshold: null, icon_key: "PiggyBank" },
  { id: "p7", title: "Cash timing stress alerts", description: "Warn when single-day outflows exceed threshold", category: "Alerts", enabled: true, threshold: 3000, icon_key: "Zap" },
  { id: "p8", title: "Overdue receivable reminders", description: "Auto-send follow-up after specified days overdue", category: "Automation", enabled: true, threshold: 7, icon_key: "Bell" },
];

const APPROVALS: MoneyApprovalItem[] = [
  { id: "ma1", action_type: "money.transfer", action_summary: "Transfer $1,000 from savings to personal checking", status: "pending", proposed_action: { amount: 1000, reason: "Personal checking below $4,000 threshold", risk: "low", impact: "Restores buffer; savings reduced to $27,500", ifApproved: "Immediate transfer via linked accounts", ifDelayed: "Risk of overdraft if unexpected charge hits", policy: "Transfer alerts on amounts > $500", linkedTo: "Personal Checking" }, reviewed_by: null, created_at: new Date().toISOString() },
  { id: "ma2", action_type: "money.subscription.cancel", action_summary: "Cancel Zoom Pro subscription — $15.99/mo", status: "pending", proposed_action: { amount: 15.99, reason: "Usage: Low — Google Meet available as free alternative", risk: "low", impact: "Save $192/year", ifApproved: "Cancellation effective before next billing Apr 6", ifDelayed: "Another month billed at $15.99", policy: "Subscription cancellations require review", linkedTo: "Subscriptions" }, reviewed_by: null, created_at: new Date().toISOString() },
  { id: "ma3", action_type: "money.tax.payment", action_summary: "Pay quarterly tax estimate — $3,200", status: "pending", proposed_action: { amount: 3200, reason: "Q1 estimated tax due Apr 15", risk: "medium", impact: "Tax reserve drops from $8,400 to $5,200", ifApproved: "Payment scheduled for Apr 14", ifDelayed: "Potential IRS penalty for late payment", policy: "Tax payments > $1,000 require approval", linkedTo: "Tax Reserve" }, reviewed_by: null, created_at: new Date().toISOString() },
  { id: "ma4", action_type: "money.reserve.adjust", action_summary: "Increase emergency fund contribution to $700/mo", status: "pending", proposed_action: { amount: 200, reason: "Emergency fund at 80% of target — accelerate to hit goal by May", risk: "low", impact: "Reduces safe-to-spend by $200/mo", ifApproved: "Next contribution adjusted immediately", ifDelayed: "Target date pushed to Jun", policy: "Contribution changes require review", linkedTo: "Emergency Fund" }, reviewed_by: null, created_at: new Date().toISOString() },
];

const PROOF: MoneyProofItem[] = [
  { id: "mp1", action: "bill.payment.scheduled", category: "money", actor: "system", details: { description: "Rent payment scheduled via auto-pay", amount: 2400, linkedItem: "Office Rent — Apr 1", policy: "Auto-pay enabled for recurring bills > $500", result: "success", verification: "verified", stateAfter: "Payment confirmed — next due May 1", relatedDocs: ["Bank confirmation #8823"] }, created_at: new Date(Date.now() - 7200000).toISOString() },
  { id: "mp2", action: "invoice.payment.received", category: "money", actor: "system", details: { description: "Invoice payment received — Stripe", amount: 4200, linkedItem: "Invoice #1038 — Marcus Johnson", policy: "Automatic receivable reconciliation", result: "success", verification: "verified", stateAfter: "Invoice marked as paid · Revenue recorded" }, created_at: new Date(Date.now() - 7200000).toISOString() },
  { id: "mp3", action: "subscription.waste.flagged", category: "money", actor: "system", details: { description: "Subscription flagged as waste", amount: 15.99, linkedItem: "Zoom Pro", policy: "Low-usage subscription auto-flag", result: "success", verification: "verified", stateAfter: "Awaiting cancellation approval" }, created_at: new Date().toISOString() },
  { id: "mp4", action: "reserve.contribution", category: "money", actor: "system", details: { description: "Reserve contribution completed", amount: 500, linkedItem: "Emergency Fund", policy: "Monthly auto-contribution per savings policy", result: "success", verification: "verified", stateAfter: "Balance: $12,000 / $15,000 (80%)", relatedDocs: ["Transfer receipt #T-4401"] }, created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: "mp5", action: "cash.timing.warning", category: "money", actor: "system", details: { description: "Cash timing warning generated", linkedItem: "Apr 15 — payment cluster $3,685", policy: "Alert when single-day outflow > $3,000", result: "success", verification: "verified", stateAfter: "Warning active · Monitoring balance" }, created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: "mp6", action: "transfer.approval.requested", category: "money", actor: "system", details: { description: "Transfer approval requested", amount: 1000, linkedItem: "Savings → Personal Checking", policy: "Transfer alerts on amounts > $500", result: "pending", verification: "pending", stateAfter: "Pending approval" }, created_at: new Date().toISOString() },
  { id: "mp7", action: "receivable.followup", category: "money", actor: "system", details: { description: "Overdue receivable follow-up triggered", amount: 1800, linkedItem: "Invoice #1035 — David Kim", policy: "Auto-reminder after 7 days overdue", result: "success", verification: "verified", stateAfter: "Reminder sent · Awaiting response", relatedDocs: ["Email reminder #RM-221"] }, created_at: new Date(Date.now() - 259200000).toISOString() },
  { id: "mp8", action: "tax.payment.approved", category: "money", actor: "owner", details: { description: "Quarterly tax estimate approval granted", amount: 3200, linkedItem: "Tax Reserve → IRS", policy: "Tax payments > $1,000 require approval", approvalRecord: "Approved by Owner", result: "success", verification: "verified", stateAfter: "Scheduled for Apr 14" }, created_at: new Date(Date.now() - 86400000).toISOString() },
];

const DOCUMENTS: FinancialDocument[] = [
  { id: "fd1", name: "Chase Business Statement — Mar 2026", doc_type: "statement", classification: "Bank Statement", sensitivity: "sensitive", linked_to: null, extracted_data: { amount: "$14,230 ending balance", date: "Mar 31, 2026" }, boardroom_relevant: true, proof_relevant: false, status: "processed", created_at: new Date().toISOString() },
  { id: "fd2", name: "Office Lease Agreement", doc_type: "contract", classification: "Contract", sensitivity: "confidential", linked_to: "Office Rent — $2,400/mo", extracted_data: { obligations: "Monthly rent $2,400 · Term ends Dec 2026" }, boardroom_relevant: true, proof_relevant: false, status: "processed", created_at: "2026-01-15T00:00:00Z" },
  { id: "fd3", name: "Invoice #1040 — Lisa Thompson", doc_type: "invoice", classification: "Receivable", sensitivity: "normal", linked_to: "Receivables · $4,200", extracted_data: { amount: "$4,200", date: "Due Apr 12" }, boardroom_relevant: false, proof_relevant: true, status: "processed", created_at: new Date(Date.now() - 259200000).toISOString() },
  { id: "fd4", name: "AWS Hosting Invoice — Mar", doc_type: "bill", classification: "Vendor Bill", sensitivity: "normal", linked_to: "AWS Hosting · $340", extracted_data: { amount: "$340", date: "Due Apr 3" }, boardroom_relevant: false, proof_relevant: true, status: "processed", created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: "fd5", name: "Insurance Policy Renewal Terms", doc_type: "contract", classification: "Insurance", sensitivity: "sensitive", linked_to: null, extracted_data: { obligations: "Annual premium $5,040 · Renewal Jul 1" }, boardroom_relevant: true, proof_relevant: false, status: "processed", created_at: new Date(Date.now() - 1209600000).toISOString() },
  { id: "fd6", name: "Quarterly P&L Export", doc_type: "report", classification: "Financial Report", sensitivity: "confidential", linked_to: null, extracted_data: { amount: "Net income: $8,400", date: "Q1 2026" }, boardroom_relevant: true, proof_relevant: false, status: "processed", created_at: new Date(Date.now() - 345600000).toISOString() },
  { id: "fd7", name: "Receipt — Equipment Purchase", doc_type: "receipt", classification: "Expense Receipt", sensitivity: "normal", linked_to: "Equipment Fund", extracted_data: { amount: "$1,200" }, boardroom_relevant: false, proof_relevant: true, status: "processed", created_at: new Date(Date.now() - 604800000).toISOString() },
  { id: "fd8", name: "Stripe Payout Summary", doc_type: "statement", classification: "Payment Statement", sensitivity: "sensitive", linked_to: null, extracted_data: { amount: "$12,600 total payouts", date: "Mar 2026" }, boardroom_relevant: true, proof_relevant: true, status: "extracting", created_at: new Date(Date.now() - 172800000).toISOString() },
];

const CASH_WINDOWS: CashWindow[] = [
  { day: "Today", inflows: 0, outflows: 0, net: 0, balance: 18070, stress: false },
  { day: "Apr 1", inflows: 0, outflows: 2449, net: -2449, balance: 15621, stress: true },
  { day: "Apr 3", inflows: 0, outflows: 340, net: -340, balance: 15281, stress: false },
  { day: "Apr 5", inflows: 3200, outflows: 189, net: 3011, balance: 18292, stress: false },
  { day: "Apr 7", inflows: 0, outflows: 0, net: 0, balance: 18292, stress: false },
  { day: "Apr 10", inflows: 0, outflows: 420, net: -420, balance: 17872, stress: false },
  { day: "Apr 12", inflows: 4200, outflows: 0, net: 4200, balance: 22072, stress: false },
  { day: "Apr 15", inflows: 0, outflows: 3685, net: -3685, balance: 18387, stress: true },
];

const KPIS: MoneyKPIs = {
  totalBalance: 58570, safeToSpend: 3180, billsDue7d: 2929, billsDue7dCount: 3,
  reserveHealth: 94, subscriptionMonthly: 105, subscriptionCount: 5,
  estWaste: 28, wasteCount: 2, receivables: 7400, receivableCount: 2, monthlyBurn: 6200,
};

// ── Helper ──

async function getUserId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

// ── Fetchers ──

export async function fetchReservesSavings(mode: RealityModeKey = "real"): Promise<ModeAwareResult<ReserveSaving[]>> {
  if (mode !== "real") return resolveByMode({ mode, realData: null, demoData: RESERVES, emptyDefault: [] });
  const userId = await getUserId();
  if (!userId) return resolveByMode({ mode, realData: null, demoData: RESERVES, emptyDefault: [] });
  const { data, error } = await fromTable("capital_allocations").select("*").eq("user_id", userId).order("created_at", { ascending: false });
  const mapped = (!error && data && data.length > 0) ? data.map((r: any): ReserveSaving => ({
    id: r.id, name: r.category, current_amount: Number(r.amount), target_amount: Number(r.amount) * 1.5,
    category: r.category, contribution_amount: 0, notes: r.notes || "", auto_contribute: false, priority: 0,
  })) : null;
  return resolveByMode({ mode, realData: mapped, demoData: RESERVES, emptyDefault: [] });
}

export async function fetchFinancialAccounts(mode: RealityModeKey = "real"): Promise<ModeAwareResult<FinancialAccount[]>> {
  if (mode !== "real") return resolveByMode({ mode, realData: null, demoData: ACCOUNTS, emptyDefault: [] });
  const userId = await getUserId();
  if (!userId) return resolveByMode({ mode, realData: null, demoData: ACCOUNTS, emptyDefault: [] });
  const { data, error } = await fromDynamicTable("financial_accounts").select("*").eq("user_id", userId).order("created_at", { ascending: false });
  const mapped = (!error && data && data.length > 0) ? ((data as unknown as Record<string, unknown>[])).map((a): FinancialAccount => ({
    id: String(a.id), name: String(a.name), institution: String(a.institution || ""), account_type: String(a.account_type),
    balance: Number(a.balance), currency: String(a.currency), trend: Number(a.trend || 0), last_synced_at: String(a.last_synced_at),
  })) : null;
  return resolveByMode({ mode, realData: mapped, demoData: ACCOUNTS, emptyDefault: [] });
}

export async function fetchMoneyPolicies(mode: RealityModeKey = "real"): Promise<ModeAwareResult<MoneyPolicy[]>> {
  if (mode !== "real") return resolveByMode({ mode, realData: null, demoData: POLICIES, emptyDefault: [] });
  const userId = await getUserId();
  if (!userId) return resolveByMode({ mode, realData: null, demoData: POLICIES, emptyDefault: [] });
  const { data, error } = await fromDynamicTable("money_policies").select("*").eq("user_id", userId).order("created_at", { ascending: false });
  const mapped = (!error && data && data.length > 0) ? ((data as unknown as Record<string, unknown>[])).map((p): MoneyPolicy => ({
    id: String(p.id), title: String(p.title), description: String(p.description || ""), category: String(p.category),
    enabled: Boolean(p.enabled), threshold: p.threshold ? Number(p.threshold) : null, icon_key: String(p.icon_key),
  })) : null;
  return resolveByMode({ mode, realData: mapped, demoData: POLICIES, emptyDefault: [] });
}

export async function fetchMoneyApprovals(mode: RealityModeKey = "real"): Promise<ModeAwareResult<MoneyApprovalItem[]>> {
  if (mode !== "real") return resolveByMode({ mode, realData: null, demoData: APPROVALS, emptyDefault: [] });
  const userId = await getUserId();
  if (!userId) return resolveByMode({ mode, realData: null, demoData: APPROVALS, emptyDefault: [] });
  const { data, error } = await fromTable("approval_queue").select("*").eq("user_id", userId).like("action_type", "money%").order("created_at", { ascending: false });
  const mapped = (!error && data && data.length > 0) ? data.map((a: any): MoneyApprovalItem => ({
    id: a.id, action_type: a.action_type, action_summary: a.action_summary || "", status: a.status,
    proposed_action: a.proposed_action, reviewed_by: a.reviewed_by, created_at: a.created_at,
  })) : null;
  return resolveByMode({ mode, realData: mapped, demoData: APPROVALS, emptyDefault: [] });
}

export async function fetchMoneyProof(mode: RealityModeKey = "real"): Promise<ModeAwareResult<MoneyProofItem[]>> {
  if (mode !== "real") return resolveByMode({ mode, realData: null, demoData: PROOF, emptyDefault: [] });
  const userId = await getUserId();
  if (!userId) return resolveByMode({ mode, realData: null, demoData: PROOF, emptyDefault: [] });
  const { data, error } = await fromTable("audit_logs").select("*").eq("user_id", userId).eq("category", "money").order("created_at", { ascending: false }).limit(50);
  const mapped = (!error && data && data.length > 0) ? data.map((l: any): MoneyProofItem => ({
    id: l.id, action: l.action, category: l.category, actor: l.actor,
    details: l.details || {}, created_at: l.created_at,
  })) : null;
  return resolveByMode({ mode, realData: mapped, demoData: PROOF, emptyDefault: [] });
}

export async function fetchFinancialDocuments(mode: RealityModeKey = "real"): Promise<ModeAwareResult<FinancialDocument[]>> {
  if (mode !== "real") return resolveByMode({ mode, realData: null, demoData: DOCUMENTS, emptyDefault: [] });
  const userId = await getUserId();
  if (!userId) return resolveByMode({ mode, realData: null, demoData: DOCUMENTS, emptyDefault: [] });
  // Use files table filtered to finance category
  const { data, error } = await fromDynamicTable("documents").select("*").eq("user_id", userId).eq("category", "finance").order("created_at", { ascending: false });
  const mapped = (!error && data && data.length > 0) ? ((data as unknown as Record<string, unknown>[])).map((f): FinancialDocument => ({
    id: String(f.id), name: String(f.file_name || f.name), doc_type: String(f.subcategory || "document"), classification: String(f.subcategory || "Document"),
    sensitivity: String(f.sensitivity_label || "normal"), linked_to: null, extracted_data: (f.ai_extracted_data || {}) as Record<string, unknown>,
    boardroom_relevant: false, proof_relevant: false, status: String(f.processing_status || "processed"), created_at: String(f.created_at),
  })) : null;
  return resolveByMode({ mode, realData: mapped, demoData: DOCUMENTS, emptyDefault: [] });
}

export async function fetchCashTimingWindows(mode: RealityModeKey = "real"): Promise<ModeAwareResult<CashWindow[]>> {
  if (mode !== "real") return resolveByMode({ mode, realData: null, demoData: CASH_WINDOWS, emptyDefault: [] });
  const userId = await getUserId();
  if (!userId) return resolveByMode({ mode, realData: null, demoData: CASH_WINDOWS, emptyDefault: [] });

  // Compute from bills + invoices over next 15 days
  const now = new Date();
  const in15 = new Date(now.getTime() + 15 * 86400000);

  const [billsRes, invoicesRes, accountsRes] = await Promise.all([
    fromTable("bills").select("*").eq("user_id", userId).gte("due_date", now.toISOString().split("T")[0]).lte("due_date", in15.toISOString().split("T")[0]),
    fromTable("invoices").select("*").eq("user_id", userId).gte("due_date", now.toISOString().split("T")[0]).lte("due_date", in15.toISOString().split("T")[0]),
    fromDynamicTable("financial_accounts").select("balance").eq("user_id", userId),
  ]);

  const bills = billsRes.data || [];
  const invoices = invoicesRes.data || [];
  const startBalance = (accountsRes.data || []).reduce((s: number, a: any) => s + Number(a.balance || 0), 0);

  if (bills.length === 0 && invoices.length === 0) {
    return resolveByMode({ mode, realData: null, demoData: CASH_WINDOWS, emptyDefault: [] });
  }

  // Group by date
  const dateMap = new Map<string, { inflows: number; outflows: number }>();
  for (const b of bills) {
    const d = b.due_date || "";
    const e = dateMap.get(d) || { inflows: 0, outflows: 0 };
    e.outflows += Number(b.amount || 0);
    dateMap.set(d, e);
  }
  for (const inv of invoices) {
    const d = inv.due_date || "";
    const e = dateMap.get(d) || { inflows: 0, outflows: 0 };
    e.inflows += Number(inv.amount || 0);
    dateMap.set(d, e);
  }

  const sorted = Array.from(dateMap.entries()).sort(([a], [b]) => a.localeCompare(b));
  let balance = startBalance;
  const windows: CashWindow[] = [{ day: "Today", inflows: 0, outflows: 0, net: 0, balance, stress: false }];

  for (const [date, { inflows, outflows }] of sorted) {
    const net = inflows - outflows;
    balance += net;
    const label = new Date(date + "T12:00:00Z").toLocaleDateString("en", { month: "short", day: "numeric" });
    windows.push({ day: label, inflows, outflows, net, balance, stress: outflows > 3000 });
  }

  return resolveByMode({ mode, realData: windows, demoData: CASH_WINDOWS, emptyDefault: [] });
}

export async function fetchMoneyKPIs(mode: RealityModeKey = "real"): Promise<ModeAwareResult<MoneyKPIs>> {
  if (mode !== "real") return resolveByMode({ mode, realData: null, demoData: KPIS, emptyDefault: KPIS });
  const userId = await getUserId();
  if (!userId) return resolveByMode({ mode, realData: null, demoData: KPIS, emptyDefault: KPIS });

  const now = new Date();
  const in7 = new Date(now.getTime() + 7 * 86400000);

  const [accountsRes, billsRes, subsRes, invoicesRes, reservesRes] = await Promise.all([
    fromDynamicTable("financial_accounts").select("balance").eq("user_id", userId),
    fromTable("bills").select("amount").eq("user_id", userId).gte("due_date", now.toISOString().split("T")[0]).lte("due_date", in7.toISOString().split("T")[0]),
    fromTable("subscriptions").select("cost, is_waste").eq("user_id", userId),
    fromTable("invoices").select("amount, status").eq("user_id", userId).neq("status", "paid"),
    fromTable("capital_allocations").select("amount, notes").eq("user_id", userId),
  ]);

  const totalBalance = (accountsRes.data || []).reduce((s: number, a: any) => s + Number(a.balance || 0), 0);
  const billsDue7d = (billsRes.data || []).reduce((s: number, b: any) => s + Number(b.amount || 0), 0);
  const billsDue7dCount = (billsRes.data || []).length;
  const subs = subsRes.data || [];
  const subscriptionMonthly = subs.reduce((s: number, sub: any) => s + Number(sub.cost || 0), 0);
  const wasteItems = subs.filter((s: any) => s.is_waste);
  const estWaste = wasteItems.reduce((s: number, w: any) => s + Number(w.cost || 0), 0);
  const receivables = (invoicesRes.data || []).reduce((s: number, i: any) => s + Number(i.amount || 0), 0);
  const reserveTotal = (reservesRes.data || []).reduce((s: number, r: any) => s + Number(r.amount || 0), 0);

  const hasData = totalBalance > 0 || billsDue7dCount > 0 || subs.length > 0;
  if (!hasData) return resolveByMode({ mode, realData: null, demoData: KPIS, emptyDefault: KPIS });

  const reserveHealth = reserveTotal > 0 ? Math.min(100, Math.round((reserveTotal / (reserveTotal * 1.2)) * 100)) : 0;
  const safeToSpend = Math.max(0, totalBalance - billsDue7d - reserveTotal);

  const kpis: MoneyKPIs = {
    totalBalance, safeToSpend, billsDue7d, billsDue7dCount,
    reserveHealth, subscriptionMonthly, subscriptionCount: subs.length,
    estWaste, wasteCount: wasteItems.length, receivables, receivableCount: (invoicesRes.data || []).length,
    monthlyBurn: billsDue7d * 4,
  };
  return resolveByMode({ mode, realData: kpis, demoData: KPIS, emptyDefault: KPIS });
}

// ── Mutations ──

export async function createFinancialAccount(account: Omit<FinancialAccount, "id" | "last_synced_at">) {
  const userId = await getUserId();
  if (!userId) throw new Error("Not authenticated");
  const { data, error } = await fromDynamicTable("financial_accounts").insert({ ...account, user_id: userId }).select().single();
  if (error) throw error;
  return data;
}

export async function updateFinancialAccount(id: string, updates: Partial<FinancialAccount>) {
  const { data, error } = await fromDynamicTable("financial_accounts").update(updates).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteFinancialAccount(id: string) {
  const { error } = await fromDynamicTable("financial_accounts").delete().eq("id", id);
  if (error) throw error;
}

export async function createMoneyPolicy(policy: Omit<MoneyPolicy, "id">) {
  const userId = await getUserId();
  if (!userId) throw new Error("Not authenticated");
  const { data, error } = await fromDynamicTable("money_policies").insert({ ...policy, user_id: userId }).select().single();
  if (error) throw error;
  return data;
}

export async function updateMoneyPolicy(id: string, updates: Partial<MoneyPolicy>) {
  const { data, error } = await fromDynamicTable("money_policies").update(updates).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteMoneyPolicy(id: string) {
  const { error } = await fromDynamicTable("money_policies").delete().eq("id", id);
  if (error) throw error;
}

export async function toggleMoneyPolicy(id: string, enabled: boolean) {
  return updateMoneyPolicy(id, { enabled });
}

export async function approveMoneyAction(id: string) {
  const userId = await getUserId();
  const { data, error } = await fromTable("approval_queue").update({ status: "approved", reviewed_by: userId }).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function rejectMoneyAction(id: string) {
  const userId = await getUserId();
  const { data, error } = await fromTable("approval_queue").update({ status: "rejected", reviewed_by: userId }).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

// ── Financial Documents CRUD ──

export async function listFinancialDocuments(limit = 100) {
  const userId = await getUserId();
  const { data, error } = await fromDynamicTable("financial_documents").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(limit);
  if (error) { console.error("[money] financial_documents fetch:", error); return []; }
  return data ?? [];
}

export async function createFinancialDocument(row: Record<string, unknown>) {
  const userId = await getUserId();
  const { data, error } = await fromDynamicTable("financial_documents").insert({ ...row, user_id: userId }).select().single();
  if (error) { console.error("[money] financial_documents insert:", error); return null; }
  return data;
}

export async function updateFinancialDocument(id: string, updates: Record<string, unknown>) {
  const { error } = await fromDynamicTable("financial_documents").update(updates).eq("id", id);
  if (error) { console.error("[money] financial_documents update:", error); return false; }
  return true;
}

export async function deleteFinancialDocument(id: string) {
  const { error } = await fromDynamicTable("financial_documents").delete().eq("id", id);
  if (error) { console.error("[money] financial_documents delete:", error); return false; }
  return true;
}
