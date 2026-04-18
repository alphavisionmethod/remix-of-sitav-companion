# SITA OS — Desktop (Electron) Signing & Distribution

> Phase 14 — Production Launch Hardening
> Owner: Desktop Platform
> Gate: `check-electron-signing-readiness`

End-to-end signing instructions for Linux, macOS, and Windows desktop builds.
Scaffolding is complete in this repo; signing flips from **deferred** to
**ready** the moment the listed secrets are injected — no code change required.

---

## 0 · Honest baseline

| Surface | Status | Pipeline | Output |
|---|---|---|---|
| **Linux** | **Ready** | `electron-forge make` (ubuntu) | `.tar.gz` + `.deb` |
| **macOS** | **Deferred-on-cert** | `electron-forge make` (macos-14) | `.zip` (unsigned) → `.dmg` (signed when MAC_CERTS present) |
| **Windows** | **Deferred-on-cert** | `electron-forge make` (windows-latest) | `.zip` (unsigned) → `.exe` installer (signed when WINDOWS_PFX present) |

Linux ships fully today. macOS / Windows produce installable but unsigned
builds — gatekeeper warnings until the certs land.

---

## 1 · macOS — Apple Developer ID signing

### 1.1 Provision

1. Activate Apple Developer Program membership.
2. In Apple Developer → Certificates, create a **Developer ID Application** cert.
3. Export to `.p12`, then base64:
   ```bash
   base64 -i sita-developer-id.p12 | pbcopy
   ```

### 1.2 Add GitHub secrets

| Secret | Source |
|---|---|
| `MAC_CERTS` | base64 of the `.p12` |
| `MAC_CERTS_PASSWORD` | export password |
| `APPLE_ID` | Apple ID email |
| `APPLE_ID_PASSWORD` | app-specific password (appleid.apple.com → Sign-in & Security → App-Specific Passwords) |
| `APPLE_TEAM_ID` | from Apple Developer → Membership |

### 1.3 Result

The `release-electron` workflow's macOS job auto-detects `MAC_CERTS` and:

- signs the `.app` bundle with Developer ID
- enables the hardened runtime via `electron/entitlements.plist`
- notarizes via `notarytool`
- staples the ticket
- packages as signed `.dmg`

---

## 2 · Windows — Authenticode signing

### 2.1 Provision

1. Acquire an EV (preferred) or OV code-signing cert from a CA (DigiCert, Sectigo, SSL.com).
2. Export to `.pfx`, then base64:
   ```bash
   base64 -i sita-codesign.pfx | clip
   ```

### 2.2 Add GitHub secrets

| Secret | Source |
|---|---|
| `WINDOWS_PFX` | base64 of the `.pfx` |
| `WINDOWS_PFX_PASSWORD` | export password |

### 2.3 Result

The `release-electron` Windows job auto-detects `WINDOWS_PFX` and runs
`signtool sign` against the produced `.exe` installer + uninstaller. Output
includes a SHA-256 timestamp signature.

---

## 3 · Linux — gpg-signed `.deb` (optional)

Linux builds ship as `.tar.gz` + `.deb`. Optional gpg signing:

| Secret | Source |
|---|---|
| `LINUX_GPG_PRIVATE_KEY` | exported gpg private key (ascii-armored) |
| `LINUX_GPG_PASSPHRASE` | passphrase |

When present, the workflow signs the `.deb` via `dpkg-sig`.

---

## 4 · Auto-updater channel signing

Auto-updates are served via `electron/auto-updater.cjs`. Update manifests
must be signed with the same key as the parent platform binary:

- macOS — Apple Developer ID (matches app)
- Windows — Authenticode (matches installer)
- Linux — gpg (when enabled)

The updater verifies signatures before swapping binaries; mismatches abort
the update with an audit log entry.

---

## 5 · Verification

```bash
pnpm tsx scripts/architecture/checks/check-electron-signing-readiness.ts
```

The gate enforces:

- `electron/entitlements.plist` exists with hardened-runtime keys
- `electron/forge.config.cjs` declares signing slots
- `release-electron.yml` has macOS, Windows, Linux runners
- `release-electron.yml` references at least one signing secret slot
- Auto-updater + crash reporter present

When all secrets land, the gate flips from "scaffold ready, certs deferred"
to "fully signed".

---

## 6 · Related

- `electron/forge.config.cjs` — build configuration
- `electron/entitlements.plist` — macOS hardened runtime entitlements
- `electron/auto-updater.cjs` — signed-update flow
- `.github/workflows/release-electron.yml` — release pipeline
- `docs/os/DEPLOYMENT_PROFILES.md` — deployment profile context
