import { useContext } from "react";
import { BusinessProfileCtx } from "@/modules/business/contexts/BusinessProfileContext";

export function useBusinessProfile() {
  const ctx = useContext(BusinessProfileCtx);
  return {
    profile: ctx.profile,
    weights: ctx.profile.weights,
    primaryMode: ctx.primaryMode,
    operatingFlags: ctx.profile.operatingFlags,
    adaptations: {
      sidebar: ctx.profile.sidebar,
      homeWidgets: ctx.profile.homeWidgets,
      crm: ctx.profile.crm,
      advisors: ctx.profile.advisors,
      boardroom: ctx.profile.boardroom,
      workflows: ctx.profile.workflows,
      kpis: ctx.profile.kpis,
    },
    updateOverrides: ctx.updateOverrides,
    resetToDetected: ctx.resetToDetected,
    isAdapted: ctx.isAdapted,
  };
}
