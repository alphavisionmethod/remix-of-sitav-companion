// ═══════════════════════════════════════════════════════════════
// SITA OS — Universal Command Surface v2
// The single most important interaction primitive in the system
// Modes: search, navigate, capture, simulate, approval, intent
// Live Supabase entity search + static command index
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, ArrowRight, X, Sparkles, ChevronRight, Plus,
  FileText, UserPlus, CalendarPlus, Phone, FileUp,
  Home, Briefcase, DollarSign, Headphones, BarChart3,
  FolderOpen, CheckCircle, Settings, Shield, Users,
  Brain, Target, Activity, Receipt, Inbox, Eye,
  Zap, Bell, Workflow, Clock, AlertTriangle,
  MessageSquare, Hash, BookOpen, Layout, Globe,
  ShieldCheck, Lock, Send, Play, Pause, ExternalLink,
  Loader2, Info, ArrowUpRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useGlobalSearch, type SearchResult } from "@/hooks/use-global-search";
import { useShellIndicators } from "@/hooks/use-shell-indicators";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

// ── Command Index ────────────────────────────────────────────

interface CommandItem {
  id: string;
  label: string;
  sublabel?: string;
  icon: React.ElementType;
  path?: string;
  category: "action" | "navigate" | "advisor" | "capture" | "system";
  domain?: string;
  keywords: string[];
  riskLevel?: "low" | "medium" | "high";
}

