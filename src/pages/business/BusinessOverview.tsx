// ═══════════════════════════════════════════════════════════════
// Business OS — Operating Room Home
// Sharp, operational, high-contrast — uses new card family
// ═══════════════════════════════════════════════════════════════

import { HeroCard, QueueCard, ActionCard, TimelineCard, AdvisorCard, SummaryCard, StatusCard } from "@/components/sita/cards";
import { DomainCard } from "@/components/sita/cards/DomainCard";
import { UrgencyBadge, FreshnessBadge } from "@/components/sita/badges";
import { ListReveal, ListRevealItem } from "@/components/sita/motion/AppTransitions";
import { AppSurface } from "@/components/sita/surfaces/AppSurface";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { PremiumEmptyState } from "@/components/sita/PremiumEmptyState";
import { useNavigate } from "react-router-dom";
import { useLeads, useCustomers, useInvoices } from "@/hooks/use-sita-data";
import { useDataMode } from "@/contexts/DataModeContext";
import { useMemo } from "react";
import {
  DollarSign, Users, AlertTriangle, Phone, UserPlus, CheckCircle,
  Target, TrendingUp, Receipt, Briefcase, ArrowRight, Activity
} from "lucide-react";

const BusinessOverview = () => {
  const navigate = useNavigate();
  const { isDemoMode } = useDataMode();
  const { data: leads = [] } = useLeads();
  const { data: customers = [] } = useCustomers();
  const { data: invoices = [] } = useInvoices();

  const hasLiveData = isDemoMode || leads.length > 0 || customers.length > 0 || invoices.length > 0;

  const queueItems = useMemo(() => [
    { id: "p1", label: "Emily Watson — 3 days no contact", meta: "$1,800", urgency: "critical" as const, badge: <UrgencyBadge urgency="critical" /> },
    { id: "p2", label: "Invoice #1035 — 7 days overdue", meta: "$1,800", urgency: "high" as const, badge: <UrgencyBadge urgency="high" /> },
    { id: "p3", label: "Quote #1039 expiring tomorrow", meta: "$3,200", urgency: "high" as const, badge: <FreshnessBadge freshness="stale" label="Expiring" /> },
    { id: "p4", label: "New lead: Michael Park", meta: "Web inquiry", urgency: "normal" as const },
  ], []);

  const timelineEvents = useMemo(() => [
    { id: "bc1", title: "Invoice #1038 paid — $4,200", timestamp: "2h ago", icon: <DollarSign className="h-3 w-3 text-[hsl(152_55%_48%)]" />, accentColor: "hsl(152 55% 48%)" },
    { id: "bc2", title: "New lead: Michael Park", timestamp: "4h ago", icon: <UserPlus className="h-3 w-3 text-[hsl(265_55%_58%)]" />, accentColor: "hsl(265 55% 58%)" },
    { id: "bc3", title: "Invoice #1035 now 7 days overdue", timestamp: "Today", icon: <AlertTriangle className="h-3 w-3 text-[hsl(0_70%_55%)]" />, accentColor: "hsl(0 70% 55%)" },
    { id: "bc4", title: "Callback completed: James Rodriguez", timestamp: "Yesterday", detail: "18 min call — discussed Q2 projects", icon: <CheckCircle className="h-3 w-3 text-[hsl(152_55%_48%)]" />, accentColor: "hsl(152 55% 48%)" },
  ], []);

  if (!hasLiveData) {
    return (
      <PremiumEmptyState
        variant="first-use"
        icon={Briefcase}
        title="Welcome to Business OS"
        description="Start by adding your first lead or customer."
        actions={[
          { label: "Add First Lead", icon: Target, onClick: () => navigate("/business/leads") },
          { label: "Import Customers", icon: Users, onClick: () => navigate("/business/customers"), variant: "secondary" as const },
        ]}
        tip="Your AI business advisor activates once you have data"
        domain="business"
      />
    );
  }

  return (
    <AppSurface level={0} className="space-y-4 p-0 border-0 rounded-none bg-transparent">
      <DemoModeBadge />

      <ListReveal className="space-y-4" domain="business">
        {/* Hero — Pipeline metrics */}
        <ListRevealItem>
          <HeroCard
            title="Operating Pulse"
            metric="$42.8K"
            subtitle="Active pipeline · 3 callbacks due · 34% conversion (+4pts)"
            accentFrom="hsl(265 55% 58%)"
            accentTo="hsl(285 50% 48%)"
            icon={<TrendingUp className="h-4 w-4 text-[hsl(265_55%_58%)]" />}
          >
            <SummaryCard
              title="Today"
              kpis={[
                { label: "Pipeline", value: "$42.8K", trend: "up" },
                { label: "Callbacks", value: "3", trend: "down" },
                { label: "Conversion", value: "34%", trend: "up" },
                { label: "At Risk", value: "$5.0K" },
              ]}
              className="border-0 bg-transparent shadow-none p-0"
            />
          </HeroCard>
        </ListRevealItem>

        {/* Two-column: Queue + Timeline */}
        <ListRevealItem>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <QueueCard
              title="What Needs You"
              items={queueItems}
              onItemClick={(id) => {
                if (id === "p1") navigate("/business/follow-through");
                if (id === "p2") navigate("/business/invoices");
                if (id === "p3") navigate("/business/quotes");
                if (id === "p4") navigate("/business/leads");
              }}
            />
            <TimelineCard title="What Changed" events={timelineEvents} />
          </div>
        </ListRevealItem>

        {/* Prepared Actions */}
        <ListRevealItem>
          <div className="space-y-2">
            <ActionCard
              title="Follow-up draft for Emily Watson"
              description="Gentle re-touch referencing original quote discussion"
              accentColor="hsl(265 55% 58%)"
              onApprove={() => {}}
              onDismiss={() => {}}
              badge={<FreshnessBadge freshness="fresh" label="88% confidence" />}
            />
            <ActionCard
              title="Invoice reminder for David Kim"
              description="Payment reminder with 7-day overdue notice"
              accentColor="hsl(265 55% 58%)"
              onApprove={() => {}}
              onDismiss={() => {}}
              badge={<FreshnessBadge freshness="fresh" label="92% confidence" />}
            />
          </div>
        </ListRevealItem>

        {/* Advisor */}
        <ListRevealItem>
          <AdvisorCard
            advisorName="Business Advisor"
            insight="3 leads aging past 5 days — conversion drops 40% after day 7. Revenue autopilot recovered $4,200 this week."
            confidence={89}
            domain="Business"
            accentColor="hsl(265 55% 58%)"
            action={{ label: "Review Leads", onClick: () => navigate("/business/leads") }}
          />
        </ListRevealItem>

        {/* Quick nav tiles */}
        <ListRevealItem>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { label: "Leads", count: "5 active", icon: Target, path: "/business/leads" },
              { label: "Pipeline", count: "$42.8K", icon: Activity, path: "/business/opportunities" },
              { label: "Invoices", count: "1 overdue", icon: Receipt, path: "/business/invoices" },
              { label: "Follow-Through", count: "8 tasks", icon: Phone, path: "/business/follow-through" },
            ].map(tile => (
              <DomainCard
                key={tile.label}
                onClick={() => navigate(tile.path)}
                className="group text-left micro-hover-lift micro-focus-glow micro-press"
              >
                <tile.icon className="h-4 w-4 text-[hsl(265_55%_58%)] mb-2" />
                <p className="text-[12px] font-semibold text-foreground">{tile.label}</p>
                <p className="text-[10px] text-muted-foreground">{tile.count}</p>
                <ArrowRight className="h-3 w-3 text-muted-foreground mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
              </DomainCard>
            ))}
          </div>
        </ListRevealItem>
      </ListReveal>
    </AppSurface>
  );
};

export default BusinessOverview;
