// ═══════════════════════════════════════════════════════════════
// Boardroom Focus Editor — Configure strategic review priorities
// ═══════════════════════════════════════════════════════════════

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Crosshair, Target, TrendingUp, Users, Receipt, Calendar,
  ShoppingCart, Shield, Briefcase, Building2, BarChart3,
  AlertTriangle, Zap, Heart, Clock, Package, Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useBusinessProfile } from "@/modules/business/hooks/useBusinessProfile";
import { getIdentityLayer } from "@/domains/engines/business-identity-layers";
import { Checkbox } from "@/components/ui/checkbox";

interface FocusArea {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  category: string;
}

const ALL_FOCUS_AREAS: FocusArea[] = [
  { id: "strategic-accounts", label: "Strategic Accounts", description: "High-value client relationships at risk or with expansion potential", icon: Target, category: "Revenue" },
  { id: "proposal-bottlenecks", label: "Proposal Bottlenecks", description: "Proposals that have stalled or exceeded normal response times", icon: Briefcase, category: "Revenue" },
  { id: "revenue-concentration", label: "Revenue Concentration", description: "Too much revenue from too few clients", icon: AlertTriangle, category: "Revenue" },
  { id: "margin-risk", label: "Margin Risk", description: "Projects or deals with shrinking margins", icon: TrendingUp, category: "Finance" },
  { id: "collections-issues", label: "Collections Issues", description: "Overdue invoices and payment recovery situations", icon: Receipt, category: "Finance" },
  { id: "cash-flow-gaps", label: "Cash Flow Gaps", description: "Upcoming periods with projected revenue shortfalls", icon: BarChart3, category: "Finance" },
  { id: "staffing-issues", label: "Staffing Issues", description: "Coverage gaps, overloaded team members, or skill shortages", icon: Users, category: "Operations" },
  { id: "capacity-constraints", label: "Capacity Constraints", description: "Approaching or exceeding operational capacity", icon: Clock, category: "Operations" },
  { id: "delivery-risk", label: "Delivery Risk", description: "Projects at risk of missing deadlines or quality standards", icon: Package, category: "Operations" },
  { id: "scheduling-pressure", label: "Scheduling Pressure", description: "Overbooked periods or appointment conflicts", icon: Calendar, category: "Operations" },
  { id: "hiring-needs", label: "Hiring Needs", description: "Growth requiring new team members or skill acquisition", icon: Users, category: "Growth" },
  { id: "enterprise-opportunities", label: "Enterprise Opportunities", description: "Large deals that need strategic preparation", icon: Globe, category: "Growth" },
  { id: "conversion-health", label: "Conversion Health", description: "Conversion rate trends and funnel performance", icon: ShoppingCart, category: "Growth" },
  { id: "customer-retention", label: "Customer Retention", description: "Churn risk and loyalty program effectiveness", icon: Heart, category: "Growth" },
  { id: "compliance-risk", label: "Compliance Risk", description: "Regulatory or contractual obligations needing attention", icon: Shield, category: "Risk" },
];

const ARCHETYPE_DEFAULTS: Record<string, string[]> = {
  ecommerce: ["conversion-health", "customer-retention", "cash-flow-gaps", "margin-risk", "enterprise-opportunities"],
  service: ["strategic-accounts", "proposal-bottlenecks", "collections-issues", "delivery-risk", "capacity-constraints"],
  "brick-and-mortar": ["scheduling-pressure", "staffing-issues", "customer-retention", "capacity-constraints", "compliance-risk"],
  "employee-based": ["staffing-issues", "capacity-constraints", "delivery-risk", "collections-issues", "hiring-needs"],
  agency: ["strategic-accounts", "proposal-bottlenecks", "revenue-concentration", "margin-risk", "delivery-risk", "staffing-issues"],
};

export default function BoardroomFocusEditor() {
  const { primaryMode, adaptations } = useBusinessProfile();
  const identity = getIdentityLayer(primaryMode);
  const defaults = ARCHETYPE_DEFAULTS[primaryMode] || ARCHETYPE_DEFAULTS.service;
  const [selected, setSelected] = useState<Set<string>>(new Set(defaults));

  useEffect(() => {
    setSelected(new Set(ARCHETYPE_DEFAULTS[primaryMode] || ARCHETYPE_DEFAULTS.service));
  }, [primaryMode]);

  const toggle = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const categories = [...new Set(ALL_FOCUS_AREAS.map(f => f.category))];

  return (
    <div className="p-5 space-y-5 max-w-3xl">
      {/* Header card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl overflow-hidden"
        style={{
          background: `linear-gradient(135deg, hsl(${identity.accentColor} / 0.06), transparent)`,
          border: `1px solid hsl(${identity.accentColor} / 0.12)`,
        }}
      >
        <div className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `hsl(${identity.accentColor} / 0.15)` }}>
            <Crosshair size={18} style={{ color: `hsl(${identity.accentColor})` }} />
          </div>
          <div>
            <p className="text-[12px] font-bold text-foreground/70">Boardroom Focus Areas</p>
            <p className="text-[10px] text-foreground/35">{selected.size} of {ALL_FOCUS_AREAS.length} areas selected for strategic review</p>
          </div>
        </div>
      </motion.div>

      {/* Current agenda priorities */}
      <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-4">
        <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-foreground/25 mb-3">Current Agenda Priorities</p>
        <div className="flex flex-wrap gap-1.5">
          {adaptations.boardroom.agendaPriorities.map((p) => (
            <span key={p} className="text-[9px] px-2.5 py-1 rounded-full border border-[hsl(var(--sita-purple))]/15 bg-[hsl(var(--sita-purple))]/5 text-[hsl(var(--sita-purple))] font-medium">
              {p}
            </span>
          ))}
        </div>
      </div>

      {/* Focus area checklist by category */}
      {categories.map((cat) => (
        <div key={cat} className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-foreground/30 px-1">{cat}</p>
          <div className="space-y-1">
            {ALL_FOCUS_AREAS.filter(f => f.category === cat).map((area, i) => {
              const isSelected = selected.has(area.id);
              const isDefault = defaults.includes(area.id);
              const Icon = area.icon;
              return (
                <motion.div
                  key={area.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  onClick={() => toggle(area.id)}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all",
                    isSelected
                      ? "border-[hsl(0_0%_100%/0.1)] bg-[hsl(0_0%_100%/0.04)]"
                      : "border-transparent hover:border-[hsl(0_0%_100%/0.06)] hover:bg-[hsl(0_0%_100%/0.02)]"
                  )}
                >
                  <Checkbox checked={isSelected} className="shrink-0" />
                  <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0", isSelected ? "bg-[hsl(var(--sita-purple))]/10" : "bg-foreground/5")}>
                    <Icon size={13} className={isSelected ? "text-[hsl(var(--sita-purple))]" : "text-foreground/25"} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={cn("text-[11px] font-medium", isSelected ? "text-foreground/70" : "text-foreground/40")}>{area.label}</span>
                      {isDefault && (
                        <span className="text-[7px] px-1 py-0.5 rounded bg-[hsl(var(--sita-gold))]/10 text-[hsl(var(--sita-gold))] font-bold uppercase">
                          Recommended
                        </span>
                      )}
                    </div>
                    <p className="text-[9px] text-foreground/25 truncate">{area.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
