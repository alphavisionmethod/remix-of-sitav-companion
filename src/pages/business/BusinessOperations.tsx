import { SitaPageHeader, SitaCard, SitaCardTitle, SitaSectionHeader, SitaButton, SitaMetric } from "@/components/sita/SitaCard";
import { KPITile, SitaTabs, EmptyState } from "@/components/sita/SitaComponents";
import { LiveAdvisorCard } from "@/components/sita/LiveAdvisorCard";
import { TrustBadge } from "@/components/sita/TrustBadge";
import { ConfidenceBar } from "@/components/sita/primitives/ConfidenceBar";
import { DomainHeader } from "@/components/sita/primitives/DomainHeader";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Layers, AlertTriangle, Users, Clock, Zap, ShieldAlert, GitBranch, Timer,
  CheckCircle, ArrowRight, Activity, TrendingDown, BarChart3, Target, Truck,
  UserCheck, Package, RefreshCw, ChevronRight, Star, Flame
} from "lucide-react";

type Tab = "all" | "queues" | "escalations" | "team" | "bottlenecks" | "delayed";

interface OperationalItem {
  id: string;
  title: string;
  category: "queue" | "escalation" | "bottleneck" | "delayed" | "exception";
  status: "active" | "at-risk" | "blocked" | "resolved" | "overdue";
  urgency: "critical" | "high" | "medium" | "low";
  owner: string;
  ownerAvatar: string;
  customerImpact: number;
  description: string;
  linkedEntity?: string;
  linkedEntityType?: string;
  age: string;
  nextAction: string;
  workload?: number;
}

