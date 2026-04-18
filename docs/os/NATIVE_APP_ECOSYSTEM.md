# SITA OS — Native App Ecosystem

> Status: **shipped**. This is the canonical Ubuntu-native app launcher and
> store model. There is no iOS App Store equivalent and no plan to build one.
> The mobile Capacitor build remains as a thin client; the **first-class
> distribution surface is the SITA Ubuntu-native shell**.

## 1. Four application classes

The App Platform models every installable thing as exactly one of four
classes. The class determines the execution path inside the SITA shell.

| Class | Example | Execution path on Ubuntu |
|---|---|---|
| **A — Web/SaaS** | Stripe Dashboard | embedded BrowserView in shell, sandboxed origin |
| **B — PWA** | sita.ai/pwa-app | installed via Electron `installPWA`, gets desktop icon |
| **C — External Native** | Slack `.deb`, VS Code | launched via `xdg-open` / `gtk-launch` against allowlisted `.desktop` file |
| **D — Internal OS App** | SITA Mail, SITA Files | bundled inside the verity slot at `/opt/sita/apps/<id>/` |

Class is recorded in `apps_catalog.app_class` and validated server-side at
ingest time by edge functions `app-ingest-web` / `app-ingest-pwa`.

## 2. Native launch flow (Class C)

```
renderer
   │  await window.sitaApps.launchNativeApp({ appId: 'com.slack.Slack' })
   ▼
preload (electron/preload.cjs)
   │  ipc('apps:launch-native', { appId })
   ▼
main (electron/main.cjs)
   │  1. lookup in installed_apps table → confirm class === 'external-native'
   │  2. confirm appId is in allowlist (apps_catalog.trust_tier IN
   │     ('internal','verified','trusted-domain'))
   │  3. resolve `.desktop` file:
   │       /usr/share/applications/<appId>.desktop
   │       /var/lib/flatpak/exports/share/applications/<appId>.desktop
   │       ~/.local/share/applications/<appId>.desktop
   │  4. if found → spawn `gtk-launch <appId>` (detached, no shell inheritance)
   │     else    → fallback to `xdg-open <fallback_url>` from manifest
   │  5. record launch in app_telemetry + emit Sentinel event
   ▼
Ubuntu desktop session
```

### Allowlist enforcement

The renderer **cannot** spawn arbitrary processes. The bridge:

- Rejects appIds not present in `apps_catalog`
- Rejects apps whose `trust_tier = 'community'` unless the user has
  explicitly granted "Run external native apps" permission via Sentinel
- Logs every launch attempt (allowed or denied) to `admin_action_audit`
- Strips environment variables before spawn (`PATH`, `LD_*`, `DBUS_*`
  cleared except a curated whitelist)

### Detection

`window.sitaApps.checkNativeAppAvailability(appId)` runs the same `.desktop`
resolution and returns `{ available: boolean, source: string | null }`. The
store UI uses this to decide whether to show "Launch" vs. "Install".

## 3. Internal OS apps (Class D)

Internal apps live inside the verity-protected root slot:

```
/opt/sita/apps/
  ├── mail/
  │     ├── manifest.json   (signed: ed25519 over canonical JSON)
  │     ├── icon.png
  │     └── dist/           (React/Electron renderer bundle)
  ├── files/
  └── notes/
```

Properties:

- **Tamper-evident**: any modification breaks the verity hash → next boot
  panics → recovery slot loads
- **Atomically updated**: shipping a new app version requires a new OS
  bundle (no per-app installer surface)
- **Manifest-signed**: `apps_catalog.signature` is verified against the
  SITA app-publishing key before the catalog row is accepted
- **Permission-scoped**: declared in manifest, enforced by Sentinel engine

## 4. Web & PWA apps (Classes A, B)

Web apps load in a dedicated `BrowserView` inside the shell with:

- Unique `partition: 'persist:app-<appId>'` (cookie/storage isolation)
- CSP override based on `apps_catalog.csp_policy`
- Permission prompts routed through Sentinel (mic, camera, geolocation)
- No access to `window.electron` or `window.sitaApps` (renderer isolation)

PWAs additionally get:

- A `.desktop` file generated under `~/.local/share/applications/`
- An entry in the GNOME/Ubuntu app grid (so they survive even if the SITA
  shell is bypassed for support)

## 5. Store UI ↔ catalog wiring

The 17 store modules in `src/components/apps/` read from:

- `apps_catalog` — published app list (RLS: public read)
- `installed_apps` — per-user installation state
- `app_telemetry` — launch counts, last-used (per-user)
- `app_permissions` — Sentinel-managed grants

Edge functions involved:

| Function | Purpose |
|---|---|
| `app-ingest-web` | scrape OG/manifest, normalize icon |
| `app-ingest-pwa` | parse Web App Manifest, validate icons |
| `app-publish` | verify ed25519 signature, write to catalog |
| `app-install` | record install, materialize `.desktop` if needed |
| `app-uninstall` | remove `.desktop`, purge partition data |
| `app-trust-promote` | move app between trust tiers (admin) |
| `app-telemetry-roll` | aggregate launch counts daily |

## 6. Why no iOS-style app store

| iOS App Store assumption | SITA Ubuntu reality |
|---|---|
| Apps are sandboxed binaries from one vendor | Apps are 4 different classes with 4 execution paths |
| Apple is the trust root | SITA's ed25519 publishing key + community trust tiers |
| Side-loading is hostile | Side-loading via `.deb` / Flatpak is normal and just elevates trust review |
| Reviews gate distribution | Trust tiers gate auto-launch; users can always opt in |
| One submission pipeline | Per-class ingest pipelines (web scrape, PWA manifest, native `.desktop`, internal bundle) |

The result: SITA users get the **discoverability** of an app store and the
**openness** of Linux, with cryptographic trust where it matters and human
trust everywhere else.

## 7. Cross-references

- [`ELECTRON_NATIVE_SHELL.md`](./ELECTRON_NATIVE_SHELL.md) — the shell that
  hosts every app class
- [`TRUST_CHAIN_KEYS_AND_SIGNING.md`](./TRUST_CHAIN_KEYS_AND_SIGNING.md) —
  signing keys (OS + app catalog share the publishing root)
- App Platform memory key `architecture/app-platform`
- Sentinel engine: `src/lib/sentinel/`
