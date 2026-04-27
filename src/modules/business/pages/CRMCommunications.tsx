import React from "react";
import { CRMCommunicationQueue } from "@/modules/business/components/business/crm/CRMCommunicationQueue";
import { useBusinessNavigation } from "@/modules/business/contexts/BusinessNavigationContext";
import { useBusinessProfile } from "@/modules/business/hooks/useBusinessProfile";

const CRMCommunications = () => {
  const { navigateTo } = useBusinessNavigation();
  const { adaptations } = useBusinessProfile();
  return (
    <CRMCommunicationQueue onViewTimeline={() => navigateTo("crm-timeline")} />
  );
};

export default CRMCommunications;
