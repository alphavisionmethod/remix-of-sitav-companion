// ═══════════════════════════════════════════════════════════════
// Enhanced Adaptive Empty State — Premium visuals, animations,
// recommendation cards, progress indicators, and aspirational SVGs
// ═══════════════════════════════════════════════════════════════

import React from "react";
import { motion } from "framer-motion";
import {
  ShoppingCart, Briefcase, Calendar, Users, Receipt,
  FileText, Phone, Target, Plus, ArrowRight, Sparkles,
  Package, MapPin, CreditCard, Heart, Globe, CheckCircle,
  Zap, BarChart3, Clock,
} from "lucide-react";
import { useBusinessProfile } from "@/hooks/useBusinessProfile";
import { getIdentityLayer } from "@/domains/engines/business-identity-layers";
import { useBusinessNavigation } from "@/modules/business/contexts/BusinessNavigationContext";
import type { ProfileArchetype } from "@/domains/engines/business-profile-engine";

interface ContextConfig {
  icon: React.ElementType;
  title: string;
  description: string;
  ctas: { label: string; action: string; primary?: boolean }[];
  recommendations?: { label: string; time: string; icon: React.ElementType }[];
  connectionHint?: string;
}

type PageContext =
  | "contacts" | "pipeline" | "invoices" | "proposals"
  | "leads" | "tasks" | "appointments" | "automations"
  | "communications" | "documents" | "forecast";

const EMPTY_CONFIGS: Record<string, Record<string, ContextConfig>> = {
  ecommerce: {
    contacts: { icon: Users, title: "No customers yet", description: "Start by importing your customer list or connecting your store", ctas: [{ label: "Import Customers", action: "crm-import", primary: true }, { label: "Connect Store", action: "integrations" }], recommendations: [{ label: "Connect your store platform", time: "2 min", icon: ShoppingCart }, { label: "Import existing customers", time: "5 min", icon: Users }], connectionHint: "Connecting your store will auto-sync customers, orders, and cart data." },
    pipeline: { icon: ShoppingCart, title: "No orders in pipeline", description: "Orders will appear here once your store is connected", ctas: [{ label: "Connect Store", action: "integrations", primary: true }], connectionHint: "Your order funnel will populate automatically from your e-commerce platform." },
    leads: { icon: Target, title: "No cart leads yet", description: "Abandoned carts and signup leads will appear here", ctas: [{ label: "Set Up Cart Recovery", action: "crm-automations", primary: true }], recommendations: [{ label: "Configure cart recovery automation", time: "3 min", icon: Zap }, { label: "Set up email capture", time: "5 min", icon: Target }] },
  },
  service: {
    contacts: { icon: Users, title: "No clients yet", description: "Add your first client to start building relationships", ctas: [{ label: "Add Client", action: "crm-contacts", primary: true }, { label: "Import CSV", action: "crm-import" }], recommendations: [{ label: "Add your first client", time: "1 min", icon: Users }, { label: "Import from CSV", time: "3 min", icon: FileText }, { label: "Set up your pipeline", time: "2 min", icon: BarChart3 }] },
    pipeline: { icon: Briefcase, title: "No active deals", description: "Create your first opportunity to start tracking revenue", ctas: [{ label: "Create Opportunity", action: "crm-pipeline", primary: true }], connectionHint: "For service businesses, this is where new inquiries, qualified leads, and proposals are tracked." },
    proposals: { icon: FileText, title: "No proposals yet", description: "Create a proposal to win your next client", ctas: [{ label: "Create Proposal", action: "proposals", primary: true }, { label: "Browse Templates", action: "proposals" }], recommendations: [{ label: "Use a profile-matched template", time: "2 min", icon: Sparkles }] },
    leads: { icon: Phone, title: "No leads in inbox", description: "Add leads manually or connect a form to capture them", ctas: [{ label: "Add Lead", action: "leads-inbox", primary: true }] },
  },
  "appointment-based": {
    contacts: { icon: Users, title: "No clients booked", description: "Add your first client or set up online booking", ctas: [{ label: "Add Client", action: "crm-contacts", primary: true }, { label: "Set Up Booking", action: "appointments" }], connectionHint: "Because your business is appointment-heavy, connecting scheduling will make this area much more powerful." },
    appointments: { icon: Calendar, title: "No appointments scheduled", description: "Create your first appointment or enable online booking", ctas: [{ label: "Schedule Appointment", action: "appointments", primary: true }], recommendations: [{ label: "Create your first appointment", time: "1 min", icon: Calendar }, { label: "Set up reminder automation", time: "3 min", icon: Clock }] },
  },
  agency: {
    contacts: { icon: Users, title: "No clients onboarded", description: "Import your client roster or add your first account", ctas: [{ label: "Add Client", action: "crm-contacts", primary: true }, { label: "Import Roster", action: "crm-import" }] },
    pipeline: { icon: Target, title: "No active pitches", description: "Start tracking opportunities in your pipeline", ctas: [{ label: "Add Opportunity", action: "crm-pipeline", primary: true }], recommendations: [{ label: "Use the Agency Pipeline template", time: "1 min", icon: Sparkles }, { label: "Import existing deals", time: "3 min", icon: FileText }] },
    proposals: { icon: FileText, title: "No pitches created", description: "Create a pitch deck to send to prospects", ctas: [{ label: "Create Pitch", action: "proposals", primary: true }] },
  },
  "brick-and-mortar": {
    contacts: { icon: MapPin, title: "No customers tracked", description: "Start building your customer database", ctas: [{ label: "Add Customer", action: "crm-contacts", primary: true }], connectionHint: "Your Business Home will begin surfacing walk-in traffic, scheduling risk, and repeat visit patterns once connected." },
    leads: { icon: MapPin, title: "No walk-in leads", description: "Track walk-ins and inquiries to grow your customer base", ctas: [{ label: "Add Lead", action: "leads-inbox", primary: true }] },
  },
};

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

