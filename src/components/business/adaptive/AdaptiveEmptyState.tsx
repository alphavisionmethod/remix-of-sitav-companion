// ═══════════════════════════════════════════════════════════════
// Adaptive Empty State
// Archetype-aware empty state component that shows contextual
// messaging, relevant CTAs, and identity-matched visuals based
// on the user's business mode.
// ═══════════════════════════════════════════════════════════════

import React from "react";
import { motion } from "framer-motion";
import {
  ShoppingCart, Briefcase, Calendar, Users, Receipt,
  FileText, Phone, Target, Plus, ArrowRight, Sparkles,
  Package, MapPin, CreditCard, Heart, Globe,
} from "lucide-react";
import { useBusinessProfile } from "@/hooks/useBusinessProfile";
import { getIdentityLayer } from "@/lib/engines/business-identity-layers";
import { useBusinessNavigation } from "@/contexts/BusinessNavigationContext";
import type { ProfileArchetype } from "@/lib/engines/business-profile-engine";

interface ContextConfig {
  icon: React.ElementType;
  title: string;
  description: string;
  ctas: { label: string; action: string; primary?: boolean }[];
}

type PageContext =
  | "contacts" | "pipeline" | "invoices" | "proposals"
  | "leads" | "tasks" | "appointments" | "automations"
  | "communications" | "documents" | "forecast";

const EMPTY_CONFIGS: Record<string, Record<string, ContextConfig>> = {
  ecommerce: {
    contacts: { icon: Users, title: "No customers yet", description: "Start by importing your customer list or connecting your store", ctas: [{ label: "Import Customers", action: "crm-import", primary: true }, { label: "Connect Store", action: "integrations" }] },
    pipeline: { icon: ShoppingCart, title: "No orders in pipeline", description: "Orders will appear here once your store is connected", ctas: [{ label: "Connect Store", action: "integrations", primary: true }] },
    invoices: { icon: Receipt, title: "No payments tracked", description: "Payment records sync automatically from your platform", ctas: [{ label: "Connect Payment Provider", action: "integrations", primary: true }] },
    leads: { icon: Target, title: "No cart leads yet", description: "Abandoned carts and signup leads will appear here", ctas: [{ label: "Set Up Cart Recovery", action: "crm-automations", primary: true }] },
    forecast: { icon: Globe, title: "Build your revenue model", description: "Connect sales data to generate intelligent forecasts", ctas: [{ label: "Add Revenue Data", action: "integrations", primary: true }] },
  },
  service: {
    contacts: { icon: Users, title: "No clients yet", description: "Add your first client to start building relationships", ctas: [{ label: "Add Client", action: "crm-contacts", primary: true }, { label: "Import CSV", action: "crm-import" }] },
    pipeline: { icon: Briefcase, title: "No active deals", description: "Create your first opportunity to start tracking revenue", ctas: [{ label: "Create Opportunity", action: "crm-pipeline", primary: true }] },
    invoices: { icon: Receipt, title: "No invoices created", description: "Bill your clients for completed work", ctas: [{ label: "Create Invoice", action: "invoices", primary: true }] },
    proposals: { icon: FileText, title: "No proposals yet", description: "Create a proposal to win your next client", ctas: [{ label: "Create Proposal", action: "proposals", primary: true }, { label: "Browse Templates", action: "proposals" }] },
    leads: { icon: Phone, title: "No leads in inbox", description: "Add leads manually or connect a form to capture them", ctas: [{ label: "Add Lead", action: "leads-inbox", primary: true }] },
    forecast: { icon: Target, title: "Start forecasting", description: "Add pipeline data to project your revenue trajectory", ctas: [{ label: "Review Pipeline", action: "crm-pipeline", primary: true }] },
  },
  "appointment-based": {
    contacts: { icon: Users, title: "No clients booked", description: "Add your first client or set up online booking", ctas: [{ label: "Add Client", action: "crm-contacts", primary: true }, { label: "Set Up Booking", action: "appointments" }] },
    appointments: { icon: Calendar, title: "No appointments scheduled", description: "Create your first appointment or enable online booking", ctas: [{ label: "Schedule Appointment", action: "appointments", primary: true }] },
    invoices: { icon: Receipt, title: "No sessions billed", description: "Bill clients for completed sessions", ctas: [{ label: "Create Bill", action: "invoices", primary: true }] },
    leads: { icon: Calendar, title: "No booking inquiries", description: "Share your booking link to start receiving requests", ctas: [{ label: "Create Booking Link", action: "appointments", primary: true }] },
  },
  agency: {
    contacts: { icon: Users, title: "No clients onboarded", description: "Import your client roster or add your first account", ctas: [{ label: "Add Client", action: "crm-contacts", primary: true }, { label: "Import Roster", action: "crm-import" }] },
    pipeline: { icon: Target, title: "No active pitches", description: "Start tracking opportunities in your pipeline", ctas: [{ label: "Add Opportunity", action: "crm-pipeline", primary: true }] },
    proposals: { icon: FileText, title: "No pitches created", description: "Create a pitch deck to send to prospects", ctas: [{ label: "Create Pitch", action: "proposals", primary: true }] },
    tasks: { icon: Users, title: "No deliverables tracked", description: "Create tasks for your team's active projects", ctas: [{ label: "Create Task", action: "crm-tasks", primary: true }] },
  },
  "brick-and-mortar": {
    contacts: { icon: MapPin, title: "No customers tracked", description: "Start building your customer database", ctas: [{ label: "Add Customer", action: "crm-contacts", primary: true }] },
    leads: { icon: MapPin, title: "No walk-in leads", description: "Track walk-ins and inquiries to grow your customer base", ctas: [{ label: "Add Lead", action: "leads-inbox", primary: true }] },
  },
  membership: {
    contacts: { icon: Heart, title: "No members yet", description: "Start onboarding your first members", ctas: [{ label: "Add Member", action: "crm-contacts", primary: true }] },
    invoices: { icon: CreditCard, title: "No billing records", description: "Set up recurring membership billing", ctas: [{ label: "Set Up Billing", action: "invoices", primary: true }] },
  },
};

