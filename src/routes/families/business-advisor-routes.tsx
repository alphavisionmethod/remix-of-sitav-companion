import { Route } from "react-router-dom";
import { lazy } from "react";

const BusinessAdvisorsIndex = lazy(() => import("@/pages/business-advisors/BusinessAdvisorsIndex"));
const BusinessAdvisorPage = lazy(() => import("@/pages/business-advisors/BusinessAdvisorPage"));
const MobileBusinessAdvisors = lazy(() => import("@/pages/mobile/MobileBusinessAdvisors"));
const MobileBusinessAdvisorDetail = lazy(() => import("@/pages/mobile/MobileBusinessAdvisorDetail"));

export function getBusinessAdvisorRoutes() {
  return (
    <>
      <Route path="/business-advisors" element={<BusinessAdvisorsIndex />} />
      <Route path="/business-advisors/:advisorId" element={<BusinessAdvisorPage />} />
      <Route path="/mobile/business-advisors" element={<MobileBusinessAdvisors />} />
      <Route path="/mobile/business-advisors/:advisorId" element={<MobileBusinessAdvisorDetail />} />
    </>
  );
}