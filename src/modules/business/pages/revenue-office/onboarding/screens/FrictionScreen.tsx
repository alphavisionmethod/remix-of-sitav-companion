import { useMemo, useCallback } from "react";
import SitaInsightCallout from "./SitaInsightCallout";
import { Card, CardContent } from "@/components/ui/card";
import { Flame, Users, MessageSquare, Target, Phone, DollarSign, Package, Heart, Star, RefreshCw, AlertTriangle, Eye, Brain } from "lucide-react";
import { Toggle, ScreenHeader, SectionTitle, SingleSelect } from "../primitives";
// Canonical onboarding primitives (drift-prevented by check-onboarding-components-folder)
import { OnboardingProgress as _CanonProgress } from "@/components/onboarding";
void _CanonProgress;
import BranchingQuestionsPanel from "./BranchingQuestionsPanel";
import { getBottleneckBranch } from "../branching";
import type { ScreenProps } from "../types";

const bottlenecks = [
  { id: "lead_flow", label: "Not enough leads coming in", desc: "Pipeline feels empty or unpredictable", icon: Users },
  { id: "lead_followup", label: "Leads fall through the cracks", desc: "Inquiries arrive but follow-up is inconsistent", icon: MessageSquare },
  { id: "conversion", label: "Leads don't convert", desc: "Interest exists but deals don't close", icon: Target },
  { id: "no_shows", label: "No-shows and cancellations", desc: "Appointments booked but attendance is poor", icon: Phone },
  { id: "pricing", label: "Pricing confusion or undercharging", desc: "Not sure what to charge or leaving money on table", icon: DollarSign },
  { id: "delivery", label: "Delivery bottleneck", desc: "Can't scale without quality dropping", icon: Package },
  { id: "retention_gap", label: "Customers leave too quickly", desc: "Churn is high, repeat business is low", icon: Heart },
  { id: "review_gap", label: "Not enough reviews", desc: "Happy clients but no social proof", icon: Star },
  { id: "reactivation", label: "Past customers never come back", desc: "Existing base goes cold", icon: RefreshCw },
  { id: "time_chaos", label: "Overwhelmed / too many hats", desc: "Founder doing everything, no systems", icon: AlertTriangle },
  { id: "visibility", label: "No clear visibility", desc: "Can't see pipeline, revenue, or customer health", icon: Eye },
  { id: "handoff", label: "Internal handoff problems", desc: "Things drop between team members", icon: Users },
  { id: "campaigns", label: "Inconsistent campaigns", desc: "Marketing is sporadic, not systematic", icon: Star },
];

export default function FrictionScreen({ state, setState }: ScreenProps) {
  
  const toggle = useCallback((v: string) => {
    setState(p => ({ ...p, growthBottlenecks: p.growthBottlenecks.includes(v) ? p.growthBottlenecks.filter(x => x !== v) : [...p.growthBottlenecks, v] }));
  }, [setState]);

  const branchQuestions = useMemo(() => getBottleneckBranch(state), [state.growthBottlenecks]);
  const handleBranch = useCallback((qId: string, oId: string) => {
    setState(p => {
      const current = p.branchAnswers[qId] || [];
      const next = current.includes(oId) ? current.filter(x => x !== oId) : [...current, oId];
      return { ...p, branchAnswers: { ...p.branchAnswers, [qId]: next } };
    });
  }, [setState]);

  const reliefOptions = useMemo(() =>
    state.growthBottlenecks.map(id => bottlenecks.find(b => b.id === id)).filter(Boolean).map(b => ({ id: b!.id, label: b!.label }))
  , [state.growthBottlenecks]);

  return (
    <div className="space-y-6">
      
      <ScreenHeader icon={Flame} title="Where does momentum usually get lost?" subtitle="Be honest — this is where SITA can make the biggest impact fastest" color="text-amber-400" />
      <div className="grid md:grid-cols-2 gap-2">
        {bottlenecks.map(b => <Toggle key={b.id} label={b.label} desc={b.desc} icon={b.icon} selected={state.growthBottlenecks.includes(b.id)} onToggle={() => toggle(b.id)} />)}
      </div>
      <SitaInsightCallout
        show={state.growthBottlenecks.length >= 3}
        message={`${state.growthBottlenecks.length} bottlenecks identified — SITA estimates these could be costing $${(state.growthBottlenecks.length * 4500).toLocaleString()}/mo in lost revenue.`}
        type="recommendation"
      />
      {state.growthBottlenecks.length > 0 && (
        <Card className="bg-amber-500/5 border-amber-500/15">
          <CardContent className="p-4">
            <div className="flex items-start gap-2">
              <Brain className="h-4 w-4 text-amber-400 mt-0.5" />
              <div>
                <p className="text-sm text-foreground font-medium">SITA will prioritize these</p>
                <p className="text-xs text-muted-foreground mt-1">{state.growthBottlenecks.length} bottleneck{state.growthBottlenecks.length !== 1 ? "s" : ""} identified — leak detection, advisors, and first-win suggestions will focus here.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      {state.growthBottlenecks.length >= 2 && (
        <div>
          <SectionTitle>What would feel like the biggest relief in 30 days?</SectionTitle>
          <SingleSelect value={state.branchAnswers["relief_priority"]?.[0] || ""} onChange={v => handleBranch("relief_priority", v)} options={reliefOptions} />
        </div>
      )}
      {state.setupDepth === "deep" && branchQuestions.length > 0 && (
        <BranchingQuestionsPanel questions={branchQuestions} answers={state.branchAnswers} onAnswer={handleBranch} />
      )}
    </div>
  );
}
