import React from "react";
import { CRMCommunicationQueue } from "@/components/business/crm/CRMCommunicationQueue";
import { useNavigate } from "react-router-dom";

const CRMCommunications = () => {
  const navigate = useNavigate();
  return (
    <CRMCommunicationQueue onViewTimeline={() => navigate("/business/crm-timeline")} />
  );
};

export default CRMCommunications;
