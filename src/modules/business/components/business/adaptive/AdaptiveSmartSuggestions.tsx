// ═══════════════════════════════════════════════════════════════
// Adaptive Smart Suggestions Panel
// Contextual, archetype-aware "What to do next" panel showing
// intelligent suggestions based on business mode + current state.
// Makes the dashboard feel like a personal business advisor.
// ═══════════════════════════════════════════════════════════════

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, ArrowRight, X, Phone, Mail, ShoppingCart,
  Calendar, FileText, TrendingUp, Users, Target, Receipt,
  RefreshCw, Zap, Star, Package, Heart, Clock, MapPin,
  Bot, ChevronDown, ChevronUp,
} from "lucide-react";
import { useBusinessProfile } from "@/modules/business/hooks/useBusinessProfile";
import { getIdentityLayer } from "@/domains/engines/business-identity-layers";
import { useBusinessNavigation } from "@/modules/business/contexts/BusinessNavigationContext";

interface Suggestion {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  action: string;           // navigation target
  impact: "high" | "medium" | "low";
  timeEstimate: string;     // "2 min", "5 min"
  category: string;
}

const ARCHETYPE_SUGGESTIONS: Record<string, Suggestion[]> = {
  ecommerce: [
    { id: "ec1", title: "Recover abandoned carts", description: "8 carts worth $640 are waiting — send recovery emails", icon: ShoppingCart, action: "lead-recovery", impact: "high", timeEstimate: "2 min", category: "Revenue" },
    { id: "ec2", title: "Review today's orders", description: "12 new orders need fulfillment confirmation", icon: Package, action: "invoices", impact: "high", timeEstimate: "5 min", category: "Operations" },
    { id: "ec3", title: "Check conversion rate", description: "Conversion dipped 0.3% — review landing pages", icon: TrendingUp, action: "kpi-dashboard", impact: "medium", timeEstimate: "3 min", category: "Growth" },
    { id: "ec4", title: "Respond to reviews", description: "3 new reviews need a response", icon: Star, action: "social", impact: "medium", timeEstimate: "5 min", category: "Engagement" },
    { id: "ec5", title: "Set up retargeting", description: "Configure abandoned cart automation", icon: Zap, action: "crm-automations", impact: "high", timeEstimate: "10 min", category: "Automation" },
  ],
  service: [
    { id: "sv1", title: "Follow up on overdue clients", description: "4 clients are past their follow-up date", icon: Phone, action: "follow-through", impact: "high", timeEstimate: "5 min", category: "Client Care" },
    { id: "sv2", title: "Send pending proposals", description: "2 proposals drafted but not yet sent", icon: FileText, action: "proposals", impact: "high", timeEstimate: "3 min", category: "Sales" },
    { id: "sv3", title: "Review pipeline health", description: "3 deals stalled — consider a check-in", icon: TrendingUp, action: "crm-pipeline", impact: "medium", timeEstimate: "5 min", category: "Pipeline" },
    { id: "sv4", title: "Invoice completed work", description: "2 projects completed without invoicing", icon: Receipt, action: "invoices", impact: "high", timeEstimate: "5 min", category: "Revenue" },
    { id: "sv5", title: "Update project status", description: "Keep clients informed on active projects", icon: Mail, action: "crm-tasks", impact: "medium", timeEstimate: "5 min", category: "Communication" },
  ],
  "brick-and-mortar": [
    { id: "bm1", title: "Confirm today's appointments", description: "3 appointments unconfirmed — send reminders", icon: Calendar, action: "appointments", impact: "high", timeEstimate: "2 min", category: "Schedule" },
    { id: "bm2", title: "Respond to new reviews", description: "2 Google reviews need responses", icon: Star, action: "social", impact: "medium", timeEstimate: "5 min", category: "Reputation" },
    { id: "bm3", title: "Run a loyalty campaign", description: "34% repeat rate — target win-back customers", icon: Heart, action: "revenue-autopilot", impact: "medium", timeEstimate: "10 min", category: "Growth" },
    { id: "bm4", title: "Update local listings", description: "Ensure hours and info are current", icon: MapPin, action: "website-builder", impact: "low", timeEstimate: "5 min", category: "Presence" },
  ],
  agency: [
    { id: "ag1", title: "Check proposal engagement", description: "Acme Corp viewed your proposal 3 times", icon: FileText, action: "proposals", impact: "high", timeEstimate: "2 min", category: "Sales" },
    { id: "ag2", title: "Review team utilization", description: "2 team members under 60% utilization", icon: Users, action: "operations", impact: "medium", timeEstimate: "5 min", category: "Operations" },
    { id: "ag3", title: "Prepare retainer invoices", description: "3 monthly retainers due for billing", icon: Receipt, action: "invoices", impact: "high", timeEstimate: "5 min", category: "Revenue" },
    { id: "ag4", title: "Update revenue forecast", description: "Pipeline changes may affect Q2 projections", icon: TrendingUp, action: "revenue-forecast", impact: "medium", timeEstimate: "3 min", category: "Planning" },
    { id: "ag5", title: "Review deliverable status", description: "4 deliverables due this week", icon: Target, action: "crm-tasks", impact: "high", timeEstimate: "5 min", category: "Delivery" },
  ],
  "appointment-based": [
    { id: "ab1", title: "Prepare for next session", description: "Review notes for your 2:00 PM appointment", icon: Calendar, action: "appointments", impact: "high", timeEstimate: "3 min", category: "Preparation" },
    { id: "ab2", title: "Rebook no-shows", description: "2 no-shows from yesterday — offer new slots", icon: RefreshCw, action: "lead-recovery", impact: "high", timeEstimate: "5 min", category: "Revenue" },
    { id: "ab3", title: "Bill unbilled sessions", description: "5 sessions from this week not yet invoiced", icon: Receipt, action: "invoices", impact: "high", timeEstimate: "5 min", category: "Billing" },
    { id: "ab4", title: "Send reminder messages", description: "Tomorrow's clients need confirmation texts", icon: Mail, action: "crm-automations", impact: "medium", timeEstimate: "2 min", category: "Communication" },
  ],
  "employee-based": [
    { id: "eb1", title: "Review overdue tasks", description: "6 tasks overdue across your team", icon: Clock, action: "crm-tasks", impact: "high", timeEstimate: "5 min", category: "Operations" },
    { id: "eb2", title: "Check team capacity", description: "2 team members at 100% workload", icon: Users, action: "operations", impact: "medium", timeEstimate: "3 min", category: "Team" },
    { id: "eb3", title: "Update client on progress", description: "3 projects need status updates", icon: Mail, action: "crm-communications", impact: "medium", timeEstimate: "10 min", category: "Communication" },
    { id: "eb4", title: "Clear blocked items", description: "2 tasks blocked and waiting for input", icon: Zap, action: "crm-tasks", impact: "high", timeEstimate: "5 min", category: "Unblocking" },
  ],
};

