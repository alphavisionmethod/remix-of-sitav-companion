import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AdvisorPortraitState {
  customUrls: Record<string, string>;
  uploading: boolean;
  uploadPortrait: (advisorId: string, file: File) => Promise<string | null>;
  removePortrait: (advisorId: string) => Promise<void>;
  getPortraitUrl: (advisorId: string) => string | null;
}

export function useAdvisorPortraits(): AdvisorPortraitState {
  const [customUrls, setCustomUrls] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);

  // Load custom portraits from advisor_profiles
  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("advisor_profiles")
        .select("advisor_id, avatar_url")
        .eq("user_id", user.id);
      if (data) {
        const urls: Record<string, string> = {};
        data.forEach((p) => {
          if (p.avatar_url) urls[p.advisor_id] = p.avatar_url;
        });
        setCustomUrls(urls);
      }
    };
    load();
  }, []);

  const uploadPortrait = useCallback(async (advisorId: string, file: File): Promise<string | null> => {
    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const ext = file.name.split(".").pop() || "png";
      const path = `${user.id}/${advisorId}.${ext}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("advisor-portraits")
        .upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("advisor-portraits")
        .getPublicUrl(path);
      const publicUrl = urlData.publicUrl;

      // Upsert advisor_profiles
      const { error: dbError } = await supabase
        .from("advisor_profiles")
        .upsert({
          advisor_id: advisorId,
          user_id: user.id,
          avatar_url: publicUrl,
          display_name: advisorId,
          domain: "general",
        }, { onConflict: "advisor_id,user_id" });

      if (dbError) {
        // Try insert if upsert fails
        await supabase.from("advisor_profiles").insert({
          advisor_id: advisorId,
          user_id: user.id,
          avatar_url: publicUrl,
          display_name: advisorId,
          domain: "general",
        });
      }

      setCustomUrls(prev => ({ ...prev, [advisorId]: publicUrl }));
      toast.success("Portrait updated successfully");
      return publicUrl;
    } catch (err) {
      console.error("Portrait upload error:", err);
      toast.error("Failed to upload portrait");
      return null;
    } finally {
      setUploading(false);
    }
  }, []);

  const removePortrait = useCallback(async (advisorId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from("advisor_profiles")
        .update({ avatar_url: null })
        .eq("advisor_id", advisorId)
        .eq("user_id", user.id);

      setCustomUrls(prev => {
        const next = { ...prev };
        delete next[advisorId];
        return next;
      });
      toast.success("Portrait removed — using default");
    } catch (err) {
      console.error("Portrait removal error:", err);
      toast.error("Failed to remove portrait");
    }
  }, []);

  const getPortraitUrl = useCallback((advisorId: string): string | null => {
    return customUrls[advisorId] || null;
  }, [customUrls]);

  return { customUrls, uploading, uploadPortrait, removePortrait, getPortraitUrl };
}