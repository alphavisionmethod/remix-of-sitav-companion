// ═══════════════════════════════════════════════════════════════
// Profile Template Gallery — CRM pipelines, quotes, comms,
// dashboard compositions, boardroom agendas, and starter packs
// ═══════════════════════════════════════════════════════════════

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package, BarChart3, FileText, Mail, LayoutDashboard,
  Crosshair, Zap, Check, ChevronRight, Star, ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useBusinessProfile } from "@/modules/business/hooks/useBusinessProfile";
import { getIdentityLayer } from "@/domains/engines/business-identity-layers";
import type { ProfileArchetype } from "@/domains/engines/business-profile-engine";

type TemplateCategory = "pipeline" | "quotes" | "communications" | "dashboard" | "boardroom" | "starter-pack";

interface Template {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  archetypes: ProfileArchetype[];
  preview: string[];
  recommended?: boolean;
}

const CATEGORY_CONFIG: Record<TemplateCategory, { label: string; icon: React.ElementType; color: string }> = {
  pipeline: { label: "CRM Pipelines", icon: BarChart3, color: "217 80% 55%" },
  quotes: { label: "Quote Templates", icon: FileText, color: "38 85% 58%" },
  communications: { label: "Communication Drafts", icon: Mail, color: "280 55% 58%" },
  dashboard: { label: "Dashboard Layouts", icon: LayoutDashboard, color: "152 55% 48%" },
  boardroom: { label: "Boardroom Agendas", icon: Crosshair, color: "265 55% 58%" },
  "starter-pack": { label: "Starter Packs", icon: Package, color: "var(--sita-gold)" },
};

