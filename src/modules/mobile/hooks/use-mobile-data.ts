// ═══════════════════════════════════════════════════════════════
// SITA OS — Mobile Data Hooks
// Wires MobileHome, MobileConcierge, MobileMoney to live DB data
// with demo fallbacks via useModeData.
// ═══════════════════════════════════════════════════════════════

import { useModeData } from "@/hooks/useModeData";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// ── Types ────────────────────────────────────────────────────

export interface MobilePulseMetric {
  label: string;
  value: string;
  trend?: "up" | "down" | "stable";
  accent: "green" | "amber" | "red" | "purple";
  icon: string;
}

export interface MobileQuickAction {
  label: string;
  path: string;
  count: number;
}

export interface MobileActivityItem {
  time: string;
  action: string;
  domain: string;
}

export interface MobileAccount {
  label: string;
  balance: string;
  trend: string;
}

export interface MobileTransaction {
  desc: string;
  amount: string;
  type: "in" | "out";
  time: string;
}

export interface MobileConciergeItem {
  label: string;
  detail: string;
  status: "upcoming" | "pending" | "done";
}

export interface MobileConciergeSection {
  title: string;
  iconName: string;
  items: MobileConciergeItem[];
}

// ── Helpers ──────────────────────────────────────────────────

function formatCents(cents: number): string {
  const abs = Math.abs(cents);
  const formatted = `$${(abs / 100).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  return cents < 0 ? `-${formatted}` : formatted;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// ── Demo data ────────────────────────────────────────────────

const PULSE: MobilePulseMetric[] = [
  { icon: "Heart", label: "System Health", value: "97%", trend: "up", accent: "green" },
  { icon: "TrendingUp", label: "Revenue MTD", value: "$42.8K", trend: "up", accent: "purple" },
  { icon: "Shield", label: "Trust Score", value: "94/100", trend: "stable", accent: "green" },
  { icon: "Wallet", label: "Safe to Spend", value: "$8,240", trend: "down", accent: "amber" },
  { icon: "Calendar", label: "Tasks Today", value: "6 items", accent: "purple" },
  { icon: "Users", label: "Active Leads", value: "23", trend: "up", accent: "green" },
];

const QUICK_ACTIONS: MobileQuickAction[] = [
  { label: "Approvals", path: "/mobile/approvals", count: 3 },
  { label: "Alerts", path: "/mobile/alerts", count: 5 },
  { label: "Proof Log", path: "/mobile/proof", count: 12 },
  { label: "Boardroom", path: "/mobile/boardroom", count: 0 },
];

const ACTIVITY: MobileActivityItem[] = [
  { time: "2m ago", action: "Invoice #1042 payment received", domain: "business" },
  { time: "15m ago", action: "Reserve contribution auto-executed", domain: "finance" },
  { time: "1h ago", action: "Grocery list generated for the week", domain: "concierge" },
  { time: "3h ago", action: "Lead scoring recalculated — 4 promoted", domain: "business" },
];

const ACCOUNTS: MobileAccount[] = [
  { label: "Operating", balance: "$24,300", trend: "+$3,200 this month" },
  { label: "Reserves", balance: "$18,500", trend: "Target: $25,000" },
  { label: "Tax Set-Aside", balance: "$6,200", trend: "Next due: Apr 15" },
];

const TX: MobileTransaction[] = [
  { desc: "Client Payment — Acme Corp", amount: "+$4,800", type: "in", time: "Today" },
  { desc: "Software Subscription", amount: "-$199", type: "out", time: "Today" },
  { desc: "Reserve Auto-Contribution", amount: "-$500", type: "out", time: "Yesterday" },
  { desc: "Freelancer Payment", amount: "-$1,200", type: "out", time: "Yesterday" },
  { desc: "Invoice #1037 Paid", amount: "+$2,100", type: "in", time: "2 days ago" },
];

const CONCIERGE: MobileConciergeSection[] = [
  {
    title: "Today's Schedule", iconName: "Calendar",
    items: [
      { label: "Dentist — Dr. Park", detail: "10:30 AM · Downtown", status: "upcoming" },
      { label: "Grocery pickup", detail: "2:00 PM · Whole Foods", status: "upcoming" },
      { label: "Soccer practice (kids)", detail: "4:30 PM · Field B", status: "upcoming" },
    ],
  },
  {
    title: "Errands", iconName: "ShoppingCart",
    items: [
      { label: "Dry cleaning pickup", detail: "Ready since yesterday", status: "pending" },
      { label: "Pharmacy refill", detail: "Auto-ordered, pickup today", status: "done" },
      { label: "Return Amazon package", detail: "UPS drop-off by Friday", status: "pending" },
    ],
  },
  {
    title: "Recurring Obligations", iconName: "RotateCcw",
    items: [
      { label: "Car insurance renewal", detail: "Due in 5 days", status: "pending" },
      { label: "Quarterly tax filing", detail: "Due Apr 15", status: "pending" },
      { label: "Annual physical exam", detail: "Scheduled May 2", status: "done" },
    ],
  },
];

// ── Hooks ────────────────────────────────────────────────────

export function useMobileHomePulse() {
  const { user } = useAuth();
  const uid = user?.id;

  return useModeData<MobilePulseMetric[]>(
    ["mobile-pulse", uid ?? ""],
    PULSE,
    async () => {
      if (!uid) return PULSE;

      // Parallel queries for pulse metrics
      const [alertsRes, approvalsRes, leadsRes, txRes] = await Promise.all([
        supabase.from("alerts").select("id", { count: "exact", head: true }).eq("status", "open"),
        supabase.from("approval_requests").select("id", { count: "exact", head: true }).eq("user_id", uid).eq("status", "pending"),
        supabase.from("leads").select("id", { count: "exact", head: true }).eq("user_id", uid).in("status", ["new", "contacted", "qualified"]),
        supabase.from("transactions").select("amount_cents, direction").eq("user_id", uid).gte("occurred_at", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()).limit(500),
      ]);

      const alertCount = alertsRes.count ?? 0;
      const approvalCount = approvalsRes.count ?? 0;
      const leadCount = leadsRes.count ?? 0;

      const revenueCents = (txRes.data ?? [])
        .filter((t) => t.direction === "in")
        .reduce((s, t) => s + (t.amount_cents ?? 0), 0);
      const revenueFmt = revenueCents >= 100_000
        ? `$${(revenueCents / 100_000).toFixed(1)}K`
        : formatCents(revenueCents);

      const healthPct = alertCount === 0 ? "100%" : alertCount <= 3 ? "95%" : alertCount <= 10 ? "85%" : "70%";
      const healthTrend: "up" | "down" | "stable" = alertCount <= 2 ? "up" : alertCount <= 5 ? "stable" : "down";

      return [
        { icon: "Heart", label: "System Health", value: healthPct, trend: healthTrend, accent: alertCount <= 3 ? "green" as const : "amber" as const },
        { icon: "TrendingUp", label: "Revenue MTD", value: revenueFmt, trend: "up", accent: "purple" as const },
        { icon: "Shield", label: "Trust Score", value: `${Math.max(0, 100 - alertCount * 2)}/100`, trend: "stable", accent: "green" as const },
        { icon: "Wallet", label: "Pending Approvals", value: `${approvalCount}`, trend: approvalCount > 5 ? "down" as const : "stable" as const, accent: approvalCount > 5 ? "amber" as const : "green" as const },
        { icon: "Calendar", label: "Open Alerts", value: `${alertCount} items`, accent: alertCount > 0 ? "amber" as const : "green" as const },
        { icon: "Users", label: "Active Leads", value: `${leadCount}`, trend: "up", accent: "green" as const },
      ];
    },
    PULSE,
  );
}

export function useMobileHomeQuickActions() {
  const { user } = useAuth();
  const uid = user?.id;

  return useModeData<MobileQuickAction[]>(
    ["mobile-quick-actions", uid ?? ""],
    QUICK_ACTIONS,
    async () => {
      if (!uid) return QUICK_ACTIONS;

      const [approvals, alerts, receipts, boardroom] = await Promise.all([
        supabase.from("approval_requests").select("id", { count: "exact", head: true }).eq("user_id", uid).eq("status", "pending"),
        supabase.from("alerts").select("id", { count: "exact", head: true }).eq("status", "open"),
        supabase.from("ai_action_receipts").select("id", { count: "exact", head: true }).eq("user_id", uid).limit(100),
        supabase.from("boardroom_items").select("id", { count: "exact", head: true }).eq("user_id", uid).eq("status", "active"),
      ]);

      return [
        { label: "Approvals", path: "/mobile/approvals", count: approvals.count ?? 0 },
        { label: "Alerts", path: "/mobile/alerts", count: alerts.count ?? 0 },
        { label: "Proof Log", path: "/mobile/proof", count: receipts.count ?? 0 },
        { label: "Boardroom", path: "/mobile/boardroom", count: boardroom.count ?? 0 },
      ];
    },
    QUICK_ACTIONS,
  );
}

export function useMobileHomeActivity() {
  const { user } = useAuth();
  const uid = user?.id;

  return useModeData<MobileActivityItem[]>(
    ["mobile-activity", uid ?? ""],
    ACTIVITY,
    async () => {
      if (!uid) return ACTIVITY;

      // Pull recent transactions as activity
      const { data: txData } = await supabase
        .from("transactions")
        .select("description, occurred_at, category, direction")
        .eq("user_id", uid)
        .order("occurred_at", { ascending: false })
        .limit(6);

      if (!txData || txData.length === 0) return ACTIVITY;

      return txData.map((tx) => ({
        time: timeAgo(tx.occurred_at),
        action: tx.description || (tx.direction === "in" ? "Payment received" : "Payment sent"),
        domain: tx.category === "revenue" || tx.category === "sales" ? "business" : "finance",
      }));
    },
    ACTIVITY,
  );
}

export function useMobileMoneyAccounts() {
  const { user } = useAuth();
  const uid = user?.id;

  return useModeData<{ safeToSpend: string; accounts: MobileAccount[] }>(
    ["mobile-money-accounts", uid ?? ""],
    { safeToSpend: "$8,240", accounts: ACCOUNTS },
    async () => {
      if (!uid) return { safeToSpend: "$8,240", accounts: ACCOUNTS };

      // Aggregate transactions by account_label
      const { data: txData } = await supabase
        .from("transactions")
        .select("account_label, amount_cents, direction")
        .eq("user_id", uid)
        .limit(1000);

      if (!txData || txData.length === 0) return { safeToSpend: "$0", accounts: [] };

      const buckets = new Map<string, number>();
      let total = 0;
      for (const tx of txData) {
        const label = tx.account_label || "Operating";
        const signed = tx.direction === "in" ? tx.amount_cents : -tx.amount_cents;
        buckets.set(label, (buckets.get(label) ?? 0) + signed);
        total += signed;
      }

      const accounts: MobileAccount[] = [...buckets.entries()].map(([label, balance]) => ({
        label,
        balance: formatCents(balance),
        trend: "",
      }));

      return { safeToSpend: formatCents(total), accounts };
    },
    { safeToSpend: "$0", accounts: [] },
  );
}

export function useMobileMoneyTransactions() {
  const { user } = useAuth();
  const uid = user?.id;

  return useModeData<MobileTransaction[]>(
    ["mobile-money-tx", uid ?? ""],
    TX,
    async () => {
      if (!uid) return TX;

      const { data } = await supabase
        .from("transactions")
        .select("description, amount_cents, direction, occurred_at")
        .eq("user_id", uid)
        .order("occurred_at", { ascending: false })
        .limit(10);

      if (!data || data.length === 0) return [];

      return data.map((tx) => ({
        desc: tx.description || "Transaction",
        amount: `${tx.direction === "in" ? "+" : "-"}${formatCents(Math.abs(tx.amount_cents))}`,
        type: tx.direction === "in" ? "in" as const : "out" as const,
        time: timeAgo(tx.occurred_at),
      }));
    },
    [],
  );
}

export function useMobileConciergeData() {
  const { user } = useAuth();
  const uid = user?.id;

  return useModeData<MobileConciergeSection[]>(
    ["mobile-concierge", uid ?? ""],
    CONCIERGE,
    async () => {
      if (!uid) return CONCIERGE;

      const [appointmentsRes, errandsRes, obligationsRes] = await Promise.all([
        supabase.from("appointments").select("title, appointment_date, location, status, provider").eq("user_id", uid).order("appointment_date", { ascending: true }).limit(10),
        supabase.from("errands").select("title, location, status, due_date").eq("user_id", uid).neq("status", "completed").order("created_at", { ascending: false }).limit(10),
        supabase.from("concierge_recurring_obligations").select("title, next_due, status, frequency").eq("user_id", uid).order("next_due", { ascending: true }).limit(10),
      ]);

      const sections: MobileConciergeSection[] = [];

      // Schedule
      const appts = appointmentsRes.data ?? [];
      if (appts.length > 0) {
        sections.push({
          title: "Schedule",
          iconName: "Calendar",
          items: appts.map((a) => ({
            label: a.title,
            detail: [a.appointment_date ? new Date(a.appointment_date).toLocaleDateString() : "", a.location].filter(Boolean).join(" · "),
            status: a.status === "completed" ? "done" as const : "upcoming" as const,
          })),
        });
      }

      // Errands
      const errList = errandsRes.data ?? [];
      if (errList.length > 0) {
        sections.push({
          title: "Errands",
          iconName: "ShoppingCart",
          items: errList.map((e) => ({
            label: e.title,
            detail: [e.location, e.due_date ? `Due ${new Date(e.due_date).toLocaleDateString()}` : ""].filter(Boolean).join(" · ") || "No deadline",
            status: e.status === "done" ? "done" as const : "pending" as const,
          })),
        });
      }

      // Obligations
      const obList = obligationsRes.data ?? [];
      if (obList.length > 0) {
        sections.push({
          title: "Recurring Obligations",
          iconName: "RotateCcw",
          items: obList.map((o) => ({
            label: o.title,
            detail: [o.frequency, o.next_due ? `Due ${new Date(o.next_due).toLocaleDateString()}` : ""].filter(Boolean).join(" · "),
            status: o.status === "completed" || o.status === "done" ? "done" as const : "pending" as const,
          })),
        });
      }

      return sections.length > 0 ? sections : CONCIERGE;
    },
    CONCIERGE,
  );
}