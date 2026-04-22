// ═══════════════════════════════════════════════════════════════
// SITA OS — Unified File Picker Service
// OS-level file picker usable by all windowed apps
// ═══════════════════════════════════════════════════════════════

import React, { useState, useCallback, useEffect, createContext, useContext } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  File, FileText, Image, Music, Video, Archive, Code, FolderOpen,
  Upload, Search, Grid3X3, List, ChevronRight, Check, X, HardDrive,
  Cloud, Clock, Star
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────

export interface PickedFile {
  id: string;
  name: string;
  path: string;
  size: number;
  type: string;
  source: "local" | "cloud" | "recent";
  url?: string;
  file?: File;
}

interface FilePickerOptions {
  accept?: string[];         // e.g. ["image/*", ".pdf", ".docx"]
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number;          // bytes
  title?: string;
  sources?: ("local" | "cloud" | "recent")[];
}

interface FilePickerRequest extends FilePickerOptions {
  resolve: (files: PickedFile[]) => void;
  reject: (reason: string) => void;
}

// ── Context ──────────────────────────────────────────────────

interface FilePickerContextValue {
  pickFiles: (options?: FilePickerOptions) => Promise<PickedFile[]>;
}

const FilePickerContext = createContext<FilePickerContextValue>({
  pickFiles: () => Promise.reject("FilePickerProvider not mounted"),
});

export const useFilePicker = () => useContext(FilePickerContext);

// ── Icons by type ────────────────────────────────────────────

function getFileIcon(type: string) {
  if (type.startsWith("image/")) return <Image className="h-5 w-5 text-pink-400" />;
  if (type.startsWith("video/")) return <Video className="h-5 w-5 text-purple-400" />;
  if (type.startsWith("audio/")) return <Music className="h-5 w-5 text-amber-400" />;
  if (type.includes("pdf")) return <FileText className="h-5 w-5 text-red-400" />;
  if (type.includes("zip") || type.includes("archive")) return <Archive className="h-5 w-5 text-yellow-400" />;
  if (type.includes("javascript") || type.includes("typescript") || type.includes("json")) return <Code className="h-5 w-5 text-emerald-400" />;
  return <File className="h-5 w-5 text-muted-foreground" />;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

// ── Provider ─────────────────────────────────────────────────

export function FilePickerProvider({ children }: { children: React.ReactNode }) {
  const [request, setRequest] = useState<FilePickerRequest | null>(null);

  const pickFiles = useCallback((options?: FilePickerOptions): Promise<PickedFile[]> => {
    return new Promise((resolve, reject) => {
      setRequest({ ...options, resolve, reject });
    });
  }, []);

  // Listen for global file picker events
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      pickFiles(detail).then(files => {
        window.dispatchEvent(new CustomEvent("sita-file-picker-result", { detail: { files } }));
      }).catch(() => {});
    };
    window.addEventListener("sita-open-file-picker", handler);
    return () => window.removeEventListener("sita-open-file-picker", handler);
  }, [pickFiles]);

  return (
    <FilePickerContext.Provider value={{ pickFiles }}>
      {children}
      {request && (
        <FilePickerDialog
          request={request}
          onClose={() => {
            request.reject("cancelled");
            setRequest(null);
          }}
          onSelect={(files) => {
            request.resolve(files);
            setRequest(null);
          }}
        />
      )}
    </FilePickerContext.Provider>
  );
}

// ── Dialog ───────────────────────────────────────────────────

