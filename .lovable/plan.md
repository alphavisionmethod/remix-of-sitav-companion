
# Phase 2 — Customer Service Advisor

Mirror the proven Sales Advisor pattern. Reuse `AdvisorPageShell`, `StatTile`, `askBusinessAdvisor`, `runAdvisorSimulation`, registry governance, and DoD checker.

## Changes

### Edit
1. `src/lib/ai-platform/runtime/advisor-context-loader.ts` — map `support_tickets` → `support_cases`, `customer_records` → `customers` with RLS-scoped queries.
2. `src/pages/business-advisors/BusinessAdvisorPage.tsx` — add `customer-service-advisor` branch passing 3 CS slots into `AdvisorPageShell`.
3. `src/pages/mobile/MobileBusinessAdvisorDetail.tsx` — render `<MobileCustomerServiceAdvisorPanels />` for the CS advisor.

### Create
4. `src/components/business-advisors/customer-service/CustomerServiceHeaderStats.tsx` — Open / Urgent (<24h SLA) / Escalated / At-Risk tiles.
5. `src/components/business-advisors/customer-service/CustomerServiceRecommendations.tsx` — aging cases + churn-risk list with "Draft response" → `askBusinessAdvisor({ intent: 'draft' })`.
6. `src/components/business-advisors/customer-service/CustomerServiceSimulationForm.tsx` — 3 scenarios (response-time, staffing, escalation) → `runAdvisorSimulation`.
7. `src/components/business-advisors/customer-service/MobileCustomerServiceAdvisorPanels.tsx` — compact mobile cards.
8. `src/components/business-advisors/customer-service/__tests__/customer-service-advisor.test.tsx` — render/empty/populated/submit tests.

### Migration
9. `UPDATE advisor_deployment_status SET ready_score=1.00, status='deployment-ready' WHERE advisor_id='customer-service-advisor'` (after DoD check passes).

### Regenerate
10. `generated/advisor-boardroom-proof/business-advisor-deployment-check.json` via `scripts/advisors/check-advisor-deployment-ready.ts`.

## Governance
Registry already enforces blocked actions: `send_external_email`, `issue_refund`, `close_case_without_review`. Authority `L2-draft` (drafts only).

## DoD
14/14 gates must pass before the migration runs and the proof artifact is regenerated.
