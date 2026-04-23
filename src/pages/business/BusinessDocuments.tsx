// ═══════════════════════════════════════════════════════════════
// SITA OS — Business Documents (Migrated)
// Premium file workspace for quotes, invoices, contracts
// ═══════════════════════════════════════════════════════════════

import { SplitWorkspace } from "@/components/sita/surfaces/SplitWorkspace";
import { QueueCard, StatusCard, SummaryCard } from "@/components/sita/cards";
import { ModuleAdvisorInsight } from "@/components/sita/domain-shared/ModuleAdvisorInsight";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { PremiumEmptyState } from "@/components/sita/PremiumEmptyState";
import { TrustBadge } from "@/components/sita/TrustBadge";
import { useState } from "react";
import { useBusinessProfile } from "@/hooks/useBusinessProfile";
import { getModuleAdaptation } from "@/domains/engines/business-module-adaptations";
import { motion } from "framer-motion";
import {
  FileText, Image, File, Upload, Search, FolderOpen, Paperclip, Eye,
  Download, Star, Tag, Link2, Grid3X3, List, Share2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SITA_TYPE } from "@/platform/design-system/sita-design-tokens";

type Tab = "all" | "quotes" | "invoices" | "contracts" | "attachments" | "images";
type ViewMode = "grid" | "list";

interface BusinessDocument {
  id: string; name: string; type: "pdf" | "doc" | "image" | "spreadsheet" | "contract" | "other";
  category: "quote" | "invoice" | "contract" | "proposal" | "attachment" | "image" | "intake" | "receipt";
  size: string; uploadedAt: string; uploadedBy: string; linkedEntity?: string;
  linkedEntityType?: string; status: "active" | "draft" | "sent" | "signed" | "expired" | "archived";
  starred: boolean; previewable: boolean; tags: string[];
}

const DEMO_DOCUMENTS: BusinessDocument[] = [
  { id: "doc-1", name: "Q-2024-0847 — Acme Corp Website Redesign.pdf", type: "pdf", category: "quote", size: "2.4 MB", uploadedAt: "2 hours ago", uploadedBy: "Sarah K.", linkedEntity: "Acme Corp", linkedEntityType: "Customer", status: "sent", starred: true, previewable: true, tags: ["high-value", "website"] },
  { id: "doc-2", name: "INV-2024-1205 — Monthly Retainer.pdf", type: "pdf", category: "invoice", size: "156 KB", uploadedAt: "1 day ago", uploadedBy: "System", linkedEntity: "Wilson & Partners", linkedEntityType: "Customer", status: "sent", starred: false, previewable: true, tags: ["recurring", "retainer"] },
  { id: "doc-3", name: "Master Services Agreement — BigCorp.pdf", type: "pdf", category: "contract", size: "4.8 MB", uploadedAt: "3 days ago", uploadedBy: "Michael R.", linkedEntity: "BigCorp Industries", linkedEntityType: "Customer", status: "signed", starred: true, previewable: true, tags: ["legal", "enterprise"] },
  { id: "doc-4", name: "Proposal — Digital Marketing Package.docx", type: "doc", category: "proposal", size: "1.2 MB", uploadedAt: "5 days ago", uploadedBy: "Lisa M.", linkedEntity: "Fresh Start Bakery", linkedEntityType: "Lead", status: "draft", starred: false, previewable: true, tags: ["marketing", "proposal"] },
  { id: "doc-5", name: "Site Survey Photos — 123 Main St.zip", type: "image", category: "attachment", size: "18.3 MB", uploadedAt: "1 week ago", uploadedBy: "Jordan T.", linkedEntity: "Apex Industries", linkedEntityType: "Customer", status: "active", starred: false, previewable: false, tags: ["site-visit", "photos"] },
  { id: "doc-6", name: "NDA — Confidentiality Agreement.pdf", type: "pdf", category: "contract", size: "220 KB", uploadedAt: "1 month ago", uploadedBy: "Legal", linkedEntity: "Apex Industries", linkedEntityType: "Customer", status: "signed", starred: false, previewable: true, tags: ["legal", "NDA"] },
];

