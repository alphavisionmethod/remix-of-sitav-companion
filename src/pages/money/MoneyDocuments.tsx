import { SitaPageHeader, SitaCard, SitaCardTitle, SitaSectionHeader } from "@/components/sita/SitaCard";
import { KPITile, SitaTabs, EmptyState } from "@/components/sita/SitaComponents";
import { TrustBadge } from "@/components/sita/TrustBadge";
import { SectionSkeleton } from "@/components/sita/SectionSkeleton";
import { useState, useMemo } from "react";
import { FileText, Upload, Search, DollarSign, Calendar, Shield, Clock, AlertCircle, Eye, Paperclip, FolderOpen } from "lucide-react";
import { motion } from "framer-motion";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";
import { useFinancialDocuments } from "@/hooks/use-domain-data";
import { formatDistanceToNow } from "date-fns";


interface MoneyDocumentsRow {
  boardroom_relevant?: unknown;
  created_at?: string;
  doc_type?: unknown;
  id?: string;
  name?: string;
  proof_relevant?: unknown;
  sensitivity?: unknown;
  status?: string;
}

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
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data: documents = [], isLoading } = useFinancialDocuments();

  const selected = documents.find((d: MoneyDocumentsRow) => d.id === selectedId);

  const filtered = useMemo(() =>
    documents.filter((d: MoneyDocumentsRow) => {
      const matchesTab = tab === "all" || (tab === "boardroom" && d.boardroom_relevant) || (tab === "proof" && d.proof_relevant) || tab === d.doc_type;
      const matchesSearch = !search || d.name.toLowerCase().includes(search.toLowerCase());
      return matchesTab && matchesSearch;
    }),
  [documents, tab, search]);

  if (isLoading) return <SectionSkeleton cards={4} columns={1} />;

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <DemoModeBadge />
      <SitaPageHeader title="Financial Documents" subtitle="Invoices, receipts, contracts, and statements — organized and intelligence-ready" />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KPITile label="Total Documents" value={String(documents.length)} icon={FileText} />
        <KPITile label="Boardroom Relevant" value={String(documents.filter((d: MoneyDocumentsRow) => d.boardroom_relevant).length)} icon={Eye} sub="For review" />
        <KPITile label="Extracting" value={String(documents.filter((d: MoneyDocumentsRow) => d.status === "extracting").length)} icon={Clock} sub="In progress" />
        <KPITile label="Confidential" value={String(documents.filter((d: MoneyDocumentsRow) => d.sensitivity === "confidential").length)} icon={Shield} />
      </div>

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
          { key: "boardroom", label: "Boardroom", count: documents.filter((d: MoneyDocumentsRow) => d.boardroom_relevant).length },
          { key: "proof", label: "Proof-linked", count: documents.filter((d: MoneyDocumentsRow) => d.proof_relevant).length },
          { key: "contract", label: "Contracts", count: documents.filter((d: MoneyDocumentsRow) => d.doc_type === "contract").length },
        ]}
        active={tab}
        onChange={setTab}
      />

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-2">
          {filtered.map((doc: MoneyDocumentsRow) => {
            const sens = sensitivityConfig[doc.sensitivity] || sensitivityConfig.normal;
            const ts = doc.created_at ? formatDistanceToNow(new Date(doc.created_at), { addSuffix: true }) : "";
            return (
              <SitaCard key={doc.id} onClick={() => setSelectedId(doc.id)} selected={selectedId === doc.id} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-primary/8 p-2.5 shrink-0">
                    <FileText className={`h-4 w-4 ${typeIcons[doc.doc_type] || "text-primary"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{doc.name}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs text-muted-foreground">{doc.classification}</span>
                      <span className={`rounded px-1.5 py-px text-[10px] font-medium ${sens.color}`}>{sens.label}</span>
                      {doc.status === "extracting" && <span className="rounded bg-state-queued/10 px-1.5 py-px text-[10px] text-state-queued animate-pulse">Extracting…</span>}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{ts}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {doc.boardroom_relevant && <span className="rounded bg-primary/10 px-1.5 py-px text-[10px] text-primary">Board</span>}
                    {doc.proof_relevant && <span className="rounded bg-trust-verified/10 px-1.5 py-px text-[10px] text-trust-verified">Proof</span>}
                  </div>
                </div>
              </SitaCard>
            );
          })}
          {filtered.length === 0 && <EmptyState icon={FolderOpen} title="No documents found" description="Upload a document or try a different filter" />}
        </div>

        <div className="lg:col-span-2 space-y-4">
          {selected ? (
            <>
              <SitaCard hover={false} glow className="p-5">
                <SitaCardTitle sub={selected.classification}>{selected.name}</SitaCardTitle>
                <div className="mt-4 space-y-2.5">
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Type</span><span className="text-foreground capitalize">{selected.doc_type}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Sensitivity</span><span className={`rounded px-1.5 py-px text-[10px] font-medium ${(sensitivityConfig[selected.sensitivity] || sensitivityConfig.normal).color}`}>{(sensitivityConfig[selected.sensitivity] || sensitivityConfig.normal).label}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Status</span><span className="text-foreground capitalize">{selected.status}</span></div>
                  {selected.linked_to && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Linked To</span><span className="text-foreground text-right text-xs">{selected.linked_to}</span></div>}
                </div>
              </SitaCard>

              {selected.extracted_data && Object.keys(selected.extracted_data).length > 0 && (
                <SitaCard hover={false}>
                  <SitaCardTitle>Extracted Intelligence</SitaCardTitle>
                  <div className="mt-3 space-y-2">
                    {selected.extracted_data.amount && (
                      <div className="flex items-center gap-2 rounded-lg bg-secondary/30 p-2.5">
                        <DollarSign className="h-3.5 w-3.5 text-primary" />
                        <span className="text-xs text-foreground">{selected.extracted_data.amount}</span>
                      </div>
                    )}
                    {selected.extracted_data.date && (
                      <div className="flex items-center gap-2 rounded-lg bg-secondary/30 p-2.5">
                        <Calendar className="h-3.5 w-3.5 text-primary" />
                        <span className="text-xs text-foreground">{selected.extracted_data.date}</span>
                      </div>
                    )}
                    {selected.extracted_data.obligations && (
                      <div className="flex items-center gap-2 rounded-lg bg-secondary/30 p-2.5">
                        <AlertCircle className="h-3.5 w-3.5 text-primary" />
                        <span className="text-xs text-foreground">{selected.extracted_data.obligations}</span>
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
                    <TrustBadge level={selected.boardroom_relevant ? "verified" : "low-confidence"} label={selected.boardroom_relevant ? "Relevant" : "Not relevant"} size="sm" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Proof</span>
                    <TrustBadge level={selected.proof_relevant ? "verified" : "low-confidence"} label={selected.proof_relevant ? "Linked" : "Not linked"} size="sm" />
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
