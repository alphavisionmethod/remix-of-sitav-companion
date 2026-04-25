import { ConciergePageWrapper } from "@/modules/concierge/components/concierge";
import { TrustBadge } from "@/platform/sita/components/sita/TrustBadge";
import { Users, Bell, Shield, Calendar, ShoppingCart, Plane, Wrench, Gift, Settings, Link, CheckCircle, AlertCircle } from "lucide-react";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
import { SITA_TYPE } from "@/platform/design-system/sita-design-tokens";
import { AdvisorKnowledgePanel } from "@/platform/advisors/components/advisors/AdvisorKnowledgePanel";

interface HouseholdMember {
  name: string;
  role: string;
  avatar: string;
  permissions: string[];
}

const members: HouseholdMember[] = [
  { name: "You", role: "Household Admin", avatar: "👤", permissions: ["Full access", "Approval authority", "Settings management"] },
  { name: "Partner", role: "Co-Admin", avatar: "👤", permissions: ["Full access", "Approval authority"] },
  { name: "Emma", role: "Dependent", avatar: "👧", permissions: ["View calendar", "Task completion"] },
  { name: "Liam", role: "Dependent", avatar: "👦", permissions: ["View calendar", "Task completion"] },
];

interface HouseholdRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  category: string;
  icon: typeof Bell;
}

const rules: HouseholdRule[] = [
  { id: "1", name: "Grocery auto-reminder", description: "Remind to restock when weekly cycle starts", enabled: true, category: "Shopping", icon: ShoppingCart },
  { id: "2", name: "School deadline alerts", description: "Notify 3 days before any school form or fee deadline", enabled: true, category: "School", icon: Calendar },
  { id: "3", name: "Appointment prep reminders", description: "Trigger prep checklist 48 hours before appointments", enabled: true, category: "Appointments", icon: Bell },
  { id: "4", name: "Travel booking approval", description: "Require approval for travel bookings over $500", enabled: true, category: "Travel", icon: Plane },
  { id: "5", name: "Service provider follow-up", description: "Auto-remind to follow up 7 days after service visit", enabled: false, category: "Home Admin", icon: Wrench },
  { id: "6", name: "Gift budget alerts", description: "Notify when gift spending exceeds $150/month", enabled: true, category: "Events", icon: Gift },
  { id: "7", name: "Task escalation", description: "Escalate unresolved tasks after 3 days overdue", enabled: false, category: "Tasks", icon: AlertCircle },
  { id: "8", name: "Weekly boardroom auto-generate", description: "Generate family boardroom summary every Sunday at 8 AM", enabled: true, category: "Boardroom", icon: Settings },
];

interface Connector {
  name: string;
  type: string;
  status: "connected" | "disconnected" | "error";
  lastSync?: string;
  icon: typeof Calendar;
}

const connectors: Connector[] = [
  { name: "Google Calendar", type: "Calendar", status: "connected", lastSync: "2 min ago", icon: Calendar },
  { name: "Apple Reminders", type: "Tasks", status: "connected", lastSync: "5 min ago", icon: Bell },
  { name: "Instacart", type: "Grocery", status: "disconnected", icon: ShoppingCart },
  { name: "TripIt", type: "Travel", status: "disconnected", icon: Plane },
  { name: "Google Drive", type: "Files", status: "connected", lastSync: "1 hour ago", icon: Link },
];

const ConciergeSettings = () => {
  return (
    <ConciergePageWrapper className="space-y-6">
      <PageTruthBanner />

      {/* Household Members */}
      <div className="space-y-3">
        <h3 className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[hsl(0_0%_50%)]">Household Members</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {members.map((m, i) => (
            <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_9%)] p-4 micro-hover-lift" key={i} >
              <div className="flex items-start gap-3">
                <div className="text-2xl">{m.avatar}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{m.name}</p>
                    <span className="rounded-md bg-secondary px-1.5 py-px text-[10px] text-muted-foreground">{m.role}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    {m.permissions.map((p, j) => (
                      <span key={j} className="text-[10px] text-muted-foreground">{j > 0 && "·"} {p}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Automation Rules */}
      <div className="space-y-3">
        <h3 className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[hsl(0_0%_50%)]">Automation Rules</h3>
        {rules.map(rule => (
          <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_9%)] p-4 micro-hover-lift" key={rule.id} >
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-primary/8 p-2 shrink-0">
                <rule.icon className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground">{rule.name}</p>
                  <span className="rounded-md bg-secondary px-1.5 py-px text-[10px] text-muted-foreground">{rule.category}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{rule.description}</p>
              </div>
              <div className={`h-5 w-9 rounded-full transition-colors shrink-0 ${rule.enabled ? "bg-primary" : "bg-muted"}`}>
                <div className={`h-4 w-4 rounded-full bg-background shadow-sm transition-transform mt-0.5 ${rule.enabled ? "translate-x-4.5 ml-0.5" : "translate-x-0.5"}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Connectors */}
      <div className="space-y-3">
        <h3 className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[hsl(0_0%_50%)]">Connected Services</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {connectors.map((c, i) => (
            <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_9%)] p-4 micro-hover-lift" key={i} >
              <div className="flex items-center gap-3">
                <div className={`rounded-xl p-2 shrink-0 ${c.status === "connected" ? "bg-chart-2/10" : "bg-secondary"}`}>
                  <c.icon className={`h-4 w-4 ${c.status === "connected" ? "text-chart-2" : "text-muted-foreground"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.type}</p>
                </div>
                <div className="text-right shrink-0">
                  {c.status === "connected" ? (
                    <>
                      <CheckCircle className="h-3.5 w-3.5 text-chart-2 mb-0.5 ml-auto" />
                      <span className="text-[10px] text-muted-foreground">{c.lastSync}</span>
                    </>
                  ) : (
                    <button className="rounded-lg bg-primary/10 px-2.5 py-1 text-[10px] font-medium text-primary hover:bg-primary/20 transition-colors">
                      Connect
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Advisor Knowledge */}
      <AdvisorKnowledgePanel advisorId="concierge-advisor" domain="concierge" title="Concierge Advisor Knowledge" />
    </ConciergePageWrapper>
  );
};

export default ConciergeSettings;
