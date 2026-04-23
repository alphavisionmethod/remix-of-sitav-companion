// ═══════════════════════════════════════════════════════════════
// SITA OS — Advisor Image with retry + skeleton loading
// Gracefully handles failed loads with retry logic and shimmer.
// ═══════════════════════════════════════════════════════════════

import { useState, useCallback, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// Default advisor portraits
import businessAdvisor from "@/assets/advisors/business-advisor.png";
import moneyAdvisor from "@/assets/advisors/money-advisor.png";
import conciergeAdvisor from "@/assets/advisors/concierge-advisor.png";
import generalAdvisor from "@/assets/advisors/general-advisor.png";
import trustAdvisor from "@/assets/advisors/trust-advisor.png";
import growthAdvisor from "@/assets/advisors/growth-advisor.png";
import familyAdvisor from "@/assets/advisors/family-advisor.png";
import opportunityAdvisor from "@/assets/advisors/opportunity-advisor.png";
import recoveryAdvisor from "@/assets/advisors/recovery-advisor.png";
import boardroomAdvisor from "@/assets/advisors/boardroom-advisor.png";

export type AdvisorDomain =
  | "business" | "money" | "concierge" | "general" | "trust"
  | "growth" | "family" | "opportunity" | "recovery" | "boardroom";

const DEFAULT_PORTRAITS: Record<AdvisorDomain, string> = {
  business: businessAdvisor,
  money: moneyAdvisor,
  concierge: conciergeAdvisor,
  general: generalAdvisor,
  trust: trustAdvisor,
  growth: growthAdvisor,
  family: familyAdvisor,
  opportunity: opportunityAdvisor,
  recovery: recoveryAdvisor,
  boardroom: boardroomAdvisor,
};

const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 2000, 4000];

interface AdvisorImageProps {
  domain: AdvisorDomain;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  /** Override the src entirely */
  src?: string;
}

const SIZE_MAP = {
  sm: "h-8 w-8",
  md: "h-12 w-12",
  lg: "h-16 w-16",
  xl: "h-24 w-24",
};

import { getAvatarCache, setAvatarCache, avatarCacheKey } from "@/lib/advisors/avatar-url-cache";
import { sanitizeAvatarUrl } from "@/lib/advisors/avatar-url-validation";
import { logPortraitFailure } from "@/lib/advisors/portrait-failure-logger";
import { isAvatarDebugActive, BROKEN_AVATAR_URL } from "@/lib/advisors/avatar-debug";

const USER_ID = "00000000-0000-0000-0000-000000000000";

export function useCustomAdvisorAvatar(domain: AdvisorDomain) {
  const { user } = useAuth();
  const [customUrl, setCustomUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id || user.id === USER_ID) return;
    const cKey = avatarCacheKey(user.id, domain);
    const cached = getAvatarCache(cKey);
    if (cached) {
      setCustomUrl(cached.status === "hit" ? cached.url : null);
      return;
    }
    const path = `${user.id}/${domain}.png`;
    const { data } = supabase.storage
      .from("advisor-avatars")
      .getPublicUrl(path);
    fetch(data.publicUrl, { method: "HEAD" })
      .then((res) => {
        if (res.ok) {
          setCustomUrl(data.publicUrl);
          setAvatarCache(cKey, data.publicUrl, "hit");
        } else {
          setAvatarCache(cKey, data.publicUrl, "miss");
        }
      })
      .catch(() => {
        setAvatarCache(cKey, data.publicUrl, "miss");
      });
  }, [user?.id, domain]);

  return customUrl;
}

export function AdvisorImage({ domain, size = "md", className, src }: AdvisorImageProps) {
  const customUrl = useCustomAdvisorAvatar(domain);
  const safeSrc = sanitizeAvatarUrl(src) ?? sanitizeAvatarUrl(customUrl);
  const resolvedSrc = isAvatarDebugActive()
    ? BROKEN_AVATAR_URL
    : (safeSrc ?? DEFAULT_PORTRAITS[domain] ?? DEFAULT_PORTRAITS.general);

  const [state, setState] = useState<"loading" | "loaded" | "error">("loading");
  const [retryCount, setRetryCount] = useState(0);
  const [currentSrc, setCurrentSrc] = useState(resolvedSrc);

  // Reset when resolvedSrc changes
  useEffect(() => {
    setCurrentSrc(resolvedSrc);
    setState("loading");
    setRetryCount(0);
  }, [resolvedSrc]);

  const handleLoad = useCallback(() => setState("loaded"), []);

  const handleError = useCallback(() => {
    if (retryCount < MAX_RETRIES) {
      const delay = RETRY_DELAYS[retryCount] ?? 4000;
      setTimeout(() => {
        setCurrentSrc(`${resolvedSrc}${resolvedSrc.includes("?") ? "&" : "?"}retry=${retryCount + 1}`);
        setRetryCount((c) => c + 1);
      }, delay);
    } else {
      setState("error");
      logPortraitFailure({
        domain,
        url: resolvedSrc,
        error_type: "load_exhausted",
        retry_count: MAX_RETRIES,
      });
    }
  }, [retryCount, resolvedSrc]);

  const handleRetry = useCallback(() => {
    setRetryCount(0);
    setState("loading");
    setCurrentSrc(`${resolvedSrc}${resolvedSrc.includes("?") ? "&" : "?"}t=${Date.now()}`);
  }, [resolvedSrc]);

  const sizeClass = SIZE_MAP[size];

  if (state === "error") {
    return (
      <button
        onClick={handleRetry}
        className={cn(
          sizeClass,
          "rounded-full bg-muted/60 border border-border/30 flex items-center justify-center group cursor-pointer transition-colors hover:bg-muted",
          className,
        )}
        title="Retry loading portrait"
      >
        <RefreshCw className="h-1/3 w-1/3 text-muted-foreground group-hover:text-foreground transition-colors" />
      </button>
    );
  }

  return (
    <div className={cn(sizeClass, "relative rounded-full overflow-hidden", className)}>
      {state === "loading" && (
        <Skeleton className="absolute inset-0 rounded-full" />
      )}
      <img
        src={currentSrc}
        alt={`${domain} advisor`}
        className={cn(
          "h-full w-full object-cover rounded-full transition-opacity duration-300",
          state === "loaded" ? "opacity-100" : "opacity-0",
        )}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
      />
    </div>
  );
}

export function getDefaultPortrait(domain: AdvisorDomain): string {
  return DEFAULT_PORTRAITS[domain] ?? DEFAULT_PORTRAITS.general;
}