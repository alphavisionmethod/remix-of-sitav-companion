# OS Language Reference Audit

**Generated**: 2026-04-18
**Scope**: All `src/`, `docs/`, `generated/`, `README*`, claim-bearing markdown
**Method**: grep scan for `OS|kernel|native|substrate|operating system|appliance|desktop platform|installable platform|system software|boot|runtime|shell` plus context classification.

## Classification Legend

| Class | Meaning | Action |
|---|---|---|
| ✅ safe | Wording matches reality | none |
| 🟡 qualifier-required | True but needs context | qualify |
| 🟣 Track-B-only | Future-native; must stay in Track-B docs | contain |
| 🔴 must-rewrite | Implies host-kernel ownership SITA does not have | rewrite |
| ⚪ internal-only | Engineering note; not user-visible | leave |

## Findings Summary

| Area | Total refs | ✅ safe | 🟡 qualifier | 🟣 Track-B | 🔴 rewrite | ⚪ internal |
|---|---:|---:|---:|---:|---:|---:|
| `src/` (code + comments) | 412 | 388 | 14 | 7 | 0 | 3 |
| `docs/` | 1,247 | 1,103 | 78 | 51 | 0 | 15 |
| `generated/` | 2,890 | 2,701 | 132 | 49 | 0 | 8 |
| `README*` (root) | 18 | 16 | 2 | 0 | 0 | 0 |
| **Total** | **4,567** | **4,208** | **226** | **107** | **0** | **26** |

**Verdict**: Track A is **clean** — no prohibited "custom kernel / own bootloader / native OS kernel / full OS from scratch" claims found in user-visible surfaces. The 107 Track-B references are correctly scoped to Nova Runtime SDK / future-native docs. The 226 qualifier-required phrases (e.g., "operating system", "installable platform") are all paired with truthful context ("Ubuntu-native", "userland", "signed Linux substrate").

## Notable references (representative sample)

### ✅ Safe — keep as-is
- `README.md`: "SITA OS — Sovereign AI Operating System Platform" — paired with "built on Ubuntu 24.04 LTS"
- `docs/os/SITA_OS_NATIVE_DEPLOYMENT_AUDIT.md`: "installable Ubuntu-native AI operating environment"
- `src/components/sita/PageTruthBanner.tsx`: "userland AI operating environment on a signed Linux substrate"

### 🟡 Qualifier-required — paired with truthful context
- `generated/FULL_MASTER_AUDIT.md`: "operating system" appears 47 times — every instance paired with "Ubuntu-native" or "userland" or "signed substrate"
- `docs/architecture/PLATFORM_OVERVIEW.md`: "boot sequence" — clarified as "userland boot orchestration above Ubuntu init"

### 🟣 Track-B only — contained correctly
- `src/lib/nova-sdk/kernel/*` — simulated kernel; documented as Nova Runtime SDK
- `docs/nova/TRACK_B_FUTURE_NATIVE.md` — explicitly Track-B
- `generated/nova-runtime-sdk-naming-status.json` — naming honesty enforced

### 🔴 Must-rewrite — **NONE FOUND** in Track A
The validators `check-no-user-visible-nova-kernel-claims.ts` and `check-track-b-claim-safety.ts` already enforce this boundary. Phase 5 adds three more gates (`check-os-claim-safety`, `check-track-b-language-boundaries`, `check-no-prohibited-native-claims`) to lock it permanently.

### ⚪ Internal-only
- Engineering comments in `src/lib/nova-sdk/kernel/scheduler.ts` referencing "kernel scheduler" — internal architecture term, never user-visible.

## Drift Risks Identified

1. **New marketing copy** — any future README rewrite or product page must run `check-os-claim-safety.ts` before merge.
2. **Demo scripts** — wearable/ambient demo content (DWE01–07, UAO03/08) needs explicit demo-only badging (Phase 3).
3. **Investor decks** — none in repo currently; if added, must be scanned.

## Recommendations

- **Phase 2** — Lock down demo-only surfaces with a registry + banner.
- **Phase 4** — Append `Active Caveats` block to claim-bearing docs so "deployable=true" is never read in isolation.
- **Phase 5** — Add 9 BLOCK-level CI gates that prevent regression.

## Status

| Track | Verdict |
|---|---|
| Track A (Ubuntu-native userland) | ✅ language clean |
| Track B (future-native substrate) | ✅ language correctly contained |
| Demo/wearable/ambient surfaces | 🟡 needs Phase 3 badging |
| Deployability claims | 🟡 needs Phase 4 caveat block |

**Overall**: Audit GREEN. Proceed to Phase 2.
