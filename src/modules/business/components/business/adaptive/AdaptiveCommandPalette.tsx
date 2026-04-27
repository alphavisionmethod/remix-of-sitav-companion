// ═══════════════════════════════════════════════════════════════
// Adaptive Command Palette
// Mode-aware command palette with prioritized actions per
// business archetype — feels like the OS knows what you need.
// ═══════════════════════════════════════════════════════════════

import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, ArrowRight, Users, ShoppingCart, Calendar, TrendingUp,
  FileText, Receipt, Zap, Phone, Building2, Target, Mail,
  BarChart3, RefreshCw, Settings, Brain, Shield, Crown,
  Package, Heart, MapPin, Bot, Globe, ClipboardList,
} from "lucide-react";
import { useBusinessProfile } from "@/modules/business/hooks/useBusinessProfile";
import { getIdentityLayer } from "@/domains/engines/business-identity-layers";
import type { ProfileArchetype } from "@/domains/engines/business-profile-engine";

interface CommandItem {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  category: string;
  keywords: string[];
  action: string; // navigation target or action ID
  priority: number; // lower = higher priority
}

const UNIVERSAL_COMMANDS: CommandItem[] = [
  { id: "go-home", label: "Go to Dashboard", description: "Adaptive business home", icon: Target, category: "Navigation", keywords: ["home", "dashboard"], action: "adaptive-home", priority: 5 },
  { id: "go-contacts", label: "Open Contacts", description: "View all contacts", icon: Users, category: "Navigation", keywords: ["contacts", "people", "clients"], action: "crm-contacts", priority: 5 },
  { id: "go-pipeline", label: "Open Pipeline", description: "Sales pipeline view", icon: TrendingUp, category: "Navigation", keywords: ["pipeline", "deals", "sales"], action: "crm-pipeline", priority: 5 },
  { id: "go-tasks", label: "View Tasks", description: "Task board", icon: ClipboardList, category: "Navigation", keywords: ["tasks", "todo", "work"], action: "crm-tasks", priority: 6 },
  { id: "go-boardroom", label: "Boardroom", description: "Strategic decisions", icon: Crown, category: "Intelligence", keywords: ["boardroom", "strategy", "decisions"], action: "boardroom", priority: 7 },
  { id: "go-kpi", label: "KPI Dashboard", description: "Key performance indicators", icon: BarChart3, category: "Intelligence", keywords: ["kpi", "metrics", "performance"], action: "kpi-dashboard", priority: 7 },
  { id: "go-profile", label: "Business Profile", description: "Configure business mode", icon: Settings, category: "System", keywords: ["profile", "settings", "mode"], action: "business-profile", priority: 8 },
  { id: "go-proof", label: "Proof Trail", description: "Audit & evidence", icon: Shield, category: "System", keywords: ["proof", "audit", "evidence"], action: "proof", priority: 8 },
];

