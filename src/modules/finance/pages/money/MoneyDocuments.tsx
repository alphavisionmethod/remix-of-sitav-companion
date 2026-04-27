import { KPITile, SitaTabs, EmptyState } from "@/platform/sita/components/sita/SitaComponents";
import { TrustBadge } from "@/platform/sita/components/sita/TrustBadge";
import { SectionSkeleton } from "@/platform/sita/components/sita/SectionSkeleton";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
import { SITA_TYPE } from "@/platform/design-system/sita-design-tokens";
import { SplitWorkspace } from "@/platform/sita/components/sita/surfaces/SplitWorkspace";
import { QueueCard } from "@/platform/sita/components/sita/cards";
import { useState, useMemo } from "react";
import { FileText, Upload, Search, DollarSign, Calendar, Shield, Clock, AlertCircle, Eye, FolderOpen } from "lucide-react";
import { motion } from "framer-motion";
import { useFinancialDocuments } from "@/modules/business/hooks/use-domain-data";
import { formatDistanceToNow } from "date-fns";

const sensitivityConfig: Record<string, { label: string; dot: string }> = {
  normal: { label: "Normal", dot: "bg-[hsl(0_0%_45%)]" },
  sensitive: { label: "Sensitive", dot: "bg-[hsl(38_85%_58%)]" },
  confidential: { label: "Confidential", dot: "bg-[hsl(0_70%_55%)] shadow-[0_0_6px_hsl(0_70%_55%/0.4)]" },
};

