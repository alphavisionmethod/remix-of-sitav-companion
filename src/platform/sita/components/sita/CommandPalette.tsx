// ═══════════════════════════════════════════════════════════════
// SITA OS — Spotlight Command Palette (Cmd+K)
// Cross-app actions, smart suggestions, domain-aware, premium glass
// Deep-links into windowed Business, Finance, Concierge OS apps
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, ArrowRight, Sparkles, Clock, Zap, Briefcase, DollarSign,
  Headphones, FolderOpen, Target, Users, Receipt, Phone, FileText,
  Calendar, Settings, Brain, Shield, Mail, BarChart3, ShoppingCart,
  Globe, Bot, Crown, RefreshCw, MessageSquare, CheckCircle,
  TrendingUp, PieChart, Heart, Activity, AlertTriangle, Sliders,
  ExternalLink, ArrowDownLeft, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppPlatform } from "@/contexts/AppPlatformContext";
import { crossNavigate } from "@/domains/engines/cross-os-integration";
import { supabase } from "@/integrations/supabase/client";
import type { LucideIcon } from "lucide-react";

interface CommandItem {
  id: string;
  label: string;
  sublabel?: string;
  icon: LucideIcon | null;
  emoji?: string;
  category: "recent" | "suggestion" | "cross-app" | "navigate" | "action" | "app";
  domain?: "business" | "finance" | "concierge" | "files" | "system";
  action: () => void;
  shortcut?: string;
}

// ── Cross-App Actions ───────────────────────────────────────
const CROSS_APP_ACTIONS: Omit<CommandItem, "action" | "id">[] = [
  // Business OS deep-links
  { label: "Create New Lead", sublabel: "Add to pipeline", icon: Target, category: "cross-app", domain: "business" },
  { label: "Send Invoice", sublabel: "Bill a client", icon: Receipt, category: "cross-app", domain: "business" },
  { label: "Schedule Follow-Up", sublabel: "Business follow-through", icon: Phone, category: "cross-app", domain: "business" },
  { label: "Add Customer", sublabel: "CRM entry", icon: Users, category: "cross-app", domain: "business" },
  { label: "Create Quote", sublabel: "Sales proposal", icon: FileText, category: "cross-app", domain: "business" },
  { label: "View Pipeline", sublabel: "Open opportunities", icon: TrendingUp, category: "cross-app", domain: "business" },
  { label: "Customer Support", sublabel: "Support tickets", icon: Headphones, category: "cross-app", domain: "business" },
  { label: "Business Operations", sublabel: "Operational queues", icon: Activity, category: "cross-app", domain: "business" },
  { label: "Revenue Forecast", sublabel: "Projected revenue", icon: BarChart3, category: "cross-app", domain: "business" },
  { label: "Collections Center", sublabel: "Overdue accounts", icon: AlertTriangle, category: "cross-app", domain: "business" },
  // Finance OS deep-links
  { label: "Review Overdue Bills", sublabel: "Finance obligations", icon: DollarSign, category: "cross-app", domain: "finance" },
  { label: "Check Cash Position", sublabel: "Current balances", icon: DollarSign, category: "cross-app", domain: "finance" },
  { label: "Review Subscriptions", sublabel: "Spending waste audit", icon: RefreshCw, category: "cross-app", domain: "finance" },
  { label: "View Receivables", sublabel: "Outstanding invoices", icon: ArrowDownLeft, category: "cross-app", domain: "finance" },
  { label: "Cash Flow Timing", sublabel: "When money arrives", icon: Clock, category: "cross-app", domain: "finance" },
  { label: "Net Worth", sublabel: "Wealth snapshot", icon: TrendingUp, category: "cross-app", domain: "finance" },
  { label: "Budget Overview", sublabel: "Spending vs budget", icon: PieChart, category: "cross-app", domain: "finance" },
  { label: "Stress Radar", sublabel: "Financial stress signals", icon: AlertTriangle, category: "cross-app", domain: "finance" },
  { label: "Peace Score", sublabel: "Financial peace index", icon: Heart, category: "cross-app", domain: "finance" },
  { label: "Financial Health", sublabel: "Health pulse", icon: Activity, category: "cross-app", domain: "finance" },
  { label: "Scenario Planner", sublabel: "Model decisions", icon: Sliders, category: "cross-app", domain: "finance" },
  // Concierge OS deep-links
  { label: "Add Errand", sublabel: "Concierge task", icon: ShoppingCart, category: "cross-app", domain: "concierge" },
  { label: "Prep Appointment", sublabel: "Get ready", icon: Calendar, category: "cross-app", domain: "concierge" },
  { label: "Travel Planning", sublabel: "Trip management", icon: Globe, category: "cross-app", domain: "concierge" },
  { label: "Household Tasks", sublabel: "Home to-dos", icon: CheckCircle, category: "cross-app", domain: "concierge" },
  { label: "Grocery Planning", sublabel: "Meal prep & lists", icon: ShoppingCart, category: "cross-app", domain: "concierge" },
  { label: "Service Providers", sublabel: "Vendor directory", icon: Users, category: "cross-app", domain: "concierge" },
  { label: "Life Admin", sublabel: "Admin tasks", icon: FileText, category: "cross-app", domain: "concierge" },
  { label: "Recurring Obligations", sublabel: "Repeating tasks", icon: RefreshCw, category: "cross-app", domain: "concierge" },
  // System
  { label: "Upload Document", sublabel: "Add to files", icon: FolderOpen, category: "cross-app", domain: "files" },
  { label: "Ask Advisor Board", sublabel: "Get AI recommendations", icon: Brain, category: "cross-app", domain: "system" },
];

