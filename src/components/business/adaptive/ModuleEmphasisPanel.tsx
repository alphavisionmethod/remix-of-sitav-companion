// ═══════════════════════════════════════════════════════════════
// Module Emphasis Panel — Toggle & prioritize Business OS modules
// ═══════════════════════════════════════════════════════════════

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Target, FileText, Calendar, CheckSquare, Receipt,
  Bot, Crosshair, RefreshCw, Settings, LayoutDashboard,
  Star, BarChart3, Phone, ShoppingCart, Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useBusinessProfile } from "@/hooks/useBusinessProfile";
import { getIdentityLayer } from "@/domains/engines/business-identity-layers";

interface ModuleConfig {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  emphasis: "primary" | "secondary" | "hidden";
  category: string;
}

const ALL_MODULES: Omit<ModuleConfig, "emphasis">[] = [
  { id: "leads", label: "Leads & Inbox", description: "Lead capture, scoring, and follow-up queue", icon: Target, category: "Core" },
  { id: "crm", label: "CRM / Contacts", description: "Contact management and relationship tracking", icon: Users, category: "Core" },
  { id: "pipeline", label: "Pipeline / Deals", description: "Deal flow, stages, and conversion tracking", icon: BarChart3, category: "Core" },
  { id: "proposals", label: "Quotes / Proposals", description: "Quote creation and proposal tracking", icon: FileText, category: "Sales" },
  { id: "scheduling", label: "Scheduling", description: "Appointment booking and calendar management", icon: Calendar, category: "Operations" },
  { id: "follow-through", label: "Follow-Through / Tasks", description: "Task tracking and accountability", icon: CheckSquare, category: "Operations" },
  { id: "collections", label: "Collections / Invoices", description: "Invoice tracking and payment collection", icon: Receipt, category: "Finance" },
  { id: "advisors", label: "Advisors", description: "AI business advisors and recommendations", icon: Bot, category: "Intelligence" },
  { id: "boardroom", label: "Boardroom", description: "Strategic review and decision-making", icon: Crosshair, category: "Intelligence" },
  { id: "recovery", label: "Recovery Systems", description: "Cart recovery, lead revival, no-show recovery", icon: RefreshCw, category: "Growth" },
  { id: "operations", label: "Operations / Team", description: "Team workload, assignments, and handoffs", icon: Settings, category: "Operations" },
  { id: "communications", label: "Communications", description: "Call, email, and meeting logging", icon: Phone, category: "Core" },
];

const EMPHASIS_STYLES = {
  primary: { label: "Primary", color: "text-[hsl(var(--trust-safe))]", bg: "bg-[hsl(var(--trust-safe))]/10", border: "border-[hsl(var(--trust-safe))]/20" },
  secondary: { label: "Secondary", color: "text-[hsl(var(--sita-gold))]", bg: "bg-[hsl(var(--sita-gold))]/10", border: "border-[hsl(var(--sita-gold))]/20" },
  hidden: { label: "Hidden", color: "text-foreground/25", bg: "bg-foreground/5", border: "border-foreground/10" },
};

const ARCHETYPE_DEFAULTS: Record<string, Record<string, "primary" | "secondary" | "hidden">> = {
  ecommerce: { leads: "primary", crm: "primary", pipeline: "secondary", proposals: "hidden", scheduling: "hidden", "follow-through": "secondary", collections: "primary", advisors: "secondary", boardroom: "secondary", recovery: "primary", operations: "hidden", communications: "secondary" },
  service: { leads: "primary", crm: "primary", pipeline: "primary", proposals: "primary", scheduling: "secondary", "follow-through": "primary", collections: "primary", advisors: "primary", boardroom: "secondary", recovery: "secondary", operations: "secondary", communications: "primary" },
  "brick-and-mortar": { leads: "secondary", crm: "primary", pipeline: "hidden", proposals: "hidden", scheduling: "primary", "follow-through": "secondary", collections: "secondary", advisors: "secondary", boardroom: "secondary", recovery: "secondary", operations: "primary", communications: "secondary" },
  "employee-based": { leads: "secondary", crm: "primary", pipeline: "secondary", proposals: "secondary", scheduling: "secondary", "follow-through": "primary", collections: "secondary", advisors: "primary", boardroom: "secondary", recovery: "secondary", operations: "primary", communications: "primary" },
  agency: { leads: "primary", crm: "primary", pipeline: "primary", proposals: "primary", scheduling: "secondary", "follow-through": "primary", collections: "primary", advisors: "primary", boardroom: "primary", recovery: "secondary", operations: "secondary", communications: "primary" },
};

