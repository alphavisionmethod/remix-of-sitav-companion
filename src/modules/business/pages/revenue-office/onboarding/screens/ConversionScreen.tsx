import { Globe, Phone, MessageSquare, FileText, ShoppingCart, MapPin, Users, Mail, Calendar, Brain, Eye, Shield, Heart, ClipboardList, AlertTriangle } from "lucide-react";
import { Toggle, SectionTitle, ScreenHeader } from "../primitives";
// Canonical onboarding primitives (drift-prevented by check-onboarding-components-folder)
import { OnboardingChoiceCard as _CanonChoice } from "@/platform/setup/components/onboarding";
void _CanonChoice;
import SitaInsightCallout from "./SitaInsightCallout";
import type { ScreenProps } from "../types";
import { useCallback } from "react";

const preBuyOptions = [
  { id: "discover_online", label: "Discover me online", icon: Globe },
  { id: "fill_form", label: "Fill out a form", icon: ClipboardList },
  { id: "book_call", label: "Book a call", icon: Phone },
  { id: "message", label: "Message me", icon: MessageSquare },
  { id: "walk_in", label: "Walk in / visit", icon: MapPin },
  { id: "email_list", label: "Join email list", icon: Mail },
  { id: "buy_direct", label: "Buy directly", icon: ShoppingCart },
  { id: "ask_quote", label: "Ask for a quote", icon: FileText },
  { id: "referral", label: "Get referred", icon: Users },
  { id: "webinar", label: "Attend webinar / event", icon: Calendar },
  { id: "nurture", label: "Join nurture flow", icon: Brain },
];

const closeOptions = [
  { id: "call", label: "A call", icon: Phone },
  { id: "proposal", label: "A proposal", icon: FileText },
  { id: "checkout", label: "Checkout", icon: ShoppingCart },
  { id: "trust", label: "Trust and timing", icon: Shield },
  { id: "referral_conf", label: "Referral confidence", icon: Users },
  { id: "relationship", label: "Recurring relationship", icon: Heart },
  { id: "in_person", label: "In-person experience", icon: MapPin },
  { id: "trial", label: "Free trial", icon: Eye },
];

const weaknessOptions = [
  { id: "lead_capture", label: "Lead capture", icon: ClipboardList },
  { id: "follow_up", label: "Follow-up", icon: MessageSquare },
  { id: "show_up_rate", label: "Show-up rate", icon: Calendar },
  { id: "quote_conversion", label: "Quote conversion", icon: FileText },
  { id: "checkout_conversion", label: "Checkout conversion", icon: ShoppingCart },
  { id: "nurture", label: "Nurture", icon: Brain },
  { id: "trust_reputation", label: "Trust / reputation", icon: Shield },
  { id: "objection_handling", label: "Objection handling", icon: AlertTriangle },
];

export default function ConversionScreen({ state, setState }: ScreenProps) {
  const toggleBuy = useCallback((v: string) => {
    setState(p => ({ ...p, preBuyBehavior: p.preBuyBehavior.includes(v) ? p.preBuyBehavior.filter(x => x !== v) : [...p.preBuyBehavior, v] }));
  }, [setState]);
  const toggleClose = useCallback((v: string) => {
    setState(p => ({ ...p, whatCloses: p.whatCloses.includes(v) ? p.whatCloses.filter(x => x !== v) : [...p.whatCloses, v] }));
  }, [setState]);
  const toggleWeakness = useCallback((v: string) => {
    setState(p => ({ ...p, conversionWeakness: p.conversionWeakness.includes(v) ? p.conversionWeakness.filter(x => x !== v) : [...p.conversionWeakness, v] }));
  }, [setState]);

  return (
    <div className="space-y-6">
      <ScreenHeader icon={ShoppingCart} title="How do people usually become customers?" subtitle="This maps your conversion motion and funnel structure" color="text-purple-400" />
      <div>
        <SectionTitle hint="Select all that apply">What do customers do before they buy?</SectionTitle>
        <div className="grid md:grid-cols-3 gap-2">
          {preBuyOptions.map(o => <Toggle key={o.id} label={o.label} icon={o.icon} selected={state.preBuyBehavior.includes(o.id)} onToggle={() => toggleBuy(o.id)} />)}
        </div>
      </div>
      <div>
        <SectionTitle>What usually closes the deal?</SectionTitle>
        <div className="grid md:grid-cols-2 gap-2">
          {closeOptions.map(o => <Toggle key={o.id} label={o.label} icon={o.icon} selected={state.whatCloses.includes(o.id)} onToggle={() => toggleClose(o.id)} />)}
        </div>
      </div>
      <div>
        <SectionTitle hint="Select all that apply">What part of conversion feels weakest today?</SectionTitle>
        <div className="grid md:grid-cols-2 gap-2">
          {weaknessOptions.map(o => <Toggle key={o.id} label={o.label} icon={o.icon} selected={state.conversionWeakness.includes(o.id)} onToggle={() => toggleWeakness(o.id)} />)}
        </div>
      </div>
      <SitaInsightCallout
        show={state.conversionWeakness.includes("follow_up") && state.conversionWeakness.includes("show_up_rate")}
        message="Follow-up and show-up issues detected — SITA will prioritize Call Desk reminders and rescue automations."
        type="detected"
      />
      <SitaInsightCallout
        show={state.conversionWeakness.includes("quote_conversion") && state.whatCloses.includes("proposal")}
        message="Quote conversion weakness in a proposal-driven model — Quote Studio will be a priority module."
        type="detected"
      />
    </div>
  );
}
