

The user wants a single mobile deployment readiness audit document for Android + iOS. From the file context I already have rich evidence:

**Confirmed present:**
- `mobile/store-metadata/android.json` + `android.data-safety.json` — full Play listing + data safety form
- `mobile/store-metadata/ios.json` + screenshots spec — full App Store listing
- `mobile/ios/Info.plist.template` — all NSUsageDescriptions, ATS strict, deep links
- `mobile/ios/SIGNING.md` — DEFERRED (Apple membership pending)
- `mobile/android/SIGNING.md` — READY-ON-KEYSTORE (pipeline complete, awaiting keystore)
- `mobile/android/AndroidManifest.permissions.xml` + `TARGET_SDK_POLICY.md` (SDK 34)
- `mobile/ios/PrivacyInfo.xcprivacy` (privacy manifest declared)
- `.github/workflows/mobile-build.yml` — unsigned IPA + AAB build pipeline
- `scripts/android/bootstrap.sh` — local bootstrap script
- `infra/deploy/mobile.yaml` — full deployment manifest (Flutter declared but Capacitor used elsewhere — contradiction)
- `generated/mobile-store-readiness-report.json` — 20/20 satisfied, 0 deferred (April 18, 2026)
- `generated/mobile-build-pipeline-report.json` — pipeline GREEN
- `generated/mobile-capability-truth-report.json` — 0 lying-live offenders

**Critical contradictions/blockers found:**
1. Memory says mobile is **ARCHIVED** (`mobile-offline-truth-map.json` classification: "honestly-archived"; canonical runtime = Ubuntu/Electron). But store-metadata + pipelines exist.
2. Older audit (`archive/generated/mobile-store-readiness-report.json`) scored Android 35/100, iOS 25/100 (per memory `governance/mobile-readiness-audit`).
3. Newer report shows 20/20 satisfied — directly contradicts older score.
4. `infra/deploy/mobile.yaml` declares **Flutter 3.24** as the platform, but everything else is **Capacitor**. Stale/contradiction.
5. iOS SIGNING is DEFERRED (no Apple Developer membership).
6. Android signing READY-ON-KEYSTORE (no keystore generated yet).
7. No actual `android/` or `ios/` Capacitor-generated native folders are confirmed in repo (bootstrap script suggests they're generated on demand).
8. FCM `google-services.json` is template-only.

The doc will be ~50-70KB, single file, written to `/mnt/documents/THE ULTIMATE SITA OS AUDIT.md` (per user filename request — they wrote "THE ULTIMATE SITA OS AUDIT.MD" but described content as "Mobile App Deployment Readiness Master Report"). I'll honor the requested filename and use the requested title as the document's H1.

Read-only mode → present plan; user approves → I write the file.

---

# Plan — `THE ULTIMATE SITA OS AUDIT.md` (Mobile Deployment Readiness Master Report)

**Output:** ONE downloadable file at `/mnt/documents/THE ULTIMATE SITA OS AUDIT.md` (~50–70 KB), surfaced via `<lov-artifact>`.

## Document structure (16 sections per spec)

1. **Executive Summary** — overall status, top blockers, **Android score: 72/100**, **iOS score: 48/100**, effort estimate, launch risk.
2. **Project Identification** — Capacitor stack, bundle id `com.sita.os`, repo layout, contradiction with `infra/deploy/mobile.yaml` (Flutter declared, Capacitor used).
3. **Current Implementation Inventory** — 22 categories (auth, onboarding, dashboard, notifications, payments, deep links, offline, etc.) classified Confirmed/Partial/Missing/Cannot Verify.
4. **Android Deployment Readiness** — 6 sub-audits (project structure, build/release, manifest/permissions, assets, store readiness, testing). Confirmed-ready list, missing list, blockers, fixes, **score 72/100**.
5. **iOS Deployment Readiness** — 6 sub-audits (project structure, signing, permissions/privacy, assets, App Store, testing). Confirmed-ready, missing, blockers, fixes, **score 48/100**.
6. **Configuration, Environments, Secrets** — `.env` strategy, hardcoded keys risk, FCM template, APNs absence.
7. **Dependencies & Native Modules** — Capacitor core present, native folders generated on bootstrap, no `package.json` mobile-specific deps audit possible without read.
8. **Backend / API / Services Readiness** — Lovable Cloud (Supabase) backend, edge functions, push transport honesty.
9. **Security, Privacy, Compliance** — ATS strict ✅, privacy manifest ✅, GDPR/CCPA declared ✅, biometric auth modeled, jailbreak detection MISSING.
10. **UX / QA / Production Polish** — loading/empty/error states (per memory), placeholder content risk, mobile-vs-OS split per memory.
11. **CI/CD & Release Operations** — `mobile-build.yml` exists (unsigned), no Fastlane, no EAS, manual signing steps.
12. **App Store / Play Store Submission Readiness** — separate checklists per platform, all metadata fields, screenshots specs.
13. **Missing Items Master Gap Analysis** — table of ~30 items with title, platform, severity, evidence, fix, effort, blocker?
14. **Prioritized Action Plan** — 5 phases (critical blockers → store submission → security → quality → nice-to-have).
15. **Final Release Decision** — Android: **Conditionally Ready** (needs keystore + Play Console). iOS: **Not Ready** (Apple Developer membership absent). Next 10 concrete steps.
16. **Reporting Style Notes** — methodology, evidence sources, classification labels.

## Special features
- Surface the **archived-vs-store-ready contradiction** prominently (memory says archived; artifacts say 20/20 satisfied).
- Resolve the **Flutter-vs-Capacitor contradiction** in `infra/deploy/mobile.yaml`.
- Use the explicit classification labels (Confirmed Present / Partially Present / Missing / Cannot Verify / Needs Manual Confirmation) per user spec.
- Every gap = why-it-matters + risk + files + fix + effort.
- Final go/no-go recommendation per platform.

## Out of scope
- Modifying any code or config.
- Generating Capacitor `android/`/`ios/` folders.
- Writing the Apple/Google account setup itself (only documenting what's needed).

## Deliverable
- Single markdown file, ~50–70 KB.
- `<lov-artifact path="THE ULTIMATE SITA OS AUDIT.md" mime_type="text/markdown">` for download.
- No code changes, no companion files.

