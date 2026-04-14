import { Route } from "react-router-dom";
import { lazy } from "react";

const BusinessCenter = lazy(() => import("@/pages/BusinessCenter"));
const CustomerDetail = lazy(() => import("@/pages/CustomerDetail"));
const CustomerHealthPage = lazy(() => import("@/pages/CustomerHealthPage"));
const WebsiteBuilderPage = lazy(() => import("@/pages/business/WebsiteBuilder"));
const ProposalsContractsPage = lazy(() => import("@/pages/business/ProposalsContracts"));
const LeadRecoveryPage = lazy(() => import("@/pages/business/LeadRecovery"));
const SocialCommandPage = lazy(() => import("@/pages/business/SocialCommand"));
const EcommerceManagerPage = lazy(() => import("@/pages/business/EcommerceManager"));
const CRMIntegrationHubPage = lazy(() => import("@/pages/business/CRMIntegrationHub"));

export function getBusinessRoutes() {
  return (
    <>
      <Route path="/business" element={<BusinessCenter />} />
      <Route path="/business/overview" element={<BusinessCenter />} />
      <Route path="/business/leads" element={<BusinessCenter />} />
      <Route path="/business/customers" element={<BusinessCenter />} />
      <Route path="/business/opportunities" element={<BusinessCenter />} />
      <Route path="/business/quotes" element={<BusinessCenter />} />
      <Route path="/business/invoices" element={<BusinessCenter />} />
      <Route path="/business/collections" element={<BusinessCenter />} />
      <Route path="/business/revenue-autopilot" element={<BusinessCenter />} />
      <Route path="/business/autopilot-hub" element={<BusinessCenter />} />
      <Route path="/business/revenue-impact" element={<BusinessCenter />} />
      <Route path="/business/playbook-builder" element={<BusinessCenter />} />
      <Route path="/business/revenue-forecast" element={<BusinessCenter />} />
      <Route path="/business/communications" element={<BusinessCenter />} />
      <Route path="/business/boardroom" element={<BusinessCenter />} />
      <Route path="/business/proof" element={<BusinessCenter />} />
      <Route path="/business/files" element={<BusinessCenter />} />
      <Route path="/business/settings" element={<BusinessCenter />} />
      <Route path="/business/website-builder" element={<WebsiteBuilderPage />} />
      <Route path="/business/proposals" element={<ProposalsContractsPage />} />
      <Route path="/business/lead-recovery" element={<LeadRecoveryPage />} />
      <Route path="/business/social" element={<SocialCommandPage />} />
      <Route path="/business/ecommerce" element={<EcommerceManagerPage />} />
      <Route path="/business/integrations" element={<CRMIntegrationHubPage />} />
      <Route path="/business/customers/:id" element={<CustomerDetail />} />
      <Route path="/business/customer-health" element={<CustomerHealthPage />} />
      <Route path="/business/follow-through" element={<BusinessCenter />} />
      <Route path="/business/support" element={<BusinessCenter />} />
      <Route path="/business/appointments" element={<BusinessCenter />} />
      <Route path="/business/operations" element={<BusinessCenter />} />
      <Route path="/business/documents" element={<BusinessCenter />} />
      {/* CRM Routes */}
      <Route path="/business/crm-home" element={<BusinessCenter />} />
      <Route path="/business/crm-contacts" element={<BusinessCenter />} />
      <Route path="/business/crm-companies" element={<BusinessCenter />} />
      <Route path="/business/crm-pipeline" element={<BusinessCenter />} />
      <Route path="/business/crm-health" element={<BusinessCenter />} />
      <Route path="/business/crm-timeline" element={<BusinessCenter />} />
      <Route path="/business/crm-tasks" element={<BusinessCenter />} />
      <Route path="/business/crm-notes" element={<BusinessCenter />} />
      <Route path="/business/crm-segments" element={<BusinessCenter />} />
      <Route path="/business/crm-automations" element={<BusinessCenter />} />
    </>
  );
}
