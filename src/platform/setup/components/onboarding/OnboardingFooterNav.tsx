// ═══════════════════════════════════════════════════════════════
// SITA OS — Onboarding Footer Nav (canonical primitive)
// ═══════════════════════════════════════════════════════════════
// Back / Next / Skip controls for ceremony screens.
// All copy and disabled states are caller-owned.
// ═══════════════════════════════════════════════════════════════

import { ArrowLeft, ArrowRight } from "lucide-react";

export interface OnboardingFooterNavProps {
  onBack?: () => void;
  onNext?: () => void;
  onSkip?: () => void;
  backLabel?: string;
  nextLabel?: string;
  skipLabel?: string;
  nextDisabled?: boolean;
  primaryEmphasis?: boolean;
  className?: string;
}

export function OnboardingFooterNav({
  onBack,
  onNext,
  onSkip,
  backLabel = "Back",
  nextLabel = "Continue",
  skipLabel = "Skip",
  nextDisabled = false,
  primaryEmphasis = true,
  className = "",
}: OnboardingFooterNavProps) {
  return (
    <div className={`flex items-center gap-2 pt-4 ${className}`}>
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="p-3 rounded-xl bg-card/50 border border-border/50 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-card/80 transition-colors flex items-center gap-1.5"
        >
          <ArrowLeft className="h-4 w-4" />
          {backLabel}
        </button>
      )}
      {onSkip && (
        <button
          type="button"
          onClick={onSkip}
          className="p-3 rounded-xl text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {skipLabel}
        </button>
      )}
      <div className="flex-1" />
      {onNext && (
        <button
          type="button"
          onClick={onNext}
          disabled={nextDisabled}
          className={`p-3 px-5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors disabled:opacity-50 ${
            primaryEmphasis
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-card/70 text-foreground border border-border/50 hover:bg-card"
          }`}
        >
          {nextLabel}
          <ArrowRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export default OnboardingFooterNav;
