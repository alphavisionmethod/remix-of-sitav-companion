// ═══════════════════════════════════════════════════════════════
// SITA OS — Desktop Widgets Data Hooks (C-009)
// Canonical query layer for the 12 hardcoded desktop widgets.
// Each hook returns { data, isLoading, isEmpty } and respects
// useDataMode().isDemoMode (no hardcoded modes anywhere).
// In demo mode → returns the original demo shapes so visuals stay
// identical for prospects. In live mode → queries real DB.
// ═══════════════════════════════════════════════════════════════

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useDataMode } from "@/contexts/DataModeContext";
import { fromTable } from "@/lib/supabase-helpers";

const STALE = 30_000; // 30s — matches admin seed acceptance criterion

// ─────────── Demo data shapes (preserved for visual parity) ───────────

const DEMO_WHAT_MATTERS = [
  { id: "business", label: "Business", color: "text-violet-300", count: 4, summary: "3 follow-ups prepared, 1 account needs decision, support pressure elevated." },
  { id: "finance", label: "Finance", color: "text-emerald-300", count: 1, summary: "One payment requires approval. Reserve confidence remains stable." },
  { id: "concierge", label: "Concierge", color: "text-amber-200", count: 2, summary: "Travel prep updated and one recurring household obligation grouped for Friday." },
];

const DEMO_BUSINESS_KPI = [
  { label: "Revenue", value: "$84.2K", change: "+12%", up: true },
  { label: "Pipeline", value: "$312K", change: "+8%", up: true },
  { label: "Approvals", value: "3", change: "pending", up: false },
];

const DEMO_FINANCE_SNAPSHOT = { totalCents: 2_480_000, fileCount: 47, monthDeltaPct: 5.27 };

const DEMO_CONCIERGE_TASKS = [
  { id: "d1", title: "Pick up dry cleaning", dueLabel: "Today 3pm", priority: "high" as const },
  { id: "d2", title: "Schedule vet for Bruno", dueLabel: "Tomorrow", priority: "medium" as const },
  { id: "d3", title: "Renew parking permit", dueLabel: "Apr 18", priority: "low" as const },
];

const DEMO_BOARDROOM_BRIEF = {
  nextSessionLabel: "Tomorrow 10 AM",
  topic: "Quarterly strategy review",
  pendingDecisions: 3,
  carryoverItems: 2,
};

const DEMO_CRM_PIPELINE = {
  totalLabel: "$312K",
  openCount: 14,
  deals: [
    { id: "d1", name: "Acme Corp", valueLabel: "$45K", stage: "Proposal" },
    { id: "d2", name: "Globex Inc", valueLabel: "$28K", stage: "Negotiation" },
    { id: "d3", name: "Initech LLC", valueLabel: "$18K", stage: "Discovery" },
  ],
};

const DEMO_LEADS_RECOVERED = [
  { key: "recovered", label: "Leads Recovered", value: "47" },
  { key: "carts", label: "Carts Recovered", value: "23" },
  { key: "revenue", label: "Revenue Saved", value: "$18.4K" },
];

const DEMO_INVESTMENT_PULSE = {
  totalLabel: "$142,800",
  changeLabel: "+1.8% today",
  up: true,
  holdings: [
    { symbol: "AAPL", valueLabel: "$12,450", change: "+2.3%", up: true },
    { symbol: "MSFT", valueLabel: "$8,220", change: "+1.1%", up: true },
    { symbol: "TSLA", valueLabel: "$5,100", change: "-0.8%", up: false },
  ],
};

const DEMO_CALENDAR = [
  { id: "c1", time: "9:00 AM", title: "Team standup", domain: "business" },
  { id: "c2", time: "11:30 AM", title: "Financial review", domain: "finance" },
  { id: "c3", time: "2:00 PM", title: "Client call — Acme", domain: "business" },
  { id: "c4", time: "5:00 PM", title: "Dentist (Maya)", domain: "concierge" },
];

const DEMO_ADVISORS = [
  { advisor_id: "strategy", display_name: "Strategy", domain: "business" as const, confidence: 92 },
  { advisor_id: "finance", display_name: "Finance", domain: "money" as const, confidence: 87 },
  { advisor_id: "concierge", display_name: "Concierge", domain: "concierge" as const, confidence: 95 },
  { advisor_id: "growth", display_name: "Growth", domain: "growth" as const, confidence: 78 },
];

