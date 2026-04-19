# Mobile Architecture Truth Audit

> Generated as part of the Mobile Deployment Readiness Closure pass.
> Scope: every mobile-related reference in the repo, classified as **canonical**, **drift**, or **deferred-but-correct**.

## Audit summary

| Status | Count | Notes |
|---|---|---|
| Capacitor as canonical stack | ✅ confirmed | `capacitor.config.ts` present, all build scripts use `npx cap` |
| Flutter drift removed from claim surfaces | ✅ post-fix | `src/planes/MOBILE_MANIFEST.md`, `infra/deploy/mobile.yaml` rewritten |
| Flutter mentions remaining (legacy docs, disavowed) | 🟡 acceptable | `docs/REAL_VS_SIMULATED.md` and `docs/refactor/runtime-map.md` reference Flutter only to disavow it (historical record) |
| Mobile push posture | ✅ explicitly deferred | APNs + FCM gated; web-VAPID is the real transport |
| iOS templates location | ✅ deliberate | `archive/ios-templates/` documented as honest deferred location |

## References found and classified

### Capacitor (canonical) ✅
| File | Role |
|---|---|
| `capacitor.config.ts` | Stack truth root |
| `scripts/android/bootstrap.sh` | Cold-start path |
| `scripts/release/android/build-android.sh` | Signed AAB |
| `scripts/release/ios/build-ios.sh` | Signed `.ipa` (NEW in this pass) |
| `archive/ios-templates/App/Podfile` | iOS pod template (deferred location) |
| `mobile/android/AndroidManifest.permissions.xml` | Android permissions |
| `mobile/ios/Info.plist.template` | iOS plist template |
| `mobile/ios/PrivacyInfo.xcprivacy` | iOS privacy manifest |
| `mobile/store-metadata/android.json` | Play listing |
| `mobile/store-metadata/ios.json` | App Store listing |
| `mobile/store-metadata/android.data-safety.json` | Data safety |

### Flutter (legacy/disavowed) 🟡 acceptable
| File | Disposition |
|---|---|
| `docs/REAL_VS_SIMULATED.md` | Historical "no Flutter exists" disavowal — **kept** as proof of past truth |
| `docs/refactor/runtime-map.md` | Migration sketch superseded — **kept** for archaeology |
| `docs/architecture/MIGRATION-BLUEPRINT.md` | Mentions "React Native or Flutter" — **kept**, never canonical |

> These remain because removing them would erase honest historical context. They are NOT scanned by `check-no-flutter-mobile-truth-drift.ts` (which scopes only to `src/planes/`, `generated/manifests/`, `infra/deploy/`, `mobile/`).

### Flutter (drift, fixed in this pass) ✅
| File | Before | After |
|---|---|---|
| `src/planes/MOBILE_MANIFEST.md` | `/mobile/flutter_app/lib/` migration target | Rewritten — Capacitor canonical, no Flutter |
| `infra/deploy/mobile.yaml` | `flutter:` build steps + `flutter pub get` | Rewritten — `capacitor:` block, `bootstrap:` paths |

## Deferred-but-correct artifacts

| Artifact | Why deferred is correct |
|---|---|
| `archive/ios-templates/` | App Store submission gated on Apple Developer membership; promoting templates out of archive before then would imply false readiness |
| `mobile/android/FCM.md` (status: deferred) | FCM credentials require Firebase Console access; web-VAPID covers push until then |
| `mobile/ios/SIGNING.md` (status: deferred) | iOS signing requires 7 secrets and active Apple membership |
| Mobile push capability claims (gated in UI) | `check-mobile-push-claim-safety.ts` enforces |

## Scan methodology

```bash
# Active claim surfaces — Flutter forbidden
grep -rn "\bflutter\b" src/planes infra/deploy mobile

# Legacy archaeological docs — Flutter mentions allowed when disavowed
grep -rn "\bflutter\b" docs
```

## Conclusion

Mobile architecture truth is **fully reconciled**. Capacitor is canonical and enforced by two regression-protected validators. Flutter mentions remain only in archaeological documentation that explicitly disavows them, providing honest historical context without creating drift.