const COMMAND_INDEX: CommandItem[] = [
  // Captures
  { id: "cap-note", label: "Quick note", sublabel: "Capture a thought", icon: FileText, category: "capture", keywords: ["note", "capture", "write", "remember"] },
  { id: "cap-task", label: "Add task", sublabel: "Create a new task", icon: Target, category: "capture", keywords: ["task", "todo", "add", "create"] },
  { id: "cap-lead", label: "New lead", sublabel: "Add a business lead", icon: UserPlus, path: "/business?action=new-lead", category: "capture", domain: "business", keywords: ["lead", "new", "prospect"] },
  { id: "cap-reminder", label: "Set reminder", sublabel: "Don't forget", icon: Bell, category: "capture", keywords: ["remind", "reminder", "alert", "later"] },
  { id: "cap-upload", label: "Upload file", sublabel: "Import a document", icon: FileUp, path: "/files?action=upload", category: "capture", keywords: ["upload", "file", "document", "import"] },
  // Actions
  { id: "act-boardroom", label: "Enter Boardroom", sublabel: "Full operating briefing", icon: BarChart3, path: "/boardroom", category: "action", keywords: ["boardroom", "review", "briefing"] },
  { id: "act-approvals", label: "Review approvals", sublabel: "Pending decisions", icon: CheckCircle, path: "/approvals", category: "action", keywords: ["approvals", "pending", "review", "decisions"] },
  { id: "act-day-review", label: "Start day review", sublabel: "Morning pulse", icon: Sparkles, path: "/", category: "action", keywords: ["day", "review", "morning", "pulse"] },
  { id: "act-invoice", label: "Create invoice", sublabel: "Business billing", icon: FileText, path: "/business?action=new-invoice", category: "action", domain: "business", keywords: ["invoice", "create", "bill"], riskLevel: "medium" },
  { id: "act-callback", label: "Schedule callback", sublabel: "Business follow-up", icon: Phone, path: "/business?action=callback", category: "action", domain: "business", keywords: ["callback", "call", "schedule"] },
  { id: "act-appointment", label: "Schedule appointment", sublabel: "Calendar", icon: CalendarPlus, path: "/concierge?action=schedule", category: "action", keywords: ["appointment", "schedule", "meeting"] },
  { id: "act-recover", label: "Recover missed leads", sublabel: "Re-engage stale leads", icon: Zap, path: "/recovered-value", category: "action", domain: "business", keywords: ["recover", "leads", "stale", "missed"] },
  { id: "act-workflow", label: "Start workflow", sublabel: "Launch an automation", icon: Play, path: "/workflows", category: "action", keywords: ["workflow", "start", "automation", "launch"], riskLevel: "medium" },
  { id: "act-export", label: "Export data", sublabel: "Sovereign data export", icon: ExternalLink, path: "/settings", category: "action", keywords: ["export", "data", "download", "sovereign"] },
  // Navigation
  { id: "nav-home", label: "Home", sublabel: "Daily Pulse", icon: Home, path: "/", category: "navigate", keywords: ["home", "desktop", "pulse"] },
  { id: "nav-business", label: "Business Center", sublabel: "Leads, customers, pipeline", icon: Briefcase, path: "/business", category: "navigate", domain: "business", keywords: ["business", "crm", "leads", "sales"] },
  { id: "nav-money", label: "Money Center", sublabel: "Bills, accounts, reserves", icon: DollarSign, path: "/money", category: "navigate", domain: "finance", keywords: ["money", "finance", "bills", "budget"] },
  { id: "nav-concierge", label: "Concierge", sublabel: "Household, calendar, tasks", icon: Headphones, path: "/concierge", category: "navigate", domain: "concierge", keywords: ["concierge", "household", "calendar"] },
  { id: "nav-files", label: "Files", sublabel: "Documents & knowledge", icon: FolderOpen, path: "/files", category: "navigate", keywords: ["files", "documents"] },
  { id: "nav-workflows", label: "Workflows", sublabel: "Automations", icon: Workflow, path: "/workflows", category: "navigate", keywords: ["workflows", "automation"] },
  { id: "nav-proof", label: "Proof Center", sublabel: "Receipts & audit trail", icon: Receipt, path: "/proof", category: "navigate", keywords: ["proof", "receipts", "audit"] },
  { id: "nav-boardroom", label: "Boardroom", sublabel: "Reviews & planning", icon: BarChart3, path: "/boardroom", category: "navigate", keywords: ["boardroom", "review", "planning"] },
  { id: "nav-settings", label: "Settings", sublabel: "Trust & preferences", icon: Settings, path: "/settings", category: "navigate", keywords: ["settings", "preferences"] },
  { id: "nav-mission", label: "Mission Control", sublabel: "System health & agents", icon: Shield, path: "/mission-control", category: "navigate", keywords: ["mission", "control", "system"] },
  { id: "nav-inbox", label: "Inbox", sublabel: "Incoming items", icon: Inbox, path: "/inbox", category: "navigate", keywords: ["inbox", "capture"] },
  { id: "nav-search", label: "Global Search", sublabel: "Deep cross-domain search", icon: Search, path: "/search", category: "navigate", keywords: ["search", "find"] },
  { id: "nav-comms", label: "Communications", sublabel: "Messages & channels", icon: MessageSquare, path: "/communications", category: "navigate", keywords: ["communications", "messages"] },
  { id: "nav-approvals", label: "Approvals", sublabel: "Decision queue", icon: CheckCircle, path: "/approvals", category: "navigate", keywords: ["approvals", "queue"] },
  { id: "nav-life", label: "Life Dashboard", sublabel: "Personal overview", icon: Activity, path: "/life", category: "navigate", keywords: ["life", "personal", "dashboard"] },
  { id: "nav-twins", label: "Digital Twins", sublabel: "Predictive models", icon: Users, path: "/digital-twins", category: "navigate", keywords: ["twins", "predictive"] },
  // Advisors
  { id: "adv-business", label: "Business Advisor", sublabel: "Pipeline & revenue", icon: Briefcase, path: "/advisors/business-advisor", category: "advisor", domain: "business", keywords: ["business", "advisor"] },
  { id: "adv-money", label: "Money Advisor", sublabel: "Cashflow guidance", icon: DollarSign, path: "/advisors/money-advisor", category: "advisor", domain: "finance", keywords: ["money", "advisor"] },
  { id: "adv-concierge", label: "Concierge Advisor", sublabel: "Task help", icon: Headphones, path: "/advisors/concierge-advisor", category: "advisor", domain: "concierge", keywords: ["concierge", "advisor"] },
  { id: "adv-strategy", label: "Strategy Advisor", sublabel: "Cross-domain synthesis", icon: Brain, path: "/advisors/strategy-advisor", category: "advisor", keywords: ["strategy", "advisor"] },
  // System
  { id: "sys-agents", label: "Agent Control", sublabel: "Fleet management", icon: Shield, path: "/mission-control?tab=control-panel", category: "system", keywords: ["agents", "control"] },
  { id: "sys-audit", label: "Audit Log", sublabel: "Compliance trail", icon: FileText, path: "/mission-control?tab=audit-log", category: "system", keywords: ["audit", "log"] },
  { id: "sys-integrations", label: "Integrations", sublabel: "Connected services", icon: Globe, path: "/integrations", category: "system", keywords: ["integrations", "connected"] },
];

