

# SITA OS — Identity Auth vs Connector Auth Separation: Audit & Completion Plan

## Audit Summary: What's Already Built

The Identity Auth vs Connector Auth separation architecture is **95% built**. This is one of the most complete subsystems in the project.

### Fully Implemented and Working

| Component | Evidence |
|-----------|----------|
| **Type system** | `types.ts` — 198 lines: GoogleCapabilityKey, OAuth client purposes, scope tiers, connection/health/launch states |
| **Google Provider Family service** | `google-provider-family.service.ts` — queries 5 DB tables in parallel: provider_families, identity_provider_links, connected_service_links, oauth_client_registry, scope_policy_matrix |
| **Demo provider** | `google-demo-provider.ts` — 116 lines of governed demo data |
| **React hook** | `use-google-provider-family.ts` — dual-reality mode support |
| **User-facing GoogleConnectedAccounts** | 258-line page with Identity section, Connector cards, Status Summary, Launch Honesty |
| **SettingsPage "connected-accounts" tab** | Sign-in Identity card + Data Mode toggle + GoogleConnectedAccounts embedded |
| **Admin ISA01-ISA07** | All 7 Identity/Connector separation boards built, routed, querying real DB |
| **Admin PFA01-PFA10** | All 10 Provider Family boards built, routed |
| **Google Provider Family Dashboard** | Master admin dashboard |
| **Edge function** | `provider-family-operations` — seed, drift check, scope recommendation, graph report |
| **DB tables** | provider_families, provider_capabilities, oauth_client_registry, scope_policy_matrix, identity_provider_links, connected_service_links, consent_ledger, consent_revocations, consent_scope_records, permission_levels, permission_upgrade_requests, unified_account_nodes, unified_account_edges, auth_connector_separation_audits, integration_launch_honesty, permission_drift_records |
| **Core architectural rule** | `doesIdentityImplyConnector()` returns `false` — hardcoded, never changes |
| **Scope definitions** | Canonical Google scopes for identity, Drive, Gmail, Calendar with tiered access |
| **OAuth client templates** | 4 templates: identity_web, connector_web, mobile_ios, mobile_android |

### Remaining Gaps (5 items)

**Gap 1 — SettingsPage Connected Accounts lacks Consent & Permissions section**
The prompt requires Section C showing "what was granted, when, for what service, permission upgrades, revoke/reconnect controls." The SettingsPage `connected-accounts` tab has Sign-in Identity and GoogleConnectedAccounts but no consent history visible to users.

**Gap 2 — SettingsPage Connected Accounts lacks Device & Trusted Access section**
The prompt requires Section D showing "trusted phone, trusted watch, device-bound approval eligibility." The `devices` tab exists separately but is not integrated into the Connected Accounts center as a unified view.

**Gap 3 — No generic provider family types for Apple/Microsoft/Stripe/Slack**
Only Google has a full type system and service. Other providers mentioned in the prompt (Apple, Microsoft, Stripe, Slack, Dropbox) have no provider family service. The DB tables support them generically, but no typed client code exists for non-Google families.

**Gap 4 — No user-facing permission upgrade flow UI**
`PFA06PermissionUpgradeCenter` exists as admin, but there's no user-facing component allowing a user to request scope upgrades (e.g., upgrading Drive from read-only to read-write) from the Connected Accounts Center.

**Gap 5 — Connected Accounts Center doesn't show non-Google provider families**
The user-facing SettingsPage only shows GoogleConnectedAccounts. Other provider families (even if seeded in DB) have no user-facing cards or status displays.

## Implementation Plan

### Fix 1 — Add Consent & Permissions section to Connected Accounts tab
**File:** `src/pages/SettingsPage.tsx`
- After `<GoogleConnectedAccounts />`, add a `ConsentPermissionsCard` section
- Query `consent_ledger` joined with `provider_families` to show recent grants
- Show: service name, scopes granted, date, action type (grant/upgrade/revoke)
- Include revoke button (calls consent_revocations insert)
- Keep it compact — last 10 entries with "View all" link to admin

### Fix 2 — Add Device & Trusted Access section to Connected Accounts tab
**File:** `src/pages/SettingsPage.tsx`
- After consent section, add a `DeviceTrustCard` showing trusted devices from `connected_devices` table
- Show: device name, platform, trust level, last seen
- Link to full Devices tab for management
- This unifies the Connected Accounts Center per the prompt's Section D

### Fix 3 — Create generic ProviderFamilyTypes for multi-provider support
**New file:** `src/lib/services/provider-family/types.ts`
- Define generic `ProviderFamilyKey` union: `"google" | "apple" | "microsoft" | "stripe" | "slack" | "dropbox"`
- Define `GenericProviderFamilyState` interface (mirrors Google's but generic)
- Define `GenericConnectorState` for non-Google connectors
- Keep Google's typed service as the reference; others use generic types

### Fix 4 — Create AllProviderFamilies component for Connected Accounts
**New file:** `src/components/sita/AllProviderFamiliesStatus.tsx`
- Query `provider_families` + `connected_service_links` for all families
- Render compact status cards for each family (Google details handled by existing GoogleConnectedAccounts)
- For non-Google families: show family name, number of connected services, overall status
- Placeholder "Coming soon" for families with no capabilities seeded

### Fix 5 — Add user-facing permission upgrade request component
**New file:** `src/components/sita/PermissionUpgradeDialog.tsx`
- Modal/dialog for requesting scope upgrades on a connected service
- Shows current scope tier, requested tier, scope diff
- Inserts into `permission_upgrade_requests` table
- Updates `consent_ledger` on approval
- Triggered from connector cards in GoogleConnectedAccounts via upgrade button

### Fix 6 — Wire upgrade button in GoogleConnectedAccounts
**File:** `src/pages/settings/GoogleConnectedAccounts.tsx`
- When `connector.upgradeAvailable && connector.connectionStatus === "connected"`, make the existing `ArrowUpCircle` icon clickable
- Opens `PermissionUpgradeDialog` with current connector context

### Files Modified (2)
| File | Change |
|------|--------|
| `src/pages/SettingsPage.tsx` | Add Consent/Permissions + Device Trust sections to connected-accounts tab |
| `src/pages/settings/GoogleConnectedAccounts.tsx` | Wire upgrade button to PermissionUpgradeDialog |

### Files Created (3)
| File | Purpose |
|------|---------|
| `src/lib/services/provider-family/types.ts` | Generic provider family types for multi-provider support |
| `src/components/sita/AllProviderFamiliesStatus.tsx` | Multi-provider status cards for Connected Accounts |
| `src/components/sita/PermissionUpgradeDialog.tsx` | User-facing scope upgrade request flow |

### What This Achieves
- Connected Accounts Center becomes the "one beautiful place" the prompt demands — all 4 sections present
- Consent history visible to users, not just admins
- Device trust integrated into the account control center
- Permission upgrade flow exists for users, not just admin observation
- Multi-provider support scaffolded for Apple/Microsoft/Stripe/Slack
- Zero new DB tables, edge functions, or services — pure frontend wiring to existing schema

