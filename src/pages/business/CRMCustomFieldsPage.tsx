import React from "react";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import CRMCustomFields from "@/components/business/crm/CRMCustomFields";
import { useBusinessProfile } from "@/hooks/useBusinessProfile";

const CRMCustomFieldsPage = () => {
  const { primaryMode, adaptations } = useBusinessProfile();
  const entityLabel = adaptations.crm?.language?.contactLabel || "Contact";

  return (
    <div className="space-y-6">
      <PageTruthBanner truthState="demo" />
      <div className="px-1">
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-foreground/25 mb-1">
          Custom Fields — {entityLabel}s
        </p>
      </div>
      <CRMCustomFields />
    </div>
  );
};

export default CRMCustomFieldsPage;
