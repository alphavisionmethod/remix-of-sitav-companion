# Phase Q — Adoption Expansion & Block-Level Graduation
**Generated:** 2026-04-18
**Status:** ✅ COMPLETE — `deployable=true` maintained

## Scope
Phase Q built on the K–P deployment-gap-closure foundation by:
1. Fixing one true-positive bug in evidence generation (offline-db path).
2. Upgrading `useDraftAutosave` to dual-layer persistence (localStorage + IndexedDB).
3. Wiring `useDraftAutosave` into 2 high-value real surfaces (CRMNotes new-note form, CommunicationsCenter composer).
4. Graduating 4 stable warn-level gates to **block-level**.

## Changes

### Code changes (non-destructive, additive)
| File | Change |
|---|---|
| `src/hooks/useDraftAutosave.ts` | Dual-write: localStorage (immediate) + IndexedDB backup (durable, 7-day TTL). Async restore from IndexedDB if localStorage is empty. Behaviour fully backward compatible with existing call sites. |
| `src/pages/business/CRMNotes.tsx` | Wired `useDraftAutosave<NoteForm>("business:crm:note:new")`. Drafts auto-save on every keystroke (debounced 1.5s), restored on revisit, cleared on successful create. |
| `src/pages/business/CommunicationsCenter.tsx` | Wired `useDraftAutosave<CommForm>("business:comm:new")`. Email/SMS composer now survives accidental tab close. |

### Evidence-generator fix
| File | Change |
|---|---|
| `scripts/architecture/audits/generate-deployment-gap-evidence.ts` | Lines 120–124: `offlineDb` path now resolves real location `src/data/persistence/offline-db.ts` (was hardcoded to non-existent `src/lib/offline/offline-db.ts`). True-positive fix — `mobile-offline-truth-map.webOfflineDbExists` now correctly reports `true`. |

### Gate graduations (warn → block)
| Gate | Old | New | Reason |
|---|---|---|---|
| `check-autosave-adoption` | warn (min 0) | **block** (min 2) | Phase Q baseline established (CRMNotes + CommunicationsCenter). Prevents regression. |
| `check-window-snap-integration` | warn | **block** | `SnapGuideOverlay` mounted in `AppWindow` since Phase M; never to regress. |
| `check-mobile-offline-persistence` | warn | **block** | Truth-classification + IndexedDB existence both now verified end-to-end. |
| `check-connector-oauth-hardening` | warn | **block** | Google `real-implementation` + all providers labeled — never to regress. |

## Final gate matrix

| Gate | Status |
|---|---|
| App Store install flow | ✅ warn (real, 8 consumers) |
| File picker adoption | ✅ warn (≤6 raw inputs baseline) |
| **Autosave adoption** | ✅ **block** (≥2 consumers) |
| **Window snap integration** | ✅ **block** (fully-integrated) |
| **Mobile offline persistence** | ✅ **block** (honestly-archived + IndexedDB) |
| Search source coverage | ✅ warn (≥2 consumers, 13 domains) |
| AI cost metering | ✅ warn (real, 36 ledger writers) |
| **Connector OAuth hardening** | ✅ **block** (Google real, others labeled) |
| Frontend/Backend substrate | ✅ warn (12/15 real, 80%) |
| DB truth completeness | ✅ warn (complete) |
| Manifest truth completeness | ✅ warn (162 artifacts) |
| Supportability coverage | ✅ warn (operationally-mature) |

**Total:** 12/12 deployment-gap gates pass, 4 now block-level, 0 TypeScript errors.

## Verification

```bash
npm run gap-closure:evidence   # regenerate maps
npm run gap-closure:gates      # 12/12 pass
npx tsc --noEmit                # 0 errors
```

## Deliverables
- This certificate: `generated/deployment-gap-closure/PHASE_Q_GRADUATION_CERTIFICATE.md`
- Updated evidence maps (12 JSON, 14 MD)
- Updated hardening baseline + attestation (resealed via `npm run hardening:reseal`)

## Next-phase candidates
- **Phase R:** Wire 5 more autosave consumers (raise block-level baseline to ≥7).
- **Phase R:** Migrate top 3 raw `<input type="file">` sites to canonical picker; lower baseline to ≤3.
- **Phase R:** Implement Microsoft OAuth refresh in `connector-token-refresh` (graduates `microsoft` from `manual` to `real-implementation`).
- **Phase R:** Increase FE/BE substrate matrix coverage from 80% → 90%.


---

## Active Caveats

The following P1 evidence gaps remain open as of 2026-04-18. Status claims in this document are made **subject to** this list:

| # | Caveat | Owner | Tracking |
|---|---|---|---|
| 1 | TPM hardware proof on real hardware | Trust Council | `generated/final-hardening/MOK_TEST_MATRIX.md` |
| 2 | Production-shape restore drill — first scheduled live execution | DR Owner | `generated/restore-and-oauth-hardening/PRODUCTION_RESTORE_DRILL_RUNBOOK.md` |
| 3 | OAuth refresh probe — 7-day continuous health window | Connectors Owner | `generated/restore-and-oauth-hardening/OAUTH_REFRESH_PROBE_LOGGING_AND_RECEIPTS.md` |
| 4 | Boardroom L7 follow-through — operator-trained runbook drill | Boardroom Owner | `generated/final-hardening/BOARDROOM_FOLLOWTHROUGH_RUNBOOK.md` |
| 5 | MOK per-distro live tests — Fedora 40 + Arch | Install Owner | `generated/final-hardening/MOK_TEST_MATRIX.md` |

Until each caveat is independently closed with evidence linked from the corresponding tracking doc, **deployability claims must be read together with this list**, not in isolation.

Policy: `generated/claim-safety-hardening/DEPLOYMENT_WORDING_POLICY.md`
