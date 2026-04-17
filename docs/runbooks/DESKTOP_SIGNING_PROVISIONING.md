# SITA OS — Desktop Code-Signing Provisioning Runbook

**Owner:** release-team
**Phase:** 14.2 — Desktop Signing Closure
**Status target:** `desktop-signing-notarization` readiness item → `ready`

This runbook is the only outstanding step required to flip the desktop signing
readiness item from `partial` to `ready`. All scaffolding (forge config,
entitlements, env-var contract, verifier) lives in code; only the certificates
themselves can't.

---

## 1. Apple (macOS) — Developer ID + Notarization

### 1.1 Provision

1. Enroll in the Apple Developer Program ($99/yr) — https://developer.apple.com/programs/
2. In **Certificates, Identifiers & Profiles**, create a **Developer ID Application** certificate.
3. Download the `.cer` and double-click to import into the **login** keychain.
4. Generate an **app-specific password** at https://appleid.apple.com → Security → App-Specific Passwords.
5. Note your 10-char **Team ID** (developer.apple.com/account).

### 1.2 Configure release env

Set these in your release CI (GitHub Actions, etc.) — **never** commit them:

```bash
export APPLE_IDENTITY="Developer ID Application: Your Co. Inc. (TEAMID12AB)"
export APPLE_ID="releases@yourco.com"
export APPLE_PASSWORD="abcd-efgh-ijkl-mnop"   # app-specific password
export APPLE_TEAM_ID="TEAMID12AB"
```

### 1.3 Build + sign + notarize

```bash
./scripts/release/desktop/build-electron.sh darwin x64
./scripts/release/desktop/build-electron.sh darwin arm64
```

`electron/forge.config.cjs` automatically activates `osxSign` and `osxNotarize`
blocks when `APPLE_IDENTITY` and `APPLE_ID` are present.

### 1.4 Verify

```bash
codesign --verify --deep --strict --verbose=4 out/SITA-OS-darwin-arm64/SITA\ OS.app
spctl --assess --verbose=4 out/SITA-OS-darwin-arm64/SITA\ OS.app
xcrun stapler validate out/SITA-OS-darwin-arm64/SITA\ OS.app
```

All three must report **accepted / signed / valid**.

---

## 2. Windows — EV / OV Code Signing

### 2.1 Provision

1. Purchase an **EV (preferred)** or **OV** code-signing certificate from a CA
   (DigiCert, Sectigo, GlobalSign).
2. EV certs ship on a hardware token — install vendor drivers.
3. Export to `.pfx` if your CI accepts file-based signing (OV only). EV requires
   token-based signing; use vendor's CSP (e.g. `signtool /csp ...`).

### 2.2 Configure release env

```bash
export CSC_LINK="/secure/path/to/sita-codesign.pfx"
export CSC_KEY_PASSWORD="••••••••"
```

### 2.3 Build + sign

```bash
./scripts/release/desktop/build-electron.sh win32 x64
```

`electron/forge.config.cjs` activates the `windowsSign` block when `CSC_LINK`
points at an existing file.

### 2.4 Verify

```powershell
signtool verify /pa /v out\SITA-OS-win32-x64\sita-os.exe
```

Output must include **Successfully verified** and a chain to a trusted root.

---

## 3. Verify in CI

Run the credential verifier (always exits 0; emits JSON):

```bash
node --loader ts-node/esm scripts/release/desktop/verify-signing-credentials.ts
cat generated/desktop-signing-status.json
```

When `summary.overallStatus === "ready"`, the
`check-desktop-deployability` gate flips `desktop-signing-notarization`
from `partial` → `ready` automatically.

---

## 4. Rollback

If a signing run fails mid-release:

1. Do **not** publish unsigned builds. Pull the artifact.
2. Re-run with `--verbose` and capture log.
3. For notarization failures: `xcrun notarytool log <submission-id>`.
4. For Windows signtool failures: confirm cert chain with `certutil -verify`.
5. Re-issue cert if revoked; rotate `APPLE_PASSWORD` if leaked.