const ARCHETYPE_COMMANDS: Record<string, CommandItem[]> = {
  ecommerce: [
    { id: "ec-orders", label: "View Orders", description: "Today's orders and fulfillment", icon: Package, category: "Quick Action", keywords: ["orders", "fulfillment"], action: "invoices", priority: 1 },
    { id: "ec-carts", label: "Abandoned Carts", description: "Recover abandoned checkouts", icon: ShoppingCart, category: "Quick Action", keywords: ["carts", "abandoned", "recovery"], action: "lead-recovery", priority: 1 },
    { id: "ec-store", label: "Store Manager", description: "Manage products and inventory", icon: Globe, category: "Quick Action", keywords: ["store", "products", "inventory"], action: "ecommerce", priority: 2 },
    { id: "ec-autopilot", label: "Sales Autopilot", description: "Automated sales workflows", icon: Zap, category: "Automation", keywords: ["autopilot", "automation", "sales"], action: "revenue-autopilot", priority: 3 },
  ],
  service: [
    { id: "sv-proposals", label: "Create Proposal", description: "Draft new client proposal", icon: FileText, category: "Quick Action", keywords: ["proposal", "sow", "quote"], action: "proposals", priority: 1 },
    { id: "sv-followup", label: "Follow-Up Queue", description: "Pending client responses", icon: Phone, category: "Quick Action", keywords: ["follow", "response", "pending"], action: "follow-through", priority: 1 },
    { id: "sv-invoice", label: "Send Invoice", description: "Create & send invoice", icon: Receipt, category: "Quick Action", keywords: ["invoice", "billing", "payment"], action: "invoices", priority: 2 },
    { id: "sv-nurture", label: "Client Nurture", description: "Automated nurture sequences", icon: Heart, category: "Automation", keywords: ["nurture", "drip", "sequence"], action: "revenue-autopilot", priority: 3 },
  ],
  "brick-and-mortar": [
    { id: "bm-appts", label: "Today's Appointments", description: "View today's schedule", icon: Calendar, category: "Quick Action", keywords: ["appointments", "today", "schedule"], action: "appointments", priority: 1 },
    { id: "bm-local", label: "Local Marketing", description: "Social & local presence", icon: MapPin, category: "Quick Action", keywords: ["local", "marketing", "social"], action: "social", priority: 2 },
    { id: "bm-walkins", label: "Walk-in Leads", description: "Today's walk-in traffic", icon: Users, category: "Quick Action", keywords: ["walkins", "traffic", "leads"], action: "leads", priority: 2 },
  ],
  agency: [
    { id: "ag-deals", label: "Deal Pipeline", description: "Active opportunities", icon: TrendingUp, category: "Quick Action", keywords: ["deals", "pipeline", "opportunities"], action: "crm-pipeline", priority: 1 },
    { id: "ag-pitch", label: "Pitch Deck", description: "Create new pitch", icon: FileText, category: "Quick Action", keywords: ["pitch", "proposal", "deck"], action: "proposals", priority: 1 },
    { id: "ag-retainers", label: "Retainer Billing", description: "Monthly retainer invoicing", icon: Receipt, category: "Quick Action", keywords: ["retainer", "billing", "recurring"], action: "invoices", priority: 2 },
    { id: "ag-forecast", label: "Revenue Forecast", description: "Pipeline revenue projection", icon: BarChart3, category: "Intelligence", keywords: ["forecast", "projection", "revenue"], action: "revenue-forecast", priority: 3 },
  ],
  "appointment-based": [
    { id: "ab-schedule", label: "Today's Schedule", description: "View appointments", icon: Calendar, category: "Quick Action", keywords: ["schedule", "appointments", "today"], action: "appointments", priority: 1 },
    { id: "ab-noshows", label: "No-Show Recovery", description: "Rebook no-shows", icon: RefreshCw, category: "Quick Action", keywords: ["noshow", "recovery", "rebook"], action: "lead-recovery", priority: 1 },
    { id: "ab-billing", label: "Session Billing", description: "Unbilled sessions", icon: Receipt, category: "Quick Action", keywords: ["billing", "unbilled", "sessions"], action: "invoices", priority: 2 },
  ],
  "employee-based": [
    { id: "eb-tasks", label: "Team Tasks", description: "Open assignments", icon: ClipboardList, category: "Quick Action", keywords: ["tasks", "team", "assignments"], action: "crm-tasks", priority: 1 },
    { id: "eb-ops", label: "Ops Center", description: "Operations dashboard", icon: Settings, category: "Quick Action", keywords: ["ops", "operations", "dashboard"], action: "operations", priority: 1 },
    { id: "eb-comms", label: "Team Comms", description: "Internal communications", icon: Mail, category: "Quick Action", keywords: ["comms", "messages", "team"], action: "crm-communications", priority: 2 },
  ],
};

interface Props {
  open: boolean;
  onClose: () => void;
  onNavigate: (moduleId: string) => void;
}

