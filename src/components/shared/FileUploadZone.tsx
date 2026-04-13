import { useState, useCallback, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Upload, X, FileText, Image, File as FileIcon,
  Trash2, Download, Cloud
} from "lucide-react";
import { useFileUpload, type UploadedFile } from "@/hooks/use-file-upload";
import { cn } from "@/lib/utils";

const FILE_ICONS: Record<string, React.ElementType> = {
  image: Image,
  text: FileText,
  application: FileIcon,
};

function getFileIcon(type: string) {
  const category = type.split("/")[0];
  return FILE_ICONS[category] || FileIcon;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface FileUploadZoneProps {
  onUpload?: (files: UploadedFile[]) => void;
  accept?: string;
  maxFiles?: number;
  showFileList?: boolean;
  className?: string;
}

export function FileUploadZone({
  onUpload,
  accept,
  maxFiles = 10,
  showFileList = true,
  className,
}: FileUploadZoneProps) {
  const { upload, remove, files, uploading, progress } = useFileUpload();
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(async (fileList: FileList | null) => {
    if (!fileList) return;
    const arr = Array.from(fileList).slice(0, maxFiles);
    const results = await upload(arr);
    onUpload?.(results);
  }, [upload, onUpload, maxFiles]);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  return (
    <div className={cn("space-y-3", className)}>
      {/* Drop Zone */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "relative flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 cursor-pointer transition-all",
          isDragOver
            ? "border-primary bg-primary/5 scale-[1.01]"
            : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={accept}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        <div className={cn(
          "rounded-full p-3 transition-colors",
          isDragOver ? "bg-primary/10" : "bg-muted"
        )}>
          <Upload className={cn(
            "h-6 w-6 transition-colors",
            isDragOver ? "text-primary" : "text-muted-foreground"
          )} />
        </div>

        <div className="text-center">
          <p className="text-sm font-medium">
            {isDragOver ? "Drop files here" : "Drag & drop files here"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            or click to browse · max {maxFiles} files · 20MB each
          </p>
        </div>

        {uploading && (
          <div className="w-full max-w-xs mt-2">
            <Progress value={progress} className="h-1.5" />
            <p className="text-xs text-muted-foreground text-center mt-1">
              Uploading... {progress}%
            </p>
          </div>
        )}
      </div>

      {/* File List */}
      {showFileList && files.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">
            {files.length} file{files.length !== 1 ? "s" : ""} uploaded
          </p>
          {files.map((file) => {
            const Icon = getFileIcon(file.type);
            return (
              <Card key={file.path}>
                <CardContent className="flex items-center gap-3 p-3">
                  <div className="rounded-md bg-muted p-2 shrink-0">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatSize(file.size)}
                    </p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {file.url && (
                      <Button
                        size="icon" variant="ghost" className="h-7 w-7"
                        onClick={(e) => { e.stopPropagation(); window.open(file.url, "_blank"); }}
                      >
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    <Button
                      size="icon" variant="ghost" className="h-7 w-7 text-destructive"
                      onClick={(e) => { e.stopPropagation(); remove(file.path); }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
