// ═══════════════════════════════════════════════════════════════
// SITA OS — Unified Domain App Shell
// Configurable app shell for Business, Finance, Concierge
// With surface hierarchy + domain-paced motion
// ═══════════════════════════════════════════════════════════════

import { cn } from "@/lib/utils";
import { APP_MATERIALS, APP_SHADOWS } from "@/platform/design-system/app-window-system";
import { atmosphereToCSSVars, APP_TYPE } from "@/platform/design-system/sita-design-tokens";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { AppToolbar } from "./AppToolbar";
import { AppSidebarNav, type NavTabGroup } from "./AppSidebarNav";
import { DomainCommandPalette, type CommandItem } from "@/platform/sita/components/sita/domain-shared/DomainCommandPalette";
import { DomainMotionProvider, AppOpenCeremony } from "@/platform/sita/components/sita/motion/AppTransitions";
import { AppSurface } from "@/platform/sita/components/sita/surfaces/AppSurface";
import type { LucideIcon } from "lucide-react";

export type DomainId = "business" | "finance" | "concierge" | "files" | "trust";

export interface DomainConfig {
  id: DomainId;
  title: string;
  icon: LucideIcon;
  accentFrom: string;
  accentTo: string;
  statusLabel: string;
  version: string;
}

interface DomainAppShellProps {
  domain: DomainConfig;
  children: React.ReactNode;
  activePage: string;
  onNavigate: (key: string) => void;
  tabGroups: NavTabGroup[];
  toolbarActions?: React.ReactNode;
  commands?: CommandItem[];
}


/* ── Mobile Nav ── */
const MobileNav = ({ domain, tabGroups, activePage, onNavigate }: {
  domain: DomainConfig; tabGroups: NavTabGroup[]; activePage: string; onNavigate: (key: string) => void;
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const Icon = domain.icon;
  const activeLabel = tabGroups.flatMap(g => g.tabs).find(t => t.key === activePage)?.label ?? "Overview";

  return (
    <>
      <button onClick={() => setShowMenu(!showMenu)} className="flex items-center gap-2 px-3 py-2 text-[12px] font-medium text-foreground/80 bg-[hsl(0_0%_100%/0.05)] rounded-lg border border-[hsl(0_0%_100%/0.08)]">
        <Icon className={`h-3.5 w-3.5`} style={{ color: domain.accentFrom }} />
        {activeLabel}
        <ChevronDown className="h-3 w-3" />
      </button>
      <AnimatePresence>
        {showMenu && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="absolute top-full left-0 right-0 mt-1 z-50 bg-[hsl(0_0%_8%/0.95)] backdrop-blur-2xl border border-[hsl(0_0%_100%/0.1)] rounded-xl p-2 max-h-[60vh] overflow-y-auto">
            {tabGroups.map(group => (
              <div key={group.label} className="mb-2">
                <p className="text-[9px] uppercase tracking-[0.1em] text-[hsl(0_0%_50%)] px-2 py-1 font-semibold">{group.label}</p>
                {group.tabs.map(tab => {
                  const TabIcon = tab.icon;
                  return (
                    <button key={tab.key} onClick={() => { onNavigate(tab.key); setShowMenu(false); }}
                      className={cn("w-full text-left px-3 py-2 rounded-lg text-[12px] transition-colors flex items-center gap-2",
                        activePage === tab.key
                          ? "bg-[hsl(0_0%_100%/0.08)] font-medium text-foreground"
                          : "text-[hsl(0_0%_65%)] hover:bg-[hsl(0_0%_100%/0.05)]"
                      )}>
                      {TabIcon && <TabIcon className="h-3.5 w-3.5" />}
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

/* ── Main Shell ── */
export function DomainAppShell({ domain, children, activePage, onNavigate, tabGroups, toolbarActions, commands = [] }: DomainAppShellProps) {
  const isMobile = useIsMobile();
  const shouldReduceMotion = useReducedMotion();
  const Icon = domain.icon;
  const [cmdOpen, setCmdOpen] = useState(false);

  // Domain-scoped Cmd+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCmdOpen(o => !o);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Auto-generate nav commands from tab groups
  const allCommands: CommandItem[] = [
    ...tabGroups.flatMap(g => g.tabs.map(t => ({
      id: `nav-${t.key}`,
      label: `Go to ${t.label}`,
      section: g.label,
      icon: t.icon,
      onSelect: () => onNavigate(t.key),
      keywords: [t.label, t.key],
    }))),
    ...commands,
  ];

  // AppOpenCeremony: fire once per domain per session
  const [showCeremony] = useState(() => {
    const key = `sita-app-opened-${domain.id}`;
    if (shouldReduceMotion || sessionStorage.getItem(key)) return false;
    sessionStorage.setItem(key, "1");
    return true;
  });

  const shell = (
    <DomainMotionProvider domain={domain.id}>
      <div className={cn(
        "relative flex flex-col w-full h-full min-h-[calc(100vh-80px)] overflow-hidden",
        "rounded-[16px] border",
        APP_MATERIALS.windowBg.dark, APP_MATERIALS.windowBorder.dark, APP_SHADOWS.focused
      )}>
        {/* Command Palette */}
        <DomainCommandPalette domain={domain.id} commands={allCommands} isOpen={cmdOpen} onClose={() => setCmdOpen(false)} />

        {/* Mobile Nav (desktop title bar handled by FloatingWindow) */}
        {isMobile && (
          <div className="flex items-center gap-3 px-4 py-2 border-b border-[hsl(0_0%_100%/0.06)] shrink-0 relative">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{
                background: `linear-gradient(135deg, ${domain.accentFrom}, ${domain.accentTo})`,
              }}>
                <Icon className="h-3 w-3 text-[hsl(0_0%_100%/0.95)]" />
              </div>
              <span className={cn(APP_TYPE.title, "text-[hsl(0_0%_90%)]")}>{domain.title}</span>
            </div>
            <div className="ml-auto relative">
              <MobileNav domain={domain} tabGroups={tabGroups} activePage={activePage} onNavigate={onNavigate} />
            </div>
          </div>
        )}

        {/* Toolbar */}
        <AppToolbar domain={domain} toolbarActions={toolbarActions} />

        {/* Body: Sidebar (Surface 0) + Content (Surface 1) */}
        <div className="flex flex-1 overflow-hidden">
          {!isMobile && (
            <AppSidebarNav
              domain={domain}
              tabGroups={tabGroups}
              activePage={activePage}
              onNavigate={onNavigate}
            />
          )}
          <AppSurface level={0} className={cn(
            "flex-1 overflow-y-auto p-4 relative domain-edge-glow",
            domain.id === "business" && "domain-ambient-business",
            domain.id === "finance" && "domain-ambient-finance",
            domain.id === "concierge" && "domain-ambient-concierge",
            domain.id === "files" && "domain-ambient-files",
          )} style={{
            ...atmosphereToCSSVars(domain.id),
          } as React.CSSProperties}>
            {children}
          </AppSurface>
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between px-4 py-1.5 border-t border-[hsl(0_0%_100%/0.06)] shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: domain.accentFrom }} />
            <span className="text-[10px] text-[hsl(0_0%_50%)]">{domain.statusLabel}</span>
          </div>
          <span className="text-[10px] text-[hsl(0_0%_40%)]">{domain.version}</span>
        </div>
      </div>
    </DomainMotionProvider>
  );

  if (showCeremony) {
    return <AppOpenCeremony domain={domain.id}>{shell}</AppOpenCeremony>;
  }
  return shell;
}
