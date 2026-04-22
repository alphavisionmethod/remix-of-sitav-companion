import { useState } from "react";
import { SitaPageHeader } from "@/components/sita/SitaPageHeader";
import { SitaCard } from "@/components/sita/SitaCard";
import { Clipboard, Pin, Copy, Trash2, Search, Image, FileText, Link, Star, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { PageShell } from "@/components/sita/PageShell";

type ClipType = "text" | "image" | "link" | "file";

interface ClipEntry {
  id: string;
  type: ClipType;
  content: string;
  preview?: string;
  source: string;
  copiedAt: string;
  pinned: boolean;
  favorite: boolean;
}

const demoClips: ClipEntry[] = [
  { id: "c1", type: "text", content: "Meeting with Sarah at 3pm to discuss Q2 budget allocations", source: "Calendar", copiedAt: "2 min ago", pinned: true, favorite: false },
  { id: "c2", type: "link", content: "https://docs.sita.ai/trust-calibration", preview: "Trust Calibration Guide — SITA Docs", source: "Browser", copiedAt: "8 min ago", pinned: false, favorite: true },
  { id: "c3", type: "text", content: "$12,500", source: "Finance Workspace", copiedAt: "15 min ago", pinned: false, favorite: false },
  { id: "c4", type: "file", content: "Q2-Forecast-v3.xlsx", source: "Files", copiedAt: "22 min ago", pinned: true, favorite: false },
  { id: "c5", type: "text", content: "Invoice #INV-2026-0341 — Acme Corp — $4,200.00", source: "Money Center", copiedAt: "35 min ago", pinned: false, favorite: false },
  { id: "c6", type: "image", content: "[Screenshot of dashboard chart]", source: "Boardroom", copiedAt: "1 hr ago", pinned: false, favorite: false },
  { id: "c7", type: "text", content: "Follow up with Alex re: onboarding timeline — need decision by Friday", source: "CRM", copiedAt: "1 hr ago", pinned: false, favorite: true },
  { id: "c8", type: "link", content: "https://calendar.google.com/event/abc123", preview: "Team Standup — April 9, 9:00 AM", source: "Calendar", copiedAt: "2 hr ago", pinned: false, favorite: false },
];

const typeIcon = (t: ClipType) => {
  switch (t) {
    case "text": return <FileText className="h-3.5 w-3.5" />;
    case "image": return <Image className="h-3.5 w-3.5" />;
    case "link": return <Link className="h-3.5 w-3.5" />;
    case "file": return <Clipboard className="h-3.5 w-3.5" />;
  }
};

const ClipboardHistory = () => {
  const [clips, setClips] = useState(demoClips);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "pinned" | "favorites">("all");

  const filtered = clips.filter(c => {
    if (filter === "pinned" && !c.pinned) return false;
    if (filter === "favorites" && !c.favorite) return false;
    if (search && !c.content.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const togglePin = (id: string) => setClips(clips.map(c => c.id === id ? { ...c, pinned: !c.pinned } : c));
  const toggleFav = (id: string) => setClips(clips.map(c => c.id === id ? { ...c, favorite: !c.favorite } : c));
  const removeClip = (id: string) => setClips(clips.filter(c => c.id !== id));

  return (
    <PageShell>
    <div className="mx-auto max-w-3xl space-y-4">
<SitaPageHeader icon={<Clipboard className="h-6 w-6" />} title="Clipboard History" subtitle="Recent copies across all workspaces — search, pin, and reuse">
        <Button variant="outline" size="sm" onClick={() => setClips(clips.filter(c => c.pinned))}>
          <Trash2 className="h-4 w-4 mr-1" /> Clear Unpinned
        </Button>
      </SitaPageHeader>

      <SitaCard className="p-3 flex items-center gap-3">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search clipboard..." value={search} onChange={e => setSearch(e.target.value)} className="h-8" />
        <div className="flex gap-1">
          {(["all", "pinned", "favorites"] as const).map(f => (
            <Button key={f} variant={filter === f ? "default" : "ghost"} size="sm" onClick={() => setFilter(f)} className="capitalize text-xs">
              {f}
            </Button>
          ))}
        </div>
      </SitaCard>

      <div className="space-y-2">
        <AnimatePresence>
          {filtered.map((clip) => (
            <motion.div
              key={clip.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <SitaCard className="p-3 group hover:border-primary/30 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 text-muted-foreground">{typeIcon(clip.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{clip.content}</p>
                    {clip.preview && <p className="text-xs text-muted-foreground truncate mt-0.5">{clip.preview}</p>}
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-[10px]">{clip.source}</Badge>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Clock className="h-2.5 w-2.5" /> {clip.copiedAt}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-7 w-7"><Copy className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => togglePin(clip.id)}>
                      <Pin className={`h-3.5 w-3.5 ${clip.pinned ? "text-primary fill-primary" : ""}`} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toggleFav(clip.id)}>
                      <Star className={`h-3.5 w-3.5 ${clip.favorite ? "text-sita-gold fill-sita-gold" : ""}`} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeClip(clip.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </SitaCard>
            </motion.div>
          ))}
        </AnimatePresence>
        {filtered.length === 0 && (
          <SitaCard className="p-8 text-center">
            <Clipboard className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No clipboard entries match your search</p>
          </SitaCard>
        )}
      </div>
    </div>
    </PageShell>
  );
};

export default ClipboardHistory;
