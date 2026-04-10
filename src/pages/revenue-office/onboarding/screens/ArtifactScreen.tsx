import { useMemo, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, DollarSign, Package, Phone, MessageSquare, ClipboardList, Globe, Mail, Star, Target, Users, Brain, Sparkles, Upload, Check } from "lucide-react";
import { Toggle, ScreenHeader } from "../primitives";
import type { ScreenProps } from "../types";

const artifacts = [
  { id: "price_sheets", label: "Price sheets", icon: DollarSign, inference: "Pricing logic for automated quoting" },
  { id: "service_guides", label: "Service guides", icon: FileText, inference: "Service model and offering structure" },
  { id: "offer_decks", label: "Offer decks", icon: Package, inference: "Offer hierarchy and positioning" },
  { id: "proposal_templates", label: "Proposal templates", icon: FileText, inference: "Proposal structure for Quote Studio" },
  { id: "onboarding_docs", label: "Onboarding docs", icon: Users, inference: "Onboarding steps for automation" },
  { id: "sops", label: "SOPs / processes", icon: ClipboardList, inference: "Automatable process steps" },
  { id: "intake_forms", label: "Intake forms", icon: ClipboardList, inference: "Client intake flow structure" },
  { id: "call_scripts", label: "Call scripts", icon: Phone, inference: "Call Desk prep briefs" },
  { id: "faq_docs", label: "FAQ docs", icon: MessageSquare, inference: "Common objections and answers" },
  { id: "sales_pages", label: "Sales pages", icon: Globe, inference: "Funnel structure and conversion copy" },
  { id: "email_sequences", label: "Email sequences", icon: Mail, inference: "Flow patterns for Campaign Builder" },
  { id: "contracts", label: "Contracts", icon: FileText, inference: "Legal and commercial terms" },
  { id: "review_scripts", label: "Review request scripts", icon: Star, inference: "Reputation automation templates" },
  { id: "journey_diagrams", label: "Journey diagrams", icon: Target, inference: "Visual customer flow maps" },
];

export default function ArtifactScreen({ state, setState }: ScreenProps) {
  const [dragOver, setDragOver] = useState(false);

  const toggle = useCallback((v: string) => {
    setState(p => ({ ...p, uploadedArtifacts: p.uploadedArtifacts.includes(v) ? p.uploadedArtifacts.filter(x => x !== v) : [...p.uploadedArtifacts, v] }));
  }, [setState]);

  const inferences = useMemo(() => artifacts.filter(a => state.uploadedArtifacts.includes(a.id)), [state.uploadedArtifacts]);

  const inferenceInsight = useMemo(() => {
    if (inferences.length === 0) return null;
    const types = inferences.map(i => i.id);
    if (types.includes("proposal_templates") && types.includes("price_sheets")) return "Proposal + pricing docs detected — SITA can auto-generate quotes from your actual pricing.";
    if (types.includes("call_scripts") && types.includes("faq_docs")) return "Call scripts + FAQs detected — Call Desk will have full pre-call context and objection handling.";
    if (types.includes("sops") && types.includes("onboarding_docs")) return "SOPs + onboarding docs — your delivery pipeline can be partially automated from day one.";
    if (types.includes("email_sequences")) return "Email sequences detected — Campaign Builder will inherit your existing nurture patterns.";
    if (inferences.length >= 4) return `${inferences.length} business materials selected — SITA will build a rich understanding of your service model, pricing, and processes.`;
    return null;
  }, [inferences]);

  return (
    <div className="space-y-6">
      <ScreenHeader icon={FileText} title="Upload your business materials" subtitle="SITA uses these to understand your service model, pricing, onboarding, and offers" color="text-purple-400" />

      {/* Drag-drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); }}
        className={`p-6 rounded-2xl border-2 border-dashed transition-all text-center ${
          dragOver ? "border-primary/60 bg-primary/5" : "border-border/40 bg-card/30"
        }`}
      >
        <Upload className={`h-8 w-8 mx-auto mb-2 ${dragOver ? "text-primary" : "text-muted-foreground/40"}`} />
        <p className="text-xs text-muted-foreground">Drag files here or select material types below</p>
        <p className="text-[10px] text-muted-foreground/50 mt-1">PDF, DOCX, XLSX, images, or any business document</p>
      </div>

      <div className="grid md:grid-cols-2 gap-2">
        {artifacts.map(a => <Toggle key={a.id} label={a.label} icon={a.icon} selected={state.uploadedArtifacts.includes(a.id)} onToggle={() => toggle(a.id)} />)}
      </div>

      <AnimatePresence>
        {inferenceInsight && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-start gap-2.5 p-3.5 rounded-xl bg-primary/5 border border-primary/15">
            <Sparkles className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              <span className="text-foreground font-medium">SITA inference: </span>{inferenceInsight}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {inferences.length > 0 && (
        <Card className="bg-primary/5 border-primary/15">
          <CardContent className="p-4">
            <div className="flex items-start gap-2">
              <Brain className="h-4 w-4 text-primary mt-0.5" />
              <div>
                <p className="text-sm text-foreground font-medium">SITA will analyze {inferences.length} material{inferences.length !== 1 ? "s" : ""}</p>
                <div className="mt-2 space-y-1">
                  {inferences.map(inf => (
                    <div key={inf.id} className="flex items-center gap-1.5">
                      <Check className="h-2.5 w-2.5 text-primary shrink-0" />
                      <p className="text-[10px] text-muted-foreground">{inf.inference}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
