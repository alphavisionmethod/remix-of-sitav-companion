import { Users } from "lucide-react";
import { SectionTitle, ChapterBanner, Toggle } from "../primitives";
import type { ScreenProps } from "../types";
import { useCallback } from "react";
import { FileText, Megaphone, Zap, Shield, Star, DollarSign } from "lucide-react";

const roles = [
  { id: "leads", label: "Leads & inquiries" },
  { id: "calls", label: "Calls & meetings" },
  { id: "proposals", label: "Proposals & quotes" },
  { id: "delivery", label: "Delivery & fulfillment" },
  { id: "scheduling", label: "Scheduling" },
  { id: "campaigns", label: "Campaigns & marketing" },
  { id: "reviews", label: "Reviews & reputation" },
  { id: "retention", label: "Retention & renewals" },
  { id: "support", label: "Support & communication" },
];

const approvalItems = [
  { id: "discounts", label: "Discounts & pricing changes", icon: DollarSign },
  { id: "quote_sending", label: "Quote / proposal sending", icon: FileText },
  { id: "campaign_launches", label: "Campaign launches", icon: Megaphone },
  { id: "automation_activation", label: "Automation activation", icon: Zap },
  { id: "reputation_responses", label: "Reputation responses", icon: Star },
  { id: "vip_actions", label: "VIP client actions", icon: Shield },
];

export default function TeamScreen({ state, setState }: ScreenProps) {
  const toggleApproval = useCallback((v: string) => {
    setState(p => ({ ...p, approvalActions: p.approvalActions.includes(v) ? p.approvalActions.filter(x => x !== v) : [...p.approvalActions, v] }));
  }, [setState]);

  return (
    <div className="space-y-6">

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
      {state.needsApprovals && (
        <div>
          <SectionTitle hint="Select all that require approval">What actions need approval before executing?</SectionTitle>
          <div className="grid md:grid-cols-2 gap-2">
            {approvalItems.map(a => (
              <Toggle key={a.id} label={a.label} icon={a.icon} selected={state.approvalActions.includes(a.id)} onToggle={() => toggleApproval(a.id)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
