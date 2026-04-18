
Let me first explore the relevant areas of the codebase to ground the plan in current truth.
<lov-tool-use id="toolu_vrtx_01X9a1iGAZuv9w8b7hWt24VL" name="code--list_dir" integration-id="code" data="{\"dir_path\": \"src/platform/architecture\"}">
</lov-tool-use>

<lov-tool-use id="toolu_vrtx_01G2HCvB45d7Z8RcL8yM2pCr" name="code--list_dir" integration-id="code" data="{\"dir_path\": \"os/profiles\"}">
</lov-tool-use>

<lov-tool-use id="toolu_vrtx_0131pzCRaupTXsSUpcDic6he" name="code--list_dir" integration-id="code" data="{\"dir_path\": \"src/components/mobile\"}">
</lov-tool-use>

<lov-tool-use id="toolu_vrtx_01SKe91b5GAE7rU42GjNsbGK" name="code--list_dir" integration-id="code" data="{\"dir_path\": \"src/shell-runtime\"}">
</lov-tool-use>

<lov-tool-use id="toolu_vrtx_014qokXvCT1qBvwRg7pkCwuE" name="code--list_dir" integration-id="code" data="{\"dir_path\": \"scripts/architecture/checks\"}">
</lov-tool-use>

<lov-tool-use id="toolu_vrtx_01KG5HYAEiM8ouhyqPH4bpNF" name="code--list_dir" integration-id="code" data="{\"dir_path\": \"src/platform/architecture\"}">
</lov-tool-use>

<lov-tool-use id="toolu_vrtx_01AYiTKJvrr3UVWazDCKhLno" name="code--list_dir" integration-id="code" data="{\"dir_path\": \"os/profiles\"}">
</lov-tool-use>

<lov-tool-use id="toolu_vrtx_01ArCAwwBJDQBVzR9HzEeMDt" name="code--list_dir" integration-id="code" data="{\"dir_path\": \"src/components/mobile\"}">
</lov-tool-use>

<lov-tool-use id="toolu_vrtx_019DuMGtXQwZNT124tBva53J" name="code--list_dir" integration-id="code" data="{\"dir_path\": \"src/shell-runtime\"}">
</lov-tool-use>

<lov-tool-use id="toolu_vrtx_01BPXtNQG2kqJ5L7Y85Gr3tp" name="code--list_dir" integration-id="code" data="{\"dir_path\": \"scripts/architecture/checks\"}">
</lov-tool-use>

<lov-tool-use id="toolu_vrtx_012YyhEhi76FJdYdFQ5RzHjm" name="code--view" integration-id="code" data="{\"file_path\": \"src/platform/architecture/app-plane-map.ts\"}">
</lov-tool-use>
I have enough context to present a focused, evidence-driven plan. Let me check a couple more critical artifacts.
<lov-tool-use id="toolu_vrtx_011kxuZSMYJnqfDxmT6eGSQb" name="code--list_dir" integration-id="code" data="{\"dir_path\": \"src/pages/mobile\"}">
</lov-tool-use>

<lov-tool-use id="toolu_vrtx_01DmUTiLqWvRVYjaABJSXReH" name="code--search_files" integration-id="code" data="{\"query\": \"localStorage\", \"include_patterns\": \"src/**/mobile*/**/*.ts,src/**/mobile*/**/*.tsx,src/hooks/useMobile*.ts\"}">
</lov-tool-use>

<lov-tool-use id="toolu_vrtx_0171hdF6AWafWh9FQ6K5Ku5H" name="code--view" integration-id="code" data="{\"file_path\": \"os/profiles/operator.profile.json\"}">
</lov-tool-use>
I have enough context. Presenting the plan now.

<lov-plan>
## Plan: App Registry, Launcher Truth, Mobile Hardening, Profile Separation

### Evidence-driven, 5 phases. Read-only audits first, then minimal targeted fixes, then guardrails.

---

### Phase A — Evidence Maps (read-only, no code changes)

Create `scripts/architecture/audits/generate-runtime-evidence-maps.ts` to emit 4 JSON evidence files into `generated/profile-and-runtime-hardening/`:

