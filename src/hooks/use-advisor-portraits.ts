import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getAvatarCache, setAvatarCache, invalidateAvatarCache, avatarCacheKey } from "@/lib/advisors/avatar-url-cache";
import { sanitizeAvatarUrl } from "@/lib/advisors/avatar-url-validation";
import { cropAndResizePortrait } from "@/lib/advisors/portrait-crop-resize";

// ── Validation constants ──────────────────────────────────────
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_DIMENSION = 2048;
const MIN_DIMENSION = 64;

export interface PortraitValidationError {
  field: "type" | "size" | "dimensions";
  message: string;
}

/** Validate a portrait file before upload. Returns null if valid. */
export async function validatePortraitFile(file: File): Promise<PortraitValidationError | null> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { field: "type", message: `Unsupported file type. Use PNG, JPG, or WebP.` };
  }
  if (file.size > MAX_FILE_SIZE) {
    return { field: "size", message: `File is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum is 5 MB.` };
  }
  // Check dimensions
  try {
    const dims = await getImageDimensions(file);
    if (dims.width < MIN_DIMENSION || dims.height < MIN_DIMENSION) {
      return { field: "dimensions", message: `Image is too small (${dims.width}×${dims.height}). Minimum is ${MIN_DIMENSION}×${MIN_DIMENSION}.` };
    }
    if (dims.width > MAX_DIMENSION || dims.height > MAX_DIMENSION) {
      return { field: "dimensions", message: `Image is too large (${dims.width}×${dims.height}). Maximum is ${MAX_DIMENSION}×${MAX_DIMENSION}.` };
    }
  } catch {
    return { field: "dimensions", message: "Could not read image dimensions." };
  }
  return null;
}

function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { resolve({ width: img.naturalWidth, height: img.naturalHeight }); URL.revokeObjectURL(url); };
    img.onerror = () => { reject(new Error("Failed to load image")); URL.revokeObjectURL(url); };
    img.src = url;
  });
}

// ── URL cache backed by shared two-tier cache ─────────────────
const portraitUrlCache = new Map<string, { url: string; ts: number }>(); // TTL-aware sync reads
const PORTRAIT_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

// BroadcastChannel for cross-tab invalidation
let bc: BroadcastChannel | null = null;
try { bc = new BroadcastChannel("sita:portrait-cache"); } catch { /* unsupported */ }

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
          if (p.avatar_url) {
            urls[p.advisor_id] = p.avatar_url;
            portraitUrlCache.set(p.advisor_id, { url: p.avatar_url, ts: Date.now() });
            setAvatarCache(avatarCacheKey(user.id, p.advisor_id), p.avatar_url, "hit");
          }
        });
        setCustomUrls(urls);
      }
    };
    load();
    // Listen for cross-tab invalidations
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "invalidate") {
        const { advisorId: aid } = e.data;
        portraitUrlCache.delete(aid);
        setCustomUrls(prev => { const n = { ...prev }; delete n[aid]; return n; });
        load(); // re-fetch
      }
    };
    bc?.addEventListener("message", handler);
    return () => { bc?.removeEventListener("message", handler); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const uploadPortrait = useCallback(async (advisorId: string, file: File): Promise<string | null> => {
    // Client-side validation
    const validationError = await validatePortraitFile(file);
    if (validationError) {
      toast.error(validationError.message);
      return null;
    }

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const ext = file.name.split(".").pop() || "png";
      // Crop & resize to square before upload
      const processed = await cropAndResizePortrait(file);
      const path = `${user.id}/${advisorId}.png`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("advisor-portraits")
        .upload(path, processed, { upsert: true });
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
      portraitUrlCache.set(advisorId, { url: publicUrl, ts: Date.now() });
      // Invalidate & re-set shared cache
      const { data: { user: u2 } } = await supabase.auth.getUser();
      if (u2) {
        invalidateAvatarCache(avatarCacheKey(u2.id, advisorId));
        setAvatarCache(avatarCacheKey(u2.id, advisorId), publicUrl, "hit");
      }
      bc?.postMessage({ type: "invalidate", advisorId });
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
      portraitUrlCache.delete(advisorId);
      invalidateAvatarCache(avatarCacheKey(user.id, advisorId));
      bc?.postMessage({ type: "invalidate", advisorId });
      toast.success("Portrait removed — using default");
    } catch (err) {
      console.error("Portrait removal error:", err);
      toast.error("Failed to remove portrait");
    }
  }, []);

  const getPortraitUrl = useCallback((advisorId: string): string | null => {
    const cached = portraitUrlCache.get(advisorId);
    const cachedUrl = cached && (Date.now() - cached.ts < PORTRAIT_CACHE_TTL) ? cached.url : null;
    return sanitizeAvatarUrl(customUrls[advisorId]) ?? sanitizeAvatarUrl(cachedUrl) ?? null;
  }, [customUrls]);

  return { customUrls, uploading, uploadPortrait, removePortrait, getPortraitUrl };
}

/**
 * Get a cached portrait URL synchronously (no hook needed).
 * Useful for memoized rendering in lists.
 */
export function getCachedPortraitUrl(advisorId: string): string | null {
  const entry = portraitUrlCache.get(advisorId);
  if (!entry) return null;
  if (Date.now() - entry.ts > PORTRAIT_CACHE_TTL) {
    portraitUrlCache.delete(advisorId);
    return null;
  }
  return entry.url;
}