const DEMO_NOTIFICATIONS_FEED = [
  { id: "n1", title: "Collections follow-up overdue", urgency: "high", domain: "finance", created_at: new Date(Date.now() - 12 * 60_000).toISOString() },
  { id: "n2", title: "Insurance renewal due Friday", urgency: "medium", domain: "finance", created_at: new Date(Date.now() - 60 * 60_000).toISOString() },
  { id: "n3", title: "Flight to NYC confirmed", urgency: "low", domain: "concierge", created_at: new Date(Date.now() - 3 * 60 * 60_000).toISOString() },
];

const DEMO_BUSINESS_PULSE = [
  { symbol: "REVENUE", name: "Monthly Revenue", value: "$48.2K", change: "+12.3%", up: true },
  { symbol: "PIPELINE", name: "Active Pipeline", value: "$127K", change: "+8.7%", up: true },
  { symbol: "NET", name: "Net Worth", value: "$2.4M", change: "+0.89%", up: true },
];

const DEMO_PORTFOLIO_MAP = [
  { name: "Tech", pct: 42, color: "bg-sky-400" },
  { name: "Healthcare", pct: 24, color: "bg-emerald-400" },
  { name: "Finance", pct: 18, color: "bg-violet-400" },
  { name: "Other", pct: 16, color: "bg-white/20" },
];

// ─────────── Utility ───────────

function fmtMoneyFromCents(cents: number): string {
  if (!isFinite(cents)) return "$0";
  if (cents >= 1_000_000_00) return `$${(cents / 100_000_000).toFixed(1)}M`;
  if (cents >= 1_000_00) return `$${(cents / 100_000).toFixed(1)}K`;
  return `$${(cents / 100).toFixed(0)}`;
}

function timeAgo(iso: string | null | undefined): string {
  if (!iso) return "";
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 60_000) return "just now";
  if (ms < 3_600_000) return `${Math.floor(ms / 60_000)}m ago`;
  if (ms < 86_400_000) return `${Math.floor(ms / 3_600_000)}h ago`;
  return `${Math.floor(ms / 86_400_000)}d ago`;
}

// ─────────── Hooks ───────────

export function useWhatMattersData() {
  const { user } = useAuth();
  const { isDemoMode } = useDataMode();
  const q = useQuery({
    queryKey: ["desktop-what-matters", user?.id],
    enabled: !!user && !isDemoMode,
    staleTime: STALE,
    queryFn: async () => {
      const [biz, fin, con] = await Promise.all([
        fromTable("ai_workforce_approval_queue").select("id", { count: "exact", head: true }).eq("user_id", user!.id).eq("status", "pending"),
        fromTable("notifications").select("id", { count: "exact", head: true }).eq("user_id", user!.id).eq("read", false).eq("domain", "finance"),
        fromTable("household_tasks").select("id", { count: "exact", head: true }).eq("user_id", user!.id).eq("status", "pending"),
      ]);
      return [
        { id: "business", label: "Business", color: "text-violet-300", count: biz.count ?? 0, summary: `${biz.count ?? 0} pending approval${(biz.count ?? 0) === 1 ? "" : "s"} awaiting review.` },
        { id: "finance", label: "Finance", color: "text-emerald-300", count: fin.count ?? 0, summary: `${fin.count ?? 0} unread finance signal${(fin.count ?? 0) === 1 ? "" : "s"}.` },
        { id: "concierge", label: "Concierge", color: "text-amber-200", count: con.count ?? 0, summary: `${con.count ?? 0} household task${(con.count ?? 0) === 1 ? "" : "s"} pending.` },
      ];
    },
  });
  const data = isDemoMode ? DEMO_WHAT_MATTERS : (q.data ?? []);
  return { data, isLoading: !isDemoMode && q.isLoading, isEmpty: !isDemoMode && data.every((d) => d.count === 0) };
}

