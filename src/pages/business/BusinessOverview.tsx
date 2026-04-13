// ═══════════════════════════════════════════════════════════════
// Business OS — Operating Room Home
// Opinionated software home: state hero → priority queue → feed
// ═══════════════════════════════════════════════════════════════

import { OperatingStateHero, WhatMattersNow, PreparedActions, WhatChangedFeed, PriorityQueue } from "@/components/sita/domain-shared";
import { DomainAdvisorCard } from "@/components/advisors/DomainAdvisorCard";
import type { MatterItem, ChangeEvent, PreparedAction, HeroMetric, PriorityItem } from "@/components/sita/domain-shared";
import { GlassCard } from "@/components/sita/PremiumPageComponents";
import { EmptyStateCTA } from "@/components/sita/EmptyStateCTA";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useNavigate } from "react-router-dom";
import { useLeads, useCustomers, useInvoices } from "@/hooks/use-sita-data";
import { useDataMode } from "@/contexts/DataModeContext";
import { motion } from "framer-motion";
import { useMemo } from "react";
import {
  DollarSign, Users, AlertTriangle, Phone, UserPlus, CheckCircle,
  Target, TrendingUp, Receipt, Briefcase, ArrowRight, Activity, Eye
} from "lucide-react";

const BusinessOverview = () => {
  const navigate = useNavigate();
  const { isDemoMode } = useDataMode();
  const { data: leads = [], isLoading: leadsLoading } = useLeads();
  const { data: customers = [] } = useCustomers();
  const { data: invoices = [] } = useInvoices();

  const hasLiveData = isDemoMode || leads.length > 0 || customers.length > 0 || invoices.length > 0;

  const heroMetrics: HeroMetric[] = useMemo(() => [
    { label: "Pipeline", value: "$42.8K", change: "+12%", changeDirection: "up" as const, icon: TrendingUp },
    { label: "Callbacks Due", value: "3", change: "1 overdue", changeDirection: "down" as const, icon: Phone },
    { label: "Conversion", value: "34%", change: "+4pts", changeDirection: "up" as const, icon: Target },
  ], []);

  const priorities: PriorityItem[] = useMemo(() => [
    { id: "p1", title: "Emily Watson — 3 days no contact", subtitle: "Quote follow-up at risk · $1,800", urgency: "critical" as const, icon: Phone, actionLabel: "Call", onAction: () => navigate("/business/follow-through") },
    { id: "p2", title: "Invoice #1035 — 7 days overdue", subtitle: "David Kim · $1,800 outstanding", urgency: "high" as const, icon: Receipt, actionLabel: "Review", onAction: () => navigate("/business/invoices") },
    { id: "p3", title: "Quote #1039 expiring tomorrow", subtitle: "Apex Corp · $3,200", urgency: "medium" as const, icon: AlertTriangle, actionLabel: "Follow up", onAction: () => navigate("/business/quotes") },
    { id: "p4", title: "New lead: Michael Park", subtitle: "Web design inquiry via website form", urgency: "low" as const, icon: UserPlus, actionLabel: "Respond", onAction: () => navigate("/business/leads") },
  ], [navigate]);

  const prepared: PreparedAction[] = useMemo(() => [
    { id: "bp1", title: "Follow-up draft for Emily Watson", description: "Gentle re-touch referencing original quote discussion", type: "draft" as const, confidence: 0.88 },
    { id: "bp2", title: "Invoice reminder for David Kim", description: "Payment reminder with 7-day overdue notice", type: "reminder" as const, confidence: 0.92 },
    { id: "bp3", title: "Re-engage Apex Corp", description: "Quote expiry notice with discount incentive", type: "suggestion" as const, confidence: 0.74 },
  ], []);

  const changes: ChangeEvent[] = useMemo(() => [
    { id: "bc1", icon: <DollarSign className="h-3 w-3 text-[hsl(152_55%_48%)]" />, title: "Invoice #1038 paid — $4,200", subtitle: "Marcus Johnson via Stripe", time: "2h ago" },
    { id: "bc2", icon: <UserPlus className="h-3 w-3 text-primary" />, title: "New lead: Michael Park", subtitle: "Website form — web design inquiry", time: "4h ago" },
    { id: "bc3", icon: <AlertTriangle className="h-3 w-3 text-destructive" />, title: "Invoice #1035 now 7 days overdue", subtitle: "David Kim — $1,800 outstanding", time: "Today" },
    { id: "bc4", icon: <CheckCircle className="h-3 w-3 text-[hsl(152_55%_48%)]" />, title: "Callback completed: James Rodriguez", subtitle: "18 min call — discussed Q2 projects", time: "Yesterday" },
  ], []);

  const advisorInsights = useMemo(() => [
    { id: "a1", text: "3 leads aging past 5 days — conversion drops 40% after day 7", confidence: 89, action: "Review Leads", onAction: () => navigate("/business/leads") },
    { id: "a2", text: "Revenue autopilot recovered $4,200 this week from 3 stale quotes", confidence: 94 },
  ], [navigate]);

  if (!hasLiveData) {
    return (
      <motion.div className="space-y-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <EmptyStateCTA
          icon={Briefcase}
          title="Welcome to Business OS"
          description="Start by adding your first lead or customer."
          actions={[
            { label: "Add First Lead", icon: Target, to: "/business/leads" },
            { label: "Import Customers", icon: Users, to: "/business/customers", variant: "secondary" },
          ]}
          tip="Your AI business advisor activates once you have data"
        />
      </motion.div>
    );
  }

  return (
    <motion.div className="space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
      <DemoModeBadge />

      {/* Operating State Hero */}
      <OperatingStateHero
        metrics={heroMetrics}
        accentFrom="hsl(265 55% 58%)"
        accentTo="hsl(285 50% 48%)"
      />

      {/* Two-column: Priority Queue + What Changed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PriorityQueue
          items={priorities}
          title="What Needs You"
          accentColor="hsl(265 55% 58%)"
        />
        <WhatChangedFeed events={changes} />
      </div>

      {/* Prepared Actions */}
      <PreparedActions actions={prepared} />

      {/* Advisor */}
      <DomainAdvisorCard domain="business" insights={advisorInsights} />

      {/* Quick navigation tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { label: "Leads", count: "5 active", icon: Target, path: "/business/leads" },
          { label: "Pipeline", count: "$42.8K", icon: Activity, path: "/business/opportunities" },
          { label: "Invoices", count: "1 overdue", icon: Receipt, path: "/business/invoices" },
          { label: "Follow-Through", count: "8 tasks", icon: Phone, path: "/business/follow-through" },
        ].map(tile => (
          <button
            key={tile.label}
            onClick={() => navigate(tile.path)}
            className="group rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-3 text-left hover:bg-[hsl(0_0%_100%/0.05)] transition-colors"
          >
            <tile.icon className="h-4 w-4 text-[hsl(265_55%_58%)] mb-2" />
            <p className="text-[12px] font-semibold text-foreground">{tile.label}</p>
            <p className="text-[10px] text-muted-foreground">{tile.count}</p>
            <ArrowRight className="h-3 w-3 text-muted-foreground mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        ))}
      </div>
    </motion.div>
  );
};

export default BusinessOverview;
