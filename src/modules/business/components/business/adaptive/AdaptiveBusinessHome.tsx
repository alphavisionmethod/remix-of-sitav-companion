import React from "react";
import { motion } from "framer-motion";
import {
  TrendingUp, ShoppingCart, LineChart, Banknote, Target, Receipt,
  BarChart3, Calendar, Clock, Users, Heart, FileText, Phone,
  RefreshCw, Shield, Activity, Zap, CheckCircle, Package,
  Building2, ArrowRight, Headphones, MapPin, XCircle, Star,
  ClipboardList, Truck, AlertTriangle, Rocket, Brain, Pencil,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useBusinessProfile } from "@/modules/business/hooks/useBusinessProfile";
import { useBusinessNavigation } from "@/modules/business/contexts/BusinessNavigationContext";
import { getTopWidgets, type HomeWidget } from "./BusinessHomeWidgetRegistry";
import { getQuickActionsForProfile, getStatCardsForProfile } from "./AdaptiveCRMConfig";
import { getIdentityLayer, getTimeAwareGreeting } from "@/domains/engines/business-identity-layers";
import AdaptiveSmartSuggestions from "./AdaptiveSmartSuggestions";
import { useBusinessOnboarding } from "@/modules/business/hooks/useBusinessOnboarding";

const ICON_MAP: Record<string, React.ElementType> = {
  TrendingUp, ShoppingCart, LineChart, Banknote, Target, Receipt,
  BarChart3, Calendar, Clock, Users, Heart, FileText, Phone,
  RefreshCw, Shield, Activity, Zap, CheckCircle, Package,
  Building2, ArrowRight, Headphones, MapPin, XCircle, Star,
  ClipboardList, Truck,
};

const ARCHETYPE_LABELS: Record<string, string> = {
  ecommerce: "E-Commerce",
  "brick-and-mortar": "Local / Retail",
  service: "Service Business",
  "employee-based": "Team Operations",
  "appointment-based": "Appointment-Based",
  agency: "Agency / Consulting",
  "professional-practice": "Professional Practice",
  hybrid: "Hybrid",
  "multi-location": "Multi-Location",
  "product-service": "Product + Service",
  membership: "Membership / Subscription",
  marketplace: "Marketplace",
};

