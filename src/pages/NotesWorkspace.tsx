import { useState, useMemo } from "react";
import { SitaPageHeader, SitaCard, SitaCardTitle } from "@/components/sita/SitaCard";
import { KPITile, EmptyState, SitaTabs } from "@/components/sita/SitaComponents";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { FileText, Search, Plus, Tag, Star, Folder, Link, Clock, Edit3, CheckSquare, Mic, Brain, ChevronRight, Hash, Bookmark, Archive } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { DEMO_NOTES, type DemoNote as Note } from "@/lib/demo-data/notes";
import { useDataMode } from "@/contexts/DataModeContext";
import { useNotes } from "@/hooks/use-live-data";


interface NotesWorkspaceRow {
  content?: unknown;
  created_at?: string;
  folder?: unknown;
  id?: string;
  pinned?: unknown;
  tags?: string[];
  title?: string;
  updated_at?: string;
}

const TYPE_ICONS: Record<string, React.ElementType> = { note: FileText, meeting: Brain, checklist: CheckSquare, voice: Mic, knowledge: Bookmark };
const fadeUp = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.25 } } };

// Map Supabase note row to DemoNote shape for UI compatibility
function mapDbNote(row: NotesWorkspaceRow): Note {
  return {
    id: row.id,
    title: row.title || "Untitled",
    preview: (row.content || "").slice(0, 200),
    content: row.content || "",
    type: "note",
    folder: row.folder || "General",
    tags: row.tags || [],
    pinned: row.pinned || false,
    updatedAt: row.updated_at,
    createdAt: row.created_at,
    linkedEntity: undefined,
  };
}

