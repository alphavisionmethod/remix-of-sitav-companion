import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface UploadedFile {
  name: string;
  path: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: string;
}

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

export function useFileUpload() {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [files, setFiles] = useState<UploadedFile[]>([]);

  const upload = useCallback(async (fileList: File[]): Promise<UploadedFile[]> => {
    if (!user?.id) {
      toast.error("Please sign in to upload files");
      return [];
    }

    const valid = fileList.filter(f => {
      if (f.size > MAX_FILE_SIZE) {
        toast.error(`${f.name} exceeds 20MB limit`);
        return false;
      }
      return true;
    });

    if (valid.length === 0) return [];

    setUploading(true);
    setProgress(0);
    const results: UploadedFile[] = [];

    for (let i = 0; i < valid.length; i++) {
      const file = valid[i];
      const ext = file.name.split(".").pop() || "bin";
      const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const path = `${user.id}/${safeName}`;

      const { error } = await supabase.storage
        .from("user-files")
        .upload(path, file, { contentType: file.type, upsert: false });

      if (error) {
        toast.error(`Failed to upload ${file.name}: ${error.message}`);
        continue;
      }

      const { data: urlData } = supabase.storage
        .from("user-files")
        .getPublicUrl(path);

      // Since bucket is private, use createSignedUrl for access
      const { data: signedData } = await supabase.storage
        .from("user-files")
        .createSignedUrl(path, 3600);

      results.push({
        name: file.name,
        path,
        size: file.size,
        type: file.type,
        url: signedData?.signedUrl || urlData.publicUrl,
        uploadedAt: new Date().toISOString(),
      });

      setProgress(Math.round(((i + 1) / valid.length) * 100));
    }

    setFiles(prev => [...prev, ...results]);
    setUploading(false);
    setProgress(0);

    if (results.length > 0) {
      toast.success(`${results.length} file${results.length > 1 ? "s" : ""} uploaded`);
    }

    return results;
  }, [user?.id]);

  const remove = useCallback(async (path: string) => {
    const { error } = await supabase.storage.from("user-files").remove([path]);
    if (error) {
      toast.error(`Delete failed: ${error.message}`);
      return;
    }
    setFiles(prev => prev.filter(f => f.path !== path));
    toast.success("File removed");
  }, []);

  const listFiles = useCallback(async () => {
    if (!user?.id) return;
    const { data, error } = await supabase.storage
      .from("user-files")
      .list(user.id, { limit: 100, sortBy: { column: "created_at", order: "desc" } });

    if (error || !data) return;

    const mapped: UploadedFile[] = [];
    for (const f of data) {
      const path = `${user.id}/${f.name}`;
      const { data: signed } = await supabase.storage
        .from("user-files")
        .createSignedUrl(path, 3600);

      mapped.push({
        name: f.name,
        path,
        size: (f.metadata as any)?.size || 0,
        type: (f.metadata as any)?.mimetype || "",
        url: signed?.signedUrl || "",
        uploadedAt: f.created_at || "",
      });
    }
    setFiles(mapped);
  }, [user?.id]);

  return { upload, remove, listFiles, files, uploading, progress };
}
