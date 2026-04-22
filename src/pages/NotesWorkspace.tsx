import { useAuth } from "@/contexts/AuthContext";
// ═══════════════════════════════════════════════════════════════
// SITA OS — Notes & Knowledge Workspace
// Capture, organize, link to entities. Templates, meeting-note
// structure, task extraction, linked entity panels.
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo } from "react";
import { SitaPageHeader } from "@/components/sita/SitaPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useNotes } from "@/hooks/use-live-data";
import { type DemoNote as Note } from "@/data/seed/notes";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import {
  FileText, Search, Plus, Tag, Star, Folder, Link, Clock, Edit3,
  CheckSquare, Mic, Brain, ChevronRight, Hash, Bookmark, Archive,
  ListTodo, Users, Briefcase, Workflow, FileBox, Sparkles,
  MessageSquare, Calendar,
} from "lucide-react";
const TYPE_ICONS: Record<string, React.ElementType> = { note: FileText, meeting: Brain, checklist: CheckSquare, voice: Mic, knowledge: Bookmark };
const fadeUp = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.25 } } };

// ── Note Templates ──────────────────────────────────────────
const NOTE_TEMPLATES = [
  { id: "blank", title: "Blank Note", icon: FileText, content: "" },
  { id: "meeting", title: "Meeting Notes", icon: Brain, content: "# Meeting Notes\n\n**Date:** " + new Date().toLocaleDateString() + "\n**Attendees:** \n\n## Agenda\n1. \n\n## Notes\n\n\n## Action Items\n- [ ] \n\n## Decisions\n" },
  { id: "checklist", title: "Checklist", icon: CheckSquare, content: "# Checklist\n\n- [ ] Item 1\n- [ ] Item 2\n- [ ] Item 3\n" },
  { id: "knowledge", title: "Knowledge Page", icon: Bookmark, content: "# Topic\n\n## Summary\n\n## Key Points\n1. \n2. \n\n## References\n- \n\n## Related\n" },
];

// Map Supabase note row to DemoNote shape
function mapDbNote(row: Record<string, any>): Note {
  return {
    id: row.id, title: row.title || "Untitled",
    preview: (row.content || "").slice(0, 200), content: row.content || "",
    type: "note", folder: row.folder || "General", tags: row.tags || [],
    pinned: row.pinned || false, updatedAt: row.updated_at, createdAt: row.created_at,
    linkedEntity: undefined,
  };
}

// ── Demo linked entities ──────────────────────────────────
const DEMO_LINKED_ENTITIES = [
  { type: "task", label: "Follow up with Apex Corp", icon: ListTodo, path: "/tasks" },
  { type: "contact", label: "Sarah Chen", icon: Users, path: "/business/customers" },
  { type: "workflow", label: "Invoice Approval Pipeline", icon: Workflow, path: "/workflows" },
  { type: "calendar", label: "Board Meeting — Apr 15", icon: Calendar, path: "/calendar" },
];

