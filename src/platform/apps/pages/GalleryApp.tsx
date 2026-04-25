import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Image, Upload, Search, Grid3X3, LayoutList, Calendar, Tag, FolderOpen, X, Heart, Share2, Download, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
interface Photo {
  id: string;
  url: string;
  title: string;
  date: string;
  album: string;
  tags: string[];
  favorite: boolean;
}

const placeholderColors = ["from-blue-500/20 to-purple-500/20", "from-green-500/20 to-teal-500/20", "from-amber-500/20 to-orange-500/20", "from-pink-500/20 to-rose-500/20"];
const albums = ["All", "Favorites", "Recent", "Screenshots"];

export default function GalleryApp() {
  const [search, setSearch] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [album, setAlbum] = useState("All");

  const filtered = ([] as any[]).filter(p => {
    if (album !== "All" && p.album !== album) return false;
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto space-y-4">
<div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold text-foreground">Gallery</h1>
          <Badge variant="secondary" className="text-xs">{([] as any[]).length} items</Badge>
        </div>
        <Button size="sm"><Upload className="h-3.5 w-3.5 mr-1.5" /> Upload</Button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search photos..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {albums.map(a => (
          <Button key={a} variant={album === a ? "default" : "outline"} size="sm" className="text-xs" onClick={() => setAlbum(a)}>
            <FolderOpen className="h-3 w-3 mr-1" /> {a}
          </Button>
        ))}
      </div>

      <Tabs defaultValue="grid">
        <TabsList>
          <TabsTrigger value="grid"><Grid3X3 className="h-3.5 w-3.5 mr-1" /> Grid</TabsTrigger>
          <TabsTrigger value="timeline"><Calendar className="h-3.5 w-3.5 mr-1" /> Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="mt-3">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {filtered.map((photo, i) => (
              <div key={photo.id} className="relative group cursor-pointer rounded-lg overflow-hidden aspect-square" onClick={() => setSelectedPhoto(photo)}>
                <div className={`w-full h-full bg-gradient-to-br ${placeholderColors[i % ([] as typeof placeholderColors).length]} flex items-center justify-center`}>
                  <Image className="h-8 w-8 text-foreground/20" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                  <p className="text-xs font-medium text-foreground">{photo.title}</p>
                  <p className="text-[10px] text-muted-foreground">{photo.date}</p>
                </div>
                {photo.favorite && (
                  <div className="absolute top-1.5 right-1.5">
                    <Heart className="h-4 w-4 text-red-500" fill="currentColor" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="timeline" className="mt-3 space-y-4">
          {["Today", "Yesterday", "Last week"].map(period => {
            const photos = filtered.filter(p => p.date === period || p.date.includes(period.toLowerCase().replace("last ", "")));
            if (photos.length === 0) return null;
            return (
              <div key={period}>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{period}</h3>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-1.5">
                  {photos.map((photo, i) => (
                    <div key={photo.id} className={`rounded-lg overflow-hidden aspect-square bg-gradient-to-br ${placeholderColors[parseInt(photo.id) % ([] as typeof placeholderColors).length]} flex items-center justify-center cursor-pointer hover:ring-2 ring-primary transition-all`} onClick={() => setSelectedPhoto(photo)}>
                      <Image className="h-6 w-6 text-foreground/20" />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </TabsContent>
      </Tabs>

      {/* Lightbox */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 bg-background/95 flex flex-col" onClick={() => setSelectedPhoto(null)}>
          <div className="flex items-center justify-between p-4" onClick={e => e.stopPropagation()}>
            <div>
              <h2 className="text-sm font-medium text-foreground">{selectedPhoto.title}</h2>
              <p className="text-[10px] text-muted-foreground">{selectedPhoto.date} · {selectedPhoto.album}</p>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8"><Heart className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" className="h-8 w-8"><Share2 className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" className="h-8 w-8"><Download className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedPhoto(null)}><X className="h-4 w-4" /></Button>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center p-8">
            <div className={`w-full max-w-lg aspect-video rounded-xl bg-gradient-to-br ${placeholderColors[parseInt(selectedPhoto.id) % ([] as typeof placeholderColors).length]} flex items-center justify-center`}>
              <Image className="h-16 w-16 text-foreground/20" />
            </div>
          </div>
          <div className="p-4 flex gap-1.5 flex-wrap justify-center" onClick={e => e.stopPropagation()}>
            {selectedPhoto.tags.map(tag => (
              <Badge key={tag} variant="secondary" className="text-[10px]"><Tag className="h-2.5 w-2.5 mr-1" />{tag}</Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
