import React, { useState } from "react";
import {
  ContextMenu, ContextMenuContent, ContextMenuItem,
  ContextMenuTrigger, ContextMenuSeparator,
} from "@/components/ui/context-menu";
import {
  Folder, FileText, Image, FileSpreadsheet, FileCode, Film, Music, File,
  Pencil, Trash2, FolderInput, Download, Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ExplorerFolder, ExplorerFile } from "@/data/repositories/file-explorer-service";
import type { ViewMode } from "./FileExplorerToolbar";
import { Input } from "@/components/ui/input";

interface Props {
  folders: ExplorerFolder[];
  files: ExplorerFile[];
  viewMode: ViewMode;
  onOpenFolder: (id: string) => void;
  onRenameFolder: (id: string, name: string) => void;
  onDeleteFolder: (id: string) => void;
  onRenameFile: (id: string, name: string) => void;
  onDeleteFile: (id: string) => void;
  onMoveFile: (id: string) => void;
  onDownloadFile: (file: ExplorerFile) => void;
  onSelectFile: (file: ExplorerFile) => void;
}

function fileIcon(mime: string | null) {
  if (!mime) return File;
  if (mime.startsWith("image/")) return Image;
  if (mime.includes("spreadsheet") || mime.includes("csv") || mime.includes("excel")) return FileSpreadsheet;
  if (mime.includes("video")) return Film;
  if (mime.includes("audio")) return Music;
  if (mime.includes("json") || mime.includes("javascript") || mime.includes("html") || mime.includes("css") || mime.includes("xml")) return FileCode;
  if (mime.includes("pdf") || mime.includes("text") || mime.includes("document") || mime.includes("word")) return FileText;
  return File;
}

