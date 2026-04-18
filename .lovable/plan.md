

User wants Part 2 architecture work, but I just shipped exactly this in the previous turn (5 phases approved, all files created, readiness YELLOW). Re-implementing would duplicate. Better: audit what's actually there vs. what this prompt asks for, identify real gaps, propose a tight delta plan.

Let me check what exists.

Already shipped (confirmed from history + visible files):
- `os/profiles/{user,operator}.profile.json` + `profile.schema.json` ✅
- `src/lib/architecture/plane-registry.ts` ✅
- `src/lib/architecture/route-plane-map.ts` ✅
- `src/lib/runtime/deployment-profile.ts` ✅
- `src/runtimes/shell/ShellComposer.tsx` ✅
- `src/lib/admin/admin-workflow-registry.ts` ✅ (8 workflows)
- `os/image-builder/build.sh --profile=user|operator` ✅
- `.github/workflows/os-build-iso.yml` matrix build ✅
- 7 docs (CORE_OS_USER_ADMIN_BACKEND_MODEL, DEPLOYMENT_PROFILES, USER_PROFILE_DEPLOYMENT, OPERATOR_PROFILE_DEPLOYMENT, SHARED_VS_PROFILE_SPECIFIC_COMPONENTS, ADMIN_CONTROL_PLANE_GOLDEN_PATHS, ROUTE_AND_APP_PLANE_MAP) ✅
- 3 CI gates: check-5-plane-boundaries, check-route-plane-coverage, check-deployment-profile-coverage ✅
- `generated/{5-plane-boundaries,deployment-profile-coverage,route-plane-coverage}-report.json` ✅
- `PlaneBoundaryGuard` updated to 5-plane keys with shim ✅

Real gaps from Part 2 prompt (not yet shipped):
1. **App-plane map** — only route-plane-map exists; app registry entries don't yet declare `plane` + `profiles[]` fields. Prompt explicitly asks for `src/lib/app-plane-map.ts` + `generated/app-plane-map.json`.
2. **Profile-aware launcher composition** — launcher reads `allowedApps` from profile manifest but no `launcher-profile.ts` or visible filtering in launcher UI yet.
3. **Profile-aware command palette / search** — commands aren't filtered by profile.
4. **Profile-aware settings sections** — settings page doesn't hide operator-only sections in user profile.
5. **Generated profile composition reports** — `generated/profile-composition-{user,operator}.json` + `profile-visibility-report.json` + `operator-readiness-report.json` + `user-profile-readiness-report.json` not yet emitted.
6. **`docs/os/BUILD_AND_RELEASE_PROFILES.md`** — referenced in prompt §11, not yet created.
7. **Operator workflow landing page** — `AdminControlPlaneShell` has 8-workflow nav but no dedicated `/admin` operator-home that surfaces "open incidents / release gate status / trust alerts / support queue" as first view (prompt §7.2).
8. **Profile injection into Electron runtime** — `electron/main.cjs` doesn't yet read `/etc/sita/deployment-profile.json` and inject into `window.__SITA_DEPLOYMENT_PROFILE__` (the runtime reader expects it but preload doesn't populate it).
9. **Support bundle capturing active profile** — `os/scripts/generate-support-bundle.sh` doesn't include `deployment-profile.json`.
10. **CI profile-aware readiness** — `os-release-readiness-report.json` was updated to per-profile, but no separate `operator-readiness-report.json` / `user-profile-readiness-report.json` artifacts.

Plan: tight delta, 4 phases, each independently deployable. No duplication of Phase 1-5 already shipped.

## Part 2 Delta — App-Plane Wiring + Profile-Aware Composition + Generated Reports