const TEMPLATES: Template[] = [
  // CRM Pipelines
  { id: "pip-service", name: "Service Pipeline", description: "Lead → Consultation → Proposal → Negotiation → Won", category: "pipeline", archetypes: ["service", "professional-practice"], preview: ["Lead", "Consultation", "Proposal Sent", "Negotiation", "Won", "In Delivery"], recommended: true },
  { id: "pip-b2b", name: "B2B / Enterprise Pipeline", description: "Target → Discovery → Stakeholder → Negotiation → Closed", category: "pipeline", archetypes: ["agency", "service"], preview: ["Target Account", "Discovery", "Stakeholder Mapping", "Proposal", "Negotiation", "Closed"] },
  { id: "pip-ecommerce", name: "E-Commerce Funnel", description: "Browse → Cart → Checkout → Fulfilled → Repeat", category: "pipeline", archetypes: ["ecommerce", "marketplace"], preview: ["Browsing", "Cart Added", "Checkout", "Order Placed", "Fulfilled", "Repeat"], recommended: true },
  { id: "pip-local", name: "Local Business Flow", description: "Walk-in → Engaged → Purchase → Follow-up → Repeat", category: "pipeline", archetypes: ["brick-and-mortar", "appointment-based"], preview: ["Walk-in", "Engaged", "Purchase", "Follow-up", "Loyal Customer"], recommended: true },
  { id: "pip-agency", name: "Agency Deal Flow", description: "Prospect → Discovery → Proposal → Onboarding → Active", category: "pipeline", archetypes: ["agency"], preview: ["Prospect", "Discovery", "Proposal", "Onboarding", "Active", "Renewal"], recommended: true },

  // Quote Templates
  { id: "qt-simple", name: "Simple Service Estimate", description: "Clean, one-page estimate for quick jobs", category: "quotes", archetypes: ["service", "brick-and-mortar", "appointment-based"], preview: ["Client info", "Service items", "Total", "Terms"] },
  { id: "qt-consult", name: "Consult-Based Proposal", description: "Discovery-driven proposal with recommendations", category: "quotes", archetypes: ["service", "agency", "professional-practice"], preview: ["Executive summary", "Discovery findings", "Recommendations", "Pricing tiers", "Timeline"], recommended: true },
  { id: "qt-enterprise", name: "Enterprise Proposal", description: "Multi-stakeholder proposal with ROI projections", category: "quotes", archetypes: ["agency"], preview: ["Cover page", "Challenge analysis", "Solution design", "ROI projection", "Team & timeline", "Investment"], recommended: true },
  { id: "qt-recurring", name: "Recurring Service Package", description: "Monthly/annual service retainer pricing", category: "quotes", archetypes: ["agency", "service", "membership"], preview: ["Package tiers", "Deliverables", "SLA terms", "Pricing", "Renewal terms"] },

  // Communication Drafts
  { id: "cm-first-response", name: "First Response", description: "Professional acknowledgment of initial inquiry", category: "communications", archetypes: ["service", "agency", "appointment-based", "brick-and-mortar", "ecommerce"], preview: ["Thank you for reaching out", "We understand your needs", "Next steps", "Calendar link"] },
  { id: "cm-quote-followup", name: "Quote Follow-Up", description: "Gentle nudge after sending a proposal", category: "communications", archetypes: ["service", "agency", "professional-practice"], preview: ["Checking in on proposal", "Value reminder", "Open for questions", "Available times"], recommended: true },
  { id: "cm-consult-reminder", name: "Consultation Reminder", description: "Pre-meeting prep and logistics", category: "communications", archetypes: ["service", "appointment-based", "professional-practice"], preview: ["Appointment details", "Prep instructions", "What to bring", "Rescheduling option"] },
  { id: "cm-reactivation", name: "Reactivation Outreach", description: "Re-engage a dormant client or lead", category: "communications", archetypes: ["service", "agency", "ecommerce", "membership"], preview: ["We miss you", "What's new", "Special offer", "Easy reconnect CTA"] },
  { id: "cm-local-reminder", name: "Local Appointment Reminder", description: "Friendly local business appointment reminder", category: "communications", archetypes: ["brick-and-mortar", "appointment-based"], preview: ["Appointment tomorrow", "Location & parking", "What to bring", "Contact info"] },

  // Dashboard Compositions
  { id: "db-service", name: "Service-Focused Home", description: "Pipeline, proposals, follow-ups, scheduling", category: "dashboard", archetypes: ["service", "professional-practice"], preview: ["Pipeline value", "Pending proposals", "Follow-up queue", "Scheduling load"], recommended: true },
  { id: "db-ecommerce", name: "E-Commerce Home", description: "Orders, conversion, cart recovery, LTV", category: "dashboard", archetypes: ["ecommerce", "marketplace"], preview: ["Orders today", "Conversion rate", "Cart recovery", "Customer LTV"], recommended: true },
  { id: "db-team", name: "Team Operations Home", description: "Assignments, workload, handoffs, accountability", category: "dashboard", archetypes: ["employee-based", "agency"], preview: ["Active tasks", "Team utilization", "Overdue items", "Handoff queue"], recommended: true },
  { id: "db-local", name: "Local Business Home", description: "Appointments, traffic, staffing, reputation", category: "dashboard", archetypes: ["brick-and-mortar", "appointment-based"], preview: ["Today's schedule", "Walk-in traffic", "Staff coverage", "Reviews"] },

  // Boardroom Agendas
  { id: "br-service", name: "Service Review Agenda", description: "Pipeline health, proposal velocity, delivery capacity", category: "boardroom", archetypes: ["service", "professional-practice"], preview: ["Pipeline gaps", "Proposal stalls", "Delivery risk", "Payment delays", "Key accounts"], recommended: true },
  { id: "br-ecommerce", name: "E-Commerce Review Agenda", description: "Conversion, retention, support, campaigns", category: "boardroom", archetypes: ["ecommerce"], preview: ["Revenue leaks", "Conversion drops", "Retention risk", "Campaign efficiency", "Support escalations"] },
  { id: "br-team", name: "Team Operations Agenda", description: "Workload, execution, accountability, staffing", category: "boardroom", archetypes: ["employee-based"], preview: ["Workload concentration", "Execution bottlenecks", "Accountability gaps", "Staffing needs"] },
  { id: "br-agency", name: "Agency Strategy Agenda", description: "Client health, pipeline, utilization, margins", category: "boardroom", archetypes: ["agency"], preview: ["At-risk clients", "Pipeline coverage", "Utilization trends", "Project margins", "Expansion pipeline"], recommended: true },

  // Starter Packs
  { id: "sp-service", name: "Service Business Starter", description: "Pipeline + workflows + advisors + home layout for service businesses", category: "starter-pack", archetypes: ["service"], preview: ["Service pipeline", "Lead intake workflow", "Proposal follow-up", "Invoice chain", "5 advisors", "Service home layout"], recommended: true },
  { id: "sp-ecommerce", name: "E-Commerce Starter", description: "Order funnel + cart recovery + retention + advisors", category: "starter-pack", archetypes: ["ecommerce"], preview: ["E-commerce funnel", "Cart recovery workflow", "Retention sequence", "4 advisors", "E-commerce home layout"], recommended: true },
  { id: "sp-agency", name: "Agency Starter", description: "Deal flow + client onboarding + project tracking + advisors", category: "starter-pack", archetypes: ["agency"], preview: ["Agency pipeline", "Client onboarding", "Project checkpoints", "6 advisors", "Agency home layout"], recommended: true },
  { id: "sp-local", name: "Local Business Starter", description: "Appointments + reminders + loyalty + local ops", category: "starter-pack", archetypes: ["brick-and-mortar", "appointment-based"], preview: ["Local pipeline", "Appointment reminders", "No-show recovery", "Repeat outreach", "Local home layout"], recommended: true },
];

