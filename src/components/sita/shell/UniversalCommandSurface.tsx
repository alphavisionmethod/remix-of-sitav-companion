// ═══════════════════════════════════════════════════════════════
// SITA OS — Universal Command Surface
// The single most important interaction primitive in the system
// Combines: command, ask, search, navigate, execute, simulate,
// review, explain, and capture
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, ArrowRight, X, Sparkles, ChevronRight,
  Plus, FileText, UserPlus, CalendarPlus, Phone, FileUp,
  Home, Briefcase, DollarSign, Headphones, BarChart3,
  FolderOpen, CheckCircle, Settings, Shield, Users,
  Brain, Target, Activity, Receipt, Inbox, Eye,
  Zap, Hash, MessageSquare, Clock, AlertTriangle,
  Bell, Workflow, BookOpen, Layout,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";

// ── Search Index ─────────────────────────────────────────────

interface CommandItem {
  id: string;
  label: string;
  sublabel?: string;
  icon: React.ElementType;
  path?: string;
  category: "action" | "navigate" | "advisor" | "entity" | "capture" | "system";
  domain?: string;
  keywords: string[];
  riskLevel?: "low" | "medium" | "high";
}

const COMMAND_INDEX: CommandItem[] = [
  // ── Quick Captures ──
  { id: "cap-note", label: "Quick note", sublabel: "Capture a thought", icon: FileText, category: "capture", keywords: ["note", "capture", "write", "remember"] },
  { id: "cap-task", label: "Add task", sublabel: "Create a new task", icon: Target, category: "capture", keywords: ["task", "todo", "add", "create"] },
  { id: "cap-lead", label: "New lead", sublabel: "Add a business lead", icon: UserPlus, path: "/business?action=new-lead", category: "capture", domain: "business", keywords: ["lead", "new", "prospect", "add"] },
  { id: "cap-reminder", label: "Set reminder", sublabel: "Don't forget", icon: Bell, category: "capture", keywords: ["remind", "reminder", "alert", "later"] },
  { id: "cap-upload", label: "Upload file", sublabel: "Import a document", icon: FileUp, path: "/files?action=upload", category: "capture", keywords: ["upload", "file", "document", "import"] },

  // ── Quick Actions ──
  { id: "act-boardroom", label: "Enter Boardroom", sublabel: "Full operating briefing", icon: BarChart3, path: "/boardroom", category: "action", keywords: ["boardroom", "review", "briefing"] },
  { id: "act-approvals", label: "Review approvals", sublabel: "Pending decisions", icon: CheckCircle, path: "/approvals", category: "action", keywords: ["approvals", "pending", "review", "decisions"] },
  { id: "act-day-review", label: "Start day review", sublabel: "Morning pulse", icon: Sparkles, path: "/", category: "action", keywords: ["day", "review", "morning", "pulse", "start"] },
  { id: "act-invoice", label: "Create invoice", sublabel: "Business billing", icon: FileText, path: "/business?action=new-invoice", category: "action", domain: "business", keywords: ["invoice", "create", "bill", "billing"], riskLevel: "medium" },
  { id: "act-callback", label: "Schedule callback", sublabel: "Business follow-up", icon: Phone, path: "/business?action=callback", category: "action", domain: "business", keywords: ["callback", "call", "schedule", "follow"] },
  { id: "act-appointment", label: "Schedule appointment", sublabel: "Calendar", icon: CalendarPlus, path: "/concierge?action=schedule", category: "action", keywords: ["appointment", "schedule", "meeting", "calendar"] },

  // ── Navigation ──
  { id: "nav-home", label: "Home", sublabel: "Desktop surface", icon: Home, path: "/", category: "navigate", keywords: ["home", "desktop", "overview"] },
  { id: "nav-business", label: "Business Center", sublabel: "Leads, customers, pipeline", icon: Briefcase, path: "/business", category: "navigate", domain: "business", keywords: ["business", "crm", "leads", "customers", "sales"] },
  { id: "nav-money", label: "Money Center", sublabel: "Accounts, bills, reserves", icon: DollarSign, path: "/money", category: "navigate", domain: "finance", keywords: ["money", "finance", "bills", "accounts", "budget"] },
  { id: "nav-concierge", label: "Concierge", sublabel: "Household, calendar, tasks", icon: Headphones, path: "/concierge", category: "navigate", domain: "concierge", keywords: ["concierge", "household", "calendar", "tasks"] },
  { id: "nav-files", label: "Files", sublabel: "Documents & knowledge", icon: FolderOpen, path: "/files", category: "navigate", keywords: ["files", "documents", "knowledge"] },
  { id: "nav-workflows", label: "Workflows", sublabel: "Actions & automations", icon: Workflow, path: "/workflows", category: "navigate", keywords: ["workflows", "automation", "actions"] },
  { id: "nav-proof", label: "Proof Center", sublabel: "Receipts & audit trail", icon: Receipt, path: "/proof", category: "navigate", keywords: ["proof", "receipts", "audit"] },
  { id: "nav-boardroom", label: "Boardroom", sublabel: "Reviews & planning", icon: BarChart3, path: "/boardroom", category: "navigate", keywords: ["boardroom", "review", "planning"] },
  { id: "nav-settings", label: "Settings", sublabel: "Trust & preferences", icon: Settings, path: "/settings", category: "navigate", keywords: ["settings", "preferences", "trust", "config"] },
  { id: "nav-mission", label: "Mission Control", sublabel: "System health & agents", icon: Shield, path: "/mission-control", category: "navigate", keywords: ["mission", "control", "system", "agents"] },
  { id: "nav-inbox", label: "Inbox Capture", sublabel: "Incoming items", icon: Inbox, path: "/inbox", category: "navigate", keywords: ["inbox", "capture", "incoming"] },
  { id: "nav-search", label: "Search Fabric", sublabel: "Cross-domain search", icon: Search, path: "/search", category: "navigate", keywords: ["search", "find", "cross-domain"] },

  // ── Advisors ──
  { id: "adv-business", label: "Business Advisor", sublabel: "Pipeline & revenue guidance", icon: Briefcase, path: "/advisors/business-advisor", category: "advisor", domain: "business", keywords: ["business", "advisor", "revenue", "pipeline"] },
  { id: "adv-money", label: "Money Advisor", sublabel: "Cashflow & reserve guidance", icon: DollarSign, path: "/advisors/money-advisor", category: "advisor", domain: "finance", keywords: ["money", "advisor", "cashflow", "budget"] },
  { id: "adv-concierge", label: "Concierge Advisor", sublabel: "Tasks & scheduling help", icon: Headphones, path: "/advisors/concierge-advisor", category: "advisor", domain: "concierge", keywords: ["concierge", "advisor", "tasks"] },
  { id: "adv-strategy", label: "Strategy Advisor", sublabel: "Cross-domain synthesis", icon: Brain, path: "/advisors/strategy-advisor", category: "advisor", keywords: ["strategy", "advisor", "cross-domain"] },

  // ── System ──
  { id: "sys-agents", label: "Agent Control Panel", sublabel: "Fleet management", icon: Shield, path: "/mission-control?tab=control-panel", category: "system", keywords: ["agents", "control", "fleet"] },
  { id: "sys-audit", label: "Audit Log", sublabel: "Compliance trail", icon: FileText, path: "/mission-control?tab=audit-log", category: "system", keywords: ["audit", "log", "compliance"] },
];

