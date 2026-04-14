import React from "react";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import CRMCustomFields from "@/components/business/crm/CRMCustomFields";

const CRMCustomFieldsPage = () => (
  <div className="space-y-6">
    <PageTruthBanner truthState="demo" />
    <CRMCustomFields />
  </div>
);

export default CRMCustomFieldsPage;
