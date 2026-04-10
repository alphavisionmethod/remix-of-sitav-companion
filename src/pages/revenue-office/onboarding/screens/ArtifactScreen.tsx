import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, DollarSign, Package, Phone, MessageSquare, ClipboardList, Globe, Mail, Star, Target, Users, Brain, Sparkles } from "lucide-react";
import { Toggle, ScreenHeader } from "../primitives";
import type { ScreenProps } from "../types";
import { useCallback } from "react";

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
  
  const toggle = useCallback((v: string) => {
    setState(p => ({ ...p, uploadedArtifacts: p.uploadedArtifacts.includes(v) ? p.uploadedArtifacts.filter(x => x !== v) : [...p.uploadedArtifacts, v] }));
  }, [setState]);

  const inferences = useMemo(() => artifacts.filter(a => state.uploadedArtifacts.includes(a.id)), [state.uploadedArtifacts]);

  return (
    <div className="space-y-6">
      
      <ScreenHeader icon={FileText} title="Upload your business materials" subtitle="SITA uses these to understand your service model, pricing, onboarding, and offers" color="text-purple-400" />
      <div className="grid md:grid-cols-2 gap-2">
        {artifacts.map(a => <Toggle key={a.id} label={a.label} icon={a.icon} selected={state.uploadedArtifacts.includes(a.id)} onToggle={() => toggle(a.id)} />)}
      </div>
      {inferences.length > 0 && (
        <Card className="bg-primary/5 border-primary/15">
          <CardContent className="p-4">
            <div className="flex items-start gap-2">
              <Brain className="h-4 w-4 text-primary mt-0.5" />
              <div>
                <p className="text-sm text-foreground font-medium">SITA will analyze {inferences.length} material{inferences.length !== 1 ? "s" : ""}</p>
                <div className="mt-2 space-y-1">
                  {inferences.map(inf => (
                    <p key={inf.id} className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Sparkles className="h-2.5 w-2.5 text-primary" /> {inf.inference}
                    </p>
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
