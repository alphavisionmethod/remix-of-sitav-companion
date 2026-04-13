

# Fix Build Errors — Install Missing Test Dependency

## Problem
13 test files have TypeScript errors: `Module '"@testing-library/react"' has no exported member 'screen'`. The imports are correct (`@/test/test-utils` which re-exports from `@testing-library/react`), but `@testing-library/react` re-exports from `@testing-library/dom` — which is not installed as an explicit dependency.

## Verified — Everything Else is 100% Complete

**Database (all 20 tables + 4 views):** Confirmed present with RLS, indexes, all columns matching the spec.

**All lifecycle states supported:** `ai_workforce_recommendations.lifecycle_status` exists with default `'new'`, plus all execution/binding status fields.

**All required columns verified:** lifecycle_status, approval_decision_at, approved_by_user_id, rejected_by_user_id, deferred_reason, execution_required, execution_priority, flagship_loop_key, customer_journey_impact_key, launch_blocker_impact_class, outcome_verification_required — all present.

**All 14 admin pages routed:** REX01-05, SERV01-06, FL01-03.

**All services wired:** recommendation-loop-service, flagship-loop-service, route-to-service-inventory, service-ownership-registry.

## Fix

1. Add `@testing-library/dom` as a dev dependency to resolve the peer dependency and fix all 13 test file type errors.

That's the only change needed — no schema changes, no frontend changes, no service changes.

