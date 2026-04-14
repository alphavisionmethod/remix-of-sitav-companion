import React from "react";
import { CRMCommunicationQueue } from "@/components/business/crm/CRMCommunicationQueue";
import { useBusinessNavigation } from "@/contexts/BusinessNavigationContext";

const CRMCommunications = () => {
  const { navigateTo } = useBusinessNavigation();
  return (
    <CRMCommunicationQueue onViewTimeline={() => navigateTo("crm-timeline")} />
  );
};

export default CRMCommunications;