export default function ProfileTemplateGallery() {
  const { primaryMode } = useBusinessProfile();
  const identity = getIdentityLayer(primaryMode);
  const [activeCategory, setActiveCategory] = useState<TemplateCategory>("starter-pack");
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());

  const categories = Object.entries(CATEGORY_CONFIG) as [TemplateCategory, typeof CATEGORY_CONFIG[TemplateCategory]][];

  const filteredTemplates = TEMPLATES
    .filter(t => t.category === activeCategory)
    .sort((a, b) => {
      const aMatch = a.archetypes.includes(primaryMode) ? 0 : 1;
      const bMatch = b.archetypes.includes(primaryMode) ? 0 : 1;
      if (aMatch !== bMatch) return aMatch - bMatch;
      return (b.recommended ? 1 : 0) - (a.recommended ? 1 : 0);
    });

  const handleApply = (id: string) => {
    setAppliedIds(prev => new Set([...prev, id]));
  };

  return (
    <div className="p-5 space-y-5 max-w-4xl">
      {/* Category tabs */}
      <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
        {categories.map(([id, config]) => {
          const Icon = config.icon;
          const isActive = activeCategory === id;
          const count = TEMPLATES.filter(t => t.category === id && t.archetypes.includes(primaryMode)).length;
          return (
            <button
              key={id}
              onClick={() => setActiveCategory(id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-medium transition-all whitespace-nowrap",
                isActive
                  ? "bg-[hsl(0_0%_100%/0.08)] text-foreground/80 border border-[hsl(0_0%_100%/0.1)]"
                  : "text-foreground/35 hover:text-foreground/55 hover:bg-[hsl(0_0%_100%/0.03)]"
              )}
            >
              <Icon size={11} />
              {config.label}
              {count > 0 && <span className="text-[8px] text-foreground/20">{count}</span>}
            </button>
          );
        })}
      </div>

      {/* Template cards */}
      <div className="grid gap-3 sm:grid-cols-2">
        <AnimatePresence mode="popLayout">
          {filteredTemplates.map((template, i) => {
            const isMatch = template.archetypes.includes(primaryMode);
            const isApplied = appliedIds.has(template.id);
            const catConfig = CATEGORY_CONFIG[template.category];

            return (
              <motion.div
                key={template.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.04 }}
                className={cn(
                  "rounded-xl border p-4 transition-all group",
                  isMatch && template.recommended
                    ? `border-[hsl(${catConfig.color}/0.25)] bg-[hsl(${catConfig.color}/0.04)]`
                    : "border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)]",
                  !isMatch && "opacity-60"
                )}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-semibold text-foreground/75">{template.name}</span>
                    {template.recommended && isMatch && (
                      <Star size={10} className="text-[hsl(var(--sita-gold))]" fill="currentColor" />
                    )}
                  </div>
                  {isApplied ? (
                    <span className="flex items-center gap-1 text-[9px] text-[hsl(var(--trust-safe))] font-medium">
                      <Check size={10} /> Applied
                    </span>
                  ) : (
                    <button
                      onClick={() => handleApply(template.id)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-medium bg-[hsl(var(--sita-purple))]/10 text-[hsl(var(--sita-purple))] opacity-0 group-hover:opacity-100 transition-all hover:bg-[hsl(var(--sita-purple))]/20"
                    >
                      Apply <ChevronRight size={10} />
                    </button>
                  )}
                </div>

                <p className="text-[10px] text-foreground/35 mb-3">{template.description}</p>

                {/* Preview steps/items */}
                <div className="flex flex-wrap gap-1">
                  {template.preview.map((item, idx) => (
                    <span
                      key={idx}
                      className={cn(
                        "text-[8px] px-2 py-0.5 rounded-full font-medium",
                        template.category === "pipeline"
                          ? "bg-[hsl(217_80%_55%/0.08)] text-[hsl(217_80%_55%/0.7)]"
                          : "bg-foreground/5 text-foreground/35"
                      )}
                    >
                      {template.category === "pipeline" && idx < template.preview.length - 1 ? `${idx + 1}. ` : ""}
                      {item}
                    </span>
                  ))}
                </div>

                {/* Match badge */}
                {isMatch && (
                  <div className="mt-3 pt-2 border-t border-[hsl(0_0%_100%/0.04)]">
                    <span className="text-[8px] text-foreground/20">
                      {template.recommended ? "✨ Recommended for your profile" : "Compatible with your profile"}
                    </span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <p className="text-[12px] text-foreground/30">No templates in this category yet</p>
        </div>
      )}
    </div>
  );
}
