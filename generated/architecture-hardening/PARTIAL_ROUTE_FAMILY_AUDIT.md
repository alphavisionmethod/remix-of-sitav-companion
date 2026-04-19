# Partial Route Family Audit

**Generated:** 2026-04-19
**Closure:** architecture-hardening
**Method:** Audit-only — no UI mutations this pass.

## Scope

Audit the 6 partial route families flagged in the architecture report. For each family: route count, polish status, runtime-proof status, and recommendation.

## 1. `/onboarding/**`

| Field | Value |
|---|---|
| Route count | ~6 (start, persona, account, integrations, complete, replay) |
| Polish status | Partial — simulated personas correctly labeled |
| Runtime-proof | Personas read from `simulated-surface-registry.ts` ✅ |
| Trust-copy risk | LOW — no agent-autonomy overclaims detected |
| Recommendation | **Gate copy-only.** Do not imply higher autonomy than current trust ladder. |

## 2. `/boardroom/**`

| Field | Value |
|---|---|
| Route count | ~12 (briefing, advisors, recommendations, approvals, receipts, outcomes, reflections) |
| Polish status | Partial — recommendation→approval→execution→receipt loop visible; learning loop v2 partial |
| Runtime-proof | Boardroom actions emit receipts via `advisor_board_actions` ✅ |
| Trust-copy risk | MEDIUM — learning-loop v2 wording may overclaim |
| Recommendation | **Gate v2 wording behind feature flag** until reflection→outcome closure rate proven. |

## 3. `/concierge/**`

| Field | Value |
|---|---|
| Route count | ~4 (chat, history, context, settings) |
| Polish status | Partial — AI degraded states need surfacing |
| Runtime-proof | Concierge writes to `ai_action_receipts` ✅ |
| Trust-copy risk | LOW |
| Recommendation | **Surface receipt status in degraded UX.** No new architecture needed. |

## 4. `/communications/**`

| Field | Value |
|---|---|
| Route count | ~8 (inbox, threads, templates, broadcasts, channels) |
| Polish status | Partial — long-tail connectors not all real-time |
| Runtime-proof | Real-time only for canonical connectors (Gmail, Slack, MS Graph) |
| Trust-copy risk | MEDIUM — "connected" badge may imply parity across all connectors |
| Recommendation | **Make manual-tier connectors explicit** (use `ConnectorStateBadge` 6-state model). |

## 5. `/admin/ai-runtime/**`

| Field | Value |
|---|---|
| Route count | 1 hub + 17 modules (after this pass: 19 modules) |
| Polish status | ✅ Canonical — 10 truth panels + this hardening panel |
| Runtime-proof | All panels read live evidence (DB or generated JSON) ✅ |
| Trust-copy risk | NONE — honest WARN-tier preserved everywhere |
| Recommendation | **No further action.** This hub is the canonical operator surface. |

## 6. `/admin/integrations/**`

| Field | Value |
|---|---|
| Route count | ~6 (hub, connector list, detail, oauth, webhooks, audit) |
| Polish status | Partial — operator remediation drilldowns thin |
| Runtime-proof | Uses canonical `ConnectorStateBadge` (6 states) ✅ |
| Trust-copy risk | LOW |
| Recommendation | **Surface reauth/degraded/failing paths in detail drawer.** |

## Summary

| Family | Polish | Closure recommendation |
|---|---|---|
| Onboarding | Partial | Gate copy |
| Boardroom | Partial | Feature-flag v2 wording |
| Concierge | Partial | Surface receipt status |
| Communications | Partial | Explicit connector tiers |
| AI Runtime | ✅ Canonical | None |
| Integrations | Partial | Detail drawer remediation |

## Out of scope for this pass

UI rewrites of these families belong to a separate flagship-surface pass. This audit produces **recommendations only**, preserving the additive-only contract of architecture-hardening.
