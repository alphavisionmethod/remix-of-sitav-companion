// truth-allow: ia-config
// ═══════════════════════════════════════════════════════════════
// SITA OS — Money Office: Life-to-Money Impact Engine
// ═══════════════════════════════════════════════════════════════

import { SitaCard, SitaCardTitle, SitaSectionHeader } from "@/platform/sita/components/sita/SitaCard";
import { KPITile } from "@/platform/sita/components/sita/SitaComponents";
import { DomainHeader } from "@/platform/sita/components/sita/primitives/DomainHeader";
import { Home, Baby, Briefcase, Users, Building, CreditCard, RefreshCw, Rocket, Sun, Heart, Plane, ArrowRight, AlertTriangle, TrendingDown, TrendingUp, DollarSign } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import type { LifeEventType, LifeMoneyImpact } from "@/packages/finance-contracts/advanced-intelligence";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
import { ModuleAdvisorInsight } from "@/platform/sita/components/sita/domain-shared/ModuleAdvisorInsight";

interface LifeEventDef {
  type: LifeEventType;
  label: string;
  icon: typeof Home;
  description: string;
}

const LIFE_EVENTS: LifeEventDef[] = [
  { type: "moving", label: "Moving", icon: Home, description: "Relocating to a new home — deposits, movers, overlap rent" },
  { type: "having-child", label: "Having a Child", icon: Baby, description: "New family member — healthcare, supplies, income changes" },
  { type: "starting-business", label: "Starting a Business", icon: Rocket, description: "Launching a venture — startup costs, reduced income" },
  { type: "hiring", label: "Hiring", icon: Users, description: "Adding team — payroll, benefits, equipment" },
  { type: "buying-home", label: "Buying a Home", icon: Building, description: "Home purchase — down payment, closing costs, mortgage" },
  { type: "taking-debt", label: "Taking on Debt", icon: CreditCard, description: "New loan or credit — monthly payment, interest impact" },
  { type: "job-change", label: "Changing Job", icon: RefreshCw, description: "Career transition — income gap, benefit changes" },
  { type: "launching-offer", label: "Launching an Offer", icon: Briefcase, description: "Product/service launch — marketing, inventory costs" },
  { type: "seasonal-slowdown", label: "Seasonal Slowdown", icon: Sun, description: "Business seasonality — reduced revenue period" },
  { type: "health-event", label: "Health Event", icon: Heart, description: "Medical needs — treatment, time off, insurance" },
  { type: "travel", label: "Travel Plans", icon: Plane, description: "Extended travel — flights, accommodation, reduced work" },
];

