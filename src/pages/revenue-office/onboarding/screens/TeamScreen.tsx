import { Users } from "lucide-react";
import { SectionTitle, ChapterBanner } from "../primitives";
import type { ScreenProps } from "../types";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";

const roles = [
  { id: "leads", label: "Leads & inquiries" },
  { id: "calls", label: "Calls & meetings" },
  { id: "proposals", label: "Proposals & quotes" },
  { id: "delivery", label: "Delivery & fulfillment" },
  { id: "scheduling", label: "Scheduling" },
  { id: "campaigns", label: "Campaigns & marketing" },
  { id: "reviews", label: "Reviews & reputation" },
  { id: "retention", label: "Retention & renewals" },
];

export default function TeamScreen({ state, setState }: ScreenProps) {
  return (
    <div className="space-y-6">
      <DemoModeBadge />
      <ChapterBanner chapter="Chapter 4: Operations" subtitle="Who runs what — powers delegation, routing, and approvals" />
      <div className="space-y-2.5">
        {roles.map(r => (
          <div key={r.id} className="flex items-center gap-3 p-3 rounded-xl bg-card/50 border border-border/50">
            <span className="text-xs font-medium text-foreground w-40">{r.label}</span>
            <select value={state.teamRoles[r.id] || "me"} onChange={e => setState(p => ({ ...p, teamRoles: { ...p.teamRoles, [r.id]: e.target.value } }))}
              className="flex-1 p-2 rounded-lg bg-background border border-border/50 text-sm text-foreground">
              <option value="me">Me / founder</option>
              <option value="team_member">Team member</option>
              <option value="shared">Shared responsibility</option>
              <option value="outsourced">Outsourced / contractor</option>
              <option value="nobody">Nobody yet</option>
            </select>
          </div>
        ))}
      </div>
      <div className="p-4 rounded-xl bg-card/50 border border-border/50">
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={state.needsApprovals} onChange={e => setState(p => ({ ...p, needsApprovals: e.target.checked }))} className="accent-primary" />
          <div>
            <p className="text-sm font-medium text-foreground">We need approvals for pricing, campaigns, discounts, or automations</p>
            <p className="text-[10px] text-muted-foreground">Enables Decision Theater and approval workflows</p>
          </div>
        </label>
      </div>
    </div>
  );
}
