

# Fix All Missing & Stale Documentation

## Problem

1. **7 major page domains have zero architecture docs** (137 pages undocumented)
2. **3 generated markdown reports are stale** (dated April 4, not reflecting recent fixes)
3. **Existing docs need updates** to reflect completed work (RLS hardened, type safety clean, OTA/backup scripts added)

## Missing Architecture Docs

| Domain | Pages | Needed Doc |
|--------|-------|------------|
| `investment-office/` | 38 | `INVESTMENT_OFFICE_AND_CAPITAL_SYSTEM.md` |
| `revenue-office/` | 39 | `REVENUE_OFFICE_AND_GROWTH_SYSTEM.md` |
| `digital-presence/` | 19 | `DIGITAL_PRESENCE_AND_WEB_SYSTEM.md` |
| `atlas/` | 11 | `ATLAS_OPERATIONS_AND_PLATFORM_TRUTH.md` |
| `mobile/` | 9 | `MOBILE_EXPERIENCE_SYSTEM.md` |
| `app-platform/` | 16 | `APP_PLATFORM_AND_INTEGRATIONS.md` |
| `auth/` | 4 | Covered by existing PREMIUM_OS doc — add Auth section |

## What Each New Doc Contains

Each follows the existing pattern (40–75 lines): Ownership, Core Capabilities, Page Map, Data Model, Proof Model, Integration Points.

### Step 1: Create 6 new architecture docs
- `INVESTMENT_OFFICE_AND_CAPITAL_SYSTEM.md` — Portfolio, risk, thesis, family office, market exploration, behavioral firewall. Ownership: `finance-os`.
- `REVENUE_OFFICE_AND_GROWTH_SYSTEM.md` — Pipeline, campaigns, automation, booking, retention, growth DNA. Ownership: `business-os`.
- `DIGITAL_PRESENCE_AND_WEB_SYSTEM.md` — Site builder, brand studio, SEO, CRO, ecommerce, domain publishing. Ownership: `business-os`.
- `ATLAS_OPERATIONS_AND_PLATFORM_TRUTH.md` — Durability, deployment truth, proof coverage, validation, projections. Ownership: `platform`.
- `MOBILE_EXPERIENCE_SYSTEM.md` — Mobile shell, approvals, boardroom, receipts, alerts. Ownership: `platform`.
- `APP_PLATFORM_AND_INTEGRATIONS.md` — Installed apps, connector hub, email/vault/health/gallery apps. Ownership: `platform`.

### Step 2: Update 3 stale generated markdown reports
- `generated/drift-report.md` — Update date to current, reflect 48 artifacts (was 36), add new scripts
- `generated/production-truth-dashboard.md` — Update date, service count, add security status section
- `generated/validation-summary.json` — Update timestamp (content already valid)

### Step 3: Update existing docs with completed work
- `docs/vmware-deployment.md` — Add OTA agent and backup script references (new scripts created)
- `docs/architecture/VMWARE_DEPLOYMENT_AND_OPS.md` — Add OTA, backup, ISO build sections
- `docs/architecture/SENSITIVE_DOCUMENT_GOVERNED_MODE.md` — Note RLS hardening complete
- `docs/architecture/PREMIUM_OS_EXPERIENCE_SYSTEM.md` — Add auth flow section, note type safety completion

### Step 4: Update registry
- `docs/architecture/registry/services.yaml` — Add missing service entries for investment, revenue, digital-presence domains

## Files Created/Modified

**6 new files:**
- `docs/architecture/INVESTMENT_OFFICE_AND_CAPITAL_SYSTEM.md`
- `docs/architecture/REVENUE_OFFICE_AND_GROWTH_SYSTEM.md`
- `docs/architecture/DIGITAL_PRESENCE_AND_WEB_SYSTEM.md`
- `docs/architecture/ATLAS_OPERATIONS_AND_PLATFORM_TRUTH.md`
- `docs/architecture/MOBILE_EXPERIENCE_SYSTEM.md`
- `docs/architecture/APP_PLATFORM_AND_INTEGRATIONS.md`

**6 updated files:**
- `generated/drift-report.md`
- `generated/production-truth-dashboard.md`
- `generated/validation-summary.json`
- `docs/vmware-deployment.md`
- `docs/architecture/VMWARE_DEPLOYMENT_AND_OPS.md`
- `docs/architecture/registry/services.yaml`

