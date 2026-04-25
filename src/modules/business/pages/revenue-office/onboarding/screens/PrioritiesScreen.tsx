import { useCallback, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, DollarSign, Users, Settings, PiggyBank, Target, AlertCircle } from "lucide-react";
import { OnboardingShell } from "@/platform/setup/components/onboarding/OnboardingShell";
import { PriorityReorderStrip } from "@/platform/setup/components/onboarding/PriorityReorderStrip";
import { OnboardingFooterNav } from "@/platform/setup/components/onboarding/OnboardingFooterNav";
import type { ScreenProps } from "../types";

/* ── Priority definitions ─────────────────────────────────── */

interface PriorityOption {
  id: string;
  label: string;
  description: string;
}

interface PriorityGroup {
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  items: PriorityOption[];
}

const PRIORITY_GROUPS: PriorityGroup[] = [
  {
    category: "Revenue & Sales",
    icon: DollarSign,
    items: [
      { id: "sales_followup", label: "Sales follow-up & closing", description: "Never lose a deal to poor follow-up" },
      { id: "lost_leads", label: "Recovering lost leads", description: "Win back abandoned opportunities" },
      { id: "invoicing", label: "Invoicing & getting paid", description: "Faster payments, fewer chases" },
      { id: "collections", label: "Collections & overdue payments", description: "Reduce outstanding balances" },
      { id: "profitability", label: "Pricing & profitability visibility", description: "Know what's actually making money" },
    ],
  },
  {
    category: "Customers",
    icon: Users,
    items: [
      { id: "customer_service", label: "Customer service & support", description: "Faster resolution, happier clients" },
      { id: "client_comms", label: "Client communication & updates", description: "Keep clients informed without manual effort" },
      { id: "retention", label: "Retention & repeat business", description: "Turn one-time buyers into regulars" },
      { id: "customer_onboarding", label: "Customer onboarding", description: "Smooth first experience for new clients" },
      { id: "reviews", label: "Reviews & reputation", description: "Build trust through social proof" },
    ],
  },
  {
    category: "Operations",
    icon: Settings,
    items: [
      { id: "scheduling", label: "Scheduling & appointments", description: "Eliminate booking friction" },
      { id: "inventory", label: "Inventory & fulfillment", description: "Right stock, right time" },
      { id: "order_mgmt", label: "Order management", description: "Track orders from start to delivery" },
      { id: "workflow_auto", label: "Workflow automation & admin reduction", description: "Stop doing what software should do" },
    ],
  },
  {
    category: "Finance & Planning",
    icon: PiggyBank,
    items: [
      { id: "budgeting", label: "Budgeting & cash flow", description: "See where money goes before it's gone" },
      { id: "accounts_mgmt", label: "Business accounts management", description: "Organize accounts and balances" },
      { id: "imports_exports", label: "Imports / exports & logistics", description: "Coordinate cross-border or supply chain" },
      { id: "reporting", label: "Financial reporting & compliance", description: "Stay audit-ready and informed" },
    ],
  },
];

const ALL_OPTIONS = PRIORITY_GROUPS.flatMap(g => g.items);
const OPTIONS_MAP = Object.fromEntries(ALL_OPTIONS.map(o => [o.id, o]));

/* ── Insight callout ──────────────────────────────────────── */

function InsightCallout({ count }: { count: number }) {
  const msg = useMemo(() => {
    if (count === 0) return null;
    if (count === 1) return "Got it — SITA will focus here first.";
    if (count <= 2) return "Good start — your first pick drives the most emphasis.";
    if (count <= 4) return "SITA will weight these in order — your first pick drives the most emphasis.";
    return "Ambitious operator detected — SITA will build a phased plan across all of these.";
  }, [count]);

  if (!msg) return null;

  return (
    <motion.div
      key={count > 4 ? "ambitious" : count > 2 ? "weighted" : "focus"}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-primary/5 border border-primary/10"
    >
      <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
      <p className="text-[11px] text-foreground/80 leading-relaxed">{msg}</p>
    </motion.div>
  );
}

/* ── Main screen ──────────────────────────────────────────── */