const CATEGORY_CONFIG: Record<string, { label: string; color: string }> = {
  capture: { label: "Capture", color: "bg-[hsl(var(--sita-gold))]/10 text-[hsl(var(--sita-gold))]" },
  action: { label: "Actions", color: "bg-primary/10 text-primary" },
  navigate: { label: "Navigate", color: "bg-secondary text-muted-foreground" },
  advisor: { label: "Advisors", color: "bg-primary/10 text-primary" },
  entity: { label: "Entities", color: "bg-[hsl(var(--trust-safe))]/10 text-[hsl(var(--trust-safe))]" },
  system: { label: "System", color: "bg-secondary text-muted-foreground" },
};

const CATEGORY_ORDER = ["capture", "action", "navigate", "advisor", "system"];

// ── Quick Capture Patterns ───────────────────────────────────

function detectCapture(query: string): { type: string; value: string } | null {
  const lower = query.toLowerCase().trim();
  if (lower.startsWith("note:") || lower.startsWith("note ")) return { type: "note", value: query.slice(5).trim() };
  if (lower.startsWith("remind me") || lower.startsWith("reminder:")) return { type: "reminder", value: query.replace(/^remind(er)?:?\s*(me\s+)?/i, "").trim() };
  if (lower.startsWith("task:") || lower.startsWith("todo:")) return { type: "task", value: query.slice(5).trim() };
  if (lower.startsWith("new lead") || lower.startsWith("lead:")) return { type: "lead", value: query.replace(/^(new\s+)?lead:?\s*/i, "").trim() };
  return null;
}

