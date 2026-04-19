# SITA OS — Mobile Env & Secret Strategy Audit

**Generated:** Phase 3 of Mobile Identity Reconciliation
**Question:** where do mobile-related environment variables and secrets live, and is the boundary clean?
**Answer:** four-zone model (Lovable env / GitHub Actions secrets / Supabase function secrets / Apple+Google credential stores), no zone-crossing leaks.

---

## 1. The Four Zones

| Zone | Lives where | Examples | Available to |
|---|---|---|---|
| **Zone 1: Lovable web env** | auto-managed `.env`, surfaced as `import.meta.env.VITE_*` | `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID` | web SPA at runtime (visible to users — must be safe to expose) |
| **Zone 2: GitHub Actions secrets** | `Settings → Secrets and variables → Actions` (workspace level) | `ANDROID_KEYSTORE_PATH`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`, `ANDROID_PACKAGE_NAME`, `APPLE_TEAM_ID`, `APPLE_PROVISIONING_PROFILE_BASE64`, `APPLE_DISTRIBUTION_CERT_P12_BASE64`, `APPLE_DISTRIBUTION_CERT_PASSWORD`, `APP_STORE_CONNECT_API_KEY_ID`, `APP_STORE_CONNECT_API_ISSUER_ID`, `APP_STORE_CONNECT_API_KEY_P8_BASE64` | CI signing/release scripts only |
| **Zone 3: Supabase function secrets** | Lovable Cloud → Backend → Edge Function Secrets | `LOVABLE_API_KEY` (auto), `RESEND_API_KEY`, `STRIPE_SECRET_KEY`, push transport keys when activated | edge functions only (never exposed to client) |
| **Zone 4: Apple/Google credential stores** | Apple Developer Portal + App Store Connect; Google Play Console + Firebase Console | Provisioning profiles, distribution certificates, APNs auth key, FCM service account JSON, Play upload keystore | downloaded into Zone 2 as needed; never committed |

---

## 2. Where Each Mobile Variable Lives

### 2.1 Web runtime (Zone 1 — visible in client bundle)

| Variable | Source | Used by |
|---|---|---|
| `VITE_SUPABASE_URL` | auto-managed `.env` | `src/integrations/supabase/client.ts` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | auto-managed `.env` | `src/integrations/supabase/client.ts` |
| `VITE_SUPABASE_PROJECT_ID` | auto-managed `.env` | edge function URL construction |

**These ship in the JS bundle.** They are publishable keys (anon key + project URL) — safe to expose because Row-Level Security on the database is the actual access control layer.

### 2.2 Android signing (Zone 2 — CI only)

| Variable | Referenced in | Purpose |
|---|---|---|
| `ANDROID_KEYSTORE_PATH` | `infra/deploy/mobile.yaml` line 51, `mobile/android/SIGNING.md`, `scripts/release/android/build-android.sh` | path to upload keystore (`.jks` or `.keystore`) on CI runner after base64 decode |
| `ANDROID_KEYSTORE_PASSWORD` | same | unlocks the keystore |
| `ANDROID_KEY_ALIAS` | same | which key inside the keystore to use |
| `ANDROID_KEY_PASSWORD` | same | unlocks the specific key |
| `ANDROID_PACKAGE_NAME` | same | matches `com.sita.os`; passed to Gradle as `applicationId` override (defensive) |

**Source for the keystore itself:** generated locally with `keytool -genkeypair` (one-time), uploaded to Play Console (per-app upload key), and base64-encoded into a GitHub Actions secret for CI.

### 2.3 iOS signing (Zone 2 — CI only, account-blocked until Apple enrollment)

| Variable | Referenced in | Purpose |
|---|---|---|
| `APPLE_TEAM_ID` | `infra/deploy/mobile.yaml` lines 28, 76, `mobile/ios/SIGNING.md`, `scripts/release/ios/build-ios.sh` | 10-character team identifier from Apple Developer Portal |
| `APPLE_PROVISIONING_PROFILE_BASE64` | same | base64-encoded `.mobileprovision` file |
| `APPLE_DISTRIBUTION_CERT_P12_BASE64` | same | base64-encoded `.p12` distribution certificate |
| `APPLE_DISTRIBUTION_CERT_PASSWORD` | same | unlocks the `.p12` |
| `APP_STORE_CONNECT_API_KEY_ID` | `infra/deploy/mobile.yaml` line 32, build script | App Store Connect API key id (10 chars) |
| `APP_STORE_CONNECT_API_ISSUER_ID` | line 33 | issuer UUID |
| `APP_STORE_CONNECT_API_KEY_P8_BASE64` | line 34 | base64-encoded `.p8` private key |

**Account-blocked:** all 7 variables require an active Apple Developer Program membership ($99/year) — no amount of repo work can bypass this.

### 2.4 Push transports (Zone 3 + Zone 4 — deferred)

| Transport | Variable | Status |
|---|---|---|
| Web push (active) | VAPID keys (in Supabase function secrets) | ✅ active |
| iOS APNs (deferred) | `APNS_KEY_ID`, `APPLE_TEAM_ID`, `apns.bundle_id`, APNs `.p8` key | requires Apple membership (Zone 4) |
| Android FCM (deferred) | `FIREBASE_PROJECT_ID`, `FCM_SENDER_ID`, `google-services.json` (Zone 4 → committed to CI artifact, never to repo), service account JSON | requires Firebase project (Zone 4) |

---

## 3. Boundary Audit

| Question | Answer |
|---|---|
| Are any Zone 2 (signing) secrets visible in the web bundle? | NO — verified by absence of `keystore`, `provisioning`, `p12`, `apns` strings in `dist/` |
| Are any Zone 3 (function) secrets visible to the client? | NO — Lovable Cloud enforces this at the edge function boundary |
| Are any private keys committed to the repo? | NO — verified by absence of `.p8`, `.p12`, `.jks`, `.keystore`, `google-services.json` (template excluded), `*.mobileprovision` files in working tree |
| Are GitHub Actions secrets used in any web-runtime code? | NO — `import.meta.env.VITE_*` is the only env access in `src/` |
| Are `process.env.*` references in mobile build scripts limited to Zone 2? | YES — verified: `${ANDROID_*}`, `${APPLE_*}`, `${APP_STORE_CONNECT_*}` only appear in `scripts/release/`, `infra/deploy/mobile.yaml`, and `mobile/*/SIGNING.md` |

---

## 4. Forbidden Patterns

| Pattern | Why forbidden | Validator |
|---|---|---|
| Hardcoded password / API key in any committed file | secret leak | `check-mobile-env-strategy-consistency.ts` |
| `import.meta.env.VITE_*` referencing a signing secret | leaks signing material into client bundle | same |
| `process.env.ANDROID_*` in `src/` (web layer) | wrong tier — signing secrets are Zone 2 only | same |
| Committed `google-services.json` (real, not template) | FCM project secret leak | `.gitignore` + validator |
| Committed `*.mobileprovision`, `*.p12`, `*.jks`, `*.keystore`, `*.p8` | signing material leak | `.gitignore` + validator |

---

## 5. Audit Summary

| Metric | Value |
|---|---|
| Zones identified | 4 |
| Zone-crossing leaks detected | 0 |
| Hardcoded secrets in claim surfaces | 0 |
| Committed signing artifacts | 0 |
| Variables referenced in build scripts | 12 (Zone 2) |
| Variables referenced in client bundle | 3 (Zone 1, all publishable) |

**Verdict:** the env/secret strategy is **clean, zoned, and validator-protected**. The canonical model is codified in `MOBILE_ENV_AND_SECRET_STRATEGY_MODEL.md`.
