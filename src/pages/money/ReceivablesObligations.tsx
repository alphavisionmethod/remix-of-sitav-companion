import { SitaPageHeader, SitaCard, SitaCardTitle, SitaButton } from "@/components/sita/SitaCard";
import { KPITile, SitaTabs, EmptyState } from "@/components/sita/SitaComponents";
import { TrustBadge } from "@/components/sita/TrustBadge";
import { SectionSkeleton } from "@/components/sita/SectionSkeleton";
import { LiveAdvisorCard } from "@/components/sita/LiveAdvisorCard";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";
import { useState, useMemo } from "react";
import {
  DollarSign, ArrowDownLeft, ArrowUpRight, Clock, AlertTriangle, CheckCircle,
  Send, Phone, Mail, Calendar, TrendingUp, Users, FileText, Shield,
  ChevronRight, BarChart3, Sparkles, Eye
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useInvoices, useBills } from "@/hooks/use-sita-data";

/* ── Demo augmentation for aging + collection data ── */
const DEMO_RECEIVABLES = [
  { id: "DR01", source: "Acme Corp", initials: "AC", amount: 4200, invoiceNum: "INV-1042", daysOverdue: 45, status: "overdue" as const, lastContact: "Mar 28", remindersSent: 2, contactName: "Sarah Chen", contactEmail: "sarah@acme.co", notes: "Promised payment by Apr 15" },
  { id: "DR02", source: "TechStart Inc", initials: "TS", amount: 1850, invoiceNum: "INV-1038", daysOverdue: 62, status: "overdue" as const, lastContact: "Mar 15", remindersSent: 3, contactName: "Mike Rodriguez", contactEmail: "mike@techstart.io", notes: "Disputing line item #3" },
  { id: "DR03", source: "Green Valley LLC", initials: "GV", amount: 3600, invoiceNum: "INV-1045", daysOverdue: 12, status: "overdue" as const, lastContact: "Apr 5", remindersSent: 1, contactName: "David Park", contactEmail: "david@greenvalley.com", notes: "" },
  { id: "DR04", source: "Bright Media", initials: "BM", amount: 950, invoiceNum: "INV-1048", daysOverdue: -5, status: "expected" as const, lastContact: "Apr 8", remindersSent: 0, contactName: "Lisa Wang", contactEmail: "lisa@brightmedia.co", notes: "New client — first invoice" },
  { id: "DR05", source: "Summit Advisory", initials: "SA", amount: 7500, invoiceNum: "INV-1044", daysOverdue: 22, status: "overdue" as const, lastContact: "Mar 20", remindersSent: 2, contactName: "James Foster", contactEmail: "james@summit.co", notes: "Escalate if no response by Apr 12" },
  { id: "DR06", source: "Coastal Designs", initials: "CD", amount: 2100, invoiceNum: "INV-1050", daysOverdue: -14, status: "expected" as const, lastContact: "Apr 1", remindersSent: 0, contactName: "Emma Torres", contactEmail: "emma@coastal.design", notes: "" },
  { id: "DR07", source: "DataFlow Systems", initials: "DF", amount: 5400, invoiceNum: "INV-1033", daysOverdue: 91, status: "overdue" as const, lastContact: "Feb 28", remindersSent: 4, contactName: "Ryan Kim", contactEmail: "ryan@dataflow.io", notes: "Collections candidate — no response to 4 reminders" },
  { id: "DR08", source: "Pine Street Cafe", initials: "PS", amount: 680, invoiceNum: "INV-1051", daysOverdue: -21, status: "expected" as const, lastContact: "—", remindersSent: 0, contactName: "Carlos Ruiz", contactEmail: "carlos@pinestreet.com", notes: "" },
];

type AgingBucket = "current" | "30" | "60" | "90+";
type ViewTab = "receivables" | "aging" | "reminders" | "collections" | "obligations" | "timeline";

const getAgingBucket = (daysOverdue: number): AgingBucket => {
  if (daysOverdue <= 0) return "current";
  if (daysOverdue <= 30) return "30";
  if (daysOverdue <= 60) return "60";
  return "90+";
};

const BUCKET_COLORS: Record<AgingBucket, string> = {
  current: "bg-trust-verified",
  "30": "bg-trust-review",
  "60": "bg-urgency-medium",
  "90+": "bg-urgency-high",
};

