import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { AdvisorAvatar } from "@/components/sita/primitives/AdvisorAvatar";
import { getDefaultAdvisorAvatar } from "@/lib/advisors/advisor-avatar-assets";

type AdvisorDomain = "business" | "money" | "concierge" | "family" | "growth" | "trust" | "opportunity" | "recovery" | "boardroom" | "general";

interface AdvisorPortraitProps {
  domain: AdvisorDomain;
  name?: string;
  avatarUrl?: string | null;
  status?: "active" | "thinking" | "idle" | "offline";
  speaking?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const domainGradients: Record<AdvisorDomain, string> = {
  money: "from-emerald-500 to-emerald-300",
  business: "from-purple-600 to-purple-400",
  concierge: "from-amber-500 to-amber-300",
  growth: "from-blue-500 to-cyan-400",
  trust: "from-teal-500 to-teal-300",
  opportunity: "from-orange-500 to-yellow-400",
  recovery: "from-slate-500 to-slate-400",
  boardroom: "from-indigo-600 to-purple-500",
  family: "from-rose-500 to-pink-400",
  general: "from-purple-500 to-amber-400",
};

const sizes = {
  sm: { container: "h-8 w-8", ring: "ring-2", speaking: "ring-[3px]" },
  md: { container: "h-12 w-12", ring: "ring-2", speaking: "ring-[3px]" },
  lg: { container: "h-20 w-20", ring: "ring-[3px]", speaking: "ring-4" },
  xl: { container: "h-[120px] w-[120px]", ring: "ring-4", speaking: "ring-[5px]" },
};

export const AdvisorPortrait = ({
  domain,
  name,
  avatarUrl,
  status = "active",
  speaking = false,
  size = "md",
  className,
}: AdvisorPortraitProps) => {
  const [imgError, setImgError] = useState(false);
  const s = sizes[size];
  const gradient = domainGradients[domain];
  const resolvedUrl = avatarUrl || getDefaultAdvisorAvatar(domain);

  // If no avatar URL and no default, fall back to icon avatar
  if (!resolvedUrl || imgError) {
    return (
      <div className={cn("relative", className)}>
        <AdvisorAvatar domain={domain} name={name} status={status} size={size === "xl" ? "lg" : size === "lg" ? "lg" : size} />
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
    <div className={cn("relative", className)}>
      {/* Gradient border ring */}
      <div className={cn("rounded-full p-[2px] bg-gradient-to-br", gradient, s.container)}>
      <motion.img
          src={resolvedUrl!}
          alt={name || "Advisor"}
          className={cn("rounded-full object-cover w-full h-full bg-card")}
          onError={() => setImgError(true)}
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
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
