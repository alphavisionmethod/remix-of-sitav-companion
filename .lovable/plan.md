

# Device & Wearable Ambient Expansion — Gap Fix Plan

## What Already Exists (Fully Built)

| Layer | Status |
|---|---|
| **Database (18 tables)** | Complete — `connected_devices`, `device_families`, `presence_states`, `handoff_sessions`, `context_continuity_records`, `wearable_providers`, `wearable_signals`, `health_signal_consents`, `readiness_states`, `ambient_notification_routes`, `notification_fatigue_profiles`, `interruption_policies`, `device_trust_records`, `micro_approval_policies`, `device_approval_receipts`, `assistant_role_presences`, `proactive_interventions`, `ambient_launch_readiness` |
| **DWE Types** | Complete — 18 typed row exports in `dwe-types.ts` |
| **Device Family Contract** | Complete — 200-line canonical contract with surface strategy matrix, phase roadmap, wearable roles |
| **7 DWE Admin Pages** | Complete — DWE01–DWE07 with real Supabase queries, typed data |
| **8 UAO Admin Pages** | Complete — UAO01–UAO08 with real queries and DemoModeBadge |
| **Routes** | Complete — All 15 pages routed in App.tsx |
| **Edge Functions** | Complete — `device-telemetry`, `ambient-os-operations`, `ecosystem-operations` |
| **Device Presence Service** | Complete — `device-presence-service.ts` + `DevicePresenceIndicator` component |

## Gaps Found (3 Issues)

### Gap 1: No DWESubNav
DWE01–DWE07 pages have no sub-navigation. Every other admin group (CN, RCP, LT, AR, AIG, SAG) has one.

### Gap 2: No UAOSubNav
UAO01–UAO08 pages also have no sub-navigation bar.

### Gap 3: No Command Palette Entries
Zero entries for DWE (7 pages) or UAO (8 pages) in UniversalCommandSurface. Not discoverable via Cmd+K.

## Implementation Steps

1. **Create `src/components/admin/DWESubNav.tsx`** — 7 tabs (Devices, Presence, Wearables, Notifications, Trust, Assistant, Launch) + "Related" cross-links to UAO overview and Device Presence
2. **Create `src/components/admin/UAOSubNav.tsx`** — 8 tabs (Presence, Devices, Team, Notifications, Health, Trust, Journeys, Launch) + "Related" cross-links to DWE devices and Device Presence
3. **Inject DWESubNav** into all 7 DWE pages
4. **Inject UAOSubNav** into all 8 UAO pages
5. **Add 15 Command Palette entries** — 7 for DWE, 8 for UAO in UniversalCommandSurface.tsx
6. **Verify clean build**

### Technical Details
- DWESubNav/UAOSubNav: ~75 lines each, same pattern as RCPSubNav/CNSubNav
- 15 page edits: ~3 lines each (import + render)
- Command palette: ~30 lines for 15 entries
- No new tables, edge functions, or migrations needed