const ReceivablesObligations = () => {
  const [tab, setTab] = useState<ViewTab>("receivables");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data: invoices = [], isLoading: invLoading } = useInvoices();
  const { data: bills = [], isLoading: billsLoading } = useBills();

  /* Merge demo data with DB data */
  const receivables = useMemo(() => {
    const dbItems = invoices.filter((i: Record<string, any>) => i.status !== "paid").map((i: Record<string, any>) => {
      const now = new Date();
      const dueDateStr = i.due_date || i.dueDate;
      const due = dueDateStr ? new Date(dueDateStr) : now;
      const daysOverdue = isNaN(due.getTime()) ? 0 : Math.ceil((now.getTime() - due.getTime()) / 86400000);
      const rawAmount = i.amount;
      const amount = typeof rawAmount === "string" ? Number(rawAmount.replace(/[^0-9.-]/g, "")) : (Number(rawAmount) || 0);
      const clientName = i.client_name || i.client || "Unknown";
      const invoiceNum = i.invoice_number || i.id || "—";
      return {
        id: i.id, source: clientName, initials: clientName.slice(0, 2).toUpperCase(),
        amount, invoiceNum: invoiceNum.startsWith("#") ? invoiceNum : `#${invoiceNum}`, daysOverdue, status: (daysOverdue > 0 ? "overdue" : "expected") as "overdue" | "expected",
        lastContact: "—", remindersSent: 0, contactName: clientName, contactEmail: i.contactEmail || "", notes: i.notes || "",
      };
    });
    return dbItems.length > 0 ? dbItems : DEMO_RECEIVABLES;
  }, [invoices]);

  const obligations = useMemo(() =>
    bills.filter((b: Record<string, any>) => b.status !== "paid").map((b: Record<string, any>) => {
      const now = new Date();
      const due = new Date(b.due_date);
      const daysOut = Math.ceil((due.getTime() - now.getTime()) / 86400000);
      return {
        id: b.id, payee: b.name || b.payee, amount: (typeof b.amount === "string" ? Number(b.amount.replace(/[^0-9.-]/g, "")) : Number(b.amount)) || 0,
        due: due.toLocaleDateString("en", { month: "short", day: "numeric" }),
        type: b.category || "bill", status: daysOut < 0 ? "overdue" : daysOut <= 1 ? "due" : "upcoming",
        recurring: b.is_recurring || false,
      };
    }),
  [bills]);

  const selected = receivables.find(r => r.id === selectedId);
  const totalReceivable = receivables.reduce((s, r) => s + r.amount, 0);
  const totalObligation = obligations.reduce((s, o) => s + o.amount, 0);
  const overdueItems = receivables.filter(r => r.status === "overdue");
  const collectionsItems = receivables.filter(r => r.daysOverdue >= 60);

  /* Aging buckets */
  const agingData = useMemo(() => {
    const buckets: Record<AgingBucket, typeof receivables> = { current: [], "30": [], "60": [], "90+": [] };
    receivables.forEach(r => buckets[getAgingBucket(r.daysOverdue)].push(r));
    return buckets;
  }, [receivables]);

  /* Expected cash timeline */
  const timelineWeeks = useMemo(() => {
    const weeks = [
      { label: "This Week", items: receivables.filter(r => r.daysOverdue <= 0 && r.daysOverdue > -7) },
      { label: "Next Week", items: receivables.filter(r => r.daysOverdue <= -7 && r.daysOverdue > -14) },
      { label: "2-4 Weeks", items: receivables.filter(r => r.daysOverdue <= -14 && r.daysOverdue > -28) },
      { label: "Overdue (action needed)", items: overdueItems },
    ];
    return weeks;
  }, [receivables, overdueItems]);

  if (invLoading || billsLoading) return <SectionSkeleton cards={4} columns={1} />;

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <DemoModeBadge />
      <SitaPageHeader title="Receivables & Obligations" subtitle="Cash recovery, aging analysis, and obligation tracking" />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KPITile label="Total Receivable" value={`$${(totalReceivable / 1000).toFixed(1)}K`} icon={ArrowDownLeft} sub={`${receivables.length} invoices`} />
        <KPITile label="Overdue" value={`$${(overdueItems.reduce((s, r) => s + r.amount, 0) / 1000).toFixed(1)}K`} icon={AlertTriangle} sub={`${overdueItems.length} past due`} />
        <KPITile label="Collections Risk" value={collectionsItems.length} icon={Shield} sub="60+ days overdue" />
        <KPITile label="Net Position" value={`${totalReceivable >= totalObligation ? "+" : "-"}$${Math.abs(totalReceivable - totalObligation).toLocaleString()}`} trend={totalReceivable >= totalObligation ? "up" : "down"} icon={DollarSign} />
      </div>

      <SitaTabs
        tabs={[
          { key: "receivables", label: "Receivables", count: receivables.length },
          { key: "aging", label: "Aging View" },
          { key: "reminders", label: "Reminders", count: overdueItems.length },
          { key: "collections", label: "Collections", count: collectionsItems.length },
          { key: "obligations", label: "Obligations", count: obligations.length },
          { key: "timeline", label: "Cash Timeline" },
        ]}
        active={tab}
        onChange={(t) => { setTab(t as ViewTab); setSelectedId(null); }}
      />

      <div className="grid gap-6 lg:grid-cols-5">
        {/* ── Main content area ── */}
        <div className={`space-y-3 ${selected ? "lg:col-span-3" : "lg:col-span-5"}`}>

          {/* Receivables list */}
          {tab === "receivables" && receivables.map((r) => (
            <SitaCard key={r.id} lane={r.status === "overdue" ? "action" : "opportunity"}
              className={`p-4 cursor-pointer ${selectedId === r.id ? "ring-2 ring-primary/40" : ""}`}
              onClick={() => setSelectedId(r.id)}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-trust-verified/8 font-display text-sm font-semibold text-trust-verified shrink-0">{r.initials}</div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">{r.source}</p>
                    <p className="text-xs text-muted-foreground">{r.invoiceNum} · {r.status === "overdue" ? `${r.daysOverdue}d overdue` : `Due in ${Math.abs(r.daysOverdue)}d`} · {r.remindersSent} reminders</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-display text-sm font-bold text-foreground">${r.amount.toLocaleString()}</p>
                  <TrustBadge level={r.status === "overdue" ? (r.daysOverdue >= 60 ? "blocked" : "degraded") : "review"} label={r.status === "overdue" ? `${r.daysOverdue}d late` : "Expected"} size="sm" />
                </div>
              </div>
            </SitaCard>
          ))}

          {/* Aging view */}
          {tab === "aging" && (
            <div className="space-y-4">
              {/* Aging bar */}
              <SitaCard hover={false} className="p-5">
                <SitaCardTitle>Aging Summary</SitaCardTitle>
                <div className="mt-4 flex h-8 rounded-lg overflow-hidden">
                  {(["current", "30", "60", "90+"] as AgingBucket[]).map(bucket => {
                    const total = agingData[bucket].reduce((s, r) => s + r.amount, 0);
                    const pct = totalReceivable > 0 ? (total / totalReceivable) * 100 : 0;
                    if (pct === 0) return null;
                    return (
                      <div key={bucket} className={`${BUCKET_COLORS[bucket]} flex items-center justify-center text-[10px] font-bold text-primary-foreground`} style={{ width: `${pct}%` }}>
                        {pct > 10 && `${bucket === "current" ? "Current" : bucket + "d"}`}
                      </div>
                    );
                  })}
                </div>
                <div className="mt-3 grid grid-cols-4 gap-2 text-center">
                  {(["current", "30", "60", "90+"] as AgingBucket[]).map(bucket => (
                    <div key={bucket}>
                      <p className="text-[10px] text-muted-foreground uppercase">{bucket === "current" ? "Current" : `${bucket} Days`}</p>
                      <p className="font-display text-sm font-bold">${agingData[bucket].reduce((s, r) => s + r.amount, 0).toLocaleString()}</p>
                      <p className="text-[10px] text-muted-foreground">{agingData[bucket].length} items</p>
                    </div>
                  ))}
                </div>
              </SitaCard>

              {(["90+", "60", "30", "current"] as AgingBucket[]).map(bucket => agingData[bucket].length > 0 && (
                <div key={bucket}>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{bucket === "current" ? "Current" : `${bucket} Days Overdue`} — ${agingData[bucket].reduce((s, r) => s + r.amount, 0).toLocaleString()}</p>
                  {agingData[bucket].map(r => (
                    <SitaCard key={r.id} lane={bucket === "90+" ? "action" : bucket === "60" ? "action" : undefined} className="p-3 mb-2 cursor-pointer" onClick={() => { setSelectedId(r.id); }}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${BUCKET_COLORS[bucket]}`} />
                          <span className="text-sm font-medium">{r.source}</span>
                          <span className="text-xs text-muted-foreground">{r.invoiceNum}</span>
                        </div>
                        <span className="font-display text-sm font-bold">${r.amount.toLocaleString()}</span>
                      </div>
                    </SitaCard>
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* Reminders tab — draft preparation */}
          {tab === "reminders" && (
            <div className="space-y-3">
              {overdueItems.length === 0 ? (
                <EmptyState icon={Mail} title="No reminders needed" description="All invoices are current" />
              ) : overdueItems.map(r => (
                <SitaCard key={r.id} lane="action" className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{r.source}</p>
                        <TrustBadge level={r.daysOverdue >= 60 ? "blocked" : "degraded"} label={`${r.daysOverdue}d overdue`} size="sm" />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{r.invoiceNum} · ${r.amount.toLocaleString()} · {r.remindersSent} reminders sent · Last: {r.lastContact}</p>
                      {r.notes && <p className="text-xs text-accent mt-1">Note: {r.notes}</p>}

                      <div className="mt-3 rounded-xl bg-secondary/30 p-3">
                        <div className="flex items-start gap-2">
                          <Sparkles className="h-3.5 w-3.5 text-accent mt-0.5 shrink-0" />
                          <div>
                            <p className="text-[10px] font-medium text-foreground uppercase tracking-wider">Draft Reminder</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Hi {r.contactName.split(" ")[0]}, this is a friendly reminder that {r.invoiceNum} for ${r.amount.toLocaleString()} is now {r.daysOverdue} days past due.
                              {r.daysOverdue >= 60 ? " We'd appreciate your prompt attention to this matter." : " Please let us know if you have any questions."}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <SitaButton variant="accent" size="sm"><Send className="h-3 w-3" /> Approve & Send</SitaButton>
                    <SitaButton variant="secondary" size="sm"><Mail className="h-3 w-3" /> Edit Draft</SitaButton>
                    <SitaButton variant="ghost" size="sm"><Phone className="h-3 w-3" /> Call Instead</SitaButton>
                  </div>
                </SitaCard>
              ))}
            </div>
          )}

          {/* Collections tab */}
          {tab === "collections" && (
            <div className="space-y-3">
              {collectionsItems.length === 0 ? (
                <EmptyState icon={Shield} title="No collections needed" description="No invoices are 60+ days overdue" />
              ) : (
                <>
                  <SitaCard hover={false} className="p-4 gradient-sita-subtle">
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-urgency-high" />
                      <div>
                        <p className="text-sm font-semibold text-foreground">Collections Queue — ${collectionsItems.reduce((s, r) => s + r.amount, 0).toLocaleString()} at risk</p>
                        <p className="text-xs text-muted-foreground">{collectionsItems.length} accounts past 60 days. Escalation recommended.</p>
                      </div>
                    </div>
                  </SitaCard>
                  {collectionsItems.sort((a, b) => b.daysOverdue - a.daysOverdue).map(r => (
                    <SitaCard key={r.id} lane="action" className="p-4 cursor-pointer" onClick={() => setSelectedId(r.id)}>
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-urgency-high/10 font-display text-sm font-semibold text-urgency-high shrink-0">{r.initials}</div>
                          <div>
                            <p className="text-sm font-medium">{r.source}</p>
                            <p className="text-xs text-muted-foreground">{r.invoiceNum} · {r.daysOverdue} days overdue · {r.remindersSent} reminders</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-display text-sm font-bold">${r.amount.toLocaleString()}</p>
                          <p className="text-[10px] text-urgency-high font-medium">{r.daysOverdue >= 90 ? "ESCALATE" : "FOLLOW UP"}</p>
                        </div>
                      </div>
                      {/* Escalation ladder */}
                      <div className="mt-3 flex items-center gap-1 text-[10px]">
                        {["Reminder", "Follow-up", "Final Notice", "Collections"].map((step, i) => {
                          const activeStep = r.daysOverdue >= 90 ? 3 : r.daysOverdue >= 60 ? 2 : r.daysOverdue >= 30 ? 1 : 0;
                          return (
                            <div key={step} className="flex items-center gap-1">
                              <div className={`px-2 py-0.5 rounded-full ${i <= activeStep ? "bg-urgency-high/20 text-urgency-high font-medium" : "bg-secondary text-muted-foreground"}`}>{step}</div>
                              {i < 3 && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
                            </div>
                          );
                        })}
                      </div>
                    </SitaCard>
                  ))}
                </>
              )}
            </div>
          )}

          {/* Obligations */}
          {tab === "obligations" && (
            <div className="space-y-2">
              {obligations.length === 0 ? (
                <EmptyState icon={ArrowUpRight} title="No pending obligations" description="All bills are paid" />
              ) : obligations.map((o) => (
                <SitaCard key={o.id} lane={o.status === "due" ? "action" : undefined} className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{o.payee}</p>
                      <p className="text-xs text-muted-foreground">{o.type} · {o.recurring ? "Recurring" : "One-time"} · Due {o.due}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-display text-sm font-bold text-foreground">${o.amount.toLocaleString()}</p>
                      <TrustBadge level={o.status === "due" ? "degraded" : o.status === "overdue" ? "blocked" : "review"} label={o.status} size="sm" />
                    </div>
                  </div>
                </SitaCard>
              ))}
            </div>
          )}

          {/* Expected cash timeline */}
          {tab === "timeline" && (
            <div className="space-y-4">
              <SitaCard hover={false} className="p-5">
                <SitaCardTitle>Expected Cash Inflow Timeline</SitaCardTitle>
                <p className="text-xs text-muted-foreground mt-1">Projected receivables by collection window</p>
                <div className="mt-4 flex h-6 rounded-lg overflow-hidden">
                  {timelineWeeks.map((w, i) => {
                    const total = w.items.reduce((s, r) => s + r.amount, 0);
                    const pct = totalReceivable > 0 ? (total / totalReceivable) * 100 : 0;
                    if (pct === 0) return null;
                    const colors = ["bg-trust-verified", "bg-trust-review", "bg-accent", "bg-urgency-high"];
                    return <div key={i} className={`${colors[i]} flex items-center justify-center text-[9px] font-bold text-primary-foreground`} style={{ width: `${pct}%` }} />;
                  })}
                </div>
              </SitaCard>
              {timelineWeeks.map((w, i) => w.items.length > 0 && (
                <div key={i}>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{w.label} — ${w.items.reduce((s, r) => s + r.amount, 0).toLocaleString()}</p>
                  {w.items.map(r => (
                    <SitaCard key={r.id} className="p-3 mb-2 cursor-pointer" onClick={() => setSelectedId(r.id)}>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{r.source}</span>
                        <span className="font-display text-sm font-bold">${r.amount.toLocaleString()}</span>
                      </div>
                    </SitaCard>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Detail sidebar ── */}
        <AnimatePresence>
          {selected && (
            <motion.div className="lg:col-span-2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <SitaCard hover={false} className="p-5 sticky top-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-base font-bold">{selected.source}</h3>
                  <button onClick={() => setSelectedId(null)} className="text-xs text-muted-foreground hover:text-foreground">✕</button>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground text-xs">Invoice</span><p className="font-semibold">{selected.invoiceNum}</p></div>
                  <div><span className="text-muted-foreground text-xs">Amount</span><p className="font-semibold">${selected.amount.toLocaleString()}</p></div>
                  <div><span className="text-muted-foreground text-xs">Status</span>
                    <TrustBadge level={selected.status === "overdue" ? "degraded" : "review"} label={selected.status === "overdue" ? `${selected.daysOverdue}d overdue` : "Expected"} size="sm" />
                  </div>
                  <div><span className="text-muted-foreground text-xs">Reminders Sent</span><p className="font-semibold">{selected.remindersSent}</p></div>
                </div>

                <div className="border-t border-border pt-3">
                  <p className="text-xs font-medium mb-2">Contact</p>
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 font-display text-xs font-semibold text-primary">{selected.initials}</div>
                    <div>
                      <p className="text-sm font-medium">{selected.contactName}</p>
                      {selected.contactEmail && <p className="text-xs text-muted-foreground">{selected.contactEmail}</p>}
                    </div>
                  </div>
                </div>

                {selected.notes && (
                  <div className="rounded-xl bg-accent/10 p-3">
                    <p className="text-xs text-muted-foreground">{selected.notes}</p>
                  </div>
                )}

                <div className="border-t border-border pt-3">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Activity</p>
                  <div className="space-y-1.5">
                    {selected.remindersSent > 0 && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <div className="h-1.5 w-1.5 rounded-full bg-trust-review" />
                        Last contacted {selected.lastContact}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                      Invoice sent · {selected.invoiceNum}
                    </div>
                  </div>
                </div>

                {selected.status === "overdue" && (
                  <div className="flex gap-2 flex-wrap">
                    <SitaButton variant="accent" size="sm"><Send className="h-3 w-3" /> Send Reminder</SitaButton>
                    <SitaButton variant="secondary" size="sm"><Phone className="h-3 w-3" /> Call</SitaButton>
                    <SitaButton variant="ghost" size="sm"><FileText className="h-3 w-3" /> View Invoice</SitaButton>
                  </div>
                )}
              </SitaCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <LiveAdvisorCard
        advisor="money"
        intent="receivables_review"
        demoName="Receivables Advisor"
        demoRole="Cash Recovery Intelligence"
        demoConfidence="High"
        demoRecommendation={`${overdueItems.length} overdue invoices totaling $${overdueItems.reduce((s, r) => s + r.amount, 0).toLocaleString()}. ${collectionsItems.length} accounts need escalation.`}
        demoReasoning="Analyzing payment patterns, contact history, and aging data to prioritize recovery actions and draft appropriate reminders."
      />
    </motion.div>
  );
};

export default ReceivablesObligations;