export default function PrioritiesScreen({ state, setState, onNext, onBack }: ScreenProps) {
  const selected = state.businessPriorities;
  const [validationError, setValidationError] = useState(false);

  const togglePriority = useCallback((id: string) => {
    setValidationError(false);
    setState(prev => {
      const cur = prev.businessPriorities;
      if (cur.includes(id)) {
        return { ...prev, businessPriorities: cur.filter(p => p !== id) };
      }
      return { ...prev, businessPriorities: [...cur, id] };
    });
  }, [setState]);

  const handleReorder = useCallback((newOrder: string[]) => {
    setState(prev => ({ ...prev, businessPriorities: newOrder }));
  }, [setState]);

  const handleRemove = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      businessPriorities: prev.businessPriorities.filter(p => p !== id),
    }));
  }, [setState]);

  const handleNext = useCallback(() => {
    if (selected.length === 0) {
      setValidationError(true);
      return;
    }
    setValidationError(false);
    onNext();
  }, [selected.length, onNext]);

  const selectedItems = useMemo(
    () => selected.map(id => OPTIONS_MAP[id]).filter(Boolean) as PriorityOption[],
    [selected]
  );

  return (
    <OnboardingShell density="compact">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">
          What matters most in your business right now?
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
          Select as many as apply, in order of importance. Your priorities shape your dashboard, advisors, and recommendations from day one.
        </p>
      </div>

      {/* Priority groups */}
      <div className="space-y-5">
        {PRIORITY_GROUPS.map(group => {
          const Icon = group.icon;
          return (
            <div key={group.category} className="space-y-2">
              <div className="flex items-center gap-2">
                <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  {group.category}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {group.items.map(item => {
                  const idx = selected.indexOf(item.id);
                  const isSelected = idx !== -1;
                  return (
                    <motion.button
                      key={item.id}
                      type="button"
                      whileTap={{ scale: 0.97 }}
                      onClick={() => togglePriority(item.id)}
                      className={`w-full p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? "bg-primary/10 border-primary/40 ring-1 ring-primary/20 shadow-sm shadow-primary/5"
                          : "bg-card/50 border-border/50 hover:border-primary/20 hover:bg-card/80"
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${isSelected ? "text-foreground" : "text-foreground/80"}`}>
                            {item.label}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                        {isSelected && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold shrink-0"
                          >
                            {idx + 1}
                          </motion.span>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {selectedItems.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex flex-col items-center gap-3 py-8 rounded-xl border border-dashed transition-colors ${
            validationError
              ? "border-destructive/50 bg-destructive/5"
              : "border-border/40 bg-muted/10"
          }`}
        >
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            validationError ? "bg-destructive/10" : "bg-primary/10"
          }`}>
            <Target className={`h-6 w-6 ${validationError ? "text-destructive" : "text-primary/60"}`} />
          </div>
          <div className="text-center px-4">
            <p className={`text-sm font-medium ${validationError ? "text-destructive" : "text-muted-foreground"}`}>
              {validationError ? "Select at least one priority to continue" : "No priorities selected yet"}
            </p>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
              Tap any item above to mark it as a priority. Your first pick gets the most weight.
            </p>
          </div>
          {validationError && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-1.5 text-[11px] text-destructive font-medium"
            >
              <AlertCircle className="h-3.5 w-3.5" />
              Required — please choose what matters most
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Reorder strip + insight */}
      {selectedItems.length > 0 && (
        <div className="sticky bottom-0 bg-background/95 backdrop-blur-md rounded-xl border border-border/30 p-3 space-y-2 z-10">
          <PriorityReorderStrip
            items={selectedItems}
            onReorder={handleReorder}
            onRemove={handleRemove}
          />
          <InsightCallout count={selectedItems.length} />
          <p className="text-[10px] text-muted-foreground">
            We use your priorities to shape your business dashboard, advisors, and recommendations from day one.
          </p>
        </div>
      )}

      {/* Footer navigation with validation */}
      <OnboardingFooterNav
        onBack={onBack}
        onNext={handleNext}
        nextDisabled={false}
        nextLabel={selected.length === 0 ? "Select priorities" : `Continue (${selected.length})`}
      />
    </OnboardingShell>
  );
}