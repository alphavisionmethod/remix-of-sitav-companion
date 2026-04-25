// ═══════════════════════════════════════════════════════════════
// SITA OS — Mobile Trusted Device: Boardroom
// ═══════════════════════════════════════════════════════════════

import { MobileShell } from "@/platform/experience/components/mobile/MobileShell";
import { MobileAdvisorBoard } from "@/platform/advisors/components/advisors/MobileAdvisorBoard";
import type { AdvisorConfig } from "@/platform/advisors/components/advisors/AdvisorCouncilShell";
import { Badge } from "@/components/ui/badge";
import { Shield, TrendingUp, Briefcase, Wallet, Home } from "lucide-react";

const MOBILE_ADVISORS: AdvisorConfig[] = [
  { id: "biz-1", advisorId: "strategy", name: "Strategy", domain: "business", role: "Business Strategy Advisor", status: "active", confidence: 82, mission: "Revenue up 12% MTD. 3 deals closing worth $28K.", specialAbility: "Pipeline forecasting" },
  { id: "fin-1", advisorId: "finance", name: "Finance", domain: "money", role: "Financial Operations Advisor", status: "active", confidence: 91, mission: "Cash position healthy. $8,240 safe-to-spend.", specialAbility: "Waste detection" },
  { id: "ops-1", advisorId: "concierge", name: "Operations", domain: "concierge", role: "Household Ops Advisor", status: "active", confidence: 74, mission: "6 active tasks, 1 overdue. Calendar conflict Thursday.", specialAbility: "Schedule optimization" },
  { id: "growth-1", advisorId: "growth", name: "Growth", domain: "growth", role: "Growth & Opportunity Advisor", status: "idle", confidence: 68, mission: "Monitoring 3 market signals for expansion.", specialAbility: "Market signal detection" },
  { id: "risk-1", advisorId: "trust", name: "Risk", domain: "trust", role: "Risk & Trust Advisor", status: "active", confidence: 88, mission: "No critical risks. 1 compliance item due.", specialAbility: "Compliance scanning" },
];

const MobileBoardroom = () => (
  <MobileShell title="Boardroom">
    <div className="mb-4 p-3 rounded-xl bg-card border border-border/40">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-semibold text-foreground">Council Status</p>
        <Badge variant="outline" className="text-[10px] border-emerald-500/30 bg-emerald-500/10 text-emerald-500">Live</Badge>
      </div>
      <div className="grid grid-cols-5 gap-2">
        {[
          { icon: Briefcase, label: "Biz", active: true },
          { icon: Wallet, label: "Fin", active: true },
          { icon: Home, label: "Ops", active: true },
          { icon: TrendingUp, label: "Gro", active: false },
          { icon: Shield, label: "Risk", active: true },
        ].map(a => (
          <div key={a.label} className="flex flex-col items-center gap-1">
            <div className={`p-1.5 rounded-lg ${a.active ? "bg-primary/10" : "bg-muted/30"}`}>
              <a.icon className={`h-3.5 w-3.5 ${a.active ? "text-primary" : "text-muted-foreground"}`} />
            </div>
            <span className="text-[10px] text-muted-foreground">{a.label}</span>
          </div>
        ))}
      </div>
    </div>
    <MobileAdvisorBoard advisors={MOBILE_ADVISORS} />
  </MobileShell>
);

export default MobileBoardroom;
