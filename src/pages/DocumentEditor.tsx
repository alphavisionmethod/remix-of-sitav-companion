import { useState } from "react";
import { SitaPageHeader, SitaCard, SitaCardTitle } from "@/components/sita/SitaCard";
import { EmptyState, SitaTabs } from "@/components/sita/SitaComponents";
import { motion } from "framer-motion";
import { FileText, Bold, Italic, Underline, List, ListOrdered, Link, Image, Code, AlignLeft, AlignCenter, AlignRight, Heading1, Heading2, Save, Download, Eye, Edit3, MessageSquare, History, Paperclip, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";

const TOOLBAR_GROUPS = [
  [{ icon: Heading1, label: "H1" }, { icon: Heading2, label: "H2" }],
  [{ icon: Bold, label: "Bold" }, { icon: Italic, label: "Italic" }, { icon: Underline, label: "Underline" }],
  [{ icon: List, label: "Bullet" }, { icon: ListOrdered, label: "Numbered" }],
  [{ icon: AlignLeft, label: "Left" }, { icon: AlignCenter, label: "Center" }, { icon: AlignRight, label: "Right" }],
  [{ icon: Link, label: "Link" }, { icon: Image, label: "Image" }, { icon: Code, label: "Code" }, { icon: Paperclip, label: "Attach" }],
];

const DocumentEditor = () => {
  const [mode, setMode] = useState<"edit" | "preview" | "review">("edit");
  const [title, setTitle] = useState("Untitled Document");
  const [content, setContent] = useState("Start writing your document here.\n\nThis rich text editor supports headings, bold, italic, lists, links, images, code blocks, and attachments.\n\nYou can switch between Edit, Preview, and Review modes using the toolbar above.");
  const [wordCount, setWordCount] = useState(0);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setWordCount(e.target.value.trim().split(/\s+/).filter(Boolean).length);
  };

  return (
    <div className="min-h-screen pb-12">
      <DemoModeBadge />
      <SitaPageHeader title="Document Editor" subtitle="Create, edit, and review documents" actions={
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="gap-1.5 text-xs border-border/50"><History className="w-3.5 h-3.5" /> History</Button>
          <Button size="sm" variant="outline" className="gap-1.5 text-xs border-border/50"><Download className="w-3.5 h-3.5" /> Export</Button>
          <Button size="sm" className="gap-1.5 text-xs bg-primary hover:bg-primary/90"><Save className="w-3.5 h-3.5" /> Save</Button>
        </div>
      } />

      <SitaCard className="overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center gap-1 p-2 border-b border-border/20 bg-card/50 flex-wrap">
          {TOOLBAR_GROUPS.map((group, gi) => (
            <div key={gi} className="flex items-center gap-0.5">
              {group.map((item) => (
                <button key={item.label} title={item.label} className="p-1.5 rounded-md hover:bg-accent/30 text-muted-foreground hover:text-foreground transition-colors">
                  <item.icon className="w-3.5 h-3.5" />
                </button>
              ))}
              {gi < TOOLBAR_GROUPS.length - 1 && <div className="w-px h-5 bg-border/30 mx-1" />}
            </div>
          ))}
          <div className="ml-auto flex items-center gap-1">
            {(["edit", "preview", "review"] as const).map(m => (
              <button key={m} onClick={() => setMode(m)} className={cn("px-2.5 py-1 text-xs rounded-md transition-colors capitalize", mode === m ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-accent/30")}>
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
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full text-2xl font-bold bg-transparent border-none outline-none placeholder:text-muted-foreground/30" placeholder="Document title..." />
        </div>

        {/* Content area */}
        <div className="px-8 py-4 min-h-[500px]">
          {mode === "edit" ? (
            <textarea value={content} onChange={handleContentChange} className="w-full min-h-[450px] bg-transparent border-none outline-none resize-none text-sm leading-relaxed text-foreground/80 placeholder:text-muted-foreground/30" placeholder="Start writing..." />
          ) : mode === "preview" ? (
            <div className="prose prose-sm prose-invert max-w-none">
              {content.split("\n").map((line, i) => line ? <p key={i} className="text-sm text-foreground/80">{line}</p> : <br key={i} />)}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="prose prose-sm prose-invert max-w-none">
                {content.split("\n").map((line, i) => line ? <p key={i} className="text-sm text-foreground/80">{line}</p> : <br key={i} />)}
              </div>
              <div className="border-t border-border/20 pt-4">
                <h4 className="text-xs font-medium text-muted-foreground mb-2">Comments</h4>
                <EmptyState icon={MessageSquare} title="No comments yet" description="Add comments and suggestions for review" />
              </div>
            </div>
          )}
        </div>

        {/* Footer status */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-border/20 bg-card/30 text-[10px] text-muted-foreground">
          <div className="flex items-center gap-3">
            <span>{wordCount} words</span>
            <span>{content.length} characters</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[9px] px-1.5 border-border/20">Draft</Badge>
            <span>Auto-saved</span>
          </div>
        </div>
      </SitaCard>
    </div>
  );
};

export default DocumentEditor;