// ── Navigation Routes ────────────────────────────────────────
const ROUTES: { label: string; path: string; icon: LucideIcon; sublabel: string; domain?: string; shortcut?: string }[] = [
  { label: "Daily Pulse", path: "/pulse", icon: Zap, sublabel: "Your daily briefing", domain: "system", shortcut: "⌘1" },
  { label: "Business Center", path: "/business", icon: Briefcase, sublabel: "Leads, invoices, CRM", domain: "business", shortcut: "⌘2" },
  { label: "Money Center", path: "/money", icon: DollarSign, sublabel: "Finances & cash flow", domain: "finance", shortcut: "⌘3" },
  { label: "Concierge", path: "/concierge", icon: Headphones, sublabel: "Tasks & errands", domain: "concierge", shortcut: "⌘4" },
  { label: "Files", path: "/files", icon: FolderOpen, sublabel: "Documents & storage", domain: "files", shortcut: "⌘5" },
  { label: "Boardroom", path: "/boardroom", icon: Crown, sublabel: "Strategic decisions", domain: "system" },
  { label: "Calendar", path: "/calendar", icon: Calendar, sublabel: "Schedule & events" },
  { label: "Settings", path: "/settings", icon: Settings, sublabel: "Preferences" },
  { label: "App Store", path: "/app-store", icon: ShoppingCart, sublabel: "Browse & install apps" },
  { label: "Advisors", path: "/advisors", icon: Brain, sublabel: "AI advisory council" },
  // Deep app pages
  { label: "Business → CRM", path: "/business/customers", icon: Users, sublabel: "Customer relationships", domain: "business" },
  { label: "Business → Leads", path: "/business/leads", icon: Target, sublabel: "Pipeline management", domain: "business" },
  { label: "Business → Invoices", path: "/business/invoices", icon: Receipt, sublabel: "Billing & collections", domain: "business" },
  { label: "Business → Follow-Through", path: "/business/follow-through", icon: Phone, sublabel: "Action items", domain: "business" },
  { label: "Business → Boardroom", path: "/business/boardroom", icon: Crown, sublabel: "Business review", domain: "business" },
  { label: "Business → Quotes", path: "/business/quotes", icon: FileText, sublabel: "Sales quotes", domain: "business" },
  { label: "Business → Social", path: "/business/social", icon: Globe, sublabel: "Social command", domain: "business" },
  { label: "Business → Operations", path: "/business/operations", icon: Settings, sublabel: "Business ops", domain: "business" },
  { label: "Money → Bills", path: "/money/bills", icon: Receipt, sublabel: "Obligations", domain: "finance" },
  { label: "Money → Spending", path: "/money/spending", icon: BarChart3, sublabel: "Spending pulse", domain: "finance" },
  { label: "Money → Subscriptions", path: "/money/subscriptions", icon: RefreshCw, sublabel: "Subscription audit", domain: "finance" },
  { label: "Money → Boardroom", path: "/money/boardroom", icon: Crown, sublabel: "Finance review", domain: "finance" },
  { label: "Concierge → Errands", path: "/concierge/errands", icon: CheckCircle, sublabel: "Task list", domain: "concierge" },
  { label: "Concierge → Travel", path: "/concierge/travel", icon: Globe, sublabel: "Travel plans", domain: "concierge" },
  { label: "Concierge → Appointments", path: "/concierge/appointments", icon: Calendar, sublabel: "Scheduling", domain: "concierge" },
];

