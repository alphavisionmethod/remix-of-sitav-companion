import { SitaPageHeader, SitaCard, SitaCardTitle, SitaSectionHeader } from "@/components/sita/SitaCard";
import { KPITile, SitaTabs, EmptyState } from "@/components/sita/SitaComponents";
import { TrustBadge } from "@/components/sita/TrustBadge";
import { useState } from "react";
import { FileText, Upload, Search, DollarSign, Calendar, Shield, Clock, AlertCircle, Eye, Paperclip, FolderOpen } from "lucide-react";
import { motion } from "framer-motion";

interface FinancialDocument {
  id: number;
  name: string;
  type: "invoice" | "receipt" | "bill" | "statement" | "contract" | "report" | "screenshot";
  classification: string;
  sensitivity: "normal" | "sensitive" | "confidential";
  linkedTo?: string;
  extractedAmount?: string;
  extractedDate?: string;
  extractedObligations?: string;
  boardroomRelevant: boolean;
  proofRelevant: boolean;
  uploadedAt: string;
  status: "processed" | "extracting" | "needs-review" | "archived";
}

const documents: FinancialDocument[] = [
  { id: 1, name: "Chase Business Statement — Mar 2026", type: "statement", classification: "Bank Statement", sensitivity: "sensitive", extractedAmount: "$14,230 ending balance", extractedDate: "Mar 31, 2026", boardroomRelevant: true, proofRelevant: false, uploadedAt: "Today", status: "processed" },
  { id: 2, name: "Office Lease Agreement", type: "contract", classification: "Contract", sensitivity: "confidential", linkedTo: "Office Rent — $2,400/mo", extractedObligations: "Monthly rent $2,400 · Term ends Dec 2026", boardroomRelevant: true, proofRelevant: false, uploadedAt: "Jan 15", status: "processed" },
  { id: 3, name: "Invoice #1040 — Lisa Thompson", type: "invoice", classification: "Receivable", sensitivity: "normal", linkedTo: "Receivables · $4,200", extractedAmount: "$4,200", extractedDate: "Due Apr 12", boardroomRelevant: false, proofRelevant: true, uploadedAt: "3 days ago", status: "processed" },
  { id: 4, name: "AWS Hosting Invoice — Mar", type: "bill", classification: "Vendor Bill", sensitivity: "normal", linkedTo: "AWS Hosting · $340", extractedAmount: "$340", extractedDate: "Due Apr 3", boardroomRelevant: false, proofRelevant: true, uploadedAt: "Yesterday", status: "processed" },
  { id: 5, name: "Insurance Policy Renewal Terms", type: "contract", classification: "Insurance", sensitivity: "sensitive", extractedObligations: "Annual premium $5,040 · Renewal Jul 1", boardroomRelevant: true, proofRelevant: false, uploadedAt: "2 weeks ago", status: "processed" },
  { id: 6, name: "Quarterly P&L Export", type: "report", classification: "Financial Report", sensitivity: "confidential", extractedAmount: "Net income: $8,400", extractedDate: "Q1 2026", boardroomRelevant: true, proofRelevant: false, uploadedAt: "4 days ago", status: "processed" },
  { id: 7, name: "Receipt — Equipment Purchase", type: "receipt", classification: "Expense Receipt", sensitivity: "normal", linkedTo: "Equipment Fund", extractedAmount: "$1,200", boardroomRelevant: false, proofRelevant: true, uploadedAt: "1 week ago", status: "processed" },
  { id: 8, name: "Stripe Payout Summary", type: "statement", classification: "Payment Statement", sensitivity: "sensitive", extractedAmount: "$12,600 total payouts", extractedDate: "Mar 2026", boardroomRelevant: true, proofRelevant: true, uploadedAt: "2 days ago", status: "extracting" },
];

const typeIcons: Record<string, string> = {
  invoice: "text-primary", receipt: "text-trust-verified", bill: "text-urgency-high",
  statement: "text-foreground", contract: "text-accent", report: "text-primary", screenshot: "text-muted-foreground"
};

const sensitivityConfig: Record<string, { label: string; color: string }> = {
  normal: { label: "Normal", color: "bg-secondary text-muted-foreground" },
  sensitive: { label: "Sensitive", color: "bg-trust-review/10 text-trust-review" },
  confidential: { label: "Confidential", color: "bg-urgency-high/10 text-urgency-high" },
};