1. **`app-registry-map.json`** — every entry in `APP_PLANE_MAP` cross-referenced with:
   - Route resolution (does its expected route exist in `src/routes/**`?)
   - Profile manifests (`os/profiles/{user,operator}.profile.json` `allowedApps[]` arrays)
   - Launcher visibility (`launcher-profile.ts` filter results for both profiles)
   - Command palette visibility (`command-profile.ts` filter results)
   - Drift flags: `missing-route`, `not-in-profile-manifest`, `manifest-app-not-in-map`, `pinned-but-not-allowed`

2. **`app-route-profile-map.json`** — for every `<Route path>` declared under `src/routes/**`:
   - Owning plane (from `route-plane-map.ts`)
   - Allowed profiles
   - Whether it's app-backed (matches an `APP_PLANE_MAP` entry) or hidden app-like (looks like an app surface but unregistered: heuristic = top-level route with shell layout + 3+ subviews)
   - Guard component wrapping it (`AdminRoute`, `PermissionGatedRoute`, none)

3. **`mobile-capability-map.json`** — scan all 25 files in `src/pages/mobile/` + `src/components/mobile/` + mobile hooks/services. For each:
   - Persistence model (localStorage / IndexedDB / Supabase / none)
   - Auth/biometric usage (WebAuthn, Capacitor biometric, none)
   - Search wiring (real source vs static)
   - Offline queue presence
   - Classification: `live` / `partial` / `responsive-only` / `mock` / `planned`

4. **`profile-separation-map.json`** — graph analysis:
   - Routes exposed in the user profile that import admin-only modules (transitive, 1-hop through shared)
   - Shared components (under `src/components/`, `src/shell-runtime/`) that import from `src/admin/**` or `src/pages/admin/**`
   - Profile manifest `allowedApps[]` ↔ `APP_PLANE_MAP.profiles[]` mismatches
   - Launcher/palette entries surfaced when they shouldn't be (run filter functions for both profiles)

**Deliverable:** 4 JSON maps + 4 audit Markdown reports (`APP_REGISTRY_AND_LAUNCHER_AUDIT.md`, `MOBILE_RUNTIME_READINESS_AUDIT.md`, `MOBILE_CAPABILITY_TRUTH_MAP.md`, `USER_OPERATOR_PROFILE_SEPARATION_AUDIT.md`, plus `APP_ROUTE_PROFILE_CROSSMAP.md`, `SHARED_COMPONENT_PROFILE_LEAKAGE.md`, `ROUTE_GUARD_AND_ACCESS_COVERAGE.md`). **Zero code changes.**

---

### Phase B — Guardrail Checks (additive, warn-level first)

Add 8 new CI checks under `scripts/architecture/checks/`, all warn-level on first run:

| Check | Purpose |
|---|---|
| `check-launcher-registry-completeness.ts` | Every `APP_PLANE_MAP` entry has a resolvable route + appears in declared profile manifests |
| `check-app-profile-matrix.ts` | `APP_PLANE_MAP.profiles[]` ↔ `os/profiles/*.json allowedApps[]` parity |
| `check-hidden-app-routes.ts` | Top-level shell-mounted routes with no `APP_PLANE_MAP` entry |
| `check-mobile-capability-truth.ts` | Mobile features marked "live" must have real persistence/auth/search backing |
| `check-profile-route-coverage.ts` | Every route's plane allowed by at least one profile manifest |
| `check-command-palette-profile-leakage.ts` | Operator-only entries never returned by user-profile palette filter |
| `check-shared-component-profile-pollution.ts` | Files under `src/components/`, `src/shell-runtime/` cannot import from `src/admin/**` |
| `check-route-guard-coverage.ts` | Every `admin` plane route is wrapped by `AdminRoute` or `PermissionGatedRoute` |

All start warn-level with budgets equal to current discovered counts (baselined). No build break on first run.

---

### Phase C — Targeted Structural Fixes (only what Phase A proves)

