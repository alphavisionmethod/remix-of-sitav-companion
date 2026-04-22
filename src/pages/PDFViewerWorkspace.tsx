import { useState } from "react";
import { SitaPageHeader } from "@/components/sita/SitaPageHeader";
import { SitaTabs } from "@/components/sita/SitaComponents";
import { SitaCard } from "@/components/sita/SitaCard";
import { FileText, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Search, Download, Printer, MessageSquare, Highlighter, Bookmark, RotateCw, Maximize2, Layers, PenTool } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { motion } from "framer-motion";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { PageShell } from "@/components/sita/PageShell";

type AnnotationType = "highlight" | "comment" | "signature" | "bookmark";

interface Annotation {
  id: string;
  type: AnnotationType;
  page: number;
  content: string;
  color: string;
  createdAt: string;
  author: string;
}

const demoAnnotations: Annotation[] = [
  { id: "a1", type: "highlight", page: 1, content: "Key clause regarding data retention policy", color: "hsl(var(--sita-gold))", createdAt: "2026-04-08T10:00:00Z", author: "You" },
  { id: "a2", type: "comment", page: 2, content: "Need legal review on this section before signing", color: "hsl(var(--primary))", createdAt: "2026-04-08T11:30:00Z", author: "You" },
  { id: "a3", type: "bookmark", page: 5, content: "Payment terms", color: "hsl(var(--trust-safe))", createdAt: "2026-04-07T09:00:00Z", author: "Money Advisor" },
  { id: "a4", type: "signature", page: 8, content: "Signature required here", color: "hsl(var(--destructive))", createdAt: "2026-04-09T08:00:00Z", author: "System" },
];

const demoPages = Array.from({ length: 12 }, (_, i) => ({
  number: i + 1,
  hasAnnotations: demoAnnotations.some(a => a.page === i + 1),
}));