function AspirationalIllustration({ accentColor }: { accentColor: string }) {
  return (
    <svg width="120" height="80" viewBox="0 0 120 80" fill="none" className="mb-4">
      <motion.rect x="10" y="30" width="25" height="40" rx="4" fill={`hsl(${accentColor} / 0.08)`} stroke={`hsl(${accentColor} / 0.15)`} strokeWidth="1"
        initial={{ height: 0, y: 70 }} animate={{ height: 40, y: 30 }} transition={{ duration: 0.6, delay: 0.1 }} />
      <motion.rect x="40" y="15" width="25" height="55" rx="4" fill={`hsl(${accentColor} / 0.12)`} stroke={`hsl(${accentColor} / 0.2)`} strokeWidth="1"
        initial={{ height: 0, y: 70 }} animate={{ height: 55, y: 15 }} transition={{ duration: 0.6, delay: 0.2 }} />
      <motion.rect x="70" y="25" width="25" height="45" rx="4" fill={`hsl(${accentColor} / 0.08)`} stroke={`hsl(${accentColor} / 0.15)`} strokeWidth="1"
        initial={{ height: 0, y: 70 }} animate={{ height: 45, y: 25 }} transition={{ duration: 0.6, delay: 0.3 }} />
      <motion.circle cx="22" cy="22" r="6" fill={`hsl(${accentColor} / 0.15)`}
        initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: "spring" }} />
      <motion.circle cx="52" cy="8" r="4" fill={`hsl(${accentColor} / 0.2)`}
        initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.6, type: "spring" }} />
      <motion.circle cx="82" cy="18" r="5" fill={`hsl(${accentColor} / 0.15)`}
        initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.7, type: "spring" }} />
      <motion.path d="M22 28 L52 13 L82 23" stroke={`hsl(${accentColor} / 0.2)`} strokeWidth="1.5" strokeDasharray="4 2" fill="none"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, delay: 0.4 }} />
    </svg>
  );
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`flex flex-col items-center justify-center py-16 px-8 text-center ${className || ""}`}
    >
      {/* Aspirational illustration */}
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.05 }}>
        <AspirationalIllustration accentColor={identity.accentColor} />
      </motion.div>

      {/* Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.15, type: "spring", damping: 12 }}
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
        style={{
          background: `linear-gradient(135deg, hsl(${identity.accentColor} / 0.12), hsl(${identity.accentColor} / 0.04))`,
          border: `1px solid hsl(${identity.accentColor} / 0.12)`,
        }}
      >
        <Icon size={22} style={{ color: `hsl(${identity.accentColor} / 0.6)` }} />
      </motion.div>

      {/* Text */}
      <motion.h3 initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="text-[14px] font-bold text-foreground/70 mb-1.5">{config.title}</motion.h3>
      <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className="text-[11px] text-foreground/30 max-w-[300px] mb-4">{config.description}</motion.p>

      {/* Connection hint */}
      {config.connectionHint && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="text-[10px] text-foreground/20 italic mb-5 max-w-[280px] leading-relaxed">
          {config.connectionHint}
        </motion.p>
      )}

      {/* CTAs */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
        className="flex items-center gap-2 mb-6">
        {config.ctas.map((cta) => (
          <motion.button
            key={cta.label}
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigateTo(cta.action)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[11px] font-medium transition-colors ${
              cta.primary
                ? "text-white shadow-lg"
                : "bg-[hsl(0_0%_100%/0.04)] text-foreground/50 hover:bg-[hsl(0_0%_100%/0.08)] border border-[hsl(0_0%_100%/0.06)]"
            }`}
            style={cta.primary ? {
              background: `linear-gradient(135deg, hsl(${identity.gradientPair[0]}), hsl(${identity.gradientPair[1]}))`,
            } : undefined}
          >
            {cta.primary ? <Plus size={12} /> : <ArrowRight size={12} />}
            {cta.label}
          </motion.button>
        ))}
      </motion.div>

      {/* Recommendation cards */}
      {config.recommendations && config.recommendations.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="w-full max-w-[340px] space-y-1.5">
          <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-foreground/20 mb-2">What to do next</p>
          {config.recommendations.map((rec, i) => {
            const RecIcon = rec.icon;
            return (
              <motion.div
                key={rec.label}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.45 + i * 0.08 }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-[hsl(0_0%_100%/0.02)] border border-[hsl(0_0%_100%/0.05)] hover:border-[hsl(0_0%_100%/0.1)] transition-colors cursor-pointer"
              >
                <RecIcon size={12} style={{ color: `hsl(${identity.accentColor} / 0.5)` }} />
                <span className="text-[10px] text-foreground/45 flex-1 text-left">{rec.label}</span>
                <span className="text-[8px] text-foreground/20 shrink-0">{rec.time}</span>
                <CheckCircle size={10} className="text-foreground/10 shrink-0" />
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </motion.div>
  );
}
