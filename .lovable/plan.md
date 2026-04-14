

# Unify All Business Pages into the Single Windowed App

## Problem

6 routes in `business-routes.tsx` still render standalone page components instead of routing through the `BusinessCenter` redirect shim:
- `/business/website-builder` → `WebsiteBuilderPage` (standalone)
- `/business/proposals` → `ProposalsContractsPage` (standalone)
- `/business/lead-recovery` → `LeadRecoveryPage` (standalone)
- `/business/social` → `SocialCommandPage` (standalone)
- `/business/ecommerce` → `EcommerceManagerPage` (standalone)
- `/business/integrations` → `CRMIntegrationHubPage` (standalone)
- `/business/customers/:id` → `CustomerDetail` (standalone)
- `/business/customer-health` → `CustomerHealthPage` (standalone)

Additionally, `CRMIntegrationHub` and `CustomerDetail` are missing from the windowed app's `pages` map in `BusinessAppShell.tsx`.

## Changes

### 1. `src/routes/business-routes.tsx`
- Change all 8 standalone routes to use `<BusinessCenter />` instead of their own components
- Remove the lazy imports for `WebsiteBuilderPage`, `ProposalsContractsPage`, `LeadRecoveryPage`, `SocialCommandPage`, `EcommerceManagerPage`, `CRMIntegrationHubPage`, `CustomerDetail`, `CustomerHealthPage`

### 2. `src/components/sita/apps/business/BusinessAppShell.tsx`
- Add missing page imports: `CRMIntegrationHub`, `CustomerHealthPage`
- Add missing entries to the `pages` map: `"integrations": CRMIntegrationHub`, `"customer-health": CustomerHealthPage`
- Add `"Integrations"` to the CRM sidebar group and `"Customer Health"` to the Core sidebar group
- Handle `CustomerDetail` — since it uses route params (`/:id`), add an internal detail view mode to the app shell (store a `selectedCustomerId` in state, render `CustomerDetailPane` inline when set)

### 3. `src/pages/BusinessCenter.tsx`
- Add missing path mappings to `subpageFromPath`: `customer-health`, `integrations`, and `customers/:id` pattern

### 4. `src/pages/CustomerDetail.tsx`
- Replace `useNavigate` with `useBusinessNavigation` context so it works inside the windowed app

## Result

Every `/business/*` route redirects to desktop and opens the windowed Business OS app at the correct sub-page. No business page renders as a standalone router page anymore.

