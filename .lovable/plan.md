

# OS Command Center — Master Dashboard + Missing Daemons

## Current State

The project already has **extensive** kernel and OS infrastructure:

**Existing kernel subsystems** (~50 files in `core-services/kernel/`): init-system, system-daemons, process-scheduler, memory-manager, sita-filesystem, sandbox-engine, capability-permission-system, firewall, dns-resolver, tcp-ip-stack, vpn-manager, journal-subsystem, package-manager, driver-manager, config-manager, accessibility-renderer, crypto-subsystem, and more.

**Existing OS daemons** (`os-security/`): authd, sessiond, secretsd, policyd, auditd, notifyd, updated, promptd, controlcenterd, onboardingd, recovery engine.

**Existing OS services** (`os-services/`): wifid, btd, powerd, automationd, search-indexer, help-engine.

**Existing Nova SDK kernel** (`nova-sdk/kernel/`): boot, compositor, crash-resilience, drivers, ipc, memory-manager, power-manager, privilege, process-manager, scheduler, syscall, wayland.

**Existing dashboards**: KernelDashboard (2060L), SEC02SecurityFoundation (721L), SYS01SystemIntelligence (702L), SEC01SessionSecrets.

**What's missing from the prompt:**
1. No `settingsd` daemon (settings backend beyond the SDK settings-service)
2. No `crashd` daemon (crash recovery daemon — recovery.ts exists but not a full crash daemon)
3. No `healthd` daemon (system health monitor)
4. No `timed` daemon (time/clock subsystem service)
5. No `accessibilityd` daemon (accessibility service daemon)
6. No unified **OS Platform Command Center** dashboard that wires ALL subsystems into one beautiful visual hub
7. No **Inbox** with full features (the existing CommunicationInbox is basic mock data)
8. No installer/bootloader UI visualization
9. No unified service wiring dashboard showing the full boot → kernel → daemons → shell pipeline

## Plan — 4 Batches

### Batch 1: Missing Core Daemons (~400L, 5 files)

**Create `src/lib/os-services/settingsd.ts`** (~80L):
- `SettingsDaemon` class — persistent settings backend
- Schema-validated key-value store with namespaces
- Per-user and system-wide settings with change events
- Policy overlay integration
- Settings categories: Display, Sound, Network, Security, Privacy, Accessibility, Power, Storage, Time, Developer

**Create `src/lib/os-services/crashd.ts`** (~80L):
- `CrashDaemon` class — crash report collection and analysis
- Crash dump model with stack traces, signals, PIDs
- Automatic restart coordination with init-system
- Safe mode trigger logic (3 consecutive crashes → safe mode)
- Diagnostic bundle export (logs + crash dumps + config snapshot)
- Crash frequency analytics

**Create `src/lib/os-services/healthd.ts`** (~80L):
- `HealthDaemon` class — system health monitor
- Service health probes (heartbeat, liveness, readiness)
- System resource monitoring (CPU, memory, disk, network)
- Health score computation (0-100)
- Degraded mode detection and notification
- Health history timeline

**Create `src/lib/os-services/timed.ts`** (~80L):
- `TimeDaemon` class — time and clock subsystem
- RTC sync simulation
- NTP/secure time sync client model
- Timezone database with DST handling
- Monotonic clock and scheduler alarms
- Time drift detection and correction

**Create `src/lib/os-services/accessibilityd.ts`** (~80L):
- `AccessibilityDaemon` class
- Screen reader state, magnification level, text scaling
- Reduced motion, keyboard navigation, captions, voice control
- High contrast mode, focus indicators
- Per-app accessibility overrides
- Assistive technology broker

### Batch 2: OS Platform Command Center Dashboard (~800L)

**Create `src/pages/admin/OS01PlatformCommandCenter.tsx`** — 8-tab premium visual dashboard:

**Tab 1 — Boot Pipeline**: Visual boot sequence diagram showing bootloader → kernel → HAL → services → shell. Each stage shows timing, status (green/amber/red), and service dependency graph. Animated boot timeline with service start ordering. Interactive — click any service to see its config, dependencies, and health.

