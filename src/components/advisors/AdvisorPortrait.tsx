import { useState, useCallback } from "react";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { AdvisorAvatar } from "@/components/sita/primitives/AdvisorAvatar";
import { getDefaultAdvisorAvatar } from "@/lib/advisors/advisor-avatar-assets";
import { getCachedPortraitUrl } from "@/hooks/use-advisor-portraits";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw } from "lucide-react";

type AdvisorDomain = "business" | "money" | "concierge" | "family" | "growth" | "trust" | "opportunity" | "recovery" | "boardroom" | "general";

interface AdvisorPortraitProps {
  domain: AdvisorDomain;
  name?: string;
  avatarUrl?: string | null;
  advisorId?: string;
  status?: "active" | "thinking" | "idle" | "offline";
  speaking?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const domainGradients: Record<AdvisorDomain, string> = {
  money: "from-emerald-500 to-emerald-300 dark:from-emerald-400 dark:to-emerald-200",
  business: "from-purple-600 to-purple-400 dark:from-purple-500 dark:to-purple-300",
  concierge: "from-amber-500 to-amber-300 dark:from-amber-400 dark:to-amber-200",
  growth: "from-blue-500 to-cyan-400 dark:from-blue-400 dark:to-cyan-300",
  trust: "from-teal-500 to-teal-300 dark:from-teal-400 dark:to-teal-200",
  opportunity: "from-orange-500 to-yellow-400 dark:from-orange-400 dark:to-yellow-300",
  recovery: "from-slate-500 to-slate-400 dark:from-slate-400 dark:to-slate-300",
  boardroom: "from-indigo-600 to-purple-500 dark:from-indigo-500 dark:to-purple-400",
  family: "from-rose-500 to-pink-400 dark:from-rose-400 dark:to-pink-300",
  general: "from-purple-500 to-amber-400 dark:from-purple-400 dark:to-amber-300",
};

const sizes = {
  sm: { container: "h-8 w-8", ring: "ring-2", speaking: "ring-[3px]" },
  md: { container: "h-12 w-12", ring: "ring-2", speaking: "ring-[3px]" },
  lg: { container: "h-20 w-20", ring: "ring-[3px]", speaking: "ring-4" },
  xl: { container: "h-[120px] w-[120px]", ring: "ring-4", speaking: "ring-[5px]" },
};

const IMG_SIZES: Record<string, number> = { sm: 32, md: 48, lg: 80, xl: 120 };
const MAX_RETRIES = 3;
const RETRY_DELAYS = [800, 1500, 3000];

export const AdvisorPortrait = ({
  domain,
  name,
  avatarUrl,
  advisorId,
  status = "active",
  speaking = false,
  size = "md",
  className,
}: AdvisorPortraitProps) => {
  const [imgState, setImgState] = useState<"loading" | "loaded" | "error">("loading");
  const [retries, setRetries] = useState(0);
  const s = sizes[size];
  const gradient = domainGradients[domain];
  // Resolve URL: explicit prop → cached custom → default
  const resolvedUrl = useMemo(() => {
    if (avatarUrl) return avatarUrl;
    if (advisorId) {
      const cached = getCachedPortraitUrl(advisorId);
      if (cached) return cached;
    }
    return getDefaultAdvisorAvatar(domain);
  }, [avatarUrl, advisorId, domain]);
  const px = IMG_SIZES[size] || 48;

  const handleError = useCallback(() => {
    if (retries < MAX_RETRIES) {
      setTimeout(() => setRetries((r) => r + 1), RETRY_DELAYS[retries] ?? 3000);
    } else {
      setImgState("error");
    }
  }, [retries]);

  const handleRetry = useCallback(() => {
    setRetries(0);
    setImgState("loading");
  }, []);

  const imgSrc = resolvedUrl
    ? retries > 0 ? `${resolvedUrl}${resolvedUrl.includes("?") ? "&" : "?"}r=${retries}` : resolvedUrl
    : null;

  // Fallback to icon avatar
  if (!resolvedUrl || imgState === "error") {
    return (
      <div data-testid="advisor-portrait" className={cn("relative", className)}>
        {imgState === "error" ? (
          <button
            onClick={handleRetry}
            className={cn("rounded-full p-[2px] bg-gradient-to-br flex items-center justify-center group cursor-pointer", gradient, s.container)}
            title="Retry loading portrait"
          >
            <RefreshCw className="h-1/3 w-1/3 text-white/60 group-hover:text-white transition-colors" />
          </button>
        ) : (
          <AdvisorAvatar domain={domain} name={name} avatarUrl={avatarUrl} status={status} size={size === "xl" ? "lg" : size === "lg" ? "lg" : size} />
        )}
        {speaking && (
          <motion.div
            className={cn("absolute inset-0 rounded-full ring-primary/60", s.speaking)}
            animate={{ scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
      </div>
    );
  }

  return (
    <div data-testid="advisor-portrait" className={cn("relative", className)}>
      {/* Gradient border ring */}
      <div className={cn("rounded-full p-[2px] bg-gradient-to-br", gradient, s.container)}>
        {/* Skeleton shimmer while loading */}
        {imgState === "loading" && (
          <Skeleton className="absolute inset-[2px] rounded-full z-10" />
        )}
        <motion.img
          src={imgSrc!}
          alt={name || "Advisor"}
          width={px}
          height={px}
          className={cn(
            "rounded-full object-cover w-full h-full bg-card dark:bg-card transition-opacity duration-300",
            imgState === "loaded" ? "opacity-100" : "opacity-0"
          )}
          onLoad={() => setImgState("loaded")}
          onError={handleError}
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
          loading="lazy"
          decoding="async"
        />
      </div>

      {/* Speaking pulse ring */}
      {speaking && (
        <motion.div
          className={cn(
            "absolute inset-[-3px] rounded-full border-2 border-primary/50 pointer-events-none"
          )}
          animate={{ scale: [1, 1.12, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* Status dot */}
      {status && (
        <div
          className={cn(
            "absolute bottom-0 right-0 rounded-full border-2 border-card",
            size === "sm" ? "h-2 w-2" : size === "md" ? "h-2.5 w-2.5" : "h-3 w-3",
            status === "active" && "bg-[hsl(var(--trust-safe))]",
            status === "thinking" && "bg-[hsl(var(--sita-purple))] animate-pulse",
            status === "idle" && "bg-muted-foreground/40",
            status === "offline" && "bg-muted-foreground/20"
          )}
        />
      )}
    </div>
  );
};
