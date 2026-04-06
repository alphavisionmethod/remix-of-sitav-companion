import { Globe, Phone, MessageSquare, FileText, ShoppingCart, MapPin, Users, Mail, Calendar, Brain, Eye, Shield, Heart, ClipboardList } from "lucide-react";
import { Toggle, SectionTitle, ScreenHeader } from "../primitives";
import type { ScreenProps } from "../types";
import { useCallback } from "react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";

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

export default function ConversionScreen({ state, setState }: ScreenProps) {
  const toggleBuy = useCallback((v: string) => {
    setState(p => ({ ...p, preBuyBehavior: p.preBuyBehavior.includes(v) ? p.preBuyBehavior.filter(x => x !== v) : [...p.preBuyBehavior, v] }));
  }, [setState]);
  const toggleClose = useCallback((v: string) => {
    setState(p => ({ ...p, whatCloses: p.whatCloses.includes(v) ? p.whatCloses.filter(x => x !== v) : [...p.whatCloses, v] }));
  }, [setState]);

  return (
    <div className="space-y-6">
      <DemoModeBadge />
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
    </div>
  );
}
