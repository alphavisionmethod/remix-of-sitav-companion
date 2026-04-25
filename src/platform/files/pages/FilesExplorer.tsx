import React, { useState, useCallback } from "react";
import {
  useFolderContents, useBreadcrumbs, useAllFolders,
  useRenameFolder, useDeleteFolder, useRenameFile, useDeleteFile, useUploadToFolder,
} from "@/hooks/use-file-explorer";
import { downloadFile, type ExplorerFile } from "@/data/repositories/file-explorer-service";
import { FileExplorerBreadcrumb } from "@/platform/files/components/files/FileExplorerBreadcrumb";
import { FileExplorerToolbar, type ViewMode } from "@/platform/files/components/files/FileExplorerToolbar";
import { FileExplorerSidebar } from "@/platform/files/components/files/FileExplorerSidebar";
import { FileExplorerGrid } from "@/platform/files/components/files/FileExplorerGrid";
import { FileExplorerTrash } from "@/platform/files/components/files/FileExplorerTrash";
import { FileExplorerProperties } from "@/platform/files/components/files/FileExplorerProperties";
import { NewFolderDialog } from "@/platform/files/components/files/NewFolderDialog";
import { MoveToDialog } from "@/platform/files/components/files/MoveToDialog";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const FilesExplorer = () => {
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [showTrash, setShowTrash] = useState(false);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [moveFileId, setMoveFileId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<ExplorerFile | null>(null);
  const [history, setHistory] = useState<(string | null)[]>([]);

  const { data: contents, isLoading } = useFolderContents(currentFolder);
  const { data: breadcrumbs } = useBreadcrumbs(currentFolder);
  const { data: allFolders } = useAllFolders();

  const renameFolderMut = useRenameFolder();
  const deleteFolderMut = useDeleteFolder();
  const renameFileMut = useRenameFile();
  const deleteFileMut = useDeleteFile();
  const uploadMut = useUploadToFolder();

  const navigate = useCallback((folderId: string | null) => {
    setHistory((h) => [...h, currentFolder]);
    setCurrentFolder(folderId);
    setShowTrash(false);
    setSelectedFile(null);
  }, [currentFolder]);

  const goBack = useCallback(() => {
    if (showTrash) { setShowTrash(false); return; }
    const prev = history[history.length - 1] ?? null;
    setHistory((h) => h.slice(0, -1));
    setCurrentFolder(prev);
    setSelectedFile(null);
  }, [history, showTrash]);

  const handleDownload = useCallback(async (file: ExplorerFile) => {
    try {
      const url = await downloadFile(file);
      window.open(url, "_blank");
    } catch {
      toast.error("Download failed");
    }
  }, []);

  const handleUpload = useCallback((files: File[]) => {
    for (const f of files) {
      uploadMut.mutate({ file: f, folderId: currentFolder });
    }
  }, [currentFolder, uploadMut]);

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <FileExplorerBreadcrumb
        items={showTrash ? [{ id: null, name: "Home" }, { id: null, name: "Trash" }] : (breadcrumbs || [{ id: null, name: "Home" }])}
        onNavigate={navigate}
      />

      {/* Toolbar */}
      <FileExplorerToolbar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onNewFolder={() => setShowNewFolder(true)}
        onUpload={handleUpload}
        onBack={goBack}
        onTrash={() => { setShowTrash(!showTrash); setSelectedFile(null); }}
        canGoBack={history.length > 0}
        showingTrash={showTrash}
      />

      {/* Main area */}
      <div className="flex gap-4 min-h-[400px]">
        <FileExplorerSidebar
          folders={allFolders || []}
          currentFolderId={currentFolder}
          onNavigate={navigate}
          onTrash={() => { setShowTrash(true); setSelectedFile(null); }}
          showingTrash={showTrash}
        />

        <div className="flex-1 min-w-0">
          {showTrash ? (
            <FileExplorerTrash />
          ) : isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <FileExplorerGrid
              folders={contents?.folders || []}
              files={contents?.files || []}
              viewMode={viewMode}
              onOpenFolder={navigate}
              onRenameFolder={(id, name) => renameFolderMut.mutate({ id, name })}
              onDeleteFolder={(id) => deleteFolderMut.mutate(id)}
              onRenameFile={(id, name) => renameFileMut.mutate({ id, name })}
              onDeleteFile={(id) => deleteFileMut.mutate(id)}
              onMoveFile={(id) => setMoveFileId(id)}
              onDownloadFile={handleDownload}
              onSelectFile={setSelectedFile}
            />
          )}
        </div>

        {selectedFile && !showTrash && (
          <FileExplorerProperties
            file={selectedFile}
            onClose={() => setSelectedFile(null)}
            onDownload={handleDownload}
          />
        )}
      </div>

      {/* Dialogs */}
      <NewFolderDialog
        open={showNewFolder}
        onOpenChange={setShowNewFolder}
        parentId={currentFolder}
      />

      {moveFileId && (
        <MoveToDialog
          open={!!moveFileId}
          onOpenChange={() => setMoveFileId(null)}
          fileId={moveFileId}
        />
      )}
    </div>
  );
};

export default FilesExplorer;
