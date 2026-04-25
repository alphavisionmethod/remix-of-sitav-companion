import { KPITile, SitaTabs, EmptyState } from "@/platform/sita/components/sita/SitaComponents";
import { CrossAppAction } from "@/platform/sita/components/sita/CrossAppAction";
import { TrustBadge } from "@/platform/sita/components/sita/TrustBadge";
import { SectionSkeleton } from "@/platform/sita/components/sita/SectionSkeleton";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
import { ModuleAdvisorInsight } from "@/platform/sita/components/sita/domain-shared/ModuleAdvisorInsight";
import { SITA_TYPE } from "@/platform/design-system/sita-design-tokens";
import { QueueCard } from "@/platform/sita/components/sita/cards";
import { useState, useMemo } from "react";
import {
  DollarSign, ArrowDownLeft, ArrowUpRight, Clock, AlertTriangle, CheckCircle,
  Send, Phone, Mail, Calendar, TrendingUp, Users, FileText, Shield,
  ChevronRight, BarChart3, Sparkles, Eye
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useInvoices, useBills } from "@/hooks/use-sita-data";
const RECEIVABLES = [
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
  current: "bg-[hsl(152_55%_48%)]", "30": "bg-[hsl(38_85%_58%)]", "60": "bg-[hsl(25_80%_50%)]", "90+": "bg-[hsl(0_70%_55%)]",
};

