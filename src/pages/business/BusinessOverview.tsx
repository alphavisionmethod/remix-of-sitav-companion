import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { useBusinessProfile } from "@/hooks/useBusinessProfile";
import { getIdentityLayer } from "@/lib/engines/business-identity-layers";
import { HomeIdentityHeader } from "@/components/business/home/HomeIdentityHeader";
import { WhatMattersNowHero } from "@/components/business/home/WhatMattersNowHero";
import { PressurePulseLayer } from "@/components/business/home/PressurePulseLayer";
import { OpportunityRecoveryLayer } from "@/components/business/home/OpportunityRecoveryLayer";
import { ContinuityTimeline } from "@/components/business/home/ContinuityTimeline";
import { AdvisorSynthesisZone } from "@/components/business/home/AdvisorSynthesisZone";
import { BoardroomEntryZone } from "@/components/business/home/BoardroomEntryZone";

const BusinessOverview = () => {
  const { primaryMode } = useBusinessProfile();
  const identity = getIdentityLayer(primaryMode);

  // Profile-aware zone emphasis
  const zoneEmphasis = useMemo(() => {
    const base = { hero: 1, pressure: 1, opportunity: 1, continuity: 1, advisor: 1, boardroom: 1 };
    switch (primaryMode) {
      case "ecommerce":
        return { ...base, opportunity: 1.2, hero: 0.9 };
      case "service":
      case "agency":
        return { ...base, hero: 1.2, advisor: 1.1 };
      case "employee-based":
        return { ...base, pressure: 1.3, hero: 0.9 };
      case "brick-and-mortar":
        return { ...base, pressure: 1.1, continuity: 1.1 };
      default:
        return base;
    }
  }, [primaryMode]);

  return (
    <div className="min-h-full bg-background p-4 md:p-6 overflow-y-auto">
      <div className="max-w-[1400px] mx-auto space-y-5">
        {/* Zone A — Identity Header */}
        <HomeIdentityHeader />

        {/* Zone B + C — Asymmetric hero layout: Hero 2/3, Pressure 1/3 */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <div className="xl:col-span-2">
            <WhatMattersNowHero />
          </div>
          <div className="xl:col-span-1">
            <PressurePulseLayer />
          </div>
        </div>

        {/* Zone D — Opportunity & Recovery */}
        <OpportunityRecoveryLayer />

        {/* Zone E + F — Continuity Timeline + Advisor Synthesis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <ContinuityTimeline />
          <AdvisorSynthesisZone />
        </div>

        {/* Zone G — Boardroom Entry */}
        <BoardroomEntryZone />
      </div>
    </div>
  );
};

export default BusinessOverview;