function simulateImpact(eventType: LifeEventType): LifeMoneyImpact {
  const impacts: Record<LifeEventType, LifeMoneyImpact> = {
    moving: {
      event: "moving", cashflowImpactCents: -850000, safeToSpendChange: -35,
      reserveNeedsCents: 600000,
      budgetShifts: [{ category: "Housing", changePct: 15 }, { category: "Transport", changePct: -10 }],
      billPressureChange: 20,
      riskWindows: [{ start: "Month 1", end: "Month 2", risk: "Double rent/mortgage overlap" }],
      suggestedChanges: ["Build 2-month housing buffer", "Pause non-essential subscriptions", "Delay discretionary purchases"],
    },
    "having-child": {
      event: "having-child", cashflowImpactCents: -450000, safeToSpendChange: -25,
      reserveNeedsCents: 800000,
      budgetShifts: [{ category: "Healthcare", changePct: 40 }, { category: "Childcare", changePct: 100 }, { category: "Dining", changePct: -20 }],
      billPressureChange: 30,
      riskWindows: [{ start: "Month 1", end: "Month 6", risk: "Parental leave income reduction" }],
      suggestedChanges: ["Increase emergency fund to 6 months", "Review health insurance coverage", "Start childcare sinking fund"],
    },
    "starting-business": {
      event: "starting-business", cashflowImpactCents: -1200000, safeToSpendChange: -50,
      reserveNeedsCents: 1500000,
      budgetShifts: [{ category: "Business", changePct: 100 }, { category: "Personal", changePct: -30 }],
      billPressureChange: 40,
      riskWindows: [{ start: "Month 1", end: "Month 12", risk: "Pre-revenue runway risk" }],
      suggestedChanges: ["Build 12-month personal runway", "Separate business/personal finances", "Establish tax reserves early"],
    },
    hiring: {
      event: "hiring", cashflowImpactCents: -600000, safeToSpendChange: -20,
      reserveNeedsCents: 400000,
      budgetShifts: [{ category: "Payroll", changePct: 50 }, { category: "Equipment", changePct: 30 }],
      billPressureChange: 25,
      riskWindows: [{ start: "Month 1", end: "Month 3", risk: "Payroll before revenue uplift" }],
      suggestedChanges: ["Build 3-month payroll reserve", "Confirm revenue supports hire", "Set up payroll tax escrow"],
    },
    "buying-home": {
      event: "buying-home", cashflowImpactCents: -2000000, safeToSpendChange: -45,
      reserveNeedsCents: 1200000,
      budgetShifts: [{ category: "Housing", changePct: 30 }, { category: "Maintenance", changePct: 100 }],
      billPressureChange: 35,
      riskWindows: [{ start: "Month 1", end: "Month 3", risk: "Down payment + closing cost cash drain" }],
      suggestedChanges: ["Ensure 6-month reserve post-purchase", "Factor in property tax escrow", "Budget for immediate repairs"],
    },
    "taking-debt": {
      event: "taking-debt", cashflowImpactCents: -200000, safeToSpendChange: -15,
      reserveNeedsCents: 100000,
      budgetShifts: [{ category: "Debt Service", changePct: 25 }],
      billPressureChange: 15,
      riskWindows: [{ start: "Ongoing", end: "Loan term", risk: "Interest drag on cashflow" }],
      suggestedChanges: ["Model total interest cost", "Ensure DTI stays below 36%", "Set up auto-pay immediately"],
    },
    "job-change": {
      event: "job-change", cashflowImpactCents: -300000, safeToSpendChange: -20,
      reserveNeedsCents: 500000,
      budgetShifts: [{ category: "Insurance", changePct: 30 }, { category: "Commute", changePct: -15 }],
      billPressureChange: 10,
      riskWindows: [{ start: "Week 1", end: "Month 2", risk: "Income gap between jobs" }],
      suggestedChanges: ["Maintain 3-month buffer", "Bridge health insurance coverage", "Negotiate start date for overlap"],
    },
    "launching-offer": {
      event: "launching-offer", cashflowImpactCents: -400000, safeToSpendChange: -18,
      reserveNeedsCents: 300000,
      budgetShifts: [{ category: "Marketing", changePct: 80 }, { category: "Inventory", changePct: 50 }],
      billPressureChange: 15,
      riskWindows: [{ start: "Launch week", end: "Month 2", risk: "Pre-revenue marketing spend" }],
      suggestedChanges: ["Set launch budget cap", "Stage spending across milestones", "Track ROI from week 1"],
    },
    "seasonal-slowdown": {
      event: "seasonal-slowdown", cashflowImpactCents: -350000, safeToSpendChange: -25,
      reserveNeedsCents: 400000,
      budgetShifts: [{ category: "Revenue", changePct: -40 }, { category: "Marketing", changePct: -20 }],
      billPressureChange: 20,
      riskWindows: [{ start: "Slow season", end: "Recovery", risk: "Revenue dip vs fixed costs" }],
      suggestedChanges: ["Build seasonal reserve during peak", "Reduce variable costs during slow period", "Accelerate receivables before slowdown"],
    },
    "health-event": {
      event: "health-event", cashflowImpactCents: -500000, safeToSpendChange: -30,
      reserveNeedsCents: 600000,
      budgetShifts: [{ category: "Healthcare", changePct: 60 }, { category: "Income", changePct: -25 }],
      billPressureChange: 25,
      riskWindows: [{ start: "Onset", end: "Recovery", risk: "Income reduction + medical costs" }],
      suggestedChanges: ["Review insurance coverage gaps", "Understand out-of-pocket maximums", "Explore disability coverage"],
    },
    travel: {
      event: "travel", cashflowImpactCents: -300000, safeToSpendChange: -15,
      reserveNeedsCents: 150000,
      budgetShifts: [{ category: "Travel", changePct: 100 }, { category: "Dining Out", changePct: 50 }],
      billPressureChange: 5,
      riskWindows: [{ start: "Trip start", end: "Trip end", risk: "Concentrated spending period" }],
      suggestedChanges: ["Set trip budget envelope", "Pre-pay bills due during travel", "Use travel sinking fund"],
    },
  };
  return impacts[eventType];
}