const DEMO_ITEMS: OperationalItem[] = [
  {
    id: "ops-1", title: "Order fulfillment queue backup", category: "queue", status: "at-risk", urgency: "critical",
    owner: "Sarah K.", ownerAvatar: "SK", customerImpact: 12, description: "14 orders pending fulfillment > 48hrs. SLA breach imminent for 5 priority accounts.",
    linkedEntity: "Warehouse A", linkedEntityType: "Facility", age: "2d 6h", nextAction: "Reassign 5 priority orders to express lane"
  },
  {
    id: "ops-2", title: "Billing dispute escalation — Acme Corp", category: "escalation", status: "active", urgency: "high",
    owner: "Michael R.", ownerAvatar: "MR", customerImpact: 1, description: "Customer disputes $12,400 invoice. Finance review pending since Monday. Customer threatening churn.",
    linkedEntity: "INV-2024-0847", linkedEntityType: "Invoice", age: "4d", nextAction: "Schedule finance review call"
  },
  {
    id: "ops-3", title: "API integration stall — payment processor", category: "bottleneck", status: "blocked", urgency: "critical",
    owner: "Dev Team", ownerAvatar: "DT", customerImpact: 45, description: "Payment processor webhook failing intermittently. 45 transactions in retry queue. Engineering aware but no ETA.",
    linkedEntity: "Stripe Webhook", linkedEntityType: "Integration", age: "18h", nextAction: "Escalate to engineering lead"
  },
  {
    id: "ops-4", title: "Delayed onboarding — 3 enterprise accounts", category: "delayed", status: "overdue", urgency: "high",
    owner: "Lisa M.", ownerAvatar: "LM", customerImpact: 3, description: "Enterprise onboarding behind schedule. Missing compliance docs from 2 accounts, 1 awaiting API credentials.",
    linkedEntity: "Q1 Enterprise Cohort", linkedEntityType: "Program", age: "1w 2d", nextAction: "Send compliance doc reminders"
  },
  {
    id: "ops-5", title: "Support ticket volume spike", category: "queue", status: "at-risk", urgency: "high",
    owner: "Support Team", ownerAvatar: "ST", customerImpact: 28, description: "Support volume 3x normal after product update. Response time degrading from 2h to 8h average.",
    linkedEntity: "v2.4 Release", linkedEntityType: "Release", age: "1d 4h", nextAction: "Deploy additional support agents"
  },
  {
    id: "ops-6", title: "Inventory restock delay — top 5 SKUs", category: "bottleneck", status: "at-risk", urgency: "medium",
    owner: "Procurement", ownerAvatar: "PR", customerImpact: 8, description: "Supplier delayed shipment for 5 best-selling SKUs. Current stock covers ~3 days. Backorders starting to queue.",
    linkedEntity: "SKU Batch #447", linkedEntityType: "Inventory", age: "3d", nextAction: "Contact alternate supplier"
  },
  {
    id: "ops-7", title: "SLA breach — premium tier response time", category: "escalation", status: "overdue", urgency: "critical",
    owner: "Jordan T.", ownerAvatar: "JT", customerImpact: 2, description: "2 premium-tier customers waiting 6h+ for response (SLA: 1h). Account managers notified but no action taken.",
    linkedEntity: "Premium SLA Policy", linkedEntityType: "Policy", age: "6h", nextAction: "Immediate response + apology credit"
  },
  {
    id: "ops-8", title: "Workflow exception — auto-renewal failures", category: "exception", status: "active", urgency: "medium",
    owner: "Billing Team", ownerAvatar: "BT", customerImpact: 15, description: "15 subscription auto-renewals failed due to expired payment methods. Grace period ends in 5 days.",
    linkedEntity: "Renewal Batch", linkedEntityType: "Subscription", age: "2d", nextAction: "Send payment update reminders"
  },
  {
    id: "ops-9", title: "Resource scheduling conflict — next week", category: "delayed", status: "active", urgency: "low",
    owner: "Ops Manager", ownerAvatar: "OM", customerImpact: 4, description: "3 technicians double-booked for Tuesday. 4 customer appointments at risk of reschedule.",
    linkedEntity: "Schedule W15", linkedEntityType: "Calendar", age: "5d ahead", nextAction: "Reassign or reschedule 2 appointments"
  },
  {
    id: "ops-10", title: "Data sync mismatch — CRM ↔ billing", category: "exception", status: "at-risk", urgency: "medium",
    owner: "Data Team", ownerAvatar: "DA", customerImpact: 0, description: "32 customer records have mismatched data between CRM and billing system. No customer impact yet but growing drift.",
    linkedEntity: "Sync Pipeline", linkedEntityType: "Integration", age: "1w", nextAction: "Run reconciliation script"
  },
];

const TEAM_MEMBERS = [
  { name: "Sarah K.", avatar: "SK", role: "Fulfillment Lead", activeItems: 6, capacity: 85, status: "high-load" as const },
  { name: "Michael R.", avatar: "MR", role: "Account Manager", activeItems: 4, capacity: 60, status: "normal" as const },
  { name: "Lisa M.", avatar: "LM", role: "Onboarding Specialist", activeItems: 5, capacity: 90, status: "overloaded" as const },
  { name: "Jordan T.", avatar: "JT", role: "Support Lead", activeItems: 8, capacity: 95, status: "overloaded" as const },
  { name: "Dev Team", avatar: "DT", role: "Engineering", activeItems: 3, capacity: 45, status: "normal" as const },
];

