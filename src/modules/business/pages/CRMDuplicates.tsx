import React from "react";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
import CRMDuplicateReview from "@/modules/business/components/business/crm/CRMDuplicateReview";
import { useBusinessProfile } from "@/modules/business/hooks/useBusinessProfile";

const CRMDuplicates = () => {
  const { adaptations } = useBusinessProfile();
  const contactLabel = adaptations.crm?.language?.contactLabel || "Contact";

  return (
    <div className="space-y-6">
      <PageTruthBanner truthState="demo" />
      <div>
        <h2 className="text-xl font-bold text-foreground">Duplicate Detection & Merge</h2>
        <p className="text-xs text-muted-foreground">Find and merge duplicate {contactLabel.toLowerCase()}s to keep your CRM clean</p>
      </div>
      <CRMDuplicateReview />
    </div>
  );
};

export default CRMDuplicates;