// ── Smart Suggestions (time + location aware) ────────────────
function getSmartSuggestions(currentPath: string): { label: string; icon: LucideIcon; sublabel: string; path: string; domain?: string }[] {
  const hour = new Date().getHours();
  const results: { label: string; icon: LucideIcon; sublabel: string; path: string; domain?: string }[] = [];

  // Time-based
  if (hour >= 6 && hour < 12) {
    results.push(
      { label: "Morning briefing", icon: Zap, sublabel: "Today's priorities", path: "/pulse" },
      { label: "Review pending approvals", icon: Shield, sublabel: "Waiting items", path: "/approvals" },
    );
  } else if (hour >= 12 && hour < 18) {
    results.push(
      { label: "Pipeline check-in", icon: BarChart3, sublabel: "Afternoon review", path: "/business/leads", domain: "business" },
      { label: "Cash position", icon: DollarSign, sublabel: "Today's balances", path: "/money", domain: "finance" },
    );
  } else {
    results.push(
      { label: "End-of-day summary", icon: Crown, sublabel: "What got done today", path: "/boardroom" },
      { label: "Tomorrow's prep", icon: Calendar, sublabel: "Plan ahead", path: "/concierge", domain: "concierge" },
    );
  }

  // Context-aware: suggest related cross-domain actions
  if (currentPath.includes("/business")) {
    results.push({ label: "Check business cash flow", icon: DollarSign, sublabel: "Cross-app: Finance", path: "/money", domain: "finance" });
  } else if (currentPath.includes("/money")) {
    results.push({ label: "Review overdue invoices", icon: Receipt, sublabel: "Cross-app: Business", path: "/business/invoices", domain: "business" });
  } else if (currentPath.includes("/concierge")) {
    results.push({ label: "Business follow-ups due", icon: Phone, sublabel: "Cross-app: Business", path: "/business/follow-through", domain: "business" });
  }

  return results;
}

// ── Recent Apps ──────────────────────────────────────────────
function getRecentApps(): string[] {
  try { return JSON.parse(localStorage.getItem("sita-recent-apps") || "[]").slice(0, 4); }
  catch { return []; }
}

function addRecentApp(path: string) {
  try {
    const recent = getRecentApps().filter(p => p !== path);
    recent.unshift(path);
    localStorage.setItem("sita-recent-apps", JSON.stringify(recent.slice(0, 8)));
  } catch {}
}