export function useBusinessKPIData() {
  const { isDemoMode } = useDataMode();
  const { user } = useAuth();
  const q = useQuery({
    queryKey: ["desktop-business-kpi", user?.id],
    enabled: !!user && !isDemoMode,
    staleTime: STALE,
    queryFn: async () => {
      const [deals, approvals] = await Promise.all([
        fromTable("deals").select("value_cents,status").eq("user_id", user!.id),
        fromTable("ai_workforce_approval_queue").select("id", { count: "exact", head: true }).eq("user_id", user!.id).eq("status", "pending"),
      ]);
      const dealRows = (deals.data ?? []) as Array<{ value_cents: number; status: string }>;
      const pipeline = dealRows.filter((d) => d.status !== "closed_won" && d.status !== "closed_lost").reduce((s, d) => s + (d.value_cents ?? 0), 0);
      const revenue = dealRows.filter((d) => d.status === "closed_won").reduce((s, d) => s + (d.value_cents ?? 0), 0);
      return [
        { label: "Revenue", value: fmtMoneyFromCents(revenue), change: dealRows.length === 0 ? "—" : "live", up: true },
        { label: "Pipeline", value: fmtMoneyFromCents(pipeline), change: `${dealRows.length} deals`, up: true },
        { label: "Approvals", value: String(approvals.count ?? 0), change: (approvals.count ?? 0) > 0 ? "pending" : "clear", up: (approvals.count ?? 0) === 0 },
      ];
    },
  });
  const data = isDemoMode ? DEMO_BUSINESS_KPI : (q.data ?? []);
  const isEmpty = !isDemoMode && data.length > 0 && data.every((k) => k.value === "$0" || k.value === "0");
  return { data, isLoading: !isDemoMode && q.isLoading, isEmpty };
}

export function useFinanceSnapshotData() {
  const { isDemoMode } = useDataMode();
  const { user } = useAuth();
  const q = useQuery({
    queryKey: ["desktop-finance-snapshot", user?.id],
    enabled: !!user && !isDemoMode,
    staleTime: STALE,
    queryFn: async () => {
      const [holdings, files] = await Promise.all([
        fromTable("holdings").select("current_value_cents,avg_cost_cents,quantity").eq("user_id", user!.id).eq("status", "open"),
        fromTable("cloud_files").select("id", { count: "exact", head: true }).eq("user_id", user!.id).eq("deleted", false),
      ]);
      const rows = (holdings.data ?? []) as Array<{ current_value_cents: number; avg_cost_cents: number; quantity: number }>;
      const totalCents = rows.reduce((s, h) => s + (Number(h.current_value_cents) || 0), 0);
      const costCents = rows.reduce((s, h) => s + (Number(h.avg_cost_cents) || 0) * (Number(h.quantity) || 0), 0);
      const monthDeltaPct = costCents > 0 ? ((totalCents - costCents) / costCents) * 100 : 0;
      return { totalCents, fileCount: files.count ?? 0, monthDeltaPct };
    },
  });
  const data = isDemoMode ? DEMO_FINANCE_SNAPSHOT : (q.data ?? { totalCents: 0, fileCount: 0, monthDeltaPct: 0 });
  return { data, isLoading: !isDemoMode && q.isLoading, isEmpty: !isDemoMode && data.totalCents === 0 && data.fileCount === 0 };
}

export function useConciergeTasksData() {
  const { isDemoMode } = useDataMode();
  const { user } = useAuth();
  const q = useQuery({
    queryKey: ["desktop-concierge-tasks", user?.id],
    enabled: !!user && !isDemoMode,
    staleTime: STALE,
    queryFn: async () => {
      const r = await fromTable("household_tasks").select("id,title,due_date,status,metadata").eq("user_id", user!.id).neq("status", "done").order("due_date", { ascending: true, nullsFirst: false }).limit(5);
      return ((r.data ?? []) as any[]).map((t) => {
        const due = t.due_date ? new Date(t.due_date) : null;
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
        let dueLabel = "—";
        if (due) {
          if (due.getTime() === today.getTime()) dueLabel = "Today";
          else if (due.getTime() === tomorrow.getTime()) dueLabel = "Tomorrow";
          else dueLabel = due.toLocaleDateString(undefined, { month: "short", day: "numeric" });
        }
        const priority = (t.metadata?.priority ?? "low") as "high" | "medium" | "low";
        return { id: t.id, title: t.title, dueLabel, priority };
      });
    },
  });
  const data = isDemoMode ? DEMO_CONCIERGE_TASKS : (q.data ?? []);
  return { data, isLoading: !isDemoMode && q.isLoading, isEmpty: !isDemoMode && data.length === 0 };
}