export default function ModuleEmphasisPanel() {
  const { primaryMode } = useBusinessProfile();
  const identity = getIdentityLayer(primaryMode);
  const defaults = ARCHETYPE_DEFAULTS[primaryMode] || ARCHETYPE_DEFAULTS.service;

  const [modules, setModules] = useState<ModuleConfig[]>(() =>
    ALL_MODULES.map(m => ({ ...m, emphasis: defaults[m.id] || "secondary" }))
  );

  useEffect(() => {
    setModules(ALL_MODULES.map(m => ({ ...m, emphasis: defaults[m.id] || "secondary" })));
  }, [primaryMode]);

  const cycleEmphasis = (id: string) => {
    setModules(prev => prev.map(m => {
      if (m.id !== id) return m;
      const next = m.emphasis === "primary" ? "secondary" : m.emphasis === "secondary" ? "hidden" : "primary";
      return { ...m, emphasis: next };
    }));
  };

  const resetToDefaults = () => {
    setModules(ALL_MODULES.map(m => ({ ...m, emphasis: defaults[m.id] || "secondary" })));
  };

  const categories = [...new Set(ALL_MODULES.map(m => m.category))];
  const primaryCount = modules.filter(m => m.emphasis === "primary").length;
  const hiddenCount = modules.filter(m => m.emphasis === "hidden").length;

  return (
    <div className="p-5 space-y-5 max-w-3xl">
      {/* Summary bar */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-4 flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[hsl(var(--trust-safe))]" />
            <span className="text-[10px] text-foreground/50">{primaryCount} Primary</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[hsl(var(--sita-gold))]" />
            <span className="text-[10px] text-foreground/50">{modules.length - primaryCount - hiddenCount} Secondary</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-foreground/20" />
            <span className="text-[10px] text-foreground/50">{hiddenCount} Hidden</span>
          </div>
        </div>
        <button
          onClick={resetToDefaults}
          className="text-[10px] text-foreground/30 hover:text-foreground/60 transition-colors"
        >
          Reset to recommended
        </button>
      </motion.div>

      {/* Module grid by category */}
      {categories.map((cat) => (
        <div key={cat} className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-foreground/30 px-1">
            {cat}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {modules.filter(m => m.category === cat).map((mod, i) => {
              const style = EMPHASIS_STYLES[mod.emphasis];
              const Icon = mod.icon;
              return (
                <motion.button
                  key={mod.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => cycleEmphasis(mod.id)}
                  className={cn(
                    "rounded-xl border p-3 text-left transition-all group cursor-pointer",
                    style.border,
                    mod.emphasis === "hidden" ? "opacity-50 hover:opacity-70" : "hover:scale-[1.01]"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", style.bg)}>
                      <Icon size={14} className={style.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-foreground/70 truncate">{mod.label}</span>
                        <span className={cn("text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-full", style.bg, style.color)}>
                          {style.label}
                        </span>
                      </div>
                      <p className="text-[9px] text-foreground/30 mt-0.5 line-clamp-1">{mod.description}</p>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      ))}

      <p className="text-[9px] text-foreground/20 text-center pt-2">
        Click any module to cycle: Primary → Secondary → Hidden
      </p>
    </div>
  );
}
