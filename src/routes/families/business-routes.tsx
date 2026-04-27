import { Route } from "react-router-dom";
import { lazy } from "react";

const BusinessCenter = lazy(() => import("@/pages/BusinessCenter"));

export function getBusinessRoutes() {
  return (
    <>
      <Route path="/business" element={<BusinessCenter />} />
      <Route path="/business/overview" element={<BusinessCenter />} />
      <Route path="/business/leads" element={<BusinessCenter />} />
      <Route path="/business/customers" element={<BusinessCenter />} />
      <Route path="/business/customers/:id" element={<BusinessCenter />} />
      <Route path="/business/customer-health" element={<BusinessCenter />} />
      <Route path="/business/opportunities" element={<BusinessCenter />} />
      <Route path="/business/quotes" element={<BusinessCenter />} />
      <Route path="/business/invoices" element={<BusinessCenter />} />
      <Route path="/business/collections" element={<BusinessCenter />} />
      <Route path="/business/revenue" element={<BusinessCenter />} />
      <Route path="/business/revenue-autopilot" element={<BusinessCenter />} />
      {/* Phase 2 IA cleanup — canonical Autopilot Console URL.
          Legacy /business/autopilot-hub is redirected by user-redirect-map. */}
      <Route path="/business/revenue-autopilot-console" element={<BusinessCenter />} />
      {/* Legacy slug retained as a route for in-app deep-links not yet rewritten;
          it resolves to the same console via the BusinessAppShell PAGE map. */}
      <Route path="/business/autopilot-hub" element={<BusinessCenter />} />
      {/* /business/revenue-impact has been demoted to an internal sub-tab of
          Revenue Home. The route is preserved so legacy bookmarks still load
          the shell, where the redirect map promotes them to /business/revenue. */}
      <Route path="/business/revenue-impact" element={<BusinessCenter />} />
      <Route path="/business/playbook-builder" element={<BusinessCenter />} />
      <Route path="/business/revenue-forecast" element={<BusinessCenter />} />
      <Route path="/business/communications" element={<BusinessCenter />} />
      <Route path="/business/boardroom" element={<BusinessCenter />} />
      <Route path="/business/proof" element={<BusinessCenter />} />
      <Route path="/business/settings" element={<BusinessCenter />} />
      <Route path="/business/website-builder" element={<BusinessCenter />} />
      <Route path="/business/proposals" element={<BusinessCenter />} />
      <Route path="/business/lead-recovery" element={<BusinessCenter />} />
      <Route path="/business/social" element={<BusinessCenter />} />
      <Route path="/business/ecommerce" element={<BusinessCenter />} />
      <Route path="/business/integrations" element={<BusinessCenter />} />
      <Route path="/business/follow-through" element={<BusinessCenter />} />
      <Route path="/business/support" element={<BusinessCenter />} />
      <Route path="/business/appointments" element={<BusinessCenter />} />
      <Route path="/business/operations" element={<BusinessCenter />} />
      <Route path="/business/documents" element={<BusinessCenter />} />
      <Route path="/business/continuity-report" element={<BusinessCenter />} />
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
      <Route path="/business/crm-import" element={<BusinessCenter />} />
      <Route path="/business/crm-duplicates" element={<BusinessCenter />} />
      <Route path="/business/crm-advisor" element={<BusinessCenter />} />
      <Route path="/business/crm-fields" element={<BusinessCenter />} />
      <Route path="/business/crm-communications" element={<BusinessCenter />} />
    </>
  );
}
