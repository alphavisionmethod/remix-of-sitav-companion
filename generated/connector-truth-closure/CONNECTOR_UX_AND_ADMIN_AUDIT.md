# Connector UX & Admin Audit

_Phase 4 audit._ Confirms no surface displays an ambiguous "connected" state when refresh is broken.

## Audit pass: user-facing connector surfaces

| Surface                                            | Renders state via                            | Verdict |
| -------------------------------------------------- | -------------------------------------------- | ------- |
| `IntegrationsHome` (admin)                         | `ConnectorStateBadge`                        | ✅ Honest |
| `IntegrationStreakPanel`                           | `ConnectorStateBadge` (per-day)              | ✅ Honest |
| `OAuthRefreshHealthBoard`                          | `ConnectorStateBadge` + `IntegrationReceiptDrawer` + `ReauthCTAButton` | ✅ Honest |
| `CN01ConnectorRealityOverview`                     | `ConnectorStateBadge` (refactored — no local statusColors) | ✅ Honest |
| `CN05ConnectorHealthBoard`                         | `ConnectorStateBadge` (refactored)           | ✅ Honest |
| `ConnectorTruthSummaryPanel` (NEW, AI Engineer)    | `ConnectorStateBadge` + links to canonical board | ✅ Honest |

## Long-tail provider classification

All connectors **not in `{google, microsoft, slack}`** are surfaced with `ConnectorStateBadge state="manual"` per the canonical grammar. Enforced by `check-long-tail-provider-classification.ts`.

## Reauth UX

- Broken refresh → `reauth_required` state → red `ConnectorStateBadge` + `ReauthCTAButton` on `OAuthRefreshHealthBoard`
- Receipts visible via `IntegrationReceiptDrawer` (durable from `oauth_refresh_probe_results`)
- Nightly verifier tracks `providers_reauth_required[]` per run
- `get_connector_refresh_streak_summary()` RPC surfaces 24h reauth count for the AI Engineer panel

## Admin AI Engineer scope

- **Canonical control surface:** stays at `/admin/integrations/oauth-refresh-health` (the `OAuthRefreshHealthBoard`)
- **AI Engineer tab:** `/admin/ai-runtime` → "Connector Truth" tab → read-only `ConnectorTruthSummaryPanel`
- The summary panel deep-links to the canonical board for any action — **zero duplicate dashboards**

## Zero-ambiguity proof

The `check-no-ambiguous-connected-state.ts` gate scans `src/pages/admin/**` and `src/components/admin/integrations/**` and fails CI if any hard-coded "Connected" string is rendered outside `ConnectorStateBadge`.
