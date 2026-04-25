// ═══════════════════════════════════════════════════════════════
// SITA OS — App Welcome Header
// Personalized, time-aware greetings with dynamic scenario metrics
// ═══════════════════════════════════════════════════════════════

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { founderScenario } from "@/lib/demo-scenarios/founder";
import { moneyScenario } from "@/lib/demo-scenarios/money";

type Domain = "business" | "finance" | "concierge" | "daily-pulse" | "crm" | "vault" | "health" | "ai-workforce" | "email" | "gallery";

interface AppWelcomeHeaderProps {
  domain: Domain;
  className?: string;
}

function getDynamicMetric(domain: Domain): string {
  switch (domain) {
    case "business": {
      const leads = founderScenario.data.leads;
      const newLeads = leads.filter(l => l.status === "new").length;
      const qualified = leads.filter(l => l.status === "qualified").length;
      const overdue = founderScenario.data.invoices.filter(i => i.status === "overdue").length;
      return `${newLeads} new leads · ${qualified} qualified · ${overdue} overdue invoice${overdue !== 1 ? "s" : ""}`;
    }
    case "finance": {
      const cf = moneyScenario.data.cashFlow;
      const overdueBills = moneyScenario.data.bills.filter(b => b.status === "overdue").length;
      return `${cf.safeToSpend} safe to spend · ${overdueBills} overdue bill${overdueBills !== 1 ? "s" : ""} · ${cf.runway} runway`;
    }
    case "concierge":
      return "2 errands completed · 4 remaining · 1 scheduled delivery";
    case "daily-pulse":
      return "All systems nominal · 5 actions suggested";
    case "crm": {
      const pipeline = founderScenario.data.leads;
      const totalValue = pipeline.reduce((s, l) => s + parseInt(l.value.replace(/[$,]/g, "")), 0);
      return `${pipeline.length} active deals · $${(totalValue / 1000).toFixed(1)}K weighted pipeline`;
    }
    case "vault":
      return "All documents secure · 1 item needs attention";
    case "health":
      return "Sleep: 7.5h · Steps: 8,240 · Next appointment: Thu";
    case "ai-workforce":
      return "6 advisors active · 12 tasks automated today";
    case "email":
      return "12 unread · 3 flagged · 1 needs reply";
    case "gallery":
      return "2,450 photos · 12 albums · Last sync: today";
    default:
      return "";
  }
}

const DOMAIN_CONFIG: Record<Domain, {
  greeting: (name: string) => string;
  accent: string;
  icon: string;
}> = {
  business: {
    greeting: (n) => `${n}, your business pulse`,
    accent: "from-primary/20 to-primary/5",
    icon: "💼",
  },
  finance: {
    greeting: (n) => `${n}, your finances at a glance`,
    accent: "from-[hsl(var(--sita-gold))]/20 to-[hsl(var(--sita-gold))]/5",
    icon: "💰",
  },
  concierge: {
    greeting: (n) => `${n}, here's your day`,
    accent: "from-[hsl(var(--trust-safe))]/20 to-[hsl(var(--trust-safe))]/5",
    icon: "🎯",
  },
  "daily-pulse": {
    greeting: (n) => `${n}, your daily briefing`,
    accent: "from-primary/15 to-transparent",
    icon: "⚡",
  },
  crm: {
    greeting: (n) => `${n}, your pipeline`,
    accent: "from-blue-500/15 to-transparent",
    icon: "📊",
  },
  vault: {
    greeting: (n) => `${n}, vault status`,
    accent: "from-amber-500/15 to-transparent",
    icon: "🔐",
  },
  health: {
    greeting: (n) => `${n}, wellness check`,
    accent: "from-emerald-500/15 to-transparent",
    icon: "❤️",
  },
  "ai-workforce": {
    greeting: (n) => `${n}, your AI team`,
    accent: "from-violet-500/15 to-transparent",
    icon: "🤖",
  },
  email: {
    greeting: (n) => `${n}, your inbox`,
    accent: "from-sky-500/15 to-transparent",
    icon: "📧",
  },
  gallery: {
    greeting: (n) => `${n}, your gallery`,
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
  const metric = useMemo(() => getDynamicMetric(domain), [domain]);

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
            {metric}
          </p>
        </div>
      </div>
    </motion.div>
  );
};
