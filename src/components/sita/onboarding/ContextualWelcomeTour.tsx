import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, X } from "lucide-react";

interface TourStep {
  title: string;
  description: string;
}

function deriveTourSteps(prefs: {
  enabledDomains: string[];
  trustLevel: string;
  painPoints: string[];
  rituals: string[];
  homeComposition: string;
}): TourStep[] {
  const steps: TourStep[] = [];

  // Domain-based
  const domainNames = prefs.enabledDomains.map(d =>
    d === "business" ? "Business" : d === "money" ? "Finance" : d === "concierge" ? "Concierge" : d
  );
  if (domainNames.length > 0) {
    steps.push({
      title: `Your ${domainNames.join(" + ")} surfaces`,
      description: `Since you selected ${domainNames.join(", ")}, these are your key surfaces. You'll find them in the dock and mission control.`,
    });
  }

  // Trust-based
  if (prefs.trustLevel === "guarded") {
    steps.push({
      title: "Approvals are front and center",
      description: "Because you prefer maximum control, you'll see the approval queue prominently. Nothing acts without your say.",
    });
  } else if (prefs.trustLevel === "balanced") {
    steps.push({
      title: "Your approval lane",
      description: "Important actions will pause for approval. Routine items run automatically with proof logging.",
    });
  }

  // Pain points
  if (prefs.painPoints.includes("missed-followup")) {
    steps.push({
      title: "Your recovery timeline",
      description: "Because you wanted less missed follow-up, this is your timeline and recovery lane. Items at risk appear here.",
    });
  }

  // Rituals
  if (prefs.rituals.length > 0) {
    steps.push({
      title: "Your rhythm is set",
      description: `${prefs.rituals.length} rituals are configured. Your next one will appear automatically at the right time.`,
    });
  }

  // Home composition
  const compLabels: Record<string, string> = {
    calm: "a calm, minimal dashboard",
    business: "a business-first view",
    family: "a family-centered layout",
    money: "a financial command center",
    command: "the full command center",
  };
  if (prefs.homeComposition && compLabels[prefs.homeComposition]) {
    steps.push({
      title: "Your Home is personalized",
      description: `You chose ${compLabels[prefs.homeComposition]}. You can always change this from Settings.`,
    });
  }

  // Default step
  if (steps.length === 0) {
    steps.push({
      title: "Welcome to your OS",
      description: "Everything is ready. Explore the dock, mission control, and advisor panel to get started.",
    });
  }

  return steps;
}

interface ContextualWelcomeTourProps {
  preferences: {
    enabledDomains: string[];
    trustLevel: string;
    painPoints: string[];
    rituals: string[];
    homeComposition: string;
  };
  onComplete: () => void;
}

export function ContextualWelcomeTour({ preferences, onComplete }: ContextualWelcomeTourProps) {
  const steps = deriveTourSteps(preferences);
  const [current, setCurrent] = useState(0);

  const isLast = current >= steps.length - 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] w-full max-w-md"
    >
      <div className="rounded-2xl border border-border bg-card shadow-2xl shadow-primary/10 overflow-hidden">
        <div className="flex items-center justify-between px-5 pt-4">
          <div className="flex gap-1.5">
            {steps.map((_, i) => (
              <div key={i} className={`h-1 w-6 rounded-full transition-all ${i <= current ? "bg-primary" : "bg-muted"}`} />
            ))}
          </div>
          <button onClick={onComplete} className="rounded-lg p-1 hover:bg-secondary transition-colors">
            <X className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="px-5 py-4"
          >
            <h4 className="text-sm font-bold text-foreground">{steps[current].title}</h4>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{steps[current].description}</p>
          </motion.div>
        </AnimatePresence>

        <div className="px-5 pb-4">
          <button
            onClick={() => isLast ? onComplete() : setCurrent(c => c + 1)}
            className="w-full rounded-xl bg-primary py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all flex items-center justify-center gap-1.5"
          >
            {isLast ? "Start using SITA" : "Next"} <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
