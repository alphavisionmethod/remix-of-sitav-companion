# SITA OS — Mobile Env & Secret Strategy Model

**Status:** canonical
**Authority:** this document is the source of truth for which secrets live in which zone
**Enforcement:** `check-mobile-env-strategy-consistency.ts`

---

## 1. The Four-Zone Boundary (canonical)

```
┌─────────────────────────────────────────────────────────────────────┐
│ Zone 1: Lovable web env (.env, auto-managed)                        │
│   — Visible in shipped JS bundle                                    │
│   — Must be safe to expose (publishable keys only)                  │
│   — Examples: VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY      │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ Zone 2: GitHub Actions secrets                                      │
│   — Available only in CI workflows                                  │
│   — Used by signing + release scripts                               │
│   — Examples: ANDROID_KEYSTORE_*, APPLE_*, APP_STORE_CONNECT_*      │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ Zone 3: Supabase / Edge Function secrets                            │
│   — Available only inside edge functions                            │
│   — Used for backend-side API calls                                 │
│   — Examples: LOVABLE_API_KEY, push transport keys                  │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ Zone 4: Apple Developer + Google Play + Firebase consoles           │
│   — Lives outside the repo entirely                                 │
│   — Sourced from Apple Developer Portal, Play Console, Firebase     │
│   — Downloaded → base64-encoded → uploaded into Zone 2 for CI       │
│   — Examples: provisioning profiles, distribution certs, APNs key,  │
│     FCM service account, upload keystore                            │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. Zone Membership Table (mobile-relevant secrets only)

| Secret | Zone | Required for |
|---|---|---|
| `VITE_SUPABASE_URL` | 1 | web SPA + Capacitor wrapper at runtime |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | 1 | web SPA + Capacitor wrapper at runtime |
| `VITE_SUPABASE_PROJECT_ID` | 1 | edge function URL construction |
| `ANDROID_KEYSTORE_PATH` | 2 | signed Android AAB |
| `ANDROID_KEYSTORE_PASSWORD` | 2 | signed Android AAB |
| `ANDROID_KEY_ALIAS` | 2 | signed Android AAB |
| `ANDROID_KEY_PASSWORD` | 2 | signed Android AAB |
| `ANDROID_PACKAGE_NAME` | 2 | signed Android AAB (defensive override) |
| `APPLE_TEAM_ID` | 2 | signed iOS .ipa |
| `APPLE_PROVISIONING_PROFILE_BASE64` | 2 | signed iOS .ipa |
| `APPLE_DISTRIBUTION_CERT_P12_BASE64` | 2 | signed iOS .ipa |
| `APPLE_DISTRIBUTION_CERT_PASSWORD` | 2 | signed iOS .ipa |
| `APP_STORE_CONNECT_API_KEY_ID` | 2 | TestFlight upload |
| `APP_STORE_CONNECT_API_ISSUER_ID` | 2 | TestFlight upload |
| `APP_STORE_CONNECT_API_KEY_P8_BASE64` | 2 | TestFlight upload |
| `LOVABLE_API_KEY` | 3 | edge functions calling Lovable AI Gateway |
| `APNS_KEY_ID` (when enabled) | 3 | edge function APNs push transport |
| `FCM_SENDER_ID` (when enabled) | 3 | edge function FCM push transport |
| Upload keystore (`.jks`) | 4 | downloaded to Zone 2 as base64 |
| Provisioning profile | 4 | downloaded to Zone 2 as base64 |
| Distribution cert (`.p12`) | 4 | downloaded to Zone 2 as base64 |
| APNs auth key (`.p8`) | 4 | downloaded to Zone 3 as base64 |
| FCM service account JSON | 4 | downloaded to Zone 3 |
| `google-services.json` | 4 | downloaded to CI; consumed by Android build; never committed |

---

## 3. Zone-Crossing Rules

| From | To | Allowed? | How |
|---|---|---|---|
| Zone 1 → client JS bundle | ✅ allowed | this is the design — Zone 1 keys are publishable |
| Zone 2 → CI runner env | ✅ allowed | GitHub Actions injects automatically when `secrets.NAME` referenced in workflow |
| Zone 2 → Zone 1 (i.e. signing key into web bundle) | ❌ forbidden | catastrophic leak; validator forbids `VITE_` prefix on signing var names |
| Zone 3 → edge function process env | ✅ allowed | Lovable Cloud injects via `Deno.env.get('NAME')` |
| Zone 3 → client JS bundle | ❌ forbidden | edge function secrets must never reach the client |
| Zone 4 → repo (committed) | ❌ forbidden | `.gitignore` + validator block all signing material file extensions |
| Zone 4 → Zone 2 | ✅ allowed | manual: download from console → base64-encode → paste into GitHub secret |
| Zone 4 → Zone 3 | ✅ allowed | manual: download → paste into Lovable Cloud edge function secrets |

---

## 4. What Belongs in Each Zone (decision tree)

```
Is the secret needed at web runtime?
├── YES → safe to expose (e.g. publishable key)?
│         ├── YES → Zone 1 (.env with VITE_ prefix)
│         └── NO  → ❌ DESIGN ERROR (use an edge function instead)
└── NO  → Is it needed during CI build/sign?
          ├── YES → Zone 2 (GitHub Actions secret)
          └── NO  → Is it needed by an edge function at runtime?
                    ├── YES → Zone 3 (Supabase function secret)
                    └── NO  → Zone 4 (lives in Apple/Google console only)