const CATEGORY_CONFIG: Record<string, { label: string; color: string; order: number }> = {
  capture: { label: "Capture", color: "bg-[hsl(var(--sita-gold))]/10 text-[hsl(var(--sita-gold))]", order: 0 },
  action: { label: "Actions", color: "bg-primary/10 text-primary", order: 1 },
  navigate: { label: "Navigate", color: "bg-secondary text-muted-foreground", order: 2 },
  advisor: { label: "Advisors", color: "bg-primary/10 text-primary", order: 3 },
  system: { label: "System", color: "bg-secondary text-muted-foreground", order: 4 },
  entity: { label: "Results", color: "bg-[hsl(var(--trust-safe))]/10 text-[hsl(var(--trust-safe))]", order: 5 },
};

// ── Capture Detection ─────────────────────────────────────────

function detectCapture(query: string): { type: string; value: string } | null {
  const lower = query.toLowerCase().trim();
  if (lower.startsWith("note:") || lower.startsWith("note ")) return { type: "note", value: query.slice(5).trim() };
  if (lower.startsWith("remind me") || lower.startsWith("reminder:")) return { type: "reminder", value: query.replace(/^remind(er)?:?\s*(me\s+)?/i, "").trim() };
  if (lower.startsWith("task:") || lower.startsWith("todo:")) return { type: "task", value: query.slice(5).trim() };
  if (lower.startsWith("new lead") || lower.startsWith("lead:")) return { type: "lead", value: query.replace(/^(new\s+)?lead:?\s*/i, "").trim() };
  return null;
}

// ── Natural Language Intent ─────────────────────────────────

type IntentType = "ask" | "search" | "navigate" | "action" | "capture" | null;

function detectIntent(query: string): IntentType {
  const q = query.toLowerCase().trim();
  if (!q) return null;
  if (/^(what|how|why|when|who|show me|tell me|find|is there|are there|do i)/.test(q)) return "ask";
  if (/^(go to|open|navigate|jump|switch)/.test(q)) return "navigate";
  if (/^(create|add|new|start|launch|schedule|send|draft|upload|set)/.test(q)) return "action";
  if (/^(note:|task:|remind|lead:|todo:)/.test(q)) return "capture";
  return "search";
}

// ── Context Suggestions ─────────────────────────────────────

function getContextSuggestions(pathname: string, indicators: { pendingApprovals: number; activeIncidents: number }): CommandItem[] {
  const hour = new Date().getHours();
  const segment = pathname.split("/").filter(Boolean)[0] || "home";

  // Priority: approvals/incidents waiting
  const urgent: CommandItem[] = [];
  if (indicators.pendingApprovals > 0) {
    urgent.push(COMMAND_INDEX.find(i => i.id === "act-approvals")!);
  }
  if (indicators.activeIncidents > 0) {
    urgent.push(COMMAND_INDEX.find(i => i.id === "nav-mission")!);
  }

  // Context-based
  const contextual: string[] = [];
  if (segment === "business" || segment === "home") {
    contextual.push("act-callback", "act-recover", "nav-business");
  } else if (segment === "money") {
    contextual.push("nav-money", "act-invoice", "act-approvals");
  } else if (segment === "concierge") {
    contextual.push("act-appointment", "cap-task", "nav-concierge");
  }

  // Time-based fallbacks
  if (hour < 12) contextual.push("act-day-review", "act-boardroom");
  else if (hour < 17) contextual.push("act-callback", "nav-boardroom");
  else contextual.push("cap-note", "nav-boardroom");

  const ids = [...new Set([...urgent.map(u => u.id), ...contextual])].slice(0, 5);
  return ids.map(id => COMMAND_INDEX.find(i => i.id === id)).filter(Boolean) as CommandItem[];
}

// ── Entity Icon Map ─────────────────────────────────────────

const ENTITY_ICONS: Record<string, React.ElementType> = {
  lead: UserPlus, customer: Users, task: Target, invoice: FileText,
  bill: DollarSign, workflow: Workflow, approval: CheckCircle,
  incident: AlertTriangle, file: FolderOpen, receipt: Receipt,
  note: FileText, booking: CalendarPlus, setting: Settings,
};

const DOMAIN_COLORS: Record<string, string> = {
  business: "text-primary", finance: "text-[hsl(var(--trust-safe))]",
  concierge: "text-[hsl(var(--sita-gold))]", system: "text-muted-foreground",
  files: "text-muted-foreground", workflows: "text-primary", proof: "text-[hsl(var(--trust-safe))]",
};

// ── Command State ───────────────────────────────────────────

