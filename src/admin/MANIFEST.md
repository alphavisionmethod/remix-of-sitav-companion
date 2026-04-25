# `src/admin/` — Admin / Operator Plane (canonical home)

**Authority:** Constitution Rules 29–32.
**Model doc:** [`docs/architecture/ADMIN_PLANE_OWNERSHIP_MODEL.md`](../../docs/architecture/ADMIN_PLANE_OWNERSHIP_MODEL.md).
**Information architecture:** [`docs/architecture/ADMIN_INFORMATION_ARCHITECTURE.md`](../../docs/architecture/ADMIN_INFORMATION_ARCHITECTURE.md) (12-domain budget).

## What lives here

`src/admin/` owns the **canonical bodies** of admin/operator surfaces: page
modules, layouts, navigation, dashboards, operator consoles, and the workflows
that drive the operator control plane.

| Subfolder | Purpose |
|---|---|
| `components/` | Admin-specific React components (re-exports from `@/platform/admin/components/admin/**` until Wave 0.5 platform-relocation lands). |
| `hooks/` | Admin-only React hooks (e.g. `useBackendTopologyHealth`). |
| `modules/<domain>/views/` | **Canonical home for new admin page bodies.** One folder per IA domain. Pattern: `src/admin/modules/<domain>/views/<ViewName>.tsx`. |
| `navigation/` | Domain navigation tables and nav helpers. |
| `pages/` | Domain-grouped re-export barrels (`@/admin/pages/<group>`). |
| `redirects/` | Legacy → canonical admin route redirects. |
| `routes/` | Admin route barrel. |
| `shell/` | Admin shell composition. |
| `state/` | Admin-scoped global state. |

## How to add a new admin page (Rule 29 + 30)

1. Create the body at `src/admin/modules/<domain>/views/<NewView>.tsx` (use one of
   the 12 canonical domains from `ADMIN_INFORMATION_ARCHITECTURE.md`).
2. Re-export from the domain index: `src/admin/modules/<domain>/views/index.ts`.
3. Add a thin (≤10 line) re-export wrapper at `src/pages/admin/<domain>/<NewView>.tsx`:
   ```ts
   export { default } from "@/admin/modules/<domain>/views/<NewView>";
   ```
4. Wire the wrapper into `src/routes/AdminRoutes.tsx` via `lazy(() => import("@/pages/admin/<domain>/<NewView>"))`.
5. Run `npx tsx scripts/manifests/generate/generate-admin-plane-ownership-map.ts`
   to refresh the ownership map and ratchet baselines.

## Boundary rules (CI-enforced)

- ✅ `src/admin/**` MAY import from `src/platform/**`, `src/lib/**`, `src/components/ui/**`, contexts, hooks, contracts, integrations.
- ❌ `src/admin/**` MUST NOT import from `src/modules/<pillar>/**` (admin consumes pillar read-models via service facades, not page bodies).
- ❌ `src/platform/**` MUST NOT import from `src/admin/**`.
- ❌ `src/modules/<pillar>/**` MUST NOT import from `src/admin/**`.
- ✅ `src/pages/admin/**` MUST be thin re-export wrappers (≤10 logical lines) that target `@/admin/**`. Existing legacy page bodies are grandfathered and ratchet down over time.

Validators: `scripts/architecture/check-admin-plane-boundaries.ts`,
`scripts/architecture/check-admin-page-body-ratchet.ts` (both BLOCKING in
`foundation-gate.yml`).