const typeIcon = (type: BusinessDocument["type"]) => {
  switch (type) { case "pdf": return FileText; case "doc": return File; case "image": return Image; default: return File; }
};

const statusStyle = (status: BusinessDocument["status"]) => {
  switch (status) {
    case "signed": return "text-[hsl(152_55%_48%)] bg-[hsl(152_55%_48%/0.12)]";
    case "sent": return "text-primary bg-primary/10";
    case "draft": return "text-muted-foreground bg-muted/50";
    case "expired": return "text-destructive bg-destructive/10";
    default: return "text-foreground bg-secondary";
  }
};

const BusinessDocuments = () => {
  const { primaryMode } = useBusinessProfile();
  const moduleConfig = getModuleAdaptation("documents", primaryMode);
  const [tab, setTab] = useState<Tab>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [starredIds, setStarredIds] = useState<Set<string>>(new Set(([] as any[]).filter(d => d.starred).map(d => d.id)));

  const filtered = ([] as any[]).filter(doc => {
    if (tab === "quotes") return doc.category === "quote" || doc.category === "proposal";
    if (tab === "invoices") return doc.category === "invoice" || doc.category === "receipt";
    if (tab === "contracts") return doc.category === "contract";
    if (tab === "attachments") return doc.category === "attachment" || doc.category === "intake";
    if (tab === "images") return doc.type === "image";
    return true;
  }).filter(doc => !search || doc.name.toLowerCase().includes(search.toLowerCase()) || doc.linkedEntity?.toLowerCase().includes(search.toLowerCase()));

  const selected = ([] as any[]).find(d => d.id === selectedId);
  const toggleStar = (id: string) => setStarredIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const tabs = [
    { key: "all", label: `All (${([] as any[]).length})` },
    { key: "quotes", label: "Quotes" },
    { key: "invoices", label: "Invoices" },
    { key: "contracts", label: "Contracts" },
    { key: "attachments", label: "Attachments" },
    { key: "images", label: "Images" },
  ];

  const listPane = (
    <div className="p-3 space-y-3">
      <PageTruthBanner />

      {/* Upload */}
      <div className="rounded-xl border border-dashed border-[hsl(0_0%_100%/0.10)] bg-[hsl(0_0%_8%)] p-3 flex items-center gap-3 micro-hover-lift">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 shrink-0">
          <Upload className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-medium text-foreground">Upload documents</p>
          <p className="text-[10px] text-muted-foreground">Drag & drop files to attach</p>
        </div>
        <button className="text-[10px] font-medium px-3 py-1.5 rounded-lg bg-primary text-primary-foreground micro-press">Upload</button>
      </div>

      {/* Search + view toggle */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[hsl(0_0%_40%)]" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="w-full rounded-lg border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_6%)] py-2 pl-9 pr-3 text-[12px] text-foreground placeholder:text-[hsl(0_0%_40%)] focus:border-[hsl(265_55%_58%/0.4)] focus:outline-none" placeholder="Search documents..." />
        </div>
        <div className="flex rounded-lg border border-[hsl(0_0%_100%/0.06)] overflow-hidden">
          <button onClick={() => setViewMode("list")} className={cn("p-1.5 micro-press", viewMode === "list" ? "bg-primary/10 text-primary" : "text-muted-foreground")}><List className="h-3.5 w-3.5" /></button>
          <button onClick={() => setViewMode("grid")} className={cn("p-1.5 micro-press", viewMode === "grid" ? "bg-primary/10 text-primary" : "text-muted-foreground")}><Grid3X3 className="h-3.5 w-3.5" /></button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key as Tab)}
            className={cn("px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors whitespace-nowrap micro-press",
              tab === t.key ? "bg-[hsl(0_0%_100%/0.08)] text-foreground" : "text-[hsl(0_0%_50%)] hover:text-[hsl(0_0%_70%)]")}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Document list */}
      {filtered.length === 0 ? (
        <PremiumEmptyState variant="no-results" icon={FolderOpen} title="No documents found" description="Upload your first file or adjust your search filters" domain="business" />
      ) : (
        <QueueCard
          title="Documents"
          items={filtered.map(doc => ({
            id: doc.id,
            label: doc.name,
            meta: `${doc.size} · ${doc.uploadedAt}${doc.linkedEntity ? ` · ${doc.linkedEntity}` : ""}`,
            urgency: doc.status === "expired" ? "critical" as const : doc.status === "draft" ? "low" as const : "normal" as const,
            badge: <span className={cn("text-[9px] font-medium px-1.5 py-0.5 rounded-md capitalize", statusStyle(doc.status))}>{doc.status}</span>,
          }))}
          maxVisible={20}
          onItemClick={(id) => setSelectedId(id)}
        />
      )}
    </div>
  );

  const detailPane = selected ? (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-3">
        {(() => { const DI = typeIcon(selected.type); return <DI className="h-5 w-5 text-primary" />; })()}
        <div className="flex-1 min-w-0">
          <h3 className={cn(SITA_TYPE.cardTitle, "text-[hsl(0_0%_90%)] truncate")}>{selected.name}</h3>
          <p className="text-[10px] text-muted-foreground">{selected.category} · {selected.size}</p>
        </div>
        <button onClick={() => toggleStar(selected.id)}>
          <Star className={cn("h-4 w-4", starredIds.has(selected.id) ? "text-[hsl(38_85%_58%)] fill-[hsl(38_85%_58%)]" : "text-muted-foreground")} />
        </button>
      </div>

      {selected.previewable && (
        <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_6%)] p-8 text-center">
          <Eye className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">Document preview</p>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-md capitalize", statusStyle(selected.status))}>{selected.status}</span>
        <TrustBadge level={selected.status === "signed" ? "verified" : "review"} size="sm" />
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex justify-between"><span className="text-muted-foreground">Uploaded by</span><span className="font-medium">{selected.uploadedBy}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Uploaded</span><span>{selected.uploadedAt}</span></div>
        {selected.linkedEntity && <div className="flex justify-between"><span className="text-muted-foreground">{selected.linkedEntityType}</span><span className="text-primary font-medium">{selected.linkedEntity}</span></div>}
      </div>

      {selected.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.tags.map(tag => (
            <span key={tag} className="inline-flex items-center gap-1 rounded-lg bg-secondary px-2 py-1 text-[10px] font-medium text-muted-foreground border border-[hsl(0_0%_100%/0.06)]">
              <Tag className="h-2.5 w-2.5" />{tag}
            </span>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <button className="flex items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground micro-press"><Download className="h-3.5 w-3.5" /> Download</button>
        <button className="flex items-center justify-center gap-1.5 rounded-lg border border-[hsl(0_0%_100%/0.08)] px-3 py-2 text-xs font-medium text-muted-foreground micro-press"><Share2 className="h-3.5 w-3.5" /> Share</button>
      </div>
    </div>
  ) : (
    <PremiumEmptyState variant="no-data" icon={FolderOpen} title="Select a document" description="Click on any document to preview, share, or download" domain="business" />
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full space-y-4">
      <SplitWorkspace
        list={listPane}
        detail={detailPane}
        hasSelection={!!selected}
        defaultSplit={45}
        className="h-[calc(100vh-200px)] rounded-xl border border-[hsl(0_0%_100%/0.06)] overflow-hidden"
      />
      <ModuleAdvisorInsight
        advisorName="Document Advisor"
        domain="business"
        insight={`${([] as any[]).filter(d => d.status === "expired").length} expired document(s) need attention. ${([] as any[]).filter(d => d.status === "signed").length} contracts fully signed.`}
        confidence={85}
      />
    </motion.div>
  );
};

export default BusinessDocuments;
