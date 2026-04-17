import { useState, useCallback, useRef } from "react";
import { Upload, FileText, X, CheckCircle, AlertTriangle, Loader2, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useLoopEmitter } from "@/hooks/use-flagship-loop-proof";

export interface UploadedFileEntry {
  name: string;
  size: number;
  status: "uploading" | "classifying" | "done" | "error";
  progress: number;
  classification?: string;
  sensitivity?: string;
  signedUrl?: string;
  storagePath?: string;
  error?: string;
}

type UploadedFile = UploadedFileEntry;

interface FileUploaderProps {
  onUploaded?: (entry: UploadedFileEntry) => void;
}

const ALLOWED_TYPES = [
  "application/pdf", "image/jpeg", "image/png", "image/webp",
  "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain", "text/csv",
];
const MAX_SIZE = 20 * 1024 * 1024; // 20MB

export const FileUploader = ({ onUploaded }: FileUploaderProps = {}) => {
  const { user } = useAuth();
  const emitLoop = useLoopEmitter("files-ai-assist");
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const updateFile = (name: string, updates: Partial<UploadedFile>) => {
    setFiles(prev => prev.map(f => f.name === name ? { ...f, ...updates } : f));
  };

  const uploadFile = useCallback(async (file: File) => {
    if (!user) return;
    if (file.size > MAX_SIZE) {
      toast.error(`${file.name} exceeds 20MB limit`);
      return;
    }

    const entry: UploadedFile = { name: file.name, size: file.size, status: "uploading", progress: 0 };
    setFiles(prev => [...prev, entry]);

    try {
      const storagePath = `${user.id}/${Date.now()}_${file.name}`;

      // Upload to storage (correct bucket: user-files, RLS-scoped to user.id folder)
      const { error: uploadError } = await supabase.storage
        .from("user-files")
        .upload(storagePath, file, { upsert: false, contentType: file.type });

      if (uploadError) throw uploadError;
      updateFile(file.name, { progress: 60, status: "classifying", storagePath });

      // Call file-ingestion edge function
      const { data: session } = await supabase.auth.getSession();
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/file-ingestion`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.session?.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({
            storage_path: storagePath,
            filename: file.name,
            mime_type: file.type,
            size_bytes: file.size,
          }),
        }
      );

      if (!resp.ok) throw new Error("Classification failed");
      const result = await resp.json();

      // Generate signed URL for immediate preview/download
      const { data: signed } = await supabase.storage
        .from("user-files")
        .createSignedUrl(storagePath, 3600);

      const finalEntry: UploadedFileEntry = {
        ...entry,
        progress: 100,
        status: "done",
        classification: result.classification,
        sensitivity: result.sensitivity,
        signedUrl: signed?.signedUrl,
        storagePath,
      };

      updateFile(file.name, {
        progress: 100,
        status: "done",
        classification: result.classification,
        sensitivity: result.sensitivity,
        signedUrl: signed?.signedUrl,
      });

      emitLoop("file_upload", {
        evidence: { filename: file.name, classification: result.classification, sensitivity: result.sensitivity, storage_path: storagePath },
      });
      emitLoop("ai_classify", {
        evidence: { filename: file.name, classification: result.classification },
      });

      toast.success(`${file.name} classified as ${result.classification}`);
      onUploaded?.(finalEntry);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Upload failed";
      updateFile(file.name, { status: "error", error: msg });
      toast.error(`Failed to upload ${file.name}: ${msg}`);
    }
  }, [user, onUploaded, emitLoop]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const dropped = Array.from(e.dataTransfer.files);
    dropped.forEach(uploadFile);
  }, [uploadFile]);

  const handleSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    selected.forEach(uploadFile);
    e.target.value = "";
  }, [uploadFile]);

  const removeFile = (name: string) => {
    setFiles(prev => prev.filter(f => f.name !== name));
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-10 cursor-pointer transition-all",
          isDragOver
            ? "border-primary bg-primary/5 scale-[1.01]"
            : "border-border/60 bg-card/30 hover:border-primary/30 hover:bg-card/50"
        )}
      >
        <div className="rounded-xl bg-primary/8 p-3">
          <Upload className="h-6 w-6 text-primary" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-foreground">Drop files here or click to upload</p>
          <p className="text-xs text-muted-foreground mt-1">PDF, images, documents up to 20MB — AI will classify and extract</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleSelect}
          accept={ALLOWED_TYPES.join(",")}
        />
      </div>

      {/* Upload Progress */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map(f => (
            <div key={f.name} className="flex items-center gap-3 rounded-xl border border-border bg-card/50 px-4 py-3">
              <div className="rounded-lg bg-primary/8 p-2 shrink-0">
                <FileText className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground truncate">{f.name}</p>
                  <button onClick={() => removeFile(f.name)} className="text-muted-foreground hover:text-foreground p-1">
                    <X className="h-3 w-3" />
                  </button>
                </div>
                {f.status === "uploading" && <Progress value={f.progress} className="h-1.5 mt-1.5" />}
                {f.status === "classifying" && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <Loader2 className="h-3 w-3 animate-spin text-primary" />
                    <span className="text-[10px] text-muted-foreground">AI classifying...</span>
                  </div>
                )}
                {f.status === "done" && (
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <CheckCircle className="h-3 w-3 text-trust-safe" />
                    <span className="text-[10px] text-foreground font-medium">{f.classification}</span>
                    <span className="text-[10px] text-muted-foreground">· {f.sensitivity}</span>
                    {f.signedUrl && (
                      <a
                        href={f.signedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="ml-auto inline-flex items-center gap-1 text-[10px] font-medium text-primary hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" /> Open
                      </a>
                    )}
                  </div>
                )}
                {f.status === "error" && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <AlertTriangle className="h-3 w-3 text-destructive" />
                    <span className="text-[10px] text-destructive">{f.error}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
