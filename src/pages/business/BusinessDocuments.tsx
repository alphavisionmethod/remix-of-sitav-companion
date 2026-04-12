import { SitaCard, SitaCardTitle, SitaSectionHeader, SitaButton } from "@/components/sita/SitaCard";
import { KPITile, SitaTabs, EmptyState } from "@/components/sita/SitaComponents";
import { LiveAdvisorCard } from "@/components/sita/LiveAdvisorCard";
import { ConfidenceBar } from "@/components/sita/primitives/ConfidenceBar";
import { DomainHeader } from "@/components/sita/primitives/DomainHeader";
import { TrustBadge } from "@/components/sita/TrustBadge";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  FileText, Image, File, Upload, Search, FolderOpen, Paperclip, Eye, Download,
  Clock, Users, Tag, Link2, MoreHorizontal, Filter, Grid3X3, List, Star,
  CheckCircle, AlertTriangle, ExternalLink, Trash2, Copy, Share2
} from "lucide-react";

type Tab = "all" | "quotes" | "invoices" | "contracts" | "attachments" | "images" | "recent";
type ViewMode = "grid" | "list";

interface BusinessDocument {
  id: string;
  name: string;
  type: "pdf" | "doc" | "image" | "spreadsheet" | "contract" | "other";
  category: "quote" | "invoice" | "contract" | "proposal" | "attachment" | "image" | "intake" | "receipt";
  size: string;
  uploadedAt: string;
  uploadedBy: string;
  linkedEntity?: string;
  linkedEntityType?: string;
  status: "active" | "draft" | "sent" | "signed" | "expired" | "archived";
  starred: boolean;
  previewable: boolean;
  tags: string[];
}

const DEMO_DOCUMENTS: BusinessDocument[] = [
  {
    id: "doc-1", name: "Q-2024-0847 — Acme Corp Website Redesign.pdf", type: "pdf", category: "quote",
    size: "2.4 MB", uploadedAt: "2 hours ago", uploadedBy: "Sarah K.",
    linkedEntity: "Acme Corp", linkedEntityType: "Customer", status: "sent", starred: true, previewable: true,
    tags: ["high-value", "website"]
  },
  {
    id: "doc-2", name: "INV-2024-1205 — Monthly Retainer.pdf", type: "pdf", category: "invoice",
    size: "156 KB", uploadedAt: "1 day ago", uploadedBy: "System",
    linkedEntity: "Wilson & Partners", linkedEntityType: "Customer", status: "sent", starred: false, previewable: true,
    tags: ["recurring", "retainer"]
  },
  {
    id: "doc-3", name: "Master Services Agreement — BigCorp.pdf", type: "pdf", category: "contract",
    size: "4.8 MB", uploadedAt: "3 days ago", uploadedBy: "Michael R.",
    linkedEntity: "BigCorp Industries", linkedEntityType: "Customer", status: "signed", starred: true, previewable: true,
    tags: ["legal", "enterprise"]
  },
  {
    id: "doc-4", name: "Proposal — Digital Marketing Package.docx", type: "doc", category: "proposal",
    size: "1.2 MB", uploadedAt: "5 days ago", uploadedBy: "Lisa M.",
    linkedEntity: "Fresh Start Bakery", linkedEntityType: "Lead", status: "draft", starred: false, previewable: true,
    tags: ["marketing", "proposal"]
  },
  {
    id: "doc-5", name: "Site Survey Photos — 123 Main St.zip", type: "image", category: "attachment",
    size: "18.3 MB", uploadedAt: "1 week ago", uploadedBy: "Jordan T.",
    linkedEntity: "Apex Industries", linkedEntityType: "Customer", status: "active", starred: false, previewable: false,
    tags: ["site-visit", "photos"]
  },
  {
    id: "doc-6", name: "Client Intake Form — New Patient.pdf", type: "pdf", category: "intake",
    size: "340 KB", uploadedAt: "1 week ago", uploadedBy: "Front Desk",
    linkedEntity: "Dr. Patricia Chen", linkedEntityType: "Lead", status: "active", starred: false, previewable: true,
    tags: ["intake", "onboarding"]
  },
  {
    id: "doc-7", name: "Q-2024-0912 — IT Infrastructure Upgrade.pdf", type: "pdf", category: "quote",
    size: "890 KB", uploadedAt: "2 weeks ago", uploadedBy: "Sarah K.",
    linkedEntity: "TechForward Inc", linkedEntityType: "Opportunity", status: "expired", starred: false, previewable: true,
    tags: ["IT", "infrastructure"]
  },
  {
    id: "doc-8", name: "Receipt — Payment #4821.pdf", type: "pdf", category: "receipt",
    size: "78 KB", uploadedAt: "2 weeks ago", uploadedBy: "System",
    linkedEntity: "Acme Corp", linkedEntityType: "Customer", status: "active", starred: false, previewable: true,
    tags: ["payment", "receipt"]
  },
  {
    id: "doc-9", name: "Brand Guidelines — Client Deliverable.png", type: "image", category: "attachment",
    size: "5.2 MB", uploadedAt: "3 weeks ago", uploadedBy: "Design Team",
    linkedEntity: "Fresh Start Bakery", linkedEntityType: "Customer", status: "active", starred: true, previewable: true,
    tags: ["branding", "deliverable"]
  },
  {
    id: "doc-10", name: "NDA — Confidentiality Agreement.pdf", type: "pdf", category: "contract",
    size: "220 KB", uploadedAt: "1 month ago", uploadedBy: "Legal",
    linkedEntity: "Apex Industries", linkedEntityType: "Customer", status: "signed", starred: false, previewable: true,
    tags: ["legal", "NDA"]
  },
];

