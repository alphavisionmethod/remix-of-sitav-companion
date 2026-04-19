# Mobile Reactivation Conditions

> Generated: 2026-04-19 · Future-proofing checklist

Native mobile may **only** return to active scope when **every** condition below is satisfied. This file is the operational checklist a future mobile program must clear before any "mobile is back" claim is allowed.

## 1. Strategic decision

- [ ] Signed decision document with named accountable owner
- [ ] Budget and headcount allocated for ongoing mobile maintenance
- [ ] Decision reflected in `docs/PLATFORM_SCOPE.md` and `docs/MOBILE_HONESTY.md`

## 2. External accounts

- [ ] Apple Developer Program membership active (annual fee paid)
- [ ] Google Play Console enrollment active (one-time fee paid)
- [ ] App Store Connect API keys provisioned in CI
- [ ] Google Play Service Account JSON provisioned in CI

## 3. Signing material

- [ ] Apple Distribution Certificate (.p12) in CI secret
- [ ] Apple Provisioning Profile in CI secret
- [ ] Apple Team ID configured
- [ ] Android keystore (.jks) in CI secret
- [ ] Android key alias + passwords in CI secrets

## 4. Push transport truth

- [ ] APNs auth key (.p8) provisioned and tested end-to-end
- [ ] FCM service account provisioned and tested end-to-end
- [ ] Push receipts visible in operator surfaces
- [ ] Push claim safety validator updated to expect live transports

## 5. Real-device QA

- [ ] iOS QA matrix: cold start, memory, battery, deep links, offline, accessibility
- [ ] Android QA matrix: cold start, memory, battery, deep links, offline, accessibility
- [ ] Crash reporter wired and verified on real devices
- [ ] App-quality review sign-off recorded

## 6. Code & repo restoration

- [ ] `archive/capacitor/capacitor.config.ts` → restored to repo root
- [ ] `archive/infra/mobile.yaml` → restored to `infra/deploy/mobile.yaml`
- [ ] `archive/mobile/` → restored to `mobile/`
- [ ] `@capacitor/*` deps reinstalled at compatible majors
- [ ] Native bridge code in `archive/mobile-platform-native/` reactivated

## 7. Governance & validation

- [ ] All 5 mobile-scope-closure BLOCK validators reconfigured for the live posture
- [ ] `MobileScopeTruthPanel` updated to reflect "active" status
- [ ] `mobile-scope-status.json` flipped to `{status: "ACTIVE"}`
- [ ] Launch-honesty docs reconciled
- [ ] Release aggregator BLOCK list updated to require new mobile gates (signing, push, real-device QA)

## 8. Launch posture

- [ ] First public TestFlight build accepted by Apple
- [ ] First public internal-track build accepted by Google
- [ ] Operator dashboards confirm 7-day green streaks for mobile gates
- [ ] User-facing claims updated only **after** the above are true

## Anti-pattern guard

> Until **every** box above is checked, no surface in the repo may say or imply that SITA OS has a current native mobile app. Drift triggers BLOCK gates.
