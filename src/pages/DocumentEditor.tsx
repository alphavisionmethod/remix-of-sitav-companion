// ═══════════════════════════════════════════════════════════════
// SITA OS — Document Editor 
// Rich text editing with toolbar, templates, version history,
// autosave, comments, and approval-ready draft mode.
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useRef } from "react";
import { SitaPageHeader } from "@/components/sita/SitaPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { PageShell } from "@/components/sita/PageShell";
import {
  FileText, Bold, Italic, Underline, List, ListOrdered, Link, Image as ImageIcon,
  Code, AlignLeft, AlignCenter, AlignRight, Heading1, Heading2, Heading3,
  Save, Download, Eye, Edit3, MessageSquare, History, Paperclip,
  Undo2, Redo2, Strikethrough, Quote, Table, Minus, CheckSquare,
  Clock, Shield, Sparkles, FileBox, ChevronRight, Plus, Trash2,
} from "lucide-react";
// ── Templates ──────────────────────────────────────────────────
const TEMPLATES = [
  { id: "blank", title: "Blank Document", description: "Start from scratch", content: "" },
  { id: "proposal", title: "Business Proposal", description: "Structured proposal template", content: "# Business Proposal\n\n## Executive Summary\n\nDescribe your proposal here...\n\n## Problem Statement\n\nWhat problem are you solving?\n\n## Proposed Solution\n\nHow will you solve it?\n\n## Timeline\n\n| Phase | Duration | Deliverables |\n|-------|----------|-------------|\n| Phase 1 | 2 weeks | Discovery |\n| Phase 2 | 4 weeks | Development |\n\n## Budget\n\nTotal: $XX,XXX\n\n## Next Steps\n\n1. Review and approve\n2. Sign agreement\n3. Begin Phase 1" },
  { id: "meeting", title: "Meeting Notes", description: "Structured meeting notes", content: "# Meeting Notes\n\n**Date:** " + new Date().toLocaleDateString() + "\n**Attendees:** \n**Objective:** \n\n## Agenda\n\n1. \n2. \n3. \n\n## Discussion Notes\n\n\n\n## Action Items\n\n- [ ] \n- [ ] \n\n## Decisions Made\n\n\n\n## Next Meeting\n\n**Date:** \n**Focus:** " },
  { id: "review", title: "Quarterly Review", description: "Operating review document", content: "# Quarterly Business Review\n\n**Period:** Q_ 2026\n**Prepared by:** \n\n## Performance Summary\n\n### Revenue\n- Target: $\n- Actual: $\n- Variance: \n\n### Key Metrics\n\n| Metric | Target | Actual | Status |\n|--------|--------|--------|--------|\n| Revenue | | | |\n| Clients | | | |\n| Retention | | | |\n\n## Highlights\n\n1. \n2. \n3. \n\n## Challenges\n\n1. \n2. \n\n## Next Quarter Priorities\n\n1. \n2. \n3. " },
  { id: "invoice", title: "Invoice Summary", description: "Invoice or payment doc", content: "# Invoice\n\n**Invoice #:** INV-\n**Date:** " + new Date().toLocaleDateString() + "\n**Due:** \n\n## Bill To\n\nCompany Name\nAddress\n\n## Line Items\n\n| Description | Qty | Rate | Amount |\n|-------------|-----|------|--------|\n| | | | |\n| | | | |\n\n**Subtotal:** $\n**Tax:** $\n**Total:** $\n\n## Payment Terms\n\nNet 30 days" },
];

// ── Version history mock ──────────────────────────────────────
const VERSION_HISTORY = [
  { id: "v4", label: "Current", timestamp: "Just now", author: "You", changes: "Updated budget section" },
  { id: "v3", label: "v3", timestamp: "2 hours ago", author: "You", changes: "Added timeline" },
  { id: "v2", label: "v2", timestamp: "Yesterday", author: "You", changes: "First draft complete" },
  { id: "v1", label: "v1", timestamp: "2 days ago", author: "You", changes: "Initial creation" },
];

const TOOLBAR_GROUPS = [
  [{ icon: Heading1, label: "H1", action: "h1" }, { icon: Heading2, label: "H2", action: "h2" }, { icon: Heading3, label: "H3", action: "h3" }],
  [{ icon: Bold, label: "Bold", action: "bold" }, { icon: Italic, label: "Italic", action: "italic" }, { icon: Underline, label: "Underline", action: "underline" }, { icon: Strikethrough, label: "Strike", action: "strike" }],
  [{ icon: List, label: "Bullet", action: "ul" }, { icon: ListOrdered, label: "Numbered", action: "ol" }, { icon: CheckSquare, label: "Checklist", action: "checklist" }],
  [{ icon: AlignLeft, label: "Left", action: "left" }, { icon: AlignCenter, label: "Center", action: "center" }, { icon: AlignRight, label: "Right", action: "right" }],
  [{ icon: Quote, label: "Quote", action: "quote" }, { icon: Code, label: "Code", action: "code" }, { icon: Table, label: "Table", action: "table" }, { icon: Minus, label: "Divider", action: "hr" }],
  [{ icon: Link, label: "Link", action: "link" }, { icon: ImageIcon, label: "Image", action: "image" }, { icon: Paperclip, label: "Attach", action: "attach" }],
];

