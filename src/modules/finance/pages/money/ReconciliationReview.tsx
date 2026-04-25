import { KPITile, SitaTabs, EmptyState } from "@/components/sita/SitaComponents";
import { TrustBadge } from "@/components/sita/TrustBadge";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { ModuleAdvisorInsight } from "@/components/sita/domain-shared/ModuleAdvisorInsight";
import { SITA_TYPE } from "@/platform/design-system/sita-design-tokens";
import { QueueCard } from "@/components/sita/cards";
import { useState } from "react";
import {
  Search, AlertTriangle, HelpCircle, RefreshCw, CheckCircle2, ArrowRight,
  FileQuestion, Tag, Repeat, Eye, Clock, DollarSign, ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
type IssueType = "mismatch" | "uncategorized" | "recurring-change" | "duplicate" | "missing-receipt";
type ReviewStatus = "open" | "investigating" | "resolved" | "deferred";

interface ReconciliationItem {
  id: string;
  title: string;
  description: string;
  issueType: IssueType;
  status: ReviewStatus;
  amount: number;
  date: string;
  source: string;
  linkedTransaction?: string;
  severity: "low" | "medium" | "high";
  suggestedAction: string;
}

const ITEMS: ReconciliationItem[] = [
  { id: "R01", title: "Statement vs recorded mismatch", description: "Chase checking shows $4,230 but recorded balance is $4,180. Difference: $50.", issueType: "mismatch", status: "open", amount: 50, date: "Apr 10", source: "Chase Checking", severity: "medium", suggestedAction: "Review recent transactions for missing entry" },
  { id: "R02", title: "Uncategorized Stripe deposit", description: "Stripe payout of $1,840 has no category assigned.", issueType: "uncategorized", status: "open", amount: 1840, date: "Apr 9", source: "Stripe", severity: "low", suggestedAction: "Categorize as Business Revenue" },
  { id: "R03", title: "AWS charge increased 18%", description: "Monthly AWS charge rose from $342 to $403 without a plan change.", issueType: "recurring-change", status: "investigating", amount: 61, date: "Apr 3", source: "AWS", severity: "medium", suggestedAction: "Review usage spike or contact support" },
  { id: "R04", title: "Duplicate Zoom charge", description: "Two Zoom charges of $14.99 on same day — possible duplicate.", issueType: "duplicate", status: "open", amount: 14.99, date: "Apr 7", source: "Zoom", severity: "low", suggestedAction: "Dispute duplicate charge" },
  { id: "R05", title: "Office supplies — no receipt", description: "$189 Staples purchase has no attached receipt.", issueType: "missing-receipt", status: "open", amount: 189, date: "Apr 5", source: "Staples", severity: "low", suggestedAction: "Upload receipt or mark as personal" },
  { id: "R06", title: "Insurance premium adjustment", description: "Quarterly insurance changed from $890 to $920. No notice received.", issueType: "recurring-change", status: "open", amount: 30, date: "Apr 1", source: "Insurance Co", severity: "high", suggestedAction: "Contact insurer for explanation" },
  { id: "R07", title: "Payroll timing mismatch", description: "Payroll debit posted 2 days early — $6,200 timing discrepancy.", issueType: "mismatch", status: "resolved", amount: 6200, date: "Mar 28", source: "Gusto", severity: "high", suggestedAction: "Resolved — timing lag confirmed" },
  { id: "R08", title: "Unrecognized $29 charge", description: "Unknown merchant 'DGT*SERVICES' charged $29. Not in subscription list.", issueType: "uncategorized", status: "investigating", amount: 29, date: "Apr 8", source: "Chase Credit", severity: "medium", suggestedAction: "Identify merchant or dispute charge" },
];

const ISSUE_ICONS: Record<IssueType, typeof AlertTriangle> = {
  mismatch: AlertTriangle, uncategorized: Tag, "recurring-change": Repeat, duplicate: RefreshCw, "missing-receipt": FileQuestion,
};
const ISSUE_LABELS: Record<IssueType, string> = {
  mismatch: "Mismatch", uncategorized: "Uncategorized", "recurring-change": "Recurring Change", duplicate: "Duplicate", "missing-receipt": "Missing Receipt",
};

const SEVERITY_DOT: Record<string, string> = {
  low: "bg-[hsl(0_0%_45%)]", medium: "bg-[hsl(38_85%_58%)]", high: "bg-[hsl(0_70%_55%)] shadow-[0_0_6px_hsl(0_70%_55%/0.5)]",
};

const ReconciliationReview = () => {
  const [tab, setTab] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = tab === "all" ? ITEMS
    : tab === "resolved" ? ([] as any[]).filter(i => i.status === "resolved")
    : ([] as any[]).filter(i => i.issueType === tab && i.status !== "resolved");

  const selected = ([] as any[]).find(i => i.id === selectedId);
  const openCount = ([] as any[]).filter(i => i.status !== "resolved").length;
  const mismatchCount = ([] as any[]).filter(i => i.issueType === "mismatch" && i.status !== "resolved").length;
  const uncatCount = ([] as any[]).filter(i => i.issueType === "uncategorized" && i.status !== "resolved").length;
  const recurringCount = ([] as any[]).filter(i => i.issueType === "recurring-change" && i.status !== "resolved").length;

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <PageTruthBanner />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KPITile label="Open Items" value={openCount} icon={Search} sub="Needing review" />
        <KPITile label="Mismatches" value={mismatchCount} icon={AlertTriangle} sub="Balance discrepancies" />
        <KPITile label="Uncategorized" value={uncatCount} icon={Tag} sub="Need classification" />
        <KPITile label="Recurring Changes" value={recurringCount} icon={Repeat} sub="Amount shifts detected" />
      </div>

      <SitaTabs
        tabs={[
          { key: "all", label: "All", count: ([] as any[]).filter(i => i.status !== "resolved").length },
          { key: "mismatch", label: "Mismatches", count: mismatchCount },
          { key: "uncategorized", label: "Uncategorized", count: uncatCount },
          { key: "recurring-change", label: "Recurring Changes", count: recurringCount },
          { key: "resolved", label: "Resolved", count: ([] as any[]).filter(i => i.status === "resolved").length },
        ]}
        active={tab}
        onChange={setTab}
      />

      <div className="grid gap-6 lg:grid-cols-5">
        <div className={`space-y-2 ${selected ? "lg:col-span-3" : "lg:col-span-5"}`}>
          {filtered.length === 0 ? (
            <EmptyState icon={CheckCircle2} title="All clear" description="No items need review in this category" />
          ) : (
            <QueueCard
              title="Review Queue"
              items={filtered.map((item, i) => ({
                id: item.id,
                label: item.title,
                meta: `$${item.amount.toLocaleString()} · ${item.source}`,
                urgency: item.severity === "high" ? "critical" : item.severity === "medium" ? "high" : "normal",
              }))}
              onItemClick={(id) => setSelectedId(id)}
            />
          )}
        </div>

        <AnimatePresence>
          {selected && (
            <motion.div
              className="lg:col-span-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_12%)] p-5 sticky top-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className={SITA_TYPE.cardTitle + " text-[hsl(0_0%_90%)]"}>{selected.title}</h3>
                  <button onClick={() => setSelectedId(null)} className="text-xs text-[hsl(0_0%_50%)] hover:text-[hsl(0_0%_80%)] transition-colors">✕</button>
                </div>
                <p className="text-sm text-[hsl(0_0%_60%)]">{selected.description}</p>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-[hsl(0_0%_45%)] text-xs">Amount</span><p className="font-semibold text-[hsl(0_0%_90%)]">${selected.amount.toLocaleString()}</p></div>
                  <div><span className="text-[hsl(0_0%_45%)] text-xs">Date</span><p className="font-semibold text-[hsl(0_0%_90%)]">{selected.date}</p></div>
                  <div><span className="text-[hsl(0_0%_45%)] text-xs">Source</span><p className="font-semibold text-[hsl(0_0%_90%)]">{selected.source}</p></div>
                  <div><span className="text-[hsl(0_0%_45%)] text-xs">Severity</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className={`w-2 h-2 rounded-full ${SEVERITY_DOT[selected.severity]}`} />
                      <span className="text-[hsl(0_0%_90%)] text-xs capitalize">{selected.severity}</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl bg-[hsl(265_55%_58%/0.08)] p-3">
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="h-4 w-4 text-[hsl(265_55%_58%)] mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-[hsl(0_0%_90%)]">Suggested Action</p>
                      <p className="text-xs text-[hsl(0_0%_60%)] mt-0.5">{selected.suggestedAction}</p>
                    </div>
                  </div>
                </div>

                {selected.status !== "resolved" && (
                  <div className="flex gap-2">
                    <button className="micro-press flex items-center gap-1.5 rounded-lg bg-[hsl(152_55%_48%/0.12)] px-3 py-1.5 text-xs font-medium text-[hsl(152_55%_48%)] hover:bg-[hsl(152_55%_48%/0.20)] transition-colors">
                      <CheckCircle2 className="h-3 w-3" /> Resolve
                    </button>
                    <button className="micro-press flex items-center gap-1.5 rounded-lg bg-[hsl(0_0%_100%/0.04)] px-3 py-1.5 text-xs font-medium text-[hsl(0_0%_60%)] hover:bg-[hsl(0_0%_100%/0.08)] transition-colors">
                      <Eye className="h-3 w-3" /> Investigate
                    </button>
                    <button className="micro-press flex items-center gap-1.5 rounded-lg bg-[hsl(0_0%_100%/0.04)] px-3 py-1.5 text-xs font-medium text-[hsl(0_0%_60%)] hover:bg-[hsl(0_0%_100%/0.08)] transition-colors">
                      <Clock className="h-3 w-3" /> Defer
                    </button>
                  </div>
                )}

                <div className="border-t border-[hsl(0_0%_100%/0.06)] pt-3">
                  <p className={SITA_TYPE.microLabel + " text-[hsl(0_0%_40%)] mb-2"}>PROOF TRAIL</p>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-[hsl(0_0%_50%)]">
                      <div className="h-1.5 w-1.5 rounded-full bg-[hsl(38_85%_58%)]" />
                      Detected by system — {selected.date}
                    </div>
                    {selected.status === "investigating" && (
                      <div className="flex items-center gap-2 text-xs text-[hsl(0_0%_50%)]">
                        <div className="h-1.5 w-1.5 rounded-full bg-[hsl(265_55%_58%)]" />
                        Investigation started — {selected.date}
                      </div>
                    )}
                    {selected.status === "resolved" && (
                      <div className="flex items-center gap-2 text-xs text-[hsl(152_55%_48%)]">
                        <div className="h-1.5 w-1.5 rounded-full bg-[hsl(152_55%_48%)]" />
                        Resolved — Timing lag confirmed
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ModuleAdvisorInsight
        advisorName="Reconciliation Advisor"
        domain="finance"
        insight={`${openCount} items need review. Priority: ${mismatchCount} balance mismatches totaling $${([] as any[]).filter(i => i.issueType === "mismatch" && i.status !== "resolved").reduce((s, i) => s + i.amount, 0).toLocaleString()}.`}
        confidence={82}
      />
    </motion.div>
  );
};

export default ReconciliationReview;
