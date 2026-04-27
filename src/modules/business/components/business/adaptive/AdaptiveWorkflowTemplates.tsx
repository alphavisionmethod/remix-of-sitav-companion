// ═══════════════════════════════════════════════════════════════
// Adaptive Workflow Templates
// Profile-aware workflow template gallery — only shows
// automations relevant to the user's business archetype.
// ═══════════════════════════════════════════════════════════════

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Zap, Play, Shield, Clock, Mail, Phone, RotateCcw, CalendarDays, ShoppingCart, Users, FileText, Bell, Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBusinessProfile } from "@/modules/business/hooks/useBusinessProfile";
import { getIdentityLayer } from "@/domains/engines/business-identity-layers";
import type { ProfileArchetype } from "@/domains/engines/business-profile-engine";

interface WorkflowTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: React.ElementType;
  steps: number;
  trustGate: "auto" | "suggest" | "approval";
  archetypes: ProfileArchetype[];
  emphasis: Record<string, "primary" | "secondary" | "tertiary">;
}

const TEMPLATES: WorkflowTemplate[] = [
  // Universal
  { id: "wf-follow-up", title: "Lead Follow-Up Sequence", description: "Auto-follow-up at 1, 3, and 7 days after initial contact", category: "Leads", icon: Mail, steps: 4, trustGate: "suggest", archetypes: ["service", "agency", "ecommerce", "brick-and-mortar", "appointment-based", "employee-based", "professional-practice"], emphasis: { service: "primary", agency: "primary", ecommerce: "secondary" } },
  { id: "wf-invoice-remind", title: "Invoice Reminder Chain", description: "Gentle reminders at 3, 7, 14 days overdue with escalation", category: "Collections", icon: Clock, steps: 5, trustGate: "auto", archetypes: ["service", "agency", "ecommerce", "brick-and-mortar", "appointment-based", "employee-based"], emphasis: { service: "primary", agency: "primary" } },

  // Ecommerce
  { id: "wf-cart-recovery", title: "Abandoned Cart Recovery", description: "3-step email sequence to recover abandoned carts", category: "Revenue", icon: ShoppingCart, steps: 3, trustGate: "auto", archetypes: ["ecommerce", "marketplace"], emphasis: { ecommerce: "primary" } },
  { id: "wf-post-purchase", title: "Post-Purchase Review Request", description: "Request review 7 days after delivery", category: "Retention", icon: FileText, steps: 2, trustGate: "auto", archetypes: ["ecommerce"], emphasis: { ecommerce: "primary" } },
  { id: "wf-winback", title: "Dormant Buyer Win-Back", description: "Re-engage buyers inactive for 30+ days", category: "Retention", icon: RotateCcw, steps: 4, trustGate: "suggest", archetypes: ["ecommerce", "membership"], emphasis: { ecommerce: "primary", membership: "primary" } },

  // Service / Agency
  { id: "wf-quote-followup", title: "Quote Follow-Up Sequence", description: "Follow up at 2, 5, and 10 days after sending quote", category: "Sales", icon: FileText, steps: 4, trustGate: "suggest", archetypes: ["service", "agency", "professional-practice"], emphasis: { service: "primary", agency: "primary" } },
  { id: "wf-onboarding", title: "Client Onboarding Workflow", description: "Welcome → kick-off → first check-in → 30-day review", category: "Delivery", icon: Users, steps: 5, trustGate: "suggest", archetypes: ["service", "agency"], emphasis: { service: "primary", agency: "primary" } },

  // Appointment-based
  { id: "wf-appt-confirm", title: "Appointment Confirmation", description: "SMS/email 24h before with prep instructions", category: "Scheduling", icon: CalendarDays, steps: 2, trustGate: "auto", archetypes: ["appointment-based", "professional-practice", "brick-and-mortar"], emphasis: { "appointment-based": "primary", "professional-practice": "primary" } },
  { id: "wf-noshow-recovery", title: "No-Show Recovery", description: "Outreach 1h after no-show with rebooking options", category: "Recovery", icon: RotateCcw, steps: 3, trustGate: "suggest", archetypes: ["appointment-based", "professional-practice"], emphasis: { "appointment-based": "primary" } },
  { id: "wf-post-visit", title: "Post-Visit Follow-Up", description: "Thank you + feedback request after appointment", category: "Retention", icon: Bell, steps: 2, trustGate: "auto", archetypes: ["appointment-based", "professional-practice"], emphasis: { "appointment-based": "primary" } },

  // Employee/Team
  { id: "wf-task-escalation", title: "Overdue Task Escalation", description: "Auto-escalate tasks overdue by 48h to manager", category: "Operations", icon: Shield, steps: 3, trustGate: "approval", archetypes: ["employee-based", "agency", "multi-location"], emphasis: { "employee-based": "primary", agency: "secondary" } },
  { id: "wf-handoff", title: "Client Handoff Workflow", description: "Structured handoff from sales to delivery with checklist", category: "Operations", icon: Users, steps: 4, trustGate: "suggest", archetypes: ["employee-based", "agency", "service"], emphasis: { "employee-based": "primary" } },
];