// Fallback for any archetype not explicitly defined
const DEFAULT_CONFIGS: Record<string, ContextConfig> = {
  contacts: { icon: Users, title: "No contacts yet", description: "Add your first contact to get started", ctas: [{ label: "Add Contact", action: "crm-contacts", primary: true }, { label: "Import", action: "crm-import" }] },
  pipeline: { icon: Target, title: "No deals in pipeline", description: "Create an opportunity to start tracking", ctas: [{ label: "Create Deal", action: "crm-pipeline", primary: true }] },
  invoices: { icon: Receipt, title: "No invoices yet", description: "Create your first invoice", ctas: [{ label: "Create Invoice", action: "invoices", primary: true }] },
  proposals: { icon: FileText, title: "No proposals yet", description: "Write your first proposal", ctas: [{ label: "Create Proposal", action: "proposals", primary: true }] },
  leads: { icon: Phone, title: "No leads yet", description: "Add or import leads", ctas: [{ label: "Add Lead", action: "leads-inbox", primary: true }] },
  tasks: { icon: Package, title: "No tasks yet", description: "Create your first task", ctas: [{ label: "Create Task", action: "crm-tasks", primary: true }] },
  appointments: { icon: Calendar, title: "No appointments", description: "Schedule your first appointment", ctas: [{ label: "Schedule", action: "appointments", primary: true }] },
  automations: { icon: Sparkles, title: "No automations", description: "Set up your first workflow", ctas: [{ label: "Create Automation", action: "crm-automations", primary: true }] },
  communications: { icon: Phone, title: "No communications logged", description: "Record calls, emails, and meetings", ctas: [{ label: "Log Communication", action: "crm-communications", primary: true }] },
  documents: { icon: FileText, title: "No documents", description: "Upload or create your first document", ctas: [{ label: "Add Document", action: "documents", primary: true }] },
  forecast: { icon: Target, title: "No forecast data", description: "Add data to generate projections", ctas: [{ label: "Get Started", action: "revenue-forecast", primary: true }] },
};

interface Props {
  context: PageContext;
  className?: string;
}

export default function AdaptiveEmptyState({ context, className }: Props) {
  const { primaryMode } = useBusinessProfile();
  const identity = getIdentityLayer(primaryMode);
  const { navigateTo } = useBusinessNavigation();

  const archetypeConfigs = EMPTY_CONFIGS[primaryMode] || {};
  const config = archetypeConfigs[context] || DEFAULT_CONFIGS[context] || DEFAULT_CONFIGS.contacts;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col items-center justify-center py-16 px-8 text-center ${className || ""}`}
    >
      {/* Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: "spring", damping: 12 }}
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
        style={{
          background: `linear-gradient(135deg, hsl(${identity.accentColor} / 0.1), hsl(${identity.accentColor} / 0.04))`,
          border: `1px solid hsl(${identity.accentColor} / 0.1)`,
        }}
      >
        <Icon size={24} style={{ color: `hsl(${identity.accentColor} / 0.5)` }} />
      </motion.div>

      {/* Text */}
      <h3 className="text-base font-bold text-foreground/70 mb-1.5">{config.title}</h3>
      <p className="text-xs text-foreground/30 max-w-[280px] mb-6">{config.description}</p>

      {/* Encouragement from identity */}
      <p className="text-[10px] text-foreground/20 italic mb-6 max-w-[260px]">
        {identity.emptyStateMessage}
      </p>

      {/* CTAs */}
      <div className="flex items-center gap-2">
        {config.ctas.map((cta) => (
          <motion.button
            key={cta.label}
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigateTo(cta.action)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
              cta.primary
                ? "text-[hsl(220_15%_6%)]"
                : "bg-[hsl(0_0%_100%/0.04)] text-foreground/50 hover:bg-[hsl(0_0%_100%/0.08)] border border-[hsl(0_0%_100%/0.06)]"
            }`}
            style={cta.primary ? {
              backgroundColor: `hsl(${identity.accentColor})`,
            } : undefined}
          >
            {cta.primary ? <Plus size={12} /> : <ArrowRight size={12} />}
            {cta.label}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