// ── Context Suggestions ──────────────────────────────────────

function getContextSuggestions(): CommandItem[] {
  const hour = new Date().getHours();
  if (hour < 12) {
    return COMMAND_INDEX.filter(i => ["act-day-review", "act-boardroom", "act-approvals"].includes(i.id));
  }
  if (hour < 17) {
    return COMMAND_INDEX.filter(i => ["act-callback", "nav-business", "act-approvals"].includes(i.id));
  }
  return COMMAND_INDEX.filter(i => ["nav-boardroom", "cap-note", "nav-money"].includes(i.id));
}

// ── Component ────────────────────────────────────────────────

interface UniversalCommandSurfaceProps {
  open: boolean;
  onClose: () => void;
}

export function UniversalCommandSurface({ open, onClose }: UniversalCommandSurfaceProps) {
  const [query, setQuery] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [mode, setMode] = useState<"search" | "preview" | "capture">("search");
  const [captureData, setCaptureData] = useState<{ type: string; value: string } | null>(null);
  const [recentCommands] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("sita-recent-commands") || "[]").slice(0, 5); } catch { return []; }
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const reduced = useReducedMotion();

  // Reset on open/close
  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIdx(0);
      setMode("search");
      setCaptureData(null);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  // Global shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (open) onClose(); else { /* parent handles open */ }
      }
      if (e.key === "Escape" && open) onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Filter results
  const filtered = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().split(/\s+/);
    return COMMAND_INDEX.filter(item => {
      const searchable = [item.label, item.sublabel || "", ...item.keywords].join(" ").toLowerCase();
      return q.every(word => searchable.includes(word));
    });
  }, [query]);

  // Group results
  const grouped = useMemo(() => {
    const items = query.trim() ? filtered : [];
    const groups: Record<string, CommandItem[]> = {};
    items.forEach(item => {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    });
    return CATEGORY_ORDER
      .filter(cat => groups[cat]?.length)
      .map(cat => ({ category: cat, ...CATEGORY_CONFIG[cat], items: groups[cat] }));
  }, [filtered, query]);

  // Flat list for keyboard nav
  const flatItems = useMemo(() => grouped.flatMap(g => g.items), [grouped]);

  // Quick capture detection
  useEffect(() => {
    const cap = detectCapture(query);
    if (cap && cap.value.length > 0) {
      setMode("capture");
      setCaptureData(cap);
    } else {
      setMode("search");
      setCaptureData(null);
    }
  }, [query]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIdx(i => Math.min(i + 1, flatItems.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIdx(i => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (mode === "capture" && captureData) {
        handleCapture(captureData);
      } else if (flatItems[selectedIdx]) {
        handleSelect(flatItems[selectedIdx]);
      }
    }
  }, [flatItems, selectedIdx, mode, captureData]);

  const handleSelect = (item: CommandItem) => {
    // Save to recent
    const recent = [item.label, ...recentCommands.filter(r => r !== item.label)].slice(0, 5);
    localStorage.setItem("sita-recent-commands", JSON.stringify(recent));

    if (item.path) {
      navigate(item.path);
      onClose();
    }
  };

  const handleCapture = (data: { type: string; value: string }) => {
    // For now, navigate to appropriate page
    const paths: Record<string, string> = {
      note: "/inbox",
      task: "/concierge",
      reminder: "/concierge",
      lead: "/business?action=new-lead",
    };
    navigate(paths[data.type] || "/inbox");
    onClose();
  };

  const suggestions = useMemo(() => getContextSuggestions(), []);

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 z-[300] flex items-start justify-center pt-[12vh] sm:pt-[16vh]"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-[hsl(var(--surface-overlay))]" />

        {/* Command Panel */}
        <motion.div
          initial={reduced ? {} : { opacity: 0, y: -8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          className="relative w-full max-w-2xl mx-4 rounded-2xl border border-border/50 bg-card/95 backdrop-blur-xl shadow-xl overflow-hidden"
          role="dialog"
          aria-label="Universal Command"
        >
          {/* Input */}
          <div className="flex items-center gap-3 border-b border-border/30 px-4 py-3">
            <Search className="h-4.5 w-4.5 text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => { setQuery(e.target.value); setSelectedIdx(0); }}
              onKeyDown={handleKeyDown}
              placeholder="Search, navigate, or type 'note:', 'task:', 'remind me'…"
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
            />
            {query && (
              <button onClick={() => setQuery("")} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="h-4 w-4" />
              </button>
            )}
            <kbd className="hidden sm:flex items-center rounded-md border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">ESC</kbd>
          </div>

          {/* Content */}
          <div className="max-h-[420px] overflow-y-auto scrollbar-thin">
            {/* Capture Mode */}
            {mode === "capture" && captureData && (
              <div className="p-4">
                <div className="rounded-xl border border-[hsl(var(--sita-gold))]/20 bg-[hsl(var(--sita-gold))]/5 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Plus className="h-4 w-4 text-[hsl(var(--sita-gold))]" />
                    <span className="text-xs font-semibold text-[hsl(var(--sita-gold))] uppercase tracking-wider">
                      Quick {captureData.type}
                    </span>
                  </div>
                  <p className="text-sm text-foreground font-medium">{captureData.value}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => handleCapture(captureData)}
                      className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                      <CheckCircle className="h-3 w-3" />
                      Save {captureData.type}
                    </button>
                    <span className="text-[10px] text-muted-foreground">Press Enter</span>
                  </div>
                </div>
              </div>
            )}

            {/* Search Results */}
            {mode === "search" && query.trim() && grouped.length > 0 && (
              <div className="py-2">
                {grouped.map((group, gi) => (
                  <div key={group.category}>
                    {gi > 0 && <div className="mx-4 my-1 border-t border-border/20" />}
                    <div className="px-4 py-1.5">
                      <span className={cn("inline-flex rounded-md px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider", group.color)}>
                        {group.label}
                      </span>
                    </div>
                    {group.items.map((item) => {
                      const globalIdx = flatItems.indexOf(item);
                      const isSelected = globalIdx === selectedIdx;
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleSelect(item)}
                          onMouseEnter={() => setSelectedIdx(globalIdx)}
                          className={cn(
                            "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors",
                            isSelected ? "bg-primary/8" : "hover:bg-secondary/30"
                          )}
                        >
                          <div className={cn(
                            "rounded-lg p-1.5 shrink-0",
                            item.category === "advisor" ? "bg-primary/10" :
                            item.category === "capture" ? "bg-[hsl(var(--sita-gold))]/10" :
                            "bg-secondary/60"
                          )}>
                            <Icon className={cn(
                              "h-4 w-4",
                              item.domain === "business" ? "text-primary" :
                              item.domain === "finance" ? "text-[hsl(var(--trust-safe))]" :
                              item.domain === "concierge" ? "text-[hsl(var(--sita-gold))]" :
                              "text-muted-foreground"
                            )} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-foreground">{item.label}</p>
                            {item.sublabel && <p className="text-[11px] text-muted-foreground">{item.sublabel}</p>}
                          </div>
                          {item.riskLevel && item.riskLevel !== "low" && (
                            <span className={cn(
                              "rounded-full px-1.5 py-0.5 text-[9px] font-medium",
                              item.riskLevel === "high" ? "bg-destructive/10 text-destructive" : "bg-[hsl(var(--sita-gold))]/10 text-[hsl(var(--sita-gold))]"
                            )}>
                              {item.riskLevel === "high" ? "Approval needed" : "Preview"}
                            </span>
                          )}
                          {isSelected && <ArrowRight className="h-3.5 w-3.5 text-primary shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}

            {/* No results */}
            {mode === "search" && query.trim() && grouped.length === 0 && (
              <div className="py-12 text-center">
                <Search className="h-6 w-6 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No results for "{query}"</p>
                <p className="text-[11px] text-muted-foreground/60 mt-1">
                  Try: "note: call plumber" or "remind me to send invoice"
                </p>
              </div>
            )}

            {/* Empty state: suggestions + recent */}
            {mode === "search" && !query.trim() && (
              <div className="py-2">
                {/* Context Suggestions */}
                <div className="px-4 py-1.5">
                  <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/60">Suggested now</span>
                </div>
                {suggestions.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-secondary/30 transition-colors"
                    >
                      <div className="rounded-lg bg-primary/8 p-1.5">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-foreground">{item.label}</p>
                        {item.sublabel && <p className="text-[11px] text-muted-foreground">{item.sublabel}</p>}
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/30" />
                    </button>
                  );
                })}

                {/* Recent commands */}
                {recentCommands.length > 0 && (
                  <>
                    <div className="mx-4 my-2 border-t border-border/20" />
                    <div className="px-4 py-1.5">
                      <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/60">Recent</span>
                    </div>
                    {recentCommands.map((cmd, i) => (
                      <button
                        key={i}
                        onClick={() => setQuery(cmd)}
                        className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-secondary/30 transition-colors"
                      >
                        <Clock className="h-3.5 w-3.5 text-muted-foreground/40" />
                        <span className="text-sm text-muted-foreground">{cmd}</span>
                      </button>
                    ))}
                  </>
                )}

                {/* Quick capture hints */}
                <div className="mx-4 my-2 border-t border-border/20" />
                <div className="px-4 py-3 flex flex-wrap gap-2">
                  {["note:", "task:", "remind me", "new lead"].map(hint => (
                    <button
                      key={hint}
                      onClick={() => { setQuery(hint + " "); inputRef.current?.focus(); }}
                      className="rounded-lg border border-border/30 bg-secondary/20 px-2.5 py-1 text-[10px] font-medium text-muted-foreground hover:text-foreground hover:border-border/50 transition-colors"
                    >
                      {hint}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-border/20 px-4 py-2">
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground/50">
              <span className="flex items-center gap-1"><kbd className="rounded border border-border/30 px-1 font-mono">↑↓</kbd> navigate</span>
              <span className="flex items-center gap-1"><kbd className="rounded border border-border/30 px-1 font-mono">↵</kbd> select</span>
              <span className="flex items-center gap-1"><kbd className="rounded border border-border/30 px-1 font-mono">esc</kbd> close</span>
            </div>
            <span className="text-[10px] text-muted-foreground/30">SITA OS</span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