function FilePickerDialog({
  request,
  onClose,
  onSelect,
}: {
  request: FilePickerRequest;
  onClose: () => void;
  onSelect: (files: PickedFile[]) => void;
}) {
  const [activeSource, setActiveSource] = useState<"local" | "cloud" | "recent">("local");
  const [selected, setSelected] = useState<PickedFile[]>([]);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [dragOver, setDragOver] = useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const sources = request.sources ?? ["local", "cloud", "recent"];
  const maxFiles = request.maxFiles ?? (request.multiple ? 20 : 1);

  // Handle native file input
  const handleNativeSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const picked: PickedFile[] = files.slice(0, maxFiles).map(f => ({
      id: `local-${f.name}-${f.size}`,
      name: f.name,
      path: f.name,
      size: f.size,
      type: f.type || "application/octet-stream",
      source: "local" as const,
      file: f,
      url: URL.createObjectURL(f),
    }));
    if (request.multiple) {
      setSelected(prev => [...prev, ...picked].slice(0, maxFiles));
    } else {
      onSelect(picked);
    }
  }, [maxFiles, request.multiple, onSelect]);

  // Drop handler
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    const picked: PickedFile[] = files.slice(0, maxFiles).map(f => ({
      id: `drop-${f.name}-${f.size}`,
      name: f.name,
      path: f.name,
      size: f.size,
      type: f.type || "application/octet-stream",
      source: "local" as const,
      file: f,
      url: URL.createObjectURL(f),
    }));
    if (request.multiple) {
      setSelected(prev => [...prev, ...picked].slice(0, maxFiles));
    } else {
      onSelect(picked);
    }
  }, [maxFiles, request.multiple, onSelect]);

  const toggleSelect = useCallback((file: PickedFile) => {
    if (!request.multiple) {
      onSelect([file]);
      return;
    }
    setSelected(prev => {
      const exists = prev.find(f => f.id === file.id);
      if (exists) return prev.filter(f => f.id !== file.id);
      if (prev.length >= maxFiles) return prev;
      return [...prev, file];
    });
  }, [request.multiple, maxFiles, onSelect]);

  // Accept string for native input
  const acceptStr = request.accept?.join(",") ?? "";

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl p-0 gap-0 bg-[hsl(var(--background))] border-border/40 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border/30">
          <h2 className="text-sm font-semibold text-foreground">
            {request.title ?? "Choose Files"}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
              className="p-1.5 rounded-md hover:bg-muted/50 text-muted-foreground"
            >
              {viewMode === "grid" ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="flex h-[420px]">
          {/* Sidebar */}
          <div className="w-44 border-r border-border/20 p-2 space-y-1 flex-shrink-0">
            {sources.includes("local") && (
              <SidebarItem
                icon={<HardDrive className="h-4 w-4" />}
                label="This Device"
                active={activeSource === "local"}
                onClick={() => setActiveSource("local")}
              />
            )}
            {sources.includes("cloud") && (
              <SidebarItem
                icon={<Cloud className="h-4 w-4" />}
                label="Cloud Storage"
                active={activeSource === "cloud"}
                onClick={() => setActiveSource("cloud")}
              />
            )}
            {sources.includes("recent") && (
              <SidebarItem
                icon={<Clock className="h-4 w-4" />}
                label="Recent"
                active={activeSource === "recent"}
                onClick={() => setActiveSource("recent")}
              />
            )}
            <SidebarItem
              icon={<Star className="h-4 w-4" />}
              label="Favorites"
              active={false}
              onClick={() => console.log("[FilePicker] Favorites selected")}
            />
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col">
            {/* Search bar */}
            <div className="px-3 py-2 border-b border-border/20">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search files…"
                  className="h-8 pl-8 text-xs bg-muted/30 border-border/30"
                />
              </div>
            </div>

            {/* Drop zone / file browser */}
            <div
              className={cn(
                "flex-1 overflow-y-auto p-3",
                dragOver && "bg-primary/5 ring-2 ring-inset ring-primary/30"
              )}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              {activeSource === "local" ? (
                <div className="flex flex-col items-center justify-center h-full gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Upload className="h-7 w-7 text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground">
                      Drop files here or click to browse
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {request.maxSize ? `Max ${formatSize(request.maxSize)} per file · ` : ""}
                      {request.accept?.length ? request.accept.join(", ") : "All file types"}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => inputRef.current?.click()}
                    className="gap-1.5"
                  >
                    <FolderOpen className="h-3.5 w-3.5" />
                    Browse Files
                  </Button>
                  <input
                    ref={inputRef}
                    type="file"
                    className="hidden"
                    accept={acceptStr}
                    multiple={request.multiple}
                    onChange={handleNativeSelect}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <Cloud className="h-10 w-10 mb-3 opacity-40" />
                  <p className="text-sm">
                    {activeSource === "cloud" ? "Cloud Storage" : "Recent Files"}
                  </p>
                  <p className="text-xs mt-1 opacity-60">Connect your storage to browse files</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Selected files strip */}
        {selected.length > 0 && (
          <div className="border-t border-border/20 px-4 py-2">
            <div className="flex flex-wrap gap-1.5">
              {selected.map(f => (
                <span
                  key={f.id}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary/10 text-xs text-foreground"
                >
                  {getFileIcon(f.type)}
                  <span className="max-w-[120px] truncate">{f.name}</span>
                  <button
                    onClick={() => setSelected(prev => prev.filter(p => p.id !== f.id))}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border/20">
          <span className="text-xs text-muted-foreground">
            {selected.length > 0
              ? `${selected.length} file${selected.length > 1 ? "s" : ""} selected`
              : "No files selected"}
          </span>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            {request.multiple && (
              <Button
                size="sm"
                disabled={selected.length === 0}
                onClick={() => onSelect(selected)}
                className="gap-1.5"
              >
                <Check className="h-3.5 w-3.5" />
                Select ({selected.length})
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SidebarItem({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors",
        active
          ? "bg-primary/15 text-primary"
          : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
      )}
    >
      {icon}
      {label}
    </button>
  );
}
