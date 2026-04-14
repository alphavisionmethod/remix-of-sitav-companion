

# Advanced Network UX, Battery Intelligence, Automation & System Intelligence

## Current State

**Existing infrastructure:**
- Basic WiFi panel (190L): network list, password prompt, connect via `wifiConnectFlow`
- Basic Bluetooth panel (157L): device list, pair/connect via `controlcenterd`
- Basic Battery panel (92L): level gauge, 3 power modes
- `NetworkUtility.tsx` (133L): static connector health + diagnostics page
- OS security flows (339L): WiFi connect, VPN cert install, firewall disable
- OS subsystem flows (308L): policy-evaluated flows for school WiFi, public WiFi auto-VPN, etc.
- Recovery engine (194L): degraded mode management

**What's missing (from sections 16-34):**
- No captive portal detection, wrong password recovery, weak signal suggestions, hidden SSID, enterprise auth, static IP, custom DNS, metered mode, hotspot/tethering, airplane mode
- No BT battery display, audio route switching, codec selection, BLE privacy, stale cleanup, reconnection policy
- No battery health estimation, thermal pressure, charger detection, optimized charging, app drain attribution, suspend/resume tracking
- No `automationd` rules engine
- No system intelligence/recommendation engine
- No self-repair/diagnostics engine
- No full settings/search system
- No HAL abstraction

## Approach — 4 Batches (Feasible Scope)

Given codebase constraints (React SPA, not a real OS kernel), we implement these as **realistic simulated daemons + beautiful premium UI dashboards**. This matches the existing pattern (authd, sessiond, secretsd are all TypeScript simulations).

---

### Batch 1: Core Daemons — wifid, btd, powerd, automationd (~500L)

**Create `src/lib/os-services/wifid.ts`** (~150L):
- `WifiDaemon` class with full state model: `WifiConnectivityState` (Offline/Limited/CaptivePortal/Online)
- Captive portal detection + state tracking
- Network list with RSSI, security type, frequency band, hidden SSID support
- Enterprise auth model (WPA2/3-Enterprise, certs, anonymous identity)
- Per-network settings: static IP, custom DNS, metered mode
- Hotspot/tethering config model
- Airplane mode coordination
- Wrong password error classification + retry state
- Weak signal detection + roaming suggestions

**Create `src/lib/os-services/btd.ts`** (~120L):
- `BluetoothDaemon` class
- Device model with battery level (headset, earbuds L/R/case, keyboard)
- Audio route management (output/input device, active role, preferred route)
- Codec selection (AAC, SBC, aptX, LDAC)
- BLE privacy (rotating addresses)
- Stale device cleanup (last seen tracking)
- Per-device reconnection policy (always/on-demand/never)
- Forgotten device removal (disconnect + unpair + revoke + clear cache)

**Create `src/lib/os-services/powerd.ts`** (~130L):
- `PowerDaemon` class
- Battery health: design capacity vs full charge, cycle count, aging trend, temp stress
- Thermal pressure states: nominal/warm/hot/throttling/critical
- Charger detection: wattage, type (USB-C PD, wireless, etc.)
- Optimized charging: hold at 80%, learned schedule, predicted unplug
- App drain attribution model (CPU, network, wakeups, background jobs)
- Suspend/resume stability tracker
- 4 power profiles: Saver, Balanced, Performance, Quiet

**Create `src/lib/os-services/automationd.ts`** (~100L):
- `AutomationDaemon` class
- Rule model: condition → action with policy-aware safeguards
- Built-in rules: public WiFi → VPN, low battery → saver, presentation → mute notifications, headphones → audio panel, threat → isolate
- Event bus simulation
- Rule execution audit trail
- Conflict resolution

### Batch 2: Enhanced System Panels — WiFi, Bluetooth, Battery (~600L)

**Rewrite `SystemWifiPanel.tsx`** (~200L):
- Captive portal banner with "Sign in required" + open browser action
- Wrong password UI: "Password may be incorrect" with Retry/Forget/Show/Troubleshoot
- Weak signal indicator with "Switch to stronger AP?" suggestion
- Hidden network "Join Other" option
- Per-network settings drawer: static IP, DNS, metered toggle
- Hotspot toggle with SSID/password config
- Airplane mode indicator
- Enterprise auth fields when selecting WPA-Enterprise networks
- Connection state badges (Online/Limited/CaptivePortal/AuthFailed)
- Visual signal strength bars (not just percentage)

