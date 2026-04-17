

## Plan: Real App Platform — package format, trust, sandbox, auto-ingestion, native bridge

Today's catalog is real (28 apps, 6 tables, install/launch/permissions). What's missing for "real platform": package format + signing, sandbox/permission engine, SDK contracts, **auto-ingestion of web/PWA metadata + icons**, publisher/trust schema, native bridge in Electron, update channels, asset storage. This plan implements all of it, deploy-ready.

### Phase 1 — Database (1 migration)

New tables (RLS on all):
- `publishers` — id, slug, name, verified, trust_tier, website, support_email, owner_user_id
- `publisher_keys` — id, publisher_id, key_id, public_key, algorithm (`ed25519`), revoked_at
- `app_assets` — id, app_id, asset_type (`icon`|`apple_touch_icon`|`screenshot`|`og_image`|`manifest`|`package`), storage_path, source_url, width, height, mime_type, checksum
- `app_packages` — id, app_id, version, package_type (`sita-web`|`pwa-link`|`native-link`), package_url, checksum, size_bytes, signature_metadata (jsonb), runtime_target, channel, created_at
- `app_ingestion_jobs` — id, source_url, job_type (`web`|`pwa`|`screenshot`|`native_meta`), status, result_json, error_json, requested_by, timestamps
- `app_signatures` — id, app_id, package_id, publisher_key_id, signature, verified_at, status
- `app_update_channels` — id, app_id, channel (`stable`|`beta`|`dev`), latest_version, published_at
- `app_trust_records` — id, app_id, source_kind, score, badge, evaluated_at

Extend `apps`: add `publisher_id`, `runtime_target`, `min_platform_version`, `default_channel`, `manifest_json`. Extend `installed_apps`: add `package_id`, `update_channel`, `last_update_check_at`.

Storage bucket: **`app-assets`** (public read, authenticated write via edge functions only). Folders: `icons/`, `screenshots/`, `manifests/`, `packages/`.

### Phase 2 — Package format + trust + sandbox (pure libs, no UI)

`src/lib/app-platform/`
- `package-format.ts` + `package-schema.ts` (Zod) — manifest spec from prompt §4
- `package-validator.ts` — schema + checksum + size + runtime-target checks
- `signing.ts` — ed25519 verify (Web Crypto), key resolution via `publisher_keys`
- `trust.ts` — tier resolver: `internal` > `verified-publisher` > `trusted-domain` > `unverified`
- `publisher-verification.ts` — domain verification (DNS TXT model + manual override)
- `sandbox.ts` + `permission-engine.ts` — gate for SDK calls, per-app permission map
- `runtime-boundaries.ts` — allowed APIs per app type (web/pwa/native/internal/packaged)
- `sdk.ts` + `host-api.ts` — typed SDK surface (`openWindow`, `requestPermission`, `readFile`, `emitNotification`, `getCurrentUser`, `getHostCapabilities`, `registerDeepLink`, `persistAppState`)

### Phase 3 — Auto-ingestion (the missing piece — real, not manual)

**4 edge functions** (admin-callable from store + auto-triggered on submit):
- `app-ingest-web` — fetches URL, parses HTML for `<title>`, `<meta name="description">`, `<meta property="og:*">`, `<meta name="theme-color">`, `<link rel="icon">`, `<link rel="apple-touch-icon">`, `<link rel="manifest">`. Resolves relative URLs, downloads icons, uploads to `app-assets`, writes `app_assets` rows.
- `app-ingest-pwa` — fetches `manifest.json`, parses `name`/`short_name`/`icons[]`/`start_url`/`display`/`theme_color`/`background_color`/`scope`, downloads all icon sizes, normalizes.
- `app-icon-normalize` — resizes/squares/optimizes icons to 64/128/256/512 PNG using a WASM image lib (e.g. `@jsquash/png` + `@jsquash/resize` from esm.sh — works in Deno).
- `app-screenshot-capture` — uses an external screenshot API (Microlink free tier or Browserless if `BROWSERLESS_API_KEY` is later added) — degrades honestly if no key, marks job `degraded` with reason.

`src/lib/services/app-ingestion/` — client wrappers + React Query hooks (`useIngestWebApp`, `useIngestPwa`, `useIngestionJob`).