const TRUST_GATE_STYLES = {
  auto: { label: "Auto-Pilot", color: "text-[hsl(152_55%_48%)]", bg: "bg-[hsl(152_55%_48%/0.12)]" },
  suggest: { label: "Suggest Mode", color: "text-[hsl(38_85%_58%)]", bg: "bg-[hsl(38_85%_58%/0.12)]" },
  approval: { label: "Approval Required", color: "text-[hsl(265_55%_68%)]", bg: "bg-[hsl(265_55%_68%/0.12)]" },
};

export default function AdaptiveWorkflowTemplates() {
  const { primaryMode } = useBusinessProfile();
  const identity = getIdentityLayer(primaryMode);

  const filtered = useMemo(() => {
    return TEMPLATES
      .filter(t => t.archetypes.includes(primaryMode))
      .sort((a, b) => {
        const aEmph = a.emphasis[primaryMode] === "primary" ? 0 : a.emphasis[primaryMode] === "secondary" ? 1 : 2;
        const bEmph = b.emphasis[primaryMode] === "primary" ? 0 : b.emphasis[primaryMode] === "secondary" ? 1 : 2;
        return aEmph - bEmph;
      });
  }, [primaryMode]);

  const primaryTemplates = filtered.filter(t => t.emphasis[primaryMode] === "primary");
  const otherTemplates = filtered.filter(t => t.emphasis[primaryMode] !== "primary");

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 mb-1">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(265_55%_58%/0.12)]">
          <Zap className="h-4 w-4 text-[hsl(265_55%_68%)]" />
        </div>
        <div>
          <h3 className="text-[13px] font-semibold text-[hsl(0_0%_85%)]">Workflow Templates</h3>
          <p className="text-[10px] text-[hsl(0_0%_50%)]">Curated for your {identity.tagline.toLowerCase()} business</p>
        </div>
      </div>

      {primaryTemplates.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(0_0%_50%)]">Recommended</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {primaryTemplates.map((t, i) => (
              <TemplateCard key={t.id} template={t} index={i} recommended />
            ))}
          </div>
        </div>
      )}

      {otherTemplates.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(0_0%_50%)]">Also Available</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {otherTemplates.map((t, i) => (
              <TemplateCard key={t.id} template={t} index={i + primaryTemplates.length} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TemplateCard({ template, index, recommended }: { template: WorkflowTemplate; index: number; recommended?: boolean }) {
  const trustStyle = TRUST_GATE_STYLES[template.trustGate];
  const Icon = template.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.25 }}
      className={cn(
        "group rounded-xl border p-3 cursor-pointer transition-all micro-hover-lift",
        recommended
          ? "border-[hsl(265_55%_58%/0.25)] bg-[hsl(265_55%_58%/0.04)] hover:border-[hsl(265_55%_58%/0.40)]"
          : "border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] hover:border-[hsl(0_0%_100%/0.12)]"
      )}
    >
      <div className="flex items-start gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(0_0%_100%/0.06)] shrink-0">
          <Icon className="h-3.5 w-3.5 text-[hsl(0_0%_60%)]" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-medium text-[hsl(0_0%_85%)] truncate">{template.title}</p>
          <p className="text-[10px] text-[hsl(0_0%_50%)] mt-0.5 line-clamp-2">{template.description}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[9px] text-[hsl(0_0%_40%)]">{template.steps} steps</span>
            <span className="text-[9px] text-[hsl(0_0%_30%)]">·</span>
            <span className={cn("text-[9px] font-medium px-1.5 py-0.5 rounded-full", trustStyle.bg, trustStyle.color)}>
              {trustStyle.label}
            </span>
          </div>
        </div>
        <button className="px-2 py-1 rounded-md text-[10px] font-medium bg-[hsl(265_55%_58%/0.12)] text-[hsl(265_55%_68%)] opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          Use
        </button>
      </div>
    </motion.div>
  );
}