**Rewrite `SystemBluetoothPanel.tsx`** (~200L):
- Battery level display per accessory (earbuds L/R/case, keyboard, mouse)
- Audio route section: current output/input, switch button
- Codec indicator (AAC/SBC/aptX)
- "Clean up old devices" action
- Per-device menu: Forget, Reconnection policy, Trust level
- BLE privacy indicator
- Stale device dimming (not seen in 7+ days)

**Rewrite `SystemBatteryPanel.tsx`** (~200L):
- Battery health card: capacity %, cycle count, health rating (Good/Fair/Poor)
- Thermal status with color-coded indicator
- Charger info: wattage, type, slow charger warning
- Optimized charging toggle with schedule visualization
- Top battery consumers list (per-app with CPU/network/wakeup bars)
- Time remaining estimate with confidence range
- Profile selector with visual tuning sliders
- Suspend/resume stability indicator

### Batch 3: System Intelligence Dashboard (~500L)

**Create `src/pages/admin/SYS01SystemIntelligence.tsx`** — 6-tab premium dashboard:

- **Tab 1 — Network Intelligence**: Full WiFi state visualization, captive portal status, signal heatmap, DNS leak indicator, metered network list, auto-VPN trigger history. Visual network topology diagram.

- **Tab 2 — Bluetooth Intelligence**: Device fleet with battery gauges, audio route graph, codec quality indicator, stale device list, reconnection policy grid. Accessory timeline showing connect/disconnect history.

- **Tab 3 — Power Intelligence**: Battery health curve, thermal timeline, charge cycle graph, app drain leaderboard, optimized charging schedule, profile comparison chart. Visual thermal pressure gauge.

- **Tab 4 — Automation Rules**: Active rules list with condition → action visualization, execution history timeline, conflict detector, rule builder preview. Color-coded by domain (network=blue, power=amber, security=red).

- **Tab 5 — Recommendations**: Active system intelligence suggestions with dismiss/accept/snooze. "You joined café WiFi — Shield secured your traffic", "Battery wear increasing — enable optimized charging?", "Bluetooth unused 7 days — turn off?". Each card shows reasoning and confidence.

- **Tab 6 — Diagnostics & Self-Repair**: One-click fix actions (reset network stack, flush DNS, restart Bluetooth, rebuild firewall, verify VPN). Diagnostic test runner with results. System health summary. HAL capability report.

### Batch 4: Full Network Settings Page + Search + Help (~400L)

**Rewrite `src/pages/NetworkUtility.tsx`** as a comprehensive Network & Connectivity Center (~250L):
- WiFi section: current connection details, saved networks, advanced settings
- Bluetooth section: paired devices, audio settings, battery overview
- Shield section: firewall status, VPN status, DNS privacy
- Connectivity diagnostics with live test results
- Network history timeline
- Per-app network usage
- Beautiful glassmorphic cards matching OS design language

**Create `src/lib/os-services/search-indexer.ts`** (~80L):
- Settings registry with deep-link routing
- Searchable system terms (vpn, battery health, firewall, connect headphones)
- Intent/action registry mapping search queries to system actions

**Create `src/lib/os-services/help-engine.ts`** (~70L):
- Help content registry with explainers per system area
- Guided troubleshooting flows
- Remediation action registry (reset network, flush DNS, restart BT, rebuild firewall)
- Safe repair workflow execution

---

## Design Language
- Same glassmorphic style: `bg-black/70 backdrop-blur-3xl`, `border-white/[0.08]`
- WiFi = blue theme, Bluetooth = indigo, Battery = amber/green, Automation = purple, Intelligence = cyan
- Visual signal bars, battery gauges, thermal pressure meters — rich visual components
- Animated state transitions for connection/pairing
- Accessory battery icons with fill levels
- Premium micro-interactions: pulse on connect, fade on disconnect

## File Summary
| Action | File | ~Lines |
|--------|------|--------|
| Create | `src/lib/os-services/wifid.ts` | 150 |
| Create | `src/lib/os-services/btd.ts` | 120 |
| Create | `src/lib/os-services/powerd.ts` | 130 |
| Create | `src/lib/os-services/automationd.ts` | 100 |
| Rewrite | `SystemWifiPanel.tsx` | 200 |
| Rewrite | `SystemBluetoothPanel.tsx` | 200 |
| Rewrite | `SystemBatteryPanel.tsx` | 200 |
| Create | `SYS01SystemIntelligence.tsx` | 500 |
| Rewrite | `NetworkUtility.tsx` | 250 |
| Create | `search-indexer.ts` | 80 |
| Create | `help-engine.ts` | 70 |
| Modify | `AdminRoutes.tsx` | +5 |
| Modify | `AdminDashboard.tsx` | +15 |
| **Total** | **13 files** | **~2,020** |

