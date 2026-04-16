

# SITA OS — Security Wiring Gaps & Stub Removal

## Findings

Three renderer-side security modules are **fully implemented but never called** anywhere in the React app:

| Module | Status | Issue |
|--------|--------|-------|
| `initSessionThreatDetector()` | Exported, 0 consumers | Never initialized — keystroke/mouse listeners never attached |
| `initSecureVault()` | Exported, 0 consumers | GC timer never started, vault key never generated |
| `scanAIOutput()` | Exported, 0 consumers | AI responses bypass firewall entirely |
| `assessThreat()` | Exported, 0 consumers | Threat level never checked before sensitive actions |
| `vaultStore/Retrieve()` | Exported, 0 consumers | No secrets use the encrypted vault |
| `getDeviceFingerprint()` | Exported, 0 consumers | Device fingerprint never bound to session |

The Electron-side modules (`runtime-shield`, `dlp-guard`, `network-sentinel`) are correctly wired in `main.cjs`. No issues there.

## Plan (3 changes)

### 1. Wire security initializers into PlatformInit.tsx

Add `initSessionThreatDetector()` and `initSecureVault()` calls to the existing `PlatformInit` component — the canonical place for platform boot hooks.

```
- Import initSessionThreatDetector, initSecureVault
- Call initSessionThreatDetector() in a useEffect (once)
- Call initSecureVault() in a useEffect (once)
```

### 2. Wire AI Output Firewall into the AI gateway consumer

Find the canonical AI response handler (the component or service that calls `invokeAICapability` or processes AI responses) and pipe all AI output through `scanAIOutput()` before rendering. If responses fail the firewall (critical violations), redact them.

This requires identifying the AI response rendering path — likely in advisor/chat components. The firewall will wrap the response before it reaches the UI.

### 3. No stubs to remove

All three modules contain real, complete implementations — no TODO comments, no placeholder returns, no stub functions. The only issue is they were never wired into the app lifecycle.

## Files Modified: 2
- `src/components/sita/PlatformInit.tsx` — add vault + threat detector init
- AI response handler (likely `src/pages/AdvisorChat.tsx` or AI gateway service) — add `scanAIOutput` call

## Impact
- 0 new dependencies
- 0 TypeScript errors expected
- All 3 renderer security layers become active at runtime