Based on `app-registry-map.json` drift flags:
- **Add missing `APP_PLANE_MAP` entries** for hidden app-like routes (or explicitly mark them `launcherVisible: false, commandVisible: false` if they're internal sub-surfaces, not apps)
- **Fix manifest mismatches**: align `os/profiles/user.profile.json allowedApps[]` and `operator.profile.json allowedApps[]` with `APP_PLANE_MAP.profiles[]` (single source of truth = `APP_PLANE_MAP`; manifest gets regenerated)
- **Add `roleRequired` to operator apps** that lack it
- **Fix any stale route targets** by updating the route value or the registry entry

For profile leakage (only if `profile-separation-map.json` proves real violations):
- Move polluted shared components to plane-correct locations OR introduce adapter interfaces
- Add missing `AdminRoute` / `PermissionGatedRoute` wrappers around any unguarded admin routes

For mobile (decision-gated by `mobile-capability-map.json`):
- **Honest classification first:** add `mobile-feature-truth-registry.ts` declaring each mobile feature as `live` / `partial` / `responsive-only` / `planned`
- **Quick wins only** in this wave:
  - Wire mobile search to existing global search service (if not already)
  - Replace any `localStorage`-based offline queue with IndexedDB-backed wrapper using existing `NovaFS` if applicable
  - Add `MobileCapabilityBanner` to surfaces classified `partial` so users see honest status
- **Defer (with truth labels):** APNs/FCM push, biometric WebAuthn enrollment — already documented as deferred in mobile-store-readiness; keep that posture

**Decision gates** before C executes:
- If hidden app routes exist → register them in `APP_PLANE_MAP`, do NOT delete
- If profile leakage exists in shared shell → adapter pattern, do NOT split shared shell
- If mobile features are partial → truth-label them, do NOT silently downgrade

---

### Phase D — Verification & Graduation

1. Run full 8 new checks + existing 14 architectural gates + `tsc --noEmit`
2. Emit `FINAL_VERIFICATION_RESULTS.md` and `verification-results.json`
3. Where Phase C cleanly resolves a check to zero, graduate it to **block-level** (matches the established Phase B5 ratchet pattern):
   - `check-shared-component-profile-pollution.ts` → block at 0
   - `check-command-palette-profile-leakage.ts` → block at 0
   - `check-app-profile-matrix.ts` → block at 0 once manifests realigned

---

### Phase E — Reports (final deliverables)

All under `generated/profile-and-runtime-hardening/`:

```
APP_REGISTRY_AND_LAUNCHER_AUDIT.md
APP_ROUTE_PROFILE_CROSSMAP.md
MOBILE_RUNTIME_READINESS_AUDIT.md
MOBILE_CAPABILITY_TRUTH_MAP.md
USER_OPERATOR_PROFILE_SEPARATION_AUDIT.md
SHARED_COMPONENT_PROFILE_LEAKAGE.md
ROUTE_GUARD_AND_ACCESS_COVERAGE.md
HARDENING_REMEDIATION_PLAN.md
FINAL_VERIFICATION_RESULTS.md
app-registry-map.json
app-route-profile-map.json
mobile-capability-map.json
profile-separation-map.json
verification-results.json
```

---

### What this plan explicitly will NOT do
- ❌ Mark mobile as "production-ready" globally — only honestly classify per-feature
- ❌ Remove apps from launcher without a registered canonical replacement
- ❌ Split shared shell components unless leakage is graph-proven
- ❌ Add fake biometric/push implementations to inflate scores
- ❌ Touch `/files` or other intentionally-shared routes
- ❌ Promote new checks to block-level on first run
- ❌ Edit `src/integrations/supabase/{client,types}.ts` or `.env`

### What changes vs prior plans
- Mobile is treated as a **runtime**, not a responsive surface — capability classification is mandatory
- Single source of truth for app/profile mapping = `APP_PLANE_MAP`; manifests align to it
- Profile separation is proven via **graph analysis** (transitive imports), not just direct
- All check budgets are baselined from real evidence in Phase A — no guesses

### Ship order
```
A (evidence, ~5 min, additive)
   ↓
B (8 guardrails warn-level, ~5 min, additive)
   ↓
C (targeted fixes — scope = Phase A evidence only)
   ↓
D (verify + graduate stable checks to block)
   ↓
E (final reports + deployment certificate update)
```

After approval I execute A → B → C → D → E in a single wave.
