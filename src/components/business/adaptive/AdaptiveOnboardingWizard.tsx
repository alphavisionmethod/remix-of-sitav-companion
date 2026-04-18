// ═══════════════════════════════════════════════════════════════
// Adaptive Business Onboarding Wizard
// Guided first-run experience that determines the user's business
// archetype through 4 elegant questions, then configures the
// entire Business OS surface around the detected mode.
// ═══════════════════════════════════════════════════════════════

import React, { useState, useCallback, useMemo } from "react";
import { getModuleAdaptation } from "@/domains/engines/business-module-adaptations";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart, Briefcase, Building2, Users, Calendar,
  Stethoscope, Award, CreditCard, Globe, Rocket, ChevronRight,
  CheckCircle, Sparkles, ArrowLeft, Package, Heart,
} from "lucide-react";
import { useBusinessProfile } from "@/hooks/useBusinessProfile";
import { getIdentityLayer } from "@/domains/engines/business-identity-layers";
import type { ProfileArchetype } from "@/domains/engines/business-profile-engine";

interface WizardStep {
  question: string;
  subtitle: string;
  options: WizardOption[];
}

interface WizardOption {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  archetypeSignals: Partial<Record<ProfileArchetype, number>>;
}

const STEPS: WizardStep[] = [
  {
    question: "How do customers primarily pay you?",
    subtitle: "This helps us shape your revenue and billing experience",
    options: [
      { id: "products", label: "They buy products online", description: "E-commerce, digital goods, subscriptions", icon: ShoppingCart, archetypeSignals: { ecommerce: 3, marketplace: 1 } },
      { id: "projects", label: "They pay per project/retainer", description: "Consulting, design, development", icon: Briefcase, archetypeSignals: { service: 2, agency: 2 } },
      { id: "appointments", label: "They book and pay per session", description: "Therapy, coaching, medical, salon", icon: Calendar, archetypeSignals: { "appointment-based": 3, "professional-practice": 1 } },
      { id: "in-person", label: "They pay in person / at location", description: "Retail, restaurant, local service", icon: Building2, archetypeSignals: { "brick-and-mortar": 3, "appointment-based": 1 } },
    ],
  },
  {
    question: "How large is your team?",
    subtitle: "We'll adjust operations and task views accordingly",
    options: [
      { id: "solo", label: "Just me", description: "Solo founder or freelancer", icon: Rocket, archetypeSignals: { service: 2, "professional-practice": 1 } },
      { id: "small", label: "2–5 people", description: "Small team, everyone wears many hats", icon: Users, archetypeSignals: { service: 1, "brick-and-mortar": 1, "appointment-based": 1 } },
      { id: "growing", label: "6–20 people", description: "Growing team with some specialization", icon: Award, archetypeSignals: { agency: 2, "employee-based": 2 } },
      { id: "larger", label: "20+ people", description: "Structured departments and roles", icon: Building2, archetypeSignals: { "employee-based": 3, "multi-location": 1 } },
    ],
  },
  {
    question: "What's your biggest daily challenge?",
    subtitle: "We'll prioritize the tools that solve this first",
    options: [
      { id: "leads", label: "Getting new customers", description: "Lead generation, marketing, conversion", icon: Globe, archetypeSignals: { ecommerce: 1, "brick-and-mortar": 1, service: 1 } },
      { id: "retention", label: "Keeping customers coming back", description: "Retention, loyalty, churn prevention", icon: Heart, archetypeSignals: { membership: 2, "appointment-based": 1, ecommerce: 1 } },
      { id: "operations", label: "Managing day-to-day work", description: "Tasks, scheduling, team coordination", icon: Package, archetypeSignals: { "employee-based": 2, agency: 1, service: 1 } },
      { id: "revenue", label: "Getting paid on time", description: "Invoicing, collections, cash flow", icon: CreditCard, archetypeSignals: { service: 2, agency: 1 } },
    ],
  },
  {
    question: "What best describes your business model?",
    subtitle: "Final touch — we'll lock in your experience now",
    options: [
      { id: "product-based", label: "Product-based", description: "Physical or digital products sold online or in-store", icon: ShoppingCart, archetypeSignals: { ecommerce: 3, "brick-and-mortar": 1 } },
      { id: "service-based", label: "Service-based", description: "Custom work for clients — projects, consulting, creative", icon: Briefcase, archetypeSignals: { service: 3, agency: 1 } },
      { id: "appointment-based", label: "Appointment-based", description: "Scheduled sessions — health, wellness, coaching", icon: Stethoscope, archetypeSignals: { "appointment-based": 3, "professional-practice": 2 } },
      { id: "subscription", label: "Recurring / membership", description: "Monthly subscriptions, memberships, SaaS", icon: CreditCard, archetypeSignals: { membership: 3, "product-service": 1 } },
    ],
  },
];

interface Props {
  onComplete: () => void;
}