const IMPACT_STYLES: Record<string, { dot: string; label: string }> = {
  high: { dot: "bg-[hsl(var(--destructive))]", label: "High Impact" },
  medium: { dot: "bg-[hsl(var(--sita-gold))]", label: "Medium" },
  low: { dot: "bg-foreground/25", label: "Low" },
};

export default function AdaptiveSmartSuggestions() {
  const { primaryMode } = useBusinessProfile();
  const identity = getIdentityLayer(primaryMode);
  const { navigateTo } = useBusinessNavigation();
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState(true);

  const suggestions = useMemo(() => {
    const base = ARCHETYPE_SUGGESTIONS[primaryMode] || ARCHETYPE_SUGGESTIONS.service || [];
    return base.filter(s => !dismissedIds.has(s.id));
  }, [primaryMode, dismissedIds]);

  const displaySuggestions = expanded ? suggestions : suggestions.slice(0, 2);

  if (suggestions.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="rounded-xl overflow-hidden"
      style={{
        border: `1px solid hsl(${identity.accentColor} / 0.1)`,
        background: `linear-gradient(135deg, hsl(${identity.accentColor} / 0.03), transparent)`,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Sparkles size={12} style={{ color: `hsl(${identity.accentColor})` }} />
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-foreground/40">
            Smart Suggestions
          </span>
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-foreground/5 text-foreground/25">
            {suggestions.length}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="text-foreground/25 hover:text-foreground/50 transition-colors"
        >
          {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
      </div>

      {/* Suggestion cards */}
      <div className="px-3 pb-3 space-y-1.5">
        <AnimatePresence mode="popLayout">
          {displaySuggestions.map((suggestion, idx) => {
            const impact = IMPACT_STYLES[suggestion.impact];
            return (
              <motion.div
                key={suggestion.id}
                layout
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ delay: idx * 0.03 }}
                className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[hsl(0_0%_100%/0.02)] hover:bg-[hsl(0_0%_100%/0.05)] transition-colors group cursor-pointer"
                onClick={() => navigateTo(suggestion.action)}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: `hsl(${identity.accentColor} / 0.08)` }}
                >
                  <suggestion.icon
                    size={13}
                    style={{ color: `hsl(${identity.accentColor} / 0.7)` }}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-semibold text-foreground/70 group-hover:text-foreground/90 transition-colors truncate">
                      {suggestion.title}
                    </span>
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${impact.dot}`} />
                  </div>
                  <p className="text-[9px] text-foreground/30 truncate">
                    {suggestion.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[8px] text-foreground/20">{suggestion.timeEstimate}</span>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setDismissedIds(prev => new Set([...prev, suggestion.id])); }}
                    className="opacity-0 group-hover:opacity-100 text-foreground/20 hover:text-foreground/50 transition-all"
                  >
                    <X size={10} />
                  </button>
                  <ArrowRight
                    size={11}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: `hsl(${identity.accentColor})` }}
                  />
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {!expanded && suggestions.length > 2 && (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="w-full text-center text-[9px] text-foreground/25 hover:text-foreground/50 py-1 transition-colors"
          >
            +{suggestions.length - 2} more suggestions
          </button>
        )}
      </div>
    </motion.div>
  );
}
