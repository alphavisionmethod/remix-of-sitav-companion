import React, { useState, useMemo } from "react";
import { useBusinessProfile } from "@/modules/business/hooks/useBusinessProfile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useCRMNotes, useCRMContacts, useCRMCompanies, useCreateNote, useUpdateNote, useDeleteNote } from "@/modules/business/hooks/use-crm-data";
import {
  StickyNote, Plus, Pin, PinOff, Trash2, Search, User, Building2,
  MessageSquare, Phone, Briefcase, FileText, Edit2, CheckSquare,
  ChevronDown, ChevronRight, MoreHorizontal, Calendar
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useDraftAutosave } from "@/hooks/useDraftAutosave";

const NOTE_TYPE_META: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  general: { icon: StickyNote, color: "text-yellow-400", label: "General" },
  meeting: { icon: Briefcase, color: "text-purple-400", label: "Meeting" },
  call: { icon: Phone, color: "text-green-400", label: "Call" },
  internal: { icon: FileText, color: "text-blue-400", label: "Internal" },
  strategy: { icon: CheckSquare, color: "text-indigo-400", label: "Strategy" },
  followup: { icon: MessageSquare, color: "text-orange-400", label: "Follow-Up" },
};

type ViewMode = "grid" | "list";

const CRMNotes = () => {
  const { primaryMode } = useBusinessProfile();
  const { data: notes = [] } = useCRMNotes();
  const { data: contacts = [] } = useCRMContacts();
  const { data: companies = [] } = useCRMCompanies();
  const createNote = useCreateNote();
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();
  const [showAdd, setShowAdd] = useState(false);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  type NoteForm = { title: string; content: string; note_type: string; contact_id: string; company_id: string; is_pinned: boolean };
  const EMPTY_FORM: NoteForm = { title: "", content: "", note_type: "general", contact_id: "", company_id: "", is_pinned: false };
  const { draft, updateDraft, clearDraft } = useDraftAutosave<NoteForm>("business:crm:note:new", "business");
  const [form, setForm] = useState<NoteForm>(() => ({ ...EMPTY_FORM, ...draft }));
  const [editForm, setEditForm] = useState({ title: "", content: "" });

  // Mirror form changes into the autosaved draft
  React.useEffect(() => { updateDraft(form); }, [form, updateDraft]);

  const contactMap = useMemo(() => {
    const m: Record<string, string> = {};
    contacts.forEach(c => { m[c.id] = `${c.first_name} ${c.last_name}`; });
    return m;
  }, [contacts]);

  const companyMap = useMemo(() => {
    const m: Record<string, string> = {};
    companies.forEach(c => { m[c.id] = c.name; });
    return m;
  }, [companies]);

  const filtered = useMemo(() => {
    let result = notes;
    if (typeFilter) result = result.filter(n => n.note_type === typeFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(n =>
        (n.title?.toLowerCase().includes(q)) ||
        (n.content?.toLowerCase().includes(q))
      );
    }
    return result;
  }, [notes, typeFilter, searchQuery]);

  const pinned = filtered.filter(n => n.is_pinned);
  const rest = filtered.filter(n => !n.is_pinned);

  // Stats
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    notes.forEach(n => { counts[n.note_type] = (counts[n.note_type] || 0) + 1; });
    return counts;
  }, [notes]);

  const handleAdd = async () => {
    if (!form.content.trim()) { toast.error("Content is required"); return; }
    try {
      await createNote.mutateAsync({
        title: form.title || null,
        content: form.content,
        note_type: form.note_type,
        contact_id: form.contact_id || null,
        company_id: form.company_id || null,
        is_pinned: form.is_pinned,
      });
      toast.success("Note created");
      setShowAdd(false);
      setForm(EMPTY_FORM);
      clearDraft();
    } catch { toast.error("Failed to create note"); }
  };

  const togglePin = async (n: typeof notes[0]) => {
    try {
      await updateNote.mutateAsync({ id: n.id, updates: { is_pinned: !n.is_pinned } });
      toast.success(n.is_pinned ? "Unpinned" : "Pinned");
    } catch { toast.error("Failed to update"); }
  };

  const startEdit = (n: typeof notes[0]) => {
    setEditingNote(n.id);
    setEditForm({ title: n.title || "", content: n.content });
  };

  const saveEdit = async () => {
    if (!editingNote) return;
    try {
      await updateNote.mutateAsync({ id: editingNote, updates: { title: editForm.title || null, content: editForm.content } });
      toast.success("Note updated");
      setEditingNote(null);
    } catch { toast.error("Failed to update"); }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNote.mutateAsync(id);
      toast.success("Note deleted");
    } catch { toast.error("Failed to delete"); }
  };

  const NoteCard = ({ n }: { n: typeof notes[0] }) => {
    const meta = NOTE_TYPE_META[n.note_type] || NOTE_TYPE_META.general;
    const Icon = meta.icon;
    const isEditing = editingNote === n.id;

    return (
      <Card className={`border-border/40 bg-card/50 hover:bg-card/80 transition-all group ${n.is_pinned ? "border-primary/20" : ""}`}>
        <CardContent className="p-4">
          {isEditing ? (
            <div className="space-y-2">
              <Input
                placeholder="Title (optional)"
                value={editForm.title}
                onChange={e => setEditForm(p => ({ ...p, title: e.target.value }))}
                className="h-8 text-sm"
              />
              <textarea
                className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={editForm.content}
                onChange={e => setEditForm(p => ({ ...p, content: e.target.value }))}
              />
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setEditingNote(null)}>Cancel</Button>
                <Button size="sm" className="h-7 text-xs" onClick={saveEdit}>Save</Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Icon className={`h-3.5 w-3.5 shrink-0 ${meta.color}`} />
                  {n.title && <p className="text-sm font-semibold text-foreground truncate">{n.title}</p>}
                  {!n.title && <p className="text-sm font-semibold text-muted-foreground truncate">{meta.label} Note</p>}
                </div>
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => togglePin(n)} title={n.is_pinned ? "Unpin" : "Pin"}>
                    {n.is_pinned ? <PinOff className="h-3 w-3 text-primary" /> : <Pin className="h-3 w-3 text-muted-foreground" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => startEdit(n)}>
                    <Edit2 className="h-3 w-3 text-muted-foreground" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleDelete(n.id)}>
                    <Trash2 className="h-3 w-3 text-muted-foreground hover:text-red-400" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-1.5 whitespace-pre-wrap line-clamp-4">{n.content}</p>
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <Badge variant="outline" className={`text-[10px] ${meta.color} border-current/20`}>{meta.label}</Badge>
                {n.contact_id && contactMap[n.contact_id] && (
                  <span className="text-[10px] text-primary flex items-center gap-0.5"><User className="h-2.5 w-2.5" />{contactMap[n.contact_id]}</span>
                )}
                {n.company_id && companyMap[n.company_id] && (
                  <span className="text-[10px] text-muted-foreground flex items-center gap-0.5"><Building2 className="h-2.5 w-2.5" />{companyMap[n.company_id]}</span>
                )}
                <span className="text-[10px] text-muted-foreground/60 ml-auto flex items-center gap-0.5">
                  <Calendar className="h-2.5 w-2.5" />
                  {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                </span>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      <PageTruthBanner truthState="demo" />

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Notes & Memory</h2>
          <p className="text-xs text-muted-foreground">
            {notes.length} note{notes.length !== 1 ? "s" : ""}
            {pinned.length > 0 && ` · ${pinned.length} pinned`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex border border-border rounded-md">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon" className="h-8 w-8 rounded-r-none"
              onClick={() => setViewMode("grid")}
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon" className="h-8 w-8 rounded-l-none"
              onClick={() => setViewMode("list")}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
          <Dialog open={showAdd} onOpenChange={setShowAdd}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5"><Plus className="h-3.5 w-3.5" /> New Note</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>New Note</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Input placeholder="Title (optional)" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
                <div className="grid grid-cols-2 gap-2">
                  <select className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={form.note_type} onChange={e => setForm(p => ({ ...p, note_type: e.target.value }))}>
                    {Object.entries(NOTE_TYPE_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                  <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                    <input type="checkbox" checked={form.is_pinned} onChange={e => setForm(p => ({ ...p, is_pinned: e.target.checked }))} className="rounded" />
                    <Pin className="h-3 w-3" /> Pin this note
                  </label>
                </div>
                {(contacts.length > 0 || companies.length > 0) && (
                  <div className="grid grid-cols-2 gap-2">
                    {contacts.length > 0 && (
                      <select className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={form.contact_id} onChange={e => setForm(p => ({ ...p, contact_id: e.target.value }))}>
                        <option value="">Link contact...</option>
                        {contacts.map(c => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}
                      </select>
                    )}
                    {companies.length > 0 && (
                      <select className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={form.company_id} onChange={e => setForm(p => ({ ...p, company_id: e.target.value }))}>
                        <option value="">Link company...</option>
                        {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    )}
                  </div>
                )}
                <textarea
                  className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Write your note..."
                  value={form.content}
                  onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
                />
                <Button className="w-full" onClick={handleAdd} disabled={createNote.isPending}>
                  {createNote.isPending ? "Saving..." : "Save Note"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
            className="pl-8 h-8 text-xs"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-1 flex-wrap">
          <Button variant={!typeFilter ? "secondary" : "ghost"} size="sm" className="h-7 text-xs" onClick={() => setTypeFilter(null)}>
            All ({notes.length})
          </Button>
          {Object.entries(NOTE_TYPE_META).map(([k, v]) => {
            const count = typeCounts[k] || 0;
            if (count === 0) return null;
            return (
              <Button key={k} variant={typeFilter === k ? "secondary" : "ghost"} size="sm" className="h-7 text-xs gap-1" onClick={() => setTypeFilter(typeFilter === k ? null : k)}>
                <v.icon className="h-3 w-3" /> {v.label} ({count})
              </Button>
            );
          })}
        </div>
      </div>

      {/* Pinned Notes */}
      {pinned.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Pin className="h-3 w-3 text-primary" /> Pinned ({pinned.length})
          </h3>
          <div className={viewMode === "grid" ? "grid sm:grid-cols-2 lg:grid-cols-3 gap-2" : "space-y-2"}>
            {pinned.map(n => <NoteCard key={n.id} n={n} />)}
          </div>
        </div>
      )}

      {/* Regular Notes */}
      {rest.length > 0 && (
        <div>
          {pinned.length > 0 && (
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              All Notes ({rest.length})
            </h3>
          )}
          <div className={viewMode === "grid" ? "grid sm:grid-cols-2 lg:grid-cols-3 gap-2" : "space-y-2"}>
            {rest.map(n => <NoteCard key={n.id} n={n} />)}
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="py-16 text-center">
          <StickyNote className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-1">No Notes Yet</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            {notes.length === 0 ? "Capture meeting notes, call summaries, and relationship context" : "No notes match your current filters"}
          </p>
          <Button variant="outline" size="sm" className="mt-4 gap-1.5" onClick={() => setShowAdd(true)}>
            <Plus className="h-3.5 w-3.5" /> Create Your First Note
          </Button>
        </div>
      )}
    </div>
  );
};

export default CRMNotes;
