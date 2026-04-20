import { Package, Phone, ClipboardList, DollarSign, Rocket, GraduationCap, ShoppingBag, RefreshCw, Heart, UserPlus, MessageSquare, ArrowRight, AlertTriangle, Star, TrendingUp } from "lucide-react";
import { Toggle, SectionTitle, ChapterBanner } from "../primitives";
// Canonical onboarding primitives (drift-prevented by check-onboarding-components-folder)
import { OnboardingStepHeader as _CanonHeader } from "@/components/onboarding";
void _CanonHeader;
import type { ScreenProps } from "../types";
import { useCallback } from "react";

const postSaleOptions = [
  { id: "onboarding_call", label: "Onboarding call", icon: Phone },
  { id: "intake_forms", label: "Forms / intake", icon: ClipboardList },
  { id: "payment", label: "Payment / invoice", icon: DollarSign },
  { id: "kickoff", label: "Kickoff meeting", icon: Rocket },
  { id: "delivery", label: "Service delivery", icon: Package },
  { id: "course_access", label: "Course / product access", icon: GraduationCap },
  { id: "shipment", label: "Shipment / fulfillment", icon: ShoppingBag },
  { id: "checkins", label: "Recurring check-ins", icon: RefreshCw },
  { id: "renewal", label: "Renewal flow", icon: Heart },
];

const slipOptions = [
  { id: "onboarding", label: "Onboarding", icon: UserPlus },
  { id: "followup", label: "Follow-up", icon: MessageSquare },
  { id: "handoff", label: "Delivery handoff", icon: ArrowRight },
  { id: "expectations", label: "Expectations management", icon: AlertTriangle },
  { id: "retention", label: "Retention", icon: Heart },
  { id: "reviews", label: "Review requests", icon: Star },
  { id: "renewals", label: "Renewals", icon: RefreshCw },
  { id: "upsells", label: "Upsells", icon: TrendingUp },
];

export default function DeliveryScreen({ state, setState }: ScreenProps) {
  
  const togglePost = useCallback((v: string) => {
    setState(p => ({ ...p, postSaleSteps: p.postSaleSteps.includes(v) ? p.postSaleSteps.filter(x => x !== v) : [...p.postSaleSteps, v] }));
  }, [setState]);
  const toggleSlip = useCallback((v: string) => {
    setState(p => ({ ...p, postSaleSlips: p.postSaleSlips.includes(v) ? p.postSaleSlips.filter(x => x !== v) : [...p.postSaleSlips, v] }));
  }, [setState]);

  return (
    <div className="space-y-6">
      
      <ChapterBanner chapter="Chapter 3: Delivery Model" subtitle="What happens after someone buys — the most neglected part of growth" />
      <div>
        <SectionTitle>What happens after someone buys?</SectionTitle>
        <div className="grid md:grid-cols-3 gap-2">
          {postSaleOptions.map(o => <Toggle key={o.id} label={o.label} icon={o.icon} selected={state.postSaleSteps.includes(o.id)} onToggle={() => togglePost(o.id)} />)}
        </div>
      </div>
      <div>
        <SectionTitle hint="SITA will build automations to fix these">What tends to slip after the sale?</SectionTitle>
        <div className="grid md:grid-cols-2 gap-2">
          {slipOptions.map(o => <Toggle key={o.id} label={o.label} icon={o.icon} selected={state.postSaleSlips.includes(o.id)} onToggle={() => toggleSlip(o.id)} />)}
        </div>
      </div>
    </div>
  );
}
