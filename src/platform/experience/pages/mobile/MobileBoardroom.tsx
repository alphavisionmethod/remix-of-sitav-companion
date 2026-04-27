// ═══════════════════════════════════════════════════════════════
// SITA OS — Mobile Trusted Device: Boardroom
// ═══════════════════════════════════════════════════════════════

import { MobileShell } from "@/platform/experience/components/mobile/MobileShell";
import { MobileAdvisorBoard } from "@/platform/advisors/components/advisors/MobileAdvisorBoard";
import type { AdvisorConfig } from "@/platform/advisors/components/advisors/AdvisorCouncilShell";
import { Badge } from "@/components/ui/badge";
import { Shield, TrendingUp, Briefcase, Wallet, Home } from "lucide-react";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
import { useRealityModeSafe } from "@/lib/dual-reality/reality-mode-context";
import { MOCK_MOBILE_BOARDROOM_ADVISORS } from "@/data/fixtures/mock-data/mobile-shells";

const MobileBoardroom = () => {
  const { isDemo } = useRealityModeSafe();
  const advisors: AdvisorConfig[] = isDemo
    ? (MOCK_MOBILE_BOARDROOM_ADVISORS as AdvisorConfig[])
    : [];
  return (
  <MobileShell title="Boardroom">
      <div className="mb-2"><PageTruthBanner truthState="partial" /></div>
    <div className="mb-4 p-3 rounded-xl bg-card border border-border/40">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-semibold text-foreground">Council Status</p>
        <Badge variant="outline" className="text-[10px] border-emerald-500/30 bg-emerald-500/10 text-emerald-500">Live</Badge>
      </div>
      <div className="grid grid-cols-5 gap-2">
        {[
          { icon: Briefcase, label: "Biz", active: true },
          { icon: Wallet, label: "Fin", active: true },
          { icon: Home, label: "Ops", active: true },
          { icon: TrendingUp, label: "Gro", active: false },
          { icon: Shield, label: "Risk", active: true },
        ].map(a => (
          <div key={a.label} className="flex flex-col items-center gap-1">
            <div className={`p-1.5 rounded-lg ${a.active ? "bg-primary/10" : "bg-muted/30"}`}>
              <a.icon className={`h-3.5 w-3.5 ${a.active ? "text-primary" : "text-muted-foreground"}`} />
            </div>
            <span className="text-[10px] text-muted-foreground">{a.label}</span>
          </div>
        ))}
      </div>
    </div>
    <MobileAdvisorBoard advisors={advisors} />
  </MobileShell>
  );
};

export default MobileBoardroom;
