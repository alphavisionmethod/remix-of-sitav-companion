// ═══════════════════════════════════════════════════════════════
// SITA OS — Domain-Scoped Command Palette
// App-level command palette that surfaces domain-relevant actions
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowRight, Command } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import type { DomainId } from "@/components/sita/shell/DomainAppShell";

export interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon?: LucideIcon;
  section: string;
  onSelect: () => void;
  keywords?: string[];
}

interface DomainCommandPaletteProps {
  domain: DomainId;
  commands: CommandItem[];
  isOpen: boolean;
  onClose: () => void;
}

const domainAccent: Record<DomainId, string> = {
  business: "hsl(265 55% 58%)",
  finance: "hsl(152 55% 48%)",
  concierge: "hsl(285 55% 55%)",
  files: "hsl(220 15% 55%)",
  trust: "hsl(35 75% 55%)",
};

export function DomainCommandPalette({ domain, commands, isOpen, onClose }: DomainCommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);

  const filtered = useMemo(() => {
    if (!query.trim()) return commands;
    const q = query.toLowerCase();
    return commands.filter(c =>
      c.label.toLowerCase().includes(q) ||
      c.description?.toLowerCase().includes(q) ||
      c.keywords?.some(k => k.toLowerCase().includes(q))
    );
  }, [commands, query]);

  const sections = useMemo(() => {
    const map = new Map<string, CommandItem[]>();
    filtered.forEach(c => {
      if (!map.has(c.section)) map.set(c.section, []);
      map.get(c.section)!.push(c);
    });
    return map;
  }, [filtered]);

  useEffect(() => { setSelectedIdx(0); }, [query]);
  useEffect(() => { if (isOpen) setQuery(""); }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIdx(i => Math.min(i + 1, filtered.length - 1)); }
      if (e.key === "ArrowUp") { e.preventDefault(); setSelectedIdx(i => Math.max(i - 1, 0)); }
      if (e.key === "Enter" && filtered[selectedIdx]) { filtered[selectedIdx].onSelect(); onClose(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, filtered, selectedIdx, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed z-[101] left-1/2 top-[20%] -translate-x-1/2 w-[90vw] max-w-[540px] rounded-2xl border border-[hsl(0_0%_100%/0.1)] bg-[hsl(0_0%_6%/0.98)] backdrop-blur-3xl shadow-2xl overflow-hidden"
            initial={{ opacity: 0, y: -16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.97 }}
            transition={{ duration: 0.15 }}
          >
            {/* Search Input */}
            <div className="flex items-center gap-2.5 px-4 py-3 border-b border-[hsl(0_0%_100%/0.06)]">
              <Search className="h-4 w-4 shrink-0" style={{ color: domainAccent[domain] }} />
              <input
                autoFocus
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={`Search ${domain} commands…`}
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
              />
              <kbd className="text-[9px] text-muted-foreground bg-[hsl(0_0%_100%/0.06)] rounded px-1.5 py-0.5 font-mono">ESC</kbd>
            </div>

            {/* Results */}
            <div className="max-h-[50vh] overflow-y-auto py-2">
              {filtered.length === 0 && (
                <p className="px-4 py-6 text-center text-sm text-muted-foreground">No matching commands</p>
              )}
              {Array.from(sections).map(([section, items]) => (
                <div key={section}>
                  <p className="px-4 py-1.5 text-[9px] uppercase tracking-[0.12em] text-muted-foreground font-semibold">{section}</p>
                  {items.map((cmd) => {
                    const globalIdx = filtered.indexOf(cmd);
                    const Icon = cmd.icon;
                    return (
                      <button
                        key={cmd.id}
                        onClick={() => { cmd.onSelect(); onClose(); }}
                        onMouseEnter={() => setSelectedIdx(globalIdx)}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors",
                          globalIdx === selectedIdx ? "bg-[hsl(0_0%_100%/0.06)]" : "hover:bg-[hsl(0_0%_100%/0.03)]"
                        )}
                      >
                        {Icon && <Icon className="h-4 w-4 shrink-0" style={{ color: domainAccent[domain] }} />}
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-medium text-foreground">{cmd.label}</p>
                          {cmd.description && <p className="text-[10px] text-muted-foreground truncate">{cmd.description}</p>}
                        </div>
                        <ArrowRight className="h-3 w-3 text-muted-foreground/40 shrink-0" />
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