export function useBoardroomBriefData() {
  const { isDemoMode } = useDataMode();
  const { user } = useAuth();
  const q = useQuery({
    queryKey: ["desktop-boardroom-brief", user?.id],
    enabled: !!user && !isDemoMode,
    staleTime: STALE,
    queryFn: async () => {
      const [items, receipts] = await Promise.all([
        fromTable("boardroom_items").select("id,title,status").eq("user_id", user!.id).in("status", ["new", "in_review"]),
        fromTable("boardroom_decision_receipts").select("approved_motion,created_at").eq("user_id", user!.id).order("created_at", { ascending: false }).limit(1),
      ]);
      const itemRows = (items.data ?? []) as any[];
      const lastReceipt = ((receipts.data ?? []) as any[])[0];
      return {
        nextSessionLabel: lastReceipt ? `Last decision ${timeAgo(lastReceipt.created_at)}` : "No sessions yet",
        topic: lastReceipt?.approved_motion ?? "Awaiting next escalation",
        pendingDecisions: itemRows.filter((i) => i.status === "in_review").length,
        carryoverItems: itemRows.filter((i) => i.status === "new").length,
      };
    },
  });
  const data = isDemoMode ? DEMO_BOARDROOM_BRIEF : (q.data ?? { nextSessionLabel: "—", topic: "—", pendingDecisions: 0, carryoverItems: 0 });
  return { data, isLoading: !isDemoMode && q.isLoading, isEmpty: !isDemoMode && data.pendingDecisions === 0 && data.carryoverItems === 0 };
}

export function useCRMPipelineData() {
  const { isDemoMode } = useDataMode();
  const { user } = useAuth();
  const q = useQuery({
    queryKey: ["desktop-crm-pipeline", user?.id],
    enabled: !!user && !isDemoMode,
    staleTime: STALE,
    queryFn: async () => {
      const r = await fromTable("deals").select("id,title,value_cents,stage,status").eq("user_id", user!.id).order("value_cents", { ascending: false }).limit(20);
      const rows = ((r.data ?? []) as any[]).filter((d) => d.status !== "closed_lost");
      const open = rows.filter((d) => d.status !== "closed_won");
      const totalCents = open.reduce((s, d) => s + (d.value_cents ?? 0), 0);
      return {
        totalLabel: fmtMoneyFromCents(totalCents),
        openCount: open.length,
        deals: open.slice(0, 3).map((d) => ({ id: d.id, name: d.title, valueLabel: fmtMoneyFromCents(d.value_cents ?? 0), stage: d.stage ?? "discovery" })),
      };
    },
  });
  const data = isDemoMode ? DEMO_CRM_PIPELINE : (q.data ?? { totalLabel: "$0", openCount: 0, deals: [] });
  return { data, isLoading: !isDemoMode && q.isLoading, isEmpty: !isDemoMode && data.openCount === 0 };
}

export function useLeadsRecoveredData() {
  const { isDemoMode } = useDataMode();
  const { user } = useAuth();
  const q = useQuery({
    queryKey: ["desktop-leads-recovered", user?.id],
    enabled: !!user && !isDemoMode,
    staleTime: STALE,
    queryFn: async () => {
      const r = await fromTable("leads").select("status,likely_value").eq("user_id", user!.id);
      const rows = (r.data ?? []) as Array<{ status: string; likely_value: number | null }>;
      const recovered = rows.filter((l) => l.status === "qualified" || l.status === "won").length;
      const lost = rows.filter((l) => l.status === "lost").length;
      const revenue = rows.filter((l) => l.status === "won").reduce((s, l) => s + (Number(l.likely_value) || 0), 0);
      return [
        { key: "recovered", label: "Leads Recovered", value: String(recovered) },
        { key: "lost", label: "Leads Lost", value: String(lost) },
        { key: "revenue", label: "Revenue Won", value: revenue >= 1000 ? `$${(revenue / 1000).toFixed(1)}K` : `$${revenue.toFixed(0)}` },
      ];
    },
  });
  const data = isDemoMode ? DEMO_LEADS_RECOVERED : (q.data ?? []);
  return { data, isLoading: !isDemoMode && q.isLoading, isEmpty: !isDemoMode && data.length > 0 && data.every((s) => s.value === "0" || s.value === "$0") };
}

