// ═══════════════════════════════════════════════════════════════
// SITA OS — Mobile Tab Selector (shared across Centers)
// Grouped dropdown with proper z-index, contrast, and touch targets
// ═══════════════════════════════════════════════════════════════

import { useState, useCallback, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TabGroup {
  label: string;
  tabs: { key: string; label: string }[];
}

interface MobileTabSelectorProps {
  active: string;
  onChange: (key: string) => void;
  tabGroups: TabGroup[];
  className?: string;
}

export const MobileTabSelector = ({
  active,
  onChange,
  tabGroups,
  className,
}: MobileTabSelectorProps) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const allTabs = tabGroups.flatMap((g) => g.tabs);
  const activeLabel = allTabs.find((t) => t.key === active)?.label ?? "Overview";

  const handleSelect = useCallback(
    (key: string) => {
      onChange(key);
      setOpen(false);
    },
    [onChange],
  );

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      {/* ── Trigger button — prominent, high contrast ── */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-xl px-4 py-3.5",
          "border-2 text-sm font-semibold touch-manipulation",
          "transition-colors duration-150",
          open
            ? "border-primary bg-primary/10 text-primary"
            : "border-border bg-card/80 text-foreground hover:border-primary/40",
        )}
      >
        <span className="truncate">{activeLabel}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 transition-transform duration-200",
            open ? "rotate-180 text-primary" : "text-muted-foreground",
          )}
        />
      </button>

      {/* ── Dropdown overlay + menu ── */}
      {open && (
        <>
          {/* Full-screen backdrop — z-[9998] to sit above everything */}
          <div
            className="fixed inset-0 z-[9998] bg-background/40 backdrop-blur-[2px]"
            onClick={() => setOpen(false)}
            aria-hidden
          />

          {/* Dropdown panel — z-[9999] */}
          <div
            role="listbox"
            aria-label="Page selector"
            className={cn(
              "absolute left-0 right-0 top-full z-[9999] mt-1.5",
              "max-h-[65vh] overflow-y-auto overscroll-contain",
              "rounded-xl border-2 border-primary/30 bg-card shadow-2xl shadow-black/30",
              "ring-1 ring-primary/10",
            )}
          >
            {tabGroups.map((group) => (
              <div key={group.label}>
                {/* Group header — sticky */}
                <div className="sticky top-0 z-10 bg-muted/95 backdrop-blur-sm px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b border-border/50">
                  {group.label}
                </div>

                {/* Tab buttons */}
                {group.tabs.map((t) => (
                  <button
                    key={t.key}
                    role="option"
                    aria-selected={active === t.key}
                    onClick={() => handleSelect(t.key)}
                    className={cn(
                      "w-full px-4 py-3.5 text-left text-sm transition-colors",
                      "touch-manipulation active:bg-primary/20",
                      "min-h-[48px] flex items-center", // 48px minimum touch target
                      active === t.key
                        ? "bg-primary/15 text-primary font-semibold border-l-2 border-primary"
                        : "text-foreground hover:bg-muted/60 border-l-2 border-transparent",
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
