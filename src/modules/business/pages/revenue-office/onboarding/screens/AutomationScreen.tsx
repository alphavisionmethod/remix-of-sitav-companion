import { Eye, FileText, CheckCircle, Zap, Check, DollarSign, Star, AlertTriangle, Heart, Award, Shield } from "lucide-react";
import { Toggle, SectionTitle, ChapterBanner } from "../primitives";
// Canonical onboarding primitives (drift-prevented by check-onboarding-components-folder)
import { OnboardingFooterNav as _CanonNav } from "@/components/onboarding";
void _CanonNav;
import type { ScreenProps } from "../types";
import { useCallback } from "react";
import SitaInsightCallout from "./SitaInsightCallout";

const levels = [
  { id: "suggest", label: "Suggestions only", desc: "SITA observes and recommends — you decide everything", icon: Eye, trust: 1 },
  { id: "draft_review", label: "Draft for review", desc: "SITA drafts emails, quotes, workflows — you approve before action", icon: FileText, trust: 2 },
  { id: "auto_rules", label: "Safe automations under rules", desc: "SITA executes routine actions within your policy boundaries", icon: CheckCircle, trust: 3 },
  { id: "broad_auto", label: "Broader automation with approvals", desc: "SITA runs the commercial engine, pauses only for high-impact decisions", icon: Zap, trust: 4 },
];

const humanOnly = [
  { id: "pricing", label: "Pricing changes", icon: DollarSign },
  { id: "proposals", label: "Proposal sending", icon: FileText },
  { id: "highvalue", label: "High-value lead contact", icon: Star },
  { id: "negative_reviews", label: "Negative review responses", icon: AlertTriangle },
  { id: "churn", label: "Churn rescue", icon: Heart },
  { id: "vip", label: "VIP client follow-up", icon: Award },
  { id: "discounts", label: "Discount approvals", icon: DollarSign },
  { id: "contracts", label: "Contract modifications", icon: FileText },
];

export default function AutomationScreen({ state, setState }: ScreenProps) {
  
  const toggleHuman = useCallback((v: string) => {
    setState(p => ({ ...p, humanOnlyTasks: p.humanOnlyTasks.includes(v) ? p.humanOnlyTasks.filter(x => x !== v) : [...p.humanOnlyTasks, v] }));
  }, [setState]);

  return (
    <div className="space-y-6">
      
      <ChapterBanner chapter="Chapter 6: Trust & Automation" subtitle="Control how much SITA does — you can always adjust later" />
      <div>
        <SectionTitle>How much should SITA do automatically?</SectionTitle>
        <div className="space-y-2">
          {levels.map(l => (
            <button key={l.id} onClick={() => setState(p => ({ ...p, automationLevel: l.id }))}
              className={`w-full p-4 rounded-xl border text-left transition-all ${state.automationLevel === l.id ? "bg-primary/10 border-primary/40 ring-1 ring-primary/20" : "bg-card/50 border-border/50 hover:border-primary/20"}`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${state.automationLevel === l.id ? "bg-primary/20" : "bg-muted"}`}>
                  <l.icon className={`h-4 w-4 ${state.automationLevel === l.id ? "text-primary" : "text-muted-foreground"}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{l.label}</p>
                    <div className="flex gap-0.5">
                      {Array.from({ length: l.trust }).map((_, i) => <div key={i} className="w-1.5 h-1.5 rounded-full bg-primary" />)}
                      {Array.from({ length: 4 - l.trust }).map((_, i) => <div key={i} className="w-1.5 h-1.5 rounded-full bg-muted" />)}
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{l.desc}</p>
                </div>
                {state.automationLevel === l.id && <Check className="h-4 w-4 text-primary" />}
              </div>
            </button>
          ))}
      </div>
      <SitaInsightCallout
        show={state.automationLevel === "suggest" && state.growthBottlenecks.length >= 2}
        message="Based on your bottlenecks, 'Draft for review' mode could save significant time while keeping you in control."
        type="recommendation"
      />
      <SitaInsightCallout
        show={state.automationLevel === "broad_auto" && state.humanOnlyTasks.length === 0}
        message="Broad automation selected with no guardrails — consider marking at least pricing and proposals as human-only."
        type="recommendation"
      />
      </div>
      <div>
        <SectionTitle>What should always remain human?</SectionTitle>
        <div className="grid md:grid-cols-2 gap-2">
          {humanOnly.map(h => <Toggle key={h.id} label={h.label} icon={h.icon} selected={state.humanOnlyTasks.includes(h.id)} onToggle={() => toggleHuman(h.id)} />)}
        </div>
      </div>
    </div>
  );
}
