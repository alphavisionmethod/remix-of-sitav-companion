import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Brain, Briefcase, DollarSign, Headphones, Heart, Shield, Sparkles, TrendingUp, Scale, RefreshCw } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getDefaultAdvisorAvatar } from "@/lib/advisors/advisor-avatar-assets";
import { Skeleton } from "@/components/ui/skeleton";
import { sanitizeAvatarUrl } from "@/lib/advisors/avatar-url-validation";
import { isAvatarDebugActive, BROKEN_AVATAR_URL } from "@/lib/advisors/avatar-debug";
import { logPortraitFailure } from "@/lib/advisors/portrait-failure-logger";

type AdvisorDomain = "business" | "money" | "concierge" | "family" | "growth" | "trust" | "opportunity" | "recovery" | "boardroom" | "general";

interface AdvisorAvatarProps {
  domain: AdvisorDomain;
  name?: string;
  avatarUrl?: string | null;
  advisorId?: string;
  status?: "active" | "thinking" | "idle" | "offline";
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  confidence?: number;
  className?: string;
}

const domainConfig: Record<AdvisorDomain, { icon: LucideIcon; gradient: string; label: string }> = {
  business: { icon: Briefcase, gradient: "from-[hsl(var(--sita-purple))] to-[hsl(var(--sita-purple-light))]", label: "Business" },
  money: { icon: DollarSign, gradient: "from-[hsl(var(--trust-safe))] to-emerald-400", label: "Money" },
  concierge: { icon: Headphones, gradient: "from-[hsl(var(--sita-gold))] to-amber-400", label: "Concierge" },
  family: { icon: Heart, gradient: "from-rose-500 to-pink-400", label: "Family" },
  growth: { icon: TrendingUp, gradient: "from-blue-500 to-cyan-400", label: "Growth" },
  trust: { icon: Shield, gradient: "from-[hsl(var(--trust-safe))] to-teal-400", label: "Trust" },
  opportunity: { icon: Sparkles, gradient: "from-[hsl(var(--sita-gold))] to-orange-400", label: "Opportunity" },
  recovery: { icon: Scale, gradient: "from-slate-500 to-slate-400", label: "Recovery" },
  boardroom: { icon: Brain, gradient: "from-[hsl(var(--sita-purple-dark))] to-[hsl(var(--sita-purple))]", label: "Boardroom" },
  general: { icon: Brain, gradient: "from-[hsl(var(--sita-purple))] to-[hsl(var(--sita-gold))]", label: "SITA" },
};

const sizes = {
  sm: { container: "h-7 w-7", icon: "h-3.5 w-3.5", ring: "ring-2", dot: "h-2 w-2 -bottom-0.5 -right-0.5" },
  md: { container: "h-9 w-9", icon: "h-4 w-4", ring: "ring-2", dot: "h-2.5 w-2.5 -bottom-0.5 -right-0.5" },
  lg: { container: "h-12 w-12", icon: "h-5 w-5", ring: "ring-[3px]", dot: "h-3 w-3 bottom-0 right-0" },
};

const statusColors = {
  active: "bg-[hsl(var(--trust-safe))]",
  thinking: "bg-[hsl(var(--sita-purple))] animate-pulse",
  idle: "bg-muted-foreground/40",
  offline: "bg-muted-foreground/20",
};

const MAX_RETRIES = 3;
const RETRY_DELAYS = [800, 1500, 3000];

export const AdvisorAvatar = ({ domain, name, avatarUrl, advisorId, status = "active", size = "md", showLabel = false, confidence, className }: AdvisorAvatarProps) => {
  const [imgState, setImgState] = useState<"loading" | "loaded" | "error">("loading");
  const [retries, setRetries] = useState(0);
  const config = domainConfig[domain];
  const s = sizes[size];
  const Icon = config.icon;

  // Apply URL sanitization, debug override, and safe fallback
  const safeCustom = sanitizeAvatarUrl(avatarUrl);
  const resolvedAvatar = isAvatarDebugActive()
    ? BROKEN_AVATAR_URL
    : (safeCustom || getDefaultAdvisorAvatar(domain));
  const hasImage = !!resolvedAvatar && imgState !== "error";

  const handleError = useCallback(() => {
    if (retries < MAX_RETRIES) {
      const delay = RETRY_DELAYS[retries] ?? 3000;
      setTimeout(() => setRetries((r) => r + 1), delay);
    } else {
      setImgState("error");
      logPortraitFailure({
        domain,
        advisor_id: advisorId,
        url: resolvedAvatar,
        error_type: "load_exhausted",
        retry_count: MAX_RETRIES,
      });
    }
  }, [retries, domain, advisorId, resolvedAvatar]);

  const handleRetry = useCallback(() => {
    setRetries(0);
    setImgState("loading");
  }, []);

  // Build cache-busted src for retries
  const imgSrc = resolvedAvatar
    ? retries > 0 ? `${resolvedAvatar}${resolvedAvatar.includes("?") ? "&" : "?"}r=${retries}` : resolvedAvatar
    : null;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative">
        {hasImage && imgSrc ? (
          <div className={cn("rounded-full p-[2px] bg-gradient-to-br shadow-sm", config.gradient, s.container)}>
            {imgState === "loading" && (
              <Skeleton className="absolute inset-[2px] rounded-full z-10" />
            )}
            <img
              src={imgSrc}
              alt={name || config.label}
              className={cn(
                "rounded-full object-cover w-full h-full bg-card transition-opacity duration-300",
                imgState === "loaded" ? "opacity-100" : "opacity-0"
              )}
              onLoad={() => setImgState("loaded")}
              onError={handleError}
              loading="lazy"
              decoding="async"
            />
          </div>
        ) : imgState === "error" ? (
          <button
            onClick={handleRetry}
            className={cn(
              "flex items-center justify-center rounded-full bg-gradient-to-br shadow-sm group cursor-pointer",
              s.container, config.gradient
            )}
            title="Retry loading avatar"
          >
            <RefreshCw className={cn(s.icon, "text-white/70 group-hover:text-white transition-colors")} strokeWidth={2} />
          </button>
        ) : (
          <div className={cn(
            "flex items-center justify-center rounded-full bg-gradient-to-br shadow-sm",
            s.container, config.gradient
          )}>
            <Icon className={cn(s.icon, "text-white")} strokeWidth={2} />
          </div>
        )}
        {status && (
          <div className={cn(
            "absolute rounded-full border-2 border-card",
            s.dot, statusColors[status]
          )} />
        )}
      </div>
      {showLabel && (
        <div className="min-w-0">
          <p className="text-[12px] font-semibold text-foreground truncate">{name || config.label}</p>
          {confidence !== undefined && (
            <p className="text-[10px] text-muted-foreground">{confidence}% confidence</p>
          )}
        </div>
      )}
    </div>
  );
};