export default function AdaptiveBusinessHome() {
  const { weights, primaryMode, operatingFlags, adaptations } = useBusinessProfile();
  const { isCompleted: onboardingDone, savedState: obs } = useBusinessOnboarding();
  const { navigateTo } = useBusinessNavigation();
  const topWidgets = getTopWidgets(weights as unknown as Record<string, number>, 8);
  const quickActions = getQuickActionsForProfile(primaryMode, 4);
  const statCards = getStatCardsForProfile(primaryMode);
  const identity = getIdentityLayer(primaryMode);
  const greeting = getTimeAwareGreeting(primaryMode);

  /* ── Priority → module routing map ── */
  const PRIORITY_MODULE_MAP: Record<string, string> = {
    sales_followup: "leads",
    lost_leads: "lead-recovery",
    invoicing: "invoices",
    collections: "collections",
    profitability: "revenue-impact",
    customer_service: "support",
    client_comms: "communications",
    retention: "customer-health",
    customer_onboarding: "customers",
    reviews: "proof",
    scheduling: "appointments",
    inventory: "ecommerce",
    order_mgmt: "operations",
    workflow_auto: "revenue-autopilot",
    budgeting: "revenue-forecast",
    accounts_mgmt: "overview",
    imports_exports: "operations",
    reporting: "boardroom",
  };

  return (
    <div className="p-5 space-y-5">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-[16px] font-bold text-foreground/90">
            {greeting}
          </h1>
          <p className="text-[11px] text-foreground/40 mt-0.5">
            <span style={{ color: `hsl(${identity.accentColor})` }} className="font-semibold">{identity.tagline}</span>
            {" · "}{identity.tone.encouragement}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {quickActions.map((action) => {
            const Icon = ICON_MAP[action.icon] || Zap;
            return (
              <button
                key={action.id}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[hsl(0_0%_100%/0.08)] bg-[hsl(0_0%_100%/0.03)] text-[10px] font-medium text-foreground/50 hover:bg-[hsl(0_0%_100%/0.06)] hover:text-foreground/70 transition-colors"
              >
                <Icon size={11} />
                {action.label}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Stat cards */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-4 gap-3"
      >
        {statCards.map((card, i) => (
          <div
            key={card.id}
            className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-4"
          >
            <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-foreground/30 mb-1.5">
              {card.label}
            </p>
            <p className="text-[22px] font-bold text-foreground/85 leading-none mb-1">
              {card.value}
            </p>
            <p
              className={cn(
                "text-[10px] font-semibold",
                card.changeType === "positive" && "text-[hsl(var(--trust-safe))]",
                card.changeType === "negative" && "text-[hsl(var(--destructive))]",
                card.changeType === "neutral" && "text-foreground/40"
              )}
            >
              {card.change}
            </p>
          </div>
        ))}
      </motion.div>

      {/* Smart Suggestions */}
      <AdaptiveSmartSuggestions />

      {/* ── Post-Formation Sections (only when onboarding completed) ── */}
      {onboardingDone && obs.businessName && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="space-y-4">

          {/* Business Twin Card */}
          <div className="rounded-xl border border-primary/15 bg-primary/5 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Brain size={14} className="text-primary" />
                <p className="text-[11px] font-semibold text-foreground/80">Business Twin</p>
              </div>
              <button className="text-[9px] text-primary/60 hover:text-primary flex items-center gap-1 transition-colors">
                <Pencil size={9} /> Edit
              </button>
            </div>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3 text-[10px]">
              <div><p className="text-foreground/30 mb-0.5">Name</p><p className="font-medium text-foreground/70">{obs.businessName}</p></div>
              <div><p className="text-foreground/30 mb-0.5">Type</p><p className="font-medium text-foreground/70">{obs.businessTypes.join(", ") || "—"}</p></div>
              <div><p className="text-foreground/30 mb-0.5">Revenue</p><p className="font-medium text-foreground/70">{obs.revenueSources.slice(0, 2).join(", ") || "—"}</p></div>
              <div><p className="text-foreground/30 mb-0.5">Team</p><p className="font-medium text-foreground/70 capitalize">{obs.teamSize}</p></div>
              <div><p className="text-foreground/30 mb-0.5">Trust</p><p className="font-medium text-foreground/70 capitalize">{obs.automationLevel.replace(/_/g, " ")}</p></div>
              <div><p className="text-foreground/30 mb-0.5">Stage</p><p className="font-medium text-foreground/70 capitalize">{obs.businessStage || "—"}</p></div>
            </div>
          </div>

          {/* Priority-Driven Module Grid */}
          {obs.businessPriorities.length > 0 && (
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-foreground/25 mb-2">Your Priorities</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {obs.businessPriorities.slice(0, 6).map((priority, i) => (
                  <button
                    key={priority}
                    onClick={() => navigateTo(PRIORITY_MODULE_MAP[priority] || "overview")}
                    className="flex items-center gap-2.5 p-3 rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] hover:bg-[hsl(0_0%_100%/0.05)] transition-colors text-left group"
                  >
                    <span className="w-5 h-5 rounded-md bg-primary/10 flex items-center justify-center text-[9px] font-bold text-primary shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-[11px] font-medium text-foreground/60 capitalize truncate">
                      {priority.replace(/_/g, " ")}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* First Win Activation Strip */}
          {obs.selectedFirstWins.length > 0 && (
            <div className="rounded-xl border border-[hsl(var(--trust-safe))]/15 bg-[hsl(var(--trust-safe))]/5 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Rocket size={13} className="text-[hsl(var(--trust-safe))]" />
                <p className="text-[11px] font-semibold text-foreground/80">First Wins — Active</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {obs.selectedFirstWins.slice(0, 3).map((win) => (
                  <div key={win} className="flex items-center gap-2.5 p-2.5 rounded-lg bg-[hsl(var(--trust-safe))]/5 border border-[hsl(var(--trust-safe))]/10">
                    <div className="w-6 h-6 rounded-md bg-[hsl(var(--trust-safe))]/10 flex items-center justify-center">
                      <Zap size={11} className="text-[hsl(var(--trust-safe))]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-medium text-foreground/70 capitalize truncate">{win.replace(/_/g, " ")}</p>
                      <p className="text-[8px] text-foreground/30">Ready to start</p>
                    </div>
                    <button className="text-[9px] font-semibold text-[hsl(var(--trust-safe))] hover:underline shrink-0">Start</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottleneck Alerts */}
          {obs.growthBottlenecks.length > 0 && (
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-foreground/25 mb-2">Flagged Bottlenecks</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {obs.growthBottlenecks.slice(0, 4).map((bottleneck) => (
                  <div key={bottleneck} className="flex items-center gap-2.5 p-3 rounded-xl border border-[hsl(var(--sita-gold))]/15 bg-[hsl(var(--sita-gold))]/5">
                    <AlertTriangle size={12} className="text-[hsl(var(--sita-gold))] shrink-0" />
                    <p className="text-[10px] font-medium text-foreground/60 capitalize flex-1 truncate">{bottleneck.replace(/_/g, " ")}</p>
                    <button className="text-[9px] font-semibold text-[hsl(var(--sita-gold))] hover:underline shrink-0">Investigate</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Advisor Trust Level */}
          {obs.automationLevel && (
            <div className="flex items-center gap-2 text-[10px]">
              <Shield size={11} className="text-primary/50" />
              <span className="text-foreground/40">Advisor Trust:</span>
              <span className="font-semibold text-primary/70 capitalize">{obs.automationLevel.replace(/_/g, " ")}</span>
              {obs.activeAdvisors.length > 0 && (
                <span className="text-foreground/30 ml-2">{obs.activeAdvisors.length} advisor{obs.activeAdvisors.length > 1 ? "s" : ""} online</span>
              )}
            </div>
          )}
        </motion.div>
      )}

      {/* KPIs bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-2 flex-wrap"
      >
        <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-foreground/25 mr-1">
          Key Metrics
        </span>
        {adaptations.kpis.slice(0, 6).map((kpi) => (
          <span
            key={kpi}
            className="text-[9px] px-2 py-0.5 rounded-full bg-[hsl(var(--sita-purple))]/8 text-[hsl(var(--sita-purple))] font-medium border border-[hsl(var(--sita-purple))]/15"
          >
            {kpi}
          </span>
        ))}
      </motion.div>

      {/* Widget grid */}
      <div className="grid grid-cols-4 gap-3">
        {topWidgets.map((widget, i) => (
          <WidgetCard key={widget.id} widget={widget} index={i} />
        ))}
      </div>

      {/* Operating flags */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-4"
      >
        <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-foreground/25 mb-3">
          Operating Profile
        </p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(operatingFlags)
            .filter(([, v]) => v)
            .map(([flag]) => (
              <span
                key={flag}
                className="text-[9px] px-2.5 py-1 rounded-full bg-[hsl(var(--trust-safe))]/8 text-[hsl(var(--trust-safe))] font-medium border border-[hsl(var(--trust-safe))]/15"
              >
                {flag.replace(/^has|^sends/, "").replace(/([A-Z])/g, " $1").trim()}
              </span>
            ))}
        </div>
      </motion.div>
    </div>
  );
}

function WidgetCard({ widget, index }: { widget: HomeWidget; index: number }) {
  const Icon = ICON_MAP[widget.icon] || Activity;
  const categoryColors: Record<string, string> = {
    revenue: "hsl(var(--sita-gold))",
    operations: "hsl(var(--sita-purple))",
    customers: "hsl(var(--trust-safe))",
    growth: "hsl(217 80% 55%)",
    team: "hsl(280 55% 58%)",
  };
  const accentColor = categoryColors[widget.category] || "hsl(0 0% 60%)";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 + index * 0.03 }}
      className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-4 hover:bg-[hsl(0_0%_100%/0.04)] transition-colors cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${accentColor}15` }}
        >
          <Icon size={14} style={{ color: accentColor }} />
        </div>
        <span className="text-[8px] font-bold uppercase tracking-wider text-foreground/20">
          {widget.category}
        </span>
      </div>
      <p className="text-[12px] font-semibold text-foreground/75 mb-1 group-hover:text-foreground/90 transition-colors">
        {widget.label}
      </p>
      <p className="text-[10px] text-foreground/35 leading-relaxed">
        {widget.description}
      </p>
    </motion.div>
  );
}
