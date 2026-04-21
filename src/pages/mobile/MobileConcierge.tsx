// ═══════════════════════════════════════════════════════════════
// SITA OS — Mobile Concierge (wired to appointments, errands, obligations)
// ═══════════════════════════════════════════════════════════════

import { MobileShell } from "@/components/mobile/MobileShell";
import { Calendar, ShoppingCart, RotateCcw, ArrowRight, CheckCircle2, Clock, Loader2 } from "lucide-react";
import { useMobileConciergeData } from "@/hooks/use-mobile-data";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Calendar, ShoppingCart, RotateCcw,
};

const MobileConcierge = () => {
  const { data: sections, isLoading, isDemo } = useMobileConciergeData();

  return (
    <MobileShell title="Concierge">
      {isLoading && (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {isDemo && (
        <p className="text-[10px] text-muted-foreground text-center mb-3 italic">Demo data — sign in for your real schedule</p>
      )}

      {sections.map((section) => {
        const SectionIcon = ICON_MAP[section.iconName] ?? Calendar;
        return (
          <div key={section.title} className="mb-5">
            <div className="flex items-center gap-2 mb-2">
              <SectionIcon className="h-4 w-4 text-primary" />
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{section.title}</h2>
            </div>
            <div className="space-y-1.5">
              {section.items.map((item, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-3 rounded-xl border border-border/20 bg-card/50">
                  {item.status === "done" ? (
                    <CheckCircle2 className="h-4 w-4 text-[hsl(var(--trust-safe))] shrink-0" />
                  ) : (
                    <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium">{item.label}</p>
                    <p className="text-[10px] text-muted-foreground">{item.detail}</p>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {!isLoading && sections.length === 0 && (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">No schedule items yet</p>
          <p className="text-xs text-muted-foreground mt-1">Your appointments, errands, and obligations will appear here</p>
        </div>
      )}
    </MobileShell>
  );
};

export default MobileConcierge;
