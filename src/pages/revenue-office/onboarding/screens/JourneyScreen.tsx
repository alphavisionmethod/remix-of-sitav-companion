import { useMemo, useCallback, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, Briefcase, GraduationCap, ShoppingCart, MapPin, Users, PenTool, Heart, Layers, Brain, Check, ArrowRight, MessageSquare, Phone, FileText, RefreshCw, Plus, X, AlertTriangle, Star, Sparkles } from "lucide-react";
import { Toggle, SectionTitle, ScreenHeader } from "../primitives";
import SitaInsightCallout from "./SitaInsightCallout";
import { getRecommendedJourney } from "@/lib/business-journey-config";
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
  const [newStage, setNewStage] = useState("");
  const [stageMarkers, setStageMarkers] = useState<Record<string, "critical" | "weak" | null>>({});
  const [journeyFit, setJourneyFit] = useState<"" | "close" | "missing" | "different">("");

  // Auto-recommend journey template based on business types
  const recommendedTemplate = useMemo(() => getRecommendedJourney(state.businessTypes), [state.businessTypes]);
  const recommendedLabel = useMemo(() => templates.find(t => t.id === recommendedTemplate)?.label || recommendedTemplate, [recommendedTemplate]);

  useEffect(() => {
    if (!state.journeyTemplate && recommendedTemplate) {
      const tmpl = templates.find(t => t.id === recommendedTemplate);
      if (tmpl) {
        setState(p => ({ ...p, journeyTemplate: tmpl.id, journeyStages: tmpl.flow }));
      }
    }
  }, [recommendedTemplate, state.journeyTemplate, setState]);

  const togglePain = useCallback((v: string) => {
    setState(p => ({ ...p, journeyPainPoints: p.journeyPainPoints.includes(v) ? p.journeyPainPoints.filter(x => x !== v) : [...p.journeyPainPoints, v] }));
  }, [setState]);

  const addCustomStage = useCallback(() => {
    if (!newStage.trim()) return;
    setState(p => ({ ...p, journeyStages: [...p.journeyStages, newStage.trim()] }));
    setNewStage("");
  }, [newStage, setState]);

  const removeStage = useCallback((index: number) => {
    setState(p => ({ ...p, journeyStages: p.journeyStages.filter((_, i) => i !== index) }));
  }, [setState]);

  const toggleMarker = useCallback((stage: string) => {
    setStageMarkers(prev => {
      const current = prev[stage];
      if (!current) return { ...prev, [stage]: "critical" };
      if (current === "critical") return { ...prev, [stage]: "weak" };
      return { ...prev, [stage]: null };
    });
  }, []);

  return (
    <div className="space-y-6">
      <ScreenHeader icon={Target} title="Let's sketch how customers move through your business" subtitle="SITA will build a Customer Journey Twin from this pattern" color="text-blue-400" />
      <SitaInsightCallout
        show={!!recommendedTemplate && state.businessTypes.length > 0}
        message={`Based on your business type, we recommend the "${recommendedLabel}" journey. ${state.journeyTemplate === recommendedTemplate ? "✓ Currently selected." : "You can pick a different one below."}`}
        type="detected"
      />
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
          {/* Journey confirmation */}
          <div className="space-y-2">
            <SitaInsightCallout
              show={!!state.journeyTemplate && state.journeyTemplate !== "custom"}
              message="Is this close to how your business actually works?"
              type="confirmation"
            />
            <div className="grid grid-cols-3 gap-2">
              {([
                { id: "close", label: "Yes, this is close" },
                { id: "missing", label: "Close, but missing steps" },
                { id: "different", label: "Quite different" },
              ] as const).map(opt => (
                <button key={opt.id} onClick={() => setJourneyFit(opt.id)}
                  className={`p-2.5 rounded-lg border text-[11px] font-medium transition-all ${
                    journeyFit === opt.id
                      ? "bg-primary/10 border-primary/30 text-foreground"
                      : "bg-card/50 border-border/50 text-muted-foreground hover:border-primary/20"
                  }`}>
                  {journeyFit === opt.id && <Check className="h-3 w-3 inline mr-1 text-primary" />}
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <Card className="bg-card/60 border-primary/15 overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2"><Brain className="h-4 w-4 text-primary" /><p className="text-xs font-semibold text-foreground">Journey Twin Preview</p></div>
                <p className="text-[8px] text-muted-foreground">Tap stages to mark critical/weak</p>
              </div>
              <div className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-none">
                {state.journeyStages.map((step, i) => {
                  const marker = stageMarkers[step];
                  return (
                    <div key={i} className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={() => toggleMarker(step)}
                        className={`px-2.5 py-1.5 rounded-lg border text-[10px] font-medium whitespace-nowrap transition-all ${
                          marker === "critical" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/20" :
                          marker === "weak" ? "bg-amber-500/10 border-amber-500/20 text-amber-400 ring-1 ring-amber-500/20" :
                          "bg-primary/10 border-primary/20 text-primary"
                        }`}>
                        {marker === "critical" && <Star className="h-2.5 w-2.5 inline mr-0.5" />}
                        {marker === "weak" && <AlertTriangle className="h-2.5 w-2.5 inline mr-0.5" />}
                        {step}
                      </button>
                      {i < state.journeyStages.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground/40 flex-shrink-0" />}
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-3 mt-2 text-[8px] text-muted-foreground">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" />Critical (high-value)</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" />Weak (needs help)</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary" />Normal</span>
              </div>

              {/* Add Custom Stage */}
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/30">
                <input type="text" value={newStage} onChange={e => setNewStage(e.target.value)} placeholder="Add custom stage..."
                  onKeyDown={e => e.key === "Enter" && addCustomStage()}
                  className="flex-1 px-3 py-1.5 text-[11px] rounded-lg bg-muted/30 border border-border/40 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40" />
                <button onClick={addCustomStage} disabled={!newStage.trim()}
                  className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-30">
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Remove custom stages */}
              <AnimatePresence>
                {state.journeyStages.length > (selected?.flow.length || 0) && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-2">
                    <p className="text-[9px] text-muted-foreground mb-1">Custom stages added:</p>
                    <div className="flex flex-wrap gap-1">
                      {state.journeyStages.slice(selected?.flow.length || 0).map((s, i) => (
                        <Badge key={i} className="bg-primary/10 text-primary text-[9px] gap-1 cursor-pointer hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => removeStage((selected?.flow.length || 0) + i)}>
                          {s} <X className="h-2.5 w-2.5" />
                        </Badge>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
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