### Phase 4 — Update + launch + native bridge

- `supabase/functions/app-update-check` — compares installed `version_installed` against `app_update_channels.latest_version`, returns update plan.
- `supabase/functions/package-verify` — re-verifies signature + checksum on demand.
- Extend `src/lib/services/app-store/launch.service.ts` to consult `runtime_target`, `permissions`, and trust.
- **Electron bridge** (`electron/preload.cjs` + `electron/main.cjs`): allowlisted native-app launch (Chrome, VS Code, Spotify, WhatsApp Desktop, Cursor, Notion, Figma) via `child_process.spawn` with hardcoded binary paths per platform. Detection via `fs.existsSync` on standard install dirs. Web fallback when not in Electron.
- `src/lib/services/native-apps/{registry,detection,launch}.ts` — typed registry + `window.electron?.nativeApps` bridge.

### Phase 5 — Store UI wiring (no new pages, wire what exists)

- `src/components/app-store/AppDetailView.tsx` — show trust badge, publisher, package version, channel, permissions list (from `permission-engine`), screenshots from `app_assets`.
- New `src/components/app-store/admin/IngestUrlDialog.tsx` — admin-only "Add app from URL" — calls `app-ingest-web` / `app-ingest-pwa`, shows job progress, on success creates draft `apps` row with auto-discovered name/icon/description.
- New `src/components/app-store/PublisherBadge.tsx` — verified/internal/trusted/unverified visual.
- Wire **Update Center** page to new `useAppUpdates` (already exists) → real `app-update-check` results.
- Wire **Permissions** page to real `permission-engine.listForApp(appId)`.

### Phase 6 — Tests (Deno + Vitest)

- `package-validator.test.ts` — accepts valid, rejects each invalid field
- `signing.test.ts` — verifies real ed25519 signature, rejects tampered
- `trust.test.ts` — tier resolution matrix
- `permission-engine.test.ts` — grant/revoke/check
- `launch-resolver.test.ts` — picks correct runtime per app type
- `app-ingest-web.test.ts` (Deno) — parses fixture HTML, extracts icons + OG
- `app-ingest-pwa.test.ts` (Deno) — parses fixture manifest

### Files

**New (~32)**
- 1 migration, 1 storage bucket migration
- 8 libs in `src/lib/app-platform/`
- 4 edge functions (`app-ingest-web`, `app-ingest-pwa`, `app-icon-normalize`, `app-screenshot-capture`) + 2 (`app-update-check`, `package-verify`)
- 3 services in `src/lib/services/native-apps/`
- 4 services/hooks in `src/lib/services/app-ingestion/` + `src/hooks/use-app-ingestion.ts`
- 3 UI components (IngestUrlDialog, PublisherBadge, AssetGallery)
- 7 test files

**Edited (~6)**
- `src/lib/services/app-store/launch.service.ts` — runtime_target + trust
- `src/lib/services/app-store/update.service.ts` — call new edge function
- `src/components/app-store/AppDetailView.tsx` — trust + permissions + screenshots
- `electron/main.cjs` + `electron/preload.cjs` — native bridge IPC
- `src/hooks/use-app-platform.ts` — add update/ingestion hooks

### Honest degradations (called out in code)
- **Screenshot capture**: needs `BROWSERLESS_API_KEY` or falls back to Microlink free tier (limited rate). If neither available → job marked `degraded`, store shows "Screenshot pending".
- **Native app detection**: only works in Electron host; web shows "available externally — desktop required".
- **ed25519**: real verification via Web Crypto; publisher onboarding UI is admin-only first pass (schema/flow real).
- **Package install**: schema + verify pipeline real; actual sandboxed execution of third-party packages is architected but the runtime executor ships as `internal-only` allowlist (no arbitrary remote code execution — security boundary).

### Acceptance
- Admin pastes a URL → real icons + metadata fetched and stored in `app-assets` bucket → new app appears in catalog with correct icon/name/description
- Trust badge visible on every app detail (internal / verified / trusted-domain / unverified)
- Update Center shows real diff between installed and channel-latest
- Permission list per app shows real granted/required permissions
- Native apps launch via Electron when present; degrade to web fallback otherwise
- Package signature verification works against a seeded ed25519 publisher key
- All 7 tests pass; 0 TS errors; RLS on every new table

