import { useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Target, Briefcase, GraduationCap, ShoppingCart, MapPin, Users, PenTool, Heart, Layers, Brain, Check, ArrowRight, MessageSquare, Phone, FileText, RefreshCw } from "lucide-react";
import { Toggle, SectionTitle, ScreenHeader } from "../primitives";
import type { ScreenProps } from "../types";

const templates = [
  { id: "service", label: "Service Business", flow: ["Lead", "Inquiry", "Call", "Quote", "Close", "Onboarding", "Delivery", "Review"], icon: Briefcase },
  { id: "coaching", label: "Coaching / Consulting", flow: ["Lead magnet", "Nurture", "Booking", "Sales call", "Enrollment", "Onboarding", "Renewal"], icon: GraduationCap },
  { id: "ecommerce", label: "E-commerce", flow: ["Traffic", "Product", "Cart", "Checkout", "Fulfillment", "Review", "Repeat"], icon: ShoppingCart },
  { id: "local", label: "Local Business", flow: ["Discovery", "Visit/booking", "Service", "Review", "Repeat", "Referral"], icon: MapPin },
  { id: "agency", label: "Agency", flow: ["Referral/content", "Discovery", "Proposal", "Retainer", "Delivery", "Reporting", "Renewal"], icon: Users },
  { id: "creator", label: "Creator / Course", flow: ["Content", "Lead magnet", "Nurture", "Launch", "Enrollment", "Delivery", "Upsell"], icon: PenTool },
  { id: "membership", label: "Membership", flow: ["Content", "Trial", "Enrollment", "Onboarding", "Engagement", "Retention", "Upsell"], icon: Heart },
  { id: "custom", label: "Custom Journey", flow: ["Build your own"], icon: Layers },
];

const painOptions = [
  { id: "dropoff_inquiry", label: "People inquire but never follow up", icon: MessageSquare },
  { id: "dropoff_call", label: "Calls booked but no-shows common", icon: Phone },
  { id: "dropoff_quote", label: "Quotes sent but no response", icon: FileText },
  { id: "dropoff_checkout", label: "Checkout abandonment", icon: ShoppingCart },
  { id: "dropoff_onboarding", label: "Drop off during onboarding", icon: Users },
  { id: "dropoff_retention", label: "Leave after first engagement", icon: Heart },
  { id: "dropoff_referral", label: "Happy but no referrals", icon: Users },
  { id: "dropoff_repeat", label: "One-time buyers never return", icon: RefreshCw },
];

export default function JourneyScreen({ state, setState }: ScreenProps) {
  const selected = useMemo(() => templates.find(t => t.id === state.journeyTemplate), [state.journeyTemplate]);

  const togglePain = useCallback((v: string) => {
    setState(p => ({ ...p, journeyPainPoints: p.journeyPainPoints.includes(v) ? p.journeyPainPoints.filter(x => x !== v) : [...p.journeyPainPoints, v] }));
  }, [setState]);

  return (
    <div className="space-y-6">
      <ScreenHeader icon={Target} title="Let's sketch how customers move through your business" subtitle="SITA will build a Customer Journey Twin from this pattern" color="text-blue-400" />
      <div className="space-y-2">
        {templates.map(t => (
          <button key={t.id} onClick={() => setState(p => ({ ...p, journeyTemplate: t.id, journeyStages: t.id !== "custom" ? t.flow : [] }))}
            className={`w-full p-4 rounded-xl border text-left transition-all ${state.journeyTemplate === t.id ? "bg-primary/10 border-primary/40 ring-1 ring-primary/20" : "bg-card/50 border-border/50 hover:border-primary/20"}`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${state.journeyTemplate === t.id ? "bg-primary/20" : "bg-muted"}`}><t.icon className={`h-4 w-4 ${state.journeyTemplate === t.id ? "text-primary" : "text-muted-foreground"}`} /></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{t.label}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5 font-mono">{t.flow.join(" → ")}</p>
              </div>
              {state.journeyTemplate === t.id && <Check className="h-4 w-4 text-primary flex-shrink-0" />}
            </div>
          </button>
        ))}
      </div>
      {selected && selected.id !== "custom" && (
        <>
          <Card className="bg-card/60 border-primary/15 overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3"><Brain className="h-4 w-4 text-primary" /><p className="text-xs font-semibold text-foreground">Journey Twin Preview</p></div>
              <div className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-none">
                {selected.flow.map((step, i) => (
                  <div key={i} className="flex items-center gap-1 flex-shrink-0">
                    <div className="px-2.5 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-[10px] font-medium text-primary whitespace-nowrap">{step}</div>
                    {i < selected.flow.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground/40 flex-shrink-0" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <div>
            <SectionTitle hint="These help SITA detect leakage points">Where do people usually get stuck or drop off?</SectionTitle>
            <div className="grid md:grid-cols-2 gap-2">
              {painOptions.map(p => <Toggle key={p.id} label={p.label} icon={p.icon} selected={state.journeyPainPoints.includes(p.id)} onToggle={() => togglePain(p.id)} />)}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
