// ═══════════════════════════════════════════════════════════════
// Money OS — App Window Shell
// Native OS-grade window chrome with sidebar navigation
// ═══════════════════════════════════════════════════════════════

import { cn } from "@/lib/utils";
import { APP_MATERIALS, APP_SHADOWS, APP_COMPONENTS, APP_TYPE } from "@/platform/design-system/app-window-system";
import { DollarSign, ChevronDown, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface TabItem { key: string; label: string; count?: number; }
interface TabGroup { label: string; tabs: TabItem[]; }

interface MoneyAppShellProps {
  children: React.ReactNode;
  activePage: string;
  onNavigate: (key: string) => void;
  tabGroups: TabGroup[];
}

const SidebarGroup = ({ group, activePage, onNavigate, defaultOpen = true }: {
  group: TabGroup; activePage: string; onNavigate: (key: string) => void; defaultOpen?: boolean;
}) => {
  const [open, setOpen] = useState(defaultOpen);
  const hasActive = group.tabs.some((t) => t.key === activePage);

  return (
    <div className="mb-1">
      <button onClick={() => setOpen(!open)} className={cn(
        "flex items-center gap-1.5 w-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.08em]",
        "text-[hsl(0_0%_50%)] dark:text-[hsl(0_0%_55%)] hover:text-[hsl(0_0%_70%)] transition-colors"
      )}>
        {open ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        {group.label}
      </button>
      <AnimatePresence initial={false}>
        {(open || hasActive) && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.15 }} className="overflow-hidden">
            {group.tabs.map((tab) => {
              const isActive = activePage === tab.key;
              return (
                <button key={tab.key} onClick={() => onNavigate(tab.key)} className={cn(
                  APP_COMPONENTS.listItem.base, "w-full justify-between",
                  isActive ? APP_COMPONENTS.listItem.active : APP_COMPONENTS.listItem.inactive
                )}>
                  <span className="truncate">{tab.label}</span>
                  {tab.count != null && tab.count > 0 && (
                    <span className={cn("text-[10px] font-semibold rounded-full px-1.5 py-0.5 min-w-[18px] text-center",
                      isActive ? "bg-[hsl(152_55%_48%/0.2)] text-[hsl(152_55%_48%)]" : "bg-[hsl(0_0%_50%/0.12)] text-[hsl(0_0%_50%)]"
                    )}>{tab.count}</span>
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const MobileNav = ({ tabGroups, activePage, onNavigate }: { tabGroups: TabGroup[]; activePage: string; onNavigate: (key: string) => void; }) => {
  const [showMenu, setShowMenu] = useState(false);
  const activeLabel = tabGroups.flatMap((g) => g.tabs).find((t) => t.key === activePage)?.label ?? "Overview";

  return (
    <>
      <button onClick={() => setShowMenu(!showMenu)} className="flex items-center gap-2 px-3 py-2 text-[12px] font-medium text-foreground/80 bg-[hsl(0_0%_100%/0.05)] rounded-lg border border-[hsl(0_0%_100%/0.08)]">
        <DollarSign className="h-3.5 w-3.5 text-[hsl(152_55%_48%)]" />
        {activeLabel}
        <ChevronDown className="h-3 w-3" />
      </button>
      <AnimatePresence>
        {showMenu && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="absolute top-full left-0 right-0 mt-1 z-50 bg-[hsl(0_0%_8%/0.95)] backdrop-blur-2xl border border-[hsl(0_0%_100%/0.1)] rounded-xl p-2 max-h-[60vh] overflow-y-auto">
            {tabGroups.map((group) => (
              <div key={group.label} className="mb-2">
                <p className="text-[9px] uppercase tracking-[0.1em] text-[hsl(0_0%_50%)] px-2 py-1 font-semibold">{group.label}</p>
                {group.tabs.map((tab) => (
                  <button key={tab.key} onClick={() => { onNavigate(tab.key); setShowMenu(false); }}
                    className={cn("w-full text-left px-3 py-2 rounded-lg text-[12px] transition-colors",
                      activePage === tab.key ? "bg-[hsl(152_55%_48%/0.15)] text-[hsl(152_55%_60%)] font-medium" : "text-[hsl(0_0%_65%)] hover:bg-[hsl(0_0%_100%/0.05)]"
                    )}>
                    {tab.label}
                  </button>
                ))}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export function MoneyAppShell({ children, activePage, onNavigate, tabGroups }: MoneyAppShellProps) {
  const isMobile = useIsMobile();

  return (
    <div className={cn(
      "relative flex flex-col w-full h-full min-h-[calc(100vh-80px)] overflow-hidden",
      "rounded-[16px] border", APP_MATERIALS.windowBg.dark, APP_MATERIALS.windowBorder.dark, APP_SHADOWS.focused
    )}>
      {/* Mobile Nav (desktop title bar handled by FloatingWindow) */}
      {isMobile && (
        <div className="flex items-center gap-3 px-4 py-2 border-b border-[hsl(0_0%_100%/0.06)] shrink-0 relative">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-gradient-to-br from-[hsl(152_55%_48%)] to-[hsl(165_50%_42%)] flex items-center justify-center">
              <DollarSign className="h-3 w-3 text-[hsl(0_0%_100%/0.95)]" />
            </div>
            <span className={cn(APP_TYPE.title, "text-[hsl(0_0%_90%)]")}>Money OS</span>
          </div>
          <div className="ml-auto relative">
            <MobileNav tabGroups={tabGroups} activePage={activePage} onNavigate={onNavigate} />
          </div>
        </div>
      )}

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {!isMobile && (
          <div className={cn("w-[200px] shrink-0 border-r overflow-y-auto py-3", APP_MATERIALS.sidebarBg.dark, "border-[hsl(0_0%_100%/0.06)]")}>
            {tabGroups.map((group, i) => (
              <SidebarGroup key={group.label} group={group} activePage={activePage} onNavigate={onNavigate} defaultOpen={i < 2} />
            ))}
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-1.5 border-t border-[hsl(0_0%_100%/0.06)] shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[hsl(152_55%_48%)]" />
          <span className="text-[10px] text-[hsl(0_0%_50%)]">Finance Synced</span>
        </div>
        <span className="text-[10px] text-[hsl(0_0%_40%)]">Money OS v1.0</span>
      </div>
    </div>
  );
}
