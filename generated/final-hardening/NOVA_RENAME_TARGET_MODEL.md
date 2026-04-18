# Nova Rename — Target Model

## Old → New
- **Old:** Nova Kernel
- **New canonical:** Nova Runtime SDK
- **Classification:** userland-runtime-substrate

## Why "Runtime SDK"
- accurately describes a userland process running inside React/Electron
- does not imply host-kernel ownership
- aligns with existing "SDK / substrate" language in repo
- differentiates from real kernel (Linux) which the OS profile actually rides on

## Boundary
The internal directory `src/platform/nova-sdk/kernel/` keeps its name (compat). All external callers MUST import from `@/platform/nova-runtime-sdk`.

## Honesty notes (exposed in code)
- `NOVA_RUNTIME_SDK_HONESTY_NOTE` constant
- `NovaRuntimeSDK.notKernel = true`
- `NovaRuntimeSDK.notSecurityBoundary = true`

## Compatibility
Internal symbols continue to work; UI/docs/admin surfaces use canonical name only.
