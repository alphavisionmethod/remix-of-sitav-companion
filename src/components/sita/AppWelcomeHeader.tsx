// ═══════════════════════════════════════════════════════════════
// SITA OS — App Welcome Header
// Personalized, time-aware greetings with contextual metrics
// ═══════════════════════════════════════════════════════════════

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

type Domain = "business" | "finance" | "concierge" | "daily-pulse" | "crm" | "vault" | "health" | "ai-workforce" | "email" | "gallery";

interface AppWelcomeHeaderProps {
  domain: Domain;
  className?: string;
}

const DOMAIN_CONFIG: Record<Domain, {
  greeting: (name: string) => string;
  metric: string;
  accent: string;
  icon: string;
}> = {
  business: {
    greeting: (n) => `${n}, your business pulse`,
    metric: "3 leads need follow-up · 2 proposals pending",
    accent: "from-primary/20 to-primary/5",
    icon: "💼",
  },
  finance: {
    greeting: (n) => `${n}, your finances at a glance`,
    metric: "$8,240 safe to spend today · 2 bills due this week",
    accent: "from-[hsl(var(--sita-gold))]/20 to-[hsl(var(--sita-gold))]/5",
    icon: "💰",
  },
  concierge: {
    greeting: (n) => `${n}, here's your day`,
    metric: "2 errands completed · 4 remaining · 1 scheduled delivery",
    accent: "from-[hsl(var(--trust-safe))]/20 to-[hsl(var(--trust-safe))]/5",
    icon: "🎯",
  },
  "daily-pulse": {
    greeting: (n) => `${n}, your daily briefing`,
    metric: "All systems nominal · 5 actions suggested",
    accent: "from-primary/15 to-transparent",
    icon: "⚡",
  },
  crm: {
    greeting: (n) => `${n}, your pipeline`,
    metric: "7 active deals · $48.2K weighted pipeline",
    accent: "from-blue-500/15 to-transparent",
    icon: "📊",
  },
  vault: {
    greeting: (n) => `${n}, vault status`,
    metric: "All documents secure · 1 item needs attention",
    accent: "from-amber-500/15 to-transparent",
    icon: "🔐",
  },
  health: {
    greeting: (n) => `${n}, wellness check`,
    metric: "Sleep: 7.5h · Steps: 8,240 · Next appointment: Thu",
    accent: "from-emerald-500/15 to-transparent",
    icon: "❤️",
  },
  "ai-workforce": {
    greeting: (n) => `${n}, your AI team`,
    metric: "6 advisors active · 12 tasks automated today",
    accent: "from-violet-500/15 to-transparent",
    icon: "🤖",
  },
  email: {
    greeting: (n) => `${n}, your inbox`,
    metric: "12 unread · 3 flagged · 1 needs reply",
    accent: "from-sky-500/15 to-transparent",
    icon: "📧",
  },
  gallery: {
    greeting: (n) => `${n}, your gallery`,
    metric: "2,450 photos · 12 albums · Last sync: today",
    accent: "from-pink-500/15 to-transparent",
    icon: "🖼️",
  },
};

function getTimeGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export const AppWelcomeHeader = ({ domain, className }: AppWelcomeHeaderProps) => {
  const { user } = useAuth();
  const name = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "there";
  const config = DOMAIN_CONFIG[domain];
  const timeGreeting = useMemo(getTimeGreeting, []);

  if (!config) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "rounded-2xl bg-gradient-to-r p-4 mb-4 border border-border/30",
        config.accent,
        className
      )}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">{config.icon}</span>
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold text-foreground">
            {timeGreeting}, {config.greeting(name)}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-primary/60" />
            {config.metric}
          </p>
        </div>
      </div>
    </motion.div>
  );
};
