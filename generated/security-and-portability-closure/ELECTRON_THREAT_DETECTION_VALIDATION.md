# Electron Threat Detection — Validation

**Validator:** `scripts/validation/check-electron-threat-detection-proof.ts`  
**Modules under test:** `electron/runtime-shield.cjs`, `electron/dlp-guard.cjs`, `electron/network-sentinel.cjs`  
**Evidence dir:** `electron/__threat_drills__/`

## Scenarios

1. **Anti-debug trigger** — attach DevTools to packaged app; assert runtime-shield emits anomaly event and (per policy) terminates renderer
2. **DLP screenshot block** — invoke screenshot API; assert `dlp-guard` blocks frame capture
3. **Network allowlist violation** — attempt connection to non-allowlisted host; assert `network-sentinel` denies and logs

## Pass criteria

Each scenario produces an evidence row:
```json
{
  "scenario": "anti-debug-trigger",
  "executedAt": "ISO-8601",
  "deviceFamily": "linux-x64|win-x64|macos-arm64",
  "expected": "block",
  "observed": "block",
  "pass": true
}
```

## Honest current status

⏳ **partner-blocked** — drills require an Electron build environment with packaged ASAR. Until that capture lands in `electron/__threat_drills__/`, `check-electron-threat-detection-proof.ts` returns WARN-tier and the truth panel surfaces the gap.

## Module readiness

| Module | Wired hooks |
|---|---|
| `runtime-shield.cjs` | debugger detection, VM detection, DLL injection guard ✅ |
| `dlp-guard.cjs` | clipboard scrub, screenshot block, watermark ✅ |
| `network-sentinel.cjs` | allowlist enforcement, certificate pin ✅ |
