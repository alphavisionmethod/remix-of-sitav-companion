# Demo-Only Surface Audit

**Generated**: 2026-04-18
**Source of truth**: `src/lib/claim-safety/demo-only-surface-registry.ts`

## Surfaces classified

| Surface ID | Page | Containment | Go-Live Posture |
|---|---|---|---|
| DWE01 | Connected Devices Center | demo_only | preview-pending-evidence |
| DWE02 | Presence & Continuity Center | demo_only | preview-pending-evidence |
| DWE03 | Wearable Signals Center | demo_only | preview-pending-evidence |
| DWE04 | Notification Routing Studio | demo_only | preview-pending-evidence |
| DWE05 | Device Trust & Approvals Center | demo_only | preview-pending-evidence |
| DWE06 | Ambient Assistant Center | future_vision | future-vision-research |
| DWE07 | Device Launch Honesty Board | internal_preview | demo-only-permanent |
| UAO03 | Ambient Team Control | future_vision | future-vision-research |
| UAO08 | Ambient Launch Readiness | internal_preview | demo-only-permanent |

**Total**: 9 surfaces classified.

## Classification Rationale

### `demo_only` (5 surfaces — DWE01–DWE05)
Wearables, presence, signals, routing, and device-trust surfaces show **seeded or simulated data**. Real-device pipelines (BLE pairing, HRV streams, TPM-attested device trust) are not on the current launch track. Marking these `demo_only` keeps them visible as **product demos** while preventing operators or users from interpreting the data as live.

### `internal_preview` (2 surfaces — DWE07, UAO08)
Operator-only readiness/honesty boards. Not user-facing. They consume the registry to show which device/ambient surfaces are demo-only. Tagging `internal_preview` ensures they aren't accidentally exposed in user navigation.

### `future_vision` (2 surfaces — DWE06, UAO03)
Ambient assistant + ambient team control are **research demos**. There is no concrete launch track. The `future_vision` containment makes the speculative nature explicit.

## Containment Treatment (applied in Phase 3)

Every surface in the registry receives:

1. **`<DemoOnlyBanner surfaceId={...} />`** at top of page render (above header).
2. **Inline `<FutureVisionBadge containment={...} />`** in the page header next to the title.
3. **Operator visibility** on `DWE07DeviceLaunchHonestyBoard` — live truth board reading the registry.
4. **CI enforcement** by three Phase-5 gates that fail if a registered surface is missing the banner.

## Drift Risk Mitigation

- **Adding a new wearable/ambient page** requires adding it to the registry, otherwise the page is unbadged → `check-device-surface-claim-safety.ts` warns.
- **Removing a banner** from a registered page → `check-demo-only-surface-badging.ts` fails BLOCK-level.
- **Promoting a surface to live** requires removing it from the registry AND providing evidence (test harness, real data pipeline) — operator gate.

## Verdict

✅ All 9 known wearable/ambient/spatial surfaces classified and registered.
✅ Containment model defined and enforceable.
✅ Ready for Phase 3 wiring.