const MoneyDocuments = () => {
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data: documents = [], isLoading } = useFinancialDocuments();

  const selected = documents.find((d: Record<string, any>) => d.id === selectedId);

  const filtered = useMemo(() =>
    documents.filter((d: Record<string, any>) => {
      const matchesTab = tab === "all" || (tab === "boardroom" && d.boardroom_relevant) || (tab === "proof" && d.proof_relevant) || tab === d.doc_type;
      const matchesSearch = !search || d.name.toLowerCase().includes(search.toLowerCase());
      return matchesTab && matchesSearch;
    }),
  [documents, tab, search]);

  if (isLoading) return <SectionSkeleton cards={4} columns={1} />;

  const listPanel = (
    <div className="p-3 space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(0_0%_40%)]" />
        <input type="text" placeholder="Search documents..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_7%)] pl-10 pr-4 py-2 text-sm text-[hsl(0_0%_85%)] placeholder:text-[hsl(0_0%_40%)] focus:outline-none focus:ring-1 focus:ring-[hsl(265_55%_58%/0.4)]" />
      </div>

      <QueueCard
        title={`Documents (${filtered.length})`}
        items={filtered.map((doc: Record<string, any>) => ({
          id: doc.id,
          label: doc.name,
          meta: doc.classification || doc.doc_type,
          urgency: doc.sensitivity === "confidential" ? "critical" : doc.sensitivity === "sensitive" ? "high" : "normal",
          badge: doc.boardroom_relevant ? <span className="rounded bg-[hsl(265_55%_58%/0.15)] px-1.5 py-px text-[9px] text-[hsl(265_55%_58%)]">Board</span> : undefined,
        }))}
        maxVisible={20}
        onItemClick={(id) => setSelectedId(id)}
      />
    </div>
  );

  const detailPanel = selected ? (
    <div className="p-4 space-y-4">
      <h3 className={SITA_TYPE.cardTitle + " text-[hsl(0_0%_90%)]"}>{selected.name}</h3>
      <div className="space-y-2.5">
        <div className="flex justify-between text-sm"><span className="text-[hsl(0_0%_50%)]">Type</span><span className="text-[hsl(0_0%_85%)] capitalize">{selected.doc_type}</span></div>
        <div className="flex justify-between text-sm"><span className="text-[hsl(0_0%_50%)]">Sensitivity</span>
          <div className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${(sensitivityConfig[selected.sensitivity] || sensitivityConfig.normal).dot}`} />
            <span className="text-[hsl(0_0%_85%)] text-xs">{(sensitivityConfig[selected.sensitivity] || sensitivityConfig.normal).label}</span>
          </div>
        </div>
        <div className="flex justify-between text-sm"><span className="text-[hsl(0_0%_50%)]">Status</span><span className="text-[hsl(0_0%_85%)] capitalize">{selected.status}</span></div>
        {selected.linked_to && <div className="flex justify-between text-sm"><span className="text-[hsl(0_0%_50%)]">Linked To</span><span className="text-[hsl(0_0%_85%)] text-right text-xs">{selected.linked_to}</span></div>}
      </div>

      {selected.extracted_data && Object.keys(selected.extracted_data).length > 0 && (
        <div>
          <h4 className={SITA_TYPE.microLabel + " text-[hsl(0_0%_50%)] mb-2"}>EXTRACTED INTELLIGENCE</h4>
          <div className="space-y-2">
            {selected.extracted_data.amount && (
              <div className="flex items-center gap-2 rounded-lg bg-[hsl(0_0%_100%/0.04)] p-2.5">
                <DollarSign className="h-3.5 w-3.5 text-[hsl(265_55%_58%)]" />
                <span className="text-xs text-[hsl(0_0%_85%)]">{selected.extracted_data.amount}</span>
              </div>
            )}
            {selected.extracted_data.date && (
              <div className="flex items-center gap-2 rounded-lg bg-[hsl(0_0%_100%/0.04)] p-2.5">
                <Calendar className="h-3.5 w-3.5 text-[hsl(265_55%_58%)]" />
                <span className="text-xs text-[hsl(0_0%_85%)]">{selected.extracted_data.date}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div>
        <h4 className={SITA_TYPE.microLabel + " text-[hsl(0_0%_50%)] mb-2"}>RELEVANCE</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[hsl(0_0%_60%)]">Boardroom</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${selected.boardroom_relevant ? "bg-[hsl(152_55%_48%/0.12)] text-[hsl(152_55%_48%)]" : "bg-[hsl(0_0%_100%/0.04)] text-[hsl(0_0%_45%)]"}`}>
              {selected.boardroom_relevant ? "Relevant" : "Not relevant"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-[hsl(0_0%_60%)]">Proof</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${selected.proof_relevant ? "bg-[hsl(152_55%_48%/0.12)] text-[hsl(152_55%_48%)]" : "bg-[hsl(0_0%_100%/0.04)] text-[hsl(0_0%_45%)]"}`}>
              {selected.proof_relevant ? "Linked" : "Not linked"}
            </span>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div className="flex items-center justify-center h-full p-8">
      <div className="text-center">
        <FileText className="h-8 w-8 text-[hsl(0_0%_30%)] mx-auto mb-3" />
        <p className="text-sm text-[hsl(0_0%_50%)]">Select a document to view details</p>
      </div>
    </div>
  );

  return (
    <motion.div className="space-y-4" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <PageTruthBanner />

      <div className="px-3">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <KPITile label="Total Documents" value={String(documents.length)} icon={FileText} />
          <KPITile label="Boardroom" value={String(documents.filter((d: Record<string, any>) => d.boardroom_relevant).length)} icon={Eye} sub="For review" />
          <KPITile label="Extracting" value={String(documents.filter((d: Record<string, any>) => d.status === "extracting").length)} icon={Clock} sub="In progress" />
          <KPITile label="Confidential" value={String(documents.filter((d: Record<string, any>) => d.sensitivity === "confidential").length)} icon={Shield} />
        </div>
      </div>

      <SplitWorkspace
        list={listPanel}
        detail={detailPanel}
        hasSelection={!!selected}
        defaultSplit={42}
        className="h-[600px]"
      />
    </motion.div>
  );
};

export default MoneyDocuments;
