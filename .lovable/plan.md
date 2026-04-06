
# UAO Wave — Unified Ambient Operating System Architecture

## Database Migration (~21 new tables)

| Table | Purpose |
|---|---|
| `device_families` | Phone, watch, desktop, ring, spatial, ambient — with interaction type, trust, sensor support |
| `connected_devices` | User's actual connected devices with trust level, health, reachability |
| `wearable_providers` | Apple Watch, Wear OS, Fitbit, Garmin, Polar, Whoop, Oura, Samsung |
| `wearable_signals` | Ingested signals from wearables (HR, strain, recovery, activity) |
| `readiness_states` | Derived readiness/availability state per user |
| `presence_states` | Active device, surface, focus state, interruption tolerance |
| `context_continuity_records` | What user was doing, assistant thread, active tasks, open approvals |
| `handoff_sessions` | Surface-to-surface handoff tracking |
| `ambient_notification_routes` | Routing rules: what goes where based on urgency/device/state |
| `notification_fatigue_profiles` | Spam/fatigue protection per user |
| `device_trust_records` | Per-device trust level, biometric capability, approval eligibility |
| `micro_approval_policies` | Which approval classes allowed per device class |
| `device_approval_receipts` | Approval receipts including device context |
| `assistant_role_presences` | Which assistant roles are active (chief of staff, strategist, etc.) |
| `proactive_interventions` | Proactive suggestions, reminders, nudges with consent tracking |
| `interruption_policies` | Per-user interruption rules by time, state, device |
| `health_signal_consents` | Explicit consent records for each health signal type |
| `health_signal_privacy` | Privacy tier settings per signal category |
| `user_device_graph_edges` | Links between user identity, devices, wearables, trust |
| `surface_context_states` | Current state per surface (what's open, scroll position, etc.) |
| `ambient_launch_readiness` | Launch honesty per device family / wearable provider |

All with RLS (user_id = auth.uid()).

## Edge Function: `ambient-os-operations`

Actions: `seed_device_families`, `seed_wearable_providers`, `update_presence`, `check_readiness`, `route_notification`, `device_graph_report`, `seed_launch_readiness`

## Admin Pages (8 pages)

| Page | Route | Purpose |
|---|---|---|
| UAO01 — Presence & Continuity Center | `/admin/uao/presence` | Active device, surfaces, handoff, continuity |
| UAO02 — Connected Devices Center | `/admin/uao/devices` | Phones, watches, wearables, trust, sync |
| UAO03 — Ambient Team Control Center | `/admin/uao/team` | Assistant roles, proactive mode, escalation |
| UAO04 — Notification & Escalation Router | `/admin/uao/notifications` | Routing rules, urgency ladders, quiet hours |
| UAO05 — Health/Readiness Signal Center | `/admin/uao/health` | Signal sources, consent, readiness, privacy |
| UAO06 — Micro-Approval & Device Trust | `/admin/uao/trust` | Trusted devices, approval classes, security |
| UAO07 — Cross-Surface Journey Board | `/admin/uao/journeys` | Handoff quality, continuity success |
| UAO08 — Ambient Launch Readiness | `/admin/uao/launch` | Device readiness honesty per family |
