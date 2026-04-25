// ═══════════════════════════════════════════════════════════════
// SITA OS — Intent Suggestions Widget
// Ambient floating predictions from the PredictiveIntentEngine
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, ArrowRight } from "lucide-react";
import { predictiveIntentEngine, type PredictedIntent } from "@/lib/services/predictive-intent";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const ACTION_ROUTES: Record<string, string> = {
  check_calendar: "/calendar",
  check_finances: "/money",
  review_leads: "/business/leads",
  check_invoices: "/money/invoices",
  review_approvals: "/mission",
  check_tasks: "/concierge",
};

const DOMAIN_COLORS: Record<string, string> = {
  finance: "hsl(var(--sita-gold))",
  business: "hsl(var(--primary))",
  concierge: "hsl(var(--trust-safe))",
  system: "hsl(var(--muted-foreground))",
};

interface IntentSuggestionsWidgetProps {
  onLaunchApp?: (appId: string) => void;
}

export function IntentSuggestionsWidget({ onLaunchApp }: IntentSuggestionsWidgetProps) {
  const [suggestions, setSuggestions] = useState<PredictedIntent[]>([]);
  const [visible, setVisible] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>();
  const navigate = useNavigate();

  // Poll for suggestions
  useEffect(() => {
    const poll = async () => {
      const preds = await predictiveIntentEngine.predictNext("current-user");
      const active = preds.filter(p => !p.dismissed).slice(0, 3);
      if (active.length > 0) {
        setSuggestions(active);
        setVisible(true);
        // Auto-hide after 30s
        clearTimeout(hideTimer.current);
        hideTimer.current = setTimeout(() => setVisible(false), 30_000);
      }
    };

    poll();
    const iv = setInterval(poll, 5 * 60_000); // Every 5 min
    return () => { clearInterval(iv); clearTimeout(hideTimer.current); };
  }, []);

  const handleAction = useCallback((pred: PredictedIntent) => {
    const route = ACTION_ROUTES[pred.action];
    if (route) {
      navigate(route);
    } else if (onLaunchApp) {
      onLaunchApp(pred.action);
    }
    predictiveIntentEngine.learnFromAction("current-user", pred.action, pred.domain);
    setSuggestions(prev => prev.filter(p => p.id !== pred.id));
  }, [navigate, onLaunchApp]);

  const handleDismiss = useCallback((pred: PredictedIntent) => {
    predictiveIntentEngine.dismissPrediction(pred.id);
    setSuggestions(prev => prev.filter(p => p.id !== pred.id));
  }, []);

  if (suggestions.length === 0 || !visible) return null;

  return (
    <div className="fixed bottom-20 right-4 z-[100] hidden md:block">
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className={cn(
              "w-64 rounded-2xl overflow-hidden",
              "bg-[hsl(0_0%_100%/0.08)] dark:bg-[hsl(0_0%_0%/0.4)]",
              "backdrop-blur-2xl",
              "border border-[hsl(0_0%_100%/0.12)]",
              "shadow-[0_4px_24px_hsl(0_0%_0%/0.2)]"
            )}
          >
            {/* Header */}
            <div className="px-3 py-2 flex items-center justify-between border-b border-[hsl(0_0%_100%/0.06)]">
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-[hsl(var(--sita-gold))]" />
                <span className="text-[10px] font-medium text-foreground/80">Suggested for you</span>
              </div>
              <button
                onClick={() => setVisible(false)}
                className="p-0.5 rounded-md hover:bg-[hsl(0_0%_100%/0.1)] transition-colors"
              >
                <X className="h-3 w-3 text-muted-foreground" />
              </button>
            </div>

            {/* Suggestions */}
            <div className="p-2 space-y-1.5">
              {suggestions.map(pred => (
                <motion.button
                  key={pred.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  onClick={() => handleAction(pred)}
                  className={cn(
                    "w-full text-left px-2.5 py-2 rounded-xl group",
                    "bg-[hsl(0_0%_100%/0.04)] hover:bg-[hsl(0_0%_100%/0.10)]",
                    "transition-all duration-150"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-medium text-foreground/90 truncate">
                        {pred.description}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <div
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: DOMAIN_COLORS[pred.domain] || DOMAIN_COLORS.system }}
                        />
                        <span className="text-[9px] text-muted-foreground capitalize">{pred.domain}</span>
                        <span className="text-[9px] text-muted-foreground">·</span>
                        <span className="text-[9px] text-muted-foreground">{Math.round(pred.confidence * 100)}%</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <ArrowRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDismiss(pred); }}
                        className="p-0.5 rounded hover:bg-[hsl(0_0%_100%/0.1)] opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-2.5 w-2.5 text-muted-foreground" />
                      </button>
                    </div>
                  </div>

                  {/* Confidence bar */}
                  <div className="mt-1.5 w-full h-1 rounded-full bg-[hsl(0_0%_100%/0.06)] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pred.confidence * 100}%`,
                        background: DOMAIN_COLORS[pred.domain] || DOMAIN_COLORS.system,
                        opacity: 0.7,
                      }}
                    />
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
