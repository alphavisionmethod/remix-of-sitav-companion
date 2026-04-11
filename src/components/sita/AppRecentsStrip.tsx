// ═══════════════════════════════════════════════════════════════
// SITA OS — App Recents Strip
// "Continue where you left off" — cross-app continuity
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface RecentEntry {
  route: string;
  label: string;
  domain: string;
  icon: string;
  timestamp: number;
}

const STORAGE_KEY = "sita-app-recents";
const MAX_RECENTS = 5;

// Pretty labels for known routes
const ROUTE_LABELS: Record<string, { label: string; domain: string; icon: string }> = {
  "/daily-pulse": { label: "Daily Pulse", domain: "core", icon: "⚡" },
  "/business": { label: "Business Center", domain: "business", icon: "💼" },
  "/money": { label: "Money Center", domain: "finance", icon: "💰" },
  "/concierge": { label: "Concierge", domain: "concierge", icon: "🎯" },
  "/crm": { label: "CRM", domain: "business", icon: "📊" },
  "/vault": { label: "Vault", domain: "security", icon: "🔐" },
  "/email": { label: "Email", domain: "communication", icon: "📧" },
  "/gallery": { label: "Gallery", domain: "media", icon: "🖼️" },
  "/health": { label: "Health", domain: "health", icon: "❤️" },
  "/ai-workforce": { label: "AI Workforce", domain: "ai", icon: "🤖" },
  "/boardroom": { label: "Boardroom", domain: "business", icon: "🏛️" },
  "/app-store": { label: "App Store", domain: "system", icon: "🏪" },
};

function getRecents(): RecentEntry[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch { return []; }
}

function addRecent(entry: RecentEntry) {
  const list = getRecents().filter(r => r.route !== entry.route);
  list.unshift(entry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, MAX_RECENTS)));
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export const AppRecentsStrip = ({ className }: { className?: string }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [recents, setRecents] = useState<RecentEntry[]>([]);

  // Track current route
  useEffect(() => {
    const path = location.pathname;
    const info = ROUTE_LABELS[path];
    if (info && path !== "/") {
      addRecent({
        route: path,
        label: info.label,
        domain: info.domain,
        icon: info.icon,
        timestamp: Date.now(),
      });
    }
    setRecents(getRecents());
  }, [location.pathname]);

  if (recents.length === 0) return null;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-1.5">
        <Clock className="h-3 w-3 text-muted-foreground" />
        <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Continue</h3>
      </div>
      <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-1">
        {recents.filter(r => r.route !== location.pathname).slice(0, 4).map((r, i) => (
          <motion.button
            key={r.route}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => navigate(r.route)}
            className="shrink-0 flex items-center gap-2 rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm px-3 py-2 hover:bg-secondary/50 transition-colors group"
          >
            <span className="text-sm">{r.icon}</span>
            <div className="text-left">
              <p className="text-[11px] font-medium text-foreground">{r.label}</p>
              <p className="text-[9px] text-muted-foreground">{timeAgo(r.timestamp)}</p>
            </div>
            <ArrowRight className="h-3 w-3 text-muted-foreground/0 group-hover:text-muted-foreground transition-colors" />
          </motion.button>
        ))}
      </div>
    </div>
  );
};
