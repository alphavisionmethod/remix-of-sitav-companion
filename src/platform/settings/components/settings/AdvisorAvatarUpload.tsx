// ═══════════════════════════════════════════════════════════════
// SITA OS — Custom Advisor Avatar Upload
// Lets users upload per-domain advisor avatars stored in Cloud.
// ═══════════════════════════════════════════════════════════════

import { useState, useRef } from "react";
import { Upload, Check, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AdvisorImage, type AdvisorDomain } from "@/components/advisors/AdvisorImage";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { cropAndResizePortrait } from "@/lib/advisors/portrait-crop-resize";

const DOMAINS: { domain: AdvisorDomain; label: string }[] = [
  { domain: "business", label: "Business" },
  { domain: "money", label: "Money" },
  { domain: "concierge", label: "Concierge" },
  { domain: "trust", label: "Trust" },
  { domain: "growth", label: "Growth" },
  { domain: "family", label: "Family" },
  { domain: "opportunity", label: "Opportunity" },
  { domain: "recovery", label: "Recovery" },
  { domain: "boardroom", label: "Boardroom" },
  { domain: "general", label: "General" },
];

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];

export function AdvisorAvatarUpload() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState<AdvisorDomain | null>(null);
  const [uploaded, setUploaded] = useState<Set<AdvisorDomain>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeDomain, setActiveDomain] = useState<AdvisorDomain | null>(null);

  const handleUploadClick = (domain: AdvisorDomain) => {
    setActiveDomain(domain);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeDomain || !user?.id) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast({ title: "Invalid file type", description: "Please upload PNG, JPEG, or WebP.", variant: "destructive" });
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast({ title: "File too large", description: "Max size is 2MB.", variant: "destructive" });
      return;
    }

    setUploading(activeDomain);
    try {
      const processed = await cropAndResizePortrait(file);
      const path = `${user.id}/${activeDomain}.png`;
      const { error } = await supabase.storage
        .from("advisor-avatars")
        .upload(path, processed, { upsert: true, contentType: "image/png" });

      if (error) throw error;

      setUploaded((prev) => new Set(prev).add(activeDomain));
      toast({ title: "Avatar updated", description: `Your ${activeDomain} advisor portrait has been updated.` });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err?.message || "Please try again.", variant: "destructive" });
    } finally {
      setUploading(null);
      setActiveDomain(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (!user) {
    return (
      <div className="flex items-center gap-2 p-4 rounded-xl border border-border/30 bg-muted/30">
        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        <p className="text-xs text-muted-foreground">Sign in to upload custom advisor avatars.</p>
      </div>
    );
  }

  return (
    <section className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Custom Advisor Avatars
      </h3>
      <p className="text-xs text-muted-foreground">
        Upload custom portraits for each advisor domain. They'll appear in your boardroom and meetings.
      </p>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={handleFileChange}
        aria-label="Choose portrait image file"
      />
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {DOMAINS.map(({ domain, label }) => {
          const isUploading = uploading === domain;
          const isUploaded = uploaded.has(domain);
          return (
            <div key={domain} className="flex flex-col items-center gap-2">
              <div className="relative">
                <AdvisorImage domain={domain} size="lg" aria-hidden="true" />
                <button
                  onClick={() => handleUploadClick(domain)}
                  disabled={isUploading}
                  aria-label={
                    isUploading
                      ? `Uploading ${label} advisor portrait`
                      : isUploaded
                        ? `${label} advisor portrait uploaded — click to replace`
                        : `Upload custom ${label} advisor portrait`
                  }
                  aria-describedby={`avatar-status-${domain}`}
                  className={cn(
                    "absolute -bottom-1 -right-1 h-6 w-6 rounded-full flex items-center justify-center border-2 border-background transition-colors",
                    isUploaded
                      ? "bg-[hsl(var(--trust-safe))] text-background"
                      : "bg-primary text-primary-foreground hover:bg-primary/80",
                  )}
                >
                  {isUploading ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : isUploaded ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <Upload className="h-3 w-3" />
                  )}
                </button>
              </div>
              <span id={`avatar-status-${domain}`} className="text-[10px] text-muted-foreground font-medium">{label}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}