import { SitaPageHeader, SitaCard, SitaCardTitle, SitaButton } from "@/components/sita/SitaCard";
import { KPITile, SitaTabs, EmptyState } from "@/components/sita/SitaComponents";
import { TrustBadge } from "@/components/sita/TrustBadge";
import { LiveAdvisorCard } from "@/components/sita/LiveAdvisorCard";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
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

const DEMO_ITEMS: ReconciliationItem[] = [
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
  mismatch: AlertTriangle,
  uncategorized: Tag,
  "recurring-change": Repeat,
  duplicate: RefreshCw,
  "missing-receipt": FileQuestion,
};

const ISSUE_LABELS: Record<IssueType, string> = {
  mismatch: "Mismatch",
  uncategorized: "Uncategorized",
  "recurring-change": "Recurring Change",
  duplicate: "Duplicate",
  "missing-receipt": "Missing Receipt",
};

const SEVERITY_COLORS: Record<string, string> = {
  low: "text-muted-foreground",
  medium: "text-trust-review",
  high: "text-urgency-high",
};

const ReconciliationReview = () => {
  const [tab, setTab] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = tab === "all" ? DEMO_ITEMS
    : tab === "resolved" ? DEMO_ITEMS.filter(i => i.status === "resolved")
    : DEMO_ITEMS.filter(i => i.issueType === tab && i.status !== "resolved");

  const selected = DEMO_ITEMS.find(i => i.id === selectedId);
  const openCount = DEMO_ITEMS.filter(i => i.status !== "resolved").length;
  const mismatchCount = DEMO_ITEMS.filter(i => i.issueType === "mismatch" && i.status !== "resolved").length;
  const uncatCount = DEMO_ITEMS.filter(i => i.issueType === "uncategorized" && i.status !== "resolved").length;
  const recurringCount = DEMO_ITEMS.filter(i => i.issueType === "recurring-change" && i.status !== "resolved").length;

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <DemoModeBadge />
      <SitaPageHeader title="Reconciliation & Review" subtitle="Resolve mismatches, categorize unknowns, and review changes" />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KPITile label="Open Items" value={openCount} icon={Search} sub="Needing review" />
        <KPITile label="Mismatches" value={mismatchCount} icon={AlertTriangle} sub="Balance discrepancies" />
        <KPITile label="Uncategorized" value={uncatCount} icon={Tag} sub="Need classification" />
        <KPITile label="Recurring Changes" value={recurringCount} icon={Repeat} sub="Amount shifts detected" />
      </div>

      <SitaTabs
        tabs={[
          { key: "all", label: "All", count: DEMO_ITEMS.filter(i => i.status !== "resolved").length },
          { key: "mismatch", label: "Mismatches", count: mismatchCount },
          { key: "uncategorized", label: "Uncategorized", count: uncatCount },
          { key: "recurring-change", label: "Recurring Changes", count: recurringCount },
          { key: "resolved", label: "Resolved", count: DEMO_ITEMS.filter(i => i.status === "resolved").length },
        ]}
        active={tab}
        onChange={setTab}
      />

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Item list */}
        <div className={`space-y-2 ${selected ? "lg:col-span-3" : "lg:col-span-5"}`}>
          {filtered.length === 0 ? (
            <EmptyState icon={CheckCircle2} title="All clear" description="No items need review in this category" />
          ) : filtered.map((item) => {
            const Icon = ISSUE_ICONS[item.issueType];
            return (
              <SitaCard
                key={item.id}
                lane={item.severity === "high" ? "action" : item.status === "investigating" ? "opportunity" : undefined}
                className={`p-4 cursor-pointer transition-all ${selectedId === item.id ? "ring-2 ring-primary/40" : ""}`}
                onClick={() => setSelectedId(item.id)}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 rounded-lg p-2 bg-secondary/50 ${SEVERITY_COLORS[item.severity]}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground">{item.title}</p>
                      {item.status === "resolved" && <CheckCircle2 className="h-3.5 w-3.5 text-trust-verified" />}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{item.description}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <TrustBadge level={item.status === "resolved" ? "verified" : item.severity === "high" ? "blocked" : "review"} label={ISSUE_LABELS[item.issueType]} size="sm" />
                      <span className="text-[10px] text-muted-foreground">{item.source} · {item.date}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-display text-sm font-bold text-foreground">${item.amount.toLocaleString()}</p>
                  </div>
                </div>
              </SitaCard>
            );
          })}
        </div>

        {/* Detail sidebar */}
        <AnimatePresence>
          {selected && (
            <motion.div
              className="lg:col-span-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <SitaCard hover={false} className="p-5 sticky top-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-base font-bold text-foreground">{selected.title}</h3>
                  <button onClick={() => setSelectedId(null)} className="text-xs text-muted-foreground hover:text-foreground">✕</button>
                </div>
                <p className="text-sm text-muted-foreground">{selected.description}</p>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground text-xs">Amount</span><p className="font-semibold">${selected.amount.toLocaleString()}</p></div>
                  <div><span className="text-muted-foreground text-xs">Date</span><p className="font-semibold">{selected.date}</p></div>
                  <div><span className="text-muted-foreground text-xs">Source</span><p className="font-semibold">{selected.source}</p></div>
                  <div><span className="text-muted-foreground text-xs">Status</span>
                    <TrustBadge level={selected.status === "resolved" ? "verified" : "review"} label={selected.status} size="sm" />
                  </div>
                </div>

                <div className="rounded-xl bg-accent/10 p-3">
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-foreground">Suggested Action</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{selected.suggestedAction}</p>
                    </div>
                  </div>
                </div>

                {selected.status !== "resolved" && (
                  <div className="flex gap-2">
                    <SitaButton variant="accent" size="sm"><CheckCircle2 className="h-3 w-3" /> Resolve</SitaButton>
                    <SitaButton variant="outline" size="sm"><Eye className="h-3 w-3" /> Investigate</SitaButton>
                    <SitaButton variant="ghost" size="sm"><Clock className="h-3 w-3" /> Defer</SitaButton>
                  </div>
                )}

                <div className="border-t border-border pt-3">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Proof Trail</p>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="h-1.5 w-1.5 rounded-full bg-trust-review" />
                      Detected by system — {selected.date}
                    </div>
                    {selected.status === "investigating" && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                        Investigation started — {selected.date}
                      </div>
                    )}
                    {selected.status === "resolved" && (
                      <div className="flex items-center gap-2 text-xs text-trust-verified">
                        <div className="h-1.5 w-1.5 rounded-full bg-trust-verified" />
                        Resolved — Timing lag confirmed
                      </div>
                    )}
                  </div>
                </div>
              </SitaCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <LiveAdvisorCard
        advisor="money"
        intent="reconciliation_review"
        demoName="Reconciliation Advisor"
        demoRole="Financial Accuracy"
        demoConfidence="High"
        demoRecommendation={`${openCount} items need review. Priority: ${mismatchCount} balance mismatches totaling $${DEMO_ITEMS.filter(i => i.issueType === "mismatch" && i.status !== "resolved").reduce((s, i) => s + i.amount, 0).toLocaleString()}.`}
        demoReasoning="Cross-referencing statement data, transaction records, and recurring charge patterns to identify discrepancies."
      />
    </motion.div>
  );
};

export default ReconciliationReview;