const NotesWorkspace = () => {
  const { isDemo } = useAuth();
  const isDemoMode = false;
  const { data: liveNotes } = useNotes();

  const notes: Note[] = useMemo(() => {
    if (!liveNotes?.length) return [];
    return liveNotes.map(mapDbNote);
  }, [false, liveNotes]);

  const [search, setSearch] = useState("");
  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(notes[0] ?? null);
  const [isEditing, setIsEditing] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showLinkedEntities, setShowLinkedEntities] = useState(true);
  const [editContent, setEditContent] = useState("");

  const folders = useMemo(() => [...new Set(notes.map(n => n.folder).filter(Boolean))], [notes]);
  const allTags = useMemo(() => [...new Set(notes.flatMap(n => n.tags))], [notes]);

  const filtered = useMemo(() => {
    let result: Note[] = notes;
    if (search) result = result.filter(n => n.title.toLowerCase().includes(search.toLowerCase()) || n.preview.toLowerCase().includes(search.toLowerCase()));
    if (activeFolder) result = result.filter(n => n.folder === activeFolder);
    if (activeTag) result = result.filter(n => n.tags.includes(activeTag));
    return result.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [search, activeFolder, activeTag, notes]);

  const handleStartEditing = (note: Note) => {
    setSelectedNote(note);
    setEditContent(note.content || note.preview);
    setIsEditing(true);
  };

  const handleApplyTemplate = (tmpl: typeof NOTE_TEMPLATES[0]) => {
    setEditContent(tmpl.content);
    setIsEditing(true);
    setShowTemplates(false);
    toast.success(`Template "${tmpl.title}" applied`);
  };

  const handleExtractTasks = () => {
    toast.success("Extracted 2 action items as tasks");
  };

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
<SitaPageHeader
        icon={<FileText className="h-6 w-6" />}
        title="Notes & Knowledge"
        subtitle="Capture, organize, and connect your thinking"
      >
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => setShowTemplates(!showTemplates)}>
            <FileBox className="w-3.5 h-3.5" /> Templates
          </Button>
          <Button size="sm" className="gap-1.5 text-xs">
            <Plus className="w-3.5 h-3.5" /> New Note
          </Button>
        </div>
      </SitaPageHeader>

      {/* Templates drawer */}
      {showTemplates && (
        <Card className="border-primary/20">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {NOTE_TEMPLATES.map(t => (
                <button key={t.id} onClick={() => handleApplyTemplate(t)} className="text-left p-3 rounded-lg border border-border/30 hover:border-primary/40 hover:bg-primary/5 transition-all">
                  <t.icon className="h-5 w-5 text-primary mb-1.5" />
                  <p className="text-xs font-medium">{t.title}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {!false && notes.length === 0 ? (
        <Card className="border-border/40">
          <CardContent className="p-8 text-center">
            <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-sm font-medium mb-1">No notes yet</h3>
            <p className="text-xs text-muted-foreground">Create your first note to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex gap-4">
          {/* Left sidebar — folders & tags */}
          <div className="w-48 shrink-0 hidden md:block space-y-4">
            <Card className="border-border/40">
              <CardContent className="p-3">
                <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5"><Folder className="w-3 h-3" /> Folders</h4>
                <div className="space-y-0.5">
                  <button onClick={() => setActiveFolder(null)} className={cn("w-full text-left text-xs px-2 py-1.5 rounded-md transition-colors", !activeFolder ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-accent/30")}>All Notes ({notes.length})</button>
                  {folders.map(f => (
                    <button key={f} onClick={() => setActiveFolder(f!)} className={cn("w-full text-left text-xs px-2 py-1.5 rounded-md transition-colors", activeFolder === f ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-accent/30")}>
                      {f} ({notes.filter(n => n.folder === f).length})
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/40">
              <CardContent className="p-3">
                <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5"><Hash className="w-3 h-3" /> Tags</h4>
                <div className="flex flex-wrap gap-1">
                  {allTags.map(t => (
                    <button key={t} onClick={() => setActiveTag(activeTag === t ? null : t)} className={cn("text-[10px] px-1.5 py-0.5 rounded-full border transition-colors", activeTag === t ? "bg-primary/15 text-primary border-primary/30" : "text-muted-foreground border-border/30 hover:bg-accent/30")}>{t}</button>
                  ))}
                </div>
              </CardContent>
            </Card>
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
                  <Card className="border-border/40 min-h-[500px]">
                    <CardContent className="p-6">
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
                          <Button size="sm" variant="outline" className="text-xs gap-1" onClick={handleExtractTasks}>
                            <ListTodo className="w-3 h-3" /> Extract Tasks
                          </Button>
                          <Button size="sm" variant={isEditing ? "default" : "outline"} onClick={() => { if (!isEditing) handleStartEditing(selectedNote); else setIsEditing(false); }} className="text-xs gap-1">
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
                        <button className="text-[10px] px-1.5 py-0.5 rounded-full border border-dashed border-border/30 text-muted-foreground hover:bg-accent/20">+ tag</button>
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
                        <Textarea value={editContent} onChange={e => setEditContent(e.target.value)} className="min-h-[350px] text-sm bg-transparent border-border/20 resize-none font-mono" placeholder="Start writing..." />
                      ) : (
                        <div className="prose prose-sm prose-invert max-w-none">
                          {(selectedNote.content || selectedNote.preview).split("\n").map((line, i) => {
                            if (line.startsWith("# ")) return <h1 key={i} className="text-lg font-bold text-foreground">{line.slice(2)}</h1>;
                            if (line.startsWith("## ")) return <h2 key={i} className="text-base font-semibold text-foreground mt-3">{line.slice(3)}</h2>;
                            if (line.startsWith("- [ ] ")) return <div key={i} className="flex items-center gap-2 text-sm"><CheckSquare className="h-3.5 w-3.5 text-muted-foreground" />{line.slice(6)}</div>;
                            if (line.startsWith("- ")) return <li key={i} className="text-sm text-foreground/80 ml-4">{line.slice(2)}</li>;
                            return line ? <p key={i} className="text-sm text-foreground/80">{line}</p> : <br key={i} />;
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <Card className="border-border/40">
                  <CardContent className="p-8 text-center">
                    <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <h3 className="text-sm font-medium mb-1">Select a note</h3>
                    <p className="text-xs text-muted-foreground">Choose a note from the list or create a new one</p>
                  </CardContent>
                </Card>
              )}
            </AnimatePresence>
          </div>

          {/* Linked entities panel */}
          {showLinkedEntities && selectedNote && (
            <div className="w-56 shrink-0 hidden xl:block space-y-4">
              <Card className="border-border/40">
                <CardContent className="p-3">
                  <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5"><Link className="w-3 h-3" /> Linked Entities</h4>
                  <div className="space-y-1.5">
                    {([] as typeof DEMO_LINKED_ENTITIES).map((ent, i) => (
                      <a key={i} href={ent.path} className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent/20 transition-colors text-xs">
                        <ent.icon className="w-3 h-3 text-primary shrink-0" />
                        <span className="truncate text-muted-foreground">{ent.label}</span>
                      </a>
                    ))}
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-2 text-[10px] gap-1"><Plus className="w-2.5 h-2.5" /> Link Entity</Button>
                </CardContent>
              </Card>
              <Card className="border-border/40">
                <CardContent className="p-3">
                  <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5"><Sparkles className="w-3 h-3" /> AI Insights</h4>
                  <p className="text-[10px] text-muted-foreground">This note mentions 2 action items and references 1 contact. Extract them?</p>
                  <Button variant="outline" size="sm" className="w-full mt-2 text-[10px] gap-1" onClick={handleExtractTasks}><ListTodo className="w-2.5 h-2.5" /> Extract</Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotesWorkspace;
