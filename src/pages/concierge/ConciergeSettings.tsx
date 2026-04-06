import { SitaPageHeader, SitaCard, SitaCardTitle, SitaSectionHeader } from "@/components/sita/SitaCard";
import { TrustBadge } from "@/components/sita/TrustBadge";
import { Users, Bell, Shield, Calendar, ShoppingCart, Plane, Wrench, Gift, Settings, Link, CheckCircle, AlertCircle } from "lucide-react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";

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
    <div className="space-y-6">
      <DemoModeBadge />
      <SitaPageHeader title="Concierge Settings" subtitle="Household members, automation rules, and integrations" />

      {/* Household Members */}
      <div className="space-y-3">
        <SitaSectionHeader title="Household Members" subtitle="People in your household and their roles" />
        <div className="grid gap-3 sm:grid-cols-2">
          {members.map((m, i) => (
            <SitaCard key={i} className="p-4">
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
            </SitaCard>
          ))}
        </div>
      </div>

      {/* Automation Rules */}
      <div className="space-y-3">
        <SitaSectionHeader title="Automation Rules" subtitle="Policies that govern household workflows and alerts" />
        {rules.map(rule => (
          <SitaCard key={rule.id} className="p-4">
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
          </SitaCard>
        ))}
      </div>

      {/* Connectors */}
      <div className="space-y-3">
        <SitaSectionHeader title="Connected Services" subtitle="Integrations that power household automation" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {connectors.map((c, i) => (
            <SitaCard key={i} className="p-4">
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
            </SitaCard>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ConciergeSettings;
