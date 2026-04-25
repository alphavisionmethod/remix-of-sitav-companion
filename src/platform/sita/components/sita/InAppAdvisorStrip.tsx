// ═══════════════════════════════════════════════════════════════
// SITA OS — In-App Advisor Strip
// Contextual AI suggestions embedded inside each domain app
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, ChevronRight, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { ConfidenceBar } from "@/platform/sita/components/sita/primitives/ConfidenceBar";
import { AdvisorAvatar } from "@/platform/sita/components/sita/primitives/AdvisorAvatar";

type Domain = "business" | "finance" | "concierge" | "crm" | "vault" | "health" | "ai-workforce";

interface Suggestion {
  id: string;
  text: string;
  confidence: number;
  action?: string;
}

interface InAppAdvisorStripProps {
  domain: Domain;
  className?: string;
}

const DOMAIN_SUGGESTIONS: Record<Domain, { advisor: string; suggestions: Suggestion[] }> = {
  business: {
    advisor: "Business Advisor",
    suggestions: [
      { id: "b1", text: "3 overdue invoices — send reminders?", confidence: 92, action: "Send Reminders" },
      { id: "b2", text: "Q2 pipeline is 15% below target", confidence: 78, action: "View Analysis" },
      { id: "b3", text: "New lead from website — qualify?", confidence: 85, action: "Review Lead" },
    ],
  },
  finance: {
    advisor: "Money Advisor",
    suggestions: [
      { id: "f1", text: "2 subscriptions could be optimized — save $47/mo", confidence: 88, action: "Optimize" },
      { id: "f2", text: "Upcoming tax deadline in 12 days", confidence: 95, action: "Prepare" },
      { id: "f3", text: "Emergency fund below 3-month target", confidence: 72, action: "Plan" },
    ],
  },
  concierge: {
    advisor: "Life Advisor",
    suggestions: [
      { id: "c1", text: "Grocery delivery confirmed for 4pm", confidence: 99, action: "Track" },
      { id: "c2", text: "Car service due — shall I book?", confidence: 82, action: "Book Now" },
    ],
  },
  crm: {
    advisor: "Sales Advisor",
    suggestions: [
      { id: "s1", text: "Follow up with Acme Corp — deal stalling", confidence: 90, action: "Draft Email" },
      { id: "s2", text: "3 leads ready for proposal stage", confidence: 86, action: "Review" },
    ],
  },
  vault: {
    advisor: "Security Advisor",
    suggestions: [
      { id: "v1", text: "Insurance document expires in 30 days", confidence: 95, action: "Renew" },
    ],
  },
  health: {
    advisor: "Wellness Advisor",
    suggestions: [
      { id: "h1", text: "Sleep score improving — keep your 10pm routine", confidence: 76 },
      { id: "h2", text: "Annual checkup overdue by 2 months", confidence: 88, action: "Schedule" },
    ],
  },
  "ai-workforce": {
    advisor: "AI Operations",
    suggestions: [
      { id: "a1", text: "Invoice processor automated 12 tasks today", confidence: 97 },
      { id: "a2", text: "New automation available for expense reports", confidence: 80, action: "Enable" },
    ],
  },
};

export const InAppAdvisorStrip = ({ domain, className }: InAppAdvisorStripProps) => {
  const [dismissed, setDismissed] = useState(false);
  const config = DOMAIN_SUGGESTIONS[domain];

  if (!config || dismissed) return null;

  const topSuggestion = config.suggestions[0];
  const extraCount = config.suggestions.length - 1;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        className={cn(
          "rounded-xl border border-primary/10 bg-primary/[0.03] p-3 mb-4",
          className
        )}
      >
        <div className="flex items-center gap-3">
          <AdvisorAvatar domain={domain === "finance" ? "money" : domain === "concierge" ? "concierge" : "business"} size="sm" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-primary" />
              <span className="text-[10px] font-medium text-primary">{config.advisor}</span>
            </div>
            <p className="text-xs text-foreground mt-0.5 truncate">{topSuggestion.text}</p>
            <div className="flex items-center gap-2 mt-1">
              <ConfidenceBar value={topSuggestion.confidence} className="w-16" />
              <span className="text-[9px] text-muted-foreground">{topSuggestion.confidence}% confident</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {topSuggestion.action && (
              <button className="rounded-lg bg-primary/10 px-2.5 py-1.5 text-[10px] font-semibold text-primary hover:bg-primary/20 transition-colors flex items-center gap-1">
                <Zap className="h-2.5 w-2.5" />
                {topSuggestion.action}
              </button>
            )}
            {extraCount > 0 && (
              <button className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-0.5">
                +{extraCount} <ChevronRight className="h-2.5 w-2.5" />
              </button>
            )}
            <button
              onClick={() => setDismissed(true)}
              className="p-1 rounded-md hover:bg-secondary/50 text-muted-foreground"
              aria-label="Dismiss advisor"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
