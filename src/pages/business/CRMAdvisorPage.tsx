import React from "react";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import CRMAdvisorBoard from "@/components/business/crm/CRMAdvisorBoard";

const CRMAdvisorPage = () => (
  <div className="space-y-6">
    <PageTruthBanner truthState="demo" />
    <CRMAdvisorBoard />
  </div>
);

export default CRMAdvisorPage;