const urgencyConfig = {
  critical: { color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/20", icon: Flame },
  high: { color: "text-[hsl(var(--urgency-high,0_84%_60%))]", bg: "bg-[hsl(var(--urgency-high,0_84%_60%)/0.1)]", border: "border-[hsl(var(--urgency-high,0_84%_60%)/0.2)]", icon: AlertTriangle },
  medium: { color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20", icon: Clock },
  low: { color: "text-muted-foreground", bg: "bg-muted/50", border: "border-border", icon: Timer },
};

const statusConfig = {
  active: { label: "Active", color: "text-primary", bg: "bg-primary/10" },
  "at-risk": { label: "At Risk", color: "text-amber-500", bg: "bg-amber-500/10" },
  blocked: { label: "Blocked", color: "text-destructive", bg: "bg-destructive/10" },
  resolved: { label: "Resolved", color: "text-chart-2", bg: "bg-chart-2/10" },
  overdue: { label: "Overdue", color: "text-destructive", bg: "bg-destructive/10" },
};

const BusinessOperations = () => {
  const [tab, setTab] = useState<Tab>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = DEMO_ITEMS.filter(item => {
    if (tab === "all") return true;
    if (tab === "queues") return item.category === "queue";
    if (tab === "escalations") return item.category === "escalation";
    if (tab === "bottlenecks") return item.category === "bottleneck";
    if (tab === "delayed") return item.category === "delayed" || item.category === "exception";
    if (tab === "team") return true;
    return true;
  });

  const selected = DEMO_ITEMS.find(i => i.id === selectedId);
  const criticalCount = DEMO_ITEMS.filter(i => i.urgency === "critical").length;
  const escalationCount = DEMO_ITEMS.filter(i => i.category === "escalation").length;
  const bottleneckCount = DEMO_ITEMS.filter(i => i.category === "bottleneck").length;
  const atRiskCount = DEMO_ITEMS.filter(i => i.status === "at-risk" || i.status === "overdue" || i.status === "blocked").length;
  const totalCustomerImpact = DEMO_ITEMS.reduce((sum, i) => sum + i.customerImpact, 0);

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <DomainHeader domain="business" title="Operations Center" subtitle="Living state of business execution — queues, bottlenecks, team load, and at-risk commitments" />

      {/* KPI Strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <KPITile icon={Layers} label="Open Queues" value={DEMO_ITEMS.filter(i => i.category === "queue").length} trend="caution" />
        <KPITile icon={ShieldAlert} label="Escalations" value={escalationCount} trend="negative" />
        <KPITile icon={GitBranch} label="Bottlenecks" value={bottleneckCount} trend="negative" />
        <KPITile icon={AlertTriangle} label="At-Risk Items" value={atRiskCount} trend="caution" />
        <KPITile icon={Users} label="Customer Impact" value={totalCustomerImpact} trend="negative" />
        <KPITile icon={Zap} label="Critical" value={criticalCount} trend={criticalCount > 0 ? "negative" : "positive"} />
      </div>

      {/* Business Day Pulse */}
      <SitaCard hover={false} className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <Activity className="h-4 w-4 text-primary" />
          <SitaCardTitle>Business Day Pulse</SitaCardTitle>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="space-y-1">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Queue Velocity</p>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-lg font-semibold text-foreground">12/hr</span>
              <span className="text-[10px] text-chart-2 font-medium">↑ 18%</span>
            </div>
            <ConfidenceBar value={72} size="sm" />
          </div>
          <div className="space-y-1">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Resolution Rate</p>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-lg font-semibold text-foreground">84%</span>
              <span className="text-[10px] text-amber-500 font-medium">↓ 6%</span>
            </div>
            <ConfidenceBar value={84} size="sm" />
          </div>
          <div className="space-y-1">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Avg Handle Time</p>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-lg font-semibold text-foreground">2.4h</span>
              <span className="text-[10px] text-destructive font-medium">↑ 40min</span>
            </div>
            <ConfidenceBar value={55} size="sm" />
          </div>
          <div className="space-y-1">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Team Utilization</p>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-lg font-semibold text-foreground">78%</span>
              <span className="text-[10px] text-amber-500 font-medium">High</span>
            </div>
            <ConfidenceBar value={78} size="sm" />
          </div>
        </div>
      </SitaCard>

      <SitaTabs
        tabs={[
          { key: "all", label: "All", count: DEMO_ITEMS.length },
          { key: "queues", label: "Queues", count: DEMO_ITEMS.filter(i => i.category === "queue").length },
          { key: "escalations", label: "Escalations", count: escalationCount },
          { key: "bottlenecks", label: "Bottlenecks", count: bottleneckCount },
          { key: "delayed", label: "Delayed & Exceptions", count: DEMO_ITEMS.filter(i => i.category === "delayed" || i.category === "exception").length },
          { key: "team", label: "Team Activity" },
        ]}
        active={tab}
        onChange={k => setTab(k as Tab)}
      />

      {tab === "team" ? (
        /* Team Activity View */
        <div className="space-y-4">
          <SitaSectionHeader title="Team Workload" subtitle="Current capacity and active assignments" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {TEAM_MEMBERS.map(member => (
              <SitaCard
                key={member.name}
                hover
                lane={member.status === "overloaded" ? "action" : member.status === "high-load" ? "unresolved" : undefined}
                className="p-4"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/8 font-display text-sm font-semibold text-primary shrink-0">
                    {member.avatar}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">{member.name}</p>
                    <p className="text-xs text-muted-foreground">{member.role}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    member.status === "overloaded" ? "text-destructive bg-destructive/10" :
                    member.status === "high-load" ? "text-amber-500 bg-amber-500/10" :
                    "text-chart-2 bg-chart-2/10"
                  }`}>
                    {member.status === "overloaded" ? "Overloaded" : member.status === "high-load" ? "High Load" : "Normal"}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Active Items</span>
                    <span className="font-medium text-foreground">{member.activeItems}</span>
                  </div>
                  <ConfidenceBar value={member.capacity} label="Capacity Used" size="sm" />
                  <div className="flex gap-2 mt-2">
                    <SitaButton variant="ghost" size="sm" className="flex-1"><UserCheck className="h-3 w-3" /> Reassign</SitaButton>
                    <SitaButton variant="ghost" size="sm" className="flex-1"><BarChart3 className="h-3 w-3" /> Details</SitaButton>
                  </div>
                </div>
              </SitaCard>
            ))}
          </div>
        </div>
      ) : (
        /* Queue / Issue List View */
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3 space-y-2">
            {filtered.length === 0 && (
              <EmptyState icon={Layers} title="No operational items" description="All queues are clear — nothing needs attention right now" />
            )}
            {filtered.map(item => {
              const urg = urgencyConfig[item.urgency];
              const stat = statusConfig[item.status];
              const UrgIcon = urg.icon;
              return (
                <SitaCard
                  key={item.id}
                  onClick={() => setSelectedId(item.id)}
                  selected={selectedId === item.id}
                  lane={item.urgency === "critical" ? "action" : item.status === "at-risk" ? "unresolved" : undefined}
                  className="p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${urg.bg} shrink-0`}>
                      <UrgIcon className={`h-4 w-4 ${urg.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="text-sm font-medium text-foreground">{item.title}</p>
                        <span className={`inline-flex items-center rounded-md px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide ${urg.bg} ${urg.color} border ${urg.border}`}>{item.urgency}</span>
                        <span className={`inline-flex items-center rounded-md px-1.5 py-px text-[10px] font-medium ${stat.bg} ${stat.color}`}>{stat.label}</span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1 mb-2">{item.description}</p>
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {item.owner}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {item.age}</span>
                        {item.customerImpact > 0 && (
                          <span className="flex items-center gap-1 text-amber-500"><Target className="h-3 w-3" /> {item.customerImpact} affected</span>
                        )}
                        {item.linkedEntity && (
                          <span className="flex items-center gap-1"><GitBranch className="h-3 w-3" /> {item.linkedEntity}</span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                  </div>
                </SitaCard>
              );
            })}
          </div>

          {/* Detail Sidebar */}
          <div className="lg:col-span-2 space-y-4">
            {selected ? (
              <>
                <SitaCard hover={false} glow className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    {(() => { const UIcon = urgencyConfig[selected.urgency].icon; return <UIcon className={`h-5 w-5 ${urgencyConfig[selected.urgency].color}`} />; })()}
                    <h3 className="font-display text-sm font-bold text-foreground">{selected.title}</h3>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase ${urgencyConfig[selected.urgency].bg} ${urgencyConfig[selected.urgency].color}`}>{selected.urgency}</span>
                    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-medium ${statusConfig[selected.status].bg} ${statusConfig[selected.status].color}`}>{statusConfig[selected.status].label}</span>
                    <span className="inline-flex items-center rounded-md border border-border px-2 py-0.5 text-[10px] font-medium text-muted-foreground capitalize">{selected.category}</span>
                  </div>
                  <p className="text-sm text-foreground/80 leading-relaxed mb-4">{selected.description}</p>
                  <div className="space-y-2 border-t border-border/40 pt-3">
                    <div className="flex justify-between text-xs"><span className="text-muted-foreground">Owner</span><span className="text-foreground font-medium">{selected.owner}</span></div>
                    <div className="flex justify-between text-xs"><span className="text-muted-foreground">Age</span><span className="text-foreground">{selected.age}</span></div>
                    <div className="flex justify-between text-xs"><span className="text-muted-foreground">Customer Impact</span><span className={`font-medium ${selected.customerImpact > 5 ? "text-destructive" : "text-foreground"}`}>{selected.customerImpact} affected</span></div>
                    {selected.linkedEntity && (
                      <div className="flex justify-between text-xs"><span className="text-muted-foreground">{selected.linkedEntityType}</span><span className="text-primary font-medium">{selected.linkedEntity}</span></div>
                    )}
                  </div>
                </SitaCard>

                <SitaCard hover={false} className="p-4">
                  <SitaCardTitle>Recommended Next Action</SitaCardTitle>
                  <div className="mt-3 flex items-start gap-2 rounded-xl bg-primary/5 border border-primary/10 p-3">
                    <ArrowRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <p className="text-sm text-foreground">{selected.nextAction}</p>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <SitaButton variant="primary" size="sm" className="flex-1"><CheckCircle className="h-3.5 w-3.5" /> Take Action</SitaButton>
                    <SitaButton variant="secondary" size="sm" className="flex-1"><RefreshCw className="h-3.5 w-3.5" /> Reassign</SitaButton>
                  </div>
                </SitaCard>

                {selected.customerImpact > 0 && (
                  <SitaCard hover={false} lane="unresolved" className="p-4">
                    <SitaCardTitle>Customer Impact Assessment</SitaCardTitle>
                    <div className="mt-3 space-y-2">
                      <ConfidenceBar value={Math.min(100, selected.customerImpact * 8)} label="Impact Severity" size="md" />
                      <p className="text-xs text-muted-foreground">
                        {selected.customerImpact} customer{selected.customerImpact !== 1 ? "s" : ""} directly affected.
                        {selected.customerImpact > 10 ? " High blast radius — prioritize immediate resolution." :
                         selected.customerImpact > 3 ? " Moderate impact — resolve within SLA window." :
                         " Contained impact — monitor and resolve."}
                      </p>
                    </div>
                  </SitaCard>
                )}
              </>
            ) : (
              <EmptyState icon={Layers} title="Select an item" description="Click on an operational item to see full details, impact assessment, and recommended actions" />
            )}

            <LiveAdvisorCard
              advisor="business"
              intent="operations_review"
              context={{ items: DEMO_ITEMS.length, critical: criticalCount, impact: totalCustomerImpact }}
              demoName="Operations Advisor"
              demoRole="Operational Intelligence"
              demoConfidence="High"
              demoRecommendation={`${criticalCount} critical items need immediate attention. ${bottleneckCount} bottlenecks are slowing throughput. ${totalCustomerImpact} customers are impacted across all queues. Focus on the API integration stall and SLA breach first — they have the highest blast radius.`}
              demoReasoning="Analyzing queue velocity, team capacity, customer impact scores, and SLA compliance across all operational streams."
            />
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default BusinessOperations;
