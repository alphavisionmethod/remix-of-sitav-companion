import React, { useState, useCallback } from "react";
import { MobileShell } from "@/platform/experience/components/mobile/MobileShell";
import {
  Folder, FileText, ArrowLeft, Plus, Upload, Trash2, MoreVertical,
  File, Image, FileSpreadsheet, Film, Music, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFolderContents, useCreateFolder, useDeleteFile, useDeleteFolder, useUploadToFolder } from "@/hooks/use-file-explorer";
import type { ExplorerFile, ExplorerFolder } from "@/data/repositories/file-explorer-service";
import { NewFolderDialog } from "@/platform/files/components/files/NewFolderDialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRef } from "react";

function fileIcon(mime: string | null) {
  if (!mime) return File;
  if (mime.startsWith("image/")) return Image;
  if (mime.includes("spreadsheet") || mime.includes("excel")) return FileSpreadsheet;
  if (mime.includes("video")) return Film;
  if (mime.includes("audio")) return Music;
  return FileText;
}

function formatSize(bytes: number) {
  if (bytes === 0) return "";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

const MobileFiles = () => {
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [history, setHistory] = useState<(string | null)[]>([]);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: contents, isLoading } = useFolderContents(currentFolder);
  const deleteFile = useDeleteFile();
  const deleteFolder = useDeleteFolder();
  const upload = useUploadToFolder();

  const navigate = useCallback((id: string | null) => {
    setHistory((h) => [...h, currentFolder]);
    setCurrentFolder(id);
  }, [currentFolder]);

  const goBack = useCallback(() => {
    const prev = history[history.length - 1] ?? null;
    setHistory((h) => h.slice(0, -1));
    setCurrentFolder(prev);
  }, [history]);

  const handleUpload = (files: File[]) => {
    for (const f of files) {
      upload.mutate({ file: f, folderId: currentFolder });
    }
  };

  return (
    <MobileShell title="Files">
      {/* Header actions */}
      <div className="flex items-center gap-2 mb-4">
        {history.length > 0 && (
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <div className="flex-1" />
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowNewFolder(true)}>
          <Plus className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => inputRef.current?.click()}>
          <Upload className="h-4 w-4" />
        </Button>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            const fl = Array.from(e.target.files || []);
            if (fl.length) handleUpload(fl);
            e.target.value = "";
          }}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-2">
          {(contents?.folders || []).length === 0 && (contents?.files || []).length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm">
              <Folder className="h-10 w-10 mx-auto mb-2 opacity-20" />
              Empty folder
            </div>
          )}

          {(contents?.folders || []).map((f) => (
            <div
              key={f.id}
              onClick={() => navigate(f.id)}
              className="flex items-center gap-3 rounded-xl border border-border/40 bg-card px-4 py-3 active:bg-accent"
            >
              <Folder className="h-5 w-5 shrink-0 text-amber-500" />
              <span className="text-sm font-medium flex-1 truncate">{f.name}</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <MoreVertical className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem className="text-destructive" onClick={(e) => { e.stopPropagation(); deleteFolder.mutate(f.id); }}>
                    <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}

          {(contents?.files || []).map((f) => {
            const Icon = fileIcon(f.mime_type);
            return (
              <div key={f.id} className="flex items-center gap-3 rounded-xl border border-border/40 bg-card px-4 py-3">
                <Icon className="h-5 w-5 shrink-0 text-primary/60" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{f.name}</p>
                  <p className="text-[11px] text-muted-foreground">{formatSize(f.size)}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <MoreVertical className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem className="text-destructive" onClick={() => deleteFile.mutate(f.id)}>
                      <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            );
          })}
        </div>
      )}

      <NewFolderDialog
        open={showNewFolder}
        onOpenChange={setShowNewFolder}
        parentId={currentFolder}
      />
    </MobileShell>
  );
};

export default MobileFiles;
