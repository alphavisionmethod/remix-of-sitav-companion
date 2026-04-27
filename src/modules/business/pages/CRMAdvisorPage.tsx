import React from "react";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
import CRMAdvisorBoard from "@/modules/business/components/business/crm/CRMAdvisorBoard";
import { useBusinessProfile } from "@/modules/business/hooks/useBusinessProfile";

const CRMAdvisorPage = () => {
  const { primaryMode, adaptations } = useBusinessProfile();
  const advisorLabel = adaptations.crm?.language?.contactLabel === "Buyers"
    ? "E-Commerce Advisor"
    : adaptations.crm?.language?.contactLabel === "Clients"
    ? "Client Relationship Advisor"
    : "CRM Advisor";

  return (
    <div className="space-y-6">
      <PageTruthBanner truthState="demo" />
      <div className="px-1">
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-foreground/25 mb-1">{advisorLabel}</p>
      </div>
      <CRMAdvisorBoard />
    </div>
  );
};

export default CRMAdvisorPage;
