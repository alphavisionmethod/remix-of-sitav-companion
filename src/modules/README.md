# SITA OS — 4-Module Architecture

This directory is the **canonical top-level organizing structure** for SITA OS.
Every meaningful product surface, service, and feature belongs to exactly one of:

| Module        | Path                       | Owner Domain                                          | Route Group        |
| ------------- | -------------------------- | ----------------------------------------------------- | ------------------ |
| Business OS   | `src/modules/business/`    | CRM · Sales · Quotes · Lead recovery · Ads · Support  | `/business/*`      |
| Concierge OS  | `src/modules/concierge/`   | Travel · Bookings · Household · Life admin · Errands  | `/concierge/*`     |
| Finance OS    | `src/modules/finance/`     | Budget · Cash · Investments · Tax · Net worth         | `/money/*` (alias `/finance/*`) |
| Health OS     | `src/modules/health/`      | Nutrition · Wearables · Medical · Fitness · Recovery  | `/health/*` (greenfield) |
| Trust Layer   | `src/platform/trust/`      | Receipts · Approvals · Permissions · Authority · Audit | `/trust/*`        |
| Shared        | `src/platform/*` (ai, knowledge, workspace, registry) | Shell · Identity · AI · Voice · Memory · Notifications | n/a (cross-cut)  |

## Constitutional Rules

1. **One parent per feature.** If a feature spans modules, it lives in `@/platform/*` (formerly `_shared`/`_trust`), never duplicated.
2. **Sub-apps stay nested.** Investment is a sub-app of Finance OS. Nutrition is a sub-app of Health OS. CRM is a sub-app of Business OS. Travel is a sub-app of Concierge OS. Their routes nest under the parent (`/money/investment-office/*`, etc.).
3. **Trust is platform.** Receipts, approvals, permissions, audit logs, automation authority — all live in `@/platform/trust` and are surfaced through `/trust/*`. Modules **call** the trust layer; they never reimplement it.
4. **Shared is leaf-only.** `@/platform/*` may not import from any module; modules import from `@/platform/*`.
5. **Validators are mandatory.** `scripts/architecture/check-module-ownership.ts` enforces these boundaries in CI.

**Wave 9 note:** The legacy folders `src/modules/_shared/` and `src/modules/_trust/` were removed after all consumers migrated to their canonical `@/platform/*` homes.

See `/mnt/documents/SITA OS Re-Architecture Blueprint.md` for the full audit, ownership map, and migration plan.