**Tab 2 — Kernel Subsystems**: Visual grid of all kernel components (Memory, Scheduler, FS, IPC, Security, Network, Power, Drivers) with live status indicators, utilization gauges, and performance metrics. Each subsystem card shows: status dot, key metric, mini sparkline. Click to expand detail panel.

**Tab 3 — Service Fleet**: All 25+ system daemons in a visual fleet grid with health status, uptime, restart count, resource usage bars (CPU/Memory). Color-coded by boot target (basic=blue, network=green, security=red, desktop=purple). Filter by status, sort by resource usage.

**Tab 4 — Security Posture**: Unified security overview — trust rings visualization (concentric circles), sandbox status, capability enforcement stats, firewall rule count, VPN status, active threats. Security score gauge with breakdown.

**Tab 5 — Hardware & Drivers**: HAL device tree visualization, loaded drivers with signature status, hotplug event log, device capability matrix. Bus enumeration display (PCI, USB, ACPI). Driver health indicators.

**Tab 6 — Update & Recovery**: A/B slot visualization (active slot highlighted), update channel selector, download progress, health validation status, rollback history timeline. Package manager stats (installed count, pending updates).

**Tab 7 — Settings & Config**: Settings namespace browser, config layer overlay visualization (default → system → user → runtime), recent config changes timeline. Per-daemon config view.

**Tab 8 — Crash & Diagnostics**: Crash timeline with frequency chart, recent crash dumps with expandable stack traces, diagnostic bundle builder, safe mode trigger status, self-repair action buttons (reset network, flush DNS, restart services).

### Batch 3: Advanced Inbox App (~400L)

**Rewrite `src/pages/CommunicationInbox.tsx`** as a full-featured premium inbox:

- **Split-pane layout**: Left panel = message list, right panel = message detail/compose
- **Unified channels**: Email, Messages, Calls, System notifications — each with distinct icons and color coding
- **Smart categories**: Primary, Social, Updates, Promotions — auto-sorted with colored badges
- **Message detail view**: Full message body with rich formatting, attachment previews, reply/forward/archive actions
- **Compose panel**: Rich text editor with formatting toolbar, recipient autocomplete, attachment picker, schedule send
- **Search**: Full-text search with filters (from, date range, channel, has attachment)
- **Thread grouping**: Conversations threaded with expand/collapse
- **Quick actions**: Star, snooze, archive, delete, mark read/unread, label
- **Priority indicators**: High/Normal/Low with visual badges
- **Follow-up tracking**: Pending follow-ups tab with due dates
- **Empty states**: Beautiful illustrations per tab
- **Notification badges**: Unread counts per channel
- Visual design: glassmorphic cards, smooth transitions, avatar circles, subtle gradients

### Batch 4: Route Registration + Wiring (~50L)

**Modify `AdminRoutes.tsx`**: Register `OS01PlatformCommandCenter` route at `/admin/os-platform`

**Modify `AdminDashboard.tsx`**: Add "OS Platform" card linking to the new dashboard

**Wire inbox**: Ensure CommunicationInbox is properly routed and accessible from desktop shell

---

## Design Language
- Glassmorphic: `bg-card/50 backdrop-blur-xl border-border/30`
- Status colors: emerald=healthy, amber=warning, red=critical, blue=info
- Visual elements: progress bars, sparklines, gauge meters, concentric ring diagrams, animated boot timelines, tree visualizations
- Rich iconography from lucide-react throughout
- Smooth framer-motion transitions on all cards and tabs
- Interactive drill-downs: click any card/service to see expanded details

## File Summary
| Action | File | ~Lines |
|--------|------|--------|
| Create | `os-services/settingsd.ts` | 80 |
| Create | `os-services/crashd.ts` | 80 |
| Create | `os-services/healthd.ts` | 80 |
| Create | `os-services/timed.ts` | 80 |
| Create | `os-services/accessibilityd.ts` | 80 |
| Create | `admin/OS01PlatformCommandCenter.tsx` | 800 |
| Rewrite | `CommunicationInbox.tsx` | 400 |
| Modify | `AdminRoutes.tsx` | +10 |
| Modify | `AdminDashboard.tsx` | +15 |
| **Total** | **9 files** | **~1,625** |

