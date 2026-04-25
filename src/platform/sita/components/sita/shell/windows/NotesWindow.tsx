// ═══════════════════════════════════════════════════════════════
// SITA OS — Notes App (God Tier)
// Rich markdown editor with live preview, folders, search,
// word count, character count, autosave indicator, and tags
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { AppLayout } from "@/platform/nova-sdk/ui/layout";
import { NovaText, NovaButton, NovaSectionLabel, NovaInput } from "@/platform/nova-sdk/ui/components";
import { NovaFS } from "@/platform/nova-sdk/system/filesystem";
import { NovaNotify } from "@/platform/nova-sdk/system/notifications";
import { AppStateWrapper } from "@/components/sita/shell/AppStateWrapper";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Save, Trash2, Search, FolderOpen, FileText, Hash,
  Eye, Edit3, Clock, Star, StarOff, ChevronDown, ChevronRight,
  Bold, Italic, List, ListOrdered, Code, Link2, Heading1,
  Heading2, Quote, CheckSquare, Minus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { APP_TYPE, APP_COMPONENTS } from "@/platform/design-system/app-window-system";
import { SoundEngine } from "@/platform/runtime/sound-engine";
import ReactMarkdown from "react-markdown";

export const NOTES_MANIFEST = {
  id: "com.nova.notes",
  name: "Notes",
  version: "2.0.0",
  publisher: "SITA OS",
  icon: "📝",
  iconBg: "from-yellow-400 to-orange-400",
  permissions: ["files.read" as const, "files.write" as const, "system.notifications" as const],
  windowDefaults: { width: 640, height: 480 },
  category: "productivity",
  description: "Premium note-taking with markdown and live preview",
  designVersion: "nova-1.0",
};

// ── Types ──────────────────────────────────────────────────

interface Note {
  id: string;
  title: string;
  content: string;
  folder: string;
  tags: string[];
  starred: boolean;
  updatedAt: number;
  createdAt: number;
  wordCount: number;
  charCount: number;
}

const DEFAULT_FOLDERS = ["All Notes", "Personal", "Work", "Ideas", "Archive"];
const FS_PREFIX = "/nova/notes/";
const fs = new NovaFS(["files.read", "files.write"]);
const notify = new NovaNotify(["system.notifications"]);

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

// ── Formatting toolbar ─────────────────────────────────────

interface FormatAction {
  icon: React.ReactNode;
  label: string;
  prefix: string;
  suffix?: string;
  block?: boolean;
}

const FORMAT_ACTIONS: FormatAction[] = [
  { icon: <Bold className="w-3 h-3" />, label: "Bold", prefix: "**", suffix: "**" },
  { icon: <Italic className="w-3 h-3" />, label: "Italic", prefix: "_", suffix: "_" },
  { icon: <Code className="w-3 h-3" />, label: "Code", prefix: "`", suffix: "`" },
  { icon: <Heading1 className="w-3 h-3" />, label: "H1", prefix: "# ", block: true },
  { icon: <Heading2 className="w-3 h-3" />, label: "H2", prefix: "## ", block: true },
  { icon: <Quote className="w-3 h-3" />, label: "Quote", prefix: "> ", block: true },
  { icon: <List className="w-3 h-3" />, label: "List", prefix: "- ", block: true },
  { icon: <ListOrdered className="w-3 h-3" />, label: "Ordered", prefix: "1. ", block: true },
  { icon: <CheckSquare className="w-3 h-3" />, label: "Todo", prefix: "- [ ] ", block: true },
  { icon: <Minus className="w-3 h-3" />, label: "Divider", prefix: "\n---\n", block: true },
  { icon: <Link2 className="w-3 h-3" />, label: "Link", prefix: "[", suffix: "](url)" },
];