const MoneyDocuments = () => {
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selected = documents.find(d => d.id === selectedId);

  const filtered = documents.filter(d => {
    const matchesTab = tab === "all" || (tab === "boardroom" && d.boardroomRelevant) || (tab === "proof" && d.proofRelevant) || tab === d.type;
    const matchesSearch = !search || d.name.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <SitaPageHeader title="Financial Documents" subtitle="Invoices, receipts, contracts, and statements — organized and intelligence-ready" />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KPITile label="Total Documents" value={String(documents.length)} icon={FileText} />
        <KPITile label="Boardroom Relevant" value={String(documents.filter(d => d.boardroomRelevant).length)} icon={Eye} sub="For review" />
        <KPITile label="Extracting" value={String(documents.filter(d => d.status === "extracting").length)} icon={Clock} sub="In progress" />
        <KPITile label="Confidential" value={String(documents.filter(d => d.sensitivity === "confidential").length)} icon={Shield} />
      </div>

      {/* Search + Upload */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input type="text" placeholder="Search documents..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-border/50 bg-secondary/20 pl-10 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30" />
        </div>
        <button className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
          <Upload className="h-4 w-4" /> Upload
        </button>
      </div>

      <SitaTabs
        tabs={[
          { key: "all", label: "All", count: documents.length },
          { key: "boardroom", label: "Boardroom", count: documents.filter(d => d.boardroomRelevant).length },
          { key: "proof", label: "Proof-linked", count: documents.filter(d => d.proofRelevant).length },
          { key: "contract", label: "Contracts", count: documents.filter(d => d.type === "contract").length },
        ]}
        active={tab}
        onChange={setTab}
      />

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-2">
          {filtered.map((doc) => (
            <SitaCard key={doc.id} onClick={() => setSelectedId(doc.id)} selected={selectedId === doc.id} className="p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-primary/8 p-2.5 shrink-0">
                  <FileText className={`h-4 w-4 ${typeIcons[doc.type] || "text-primary"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{doc.name}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-xs text-muted-foreground">{doc.classification}</span>
                    <span className={`rounded px-1.5 py-px text-[10px] font-medium ${sensitivityConfig[doc.sensitivity].color}`}>{sensitivityConfig[doc.sensitivity].label}</span>
                    {doc.status === "extracting" && <span className="rounded bg-state-queued/10 px-1.5 py-px text-[10px] text-state-queued animate-pulse">Extracting…</span>}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Uploaded {doc.uploadedAt}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  {doc.boardroomRelevant && <span className="rounded bg-primary/10 px-1.5 py-px text-[10px] text-primary">Board</span>}
                  {doc.proofRelevant && <span className="rounded bg-trust-verified/10 px-1.5 py-px text-[10px] text-trust-verified">Proof</span>}
                </div>
              </div>
            </SitaCard>
          ))}
          {filtered.length === 0 && <EmptyState icon={FolderOpen} title="No documents found" description="Upload a document or try a different filter" />}
        </div>

        <div className="lg:col-span-2 space-y-4">
          {selected ? (
            <>
              <SitaCard hover={false} glow className="p-5">
                <SitaCardTitle sub={selected.classification}>{selected.name}</SitaCardTitle>
                <div className="mt-4 space-y-2.5">
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Type</span><span className="text-foreground capitalize">{selected.type}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Sensitivity</span><span className={`rounded px-1.5 py-px text-[10px] font-medium ${sensitivityConfig[selected.sensitivity].color}`}>{sensitivityConfig[selected.sensitivity].label}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Status</span><span className="text-foreground capitalize">{selected.status}</span></div>
                  {selected.linkedTo && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Linked To</span><span className="text-foreground text-right text-xs">{selected.linkedTo}</span></div>}
                </div>
              </SitaCard>

              {(selected.extractedAmount || selected.extractedDate || selected.extractedObligations) && (
                <SitaCard hover={false}>
                  <SitaCardTitle>Extracted Intelligence</SitaCardTitle>
                  <div className="mt-3 space-y-2">
                    {selected.extractedAmount && (
                      <div className="flex items-center gap-2 rounded-lg bg-secondary/30 p-2.5">
                        <DollarSign className="h-3.5 w-3.5 text-primary" />
                        <span className="text-xs text-foreground">{selected.extractedAmount}</span>
                      </div>
                    )}
                    {selected.extractedDate && (
                      <div className="flex items-center gap-2 rounded-lg bg-secondary/30 p-2.5">
                        <Calendar className="h-3.5 w-3.5 text-primary" />
                        <span className="text-xs text-foreground">{selected.extractedDate}</span>
                      </div>
                    )}
                    {selected.extractedObligations && (
                      <div className="flex items-center gap-2 rounded-lg bg-secondary/30 p-2.5">
                        <AlertCircle className="h-3.5 w-3.5 text-primary" />
                        <span className="text-xs text-foreground">{selected.extractedObligations}</span>
                      </div>
                    )}
                  </div>
                </SitaCard>
              )}

              <SitaCard hover={false}>
                <SitaCardTitle>Relevance</SitaCardTitle>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Boardroom</span>
                    <TrustBadge level={selected.boardroomRelevant ? "verified" : "low-confidence"} label={selected.boardroomRelevant ? "Relevant" : "Not relevant"} size="sm" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Proof</span>
                    <TrustBadge level={selected.proofRelevant ? "verified" : "low-confidence"} label={selected.proofRelevant ? "Linked" : "Not linked"} size="sm" />
                  </div>
                </div>
              </SitaCard>
            </>
          ) : (
            <EmptyState icon={FileText} title="Select a document" description="Click on a document to see extracted intelligence, linked items, and relevance details" />
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MoneyDocuments;