const PDFViewerWorkspace = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState([100]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"viewer" | "annotations" | "versions">("viewer");
  const [activeTool, setActiveTool] = useState<AnnotationType | null>(null);
  const totalPages = 12;

  const annotationsForPage = demoAnnotations.filter(a => a.page === currentPage);

  const iconForType = (type: AnnotationType) => {
    switch (type) {
      case "highlight": return <Highlighter className="h-3.5 w-3.5" />;
      case "comment": return <MessageSquare className="h-3.5 w-3.5" />;
      case "signature": return <PenTool className="h-3.5 w-3.5" />;
      case "bookmark": return <Bookmark className="h-3.5 w-3.5" />;
    }
  };

  return (
    <PageShell>
    <div className="mx-auto max-w-7xl space-y-4">
<SitaPageHeader icon={<FileText className="h-6 w-6" />} title="PDF Viewer" subtitle="View, annotate, highlight, and sign documents">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1" /> Download</Button>
          <Button variant="outline" size="sm"><Printer className="h-4 w-4 mr-1" /> Print</Button>
        </div>
      </SitaPageHeader>

      <SitaTabs tabs={[
        { key: "viewer", label: "Viewer" },
        { key: "annotations", label: `Annotations (${demoAnnotations.length})` },
        { key: "versions", label: "Versions" },
      ]} active={activeTab} onChange={(k) => setActiveTab(k as typeof activeTab)} />

      {activeTab === "viewer" && (
        <div className="grid grid-cols-[200px_1fr] gap-4">
          {/* Page thumbnails */}
          <SitaCard className="p-3 space-y-2 max-h-[70vh] overflow-y-auto">
            <p className="text-xs font-medium text-muted-foreground mb-2">Pages</p>
            {demoPages.map((p) => (
              <button
                key={p.number}
                onClick={() => setCurrentPage(p.number)}
                className={`w-full rounded-lg border p-2 text-center text-xs transition-all relative ${
                  currentPage === p.number
                    ? "border-primary bg-primary/10 text-primary font-medium"
                    : "border-border/40 hover:border-primary/40 text-muted-foreground"
                }`}
              >
                <div className="aspect-[3/4] bg-muted/30 rounded mb-1 flex items-center justify-center text-[10px]">
                  {p.number}
                </div>
                {p.hasAnnotations && (
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-sita-gold" />
                )}
              </button>
            ))}
          </SitaCard>

          {/* Main viewer */}
          <div className="space-y-3">
            {/* Toolbar */}
            <SitaCard className="p-2 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage <= 1}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  Page <span className="text-foreground font-medium">{currentPage}</span> of {totalPages}
                </span>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage >= totalPages}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <ZoomOut className="h-4 w-4 text-muted-foreground" />
                <Slider value={zoom} onValueChange={setZoom} min={50} max={200} step={10} className="w-24" />
                <ZoomIn className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground w-10 text-right">{zoom[0]}%</span>
              </div>

              <div className="flex items-center gap-1">
                {(["highlight", "comment", "signature", "bookmark"] as AnnotationType[]).map((tool) => (
                  <Button
                    key={tool}
                    variant={activeTool === tool ? "default" : "ghost"}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setActiveTool(activeTool === tool ? null : tool)}
                  >
                    {iconForType(tool)}
                  </Button>
                ))}
                <div className="w-px h-5 bg-border mx-1" />
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSearchOpen(!searchOpen)}>
                  <Search className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <RotateCw className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </div>
            </SitaCard>

            {searchOpen && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
                <SitaCard className="p-3 flex items-center gap-3">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search in document..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="h-8" />
                  <span className="text-xs text-muted-foreground whitespace-nowrap">0 results</span>
                </SitaCard>
              </motion.div>
            )}

            {/* PDF Canvas */}
            <SitaCard className="p-0 overflow-hidden">
              <div
                className="bg-muted/20 flex items-center justify-center relative"
                style={{ minHeight: "60vh", transform: `scale(${zoom[0] / 100})`, transformOrigin: "top center" }}
              >
                <div className="bg-card border border-border/30 rounded-lg shadow-lg w-[595px] min-h-[842px] p-12 relative">
                  <div className="space-y-4">
                    <div className="h-8 w-3/4 bg-muted/40 rounded" />
                    <div className="h-4 w-full bg-muted/25 rounded" />
                    <div className="h-4 w-5/6 bg-muted/25 rounded" />
                    <div className="h-4 w-full bg-muted/25 rounded" />
                    <div className="h-4 w-2/3 bg-muted/25 rounded" />
                    <div className="h-20" />
                    <div className="h-4 w-full bg-muted/25 rounded" />
                    <div className="h-4 w-4/5 bg-muted/25 rounded" />
                    <div className="h-4 w-full bg-muted/25 rounded" />
                    <div className="h-4 w-3/4 bg-muted/25 rounded" />
                    <div className="h-40" />
                    <div className="h-4 w-full bg-muted/25 rounded" />
                    <div className="h-4 w-5/6 bg-muted/25 rounded" />
                  </div>

                  {/* Annotation overlays */}
                  {annotationsForPage.map((ann) => (
                    <div
                      key={ann.id}
                      className="absolute rounded px-2 py-1 text-[10px] font-medium border"
                      style={{
                        top: `${20 + Math.random() * 60}%`,
                        left: ann.type === "comment" ? "85%" : "10%",
                        borderColor: ann.color,
                        backgroundColor: `${ann.color}20`,
                        color: ann.color,
                      }}
                    >
                      {iconForType(ann.type)}
                    </div>
                  ))}

                  <div className="absolute bottom-4 right-4 text-xs text-muted-foreground">
                    Page {currentPage}
                  </div>
                </div>
              </div>
            </SitaCard>
          </div>
        </div>
      )}

      {activeTab === "annotations" && (
        <div className="space-y-3">
          {demoAnnotations.map((ann) => (
            <SitaCard key={ann.id} className="p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{iconForType(ann.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-[10px] capitalize">{ann.type}</Badge>
                    <span className="text-xs text-muted-foreground">Page {ann.page}</span>
                    <span className="text-xs text-muted-foreground">· {ann.author}</span>
                  </div>
                  <p className="text-sm">{ann.content}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {new Date(ann.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => { setCurrentPage(ann.page); setActiveTab("viewer"); }}>
                  Go to page
                </Button>
              </div>
            </SitaCard>
          ))}
        </div>
      )}

      {activeTab === "versions" && (
        <div className="space-y-3">
          {[
            { version: "v3 (current)", date: "Apr 9, 2026", author: "You", changes: "Added signature marks" },
            { version: "v2", date: "Apr 8, 2026", author: "Money Advisor", changes: "Highlighted payment terms" },
            { version: "v1 (original)", date: "Apr 7, 2026", author: "External", changes: "Original document" },
          ].map((v) => (
            <SitaCard key={v.version} className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{v.version}</p>
                <p className="text-xs text-muted-foreground">{v.date} · {v.author} · {v.changes}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm"><Layers className="h-3.5 w-3.5 mr-1" /> Compare</Button>
                <Button variant="ghost" size="sm"><Download className="h-3.5 w-3.5 mr-1" /> Download</Button>
              </div>
            </SitaCard>
          ))}
        </div>
      )}
    </div>
    </PageShell>
  );
};

export default PDFViewerWorkspace;
