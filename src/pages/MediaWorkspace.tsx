import { useState, useMemo } from "react";
import { SitaPageHeader, SitaCard, SitaCardTitle } from "@/components/sita/SitaCard";
import { KPITile, EmptyState, SitaTabs } from "@/components/sita/SitaComponents";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { Image, Upload, Camera, ScanLine, Search, Grid3X3, List, Eye, Download, Tag, Link, Trash2, MoreHorizontal, Filter, FolderOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { DEMO_MEDIA, type DemoMediaItem as MediaItem } from "@/lib/demo-data/media";

const db: any = supabase;

const MediaWorkspace = () => {
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);

  const filtered = useMemo(() => {
    let result = MOCK_MEDIA;
    if (typeFilter !== "all") result = result.filter(m => m.type === typeFilter);
    if (search) result = result.filter(m => m.name.toLowerCase().includes(search.toLowerCase()) || m.tags.some(t => t.includes(search.toLowerCase())));
    return result;
  }, [search, typeFilter]);

  return (
    <div className="min-h-screen pb-12">
      <DemoModeBadge />
      <SitaPageHeader title="Media & Images" subtitle="Screenshots, photos, scans, and visual assets" actions={
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="gap-1.5 text-xs border-border/50"><Camera className="w-3.5 h-3.5" /> Capture</Button>
          <Button size="sm" variant="outline" className="gap-1.5 text-xs border-border/50"><ScanLine className="w-3.5 h-3.5" /> Scan</Button>
          <Button size="sm" className="gap-1.5 text-xs bg-primary hover:bg-primary/90"><Upload className="w-3.5 h-3.5" /> Upload</Button>
        </div>
      } />

      {/* Controls */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input placeholder="Search media..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-8 text-xs bg-card/30" />
        </div>
        <div className="flex gap-1">
          {[{ k: "all", l: "All" }, { k: "image", l: "Images" }, { k: "screenshot", l: "Screenshots" }, { k: "scan", l: "Scans" }, { k: "photo", l: "Photos" }].map(f => (
            <button key={f.k} onClick={() => setTypeFilter(f.k)} className={cn("px-2 py-1 text-xs rounded-md transition-colors", typeFilter === f.k ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-accent/30")}>{f.l}</button>
          ))}
        </div>
        <div className="flex gap-0.5 bg-card/30 rounded-lg border border-border/20 p-0.5">
          <button onClick={() => setViewMode("grid")} className={cn("p-1.5 rounded-md", viewMode === "grid" ? "bg-primary/20 text-primary" : "text-muted-foreground")}><Grid3X3 className="w-3.5 h-3.5" /></button>
          <button onClick={() => setViewMode("list")} className={cn("p-1.5 rounded-md", viewMode === "list" ? "bg-primary/20 text-primary" : "text-muted-foreground")}><List className="w-3.5 h-3.5" /></button>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 min-w-0">
          {viewMode === "grid" ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {filtered.map(item => (
                <motion.button key={item.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} onClick={() => setSelectedMedia(item)}
                  className={cn("text-left rounded-xl overflow-hidden border transition-all hover:shadow-lg", selectedMedia?.id === item.id ? "border-primary/50 ring-1 ring-primary/30" : "border-border/20 hover:border-border/40")}>
                  <div className={cn("aspect-square bg-gradient-to-br", item.preview, "flex items-center justify-center")}>
                    <Image className="w-8 h-8 text-white/30" />
                  </div>
                  <div className="p-2.5 bg-card/40 backdrop-blur-sm">
                    <div className="text-xs font-medium truncate">{item.name}</div>
                    <div className="text-[10px] text-muted-foreground flex items-center justify-between mt-0.5">
                      <span>{item.size}</span>
                      <span>{format(new Date(item.date), "MMM d")}</span>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {filtered.map(item => (
                <button key={item.id} onClick={() => setSelectedMedia(item)}
                  className={cn("w-full text-left flex items-center gap-3 p-3 rounded-xl border transition-all", selectedMedia?.id === item.id ? "bg-primary/10 border-primary/30" : "bg-card/20 border-border/20 hover:bg-accent/20")}>
                  <div className={cn("w-10 h-10 rounded-lg bg-gradient-to-br shrink-0 flex items-center justify-center", item.preview)}>
                    <Image className="w-4 h-4 text-white/40" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate">{item.name}</div>
                    <div className="text-[10px] text-muted-foreground">{item.type} · {item.size} · {format(new Date(item.date), "MMM d, yyyy")}</div>
                  </div>
                  {item.linkedTo && <Badge variant="outline" className="text-[9px] px-1.5 border-primary/20 text-primary"><Link className="w-2 h-2 mr-0.5" />{item.linkedTo}</Badge>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selectedMedia && (
          <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="w-72 shrink-0 hidden lg:block">
            <SitaCard className="p-4">
              <div className={cn("aspect-video rounded-lg bg-gradient-to-br mb-3 flex items-center justify-center", selectedMedia.preview)}>
                <Image className="w-10 h-10 text-white/30" />
              </div>
              <h3 className="text-sm font-semibold mb-2">{selectedMedia.name}</h3>
              <div className="space-y-1.5 text-xs text-muted-foreground mb-4">
                <div>Type: <span className="text-foreground capitalize">{selectedMedia.type}</span></div>
                <div>Size: <span className="text-foreground">{selectedMedia.size}</span></div>
                <div>Date: <span className="text-foreground">{format(new Date(selectedMedia.date), "MMM d, yyyy 'at' h:mm a")}</span></div>
              </div>
              <div className="flex flex-wrap gap-1 mb-4">
                {selectedMedia.tags.map(t => <Badge key={t} variant="outline" className="text-[9px] border-border/20"><Tag className="w-2 h-2 mr-0.5" />{t}</Badge>)}
              </div>
              {selectedMedia.linkedTo && (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/5 border border-primary/10 mb-3 text-xs">
                  <Link className="w-3 h-3 text-primary" />
                  <span className="text-muted-foreground">Linked to</span>
                  <span className="text-primary font-medium">{selectedMedia.linkedTo}</span>
                </div>
              )}
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 text-xs gap-1"><Eye className="w-3 h-3" /> View</Button>
                <Button size="sm" variant="outline" className="flex-1 text-xs gap-1"><Download className="w-3 h-3" /> Save</Button>
              </div>
            </SitaCard>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default MediaWorkspace;
