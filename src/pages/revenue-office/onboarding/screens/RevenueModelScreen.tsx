import { DollarSign, Phone, FileText, RefreshCw, Package, Heart, ShoppingBag, MapPin, Users, Megaphone, Layers, TrendingUp, Star, Repeat, Target, BarChart3, UserPlus } from "lucide-react";
import { Toggle, SectionTitle, ScreenHeader, SingleSelect } from "../primitives";
import BranchingQuestionsPanel from "./BranchingQuestionsPanel";
import { getRevenueEngineBranch } from "../branching";
import type { ScreenProps } from "../types";
import { useCallback, useMemo } from "react";
import SitaInsightCallout from "./SitaInsightCallout";

const sources = [
  { id: "appointments", label: "Booked calls / appointments", icon: Phone },
  { id: "proposals", label: "Proposals and invoices", icon: FileText },
  { id: "retainers", label: "Recurring retainers", icon: RefreshCw },
  { id: "digital_products", label: "Digital products", icon: Package },
  { id: "memberships", label: "Memberships / subscriptions", icon: Heart },
  { id: "ecommerce", label: "E-commerce sales", icon: ShoppingBag },
  { id: "in_person", label: "In-person visits", icon: MapPin },
  { id: "referrals", label: "Referrals", icon: Users },
  { id: "launches", label: "Launches / campaigns", icon: Megaphone },
  { id: "mixed", label: "Mixed / evolving", icon: Layers },
];

const growthOptions = [
  { id: "leads", label: "More leads", icon: UserPlus },
  { id: "conversions", label: "Better conversions", icon: Target },
  { id: "aov", label: "Higher order / offer value", icon: BarChart3 },
  { id: "repeat", label: "Repeat business", icon: Repeat },
  { id: "retention", label: "Retention", icon: Heart },
  { id: "referrals", label: "Referrals", icon: Users },
  { id: "reviews", label: "Reviews / reputation", icon: Star },
];

export default function RevenueModelScreen({ state, setState }: ScreenProps) {

  const toggle = useCallback((v: string) => {
    setState(p => ({ ...p, revenueSources: p.revenueSources.includes(v) ? p.revenueSources.filter(x => x !== v) : [...p.revenueSources, v] }));
  }, [setState]);

  const toggleGrowth = useCallback((v: string) => {
    setState(p => ({ ...p, growthGoals: p.growthGoals.includes(v) ? p.growthGoals.filter(x => x !== v) : [...p.growthGoals, v] }));
  }, [setState]);

  const selectedSources = sources.filter(s => state.revenueSources.includes(s.id));
  const branchQuestions = useMemo(() => getRevenueEngineBranch(state), [state.revenueSources]);
  const handleBranch = useCallback((qId: string, oId: string) => {
    setState(p => {
      const current = p.branchAnswers[qId] || [];
      const next = current.includes(oId) ? current.filter(x => x !== oId) : [...current, oId];
      return { ...p, branchAnswers: { ...p.branchAnswers, [qId]: next } };
    });
  }, [setState]);

  return (
    <div className="space-y-6">

      <ScreenHeader icon={DollarSign} title="How does money come into the business?" subtitle="Select all that apply — we'll ask which matter most" color="text-emerald-400" />
      <div className="grid md:grid-cols-2 gap-2">
        {sources.map(s => <Toggle key={s.id} label={s.label} icon={s.icon} selected={state.revenueSources.includes(s.id)} onToggle={() => toggle(s.id)} />)}
      </div>
      <SitaInsightCallout
        show={state.revenueSources.includes("proposals") && state.revenueSources.includes("appointments")}
        message="Proposal-driven revenue engine detected — Quote Studio and Call Desk will be priority modules."
        type="detected"
      />
      <SitaInsightCallout
        show={state.revenueSources.includes("ecommerce") && !state.revenueSources.includes("proposals")}
        message="Checkout-driven model detected — cart recovery and repeat purchase will be key automations."
        type="detected"
      />
      <SitaInsightCallout
        show={state.revenueSources.length >= 4}
        message={`${state.revenueSources.length} revenue streams detected — SITA will map each one and find where they reinforce or compete.`}
        type="detected"
      />
      {selectedSources.length >= 2 && (
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <SectionTitle>Which is growing fastest?</SectionTitle>
            <SingleSelect value={state.revenueGrowing} onChange={v => setState(p => ({ ...p, revenueGrowing: v }))} options={selectedSources.map(s => ({ id: s.id, label: s.label }))} />
          </div>
          <div>
            <SectionTitle>Which feels weakest?</SectionTitle>
            <SingleSelect value={state.revenueWeakest} onChange={v => setState(p => ({ ...p, revenueWeakest: v }))} options={selectedSources.map(s => ({ id: s.id, label: s.label }))} />
          </div>
        </div>
      )}
      <div>
        <SectionTitle hint="Select all that apply">What would you like to grow most?</SectionTitle>
        <div className="grid md:grid-cols-2 gap-2">
          {growthOptions.map(o => <Toggle key={o.id} label={o.label} icon={o.icon} selected={state.growthGoals.includes(o.id)} onToggle={() => toggleGrowth(o.id)} />)}
        </div>
      </div>
      {state.setupDepth === "deep" && branchQuestions.length > 0 && (
        <BranchingQuestionsPanel questions={branchQuestions} answers={state.branchAnswers} onAnswer={handleBranch} />
      )}
    </div>
  );
}