const ReceivablesObligations = () => {
  const [tab, setTab] = useState<ViewTab>("receivables");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data: invoices = [], isLoading: invLoading } = useInvoices();
  const { data: bills = [], isLoading: billsLoading } = useBills();

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
    return dbItems.length > 0 ? dbItems : RECEIVABLES;
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

  const agingData = useMemo(() => {
    const buckets: Record<AgingBucket, typeof receivables> = { current: [], "30": [], "60": [], "90+": [] };
    receivables.forEach(r => buckets[getAgingBucket(r.daysOverdue)].push(r));
    return buckets;
  }, [receivables]);

  if (invLoading || billsLoading) return <SectionSkeleton cards={4} columns={1} />;

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <div className="flex items-center gap-3 flex-wrap">
        <PageTruthBanner />
        <CrossAppAction to="/business/invoices" label="Invoices Hub" context={{ entityType: "invoice", entityId: "all" }} />
        <CrossAppAction to="/business/collections" label="Collections" context={{ entityType: "collection", entityId: "all" }} />
      </div>

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
        ]}
        active={tab}
        onChange={(t) => { setTab(t as ViewTab); setSelectedId(null); }}
      />

      <div className="grid gap-6 lg:grid-cols-5">
        <div className={`space-y-3 ${selected ? "lg:col-span-3" : "lg:col-span-5"}`}>

          {tab === "receivables" && (
            <QueueCard
              title="Receivables"
              items={receivables.map(r => ({
                id: r.id,
                label: `${r.source} — ${r.invoiceNum}`,
                meta: `$${r.amount.toLocaleString()} · ${r.status === "overdue" ? `${r.daysOverdue}d overdue` : `Due in ${Math.abs(r.daysOverdue)}d`}`,
                urgency: r.daysOverdue >= 60 ? "critical" as const : r.daysOverdue > 0 ? "high" as const : "normal" as const,
              }))}
              maxVisible={15}
              onItemClick={(id) => setSelectedId(id)}
            />
          )}

          {tab === "aging" && (
            <div className="space-y-4">
              <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_9%)] p-5">
                <h4 className={SITA_TYPE.cardTitle + " text-[hsl(0_0%_85%)] mb-4"}>Aging Summary</h4>
                <div className="flex h-8 rounded-lg overflow-hidden">
                  {(["current", "30", "60", "90+"] as AgingBucket[]).map(bucket => {
                    const total = agingData[bucket].reduce((s, r) => s + r.amount, 0);
                    const pct = totalReceivable > 0 ? (total / totalReceivable) * 100 : 0;
                    if (pct === 0) return null;
                    return (
                      <div key={bucket} className={`${BUCKET_COLORS[bucket]} flex items-center justify-center text-[10px] font-bold text-foreground`} style={{ width: `${pct}%` }}>
                        {pct > 10 && `${bucket === "current" ? "Current" : bucket + "d"}`}
                      </div>
                    );
                  })}
                </div>
                <div className="mt-3 grid grid-cols-4 gap-2 text-center">
                  {(["current", "30", "60", "90+"] as AgingBucket[]).map(bucket => (
                    <div key={bucket}>
                      <p className="text-[10px] text-[hsl(0_0%_50%)] uppercase">{bucket === "current" ? "Current" : `${bucket} Days`}</p>
                      <p className="text-sm font-bold text-[hsl(0_0%_85%)]">${agingData[bucket].reduce((s, r) => s + r.amount, 0).toLocaleString()}</p>
                      <p className="text-[10px] text-[hsl(0_0%_45%)]">{agingData[bucket].length} items</p>
                    </div>
                  ))}
                </div>
              </div>

              {(["90+", "60", "30", "current"] as AgingBucket[]).map(bucket => agingData[bucket].length > 0 && (
                <QueueCard
                  key={bucket}
                  title={`${bucket === "current" ? "Current" : `${bucket} Days Overdue`} — $${agingData[bucket].reduce((s, r) => s + r.amount, 0).toLocaleString()}`}
                  items={agingData[bucket].map(r => ({
                    id: r.id, label: r.source, meta: `$${r.amount.toLocaleString()}`,
                    urgency: bucket === "90+" ? "critical" as const : bucket === "60" ? "high" as const : "normal" as const,
                  }))}
                  onItemClick={(id) => setSelectedId(id)}
                />
              ))}
            </div>
          )}

          {tab === "reminders" && (
            <div className="space-y-3">
              {overdueItems.length === 0 ? (
                <EmptyState icon={Mail} title="No reminders needed" description="All invoices are current" />
              ) : overdueItems.map(r => (
                <div key={r.id} className="rounded-xl border border-[hsl(0_70%_55%/0.15)] bg-[hsl(0_0%_9%)] p-4 micro-hover-lift">
                  <div className="flex items-center gap-2 mb-2">
                    <p className={SITA_TYPE.cardTitle + " text-[hsl(0_0%_85%)]"}>{r.source}</p>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[hsl(0_70%_55%/0.12)] text-[hsl(0_70%_55%)]">{r.daysOverdue}d overdue</span>
                  </div>
                  <p className={SITA_TYPE.timelineMeta}>{r.invoiceNum} · ${r.amount.toLocaleString()} · {r.remindersSent} reminders sent</p>
                  <div className="mt-3 rounded-lg bg-[hsl(0_0%_100%/0.04)] p-3">
                    <div className="flex items-start gap-2">
                      <Sparkles className="h-3.5 w-3.5 text-[hsl(265_55%_58%)] mt-0.5 shrink-0" />
                      <p className="text-xs text-[hsl(0_0%_60%)]">
                        Hi {r.contactName.split(" ")[0]}, this is a friendly reminder that {r.invoiceNum} for ${r.amount.toLocaleString()} is now {r.daysOverdue} days past due.
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button className="micro-press flex items-center gap-1 rounded-lg bg-[hsl(152_55%_48%/0.12)] px-3 py-1.5 text-xs text-[hsl(152_55%_48%)] hover:bg-[hsl(152_55%_48%/0.20)] transition-colors"><Send className="h-3 w-3" /> Send</button>
                    <button className="micro-press flex items-center gap-1 rounded-lg bg-[hsl(0_0%_100%/0.04)] px-3 py-1.5 text-xs text-[hsl(0_0%_60%)] hover:bg-[hsl(0_0%_100%/0.08)] transition-colors"><Mail className="h-3 w-3" /> Edit</button>
                    <button className="micro-press flex items-center gap-1 rounded-lg bg-[hsl(0_0%_100%/0.04)] px-3 py-1.5 text-xs text-[hsl(0_0%_60%)] hover:bg-[hsl(0_0%_100%/0.08)] transition-colors"><Phone className="h-3 w-3" /> Call</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "collections" && (
            <div className="space-y-3">
              {collectionsItems.length === 0 ? (
                <EmptyState icon={Shield} title="No collections needed" description="No invoices are 60+ days overdue" />
              ) : (
                <QueueCard
                  title={`Collections Queue — $${collectionsItems.reduce((s, r) => s + r.amount, 0).toLocaleString()} at risk`}
                  items={collectionsItems.sort((a, b) => b.daysOverdue - a.daysOverdue).map(r => ({
                    id: r.id, label: `${r.source} — ${r.invoiceNum}`,
                    meta: `$${r.amount.toLocaleString()} · ${r.daysOverdue}d overdue`,
                    urgency: r.daysOverdue >= 90 ? "critical" as const : "high" as const,
                  }))}
                  onItemClick={(id) => setSelectedId(id)}
                />
              )}
            </div>
          )}

          {tab === "obligations" && (
            <div className="space-y-2">
              {obligations.length === 0 ? (
                <EmptyState icon={ArrowUpRight} title="No pending obligations" description="All bills are paid" />
              ) : (
                <QueueCard
                  title="Obligations"
                  items={obligations.map(o => ({
                    id: o.id, label: o.payee,
                    meta: `$${o.amount.toLocaleString()} · Due ${o.due}`,
                    urgency: o.status === "overdue" ? "critical" as const : o.status === "due" ? "high" as const : "normal" as const,
                  }))}
                />
              )}
            </div>
          )}
        </div>

        <AnimatePresence>
          {selected && (
            <motion.div className="lg:col-span-2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_12%)] p-5 sticky top-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className={SITA_TYPE.cardTitle + " text-[hsl(0_0%_90%)]"}>{selected.source}</h3>
                  <button onClick={() => setSelectedId(null)} className="text-xs text-[hsl(0_0%_50%)] hover:text-[hsl(0_0%_80%)]">✕</button>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-[hsl(0_0%_45%)] text-xs">Invoice</span><p className="font-semibold text-[hsl(0_0%_90%)]">{selected.invoiceNum}</p></div>
                  <div><span className="text-[hsl(0_0%_45%)] text-xs">Amount</span><p className="font-semibold text-[hsl(0_0%_90%)]">${selected.amount.toLocaleString()}</p></div>
                  <div><span className="text-[hsl(0_0%_45%)] text-xs">Status</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${selected.status === "overdue" ? "bg-[hsl(0_70%_55%/0.12)] text-[hsl(0_70%_55%)]" : "bg-[hsl(38_85%_58%/0.12)] text-[hsl(38_85%_58%)]"}`}>
                      {selected.status === "overdue" ? `${selected.daysOverdue}d overdue` : "Expected"}
                    </span>
                  </div>
                  <div><span className="text-[hsl(0_0%_45%)] text-xs">Reminders Sent</span><p className="font-semibold text-[hsl(0_0%_90%)]">{selected.remindersSent}</p></div>
                </div>

                <div className="border-t border-[hsl(0_0%_100%/0.06)] pt-3">
                  <p className="text-xs font-medium text-[hsl(0_0%_70%)] mb-2">Contact</p>
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[hsl(265_55%_58%/0.12)] text-xs font-semibold text-[hsl(265_55%_58%)]">{selected.initials}</div>
                    <div>
                      <p className="text-sm font-medium text-[hsl(0_0%_85%)]">{selected.contactName}</p>
                      {selected.contactEmail && <p className="text-xs text-[hsl(0_0%_50%)]">{selected.contactEmail}</p>}
                    </div>
                  </div>
                </div>

                {selected.notes && (
                  <div className="rounded-lg bg-[hsl(265_55%_58%/0.08)] p-3">
                    <p className="text-xs text-[hsl(0_0%_70%)]">{selected.notes}</p>
                  </div>
                )}

                {selected.status === "overdue" && (
                  <div className="flex gap-2 flex-wrap">
                    <button className="micro-press flex items-center gap-1 rounded-lg bg-[hsl(152_55%_48%/0.12)] px-3 py-1.5 text-xs text-[hsl(152_55%_48%)] hover:bg-[hsl(152_55%_48%/0.20)] transition-colors"><Send className="h-3 w-3" /> Send Reminder</button>
                    <button className="micro-press flex items-center gap-1 rounded-lg bg-[hsl(0_0%_100%/0.04)] px-3 py-1.5 text-xs text-[hsl(0_0%_60%)] hover:bg-[hsl(0_0%_100%/0.08)] transition-colors"><Phone className="h-3 w-3" /> Call</button>
                    <button className="micro-press flex items-center gap-1 rounded-lg bg-[hsl(0_0%_100%/0.04)] px-3 py-1.5 text-xs text-[hsl(0_0%_60%)] hover:bg-[hsl(0_0%_100%/0.08)] transition-colors"><FileText className="h-3 w-3" /> View Invoice</button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ModuleAdvisorInsight
        advisorName="Receivables Advisor"
        domain="finance"
        insight={`${overdueItems.length} overdue invoices totaling $${overdueItems.reduce((s, r) => s + r.amount, 0).toLocaleString()}. ${collectionsItems.length} accounts need escalation.`}
        confidence={85}
      />
    </motion.div>
  );
};

export default ReceivablesObligations;
