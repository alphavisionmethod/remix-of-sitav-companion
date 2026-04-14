// ═══════════════════════════════════════════════════════════════
// SITA OS — Hold-Key Command Overlay
// Hold Alt/Option for 300ms → instant translucent action map
// Page-aware contextual actions with keyboard shortcuts
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { openBusinessModule } from "@/lib/business-launcher";
import { openFinanceModule } from "@/lib/finance-launcher";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Home, BarChart3, DollarSign, Calendar, FolderOpen,
  Settings, Search, Layers, Layout, Maximize2,
  ArrowLeft, ArrowRight, Command, Globe, Zap,
  FileText, Users, BriefcaseBusiness, Bell
} from "lucide-react";

interface ActionItem {
  id: string;
  label: string;
  shortcut?: string;
  icon: React.ElementType;
  action: () => void;
  category: "navigate" | "window" | "system";
}

export function HoldKeyOverlay() {
  const [isOpen, setIsOpen] = useState(false);
  const holdTimer = useRef<ReturnType<typeof setTimeout>>();
  const isHolding = useRef(false);
  const location = useLocation();
  const navigate = useNavigate();

  const getContextualActions = useCallback((): ActionItem[] => {
    const segment = location.pathname.split("/").filter(Boolean)[0] || "home";

    const globalNav: ActionItem[] = [
      { id: "home", label: "Desktop", shortcut: "⌘H", icon: Home, action: () => navigate("/"), category: "navigate" },
      { id: "pulse", label: "Daily Pulse", shortcut: "⌘1", icon: Zap, action: () => navigate("/pulse"), category: "navigate" },
      { id: "business", label: "Business", shortcut: "⌘2", icon: BriefcaseBusiness, action: () => openBusinessModule("crm-home"), category: "navigate" },
      { id: "money", label: "Finance", shortcut: "⌘3", icon: DollarSign, action: () => openFinanceModule("overview"), category: "navigate" },
      { id: "calendar", label: "Calendar", shortcut: "⌘4", icon: Calendar, action: () => navigate("/calendar"), category: "navigate" },
      { id: "files", label: "Files", shortcut: "⌘5", icon: FolderOpen, action: () => navigate("/files"), category: "navigate" },
    ];

    const systemActions: ActionItem[] = [
      { id: "search", label: "Search", shortcut: "⌘K", icon: Search, action: () => {}, category: "system" },
      { id: "settings", label: "Settings", shortcut: "⌘,", icon: Settings, action: () => navigate("/settings"), category: "system" },
      { id: "flowspace", label: "FlowSpace", shortcut: "F3", icon: Layers, action: () => {}, category: "system" },
      { id: "notifications", label: "Notifications", shortcut: "⌘N", icon: Bell, action: () => {}, category: "system" },
    ];

    const windowActions: ActionItem[] = [
      { id: "tile-left", label: "Tile Left", shortcut: "⌃←", icon: ArrowLeft, action: () => {}, category: "window" },
      { id: "tile-right", label: "Tile Right", shortcut: "⌃→", icon: ArrowRight, action: () => {}, category: "window" },
      { id: "maximize", label: "Maximize", shortcut: "⌃↑", icon: Maximize2, action: () => {}, category: "window" },
      { id: "spatial", label: "Spatial View", shortcut: "F4", icon: Layout, action: () => {}, category: "window" },
    ];

    // Add page-specific actions
    const pageActions: ActionItem[] = [];
    if (segment === "money") {
      pageActions.push(
        { id: "accounts", label: "Accounts", icon: Globe, action: () => openFinanceModule("overview"), category: "navigate" },
        { id: "budget", label: "Budget", icon: BarChart3, action: () => openFinanceModule("budgets"), category: "navigate" },
      );
    } else if (segment === "business") {
      pageActions.push(
        { id: "leads", label: "Leads", icon: Users, action: () => openBusinessModule("leads"), category: "navigate" },
        { id: "invoices", label: "Invoices", icon: FileText, action: () => openBusinessModule("invoices"), category: "navigate" },
      );
    }

    return [...globalNav, ...pageActions, ...windowActions, ...systemActions];
  }, [location.pathname, navigate]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Alt" && !e.repeat && !isHolding.current) {
        isHolding.current = true;
        holdTimer.current = setTimeout(() => {
          setIsOpen(true);
        }, 300);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Alt") {
        isHolding.current = false;
        clearTimeout(holdTimer.current);
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
      clearTimeout(holdTimer.current);
    };
  }, []);

  const actions = getContextualActions();
  const categories = {
    navigate: actions.filter(a => a.category === "navigate"),
    window: actions.filter(a => a.category === "window"),
    system: actions.filter(a => a.category === "system"),
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[9998] flex items-center justify-center"
          style={{
            background: "hsl(0 0% 0% / 0.6)",
            backdropFilter: "blur(24px) saturate(1.4)",
            WebkitBackdropFilter: "blur(24px) saturate(1.4)",
          }}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="w-full max-w-2xl mx-4"
          >
            {/* Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[hsl(0_0%_100%/0.06)] border border-[hsl(0_0%_100%/0.08)] mb-2">
                <Command className="w-3.5 h-3.5 text-[hsl(var(--primary))]" />
                <span className="text-xs text-[hsl(0_0%_100%/0.6)] font-medium">Hold Alt — Action Map</span>
              </div>
            </div>

            {/* Action Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {Object.entries(categories).map(([cat, items]) => (
                <div key={cat}>
                  <h3 className="text-[10px] uppercase tracking-[0.15em] text-[hsl(0_0%_100%/0.25)] mb-2 px-1">
                    {cat === "navigate" ? "Navigate" : cat === "window" ? "Windows" : "System"}
                  </h3>
                  <div className="space-y-1">
                    {items.map(item => (
                      <button
                        key={item.id}
                        onClick={() => { item.action(); setIsOpen(false); }}
                        className={cn(
                          "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left",
                          "bg-[hsl(0_0%_100%/0.04)] hover:bg-[hsl(0_0%_100%/0.1)]",
                          "border border-transparent hover:border-[hsl(var(--primary)/0.3)]",
                          "transition-all duration-100 group"
                        )}
                      >
                        <item.icon className="w-3.5 h-3.5 text-[hsl(0_0%_100%/0.4)] group-hover:text-[hsl(var(--primary))]" />
                        <span className="text-xs text-[hsl(0_0%_100%/0.7)] flex-1">{item.label}</span>
                        {item.shortcut && (
                          <span className="text-[10px] text-[hsl(0_0%_100%/0.25)] font-mono">{item.shortcut}</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <p className="text-center text-[9px] text-[hsl(0_0%_100%/0.15)] mt-6 tracking-wide">
              Release Alt to dismiss · Click to execute
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
