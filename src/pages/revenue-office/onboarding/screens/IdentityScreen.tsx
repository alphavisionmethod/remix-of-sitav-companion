import { Building2, Briefcase, Users, GraduationCap, PenTool, ShoppingCart, MapPin, Heart, Layers, Sparkles } from "lucide-react";
import { Toggle, SectionTitle, SingleSelect, ChapterBanner } from "../primitives";
import BranchingQuestionsPanel from "./BranchingQuestionsPanel";
import { getBusinessTypeBranch } from "../branching";
import type { ScreenProps } from "../types";
import { useCallback, useMemo } from "react";
import SitaInsightCallout from "./SitaInsightCallout";

const businessTypes = [
  { id: "service", label: "Service Business", desc: "Appointments, proposals, delivery milestones, reviews", icon: Briefcase },
  { id: "agency", label: "Agency", desc: "Multi-client, retainers, reporting, white-label", icon: Users },
  { id: "coaching", label: "Coach / Consultant", desc: "Personal brand, bookings, packages, memberships", icon: GraduationCap },
  { id: "creator", label: "Creator / Education", desc: "Products, courses, memberships, launches, content funnels", icon: PenTool },
  { id: "ecommerce", label: "Online Store", desc: "Products, carts, checkout, fulfillment, repeat purchase", icon: ShoppingCart },
  { id: "local", label: "Local / Brick & Mortar", desc: "Visits, bookings, reputation, local campaigns, scheduling", icon: MapPin },
  { id: "membership", label: "Membership Business", desc: "Subscriptions, access tiers, renewal, retention", icon: Heart },
  { id: "hybrid", label: "Hybrid / Mixed Model", desc: "Multiple revenue streams, mixed delivery", icon: Layers },
  { id: "evolving", label: "Still Evolving", desc: "Exploring models, testing ideas, early stage", icon: Sparkles },
];

export default function IdentityScreen({ state, setState }: ScreenProps) {
  
  const toggle = useCallback((v: string) => {
    setState(p => ({ ...p, businessTypes: p.businessTypes.includes(v) ? p.businessTypes.filter(x => x !== v) : [...p.businessTypes, v] }));
  }, [setState]);

  const branchQuestions = useMemo(() => getBusinessTypeBranch(state), [state.businessTypes]);
  const handleBranch = useCallback((qId: string, oId: string) => {
    setState(p => {
      const current = p.branchAnswers[qId] || [];
      const next = current.includes(oId) ? current.filter(x => x !== oId) : [...current, oId];
      return { ...p, branchAnswers: { ...p.branchAnswers, [qId]: next } };
    });
  }, [setState]);

  return (
    <div className="space-y-6">
      
      <ChapterBanner chapter="Chapter 1: Formation" subtitle="Let SITA understand who you are and what you do" />
      <div>
        <label className="text-xs font-medium text-muted-foreground block mb-2">What is your business called?</label>
        <input type="text" value={state.businessName} onChange={e => setState(p => ({ ...p, businessName: e.target.value }))}
          placeholder="Your business name" className="w-full p-3.5 rounded-xl bg-background border border-border/50 text-foreground text-sm focus:ring-1 focus:ring-primary/30 focus:border-primary/30 outline-none" />
      </div>
      <div>
        <SectionTitle hint="Choose all that apply — most businesses are hybrids">What best describes what you do?</SectionTitle>
        <div className="grid md:grid-cols-2 gap-2">
          {businessTypes.map(bt => <Toggle key={bt.id} label={bt.label} desc={bt.desc} icon={bt.icon} selected={state.businessTypes.includes(bt.id)} onToggle={() => toggle(bt.id)} />)}
      </div>
      <SitaInsightCallout
        show={state.businessTypes.length > 1}
        message={state.businessTypes.length > 2
          ? `We detected a complex hybrid model with ${state.businessTypes.length} revenue types — SITA will adapt across all of them.`
          : state.businessTypes.length === 2
            ? "Hybrid model detected — SITA will map both revenue streams and find crossover opportunities."
            : ""}
        type="detected"
      />
      <SitaInsightCallout
        show={state.businessTypes.length === 1 && state.businessTypes.includes("service")}
        message="Service-heavy business pattern — SITA will prioritize proposals, delivery milestones, and client retention."
        type="detected"
      />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <SectionTitle>Team size</SectionTitle>
          <SingleSelect value={state.teamSize} onChange={v => setState(p => ({ ...p, teamSize: v }))}
            options={[{ id: "solo", label: "Solo / founder" }, { id: "small", label: "Small team (2-10)" }, { id: "growing", label: "Growing team (10+)" }, { id: "multi", label: "Multi-location / agency" }]} />
        </div>
        <div>
          <SectionTitle>Business stage</SectionTitle>
          <SingleSelect value={state.businessStage} onChange={v => setState(p => ({ ...p, businessStage: v }))}
            options={[{ id: "starting", label: "Just starting" }, { id: "growing", label: "Growing" }, { id: "established", label: "Established" }, { id: "scaling", label: "Scaling / optimizing" }]} />
        </div>
      </div>
      {state.teamSize === "multi" && (
        <div className="grid grid-cols-2 gap-4">
          <label className="flex items-center gap-3 p-3 rounded-xl bg-card/50 border border-border/50 cursor-pointer">
            <input type="checkbox" checked={state.multiBrand} onChange={e => setState(p => ({ ...p, multiBrand: e.target.checked }))} className="accent-primary" />
            <div><p className="text-xs font-medium text-foreground">Multiple brands</p><p className="text-[9px] text-muted-foreground">I manage separate business brands</p></div>
          </label>
          <label className="flex items-center gap-3 p-3 rounded-xl bg-card/50 border border-border/50 cursor-pointer">
            <input type="checkbox" checked={state.multiClient} onChange={e => setState(p => ({ ...p, multiClient: e.target.checked }))} className="accent-primary" />
            <div><p className="text-xs font-medium text-foreground">Multiple clients</p><p className="text-[9px] text-muted-foreground">I serve clients as an agency</p></div>
          </label>
        </div>
      )}
      {state.setupDepth === "deep" && branchQuestions.length > 0 && (
        <BranchingQuestionsPanel questions={branchQuestions} answers={state.branchAnswers} onAnswer={handleBranch} />
      )}
    </div>
  );
}