const NotesWorkspace = () => {
  const { isDemoMode } = useDataMode();
  const { data: liveNotes } = useNotes();

  const notes: Note[] = useMemo(() => {
    if (isDemoMode) return DEMO_NOTES;
    if (!liveNotes?.length) return [];
    return liveNotes.map(mapDbNote);
  }, [isDemoMode, liveNotes]);

  const [search, setSearch] = useState("");
  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(notes[0] ?? null);
  const [isEditing, setIsEditing] = useState(false);

  const folders = useMemo(() => [...new Set(notes.map(n => n.folder).filter(Boolean))], [notes]);
  const allTags = useMemo(() => [...new Set(notes.flatMap(n => n.tags))], [notes]);

  const filtered = useMemo(() => {
    let result: Note[] = notes;
    if (search) result = result.filter(n => n.title.toLowerCase().includes(search.toLowerCase()) || n.preview.toLowerCase().includes(search.toLowerCase()));
    if (activeFolder) result = result.filter(n => n.folder === activeFolder);
    if (activeTag) result = result.filter(n => n.tags.includes(activeTag));
    return result.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [search, activeFolder, activeTag, notes]);

  return (
    <div className="min-h-screen pb-12">
      <DemoModeBadge />
      <SitaPageHeader title="Notes & Knowledge" subtitle="Capture, organize, and connect your thinking" actions={
        <Button size="sm" variant="outline" className="gap-1.5 border-border/50">
          <Plus className="w-3.5 h-3.5" /> New Note
        </Button>
      } />

      {!isDemoMode && notes.length === 0 ? (
        <EmptyState icon={FileText} title="No notes yet" description="Create your first note to get started. In demo mode, sample notes are shown." />
      ) : (
        <div className="flex gap-4">
          {/* Left sidebar — folders & tags */}
          <div className="w-48 shrink-0 hidden md:block space-y-4">
            <SitaCard className="p-3">
              <SitaCardTitle className="text-xs mb-2 flex items-center gap-1.5"><Folder className="w-3 h-3" /> Folders</SitaCardTitle>
              <div className="space-y-0.5">
                <button onClick={() => setActiveFolder(null)} className={cn("w-full text-left text-xs px-2 py-1.5 rounded-md transition-colors", !activeFolder ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-accent/30")}>All Notes</button>
                {folders.map(f => (
                  <button key={f} onClick={() => setActiveFolder(f!)} className={cn("w-full text-left text-xs px-2 py-1.5 rounded-md transition-colors", activeFolder === f ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-accent/30")}>{f}</button>
                ))}
              </div>
            </SitaCard>
            <SitaCard className="p-3">
              <SitaCardTitle className="text-xs mb-2 flex items-center gap-1.5"><Hash className="w-3 h-3" /> Tags</SitaCardTitle>
              <div className="flex flex-wrap gap-1">
                {allTags.map(t => (
                  <button key={t} onClick={() => setActiveTag(activeTag === t ? null : t)} className={cn("text-[10px] px-1.5 py-0.5 rounded-full border transition-colors", activeTag === t ? "bg-primary/15 text-primary border-primary/30" : "text-muted-foreground border-border/30 hover:bg-accent/30")}>{t}</button>
                ))}
              </div>
            </SitaCard>
          </div>

          {/* Notes list */}
          <div className="w-72 shrink-0 space-y-2">
            <div className="relative mb-3">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input placeholder="Search notes..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-8 text-xs bg-card/30" />
            </div>
            <div className="space-y-1 max-h-[600px] overflow-y-auto pr-1">
              {filtered.map(note => {
                const Icon = TYPE_ICONS[note.type] || FileText;
                return (
                  <motion.button key={note.id} variants={fadeUp} initial="hidden" animate="show" onClick={() => { setSelectedNote(note); setIsEditing(false); }}
                    className={cn("w-full text-left p-3 rounded-xl border transition-all", selectedNote?.id === note.id ? "bg-primary/10 border-primary/30" : "bg-card/20 border-border/20 hover:bg-accent/20")}>
                    <div className="flex items-center gap-1.5 mb-1">
                      {note.pinned && <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />}
                      <Icon className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs font-medium truncate flex-1">{note.title}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground line-clamp-2 mb-1">{note.preview}</p>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] text-muted-foreground/60">{format(new Date(note.updatedAt), "MMM d")}</span>
                      {note.folder && <Badge variant="outline" className="text-[8px] px-1 py-0 border-border/20">{note.folder}</Badge>}
                      {note.linkedEntity && <Badge className="text-[8px] px-1 py-0 bg-primary/10 text-primary border-0"><Link className="w-2 h-2 mr-0.5" />{note.linkedEntity.label}</Badge>}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Note detail / editor */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              {selectedNote ? (
                <motion.div key={selectedNote.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <SitaCard className="p-6 min-h-[500px]">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          {selectedNote.pinned && <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
                          <h2 className="text-lg font-semibold">{selectedNote.title}</h2>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>Updated {format(new Date(selectedNote.updatedAt), "MMM d, yyyy 'at' h:mm a")}</span>
                          {selectedNote.folder && <><span>·</span><Badge variant="outline" className="text-[10px] px-1.5">{selectedNote.folder}</Badge></>}
                        </div>
                      </div>
                      <div className="flex gap-1.5">
                        <Button size="sm" variant={isEditing ? "default" : "outline"} onClick={() => setIsEditing(!isEditing)} className="text-xs gap-1">
                          <Edit3 className="w-3 h-3" /> {isEditing ? "Preview" : "Edit"}
                        </Button>
                        <Button size="sm" variant="outline" className="text-xs"><Archive className="w-3 h-3" /></Button>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {selectedNote.tags.map(t => (
                        <Badge key={t} variant="outline" className="text-[10px] border-border/30"><Tag className="w-2 h-2 mr-0.5" />{t}</Badge>
                      ))}
                    </div>

                    {/* Linked entity */}
                    {selectedNote.linkedEntity && (
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/5 border border-primary/10 mb-4 text-xs">
                        <Link className="w-3 h-3 text-primary" />
                        <span className="text-muted-foreground">Linked to</span>
                        <span className="text-primary font-medium">{selectedNote.linkedEntity.label}</span>
                        <ChevronRight className="w-3 h-3 text-muted-foreground ml-auto" />
                      </div>
                    )}

                    {/* Content area */}
                    {isEditing ? (
                      <Textarea className="min-h-[300px] text-sm bg-transparent border-border/20 resize-none" placeholder="Start writing..." defaultValue={selectedNote.preview + "\n\nContinue your note here..."} />
                    ) : (
                      <div className="prose prose-sm prose-invert max-w-none">
                        <p className="text-sm text-foreground/80 leading-relaxed">{selectedNote.preview}</p>
                        <p className="text-sm text-foreground/60 mt-4">Continue your note here. This area supports rich text editing with headings, lists, links, and embedded files.</p>
                      </div>
                    )}
                  </SitaCard>
                </motion.div>
              ) : (
                <EmptyState icon={FileText} title="Select a note" description="Choose a note from the list or create a new one" />
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesWorkspace;
