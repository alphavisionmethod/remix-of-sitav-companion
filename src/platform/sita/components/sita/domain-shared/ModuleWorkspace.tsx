// ═══════════════════════════════════════════════════════════════
// SITA OS — Module Workspace Layout
// Deep list → detail → action flow for any module
// ═══════════════════════════════════════════════════════════════

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ChevronRight, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { DomainId } from "@/components/sita/shell/DomainAppShell";

export interface ModuleBreadcrumbItem {
  label: string;
  onClick?: () => void;
}

interface ModuleWorkspaceProps {
  domain: DomainId;
  title: string;
  icon: LucideIcon;
  breadcrumbs?: ModuleBreadcrumbItem[];
  /** Left list panel */
  list: React.ReactNode;
  /** Right detail panel — shown when an item is selected */
  detail?: React.ReactNode;
  /** Top toolbar actions */
  actions?: React.ReactNode;
  /** Optional top KPI strip */
  kpiStrip?: React.ReactNode;
  /** Optional advisor panel below detail */
  advisor?: React.ReactNode;
  /** Whether detail is active (for mobile slide) */
  detailActive?: boolean;
  onCloseDetail?: () => void;
  className?: string;
}

const domainAccent: Record<DomainId, string> = {
  business: "hsl(265 55% 58%)",
  finance: "hsl(152 55% 48%)",
  concierge: "hsl(285 55% 55%)",
  files: "hsl(220 15% 55%)",
  trust: "hsl(35 75% 55%)",
};

export function ModuleBreadcrumb({ items, domain }: { items: ModuleBreadcrumbItem[]; domain: DomainId }) {
  return (
    <nav className="flex items-center gap-1 text-[11px] mb-3">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <ChevronRight className="h-3 w-3 text-muted-foreground/50" />}
          {item.onClick ? (
            <button onClick={item.onClick} className="text-muted-foreground hover:text-foreground transition-colors">
              {item.label}
            </button>
          ) : (
            <span className="font-medium" style={{ color: domainAccent[domain] }}>{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

export function ModuleWorkspace({
  domain, title, icon: Icon, breadcrumbs, list, detail, actions, kpiStrip, advisor,
  detailActive, onCloseDetail, className,
}: ModuleWorkspaceProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${domainAccent[domain]}, ${domainAccent[domain]}90)` }}>
            <Icon className="h-4 w-4 text-[hsl(0_0%_100%/0.95)]" />
          </div>
          <div>
            <h2 className="font-display text-lg font-bold text-foreground">{title}</h2>
            {breadcrumbs && <ModuleBreadcrumb items={breadcrumbs} domain={domain} />}
          </div>
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>

      {/* KPI Strip */}
      {kpiStrip && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          {kpiStrip}
        </motion.div>
      )}

      {/* Main Grid: List + Detail */}
      <div className="grid gap-4 lg:grid-cols-5">
        <div className={cn("lg:col-span-3 space-y-2", detail && detailActive && "hidden lg:block")}>
          {list}
        </div>

        <AnimatePresence mode="wait">
          {detail && (
            <motion.div
              key="detail"
              className="lg:col-span-2 space-y-4"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.2 }}
            >
              {/* Mobile close */}
              {onCloseDetail && (
                <button onClick={onCloseDetail} className="lg:hidden flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                  <ChevronRight className="h-3 w-3 rotate-180" /> Back to list
                </button>
              )}
              {detail}
              {advisor}
            </motion.div>
          )}
        </AnimatePresence>

        {!detail && advisor && (
          <div className="lg:col-span-2">{advisor}</div>
        )}
      </div>
    </div>
  );
}
