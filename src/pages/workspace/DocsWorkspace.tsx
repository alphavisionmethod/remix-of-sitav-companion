// ═══════════════════════════════════════════════════════════════
// SITA OS — Docs Workspace (Premium Editor)
// Rich document editing with templates, governed mode, version
// history, workflow linking, and markdown preview
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo } from "react";
import { SitaPageHeader, SitaCard, SitaCardTitle } from "@/components/sita/SitaCard";
import { SitaTabs } from "@/components/sita/SitaComponents";
import { EmptyState } from "@/components/sita/EmptyState";
import { motion, AnimatePresence } from "framer-motion";
import { useDocs } from "@/hooks/use-domain-data";
import type { MockDoc } from "@/data/fixtures/mock-data/workspace";
import ReactMarkdown from "react-markdown";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import {
  FileText, Plus, Search, Clock, Users, Shield, Workflow,
  Lock, Eye, FileCheck, MoreVertical, ChevronRight,
  Bold, Italic, List, ListOrdered, Heading1, Heading2,
  Link2, Image, Code, Quote, Table, Minus, Save, X,
  History, FileSignature, LayoutTemplate, AlertTriangle,
  Maximize2, Minimize2, Download, Printer, CheckCircle2
} from "lucide-react";



const statusColors: Record<string, string> = {
  draft: "bg-secondary text-muted-foreground",
  review: "bg-amber-500/10 text-amber-600",
  approved: "bg-primary/10 text-primary",
  published: "bg-primary/10 text-primary",
  archived: "bg-secondary text-muted-foreground",
};

const privacyIcons: Record<string, typeof Lock> = {
  personal: Lock,
  team: Users,
  client: Shield,
  public: Eye,
  restricted: AlertTriangle,
};

const TOOLBAR_ACTIONS = [
  { icon: Bold, label: "Bold", md: "**" },
  { icon: Italic, label: "Italic", md: "*" },
  { icon: Heading1, label: "Heading 1", md: "# " },
  { icon: Heading2, label: "Heading 2", md: "## " },
  { icon: List, label: "Bullet List", md: "- " },
  { icon: ListOrdered, label: "Numbered List", md: "1. " },
  { icon: Quote, label: "Quote", md: "> " },
  { icon: Code, label: "Code", md: "`" },
  { icon: Link2, label: "Link", md: "[text](url)" },
  { icon: Table, label: "Table", md: "| Col 1 | Col 2 |\n|-------|-------|\n| | |" },
  { icon: Minus, label: "Divider", md: "\n---\n" },
];