const LifeMoneyEngine = () => {
  const [selectedEvent, setSelectedEvent] = useState<LifeEventType | null>(null);
  const impact = useMemo(() => selectedEvent ? simulateImpact(selectedEvent) : null, [selectedEvent]);
  const selectedDef = LIFE_EVENTS.find(e => e.type === selectedEvent);

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <DomainHeader domain="money" title="Life-to-Money Impact Engine" subtitle="See how life changes affect your financial system" />
      <PageTruthBanner truthState="partial" />
<SitaSectionHeader title="Select a Life Event" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {LIFE_EVENTS.map(evt => {
          const Icon = evt.icon;
          const isSelected = selectedEvent === evt.type;
          return (
            <SitaCard key={evt.type} hover onClick={() => setSelectedEvent(evt.type)}
              className={`p-4 cursor-pointer transition-all ${isSelected ? "ring-2 ring-primary bg-primary/5" : ""}`}>
              <div className="flex items-center gap-3">
                <div className={`rounded-xl p-2 ${isSelected ? "bg-primary/15" : "bg-secondary/60"}`}>
                  <Icon className={`h-4 w-4 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{evt.label}</p>
                  <p className="text-[10px] text-muted-foreground">{evt.description}</p>
                </div>
              </div>
            </SitaCard>
          );
        })}
      </div>

      {impact && selectedDef && (
        <motion.div className="space-y-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} key={selectedEvent}>
          <SitaSectionHeader title={`Impact Analysis: ${selectedDef.label}`} />

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <KPITile label="Cashflow Impact" value={`-$${Math.abs(impact.cashflowImpactCents / 100).toLocaleString()}`} icon={TrendingDown} sub="One-time + ongoing" />
            <KPITile label="Safe-to-Spend Change" value={`${impact.safeToSpendChange}%`} icon={DollarSign} sub="Discretionary reduction" />
            <KPITile label="Reserve Need" value={`$${(impact.reserveNeedsCents / 100).toLocaleString()}`} icon={AlertTriangle} sub="Recommended buffer" />
            <KPITile label="Bill Pressure" value={`+${impact.billPressureChange}%`} icon={TrendingUp} sub="Obligation increase" />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <SitaCard hover={false} className="p-5">
                <SitaCardTitle sub="How your budget categories shift">Budget Impact</SitaCardTitle>
                <div className="mt-4 space-y-2">
                  {impact.budgetShifts.map((shift, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg bg-secondary/30 px-3 py-2">
                      <span className="text-sm text-foreground">{shift.category}</span>
                      <span className={`text-sm font-semibold ${shift.changePct > 0 ? "text-urgency-high" : "text-trust-verified"}`}>
                        {shift.changePct > 0 ? "+" : ""}{shift.changePct}%
                      </span>
                    </div>
                  ))}
                </div>
              </SitaCard>

              <SitaCard hover={false} className="p-5">
                <SitaCardTitle sub="Periods of elevated financial risk">Risk Windows</SitaCardTitle>
                <div className="mt-4 space-y-2">
                  {impact.riskWindows.map((w, i) => (
                    <div key={i} className="rounded-lg bg-destructive/5 border border-destructive/20 px-3 py-2.5">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                        <span className="text-xs font-semibold text-foreground">{w.start} → {w.end}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{w.risk}</p>
                    </div>
                  ))}
                </div>
              </SitaCard>
            </div>

            <div className="space-y-4">
              <SitaCard hover={false} className="p-5">
                <SitaCardTitle sub="What to change in your financial setup">Suggested Changes</SitaCardTitle>
                <div className="mt-4 space-y-2">
                  {impact.suggestedChanges.map((change, i) => (
                    <div key={i} className="flex items-start gap-2 rounded-lg bg-primary/5 border border-primary/10 px-3 py-2.5">
                      <ArrowRight className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                      <p className="text-xs text-foreground">{change}</p>
                    </div>
                  ))}
                </div>
              </SitaCard>

              <ModuleAdvisorInsight
                advisorName="Life Impact Advisor"
                domain="finance"
                insight={`${selectedDef.label} will impact cashflow by $${Math.abs(impact.cashflowImpactCents / 100).toLocaleString()} and reduce safe-to-spend by ${Math.abs(impact.safeToSpendChange)}%.`}
                confidence={85}
              />
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default LifeMoneyEngine;
