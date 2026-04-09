// ═══════════════════════════════════════════════════════════════
// SITA OS — Multi-Step Creation Flow (Reusable)
// Shared multi-step creation shell with progress,
// save/defer, premium feel, trust-sensitive previews
// ═══════════════════════════════════════════════════════════════

import { cn } from "@/lib/utils";
import { CheckCircle, ChevronLeft, ChevronRight, X, Save, Clock } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export interface FlowStep {
  id: string;
  label: string;
  description?: string;
  optional?: boolean;
  trustSensitive?: boolean;
}

interface MultiStepCreationFlowProps {
  title: string;
  steps: FlowStep[];
  currentStep: number;
  onStepChange: (step: number) => void;
  onComplete: () => void;
  onCancel: () => void;
  onSaveForLater?: () => void;
  canAdvance?: boolean;
  children: ReactNode;
  className?: string;
}

export function MultiStepCreationFlow({
  title, steps, currentStep, onStepChange,
  onComplete, onCancel, onSaveForLater,
  canAdvance = true, children, className,
}: MultiStepCreationFlowProps) {
  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;
  const current = steps[currentStep];
  const completedCount = currentStep;
  const progressPct = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className={cn("fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col", className)}>
      {/* Header */}
      <div className="border-b border-border/40 bg-card/90 backdrop-blur-xl">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold">{title}</h2>
              <p className="text-[11px] text-muted-foreground">Step {currentStep + 1} of {steps.length}</p>
            </div>
            <div className="flex items-center gap-2">
              {onSaveForLater && (
                <Button variant="ghost" size="sm" onClick={onSaveForLater} className="gap-1.5 text-xs">
                  <Clock className="h-3.5 w-3.5" /> Save for later
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={onCancel}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Progress */}
          <div className="mt-3 h-1 rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Step Indicators */}
          <div className="flex items-center gap-1 mt-2 overflow-x-auto pb-1">
            {steps.map((step, idx) => (
              <button
                key={step.id}
                onClick={() => idx < currentStep && onStepChange(idx)}
                disabled={idx > currentStep}
                className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-md text-[10px] whitespace-nowrap transition-colors",
                  idx === currentStep ? "bg-primary/10 text-primary font-medium" :
                  idx < currentStep ? "text-[hsl(var(--trust-safe))] hover:bg-muted cursor-pointer" :
                  "text-muted-foreground/50 cursor-not-allowed"
                )}
              >
                {idx < currentStep ? (
                  <CheckCircle className="h-3 w-3" />
                ) : (
                  <span className="h-3 w-3 rounded-full border border-current flex items-center justify-center text-[8px]">{idx + 1}</span>
                )}
                <span>{step.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-6">
          {/* Step Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">{current.label}</h3>
              {current.optional && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">Optional</span>}
              {current.trustSensitive && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[hsl(var(--sita-gold))]/10 text-[hsl(var(--sita-gold))]">Trust-sensitive</span>}
            </div>
            {current.description && <p className="text-sm text-muted-foreground mt-1">{current.description}</p>}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border/40 bg-card/90 backdrop-blur-xl">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => isFirst ? onCancel() : onStepChange(currentStep - 1)}
            className="gap-1.5"
          >
            <ChevronLeft className="h-4 w-4" />
            {isFirst ? "Cancel" : "Back"}
          </Button>

          <div className="flex items-center gap-2">
            {current.optional && !isLast && (
              <Button variant="ghost" onClick={() => onStepChange(currentStep + 1)} className="text-xs">
                Skip
              </Button>
            )}
            <Button
              onClick={() => isLast ? onComplete() : onStepChange(currentStep + 1)}
              disabled={!canAdvance}
              className="gap-1.5"
            >
              {isLast ? (
                <><CheckCircle className="h-4 w-4" /> Complete</>
              ) : (
                <>Next <ChevronRight className="h-4 w-4" /></>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