export function useInvestmentPulseData() {
  const { isDemoMode } = useDataMode();
  const { user } = useAuth();
  const q = useQuery({
    queryKey: ["desktop-investment-pulse", user?.id],
    enabled: !!user && !isDemoMode,
    staleTime: STALE,
    queryFn: async () => {
      const r = await fromTable("holdings").select("symbol,current_value_cents,avg_cost_cents,quantity").eq("user_id", user!.id).eq("status", "open").order("current_value_cents", { ascending: false }).limit(5);
      const rows = ((r.data ?? []) as any[]);
      const totalCents = rows.reduce((s, h) => s + (Number(h.current_value_cents) || 0), 0);
      const totalCost = rows.reduce((s, h) => s + (Number(h.avg_cost_cents) || 0) * (Number(h.quantity) || 0), 0);
      const deltaPct = totalCost > 0 ? ((totalCents - totalCost) / totalCost) * 100 : 0;
      return {
        totalLabel: fmtMoneyFromCents(totalCents),
        changeLabel: `${deltaPct >= 0 ? "+" : ""}${deltaPct.toFixed(1)}% all-time`,
        up: deltaPct >= 0,
        holdings: rows.slice(0, 3).map((h) => {
          const cost = (Number(h.avg_cost_cents) || 0) * (Number(h.quantity) || 0);
          const value = Number(h.current_value_cents) || 0;
          const dPct = cost > 0 ? ((value - cost) / cost) * 100 : 0;
          return { symbol: h.symbol, valueLabel: fmtMoneyFromCents(value), change: `${dPct >= 0 ? "+" : ""}${dPct.toFixed(1)}%`, up: dPct >= 0 };
        }),
      };
    },
  });
  const data = isDemoMode ? DEMO_INVESTMENT_PULSE : (q.data ?? { totalLabel: "$0", changeLabel: "—", up: true, holdings: [] });
  return { data, isLoading: !isDemoMode && q.isLoading, isEmpty: !isDemoMode && data.holdings.length === 0 };
}

export function useCalendarTodayData() {
  const { isDemoMode } = useDataMode();
  const { user } = useAuth();
  const q = useQuery({
    queryKey: ["desktop-calendar-today", user?.id],
    enabled: !!user && !isDemoMode,
    staleTime: STALE,
    queryFn: async () => {
      const today = new Date(); const iso = today.toISOString().slice(0, 10);
      const r = await fromTable("calendar_events").select("id,title,start_time,event_date,domain").eq("user_id", user!.id).eq("event_date", iso).order("start_time", { ascending: true, nullsFirst: true }).limit(8);
      return ((r.data ?? []) as any[]).map((e) => ({
        id: e.id,
        time: e.start_time ? new Date(e.start_time).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }) : "All day",
        title: e.title,
        domain: e.domain ?? "personal",
      }));
    },
  });
  const data = isDemoMode ? DEMO_CALENDAR : (q.data ?? []);
  return { data, isLoading: !isDemoMode && q.isLoading, isEmpty: !isDemoMode && data.length === 0 };
}

export function useAdvisorCouncilData() {
  const { isDemoMode } = useDataMode();
  const { user } = useAuth();
  const q = useQuery({
    queryKey: ["desktop-advisor-council", user?.id],
    enabled: !!user && !isDemoMode,
    staleTime: STALE,
    queryFn: async () => {
      const [profiles, recs] = await Promise.all([
        fromTable("advisor_profiles").select("advisor_id,display_name,domain").eq("user_id", user!.id).limit(8),
        fromTable("advisor_board_recommendations").select("advisor_id,confidence_score").eq("user_id", user!.id).order("created_at", { ascending: false }).limit(40),
      ]);
      const recRows = ((recs.data ?? []) as any[]);
      const confByAdvisor = new Map<string, number[]>();
      for (const r of recRows) {
        if (!confByAdvisor.has(r.advisor_id)) confByAdvisor.set(r.advisor_id, []);
        confByAdvisor.get(r.advisor_id)!.push(Number(r.confidence_score) || 0);
      }
      return ((profiles.data ?? []) as any[]).map((p) => {
        const arr = confByAdvisor.get(p.advisor_id) ?? [];
        const avg = arr.length ? arr.reduce((s, n) => s + n, 0) / arr.length : 0;
        return { advisor_id: p.advisor_id, display_name: p.display_name, domain: p.domain ?? "business", confidence: Math.round(avg * 100) };
      });
    },
  });
  const data = isDemoMode ? DEMO_ADVISORS : (q.data ?? []);
  return { data, isLoading: !isDemoMode && q.isLoading, isEmpty: !isDemoMode && data.length === 0 };
}

