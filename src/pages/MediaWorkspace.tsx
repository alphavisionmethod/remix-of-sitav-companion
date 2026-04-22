// ═══════════════════════════════════════════════════════════════
// SITA OS — Media & Images Workspace
// Visual intake, upload, gallery, tagging, OCR placeholder,
// entity linking, and Supabase storage integration.
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo, useCallback } from "react";
import { SitaPageHeader } from "@/components/sita/SitaPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Image as ImageIcon, Upload, Camera, ScanLine, Search, Grid3X3, List,
  Eye, Download, Tag, Link, Trash2, MoreHorizontal, Filter, FolderOpen,
  Plus, FileText, X, ZoomIn, ChevronLeft, ChevronRight, Edit3,
} from "lucide-react";
import { DEMO_MEDIA, type DemoMediaItem as MediaItem } from "@/data/seed/media";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { useDataMode } from "@/contexts/DataModeContext";

const MediaWorkspace = () => {
  const { user, isDemo } = useAuth();
  const isDemoMode = isDemo;
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [editingTags, setEditingTags] = useState(false);
  const [newTag, setNewTag] = useState("");

  // Supabase storage query for live mode
  const { data: liveMedia, refetch: refetchMedia } = useQuery({
    queryKey: ["media-files", user?.id],
    enabled: !!user && !isDemoMode,
    queryFn: async () => {
      const { data, error } = await supabase.storage.from("documents").list(user!.id + "/media", { limit: 100, sortBy: { column: "created_at", order: "desc" } });
      if (error || !data) return [];
      return data.map((f, i) => ({
        id: f.id || `live-${i}`,
        name: f.name,
        type: f.metadata?.mimetype?.startsWith("image/") ? "image" as const : "scan" as const,
        size: `${Math.round((f.metadata?.size || 0) / 1024)}KB`,
        date: f.created_at || new Date().toISOString(),
        tags: [] as string[],
        preview: "from-primary/30 to-primary/10",
        linkedTo: undefined,
      }));
    },
  });

  const media = isDemoMode ? DEMO_MEDIA : (liveMedia?.length ? liveMedia : DEMO_MEDIA);

  const filtered = useMemo(() => {
    let result: MediaItem[] = media;
    if (typeFilter !== "all") result = result.filter(m => m.type === typeFilter);
    if (search) result = result.filter(m => m.name.toLowerCase().includes(search.toLowerCase()) || m.tags.some(t => t.includes(search.toLowerCase())));
    return result;
  }, [media, search, typeFilter]);

  const handleUpload = useCallback(async (files: FileList | null) => {
    if (!files || !user) return;
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/") && !file.type.startsWith("application/pdf")) {
        toast.error(`Unsupported file type: ${file.name}`);
        continue;
      }
      if (isDemoMode) {
        toast.success(`Uploaded: ${file.name} (demo mode — not stored)`);
        continue;
      }
      const path = `${user.id}/media/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from("documents").upload(path, file);
      if (error) { toast.error(`Upload failed: ${file.name}`); }
      else { toast.success(`Uploaded: ${file.name}`); refetchMedia(); }
    }
  }, [user, isDemoMode, refetchMedia]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleUpload(e.dataTransfer.files);
  }, [handleUpload]);

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto"
      onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
    >
<SitaPageHeader
        icon={<ImageIcon className="h-6 w-6" />}
        title="Media & Images"
        subtitle="Screenshots, photos, scans, and visual assets"
      >
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="gap-1.5 text-xs"><Camera className="w-3.5 h-3.5" /> Capture</Button>
          <Button size="sm" variant="outline" className="gap-1.5 text-xs"><ScanLine className="w-3.5 h-3.5" /> Scan</Button>
          <label className="cursor-pointer">
            <Button size="sm" className="gap-1.5 text-xs pointer-events-none"><Upload className="w-3.5 h-3.5" /> Upload</Button>
            <input type="file" className="hidden" multiple accept="image/*,application/pdf" onChange={e => handleUpload(e.target.files)} />
          </label>
        </div>
      </SitaPageHeader>

      {/* Drop zone overlay */}
      {isDragOver && (
        <div className="fixed inset-0 bg-primary/10 border-2 border-dashed border-primary/40 rounded-2xl z-50 flex items-center justify-center">
          <div className="text-center">
            <Upload className="h-12 w-12 text-primary mx-auto mb-3" />
            <p className="text-lg font-medium text-primary">Drop files to upload</p>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
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
        <Badge variant="outline" className="text-[10px]">{filtered.length} items</Badge>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 min-w-0">
          {viewMode === "grid" ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {filtered.map(item => (
                <motion.button key={item.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} onClick={() => setSelectedMedia(item)}
                  className={cn("text-left rounded-xl overflow-hidden border transition-all hover:shadow-lg", selectedMedia?.id === item.id ? "border-primary/50 ring-1 ring-primary/30" : "border-border/20 hover:border-border/40")}>
                  <div className={cn("aspect-square bg-gradient-to-br flex items-center justify-center relative group", item.preview)}>
                    <ImageIcon className="w-8 h-8 text-white/30" />
                    <button onClick={e => { e.stopPropagation(); setSelectedMedia(item); setLightboxOpen(true); }} className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <ZoomIn className="w-6 h-6 text-white" />
                    </button>
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
                    <ImageIcon className="w-4 h-4 text-white/40" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate">{item.name}</div>
                    <div className="text-[10px] text-muted-foreground">{item.type} · {item.size} · {format(new Date(item.date), "MMM d, yyyy")}</div>
                  </div>
                  {item.tags.length > 0 && <div className="flex gap-1">{item.tags.slice(0, 2).map(t => <Badge key={t} variant="outline" className="text-[8px]">{t}</Badge>)}</div>}
                  {item.linkedTo && <Badge variant="outline" className="text-[9px] px-1.5 border-primary/20 text-primary"><Link className="w-2 h-2 mr-0.5" />{item.linkedTo}</Badge>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Detail panel */}
        <AnimatePresence>
          {selectedMedia && (
            <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="w-72 shrink-0 hidden lg:block">
              <Card className="border-border/40">
                <CardContent className="p-4 space-y-4">
                  <div className={cn("aspect-video rounded-lg bg-gradient-to-br flex items-center justify-center cursor-pointer", selectedMedia.preview)} onClick={() => setLightboxOpen(true)}>
                    <ImageIcon className="w-10 h-10 text-white/30" />
                  </div>
                  <h3 className="text-sm font-semibold">{selectedMedia.name}</h3>
                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    <div>Type: <span className="text-foreground capitalize">{selectedMedia.type}</span></div>
                    <div>Size: <span className="text-foreground">{selectedMedia.size}</span></div>
                    <div>Date: <span className="text-foreground">{format(new Date(selectedMedia.date), "MMM d, yyyy 'at' h:mm a")}</span></div>
                  </div>

                  {/* Tags with editing */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium text-muted-foreground">Tags</span>
                      <button onClick={() => setEditingTags(!editingTags)} className="text-[10px] text-primary hover:underline">{editingTags ? "Done" : "Edit"}</button>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {selectedMedia.tags.map(t => <Badge key={t} variant="outline" className="text-[9px] border-border/20"><Tag className="w-2 h-2 mr-0.5" />{t}</Badge>)}
                    </div>
                    {editingTags && (
                      <div className="flex gap-1 mt-2">
                        <Input value={newTag} onChange={e => setNewTag(e.target.value)} placeholder="Add tag..." className="h-6 text-[10px] bg-card/30" />
                        <Button size="sm" className="h-6 text-[10px] px-2" onClick={() => { if (newTag) { toast.success(`Tag "${newTag}" added`); setNewTag(""); } }}>Add</Button>
                      </div>
                    )}
                  </div>

                  {/* Entity linking */}
                  {selectedMedia.linkedTo ? (
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/5 border border-primary/10 text-xs">
                      <Link className="w-3 h-3 text-primary" />
                      <span className="text-muted-foreground">Linked to</span>
                      <span className="text-primary font-medium">{selectedMedia.linkedTo}</span>
                    </div>
                  ) : (
                    <Button variant="outline" size="sm" className="w-full text-xs gap-1"><Link className="w-3 h-3" /> Link to entity</Button>
                  )}

                  {/* OCR placeholder */}
                  <Button variant="outline" size="sm" className="w-full text-xs gap-1"><FileText className="w-3 h-3" /> Extract Text (OCR)</Button>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1 text-xs gap-1"><Eye className="w-3 h-3" /> View</Button>
                    <Button size="sm" variant="outline" className="flex-1 text-xs gap-1"><Download className="w-3 h-3" /> Save</Button>
                  </div>
                  <Button size="sm" variant="outline" className="w-full text-xs gap-1 text-destructive hover:text-destructive"><Trash2 className="w-3 h-3" /> Delete</Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Lightbox */}
      {lightboxOpen && selectedMedia && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center" onClick={() => setLightboxOpen(false)}>
          <button className="absolute top-4 right-4 text-white/60 hover:text-white"><X className="h-6 w-6" /></button>
          <div className={cn("w-[80vw] max-w-3xl aspect-video rounded-xl bg-gradient-to-br flex items-center justify-center", selectedMedia.preview)} onClick={e => e.stopPropagation()}>
            <ImageIcon className="w-20 h-20 text-white/30" />
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaWorkspace;