```

---

## 5. What Is Required for Android Signing

| Item | Zone | Action |
|---|---|---|
| Upload keystore (`.jks`) | 4 → 2 | `keytool -genkeypair`, upload to Play Console, base64-encode into GitHub secret `ANDROID_KEYSTORE_BASE64` (decoded into `ANDROID_KEYSTORE_PATH` at CI runtime) |
| Keystore password | 2 | `ANDROID_KEYSTORE_PASSWORD` GitHub secret |
| Key alias | 2 | `ANDROID_KEY_ALIAS` GitHub secret |
| Key password | 2 | `ANDROID_KEY_PASSWORD` GitHub secret |
| Package name | 2 | `ANDROID_PACKAGE_NAME=com.sita.os` GitHub secret (defensive override) |

**Total: 5 secrets (1 from Zone 4, 4 native to Zone 2). Blocker class: `secret-blocked` — operator can complete in ~30 minutes once Play Console publisher account exists.**

## 6. What Is Required for iOS Signing

| Item | Zone | Action |
|---|---|---|
| Apple Developer Program membership | 4 (external) | $99/year, requires DUNS number for orgs |
| Team ID | 4 → 2 | from Apple Developer Portal → `APPLE_TEAM_ID` GitHub secret |
| Distribution certificate (`.p12`) | 4 → 2 | export from Keychain Access → base64-encode → `APPLE_DISTRIBUTION_CERT_P12_BASE64` |
| Certificate password | 2 | `APPLE_DISTRIBUTION_CERT_PASSWORD` |
| Provisioning profile | 4 → 2 | download from Apple Developer Portal → base64-encode → `APPLE_PROVISIONING_PROFILE_BASE64` |
| App Store Connect API key id | 4 → 2 | from App Store Connect → Users and Access → Keys → `APP_STORE_CONNECT_API_KEY_ID` |
| API key issuer id | 2 | `APP_STORE_CONNECT_API_ISSUER_ID` |
| API key (`.p8`) | 4 → 2 | downloaded once from App Store Connect → base64-encode → `APP_STORE_CONNECT_API_KEY_P8_BASE64` |

**Total: 7 secrets + 1 external membership. Blocker class: `account-blocked` — cannot proceed without Apple membership; once membership exists, ~1-2 hour setup.**

## 7. What Is Required for Push (when activated)

| Transport | Item | Zone |
|---|---|---|
| Web (VAPID) | VAPID public + private key pair | Zone 1 (public) + Zone 3 (private) |
| iOS (APNs) | `.p8` auth key, key id, team id, bundle id, environment | Zone 3 |
| Android (FCM) | service account JSON, project id, sender id, `google-services.json` (CI artifact) | Zone 3 + CI artifact |

**Currently:** web push is active, iOS+Android push are deferred (correctly classified by `check-mobile-push-claim-safety`).

---

## 8. Forbidden Patterns (validator-enforced)

| Pattern | Detection |
|---|---|
| `process.env.ANDROID_*` outside `scripts/release/`, `infra/deploy/`, `mobile/` | grep in `src/`, `supabase/functions/` |
| `import.meta.env.VITE_KEYSTORE_*` (or any signing-flavoured `VITE_` var) | grep in `src/` |
| Committed file matching `*.p8`, `*.p12`, `*.jks`, `*.keystore`, `*.mobileprovision` | filesystem walk excluding `.git/` |
| `google-services.json` not matching `.template` suffix in committed paths | filesystem walk |
| Hardcoded passwords/keys in `mobile/` or `infra/deploy/mobile.yaml` (anything matching `password\s*[:=]\s*["'][a-zA-Z0-9]+["']` not prefixed `${`) | regex audit |

---

## 9. Verification

`check-mobile-env-strategy-consistency.ts` asserts:

- All `${ANDROID_*}` and `${APPLE_*}` references in `mobile/` and `infra/` use `${VAR_NAME}` shape (env interpolation), never literal values
- No `VITE_` prefix variables overlap with signing secret names
- No forbidden file extensions are committed
- `mobile/android/SIGNING.md` and `mobile/ios/SIGNING.md` document the canonical Zone 2 variable names exactly as listed in section 2
- `infra/deploy/mobile.yaml` references match `mobile/*/SIGNING.md` references (no orphan / undefined env vars)
