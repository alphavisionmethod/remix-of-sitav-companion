import React from "react";
import { Button } from "@/components/ui/button";
import {
  FolderPlus, Upload, LayoutGrid, List, ArrowLeft, Trash2,
} from "lucide-react";
import { useFilePicker } from "@/components/sita/shell/FilePickerService";

export type ViewMode = "grid" | "list";
export type SortKey = "name" | "date" | "size" | "type";

interface Props {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onNewFolder: () => void;
  onUpload: (files: File[]) => void;
  onBack: () => void;
  onTrash: () => void;
  canGoBack: boolean;
  showingTrash: boolean;
}

/**
 * Phase S — Migrated from raw <input type="file"> to canonical OS-level
 * useFilePicker(). The picker context handles multi-source selection
 * (local / cloud / recent) and validates accept/maxFiles before resolving.
 */
export function FileExplorerToolbar({
  viewMode, onViewModeChange, onNewFolder, onUpload, onBack, onTrash, canGoBack, showingTrash,
}: Props) {
  const { pickFiles } = useFilePicker();

  const handleUploadClick = async () => {
    try {
      const picked = await pickFiles({
        multiple: true,
        title: "Upload to Files",
        sources: ["local", "cloud", "recent"],
      });
      const files = picked.map(p => p.file).filter((f): f is File => !!f);
      if (files.length) onUpload(files);
    } catch {
      // User cancelled — silent
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Button variant="ghost" size="icon" onClick={onBack} disabled={!canGoBack && !showingTrash}>
        <ArrowLeft className="h-4 w-4" />
      </Button>

      <div className="flex-1" />

      {!showingTrash && (
        <>
          <Button variant="outline" size="sm" onClick={onNewFolder}>
            <FolderPlus className="h-4 w-4 mr-1" /> New Folder
          </Button>
          <Button variant="outline" size="sm" onClick={handleUploadClick}>
            <Upload className="h-4 w-4 mr-1" /> Upload
          </Button>
        </>
      )}

      <Button
        variant={showingTrash ? "secondary" : "ghost"}
        size="icon"
        onClick={onTrash}
        title="Trash"
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <div className="border-l border-border h-6 mx-1" />

      <Button
        variant={viewMode === "grid" ? "secondary" : "ghost"}
        size="icon"
        onClick={() => onViewModeChange("grid")}
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>
      <Button
        variant={viewMode === "list" ? "secondary" : "ghost"}
        size="icon"
        onClick={() => onViewModeChange("list")}
      >
        <List className="h-4 w-4" />
      </Button>
    </div>
  );
}