const DocumentEditor = () => {
const [mode, setMode] = useState<"edit" | "preview" | "review">("edit");
  const [title, setTitle] = useState("Untitled Document");
  const [content, setContent] = useState("Start writing your document here.\n\nThis editor supports headings, bold, italic, lists, links, images, code blocks, and more.\n\nSwitch between Edit, Preview, and Review modes.");
  const [wordCount, setWordCount] = useState(0);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [docStatus, setDocStatus] = useState<"draft" | "review" | "approved">("draft");
  const [comments, setComments] = useState<{ id: string; text: string; author: string; time: string }[]>([
    { id: "c1", text: "Budget numbers look good, but let's double-check the Q2 forecast.", author: "CFO", time: "1 hour ago" },
  ]);
  const [newComment, setNewComment] = useState("");
  const contentRef = useRef<HTMLDivElement>(null);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout>>();

  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);
    setWordCount(newContent.trim().split(/\s+/).filter(Boolean).length);
    setIsDirty(true);

    // Autosave after 2s of inactivity
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      setLastSaved(new Date());
      setIsDirty(false);
    }, 2000);
  }, []);

  const handleSave = () => {
    setLastSaved(new Date());
    setIsDirty(false);
    toast.success("Document saved");
  };

  const handleApplyTemplate = (template: typeof TEMPLATES[0]) => {
    setTitle(template.title);
    setContent(template.content);
    setShowTemplates(false);
    setIsDirty(true);
    toast.success(`Template "${template.title}" applied`);
  };

  const handleToolbarAction = (action: string) => {
    const prefix: Record<string, string> = {
      h1: "# ", h2: "## ", h3: "### ", bold: "**", italic: "_", strike: "~~",
      ul: "- ", ol: "1. ", checklist: "- [ ] ", quote: "> ", code: "```\n", hr: "\n---\n",
      link: "[text](url)", image: "![alt](url)", table: "| Col1 | Col2 |\n|------|------|\n| | |",
    };
    if (prefix[action]) {
      setContent(prev => prev + "\n" + prefix[action]);
      setIsDirty(true);
    }
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    setComments(prev => [...prev, { id: `c${Date.now()}`, text: newComment, author: "You", time: "Just now" }]);
    setNewComment("");
    toast.success("Comment added");
  };

  const handleSubmitForApproval = () => {
    setDocStatus("review");
    toast.success("Document submitted for approval");
  };

  return (
    <PageShell width="wide">
<SitaPageHeader
        icon={<FileText className="h-6 w-6" />}
        title="Document Editor"
        subtitle="Create, edit, and review documents"
      >
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => setShowTemplates(!showTemplates)}>
            <FileBox className="w-3.5 h-3.5" /> Templates
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => setShowHistory(!showHistory)}>
            <History className="w-3.5 h-3.5" /> History
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5 text-xs">
            <Download className="w-3.5 h-3.5" /> Export
          </Button>
          <Button size="sm" className="gap-1.5 text-xs" onClick={handleSave}>
            <Save className="w-3.5 h-3.5" /> {isDirty ? "Save *" : "Saved"}
          </Button>
        </div>
      </SitaPageHeader>

      {/* Templates panel */}
      {showTemplates && (
        <Card className="border-primary/20">
          <CardHeader className="pb-3"><CardTitle className="text-sm">Choose Template</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {TEMPLATES.map(t => (
                <button key={t.id} onClick={() => handleApplyTemplate(t)} className="text-left p-3 rounded-lg border border-border/30 hover:border-primary/40 hover:bg-primary/5 transition-all">
                  <FileBox className="h-5 w-5 text-primary mb-1.5" />
                  <p className="text-xs font-medium">{t.title}</p>
                  <p className="text-[10px] text-muted-foreground">{t.description}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-4">
        {/* Main editor */}
        <Card className="flex-1 overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center gap-1 p-2 border-b border-border/20 bg-card/50 flex-wrap">
            <button onClick={() => handleToolbarAction("undo")} className="p-1.5 rounded-md hover:bg-accent/30 text-muted-foreground"><Undo2 className="w-3.5 h-3.5" /></button>
            <button onClick={() => handleToolbarAction("redo")} className="p-1.5 rounded-md hover:bg-accent/30 text-muted-foreground"><Redo2 className="w-3.5 h-3.5" /></button>
            <div className="w-px h-5 bg-border/30 mx-1" />
            {TOOLBAR_GROUPS.map((group, gi) => (
              <div key={gi} className="flex items-center gap-0.5">
                {group.map((item) => (
                  <button key={item.label} title={item.label} onClick={() => handleToolbarAction(item.action)} className="p-1.5 rounded-md hover:bg-accent/30 text-muted-foreground hover:text-foreground transition-colors">
                    <item.icon className="w-3.5 h-3.5" />
                  </button>
                ))}
                {gi < TOOLBAR_GROUPS.length - 1 && <div className="w-px h-5 bg-border/30 mx-1" />}
              </div>
            ))}
            <div className="ml-auto flex items-center gap-1">
              {(["edit", "preview", "review"] as const).map(m => (
                <button key={m} onClick={() => { setMode(m); if (m === "review") setShowComments(true); }} className={cn("px-2.5 py-1 text-xs rounded-md transition-colors capitalize", mode === m ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-accent/30")}>
                  {m === "edit" && <Edit3 className="w-3 h-3 inline mr-1" />}
                  {m === "preview" && <Eye className="w-3 h-3 inline mr-1" />}
                  {m === "review" && <MessageSquare className="w-3 h-3 inline mr-1" />}
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="px-8 pt-6">
            <input type="text" value={title} onChange={e => { setTitle(e.target.value); setIsDirty(true); }} className="w-full text-2xl font-bold bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground/30" placeholder="Document title..." />
          </div>

          {/* Content area */}
          <div className="px-8 py-4 min-h-[500px]">
            {mode === "edit" ? (
              <textarea value={content} onChange={e => handleContentChange(e.target.value)} className="w-full min-h-[450px] bg-transparent border-none outline-none resize-none text-sm leading-relaxed text-foreground/80 placeholder:text-muted-foreground/30 font-mono" placeholder="Start writing..." />
            ) : mode === "preview" ? (
              <div className="prose prose-sm prose-invert max-w-none">
                {content.split("\n").map((line, i) => {
                  if (line.startsWith("# ")) return <h1 key={i} className="text-xl font-bold text-foreground">{line.slice(2)}</h1>;
                  if (line.startsWith("## ")) return <h2 key={i} className="text-lg font-semibold text-foreground mt-4">{line.slice(3)}</h2>;
                  if (line.startsWith("### ")) return <h3 key={i} className="text-base font-medium text-foreground mt-3">{line.slice(4)}</h3>;
                  if (line.startsWith("- ")) return <li key={i} className="text-sm text-foreground/80 ml-4">{line.slice(2)}</li>;
                  if (line.startsWith("> ")) return <blockquote key={i} className="border-l-2 border-primary/40 pl-3 text-sm text-muted-foreground italic">{line.slice(2)}</blockquote>;
                  if (line.startsWith("---")) return <hr key={i} className="border-border/30 my-4" />;
                  if (line.startsWith("|")) return <pre key={i} className="text-xs text-foreground/70 font-mono">{line}</pre>;
                  return line ? <p key={i} className="text-sm text-foreground/80">{line}</p> : <br key={i} />;
                })}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="prose prose-sm prose-invert max-w-none">
                  {content.split("\n").map((line, i) => line ? <p key={i} className="text-sm text-foreground/80">{line}</p> : <br key={i} />)}
                </div>
              </div>
            )}
          </div>

          {/* Footer status */}
          <div className="flex items-center justify-between px-4 py-2 border-t border-border/20 bg-card/30 text-[10px] text-muted-foreground">
            <div className="flex items-center gap-3">
              <span>{wordCount} words</span>
              <span>{content.length} chars</span>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={docStatus === "approved" ? "default" : "outline"} className={cn("text-[9px] px-1.5", docStatus === "review" && "border-amber-500/30 text-amber-400", docStatus === "approved" && "bg-emerald-500/20 text-emerald-400")}>{docStatus}</Badge>
              {docStatus === "draft" && <Button variant="ghost" size="sm" className="text-[10px] h-5 px-2" onClick={handleSubmitForApproval}><Shield className="w-2.5 h-2.5 mr-0.5" /> Submit for approval</Button>}
              <span className="flex items-center gap-1">
                <Clock className="w-2.5 h-2.5" />
                {isDirty ? "Unsaved changes" : lastSaved ? `Saved ${lastSaved.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "Auto-save active"}
              </span>
            </div>
          </div>
        </Card>

        {/* Side panels */}
        {(showHistory || showComments) && (
          <div className="w-72 shrink-0 space-y-4 hidden lg:block">
            {showHistory && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2"><History className="h-3.5 w-3.5" /> Version History</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {([] as never[]).map(v => (
                    <div key={v.id} className={cn("p-2 rounded-lg border transition-colors cursor-pointer hover:bg-accent/20", v.id === "v4" ? "border-primary/30 bg-primary/5" : "border-border/30")}>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium">{v.label}</span>
                        <span className="text-[10px] text-muted-foreground">{v.timestamp}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground">{v.changes}</p>
                      <p className="text-[10px] text-muted-foreground/60">{v.author}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {showComments && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2"><MessageSquare className="h-3.5 w-3.5" /> Comments ({comments.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {comments.map(c => (
                    <div key={c.id} className="p-2 rounded-lg bg-muted/20 border border-border/30">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium">{c.author}</span>
                        <span className="text-[10px] text-muted-foreground">{c.time}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{c.text}</p>
                    </div>
                  ))}
                  <div className="flex gap-1.5">
                    <Input value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Add comment..." className="h-7 text-xs bg-card/30" onKeyDown={e => e.key === "Enter" && handleAddComment()} />
                    <Button size="sm" className="h-7 text-xs px-2" onClick={handleAddComment}>Add</Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </PageShell>
  );
};

export default DocumentEditor;