const typeIcon = (type: BusinessDocument["type"]) => {
  switch (type) {
    case "pdf": return FileText;
    case "doc": return File;
    case "image": return Image;
    case "spreadsheet": return Grid3X3;
    default: return File;
  }
};

const statusStyle = (status: BusinessDocument["status"]) => {
  switch (status) {
    case "signed": return "text-chart-2 bg-chart-2/10";
    case "sent": return "text-primary bg-primary/10";
    case "draft": return "text-muted-foreground bg-muted/50";
    case "expired": return "text-destructive bg-destructive/10";
    case "archived": return "text-muted-foreground bg-muted/30";
    default: return "text-foreground bg-secondary";
  }
};

const BusinessDocuments = () => {
  const [tab, setTab] = useState<Tab>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [starredIds, setStarredIds] = useState<Set<string>>(new Set(DEMO_DOCUMENTS.filter(d => d.starred).map(d => d.id)));

  const filtered = DEMO_DOCUMENTS.filter(doc => {
    if (tab === "quotes") return doc.category === "quote";
    if (tab === "invoices") return doc.category === "invoice" || doc.category === "receipt";
    if (tab === "contracts") return doc.category === "contract";
    if (tab === "attachments") return doc.category === "attachment" || doc.category === "intake";
    if (tab === "images") return doc.type === "image";
    if (tab === "recent") return true; // sorted by recency
    return true;
  }).filter(doc => !search || doc.name.toLowerCase().includes(search.toLowerCase()) || doc.linkedEntity?.toLowerCase().includes(search.toLowerCase()));

  const selected = DEMO_DOCUMENTS.find(d => d.id === selectedId);
  const toggleStar = (id: string) => setStarredIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <DomainHeader domain="business" title="Documents & Files" subtitle="Business file picker — quotes, invoices, contracts, attachments, and customer documents" />

      {/* KPI Strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <KPITile icon={FileText} label="Total Documents" value={DEMO_DOCUMENTS.length} trend="up" />
        <KPITile icon={File} label="Quotes & Proposals" value={DEMO_DOCUMENTS.filter(d => d.category === "quote" || d.category === "proposal").length} trend="flat" />
        <KPITile icon={CheckCircle} label="Signed Contracts" value={DEMO_DOCUMENTS.filter(d => d.status === "signed").length} trend="up" />
        <KPITile icon={AlertTriangle} label="Expired" value={DEMO_DOCUMENTS.filter(d => d.status === "expired").length} trend="down" />
        <KPITile icon={Star} label="Starred" value={starredIds.size} trend="flat" />
      </div>

      {/* Upload Zone */}
      <SitaCard hover={false} className="p-4 border-dashed border-2 border-border/60 bg-card/40">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 shrink-0">
              <Upload className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Upload documents</p>
              <p className="text-xs text-muted-foreground">Drag & drop or click to attach files to leads, customers, quotes, or invoices</p>
            </div>
          </div>
          <div className="flex gap-2">
            <SitaButton variant="primary" size="sm"><Upload className="h-3.5 w-3.5" /> Upload File</SitaButton>
            <SitaButton variant="secondary" size="sm"><Paperclip className="h-3.5 w-3.5" /> Attach to Record</SitaButton>
          </div>
        </div>
      </SitaCard>

      {/* Search + View Toggle */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full rounded-xl border border-border bg-secondary/40 py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            placeholder="Search documents, customers, tags..."
          />
        </div>
        <div className="flex rounded-xl border border-border overflow-hidden">
          <button onClick={() => setViewMode("list")} className={`p-2 ${viewMode === "list" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary"}`}><List className="h-4 w-4" /></button>
          <button onClick={() => setViewMode("grid")} className={`p-2 ${viewMode === "grid" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary"}`}><Grid3X3 className="h-4 w-4" /></button>
        </div>
      </div>

      <SitaTabs
        tabs={[
          { key: "all", label: "All", count: DEMO_DOCUMENTS.length },
          { key: "quotes", label: "Quotes & Proposals", count: DEMO_DOCUMENTS.filter(d => d.category === "quote" || d.category === "proposal").length },
          { key: "invoices", label: "Invoices & Receipts", count: DEMO_DOCUMENTS.filter(d => d.category === "invoice" || d.category === "receipt").length },
          { key: "contracts", label: "Contracts", count: DEMO_DOCUMENTS.filter(d => d.category === "contract").length },
          { key: "attachments", label: "Attachments", count: DEMO_DOCUMENTS.filter(d => d.category === "attachment" || d.category === "intake").length },
          { key: "images", label: "Images", count: DEMO_DOCUMENTS.filter(d => d.type === "image").length },
        ]}
        active={tab}
        onChange={k => setTab(k as Tab)}
      />

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Document List */}
        <div className="lg:col-span-3 space-y-2">
          {filtered.length === 0 && (
            <EmptyState icon={FolderOpen} title="No documents found" description="Upload your first file or adjust your search filters" />
          )}

          {viewMode === "list" ? filtered.map((doc) => {
            const DocIcon = typeIcon(doc.type);
            return (
              <SitaCard
                key={doc.id}
                onClick={() => setSelectedId(doc.id)}
                selected={selectedId === doc.id}
                className="p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/8 shrink-0">
                    <DocIcon className="h-4.5 w-4.5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground truncate">{doc.name}</p>
                      {starredIds.has(doc.id) && <Star className="h-3 w-3 text-amber-500 fill-amber-500 shrink-0" />}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                      <span>{doc.size}</span>
                      <span>·</span>
                      <span>{doc.uploadedAt}</span>
                      {doc.linkedEntity && (
                        <>
                          <span>·</span>
                          <span className="flex items-center gap-0.5"><Link2 className="h-2.5 w-2.5" />{doc.linkedEntity}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <span className={`inline-flex items-center rounded-md px-1.5 py-px text-[10px] font-medium capitalize shrink-0 ${statusStyle(doc.status)}`}>{doc.status}</span>
                </div>
              </SitaCard>
            );
          }) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filtered.map((doc) => {
                const DocIcon = typeIcon(doc.type);
                return (
                  <SitaCard
                    key={doc.id}
                    onClick={() => setSelectedId(doc.id)}
                    selected={selectedId === doc.id}
                    className="p-4 text-center"
                  >
                    <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-2xl bg-primary/10 mb-3">
                      <DocIcon className="h-6 w-6 text-primary" />
                    </div>
                    <p className="text-xs font-medium text-foreground truncate">{doc.name}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{doc.size} · {doc.uploadedAt}</p>
                    <span className={`inline-flex items-center rounded-md px-1.5 py-px text-[10px] font-medium capitalize mt-2 ${statusStyle(doc.status)}`}>{doc.status}</span>
                  </SitaCard>
                );
              })}
            </div>
          )}
        </div>

        {/* Detail Sidebar */}
        <div className="lg:col-span-2 space-y-4">
          {selected ? (
            <>
              {/* Preview */}
              <SitaCard hover={false} glow className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  {(() => { const DI = typeIcon(selected.type); return <DI className="h-5 w-5 text-primary" />; })()}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-foreground truncate">{selected.name}</h3>
                    <p className="text-[10px] text-muted-foreground">{selected.category} · {selected.size}</p>
                  </div>
                  <button onClick={() => toggleStar(selected.id)}>
                    <Star className={`h-4 w-4 ${starredIds.has(selected.id) ? "text-amber-500 fill-amber-500" : "text-muted-foreground"}`} />
                  </button>
                </div>

                {/* Preview Area */}
                {selected.previewable && (
                  <div className="rounded-xl border border-border bg-secondary/30 p-8 text-center mb-4">
                    <Eye className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">Document preview</p>
                    <SitaButton variant="ghost" size="sm" className="mt-2"><ExternalLink className="h-3 w-3" /> Open Full Preview</SitaButton>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-medium capitalize ${statusStyle(selected.status)}`}>{selected.status}</span>
                  <TrustBadge level={selected.status === "signed" ? "verified" : "review"} size="sm" />
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between"><span className="text-muted-foreground">Uploaded by</span><span className="text-foreground font-medium">{selected.uploadedBy}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Uploaded</span><span className="text-foreground">{selected.uploadedAt}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Size</span><span className="text-foreground">{selected.size}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Category</span><span className="text-foreground capitalize">{selected.category}</span></div>
                  {selected.linkedEntity && (
                    <div className="flex justify-between"><span className="text-muted-foreground">{selected.linkedEntityType}</span><span className="text-primary font-medium">{selected.linkedEntity}</span></div>
                  )}
                </div>
              </SitaCard>

              {/* Tags */}
              {selected.tags.length > 0 && (
                <SitaCard hover={false} className="p-4">
                  <SitaCardTitle>Tags</SitaCardTitle>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {selected.tags.map(tag => (
                      <span key={tag} className="inline-flex items-center gap-1 rounded-lg bg-secondary px-2 py-1 text-[10px] font-medium text-muted-foreground border border-border/40">
                        <Tag className="h-2.5 w-2.5" />{tag}
                      </span>
                    ))}
                  </div>
                </SitaCard>
              )}

              {/* Actions */}
              <SitaCard hover={false} className="p-4">
                <SitaCardTitle>Actions</SitaCardTitle>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <SitaButton variant="primary" size="sm"><Download className="h-3.5 w-3.5" /> Download</SitaButton>
                  <SitaButton variant="secondary" size="sm"><Share2 className="h-3.5 w-3.5" /> Share</SitaButton>
                  <SitaButton variant="ghost" size="sm"><Paperclip className="h-3.5 w-3.5" /> Attach to Record</SitaButton>
                  <SitaButton variant="ghost" size="sm"><Copy className="h-3.5 w-3.5" /> Duplicate</SitaButton>
                </div>
              </SitaCard>

              {/* Send History */}
              <SitaCard hover={false} className="p-4">
                <SitaCardTitle>Send & View History</SitaCardTitle>
                <div className="mt-3 space-y-2">
                  {[
                    { action: "Sent to client", time: "2 hours ago", by: selected.uploadedBy },
                    { action: "Uploaded", time: selected.uploadedAt, by: selected.uploadedBy },
                    ...(selected.status === "signed" ? [{ action: "Signed by client", time: "1 day ago", by: selected.linkedEntity || "Client" }] : []),
                  ].map((event, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                      <span className="text-foreground font-medium">{event.action}</span>
                      <span className="text-muted-foreground">· {event.time} by {event.by}</span>
                    </div>
                  ))}
                </div>
              </SitaCard>
            </>
          ) : (
            <EmptyState icon={FolderOpen} title="Select a document" description="Click on a document to preview, download, share, or attach to a business record" />
          )}

          <LiveAdvisorCard
            advisor="business"
            intent="document_management"
            context={{ total: DEMO_DOCUMENTS.length, expired: DEMO_DOCUMENTS.filter(d => d.status === "expired").length }}
            demoName="Document Advisor"
            demoRole="File Intelligence"
            demoConfidence="High"
            demoRecommendation={`${DEMO_DOCUMENTS.filter(d => d.status === "expired").length} document(s) have expired — consider re-sending or archiving. ${DEMO_DOCUMENTS.filter(d => d.status === "draft").length} draft(s) are ready for review and sending. ${starredIds.size} important files are starred for quick access.`}
            demoReasoning="Analyzing document lifecycle, send history, and linked entity status across your business records."
          />
        </div>
      </div>
    </motion.div>
  );
};

export default BusinessDocuments;
