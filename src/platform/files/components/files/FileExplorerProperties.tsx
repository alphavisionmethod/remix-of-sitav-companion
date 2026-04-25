import React from "react";
import { Button } from "@/components/ui/button";
import { X, Download } from "lucide-react";
import type { ExplorerFile } from "@/data/repositories/file-explorer-service";

interface Props {
  file: ExplorerFile;
  onClose: () => void;
  onDownload: (file: ExplorerFile) => void;
}

function formatSize(bytes: number) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function FileExplorerProperties({ file, onClose, onDownload }: Props) {
  return (
    <div className="w-56 shrink-0 border-l border-border pl-4 hidden lg:block space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Properties</p>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="space-y-3 text-sm">
        <div>
          <p className="text-muted-foreground text-xs">Name</p>
          <p className="font-medium truncate">{file.name}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Type</p>
          <p>{file.mime_type || "Unknown"}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Size</p>
          <p>{formatSize(file.size)}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Created</p>
          <p>{new Date(file.created_at).toLocaleString()}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Modified</p>
          <p>{new Date(file.updated_at).toLocaleString()}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Version</p>
          <p>v{file.version}</p>
        </div>
      </div>

      <Button variant="outline" size="sm" className="w-full" onClick={() => onDownload(file)}>
        <Download className="h-3.5 w-3.5 mr-1" /> Download
      </Button>
    </div>
  );
}