const DocsWorkspace = () => {
  const { data: docsData = [] } = useDocs();

  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingDoc, setEditingDoc] = useState<MockDoc | null>(null);
  const [editorContent, setEditorContent] = useState("");
  const [editorTitle, setEditorTitle] = useState("");
  const [showPreview, setShowPreview] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);

  const tabs = [
    { key: "all", label: "All Documents" },
    { key: "proposals", label: "Proposals" },
    { key: "reports", label: "Reports" },
    { key: "packets", label: "Boardroom Packets" },
    { key: "templates", label: "Templates" },
    { key: "governed", label: "🔒 Governed" },
  ];

  const filteredDocs = useMemo(() =>
    docsData.filter(doc => {
      if (activeTab === "proposals") return doc.type === "proposal";
      if (activeTab === "reports") return doc.type === "report";
      if (activeTab === "packets") return doc.type === "boardroom-packet";
      if (activeTab === "templates") return doc.status === "published" && doc.type === "document";
      if (activeTab === "governed") return doc.governed;
      return true;
    }).filter(doc => !searchQuery || doc.title.toLowerCase().includes(searchQuery.toLowerCase())),
    [activeTab, searchQuery]
  );

  const openEditor = (doc: MockDoc) => {
    setEditingDoc(doc);
    setEditorContent(doc.content);
    setEditorTitle(doc.title);
  };

  const closeEditor = () => {
    setEditingDoc(null);
    setEditorContent("");
    setEditorTitle("");
    setIsFullscreen(false);
  };

  const insertMarkdown = (md: string) => {
    setEditorContent(prev => prev + md);
  };

  const createNewDoc = (type: MockDoc["type"] = "document") => {
    const newDoc: MockDoc = {
      id: `new-${Date.now()}`,
      title: "Untitled Document",
      type,
      status: "draft",
      lastModified: "Just now",
      author: "You",
      version: 1,
      privacy: "personal",
      content: "",
      governed: false,
      tags: [],
    };
    openEditor(newDoc);
  };

  // ── Editor View ────────────────────────────────────────────────

  if (editingDoc) {
    return (
      <div className={`${isFullscreen ? "fixed inset-0 z-50 bg-background" : "mx-auto max-w-7xl"} flex flex-col h-full`}>
        {/* Editor Toolbar */}
        <div className="flex items-center justify-between border-b border-border bg-card px-4 py-2">
          <div className="flex items-center gap-3">
            <button onClick={closeEditor} aria-label="Close" className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary transition-colors"><X className="h-4 w-4" />
            </button>
            <input
              value={editorTitle}
              onChange={(e) => setEditorTitle(e.target.value)}
              className="text-base font-semibold bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground"
              placeholder="Document title..."
            />
            <span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold capitalize ${statusColors[editingDoc.status]}`}>
              {editingDoc.status}
            </span>
            {editingDoc.governed && (
              <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[9px] font-semibold text-destructive flex items-center gap-1">
                <AlertTriangle className="h-2.5 w-2.5" /> Governed
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowVersionHistory(!showVersionHistory)}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary transition-colors"
              title="Version History"
            >
              <History className="h-4 w-4" />
            </button>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className={`rounded-lg p-1.5 transition-colors ${showPreview ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary"}`}
              title="Toggle Preview"
            >
              <Eye className="h-4 w-4" />
            </button>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary transition-colors"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
            <button className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary transition-colors" title="Download">
              <Download className="h-4 w-4" />
            </button>
            <button className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary transition-colors" title="Print">
              <Printer className="h-4 w-4" />
            </button>
            <button className="inline-flex items-center gap-1.5 rounded-lg gradient-sita px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
              <Save className="h-3.5 w-3.5" /> Save
            </button>
          </div>
        </div>

        {/* Formatting Toolbar */}
        <div className="flex items-center gap-0.5 border-b border-border bg-card/50 px-4 py-1.5 overflow-x-auto">
          {TOOLBAR_ACTIONS.map(({ icon: Icon, label, md }) => (
            <button
              key={label}
              onClick={() => insertMarkdown(md)}
              className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors shrink-0"
              title={label}
            >
              <Icon className="h-3.5 w-3.5" />
            </button>
          ))}
          <div className="mx-2 h-5 w-px bg-border" />
          <span className="text-[10px] text-muted-foreground shrink-0">
            v{editingDoc.version} · {editorContent.split(/\s+/).filter(Boolean).length} words
          </span>
          {editingDoc.linkedWorkflow && (
            <>
              <div className="mx-2 h-5 w-px bg-border" />
              <span className="text-[10px] text-primary flex items-center gap-1 shrink-0">
                <Workflow className="h-3 w-3" /> {editingDoc.linkedWorkflow}
              </span>
            </>
          )}
        </div>

        {/* Editor + Preview Split */}
        <div className="flex flex-1 min-h-0">
          {/* Editor Pane */}
          <div className={`${showPreview ? "w-1/2 border-r border-border" : "w-full"} flex flex-col`}>
            <textarea
              value={editorContent}
              onChange={(e) => setEditorContent(e.target.value)}
              className="flex-1 resize-none bg-background p-6 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none leading-relaxed"
              placeholder="Start writing... (Markdown supported)"
              spellCheck={false}
            />
          </div>

          {/* Preview Pane */}
          {showPreview && (
            <div className="w-1/2 overflow-y-auto bg-card/30 p-6">
              <div className="prose prose-sm dark:prose-invert max-w-none
                prose-headings:text-foreground prose-p:text-foreground/80
                prose-strong:text-foreground prose-a:text-primary
                prose-code:text-primary prose-code:bg-primary/10 prose-code:rounded prose-code:px-1
                prose-table:border-border prose-th:border-border prose-td:border-border
                prose-blockquote:border-primary/30 prose-blockquote:text-muted-foreground
                prose-hr:border-border">
                <ReactMarkdown>{editorContent || "*Start writing to see preview...*"}</ReactMarkdown>
              </div>
            </div>
          )}

          {/* Version History Sidebar */}
          <AnimatePresence>
            {showVersionHistory && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 280, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="border-l border-border bg-card overflow-hidden"
              >
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Version History</h3>
                  <div className="space-y-2">
                    {Array.from({ length: editingDoc.version }, (_, i) => editingDoc.version - i).map((v) => (
                      <div key={v} className={`p-2.5 rounded-lg cursor-pointer transition-colors ${v === editingDoc.version ? "bg-primary/10 border border-primary/20" : "hover:bg-secondary"}`}>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-foreground">Version {v}</span>
                          {v === editingDoc.version && <CheckCircle2 className="h-3 w-3 text-primary" />}
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {v === editingDoc.version ? "Current" : `${editingDoc.author} · ${v === 1 ? "Created" : "Updated"}`}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // ── Document List View ─────────────────────────────────────────

  return (
    <div className="mx-auto max-w-6xl space-y-6">
<SitaPageHeader
        title="Docs"
        subtitle="Documents, proposals, reports, and boardroom packets — linked to workflows and proof"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary/80 transition-colors"
            >
              <LayoutTemplate className="h-3.5 w-3.5" /> Templates
            </button>
            <button
              onClick={() => createNewDoc()}
              className="inline-flex items-center gap-1.5 rounded-lg gradient-sita px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
            >
              <Plus className="h-3.5 w-3.5" /> New Document
            </button>
          </div>
        }
      />

      {/* Template Picker */}
      <AnimatePresence>
        {showTemplates && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
            <SitaCard hover={false}>
              <SitaCardTitle sub="Start from a template">Choose a Template</SitaCardTitle>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 mt-3">
                {[
                  { name: "Business Proposal", type: "proposal" as const, icon: FileSignature, domain: "Business" },
                  { name: "Invoice", type: "document" as const, icon: FileText, domain: "Business" },
                  { name: "Meeting Notes", type: "note" as const, icon: FileText, domain: "Business" },
                  { name: "Boardroom Packet", type: "boardroom-packet" as const, icon: FileText, domain: "Boardroom" },
                  { name: "Family Budget", type: "document" as const, icon: FileText, domain: "Finance" },
                  { name: "Travel Itinerary", type: "document" as const, icon: FileText, domain: "Concierge" },
                ].map((tpl) => (
                  <button
                    key={tpl.name}
                    onClick={() => { createNewDoc(tpl.type); setShowTemplates(false); }}
                    className="flex items-center gap-3 rounded-xl p-3 text-left hover:bg-secondary/50 transition-colors border border-transparent hover:border-border"
                  >
                    <div className="rounded-lg bg-primary/10 p-2">
                      <tpl.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground">{tpl.name}</p>
                      <p className="text-[10px] text-muted-foreground">{tpl.domain}</p>
                    </div>
                  </button>
                ))}
              </div>
            </SitaCard>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents, proposals, packets..."
            className="w-full rounded-xl border border-border bg-secondary/30 py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:ring-2 focus:ring-primary/20 focus:outline-none"
          />
        </div>
      </div>

      <SitaTabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

      <div className="space-y-2">
        {filteredDocs.map((doc, i) => {
          const PrivacyIcon = privacyIcons[doc.privacy] ?? Eye;
          return (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <SitaCard className="p-4 cursor-pointer" hover onClick={() => openEditor(doc)}>
                <div className="flex items-center gap-4">
                  <div className={`rounded-xl p-2.5 shrink-0 ${doc.governed ? "bg-destructive/10" : "bg-primary/10"}`}>
                    {doc.governed ? <AlertTriangle className="h-5 w-5 text-destructive" /> : <FileText className="h-5 w-5 text-primary" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-foreground truncate">{doc.title}</p>
                      <span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold capitalize ${statusColors[doc.status]}`}>
                        {doc.status}
                      </span>
                      {doc.governed && (
                        <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[9px] font-semibold text-destructive">
                          Governed
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {doc.lastModified}</span>
                      <span>v{doc.version}</span>
                      <span className="flex items-center gap-1"><PrivacyIcon className="h-3 w-3" /> {doc.privacy}</span>
                      {doc.linkedEntity && (
                        <span className="flex items-center gap-1 text-primary"><Users className="h-3 w-3" /> {doc.linkedEntity}</span>
                      )}
                      {doc.linkedWorkflow && (
                        <span className="flex items-center gap-1"><Workflow className="h-3 w-3" /> Linked</span>
                      )}
                      {doc.tags.length > 0 && (
                        <span className="text-muted-foreground/60">{doc.tags.map(t => `#${t}`).join(" ")}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={(e) => { e.stopPropagation(); openEditor(doc); }}
                      className="rounded-lg bg-primary/10 px-2.5 py-1 text-[10px] font-medium text-primary hover:bg-primary/20 transition-colors flex items-center gap-1"
                    >
                      {doc.status === "review" ? <><FileCheck className="h-3 w-3" /> Review</> : <>Edit</>}
                    </button>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
                  </div>
                </div>
              </SitaCard>
            </motion.div>
          );
        })}

        {filteredDocs.length === 0 && (
          <EmptyState variant="cta"
            icon={FileText}
            title="No Documents Yet"
            description="Create your first document to get started with the workspace."
            actions={[{ label: "Create Document", onClick: () => createNewDoc(), variant: "primary" }]}
            tip="Documents are auto-saved and version-tracked"
          />
        )}
      </div>
    </div>
  );
};

export default DocsWorkspace;
