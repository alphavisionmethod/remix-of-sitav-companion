# App Store Type × Lifecycle Matrix

| Lifecycle Step | Type A — Web/SaaS | Type B — PWA | Type C — External Native | Type D — Internal OS |
| --- | --- | --- | --- | --- |
| Discovery (catalog) | ✅ `app-store-catalog` | ✅ `app-store-catalog` | ✅ `app-store-catalog` | ✅ internal-only filter |
| Install (DB persist) | ✅ `app-install` → `installed_apps` | ✅ `app-install` → `installed_apps` | ✅ `app-install` + native bridge probe | ✅ `app-install` (internal trust tier) |
| Visibility post-install | ✅ launcher + grid | ✅ launcher + grid | ✅ launcher + native badge | ✅ admin + internal launcher only |
| Update (manifest diff) | ✅ `app-update-check` | ✅ `app-update-check` | ✅ `app-update-check` (binary detect) | ✅ `app-update-check` |
| Uninstall (DB delete) | ✅ `app-uninstall` | ✅ `app-uninstall` | ✅ `app-uninstall` + bridge cleanup | ✅ `app-uninstall` |
| Launcher integration | ✅ `defaultPinnedAppsForProfile` | ✅ `defaultPinnedAppsForProfile` | ✅ Electron IPC launch | ✅ profile-restricted |
| Entitlements (sandbox) | ✅ Sentinel grant | ✅ Sentinel grant + PWA scope | ✅ allowlist enforced | ✅ internal trust tier |

**All four types pass all seven lifecycle steps.** This matrix is the binding contract for `check-app-store-lifecycle-reality.ts`.