// ── Domain Colors ────────────────────────────────────────────
const DOMAIN_COLORS: Record<string, string> = {
  business: "hsl(265 55% 58%)",
  finance: "hsl(152 55% 48%)",
  concierge: "hsl(285 55% 55%)",
  files: "hsl(220 15% 55%)",
  system: "hsl(210 60% 55%)",
};

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export const CommandPalette = ({ open, onClose }: CommandPaletteProps) => {
  const [query, setQuery] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [aiResult, setAiResult] = useState<{ label: string; app: string; module: string; confidence: number } | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { apps } = useAppPlatform();
  const inputRef = useRef<HTMLInputElement>(null);
  const aiDebounce = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (open) { setQuery(""); setSelectedIdx(0); setAiResult(null); setAiLoading(false); setTimeout(() => inputRef.current?.focus(), 50); }
  }, [open]);

  // AI intent parsing — triggers when query is natural language and no good matches
  useEffect(() => {
    if (aiDebounce.current) clearTimeout(aiDebounce.current);
    if (!query || query.length < 10 || query.split(" ").length < 3) {
      setAiResult(null);
      setAiLoading(false);
      return;
    }
    aiDebounce.current = setTimeout(async () => {
      setAiLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke("ai-gateway", {
          body: {
            capability_id: "command-palette-intent",
            task_class: "economy_utility",
            messages: [
              { role: "system", content: `You parse user intent into a structured navigation command for SITA OS. Return ONLY valid JSON: {"label":"<action>","app":"business|finance|concierge","module":"<module_key>","confidence":0.0-1.0}. Modules: business=[overview,leads,customers,invoices,quotes,follow-through,operations,pipeline,collections,social,forecast,support], finance=[overview,spending-pulse,bills,subscriptions,budgets,cash-timing,receivables,net-worth,tax,health,peace-score,scenarios], concierge=[overview,errands,appointments,travel,tasks,grocery,providers,life-admin,recurring,documents]. If unsure, set confidence < 0.5.` },
              { role: "user", content: query },
            ],
            max_tokens: 100,
            temperature: 0.1,
          },
        });
        if (!error && data?.choices?.[0]?.message?.content) {
          const parsed = JSON.parse(data.choices[0].message.content.trim().replace(/```json\n?|```/g, ""));
          if (parsed.app && parsed.module && parsed.confidence >= 0.4) {
            setAiResult(parsed);
          }
        }
      } catch {
        // Silently fail — AI search is a bonus
      } finally {
        setAiLoading(false);
      }
    }, 600);
    return () => { if (aiDebounce.current) clearTimeout(aiDebounce.current); };
  }, [query]);

  const items = useMemo<CommandItem[]>(() => {
    const q = query.toLowerCase();
    const results: CommandItem[] = [];

    if (!q) {
      // Recent apps
      getRecentApps().forEach(path => {
        const route = ROUTES.find(r => r.path === path);
        if (route) {
          results.push({
            id: `recent-${route.path}`,
            label: route.label, sublabel: route.sublabel, icon: route.icon,
            category: "recent", domain: route.domain as any,
            action: () => { navigate(route.path); addRecentApp(route.path); onClose(); },
          });
        }
      });

      // Smart suggestions (context-aware)
      getSmartSuggestions(location.pathname).forEach(s => {
        results.push({
          id: `suggest-${s.path}-${s.label}`,
          label: s.label, sublabel: s.sublabel, icon: s.icon,
          category: "suggestion", domain: s.domain as any,
          action: () => { navigate(s.path); addRecentApp(s.path); onClose(); },
        });
      });
    }

    // Cross-app actions (always searchable) — deep-link into windowed apps
    const DEEP_LINK_MAP: Record<string, { app: "business" | "finance" | "concierge"; module: string }> = {
      // Business
      "Create New Lead": { app: "business", module: "leads" },
      "Send Invoice": { app: "business", module: "invoices" },
      "Schedule Follow-Up": { app: "business", module: "follow-through" },
      "Add Customer": { app: "business", module: "customers" },
      "Create Quote": { app: "business", module: "quotes" },
      "View Pipeline": { app: "business", module: "opportunities" },
      "Customer Support": { app: "business", module: "support" },
      "Business Operations": { app: "business", module: "operations" },
      "Revenue Forecast": { app: "business", module: "forecast" },
      "Collections Center": { app: "business", module: "collections" },
      // Finance
      "Review Overdue Bills": { app: "finance", module: "bills" },
      "Check Cash Position": { app: "finance", module: "overview" },
      "Review Subscriptions": { app: "finance", module: "subscriptions" },
      "View Receivables": { app: "finance", module: "receivables" },
      "Cash Flow Timing": { app: "finance", module: "cash-timing" },
      "Net Worth": { app: "finance", module: "net-worth" },
      "Budget Overview": { app: "finance", module: "budgets" },
      "Stress Radar": { app: "finance", module: "stress-radar" },
      "Peace Score": { app: "finance", module: "peace-score" },
      "Financial Health": { app: "finance", module: "health" },
      "Scenario Planner": { app: "finance", module: "scenarios" },
      // Concierge
      "Add Errand": { app: "concierge", module: "errands" },
      "Prep Appointment": { app: "concierge", module: "appointments" },
      "Travel Planning": { app: "concierge", module: "travel" },
      "Household Tasks": { app: "concierge", module: "tasks" },
      "Grocery Planning": { app: "concierge", module: "grocery" },
      "Service Providers": { app: "concierge", module: "providers" },
      "Life Admin": { app: "concierge", module: "life-admin" },
      "Recurring Obligations": { app: "concierge", module: "recurring" },
    };

    CROSS_APP_ACTIONS.forEach(a => {
      if (!q || a.label.toLowerCase().includes(q) || a.sublabel?.toLowerCase().includes(q)) {
        results.push({
          id: `crossapp-${a.label}`,
          ...a,
          action: () => {
            const deepLink = DEEP_LINK_MAP[a.label];
            if (deepLink) {
              // Launch the windowed app, then deep-link to the module
              window.dispatchEvent(new CustomEvent("sita-launch-app", { detail: { appId: deepLink.app } }));
              setTimeout(() => crossNavigate(deepLink.app, deepLink.module), 200);
            } else if (a.label.includes("Document") || a.label.includes("Upload")) {
              navigate("/files");
            } else if (a.label.includes("Advisor")) {
              navigate("/boardroom");
            }
          },
        });
      }
    });

    // Installed apps
    apps.filter(a => a.installStatus === "installed").forEach(app => {
      if (!q || app.name.toLowerCase().includes(q) || app.tags.some(t => t.includes(q))) {
        results.push({
          id: `app-${app.id}`,
          label: app.name, sublabel: app.shortDescription, icon: null, emoji: app.icon,
          category: "app",
          action: () => {
            if (app.routePath) { navigate(app.routePath); addRecentApp(app.routePath); }
            else if (app.externalUrl) window.open(app.externalUrl, "_blank", "noopener");
            onClose();
          },
        });
      }
    });

    // Navigation routes
    ROUTES.forEach(r => {
      if (!q || r.label.toLowerCase().includes(q) || r.sublabel.toLowerCase().includes(q)) {
        results.push({
          id: `route-${r.path}`,
          label: r.label, sublabel: r.sublabel, icon: r.icon,
          category: "navigate", domain: r.domain as any,
          shortcut: r.shortcut,
          action: () => { navigate(r.path); addRecentApp(r.path); onClose(); },
        });
      }
    });

    // AI-suggested result
    if (aiResult && q) {
      results.unshift({
        id: "ai-intent",
        label: aiResult.label,
        sublabel: `AI suggestion · ${Math.round(aiResult.confidence * 100)}% confident`,
        icon: Sparkles,
        category: "suggestion",
        domain: aiResult.app as any,
        action: () => {
          window.dispatchEvent(new CustomEvent("sita-launch-app", { detail: { appId: aiResult.app } }));
          setTimeout(() => crossNavigate(aiResult.app as any, aiResult.module), 200);
          onClose();
        },
      });
    }

    // Deduplicate
    const seen = new Set<string>();
    return results.filter(r => {
      if (seen.has(r.label)) return false;
      seen.add(r.label);
      return true;
    }).slice(0, 16);
  }, [query, apps, navigate, onClose, location.pathname, aiResult]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIdx(i => Math.min(i + 1, items.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setSelectedIdx(i => Math.max(i - 1, 0)); }
    else if (e.key === "Enter" && items[selectedIdx]) { items[selectedIdx].action(); }
    else if (e.key === "Escape") { onClose(); }
  }, [items, selectedIdx, onClose]);

  const categoryLabel = (c: CommandItem["category"]) => {
    switch (c) {
      case "recent": return "Recent";
      case "suggestion": return "Suggested for You";
      case "cross-app": return "Cross-App Actions";
      case "app": return "Installed Apps";
      case "navigate": return "Navigate";
      case "action": return "Actions";
    }
  };

  const categoryIcon = (c: CommandItem["category"]) => {
    switch (c) {
      case "recent": return <Clock className="h-2.5 w-2.5" />;
      case "suggestion": return <Sparkles className="h-2.5 w-2.5" />;
      case "cross-app": return <Zap className="h-2.5 w-2.5" />;
      default: return null;
    }
  };

  if (!open) return null;

  // Group by category
  const grouped: { category: string; items: (CommandItem & { globalIdx: number })[] }[] = [];
  let currentCat = "";
  items.forEach((item, idx) => {
    if (item.category !== currentCat) {
      currentCat = item.category;
      grouped.push({ category: currentCat, items: [] });
    }
    grouped[grouped.length - 1].items.push({ ...item, globalIdx: idx });
  });

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-start justify-center pt-[12vh]"
        style={{ background: "hsl(0 0% 0% / 0.4)", backdropFilter: "blur(8px)" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="w-full max-w-[560px] mx-4 rounded-2xl overflow-hidden shadow-2xl"
          style={{
            background: "hsl(var(--card) / 0.85)",
            backdropFilter: "blur(60px) saturate(1.8)",
            WebkitBackdropFilter: "blur(60px) saturate(1.8)",
            border: "1px solid hsl(var(--border) / 0.3)",
            boxShadow: "0 25px 80px -12px hsl(0 0% 0% / 0.5), 0 0 0 1px hsl(0 0% 100% / 0.05)",
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Search */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-border/20">
            <Search className="h-5 w-5 text-muted-foreground/60 shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={e => { setQuery(e.target.value); setSelectedIdx(0); }}
              onKeyDown={handleKeyDown}
              placeholder="Search apps, actions, or ask in natural language…"
              className="flex-1 bg-transparent text-base text-foreground placeholder:text-muted-foreground/50 outline-none"
            />
            {aiLoading && (
              <Loader2 className="h-4 w-4 text-[hsl(265_55%_58%)] animate-spin shrink-0" />
            )}
            <kbd className="hidden sm:inline-flex text-[10px] text-muted-foreground/40 bg-muted/50 px-2 py-0.5 rounded-md font-mono border border-border/20">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div className="max-h-[400px] overflow-y-auto py-2 px-2">
            {items.length === 0 && (
              <div className="py-12 text-center">
                <Sparkles className="h-6 w-6 mx-auto mb-3 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground/60">No results found</p>
                <p className="text-xs text-muted-foreground/40 mt-1">Try a different search term</p>
              </div>
            )}

            {grouped.map((group) => (
              <div key={group.category} className="mb-1">
                <div className="flex items-center gap-2 px-3 py-1.5">
                  {categoryIcon(group.items[0]?.category || "navigate")}
                  <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/40">
                    {categoryLabel(group.items[0]?.category || "navigate")}
                  </span>
                </div>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const domainColor = item.domain ? DOMAIN_COLORS[item.domain] : undefined;
                  return (
                    <button
                      key={item.id}
                      onClick={item.action}
                      onMouseEnter={() => setSelectedIdx(item.globalIdx)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150",
                        item.globalIdx === selectedIdx
                          ? "bg-primary/10 text-foreground"
                          : "text-muted-foreground hover:bg-muted/30"
                      )}
                    >
                      {/* Icon with domain color */}
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                        style={{
                          background: domainColor ? `${domainColor} / 0.12` : "hsl(0 0% 100% / 0.06)",
                        }}
                      >
                        {Icon ? (
                          <Icon className="h-3.5 w-3.5" style={{ color: domainColor || "hsl(var(--muted-foreground))" }} />
                        ) : item.emoji ? (
                          <span className="text-sm">{item.emoji}</span>
                        ) : null}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.label}</p>
                        {item.sublabel && (
                          <p className="text-[11px] text-muted-foreground/60 truncate">{item.sublabel}</p>
                        )}
                      </div>
                      {item.shortcut && (
                        <kbd className="text-[9px] text-muted-foreground/30 bg-muted/30 px-1.5 py-0.5 rounded font-mono border border-border/10">
                          {item.shortcut}
                        </kbd>
                      )}
                      {item.globalIdx === selectedIdx && (
                        <ArrowRight className="h-3.5 w-3.5 text-primary shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-5 py-2.5 border-t border-border/15 text-[10px] text-muted-foreground/35">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="bg-muted/40 px-1 py-0.5 rounded text-[9px] font-mono border border-border/15">↑</kbd>
                <kbd className="bg-muted/40 px-1 py-0.5 rounded text-[9px] font-mono border border-border/15">↓</kbd>
                Navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="bg-muted/40 px-1.5 py-0.5 rounded text-[9px] font-mono border border-border/15">↵</kbd>
                Open
              </span>
            </div>
            <span className="flex items-center gap-1">
              <Sparkles className="h-2.5 w-2.5" /> SITA Spotlight
            </span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CommandPalette;