export function useNotificationsFeedData() {
  const { isDemoMode } = useDataMode();
  const { user } = useAuth();
  const q = useQuery({
    queryKey: ["desktop-notifications-feed", user?.id],
    enabled: !!user && !isDemoMode,
    staleTime: STALE,
    queryFn: async () => {
      const r = await fromTable("notifications").select("id,title,urgency,domain,created_at").eq("user_id", user!.id).eq("read", false).eq("dismissed", false).order("created_at", { ascending: false }).limit(5);
      return ((r.data ?? []) as any[]).map((n) => ({
        id: n.id,
        title: n.title,
        urgency: n.urgency ?? "low",
        domain: n.domain ?? "general",
        created_at: n.created_at,
      }));
    },
  });
  const data = isDemoMode ? DEMO_NOTIFICATIONS_FEED : (q.data ?? []);
  return { data, isLoading: !isDemoMode && q.isLoading, isEmpty: !isDemoMode && data.length === 0, timeAgo };
}

export function useBusinessPulseData() {
  // Powers DesktopNotificationsWidget (mislabeled — it's actually a stock-ticker style view)
  const { isDemoMode } = useDataMode();
  const { user } = useAuth();
  const q = useQuery({
    queryKey: ["desktop-business-pulse", user?.id],
    enabled: !!user && !isDemoMode,
    staleTime: STALE,
    queryFn: async () => {
      const [deals, holdings] = await Promise.all([
        fromTable("deals").select("value_cents,status").eq("user_id", user!.id),
        fromTable("holdings").select("current_value_cents,avg_cost_cents,quantity").eq("user_id", user!.id).eq("status", "open"),
      ]);
      const dRows = ((deals.data ?? []) as any[]);
      const hRows = ((holdings.data ?? []) as any[]);
      const revenue = dRows.filter((d) => d.status === "closed_won").reduce((s, d) => s + (d.value_cents ?? 0), 0);
      const pipeline = dRows.filter((d) => d.status !== "closed_won" && d.status !== "closed_lost").reduce((s, d) => s + (d.value_cents ?? 0), 0);
      const portfolio = hRows.reduce((s, h) => s + (Number(h.current_value_cents) || 0), 0);
      return [
        { symbol: "REVENUE", name: "Closed Won", value: fmtMoneyFromCents(revenue), change: dRows.length === 0 ? "—" : "live", up: true },
        { symbol: "PIPELINE", name: "Active Pipeline", value: fmtMoneyFromCents(pipeline), change: `${dRows.filter((d) => d.status !== "closed_won" && d.status !== "closed_lost").length} open`, up: true },
        { symbol: "NET", name: "Portfolio Value", value: fmtMoneyFromCents(portfolio), change: hRows.length === 0 ? "—" : "live", up: true },
      ];
    },
  });
  const data = isDemoMode ? DEMO_BUSINESS_PULSE : (q.data ?? []);
  const isEmpty = !isDemoMode && data.length > 0 && data.every((s) => s.value === "$0");
  return { data, isLoading: !isDemoMode && q.isLoading, isEmpty };
}

export function usePortfolioMapData() {
  const { isDemoMode } = useDataMode();
  const { user } = useAuth();
  const q = useQuery({
    queryKey: ["desktop-portfolio-map", user?.id],
    enabled: !!user && !isDemoMode,
    staleTime: STALE,
    queryFn: async () => {
      const r = await fromTable("holdings").select("current_value_cents,metadata").eq("user_id", user!.id).eq("status", "open");
      const rows = ((r.data ?? []) as any[]);
      const total = rows.reduce((s, h) => s + (Number(h.current_value_cents) || 0), 0);
      if (total === 0) return [];
      const bySector = new Map<string, number>();
      for (const h of rows) {
        const sector = (h.metadata?.sector as string) ?? "Other";
        bySector.set(sector, (bySector.get(sector) ?? 0) + (Number(h.current_value_cents) || 0));
      }
      const palette = ["bg-sky-400", "bg-emerald-400", "bg-violet-400", "bg-amber-400", "bg-rose-400", "bg-white/20"];
      return Array.from(bySector.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([name, cents], i) => ({ name, pct: Math.round((cents / total) * 100), color: palette[i] ?? "bg-white/20" }));
    },
  });
  const data = isDemoMode ? DEMO_PORTFOLIO_MAP : (q.data ?? []);
  return { data, isLoading: !isDemoMode && q.isLoading, isEmpty: !isDemoMode && data.length === 0 };
}