export function NotesWindow() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFolder, setActiveFolder] = useState("All Notes");
  const [showPreview, setShowPreview] = useState(false);
  const [autosaveStatus, setAutosaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(["All Notes"]));
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const autosaveTimer = useRef<ReturnType<typeof setTimeout>>();

  const activeNote = useMemo(() => notes.find(n => n.id === activeId), [notes, activeId]);

  // Load notes
  useEffect(() => {
    (async () => {
      try {
        const files = await fs.listDir(FS_PREFIX);
        const loaded: Note[] = [];
        for (const path of files) {
          const data = await fs.readFile(path);
          if (data) {
            try {
              const note = JSON.parse(data);
              if (!note.folder) note.folder = "Personal";
              if (!note.tags) note.tags = [];
              if (!note.starred) note.starred = false;
              if (!note.createdAt) note.createdAt = note.updatedAt;
              if (!note.wordCount) note.wordCount = countWords(note.content);
              if (!note.charCount) note.charCount = note.content.length;
              loaded.push(note);
            } catch {}
          }
        }
        loaded.sort((a, b) => b.updatedAt - a.updatedAt);
        setNotes(loaded);
        if (loaded.length > 0) {
          setActiveId(loaded[0].id);
          setTitle(loaded[0].title);
          setContent(loaded[0].content);
        }
      } catch {}
      setLoading(false);
    })();
  }, []);

  // Autosave
  useEffect(() => {
    if (!activeId || autosaveStatus !== "unsaved") return;
    autosaveTimer.current = setTimeout(() => {
      saveNote();
    }, 2000);
    return () => { if (autosaveTimer.current) clearTimeout(autosaveTimer.current); };
  }, [content, title, activeId, autosaveStatus]);

  const selectNote = useCallback((id: string) => {
    const note = notes.find(n => n.id === id);
    if (note) {
      setActiveId(id);
      setTitle(note.title);
      setContent(note.content);
      setAutosaveStatus("saved");
    }
  }, [notes]);

  const saveNote = useCallback(async () => {
    if (!activeId) return;
    setAutosaveStatus("saving");
    const wc = countWords(content);
    const cc = content.length;
    const note: Note = {
      ...(notes.find(n => n.id === activeId) || {} as Note),
      id: activeId,
      title: title || "Untitled",
      content,
      updatedAt: Date.now(),
      wordCount: wc,
      charCount: cc,
    };
    await fs.writeFile(FS_PREFIX + activeId, JSON.stringify(note));
    setNotes(prev => prev.map(n => n.id === activeId ? note : n));
    setAutosaveStatus("saved");
  }, [activeId, title, content, notes]);

  const createNote = useCallback(async (folder?: string) => {
    const id = `note-${Date.now()}`;
    const note: Note = {
      id,
      title: "Untitled",
      content: "",
      folder: folder || activeFolder === "All Notes" ? "Personal" : activeFolder,
      tags: [],
      starred: false,
      updatedAt: Date.now(),
      createdAt: Date.now(),
      wordCount: 0,
      charCount: 0,
    };
    await fs.writeFile(FS_PREFIX + id, JSON.stringify(note));
    setNotes(prev => [note, ...prev]);
    setActiveId(id);
    setTitle("Untitled");
    setContent("");
    setAutosaveStatus("saved");
    SoundEngine.click();
  }, [activeFolder]);

  const deleteNote = useCallback(async () => {
    if (!activeId) return;
    await fs.deleteFile(FS_PREFIX + activeId);
    const remaining = notes.filter(n => n.id !== activeId);
    setNotes(remaining);
    if (remaining.length > 0) selectNote(remaining[0].id);
    else { setActiveId(null); setTitle(""); setContent(""); }
    SoundEngine.error();
  }, [activeId, notes, selectNote]);

  const toggleStar = useCallback(async () => {
    if (!activeId) return;
    const note = notes.find(n => n.id === activeId);
    if (!note) return;
    const updated = { ...note, starred: !note.starred };
    setNotes(prev => prev.map(n => n.id === activeId ? updated : n));
    await fs.writeFile(FS_PREFIX + activeId, JSON.stringify(updated));
    SoundEngine.click();
  }, [activeId, notes]);

  const handleContentChange = useCallback((val: string) => {
    setContent(val);
    setAutosaveStatus("unsaved");
  }, []);

  const handleTitleChange = useCallback((val: string) => {
    setTitle(val);
    setAutosaveStatus("unsaved");
  }, []);

  const applyFormat = useCallback((action: FormatAction) => {
    const el = editorRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = content.slice(start, end) || "text";

    let newContent: string;
    let newCursorPos: number;

    if (action.block) {
      const lineStart = content.lastIndexOf("\n", start - 1) + 1;
      newContent = content.slice(0, lineStart) + action.prefix + content.slice(lineStart);
      newCursorPos = lineStart + action.prefix.length;
    } else {
      newContent = content.slice(0, start) + action.prefix + selected + (action.suffix || "") + content.slice(end);
      newCursorPos = start + action.prefix.length + selected.length;
    }

    setContent(newContent);
    setAutosaveStatus("unsaved");
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(newCursorPos, newCursorPos);
    });
  }, [content]);

  // Filtered notes
  const filteredNotes = useMemo(() => {
    let result = notes;
    if (activeFolder !== "All Notes") {
      result = result.filter(n => n.folder === activeFolder);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(n =>
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        n.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    return result.sort((a, b) => {
      if (a.starred !== b.starred) return a.starred ? -1 : 1;
      return b.updatedAt - a.updatedAt;
    });
  }, [notes, activeFolder, searchQuery]);

  // Folder counts
  const folderCounts = useMemo(() => {
    const counts: Record<string, number> = { "All Notes": notes.length };
    for (const n of notes) {
      counts[n.folder] = (counts[n.folder] || 0) + 1;
    }
    return counts;
  }, [notes]);

  const wordCount = useMemo(() => countWords(content), [content]);
  const charCount = content.length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  const sidebar = (
    <div className="flex flex-col h-full gap-1">
      {/* Search */}
      <div className="mb-2">
        <NovaInput
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search notes..."
          icon={<Search className="w-3 h-3" />}
          className="!text-[11px] !py-1"
        />
      </div>

      {/* Folders */}
      <div className="space-y-0.5 mb-2">
        {DEFAULT_FOLDERS.map(folder => {
          const count = folderCounts[folder] || 0;
          const isActive = activeFolder === folder;
          const isExpanded = expandedFolders.has(folder);
          return (
            <button
              key={folder}
              onClick={() => {
                setActiveFolder(folder);
                setExpandedFolders(prev => {
                  const next = new Set(prev);
                  if (next.has(folder)) next.delete(folder);
                  else next.add(folder);
                  return next;
                });
              }}
              className={cn(
                "flex items-center gap-1.5 w-full px-2 py-1 rounded-md text-[11px] transition-all duration-100",
                isActive
                  ? "bg-[hsl(var(--primary)/0.12)] text-[hsl(var(--primary))] font-medium"
                  : "text-[hsl(0_0%_45%)] dark:text-[hsl(0_0%_55%)] hover:bg-[hsl(0_0%_0%/0.04)] dark:hover:bg-[hsl(0_0%_100%/0.05)]"
              )}
            >
              {folder === "All Notes" ? (
                <FileText className="w-3 h-3 flex-shrink-0" />
              ) : (
                <FolderOpen className="w-3 h-3 flex-shrink-0" />
              )}
              <span className="truncate flex-1 text-left">{folder}</span>
              <span className="text-[9px] opacity-50">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Divider */}
      <div className="h-px bg-[hsl(0_0%_0%/0.06)] dark:bg-[hsl(0_0%_100%/0.06)] my-1" />

      {/* Notes list */}
      <div className="flex items-center justify-between mb-1 px-1">
        <NovaSectionLabel className="!mb-0 !text-[9px]">Notes</NovaSectionLabel>
        <NovaButton variant="ghost" onClick={() => createNote()} className="!p-0.5">
          <Plus className="h-3 w-3" />
        </NovaButton>
      </div>

      <div className="flex-1 overflow-y-auto space-y-0.5 scrollbar-thin">
        {filteredNotes.map(note => (
          <button
            key={note.id}
            onClick={() => selectNote(note.id)}
            className={cn(
              "w-full text-left px-2 py-1.5 rounded-lg transition-all duration-100 group",
              note.id === activeId
                ? "bg-[hsl(var(--primary)/0.1)] ring-1 ring-[hsl(var(--primary)/0.15)]"
                : "hover:bg-[hsl(0_0%_0%/0.03)] dark:hover:bg-[hsl(0_0%_100%/0.04)]"
            )}
          >
            <div className="flex items-center gap-1">
              {note.starred && <Star className="w-2.5 h-2.5 text-[hsl(38_85%_55%)] fill-[hsl(38_85%_55%)]" />}
              <span className={cn(
                "text-[11px] font-medium truncate flex-1",
                note.id === activeId ? "text-[hsl(var(--primary))]" : "text-[hsl(0_0%_25%)] dark:text-[hsl(0_0%_75%)]"
              )}>
                {note.title || "Untitled"}
              </span>
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-[9px] text-[hsl(0_0%_50%)] truncate flex-1">
                {note.content.slice(0, 40) || "Empty note"}
              </span>
              <span className="text-[9px] text-[hsl(0_0%_50%)] flex-shrink-0">
                {new Date(note.updatedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
              </span>
            </div>
            {note.tags.length > 0 && (
              <div className="flex gap-1 mt-0.5 flex-wrap">
                {note.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="text-[8px] px-1 py-0 rounded bg-[hsl(var(--primary)/0.08)] text-[hsl(var(--primary))]">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </button>
        ))}
        {filteredNotes.length === 0 && (
          <div className="text-center py-4">
            <NovaText variant="label" muted>No notes found</NovaText>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <AppStateWrapper
      state={loading ? "loading" : notes.length === 0 && !activeId ? "empty" : "ready"}
      accentGradient="from-[hsl(45_85%_55%)] to-[hsl(25_80%_50%)]"
      emptyTitle="No Notes Yet"
      emptyMessage="Create your first note to get started"
      emptyAction={
        <NovaButton variant="primary" onClick={() => createNote()} icon={<Plus className="h-3 w-3" />}>
          New Note
        </NovaButton>
      }
    >
      <AppLayout sidebar={sidebar} sidebarWidth={190} minHeight={380}>
        {activeId ? (
          <div className="flex flex-col h-full">
            {/* Title + Actions bar */}
            <div className="flex items-center gap-2 mb-2">
              <input
                value={title}
                onChange={e => handleTitleChange(e.target.value)}
                placeholder="Note title..."
                className={cn(
                  APP_TYPE.title,
                  "flex-1 bg-transparent border-none outline-none text-[hsl(0_0%_15%)] dark:text-[hsl(0_0%_85%)] placeholder:text-[hsl(0_0%_50%)]"
                )}
              />
              <button
                onClick={toggleStar}
                className="p-1 rounded-md hover:bg-[hsl(0_0%_0%/0.04)] dark:hover:bg-[hsl(0_0%_100%/0.06)] transition-colors"
                title={activeNote?.starred ? "Unstar" : "Star"}
              >
                {activeNote?.starred ? (
                  <Star className="w-3.5 h-3.5 text-[hsl(38_85%_55%)] fill-[hsl(38_85%_55%)]" />
                ) : (
                  <StarOff className="w-3.5 h-3.5 text-[hsl(0_0%_45%)]" />
                )}
              </button>
              <button
                onClick={() => setShowPreview(!showPreview)}
                className={cn(
                  "p-1 rounded-md transition-colors",
                  showPreview
                    ? "bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]"
                    : "hover:bg-[hsl(0_0%_0%/0.04)] dark:hover:bg-[hsl(0_0%_100%/0.06)] text-[hsl(0_0%_45%)]"
                )}
                title="Toggle preview"
              >
                {showPreview ? <Edit3 className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
              <NovaButton variant="secondary" onClick={saveNote} icon={<Save className="h-3 w-3" />} className="!text-[11px]">
                Save
              </NovaButton>
              <button
                onClick={deleteNote}
                className="p-1 rounded-md hover:bg-[hsl(0_70%_55%/0.08)] text-[hsl(0_65%_55%)] transition-colors"
                title="Delete"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Formatting toolbar */}
            {!showPreview && (
              <div className="flex items-center gap-0.5 mb-2 pb-2 border-b border-[hsl(0_0%_0%/0.06)] dark:border-[hsl(0_0%_100%/0.06)] flex-wrap">
                {FORMAT_ACTIONS.map(action => (
                  <button
                    key={action.label}
                    onClick={() => applyFormat(action)}
                    className="p-1.5 rounded-md text-[hsl(0_0%_45%)] dark:text-[hsl(0_0%_55%)] hover:bg-[hsl(0_0%_0%/0.05)] dark:hover:bg-[hsl(0_0%_100%/0.06)] hover:text-[hsl(0_0%_25%)] dark:hover:text-[hsl(0_0%_80%)] transition-colors"
                    title={action.label}
                  >
                    {action.icon}
                  </button>
                ))}
              </div>
            )}

            {/* Editor / Preview */}
            <div className="flex-1 overflow-hidden relative">
              <AnimatePresence mode="wait">
                {showPreview ? (
                  <motion.div
                    key="preview"
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.15 }}
                    className="overflow-y-auto h-full scrollbar-thin prose prose-sm dark:prose-invert prose-headings:text-[hsl(0_0%_15%)] dark:prose-headings:text-[hsl(0_0%_85%)] prose-p:text-[hsl(0_0%_30%)] dark:prose-p:text-[hsl(0_0%_70%)] max-w-none"
                  >
                    <ReactMarkdown>{content || "*No content yet*"}</ReactMarkdown>
                  </motion.div>
                ) : (
                  <motion.div
                    key="editor"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 8 }}
                    transition={{ duration: 0.15 }}
                    className="h-full"
                  >
                    <textarea
                      ref={editorRef}
                      value={content}
                      onChange={e => handleContentChange(e.target.value)}
                      placeholder="Start writing... (supports Markdown)"
                      className={cn(
                        "w-full h-full bg-transparent border-none outline-none resize-none font-mono text-[13px] leading-[1.7]",
                        "text-[hsl(0_0%_20%)] dark:text-[hsl(0_0%_80%)] placeholder:text-[hsl(0_0%_50%)]",
                        "scrollbar-thin"
                      )}
                      spellCheck={true}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Status bar */}
            <div className="flex items-center justify-between pt-2 mt-2 border-t border-[hsl(0_0%_0%/0.06)] dark:border-[hsl(0_0%_100%/0.06)]">
              <div className="flex items-center gap-3 text-[10px] text-[hsl(0_0%_50%)]">
                <span>{wordCount} words</span>
                <span>{charCount} chars</span>
                <span>{readTime} min read</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn(
                  "text-[10px] flex items-center gap-1",
                  autosaveStatus === "saved" ? "text-[hsl(120_50%_50%)]" : autosaveStatus === "saving" ? "text-[hsl(38_85%_55%)]" : "text-[hsl(0_0%_50%)]"
                )}>
                  <span className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    autosaveStatus === "saved" ? "bg-[hsl(120_50%_50%)]" : autosaveStatus === "saving" ? "bg-[hsl(38_85%_55%)] animate-pulse" : "bg-[hsl(0_0%_40%)]"
                  )} />
                  {autosaveStatus === "saved" ? "Saved" : autosaveStatus === "saving" ? "Saving..." : "Unsaved"}
                </span>
              </div>
            </div>
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
