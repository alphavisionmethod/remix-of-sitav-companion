# Phase 4 Closure Audit — Autonomous Security Policy Drafting

**Status**: GREEN (4 BLOCK gates)
**Date**: 2026-04-18
**Agent**: `aw-policy-architect`

## Scope
Adds an AI-drafted, admin-reviewed policy proposal pipeline. Drafts cover:
- RLS policy gaps (tables with RLS enabled but zero policies)
- RLS missing entirely (tables with RLS disabled)
- Secret rotation cadence (90-day informational drafts)
- Role/column grant reviews (extension points)

## Hard guarantees
1. **No DDL auto-application.** The `internal-agent-policy-architect` edge function only writes to `internal_agent_policy_drafts`. The `check-policy-draft-never-auto-apply` gate scans both the function and review surface for forbidden DDL patterns.
2. **Admin-only review.** Both `internal_agent_policy_drafts` and `internal_agent_policy_review_log` enforce `has_role('admin')` for all CRUD; the function double-checks the JWT.
3. **Append-only review log.** Every decision is recorded in `internal_agent_policy_review_log` via the `record_policy_draft_decision` SECURITY DEFINER helper.
4. **External application step.** Even after approval, SQL must be applied manually outside this surface (e.g., via the migration tool). The "Mark as applied externally" button only records audit metadata.

## BLOCK gates (4)
| Gate | File |
|------|------|
| `internal-agent-policy-drafts-table` | `scripts/validation/check-internal-agent-policy-drafts-table.ts` |
| `internal-agent-policy-architect-function` | `scripts/validation/check-internal-agent-policy-architect-function.ts` |
| `policy-draft-review-page` | `scripts/validation/check-policy-draft-review-page.ts` |
| `policy-draft-never-auto-apply` | `scripts/validation/check-policy-draft-never-auto-apply.ts` |

## Aggregator
Release-readiness gate count: **75 → 79**.

## Surfaces
- Edge function: `supabase/functions/internal-agent-policy-architect`
- Admin page: `/admin/ai-runtime/policy-drafts`
- Tables: `internal_agent_policy_drafts`, `internal_agent_policy_review_log`
- RPCs: `record_policy_draft_decision`, `summarize_policy_draft_health`