export default function AdaptiveCommandPalette({ open, onClose, onNavigate }: Props) {
  const { primaryMode } = useBusinessProfile();
  const identity = getIdentityLayer(primaryMode);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const allCommands = useMemo(() => {
    const archCommands = ARCHETYPE_COMMANDS[primaryMode] || [];
    return [...archCommands, ...UNIVERSAL_COMMANDS].sort((a, b) => a.priority - b.priority);
  }, [primaryMode]);

  const filtered = useMemo(() => {
    if (!query.trim()) return allCommands;
    const q = query.toLowerCase();
    return allCommands.filter(cmd =>
      cmd.label.toLowerCase().includes(q) ||
      cmd.description.toLowerCase().includes(q) ||
      cmd.keywords.some(k => k.includes(q))
    );
  }, [query, allCommands]);

  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const handleSelect = useCallback((cmd: CommandItem) => {
    onNavigate(cmd.action);
    onClose();
  }, [onNavigate, onClose]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && filtered[selectedIndex]) {
      handleSelect(filtered[selectedIndex]);
    } else if (e.key === "Escape") {
      onClose();
    }
  }, [filtered, selectedIndex, handleSelect, onClose]);

  // Global keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (open) onClose();
        // Opening is handled by parent
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Group by category
  const grouped = useMemo(() => {
    const map = new Map<string, CommandItem[]>();
    filtered.forEach(cmd => {
      const list = map.get(cmd.category) || [];
      list.push(cmd);
      map.set(cmd.category, list);
    });
    return Array.from(map.entries());
  }, [filtered]);

  let flatIndex = -1;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[999]"
            onClick={onClose}
          />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.15 }}
            className="fixed top-[15%] left-1/2 -translate-x-1/2 w-[520px] max-h-[60vh] z-[1000] rounded-xl overflow-hidden"
            style={{
              background: "hsl(220 15% 8%)",
              border: `1px solid hsl(${identity.accentColor} / 0.15)`,
              boxShadow: `0 25px 60px -12px hsl(${identity.accentColor} / 0.15), 0 0 0 1px hsl(0 0% 100% / 0.05)`,
            }}
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-[hsl(0_0%_100%/0.06)]">
              <Search size={16} className="text-foreground/30 shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a command or search..."
                className="flex-1 bg-transparent text-[13px] text-foreground/80 placeholder:text-foreground/25 outline-none"
              />
              <kbd className="text-[9px] text-foreground/20 px-1.5 py-0.5 rounded border border-[hsl(0_0%_100%/0.08)] bg-[hsl(0_0%_100%/0.03)]">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div className="overflow-y-auto max-h-[calc(60vh-56px)] py-2">
              {grouped.map(([category, commands]) => (
                <div key={category}>
                  <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-foreground/25 px-4 py-1.5 mt-1">
                    {category}
                  </p>
                  {commands.map(cmd => {
                    flatIndex++;
                    const thisIndex = flatIndex;
                    const isSelected = thisIndex === selectedIndex;
                    return (
                      <button
                        key={cmd.id}
                        type="button"
                        onClick={() => handleSelect(cmd)}
                        onMouseEnter={() => setSelectedIndex(thisIndex)}
                        className={`flex items-center gap-3 w-full px-4 py-2 text-left transition-colors ${
                          isSelected
                            ? "bg-[hsl(0_0%_100%/0.06)]"
                            : "hover:bg-[hsl(0_0%_100%/0.03)]"
                        }`}
                      >
                        <cmd.icon
                          size={14}
                          className="shrink-0"
                          style={{ color: isSelected ? `hsl(${identity.accentColor})` : undefined }}
                        />
                        <div className="flex-1 min-w-0">
                          <span className={`text-[12px] font-medium ${isSelected ? "text-foreground/90" : "text-foreground/60"}`}>
                            {cmd.label}
                          </span>
                          <span className="text-[10px] text-foreground/25 ml-2">
                            {cmd.description}
                          </span>
                        </div>
                        {isSelected && (
                          <ArrowRight size={12} style={{ color: `hsl(${identity.accentColor})` }} />
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-[12px] text-foreground/25">No commands found</p>
                  <p className="text-[10px] text-foreground/15 mt-1">Try a different search term</p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