export default function AdaptiveOnboardingWizard({ onComplete }: Props) {
  const { updateOverrides } = useBusinessProfile();
  const [step, setStep] = useState(0);
  const [selections, setSelections] = useState<string[]>([]);
  const [scores, setScores] = useState<Partial<Record<ProfileArchetype, number>>>({});
  const [showResult, setShowResult] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewMode, setPreviewMode] = useState<ProfileArchetype | null>(null);

  const currentStep = STEPS[step];

  const handleSelect = useCallback((option: WizardOption) => {
    // Accumulate archetype scores
    const newScores = { ...scores };
    for (const [arch, weight] of Object.entries(option.archetypeSignals)) {
      newScores[arch as ProfileArchetype] = (newScores[arch as ProfileArchetype] || 0) + weight;
    }
    setScores(newScores);
    setSelections([...selections, option.id]);

    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      // Determine winner — show preview before committing
      const sorted = Object.entries(newScores).sort((a, b) => b[1] - a[1]);
      const winner = (sorted[0]?.[0] || "service") as ProfileArchetype;
      setPreviewMode(winner);
      setShowPreview(true);
    }
  }, [scores, selections, step]);

  const handleConfirmProfile = useCallback(() => {
    if (!previewMode) return;
    const overrideWeights: Partial<Record<ProfileArchetype, number>> = {};
    overrideWeights[previewMode] = 100;
    updateOverrides(overrideWeights as any);
    setShowPreview(false);
    setShowResult(true);
    setTimeout(onComplete, 2500);
  }, [previewMode, updateOverrides, onComplete]);

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  // Determine preview archetype
  const previewArchetype = Object.entries(scores).sort((a, b) => b[1] - a[1])[0]?.[0] as ProfileArchetype || "service";
  const identity = getIdentityLayer(previewArchetype);

  if (showResult) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center"
        style={{ background: `linear-gradient(135deg, hsl(${identity.accentColor} / 0.08), hsl(220 15% 6%))` }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 15 }}
          className="text-center space-y-4"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: 360 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center"
            style={{ backgroundColor: `hsl(${identity.accentColor} / 0.15)` }}
          >
            <CheckCircle size={28} style={{ color: `hsl(${identity.accentColor})` }} />
          </motion.div>
          <h2 className="text-xl font-bold text-foreground/90">
            Your Business OS is ready
          </h2>
          <p className="text-sm text-foreground/40 max-w-xs">
            {identity.tagline}
          </p>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 2, ease: "linear" }}
            className="h-0.5 rounded-full mx-auto max-w-[200px]"
            style={{ backgroundColor: `hsl(${identity.accentColor})` }}
          />
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: "hsl(220 15% 5% / 0.95)", backdropFilter: "blur(20px)" }}
    >
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="flex items-center gap-1.5 mb-8 justify-center">
          {STEPS.map((_, i) => (
            <motion.div
              key={i}
              className="h-1 rounded-full transition-all duration-300"
              style={{
                width: i === step ? 32 : 12,
                backgroundColor: i <= step ? `hsl(${identity.accentColor})` : "hsl(0 0% 100% / 0.08)",
              }}
            />
          ))}
        </div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            <div className="text-center space-y-1.5">
              <div className="flex items-center justify-center gap-2">
                <Sparkles size={12} style={{ color: `hsl(${identity.accentColor})` }} />
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-foreground/25">
                  Step {step + 1} of {STEPS.length}
                </span>
              </div>
              <h2 className="text-lg font-bold text-foreground/90">{currentStep.question}</h2>
              <p className="text-xs text-foreground/35">{currentStep.subtitle}</p>
            </div>

            <div className="space-y-2">
              {currentStep.options.map((option) => (
                <motion.button
                  key={option.id}
                  type="button"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => handleSelect(option)}
                  className="w-full text-left flex items-center gap-4 px-4 py-3.5 rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] hover:bg-[hsl(0_0%_100%/0.05)] hover:border-[hsl(0_0%_100%/0.12)] transition-all group"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors"
                    style={{ background: `hsl(${identity.accentColor} / 0.06)` }}
                  >
                    <option.icon
                      size={18}
                      className="text-foreground/40 group-hover:text-foreground/70 transition-colors"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-foreground/70 group-hover:text-foreground/90 transition-colors">
                      {option.label}
                    </div>
                    <div className="text-[10px] text-foreground/30">{option.description}</div>
                  </div>
                  <ChevronRight
                    size={14}
                    className="text-foreground/15 group-hover:text-foreground/40 transition-colors shrink-0"
                  />
                </motion.button>
              ))}
            </div>

            {step > 0 && (
              <button
                type="button"
                onClick={handleBack}
                className="mx-auto flex items-center gap-1.5 text-[10px] text-foreground/25 hover:text-foreground/50 transition-colors"
              >
                <ArrowLeft size={10} /> Back
              </button>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