type CommandState = "ready" | "searching" | "interpreting" | "previewing" | "approval_required" | "capture" | "no_results" | "ai_thinking" | "ai_answer";

// ── Component ───────────────────────────────────────────────

interface UniversalCommandSurfaceProps {
  open: boolean;
  onClose: () => void;
}

export function UniversalCommandSurface({ open, onClose }: UniversalCommandSurfaceProps) {
  const [query, setQuery] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [commandState, setCommandState] = useState<CommandState>("ready");
  const [captureData, setCaptureData] = useState<{ type: string; value: string } | null>(null);
  const [previewItem, setPreviewItem] = useState<SearchResult | null>(null);
  const [aiAnswer, setAiAnswer] = useState("");
  const [recentCommands, setRecentCommands] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("sita-recent-cmds") || "[]").slice(0, 6); } catch { return []; }
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const reduced = useReducedMotion();
  const { results: entityResults, loading: entityLoading, search: entitySearch, clearResults } = useGlobalSearch();
  const indicators = useShellIndicators();

  // Debounced entity search
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset on open
  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIdx(0);
      setCommandState("ready");
      setCaptureData(null);
      setPreviewItem(null);
      clearResults();
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [open, clearResults]);

  // Escape handler
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        if (previewItem) { setPreviewItem(null); return; }
        onClose();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose, previewItem]);

  // Query change → detect mode + trigger entity search
  useEffect(() => {
    const cap = detectCapture(query);
    if (cap && cap.value.length > 0) {
      setCommandState("capture");
      setCaptureData(cap);
      return;
    }
    setCaptureData(null);

    if (!query.trim()) {
      setCommandState("ready");
      clearResults();
      return;
    }

    setCommandState("searching");

    // Debounced entity search
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      entitySearch(query);
    }, 250);

    return () => { if (searchTimerRef.current) clearTimeout(searchTimerRef.current); };
  }, [query, entitySearch, clearResults]);

  // Update command state when entity results arrive
  useEffect(() => {
    if (entityLoading) return;
    if (query.trim() && commandState === "searching") {
      const hasCommands = filteredCommands.length > 0;
      const hasEntities = entityResults.length > 0;
      setCommandState(hasCommands || hasEntities ? "ready" : "no_results");
    }
  }, [entityLoading, entityResults]);

  // Filter command index
  const filteredCommands = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().split(/\s+/);
    return COMMAND_INDEX.filter(item => {
      const searchable = [item.label, item.sublabel || "", ...item.keywords].join(" ").toLowerCase();
      return q.every(word => searchable.includes(word));
    });
  }, [query]);

  // Group commands
  const groupedCommands = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {};
    filteredCommands.forEach(item => {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    });
    return Object.entries(groups)
      .sort(([a], [b]) => (CATEGORY_CONFIG[a]?.order ?? 99) - (CATEGORY_CONFIG[b]?.order ?? 99))
      .map(([cat, items]) => ({ category: cat, ...CATEGORY_CONFIG[cat], items }));
  }, [filteredCommands]);

  // Build unified flat list: commands + entities
  const allItems = useMemo(() => {
    const commands = groupedCommands.flatMap(g => g.items.map(item => ({ kind: "command" as const, item })));
    const entities = entityResults.map(r => ({ kind: "entity" as const, item: r }));
    return [...commands, ...entities];
  }, [groupedCommands, entityResults]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIdx(i => Math.min(i + 1, allItems.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIdx(i => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (commandState === "capture" && captureData) {
        handleCapture(captureData);
      } else if (intent === "ask" && query.trim()) {
        // AI mode — ask personal-brain
        handleAIAsk(query);
      } else if (allItems[selectedIdx]) {
        const item = allItems[selectedIdx];
        if (item.kind === "command") handleSelectCommand(item.item as CommandItem);
        else handleSelectEntity(item.item as SearchResult);
      }
    } else if (e.key === "Tab" && !e.shiftKey) {
      // Tab to preview
      e.preventDefault();
      const item = allItems[selectedIdx];
      if (item?.kind === "entity") {
        setPreviewItem(item.item as SearchResult);
      }
    }
  }, [allItems, selectedIdx, commandState, captureData]);

  const saveRecent = (label: string) => {
    const recent = [label, ...recentCommands.filter(r => r !== label)].slice(0, 6);
    setRecentCommands(recent);
    localStorage.setItem("sita-recent-cmds", JSON.stringify(recent));
  };

  const handleSelectCommand = (item: CommandItem) => {
    saveRecent(item.label);
    if (item.riskLevel === "high") {
      setCommandState("approval_required");
      toast.info("This action requires approval", { description: "Opening approval flow..." });
    }
    if (item.path) { navigate(item.path); onClose(); }
  };

  const handleSelectEntity = (result: SearchResult) => {
    saveRecent(result.title);
    if (result.actionUrl) { navigate(result.actionUrl); onClose(); }
  };

  const handleCapture = (data: { type: string; value: string }) => {
    saveRecent(`${data.type}: ${data.value}`);
    toast.success(`${data.type} captured`, { description: data.value });
    const paths: Record<string, string> = { note: "/inbox", task: "/concierge", reminder: "/concierge", lead: "/business?action=new-lead" };
    navigate(paths[data.type] || "/inbox");
    onClose();
  };

  const handleAIAsk = async (q: string) => {
    setCommandState("ai_thinking");
    setAiAnswer("");
    try {
      const { data } = await supabase.functions.invoke("personal-brain", {
        body: { intent: q, context: { source: "command-surface" } },
      });
      setAiAnswer(data?.recommendation || data?.response || "I couldn't find an answer.");
      setCommandState("ai_answer");
    } catch {
      setAiAnswer("Connection issue — try again.");
      setCommandState("ai_answer");
    }
  };

  const suggestions = useMemo(() => getContextSuggestions(location.pathname, indicators), [location.pathname, indicators]);
  const intent = useMemo(() => detectIntent(query), [query]);

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.12 }}
        className="fixed inset-0 z-[300] flex items-start justify-center pt-[10vh] sm:pt-[14vh]"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />

        {/* Command Panel */}
        <motion.div
          initial={reduced ? {} : { opacity: 0, y: -10, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.97 }}
          transition={{ duration: 0.18, ease: [0.25, 0.1, 0.25, 1] }}
          className={cn(
            "relative w-full mx-4 rounded-2xl border border-border/40 bg-card/95 backdrop-blur-xl shadow-2xl overflow-hidden",
            previewItem ? "max-w-4xl" : "max-w-2xl"
          )}
          role="dialog"
          aria-label="Universal Command Surface"
        >
          <div className="flex">
            {/* Main column */}
            <div className={cn("flex-1 min-w-0", previewItem && "border-r border-border/30")}>
              {/* Input */}
              <div className="flex items-center gap-3 border-b border-border/20 px-4 py-3.5">
                {entityLoading ? (
                  <Loader2 className="h-4 w-4 text-primary animate-spin shrink-0" />
                ) : (
                  <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                )}
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setSelectedIdx(0); setPreviewItem(null); }}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask, search, navigate, or capture — type anything…"
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
                  autoComplete="off" autoCorrect="off" spellCheck={false}
                />
                {query && (
                  <button onClick={() => { setQuery(""); setPreviewItem(null); }} className="text-muted-foreground hover:text-foreground transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                )}
                {/* Intent ribbon */}
                {intent && query.trim() && (
                  <span className="hidden sm:flex items-center gap-1 rounded-full bg-primary/8 px-2 py-0.5 text-[9px] font-semibold text-primary uppercase tracking-wider shrink-0">
                    {intent === "ask" && <Brain className="h-2.5 w-2.5" />}
                    {intent === "search" && <Search className="h-2.5 w-2.5" />}
                    {intent === "navigate" && <ArrowUpRight className="h-2.5 w-2.5" />}
                    {intent === "action" && <Zap className="h-2.5 w-2.5" />}
                    {intent === "capture" && <Plus className="h-2.5 w-2.5" />}
                    {intent}
                  </span>
                )}
                <kbd className="hidden sm:flex items-center rounded-md border border-border/30 bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">ESC</kbd>
              </div>

              {/* Content */}
              <ScrollArea className="max-h-[440px]">
                {/* Capture Mode */}
                {commandState === "capture" && captureData && (
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
                          <CheckCircle className="h-3 w-3" /> Save {captureData.type}
                        </button>
                        <span className="text-[10px] text-muted-foreground">Press Enter</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Command Results */}
                {commandState !== "capture" && query.trim() && groupedCommands.length > 0 && (
                  <div className="py-1">
                    {groupedCommands.map((group, gi) => (
                      <div key={group.category}>
                        {gi > 0 && <div className="mx-4 my-1 border-t border-border/10" />}
                        <div className="px-4 py-1.5">
                          <span className={cn("inline-flex rounded-md px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider", group.color)}>
                            {group.label}
                          </span>
                        </div>
                        {group.items.map((item) => {
                          const globalIdx = allItems.findIndex(a => a.kind === "command" && (a.item as CommandItem).id === item.id);
                          const isSelected = globalIdx === selectedIdx;
                          const Icon = item.icon;
                          return (
                            <button
                              key={item.id}
                              onClick={() => handleSelectCommand(item)}
                              onMouseEnter={() => setSelectedIdx(globalIdx)}
                              className={cn(
                                "w-full flex items-center gap-3 px-4 py-2 text-left transition-colors",
                                isSelected ? "bg-primary/8" : "hover:bg-secondary/30"
                              )}
                            >
                              <div className={cn(
                                "rounded-lg p-1.5 shrink-0",
                                item.category === "advisor" ? "bg-primary/10" :
                                item.category === "capture" ? "bg-[hsl(var(--sita-gold))]/10" :
                                "bg-secondary/60"
                              )}>
                                <Icon className={cn("h-3.5 w-3.5", DOMAIN_COLORS[item.domain || ""] || "text-muted-foreground")} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[13px] text-foreground">{item.label}</p>
                                {item.sublabel && <p className="text-[11px] text-muted-foreground">{item.sublabel}</p>}
                              </div>
                              {item.riskLevel && item.riskLevel !== "low" && (
                                <span className={cn(
                                  "rounded-full px-1.5 py-0.5 text-[9px] font-medium shrink-0",
                                  item.riskLevel === "high"
                                    ? "bg-destructive/10 text-destructive"
                                    : "bg-[hsl(var(--sita-gold))]/10 text-[hsl(var(--sita-gold))]"
                                )}>
                                  {item.riskLevel === "high" ? "Approval" : "Preview"}
                                </span>
                              )}
                              {isSelected && <ArrowRight className="h-3 w-3 text-primary shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                )}

                {/* Entity Results from Supabase */}
                {commandState !== "capture" && query.trim() && entityResults.length > 0 && (
                  <div className="py-1">
                    <div className="mx-4 my-1 border-t border-border/10" />
                    <div className="px-4 py-1.5 flex items-center justify-between">
                      <span className={cn("inline-flex rounded-md px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider", CATEGORY_CONFIG.entity.color)}>
                        Live Results
                      </span>
                      <button
                        onClick={() => { navigate(`/search?q=${encodeURIComponent(query)}`); onClose(); }}
                        className="text-[10px] text-primary hover:underline flex items-center gap-0.5"
                      >
                        View all in Search <ArrowRight className="h-2.5 w-2.5" />
                      </button>
                    </div>
                    {entityResults.slice(0, 8).map((result, i) => {
                      const globalIdx = allItems.findIndex(a => a.kind === "entity" && (a.item as SearchResult).id === result.id);
                      const isSelected = globalIdx === selectedIdx;
                      const Icon = ENTITY_ICONS[result.type] || FileText;
                      return (
                        <button
                          key={result.id}
                          onClick={() => handleSelectEntity(result)}
                          onMouseEnter={() => setSelectedIdx(globalIdx)}
                          className={cn(
                            "w-full flex items-center gap-3 px-4 py-2 text-left transition-colors",
                            isSelected ? "bg-primary/8" : "hover:bg-secondary/30"
                          )}
                        >
                          <div className="rounded-lg bg-secondary/50 p-1.5 shrink-0">
                            <Icon className={cn("h-3.5 w-3.5", DOMAIN_COLORS[result.domain] || "text-muted-foreground")} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="text-[13px] text-foreground truncate">{result.title}</p>
                              <span className="text-[8px] px-1 py-0.5 rounded-full border border-border/30 text-muted-foreground capitalize shrink-0">{result.type}</span>
                            </div>
                            {result.subtitle && <p className="text-[11px] text-muted-foreground truncate">{result.subtitle}</p>}
                          </div>
                          {result.sensitivity && result.sensitivity !== "public" && (
                            <Lock className="h-3 w-3 text-muted-foreground/40 shrink-0" />
                          )}
                          {isSelected && (
                            <div className="flex items-center gap-1 shrink-0">
                              <kbd className="rounded border border-border/30 bg-muted px-1 text-[8px] font-mono text-muted-foreground">TAB</kbd>
                              <ArrowRight className="h-3 w-3 text-primary" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* AI Thinking / Answer */}
                {commandState === "ai_thinking" && (
                  <div className="py-10 text-center">
                    <Loader2 className="h-6 w-6 text-primary animate-spin mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">Thinking…</p>
                    <div className="mt-3 mx-auto w-48 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-primary/40 rounded-full animate-pulse" style={{ width: "60%" }} />
                    </div>
                  </div>
                )}
                {commandState === "ai_answer" && aiAnswer && (
                  <div className="p-4">
                    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Brain className="h-4 w-4 text-primary" />
                        <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">AI Answer</span>
                      </div>
                      <p className="text-sm text-foreground whitespace-pre-wrap">{aiAnswer}</p>
                      <button
                        onClick={() => { navigate("/brain"); onClose(); }}
                        className="mt-3 text-[11px] text-primary hover:underline flex items-center gap-1"
                      >
                        Continue in Brain <ArrowRight className="h-2.5 w-2.5" />
                      </button>
                    </div>
                  </div>
                )}


                {commandState === "no_results" && (
                  <div className="py-10 text-center">
                    <Search className="h-6 w-6 text-muted-foreground/20 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No results for "{query}"</p>
                    <p className="text-[11px] text-muted-foreground/50 mt-1">
                      Try: "note: call plumber" · "show bills" · "open finance"
                    </p>
                    <button
                      onClick={() => { navigate(`/search?q=${encodeURIComponent(query)}`); onClose(); }}
                      className="mt-3 text-[11px] text-primary hover:underline"
                    >
                      Try deep search →
                    </button>
                  </div>
                )}

                {/* Empty: suggestions + recent + status */}
                {commandState === "ready" && !query.trim() && (
                  <div className="py-1">
                    {/* Urgent indicators */}
                    {(indicators.pendingApprovals > 0 || indicators.activeIncidents > 0) && (
                      <>
                        <div className="px-4 py-1.5">
                          <span className="text-[9px] font-semibold uppercase tracking-wider text-destructive/70">Needs attention</span>
                        </div>
                        {indicators.pendingApprovals > 0 && (
                          <button
                            onClick={() => { navigate("/approvals"); onClose(); }}
                            className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-secondary/30 transition-colors"
                          >
                            <div className="rounded-lg bg-[hsl(var(--sita-gold))]/10 p-1.5">
                              <CheckCircle className="h-3.5 w-3.5 text-[hsl(var(--sita-gold))]" />
                            </div>
                            <div className="flex-1">
                              <p className="text-[13px] text-foreground">{indicators.pendingApprovals} approval{indicators.pendingApprovals > 1 ? "s" : ""} waiting</p>
                              <p className="text-[11px] text-muted-foreground">Decisions need your attention</p>
                            </div>
                            <span className="rounded-full bg-[hsl(var(--sita-gold))]/15 px-2 py-0.5 text-[10px] font-semibold text-[hsl(var(--sita-gold))]">{indicators.pendingApprovals}</span>
                          </button>
                        )}
                        {indicators.activeIncidents > 0 && (
                          <button
                            onClick={() => { navigate("/mission-control"); onClose(); }}
                            className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-secondary/30 transition-colors"
                          >
                            <div className="rounded-lg bg-destructive/10 p-1.5">
                              <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                            </div>
                            <div className="flex-1">
                              <p className="text-[13px] text-foreground">{indicators.activeIncidents} active incident{indicators.activeIncidents > 1 ? "s" : ""}</p>
                              <p className="text-[11px] text-muted-foreground">System issues detected</p>
                            </div>
                            <span className="rounded-full bg-destructive/15 px-2 py-0.5 text-[10px] font-semibold text-destructive">{indicators.activeIncidents}</span>
                          </button>
                        )}
                        <div className="mx-4 my-1.5 border-t border-border/10" />
                      </>
                    )}

                    {/* Context suggestions */}
                    <div className="px-4 py-1.5">
                      <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/50">Suggested now</span>
                    </div>
                    {suggestions.map(item => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleSelectCommand(item)}
                          className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-secondary/30 transition-colors"
                        >
                          <div className="rounded-lg bg-primary/8 p-1.5">
                            <Icon className="h-3.5 w-3.5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="text-[13px] text-foreground">{item.label}</p>
                            {item.sublabel && <p className="text-[11px] text-muted-foreground">{item.sublabel}</p>}
                          </div>
                          <ChevronRight className="h-3 w-3 text-muted-foreground/30" />
                        </button>
                      );
                    })}

                    {/* Recent commands */}
                    {recentCommands.length > 0 && (
                      <>
                        <div className="mx-4 my-1.5 border-t border-border/10" />
                        <div className="px-4 py-1.5">
                          <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/50">Recent</span>
                        </div>
                        {recentCommands.map((cmd, i) => (
                          <button
                            key={i}
                            onClick={() => setQuery(cmd)}
                            className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-secondary/30 transition-colors"
                          >
                            <Clock className="h-3.5 w-3.5 text-muted-foreground/30" />
                            <span className="text-[13px] text-muted-foreground">{cmd}</span>
                          </button>
                        ))}
                      </>
                    )}

                    {/* Quick capture chips */}
                    <div className="mx-4 my-2 border-t border-border/10" />
                    <div className="px-4 py-2.5 flex flex-wrap gap-1.5">
                      {["note:", "task:", "remind me", "new lead", "upload"].map(hint => (
                        <button
                          key={hint}
                          onClick={() => { setQuery(hint + " "); inputRef.current?.focus(); }}
                          className="rounded-lg border border-border/30 bg-secondary/20 px-2 py-1 text-[10px] font-medium text-muted-foreground hover:text-foreground hover:border-border/50 transition-colors"
                        >
                          {hint}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </ScrollArea>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-border/15 px-4 py-2">
                <div className="flex items-center gap-3 text-[9px] text-muted-foreground/40">
                  <span className="flex items-center gap-1"><kbd className="rounded border border-border/20 px-1 font-mono">↑↓</kbd> navigate</span>
                  <span className="flex items-center gap-1"><kbd className="rounded border border-border/20 px-1 font-mono">↵</kbd> open</span>
                  <span className="flex items-center gap-1"><kbd className="rounded border border-border/20 px-1 font-mono">tab</kbd> preview</span>
                  <span className="flex items-center gap-1"><kbd className="rounded border border-border/20 px-1 font-mono">esc</kbd> close</span>
                </div>
                {/* Trust posture */}
                <div className="flex items-center gap-1.5">
                  <div className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    indicators.trustPosture === "secure" ? "bg-[hsl(var(--trust-safe))]" :
                    indicators.trustPosture === "attention" ? "bg-[hsl(var(--sita-gold))]" :
                    indicators.trustPosture === "warning" ? "bg-amber-500" : "bg-destructive"
                  )} />
                  <span className="text-[9px] text-muted-foreground/30 capitalize">{indicators.trustPosture}</span>
                </div>
              </div>
            </div>

            {/* Preview Pane */}
            <AnimatePresence>
              {previewItem && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 320, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="shrink-0 overflow-hidden"
                >
                  <div className="p-4 space-y-3 w-[320px]">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Preview</span>
                      <button onClick={() => setPreviewItem(null)} className="text-muted-foreground hover:text-foreground">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {(() => { const Icon = ENTITY_ICONS[previewItem.type] || FileText; return <Icon className={cn("h-5 w-5", DOMAIN_COLORS[previewItem.domain])} />; })()}
                        <div>
                          <p className="text-sm font-semibold text-foreground">{previewItem.title}</p>
                          <p className="text-[11px] text-muted-foreground">{previewItem.subtitle}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground capitalize">{previewItem.type}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground capitalize">{previewItem.domain}</span>
                        {previewItem.sensitivity && previewItem.sensitivity !== "public" && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-destructive/10 text-destructive capitalize">{previewItem.sensitivity}</span>
                        )}
                      </div>
                      {previewItem.metadata && (
                        <div className="rounded-lg bg-secondary/30 p-2.5 space-y-1">
                          {Object.entries(previewItem.metadata).filter(([, v]) => v != null).map(([k, v]) => (
                            <div key={k} className="flex justify-between text-[11px]">
                              <span className="text-muted-foreground capitalize">{k.replace(/_/g, " ")}</span>
                              <span className="text-foreground font-medium">{String(v)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {previewItem.updatedAt && (
                        <p className="text-[10px] text-muted-foreground/50">
                          Updated {new Date(previewItem.updatedAt).toLocaleDateString()}
                        </p>
                      )}
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => { handleSelectEntity(previewItem); }}
                          className="flex-1 rounded-lg bg-primary px-3 py-1.5 text-[11px] font-medium text-primary-foreground hover:bg-primary/90 transition-colors text-center"
                        >
                          Open
                        </button>
                        <button
                          onClick={() => setPreviewItem(null)}
                          className="rounded-lg border border-border/40 px-3 py-1.5 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Back
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
