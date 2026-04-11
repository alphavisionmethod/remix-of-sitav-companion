// ═══════════════════════════════════════════════════════════════
// SITA OS — Command Palette (Cmd+K)
// Global fuzzy search over apps, routes, actions, and advisors
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowRight, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppPlatform } from "@/contexts/AppPlatformContext";

interface CommandItem {
  id: string;
  label: string;
  sublabel?: string;
  icon: string;
  category: "app" | "navigate" | "action" | "advisor";
  action: () => void;
}

const ROUTES: { label: string; path: string; icon: string; sublabel: string }[] = [
  { label: "Daily Pulse", path: "/home", icon: "⚡", sublabel: "Your daily briefing" },
  { label: "Business Center", path: "/business", icon: "💼", sublabel: "Leads, invoices, CRM" },
  { label: "Money Center", path: "/money", icon: "💰", sublabel: "Finances & cash flow" },
  { label: "Concierge", path: "/concierge", icon: "🎯", sublabel: "Tasks & errands" },
  { label: "Boardroom", path: "/boardroom", icon: "🏛️", sublabel: "Strategic decisions" },
  { label: "Proof Center", path: "/proof", icon: "✅", sublabel: "Audit & compliance" },
  { label: "Settings", path: "/settings", icon: "⚙️", sublabel: "Preferences & config" },
  { label: "AI Workforce", path: "/ai-workforce", icon: "🤖", sublabel: "Your AI team" },
  { label: "App Store", path: "/app-store", icon: "🏪", sublabel: "Browse & install apps" },
  { label: "Website Builder", path: "/business/website-builder", icon: "🌐", sublabel: "Landing pages & forms" },
  { label: "Proposals & Contracts", path: "/business/proposals", icon: "📜", sublabel: "E-signatures & tracking" },
  { label: "Lead Recovery", path: "/business/lead-recovery", icon: "🔄", sublabel: "Winback campaigns" },
  { label: "Social Command", path: "/business/social", icon: "📱", sublabel: "Social media management" },
];

const ACTIONS: { label: string; icon: string; sublabel: string; action: string }[] = [
  { label: "Ask SITA Advisor", icon: "🧠", sublabel: "Get AI recommendations", action: "advisor" },
  { label: "Create New Lead", icon: "➕", sublabel: "Add to pipeline", action: "lead" },
  { label: "Send Invoice", icon: "📄", sublabel: "Bill a client", action: "invoice" },
  { label: "Schedule Task", icon: "📋", sublabel: "Add to concierge", action: "task" },
  { label: "Run Boardroom Session", icon: "🏛️", sublabel: "Start advisor council", action: "boardroom" },
];

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export const CommandPalette = ({ open, onClose }: CommandPaletteProps) => {
  const [query, setQuery] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const navigate = useNavigate();
  const { apps } = useAppPlatform();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const items = useMemo<CommandItem[]>(() => {
    const q = query.toLowerCase();
    const results: CommandItem[] = [];

    // Apps
    const installedApps = apps.filter(a => a.installStatus === "installed");
    installedApps.forEach(app => {
      if (!q || app.name.toLowerCase().includes(q) || app.tags.some(t => t.includes(q))) {
        results.push({
          id: `app-${app.id}`,
          label: app.name,
          sublabel: app.shortDescription,
          icon: app.icon,
          category: "app",
          action: () => {
            if (app.routePath) navigate(app.routePath);
            else if (app.externalUrl) window.open(app.externalUrl, "_blank", "noopener");
            onClose();
          },
        });
      }
    });

    // Routes
    ROUTES.forEach(r => {
      if (!q || r.label.toLowerCase().includes(q) || r.sublabel.toLowerCase().includes(q)) {
        results.push({
          id: `route-${r.path}`,
          label: r.label,
          sublabel: r.sublabel,
          icon: r.icon,
          category: "navigate",
          action: () => { navigate(r.path); onClose(); },
        });
      }
    });

    // Actions
    ACTIONS.forEach(a => {
      if (!q || a.label.toLowerCase().includes(q)) {
        results.push({
          id: `action-${a.action}`,
          label: a.label,
          sublabel: a.sublabel,
          icon: a.icon,
          category: "action",
          action: () => { onClose(); },
        });
      }
    });

    // Deduplicate by label
    const seen = new Set<string>();
    return results.filter(r => {
      if (seen.has(r.label)) return false;
      seen.add(r.label);
      return true;
    }).slice(0, 12);
  }, [query, apps, navigate, onClose]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIdx(i => Math.min(i + 1, items.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setSelectedIdx(i => Math.max(i - 1, 0)); }
    else if (e.key === "Enter" && items[selectedIdx]) { items[selectedIdx].action(); }
    else if (e.key === "Escape") { onClose(); }
  }, [items, selectedIdx, onClose]);

  const categoryLabel = (c: CommandItem["category"]) => {
    switch (c) {
      case "app": return "Apps";
      case "navigate": return "Navigate";
      case "action": return "Actions";
      case "advisor": return "Advisors";
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.97 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="w-full max-w-lg mx-4 rounded-2xl border border-border/50 bg-card/95 backdrop-blur-xl shadow-2xl overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Search input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border/30">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={e => { setQuery(e.target.value); setSelectedIdx(0); }}
              onKeyDown={handleKeyDown}
              placeholder="Search apps, navigate, run actions..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
            <kbd className="hidden sm:inline-flex text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-mono">ESC</kbd>
          </div>

          {/* Results */}
          <div className="max-h-[360px] overflow-y-auto p-1.5">
            {items.length === 0 && (
              <div className="py-8 text-center text-sm text-muted-foreground">
                <Sparkles className="h-5 w-5 mx-auto mb-2 opacity-40" />
                No results found
              </div>
            )}
            {items.map((item, idx) => (
              <button
                key={item.id}
                onClick={item.action}
                onMouseEnter={() => setSelectedIdx(idx)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors",
                  idx === selectedIdx ? "bg-primary/10 text-foreground" : "text-muted-foreground hover:bg-muted/50"
                )}
              >
                <span className="text-lg shrink-0">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.label}</p>
                  {item.sublabel && <p className="text-[11px] text-muted-foreground truncate">{item.sublabel}</p>}
                </div>
                <span className="text-[9px] font-medium text-muted-foreground/60 uppercase tracking-wider shrink-0">
                  {categoryLabel(item.category)}
                </span>
                {idx === selectedIdx && <ArrowRight className="h-3 w-3 text-primary shrink-0" />}
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-2 border-t border-border/20 text-[10px] text-muted-foreground/50">
            <span>↑↓ Navigate · ↵ Select · Esc Close</span>
            <span className="flex items-center gap-1"><Sparkles className="h-2.5 w-2.5" /> SITA Command</span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CommandPalette;
