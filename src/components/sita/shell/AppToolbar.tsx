// ═══════════════════════════════════════════════════════════════
// SITA OS — App-Level Toolbar
// Domain-specific quick actions, search hint, density control
// ═══════════════════════════════════════════════════════════════

import { Search, Command } from "lucide-react";
import { APP_CHROME } from "@/platform/design-system/app-window-system";
import type { DomainConfig } from "./DomainAppShell";

interface AppToolbarProps {
  domain: DomainConfig;
  toolbarActions?: React.ReactNode;
}

const domainSearchHints: Record<string, string> = {
  business: "Search leads, customers, invoices…",
  finance: "Search bills, accounts, transactions…",
  concierge: "Search tasks, events, errands…",
};

export function AppToolbar({ domain, toolbarActions }: AppToolbarProps) {
  return (
    <div
      className="flex items-center gap-2 px-4 border-b border-[hsl(0_0%_100%/0.04)] shrink-0"
      style={{ height: APP_CHROME.toolbarHeight }}
    >
      {/* Search hint */}
      <div className="flex items-center gap-1.5 flex-1 min-w-0">
        <Search className="h-3 w-3 text-[hsl(0_0%_45%)] shrink-0" />
        <span className="text-[11px] text-[hsl(0_0%_40%)] truncate">
          {domainSearchHints[domain.id] || "Search…"}
        </span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 ml-1 text-[9px] text-[hsl(0_0%_40%)] bg-[hsl(0_0%_100%/0.06)] rounded px-1.5 py-0.5 font-mono">
          <Command className="h-2.5 w-2.5" />K
        </kbd>
      </div>

      {/* Domain-specific actions */}
      {toolbarActions && (
        <div className="flex items-center gap-1.5 shrink-0">
          {toolbarActions}
        </div>
      )}
    </div>
  );
}
