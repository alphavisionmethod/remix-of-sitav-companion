// ═══════════════════════════════════════════════════════════════
// SITA OS — App Sidebar Navigation
// Icon-enhanced sidebar with badges, groups, active accent pill
// ═══════════════════════════════════════════════════════════════

import { cn } from "@/lib/utils";
import { APP_MATERIALS } from "@/platform/design-system/app-window-system";
import { ChevronDown, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import type { DomainConfig } from "./DomainAppShell";

export interface NavTabItem {
  key: string;
  label: string;
  icon?: LucideIcon;
  count?: number;
  countSeverity?: "normal" | "warning" | "critical";
}

export interface NavTabGroup {
  label: string;
  tabs: NavTabItem[];
}

interface AppSidebarNavProps {
  domain: DomainConfig;
  tabGroups: NavTabGroup[];
  activePage: string;
  onNavigate: (key: string) => void;
}

const SidebarGroup = ({ group, activePage, onNavigate, domain, defaultOpen }: {
  group: NavTabGroup; activePage: string; onNavigate: (key: string) => void;
  domain: DomainConfig; defaultOpen: boolean;
}) => {
  const [open, setOpen] = useState(defaultOpen);
  const hasActive = group.tabs.some(t => t.key === activePage);
  const groupCount = group.tabs.reduce((s, t) => s + (t.count || 0), 0);

  return (
    <div className="mb-0.5">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-1.5 w-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.08em]",
          "text-[hsl(0_0%_50%)] hover:text-[hsl(0_0%_70%)] transition-colors"
        )}
      >
        {open ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        <span className="flex-1 text-left">{group.label}</span>
        {groupCount > 0 && !open && (
          <span className="text-[9px] text-[hsl(0_0%_45%)] bg-[hsl(0_0%_100%/0.06)] rounded-full px-1.5 py-0.5 min-w-[16px] text-center">
            {groupCount}
          </span>
        )}
      </button>
      <AnimatePresence initial={false}>
        {(open || hasActive) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            {group.tabs.map(tab => {
              const isActive = activePage === tab.key;
              const TabIcon = tab.icon;
              const severityColor = tab.countSeverity === "critical"
                ? "bg-[hsl(0_70%_55%/0.2)] text-[hsl(0_70%_55%)]"
                : tab.countSeverity === "warning"
                  ? "bg-[hsl(38_85%_55%/0.2)] text-[hsl(38_85%_55%)]"
                  : isActive
                    ? "bg-[hsl(0_0%_100%/0.12)] text-[hsl(0_0%_80%)]"
                    : "bg-[hsl(0_0%_50%/0.12)] text-[hsl(0_0%_50%)]";

              return (
                <button
                  key={tab.key}
                  onClick={() => onNavigate(tab.key)}
                  className={cn(
                    "flex items-center gap-2 w-full px-3 py-[7px] rounded-lg text-[12px] transition-all duration-100 cursor-default",
                    isActive
                      ? "font-medium"
                      : "text-[hsl(0_0%_65%)] hover:bg-[hsl(0_0%_100%/0.06)]"
                  )}
                  style={isActive ? {
                    background: `linear-gradient(135deg, ${domain.accentFrom}18, ${domain.accentTo}10)`,
                    color: domain.accentFrom,
                  } : undefined}
                >
                  {TabIcon && (
                    <TabIcon className={cn("h-3.5 w-3.5 shrink-0", isActive ? "" : "text-[hsl(0_0%_50%)]")}
                      style={isActive ? { color: domain.accentFrom } : undefined}
                    />
                  )}
                  <span className="truncate flex-1 text-left">{tab.label}</span>
                  {tab.count != null && tab.count > 0 && (
                    <span className={cn(
                      "text-[10px] font-semibold rounded-full px-1.5 py-0.5 min-w-[18px] text-center",
                      severityColor
                    )}>
                      {tab.count}
                    </span>
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

export function AppSidebarNav({ domain, tabGroups, activePage, onNavigate }: AppSidebarNavProps) {
  return (
    <div className={cn(
      "w-[210px] shrink-0 border-r overflow-y-auto py-2",
      APP_MATERIALS.sidebarBg.dark,
      "border-[hsl(0_0%_100%/0.06)]"
    )}>
      {tabGroups.map((group, i) => (
        <SidebarGroup
          key={group.label}
          group={group}
          activePage={activePage}
          onNavigate={onNavigate}
          domain={domain}
          defaultOpen={i < 2}
        />
      ))}
    </div>
  );
}
