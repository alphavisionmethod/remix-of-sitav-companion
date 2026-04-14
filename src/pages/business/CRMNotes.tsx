import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCRMNotes, useCreateNote, useDeleteNote } from "@/hooks/use-crm-data";
import { StickyNote, Plus, Pin, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

const CRMNotes = () => {
  const { data: notes = [] } = useCRMNotes();
  const createNote = useCreateNote();
  const deleteNote = useDeleteNote();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", note_type: "general" });

  const pinned = notes.filter(n => n.is_pinned);
  const rest = notes.filter(n => !n.is_pinned);

  const handleAdd = async () => {
    if (!form.content.trim()) { toast.error("Content is required"); return; }
    try {
      await createNote.mutateAsync(form as any);
      toast.success("Note created");
      setShowAdd(false);
      setForm({ title: "", content: "", note_type: "general" });
    } catch { toast.error("Failed to create note"); }
  };

  const NoteCard = ({ n }: { n: typeof notes[0] }) => (
    <Card className="border-border/40 bg-card/50 hover:bg-card/80 transition-colors group">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            {n.title && <p className="text-sm font-semibold text-foreground mb-1">{n.title}</p>}
            <p className="text-sm text-muted-foreground line-clamp-3 whitespace-pre-wrap">{n.content}</p>
            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
              <span className="px-1.5 py-0.5 rounded bg-muted/50 capitalize">{n.note_type}</span>
              <span>{formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {n.is_pinned && <Pin className="h-3.5 w-3.5 text-primary" />}
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => deleteNote.mutate(n.id)}>
              <Trash2 className="h-3 w-3 text-muted-foreground hover:text-red-400" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      <PageTruthBanner domain="business" subLabel="CRM Notes" />

      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Notes & Memory</h2>
          <p className="text-xs text-muted-foreground">{notes.length} note{notes.length !== 1 ? "s" : ""}</p>
        </div>
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5"><Plus className="h-3.5 w-3.5" /> New Note</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>New Note</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Title (optional)" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
              <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" value={form.note_type} onChange={e => setForm(p => ({ ...p, note_type: e.target.value }))}>
                <option value="general">General</option>
                <option value="meeting">Meeting</option>
                <option value="call">Call</option>
                <option value="internal">Internal</option>
              </select>
              <textarea className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="Write your note..." value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} />
              <Button className="w-full" onClick={handleAdd} disabled={createNote.isPending}>
                {createNote.isPending ? "Saving..." : "Save Note"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {pinned.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Pin className="h-3 w-3" /> Pinned
          </h3>
          <div className="grid sm:grid-cols-2 gap-2">
            {pinned.map(n => <NoteCard key={n.id} n={n} />)}
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-2">
        {rest.map(n => <NoteCard key={n.id} n={n} />)}
      </div>

      {notes.length === 0 && (
        <div className="py-12 text-center">
          <StickyNote className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No notes yet</p>
          <Button variant="outline" size="sm" className="mt-3 gap-1.5" onClick={() => setShowAdd(true)}>
            <Plus className="h-3.5 w-3.5" /> Create your first note
          </Button>
        </div>
      )}
    </div>
  );
};

export default CRMNotes;