function formatSize(bytes: number) {
  if (bytes === 0) return "—";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function FileExplorerGrid({
  folders, files, viewMode, onOpenFolder, onRenameFolder, onDeleteFolder,
  onRenameFile, onDeleteFile, onMoveFile, onDownloadFile, onSelectFile,
}: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const startRename = (id: string, name: string) => {
    setEditingId(id);
    setEditName(name);
  };

  const commitRename = (id: string, isFolder: boolean) => {
    if (editName.trim()) {
      if (isFolder) onRenameFolder(id, editName.trim());
      else onRenameFile(id, editName.trim());
    }
    setEditingId(null);
  };

  const isEmpty = folders.length === 0 && files.length === 0;

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <Folder className="h-12 w-12 mb-3 opacity-30" />
        <p className="text-sm">This folder is empty</p>
        <p className="text-xs mt-1">Upload files or create a new folder</p>
      </div>
    );
  }

  if (viewMode === "list") {
    return (
      <div className="space-y-0.5">
        <div className="grid grid-cols-[1fr_100px_120px] gap-2 px-3 py-1 text-[10px] font-semibold uppercase text-muted-foreground tracking-wider border-b border-border">
          <span>Name</span>
          <span>Size</span>
          <span>Modified</span>
        </div>
        {folders.map((f) => (
          <ContextMenu key={f.id}>
            <ContextMenuTrigger>
              <div
                onDoubleClick={() => onOpenFolder(f.id)}
                className="grid grid-cols-[1fr_100px_120px] gap-2 px-3 py-2 rounded-md hover:bg-accent/50 cursor-pointer group"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Folder className="h-4 w-4 shrink-0 text-amber-500" />
                  {editingId === f.id ? (
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onBlur={() => commitRename(f.id, true)}
                      onKeyDown={(e) => e.key === "Enter" && commitRename(f.id, true)}
                      className="h-6 text-sm"
                      autoFocus
                    />
                  ) : (
                    <span className="text-sm truncate">{f.name}</span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">—</span>
                <span className="text-xs text-muted-foreground">{formatDate(f.updated_at)}</span>
              </div>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem onClick={() => onOpenFolder(f.id)}>Open</ContextMenuItem>
              <ContextMenuItem onClick={() => startRename(f.id, f.name)}>
                <Pencil className="h-3.5 w-3.5 mr-2" /> Rename
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem className="text-destructive" onClick={() => onDeleteFolder(f.id)}>
                <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        ))}
        {files.map((f) => {
          const Icon = fileIcon(f.mime_type);
          return (
            <ContextMenu key={f.id}>
              <ContextMenuTrigger>
                <div
                  onClick={() => onSelectFile(f)}
                  className="grid grid-cols-[1fr_100px_120px] gap-2 px-3 py-2 rounded-md hover:bg-accent/50 cursor-pointer"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Icon className="h-4 w-4 shrink-0 text-primary/60" />
                    {editingId === f.id ? (
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onBlur={() => commitRename(f.id, false)}
                        onKeyDown={(e) => e.key === "Enter" && commitRename(f.id, false)}
                        className="h-6 text-sm"
                        autoFocus
                      />
                    ) : (
                      <span className="text-sm truncate">{f.name}</span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">{formatSize(f.size)}</span>
                  <span className="text-xs text-muted-foreground">{formatDate(f.updated_at)}</span>
                </div>
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem onClick={() => startRename(f.id, f.name)}>
                  <Pencil className="h-3.5 w-3.5 mr-2" /> Rename
                </ContextMenuItem>
                <ContextMenuItem onClick={() => onMoveFile(f.id)}>
                  <FolderInput className="h-3.5 w-3.5 mr-2" /> Move to…
                </ContextMenuItem>
                <ContextMenuItem onClick={() => onDownloadFile(f)}>
                  <Download className="h-3.5 w-3.5 mr-2" /> Download
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem className="text-destructive" onClick={() => onDeleteFile(f.id)}>
                  <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          );
        })}
      </div>
    );
  }

  // Grid view
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
      {folders.map((f) => (
        <ContextMenu key={f.id}>
          <ContextMenuTrigger>
            <div
              onDoubleClick={() => onOpenFolder(f.id)}
              className="flex flex-col items-center gap-2 rounded-xl border border-border/60 bg-card p-4 hover:bg-accent/40 cursor-pointer transition-colors"
            >
              <Folder className="h-10 w-10 text-amber-500" />
              {editingId === f.id ? (
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onBlur={() => commitRename(f.id, true)}
                  onKeyDown={(e) => e.key === "Enter" && commitRename(f.id, true)}
                  className="h-6 text-xs text-center"
                  autoFocus
                />
              ) : (
                <span className="text-xs font-medium text-center truncate w-full">{f.name}</span>
              )}
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem onClick={() => onOpenFolder(f.id)}>Open</ContextMenuItem>
            <ContextMenuItem onClick={() => startRename(f.id, f.name)}>
              <Pencil className="h-3.5 w-3.5 mr-2" /> Rename
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem className="text-destructive" onClick={() => onDeleteFolder(f.id)}>
              <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      ))}
      {files.map((f) => {
        const Icon = fileIcon(f.mime_type);
        return (
          <ContextMenu key={f.id}>
            <ContextMenuTrigger>
              <div
                onClick={() => onSelectFile(f)}
                className="flex flex-col items-center gap-2 rounded-xl border border-border/60 bg-card p-4 hover:bg-accent/40 cursor-pointer transition-colors"
              >
                <Icon className="h-10 w-10 text-primary/50" />
                {editingId === f.id ? (
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onBlur={() => commitRename(f.id, false)}
                    onKeyDown={(e) => e.key === "Enter" && commitRename(f.id, false)}
                    className="h-6 text-xs text-center"
                    autoFocus
                  />
                ) : (
                  <>
                    <span className="text-xs font-medium text-center truncate w-full">{f.name}</span>
                    <span className="text-[10px] text-muted-foreground">{formatSize(f.size)}</span>
                  </>
                )}
              </div>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem onClick={() => startRename(f.id, f.name)}>
                <Pencil className="h-3.5 w-3.5 mr-2" /> Rename
              </ContextMenuItem>
              <ContextMenuItem onClick={() => onMoveFile(f.id)}>
                <FolderInput className="h-3.5 w-3.5 mr-2" /> Move to…
              </ContextMenuItem>
              <ContextMenuItem onClick={() => onDownloadFile(f)}>
                <Download className="h-3.5 w-3.5 mr-2" /> Download
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem className="text-destructive" onClick={() => onDeleteFile(f.id)}>
                <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        );
      })}
    </div>
  );
}
