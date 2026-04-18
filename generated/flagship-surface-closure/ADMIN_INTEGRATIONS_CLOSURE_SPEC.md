# Admin Integrations — Closure Spec

**Scope**: `/admin/integrations` hub. Production-grade.

## Wired
- 5 modules in `IntegrationsHome.tsx`: Cloud Backbone, Sync, Concierge, OAuth Refresh Health, **7-Day Streak**.
- `OAuthRefreshHealthBoard` rows render canonical `ConnectorStateBadge` + open `IntegrationReceiptDrawer` and surface `ReauthCTAButton` for `reauth_required` accounts.
- `connector_effective_state` SQL view computes worst-of-three from `connector_accounts`, `connector_tokens.expires_at`, and `ai_provider_health.status`. Eliminates ambiguous "connected".

## Reauth flow
`requestProviderReauth(accountId)` (in `src/lib/connectors/reauth-actions.ts`) sets `connector_accounts.status='reauth_required'` and emits a `timeline_events` row `connector.reauth_requested` for observability.

## Refactored to canonical badge (no local color maps)
- `OAuthRefreshHealthBoard.tsx`
- `CN01ConnectorRealityOverview.tsx` (`statusColors` map deleted)
- `CN05ConnectorHealthBoard.tsx` (`statusColors` map deleted)
- `IntegrationsHome.tsx`

## Validator (BLOCK)
`check-admin-integrations-health-visibility` — asserts streak panel mount, OAuth board uses badge + drawer + reauth CTA, and forbids any `const statusColors` map in refactored connector pages.

## No duplicates
Connector state grammar = `src/lib/connectors/connector-state-grammar.ts` (single source of truth, 6 canonical states).