### Phase A — App-Plane Map & Launcher Composition
- `src/lib/architecture/app-plane-map.ts` — every app id → `{ plane, profiles[], roleRequired, launcherVisible, defaultPinned }`. Single source of truth, no fork of existing app registry.
- `src/shell-runtime/launcher-profile.ts` — pure helper: `filterAppsForProfile(apps, profile, role)`. Reused by launcher, command palette, app store.
- Update existing launcher component to call `filterAppsForProfile()` — no new launcher; just one filter hook plugged in.
- Update existing app store grid to respect profile visibility.
- `scripts/architecture/checks/check-app-plane-coverage.ts` — fails CI if any app in registry lacks plane/profile assignment.
- `generated/app-plane-map.json` — emitted from check.

### Phase B — Profile-Aware Command Palette, Settings, Search
- `src/shell-runtime/command-profile.ts` — filters command palette entries by `profile + role`.
- `src/shell-runtime/settings-profile.ts` — filters settings sections (operator-only sections hidden in user profile).
- Wire both into existing command palette + settings page (no duplication; minimal call-site changes).
- Same for search results scoping (respect plane visibility).

### Phase C — Operator Home Landing + Electron Profile Injection
- `src/pages/admin/OperatorHome.tsx` — workflow-first landing surfacing: open incidents, release gate status, verification alerts, support queue, kill-switch posture. Reuses existing widgets from the 8 workflow pages — composition only, zero new business logic.
- Wire `/admin` route to render `OperatorHome` for operator profile (user profile keeps existing admin behavior gated by role).
- `electron/preload.cjs` (update) — read `/etc/sita/deployment-profile.json` at startup, expose as `window.__SITA_DEPLOYMENT_PROFILE__` so the runtime reader works in packaged Electron.
- `os/scripts/generate-support-bundle.sh` (update) — include `deployment-profile.json` + active profile id in bundle metadata.

### Phase D — Generated Composition/Readiness Reports + Final Doc
- `scripts/architecture/checks/emit-profile-composition.ts` — emits:
  - `generated/profile-composition-user.json`
  - `generated/profile-composition-operator.json`
  - `generated/profile-visibility-report.json`
  - `generated/operator-readiness-report.json`
  - `generated/user-profile-readiness-report.json`
- All derived from real registries (plane-registry, app-plane-map, route-plane-map, profile manifests). No hand-authored JSON.
- Wire emitter into `.github/workflows/native-readiness.yml` + `check-os-release-readiness.ts` aggregator.
- `docs/os/BUILD_AND_RELEASE_PROFILES.md` — final missing canonical doc (build commands, CI matrix, signing, attestation per profile).

### Constraints reaffirmed
- Reuse existing `plane-registry`, `route-plane-map`, `admin-workflow-registry`, `AdminControlPlaneShell`, image builder, Electron host. **Zero forks.**
- No new launcher, no new command palette, no new settings page, no new admin shell — only filter helpers + call-site wiring.
- App registry rows untouched; new `app-plane-map.ts` is a sidecar that the existing registry resolves against.
- All new generated reports come from validation scripts, not authored.

### Files (scope summary)
- **Create code (8):** app-plane-map.ts, launcher-profile.ts, command-profile.ts, settings-profile.ts, OperatorHome.tsx, check-app-plane-coverage.ts, emit-profile-composition.ts, (1 small filter wiring helper if needed)
- **Update (4):** existing launcher component, command palette, settings page, electron/preload.cjs + os/scripts/generate-support-bundle.sh
- **Create generated (5):** app-plane-map.json, profile-composition-{user,operator}.json, profile-visibility-report.json, operator-readiness-report.json, user-profile-readiness-report.json
- **Create docs (1):** BUILD_AND_RELEASE_PROFILES.md
- **CI updates (2):** native-readiness.yml + check-os-release-readiness.ts wire new emitter & gate

Result: Part 2 prompt is fully satisfied without re-shipping Phase 1-5 (which is already in the repo and validated YELLOW). System remains deploy-ready for both `sita-os-user` and `sita-os-operator` artifacts with end-to-end profile-aware composition.

