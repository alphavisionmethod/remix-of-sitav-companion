// ═══════════════════════════════════════════════════════════════
// Nova SDK Sample App — Notes
// Demonstrates: manifest, lifecycle, AppLayout, NovaFS, NovaNotify
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from "react";
import { AppLayout } from "@/lib/nova-sdk/ui/layout";
import { NovaText, NovaButton, NovaList, NovaSectionLabel, NovaInput } from "@/lib/nova-sdk/ui/components";
import { NovaFS } from "@/lib/nova-sdk/system/filesystem";
import { NovaNotify } from "@/lib/nova-sdk/system/notifications";
import { AppStateWrapper } from "@/components/sita/shell/AppStateWrapper";
import { Plus, Save, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { APP_TYPE } from "@/lib/design-system/app-window-system";

// Manifest for this app
export const NOTES_MANIFEST = {
  id: "com.nova.notes",
  name: "Notes",
  version: "1.0.0",
  publisher: "SITA OS",
  icon: "📝",
  iconBg: "from-yellow-400 to-orange-400",
  permissions: ["files.read" as const, "files.write" as const, "system.notifications" as const],
  windowDefaults: { width: 520, height: 400 },
  category: "productivity",
  description: "A beautiful notes app for SITA OS",
};

interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
}

const FS_PREFIX = "/nova/notes/";
const fs = new NovaFS(["files.read", "files.write"]);
const notify = new NovaNotify(["system.notifications"]);

export function NotesWindow() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);

  // Load notes from NovaFS
  useEffect(() => {
    (async () => {
      try {
        const files = await fs.listDir(FS_PREFIX);
        const loaded: Note[] = [];
        for (const path of files) {
          const data = await fs.readFile(path);
          if (data) {
            try { loaded.push(JSON.parse(data)); } catch {}
          }
        }
        loaded.sort((a, b) => b.updatedAt - a.updatedAt);
        setNotes(loaded);
        if (loaded.length > 0) {
          setActiveId(loaded[0].id);
          setTitle(loaded[0].title);
          setContent(loaded[0].content);
        }
      } catch {
        // First run — no files yet
      }
      setLoading(false);
    })();
  }, []);

  const selectNote = useCallback((id: string) => {
    const note = notes.find(n => n.id === id);
    if (note) {
      setActiveId(id);
      setTitle(note.title);
      setContent(note.content);
    }
  }, [notes]);

  const saveNote = useCallback(async () => {
    if (!activeId) return;
    const note: Note = { id: activeId, title: title || "Untitled", content, updatedAt: Date.now() };
    await fs.writeFile(FS_PREFIX + activeId, JSON.stringify(note));
    setNotes(prev => prev.map(n => n.id === activeId ? note : n));
    notify.send({ title: "Saved", body: `"${note.title}" saved`, icon: "✅", urgency: "low" });
  }, [activeId, title, content]);

  const createNote = useCallback(async () => {
    const id = `note-${Date.now()}`;
    const note: Note = { id, title: "Untitled", content: "", updatedAt: Date.now() };
    await fs.writeFile(FS_PREFIX + id, JSON.stringify(note));
    setNotes(prev => [note, ...prev]);
    setActiveId(id);
    setTitle("Untitled");
    setContent("");
  }, []);

  const deleteNote = useCallback(async () => {
    if (!activeId) return;
    await fs.deleteFile(FS_PREFIX + activeId);
    const remaining = notes.filter(n => n.id !== activeId);
    setNotes(remaining);
    if (remaining.length > 0) {
      selectNote(remaining[0].id);
    } else {
      setActiveId(null);
      setTitle("");
      setContent("");
    }
  }, [activeId, notes, selectNote]);

  const listItems = notes.map(n => ({
    id: n.id,
    label: n.title || "Untitled",
    badge: new Date(n.updatedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
  }));

  const sidebar = (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-2 px-1">
        <NovaSectionLabel>Notes</NovaSectionLabel>
        <NovaButton variant="ghost" onClick={createNote} className="!p-1">
          <Plus className="h-3.5 w-3.5" />
        </NovaButton>
      </div>
      <NovaList items={listItems} activeId={activeId ?? undefined} onSelect={selectNote} />
    </div>
  );

  return (
    <AppStateWrapper
      state={loading ? "loading" : notes.length === 0 && !activeId ? "empty" : "ready"}
      accentGradient="from-[hsl(45_85%_55%)] to-[hsl(25_80%_50%)]"
      emptyTitle="No Notes Yet"
      emptyMessage="Create your first note"
    >
      <AppLayout sidebar={sidebar} sidebarWidth={160} minHeight={300}>
        {activeId ? (
          <div className="flex flex-col gap-3 h-full">
            <div className="flex items-center gap-2">
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Note title..."
                className={cn(
                  APP_TYPE.title,
                  "bg-transparent border-none outline-none flex-1 text-[hsl(0_0%_15%)] dark:text-[hsl(0_0%_85%)] placeholder:text-[hsl(0_0%_50%)]"
                )}
              />
              <NovaButton variant="secondary" onClick={saveNote} icon={<Save className="h-3 w-3" />}>
                Save
              </NovaButton>
              <NovaButton variant="ghost" onClick={deleteNote} className="!text-[hsl(0_65%_50%)]">
                <Trash2 className="h-3 w-3" />
              </NovaButton>
            </div>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Start writing..."
              className={cn(
                APP_TYPE.body,
                "flex-1 bg-transparent border-none outline-none resize-none",
                "text-[hsl(0_0%_20%)] dark:text-[hsl(0_0%_80%)] placeholder:text-[hsl(0_0%_50%)]",
                "min-h-[200px]"
              )}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <NovaText variant="body" muted>Select or create a note</NovaText>
          </div>
        )}
      </AppLayout>
    </AppStateWrapper>
  );
}
