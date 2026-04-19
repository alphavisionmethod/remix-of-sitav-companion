# Mobile Canonical Truth Model

> Single source of truth for mobile in SITA OS. All other docs, validators, and CI gates derive from this model.

## The model

| Dimension | Truth |
|---|---|
| **Primary runtime** | Ubuntu 24.04 + Electron (`memory/features/platform-runtimes`) |
| **Mobile role** | Secondary supported distribution surface, optional companion to desktop |
| **Mobile stack** | **Capacitor 6** wrapping the Lovable SPA — one codebase, two surfaces |
| **iOS distribution** | Capacitor iOS, App Store via TestFlight, **account-blocked** on Apple Developer membership |
| **Android distribution** | Capacitor Android, Play Store via internal track, **secret-blocked** on upload keystore |
| **Mobile push (APNs)** | **Deferred** — gated on Apple Developer membership |
| **Mobile push (FCM)** | **Deferred** — gated on Firebase service-account |
| **Real push transport** | Web VAPID (active, shipped) + Ubuntu-native notifications |
| **Flutter** | **Not used.** Earlier sketches abandoned. Drift forbidden in claim surfaces. |
| **Readiness posture** | **Honest deferred** — gates report GREEN-with-WARN, not RED, because mobile is secondary |

## What this model rejects

- ❌ "Mobile-first" framing — desktop is primary
- ❌ A second mobile stack (React Native, Flutter, native Swift/Kotlin app)
- ❌ Implicit "mobile push works" claims when APNs/FCM are deferred
- ❌ Direct keystore/cert commits to repo
- ❌ Treating Apple-membership absence as a code defect (it is an external blocker)

## What this model commits to

- ✅ One Capacitor codebase, fed by the existing Lovable SPA
- ✅ Reproducible cold-start: `bash scripts/android/bootstrap.sh` produces a debug APK with only Node + JDK 17
- ✅ Reproducible iOS cold-start on `macos-14`: `bash scripts/release/ios/build-ios.sh` produces an unsigned `.ipa`
- ✅ Signing flips from "blocked" → "ready" the moment env vars/secrets exist — no code changes needed
- ✅ Mobile gates registered in the 117-gate aggregator at **WARN-tier** (not BLOCK), so desktop releases are not gated on Apple membership
- ✅ Operator playbook (`STORE_SUBMISSION_OPERATOR_PLAYBOOK.md`) describes every step from `git pull` to "live in TestFlight / Play internal"

## Blocker classification (canonical)

| Class | What it means | Examples |
|---|---|---|
| `code-complete` | All source-controlled artifacts present and correct | Bootstrap scripts, Capacitor config, store metadata, manifests |
| `secret-blocked` | Code is ready; needs CI env var to execute | Android keystore, Android key alias/passwords |
| `account-blocked` | Code is ready; needs external account/membership | Apple Developer Program, App Store Connect |
| `metadata-blocked` | Code is ready; needs human-curated content | Screenshots matrix, store descriptions, support URLs |
| `review-blocked` | Submitted; awaiting platform review | Play Console review queue, App Store review queue |

These classes are enforced by `scripts/validation/check-mobile-submission-blockers.ts`.

## Governance

- Two regression validators (`check-mobile-canonical-stack`, `check-no-flutter-mobile-truth-drift`) prevent stack drift.
- Three release-path validators (Android, iOS, push) enforce reality.
- One blocker validator (`check-mobile-submission-blockers`) keeps the classification honest.
- All six are registered in the master release aggregator as WARN-tier mobile gates.
