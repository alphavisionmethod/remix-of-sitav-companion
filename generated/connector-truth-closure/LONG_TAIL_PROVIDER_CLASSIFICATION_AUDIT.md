# Long-Tail Provider Classification Audit

_Phase G audit._ Confirms providers outside `{google, microsoft, slack}` are unambiguously labeled as manual.

## Live OAuth providers (real refresh proven)

- `google`
- `microsoft`
- `slack`

These 3 are exercised every night by `connector-refresh-nightly-verify` against real provider endpoints.

## Long-tail providers (manual / API-key / non-refreshable)

All entries in `connector_registry` whose `provider` is not one of the 3 above. They MUST surface as `manual` in UI.

## Enforcement

- `check-long-tail-provider-classification.ts` queries the `connector_registry` table and asserts every row not in `{google, microsoft, slack}` has either:
  - `auth_method != 'oauth2'` OR
  - `refresh_supported = false` OR
  - is rendered with `<ConnectorStateBadge state="manual" />` in its UI surface

- The gate fails CI if any long-tail provider is granted `connected` styling.

## UI honesty principle

Long-tail providers must NOT inherit the "live OAuth proven" credibility of Google / Microsoft / Slack. The canonical `ConnectorStateBadge` enforces this through the `manual` state's neutral tone — visually distinct from `connected` (success tone).

## Public claims

- `docs/REAL_VS_SIMULATED.md` — already classifies these honestly
- Marketing/store copy — must qualify any "35+ connectors" claim with "3 OAuth-live, others manual setup"
