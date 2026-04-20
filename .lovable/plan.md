
## Diagnosis

User wants the **Connector capability completeness** gap closed in the real project. The audit observation is structurally accurate:

- `src/lib/connectors/` contains only abstract pieces (state grammar, reauth action types) — no concrete client surface.
- Concrete provider logic (Google, Microsoft, Slack, Plaid, Stripe, etc.) lives in `supabase/functions/` edge functions.
- The existing `check-connector-capability-completeness` gate (BLOCK gate #8 of 21) currently only validates the catalog count + manifest fields — it does NOT assert that every catalog connector has:
  1. A declared **capability surface** (which actions/scopes it implements)
  2. A **client-side typed binding** in `src/lib/connectors/` so app code doesn't reach into edge functions directly
  3. A **provider-to-edge-function mapping** so the catalog → runtime path is traceable

This is a real architectural gap: the catalog claims 12 connectors but there's no enforced bridge proving each one has a capability declaration + client binding + edge function backing.

## Strategy — additive, zero behavior change

### Step 1 — Capability manifest per connector (`src/lib/connectors/capabilities/`)
Create a typed capability declaration for each of the 12 catalog connectors:
- `gmail.capability.ts`, `google-calendar.capability.ts`, `google-drive.capability.ts`, `plaid.capability.ts`, `stripe.capability.ts`, `quickbooks.capability.ts`, `twilio.capability.ts`, `sendgrid.capability.ts`, `instacart.capability.ts`, `hubspot.capability.ts`, `slack.capability.ts`, `dropbox.capability.ts`
- Each exports a `ConnectorCapability` object: `{ connectorId, actions[], scopes[], edgeFunction, riskClass, status }`
- Plus a barrel `src/lib/connectors/capabilities/index.ts` registering all 12.

### Step 2 — Typed client binding surface (`src/lib/connectors/clients/`)
Create thin client bindings per connector that route to the correct edge function via `supabase.functions.invoke()`:
- `createGmailClient()`, `createSlackClient()`, etc.
- Pure routing layer — no business logic. Replaces ad-hoc `supabase.functions.invoke('some-name')` scattered in components.
- Barrel `src/lib/connectors/clients/index.ts`.

### Step 3 — Connector registry (`src/lib/connectors/registry.ts`)
Single source of truth that joins capability + client + catalog entry. Exposes `getConnector(id)` returning `{ capability, client, catalogEntry }`. This is what makes `src/lib/connectors/` a real surface instead of an empty shell.

### Step 4 — Strengthen the existing BLOCK gate
Extend `scripts/architecture/checks/check-connector-capability-completeness.ts` with three new assertions:
1. Every catalog connector has a corresponding `*.capability.ts` file.
2. Every capability declares a non-empty `actions[]` array and an `edgeFunction` reference.
3. Every capability's `edgeFunction` either exists in `supabase/functions/` OR is explicitly marked `status: 'planned'`.
4. Every non-planned connector has a client binding in `src/lib/connectors/clients/`.

Gate stays BLOCK-tier; just gets stricter. Does not change the 21-gate roster.

### Step 5 — Regenerate catalog + audit reconciliation
- Re-run `generate-connector-catalog` so it picks up the new capability files.
- Mark in all 4 audit mirrors: "Connector capability completeness — concrete client surface" → **RESOLVED 2026-04-20** with file refs.
- Preserve byte-identical mirror parity.

## What this does NOT touch
- Zero changes to existing edge functions (no provider behavior changes).
- Zero changes to existing connector state grammar / reauth action types in `src/lib/connectors/`.
- Zero changes to the 12 entries in `connector-catalog.json` (capability files mirror the existing IDs).
- No migrations, no RLS, no auth, no routes, no UI.
- Gate #8 stays the same id and BLOCK-tier — just gets internally stricter.

## Files touched

**New (~15):**
- `src/lib/connectors/capabilities/index.ts`
- `src/lib/connectors/capabilities/{gmail,google-calendar,google-drive,plaid,stripe,quickbooks,twilio,sendgrid,instacart,hubspot,slack,dropbox}.capability.ts` (12 files)
- `src/lib/connectors/clients/index.ts`
- `src/lib/connectors/registry.ts`
- `src/lib/connectors/types.ts` (shared `ConnectorCapability` type)

**Modified (5):**
- `scripts/architecture/checks/check-connector-capability-completeness.ts` (+4 assertions)
- `public/generated/MISSING_AUDIT.md` + `/mnt/documents/MISSING_AUDIT.md` (RESOLVED markers)
- `public/generated/MISSING_AUDIT_v2.md` + `/mnt/documents/MISSING_AUDIT_v2.md` (RESOLVED markers)

**Auto-regenerated (1):**
- `generated/connector-capability-completeness-report.json`

## Verification after approval

```bash
# Capability files exist for all 12 catalog connectors
ls src/lib/connectors/capabilities/*.capability.ts | wc -l   # 12

# Strengthened gate passes
npx tsx scripts/architecture/checks/check-connector-capability-completeness.ts   # 0 errors

# Master readiness still green (gate #8 of 21)
npm run release:readiness                                    # 21/21 BLOCK GREEN

# TypeScript clean
npx tsc --noEmit                                             # 0 errors

# Audit mirror parity
md5sum public/generated/MISSING_AUDIT.md /mnt/documents/MISSING_AUDIT.md         # identical
md5sum public/generated/MISSING_AUDIT_v2.md /mnt/documents/MISSING_AUDIT_v2.md   # identical
```

Result: `src/lib/connectors/` becomes a real, typed connector surface with capability declarations and client bindings for all 12 catalog connectors; the BLOCK-tier completeness gate now enforces capability + client + edge-function presence; all four audit mirrors record RESOLVED — without touching any live edge function or the 21-gate roster.
