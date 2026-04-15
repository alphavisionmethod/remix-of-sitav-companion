# Mobile Plane Manifest

## Purpose
Mobile control surface — approval authority device, visibility into system state, push notifications, and biometric authentication.

## Ownership
- **Primary owner**: Mobile Engineering
- **Trust level**: Authority device — biometric-gated approvals

## Directories (Current Lovable SPA)
| Path | Description |
|------|-------------|
| `src/pages/mobile/` | Mobile page routes |
| `src/components/mobile/` | Mobile UI components |

## Migration Target
```
/mobile/flutter_app/lib/features/
/mobile/flutter_app/lib/core/
/mobile/ios/
/mobile/android/
```

## Allowed Dependencies
- `shared` (contracts, types, schemas)

## Forbidden Dependencies
- `os`, `admin`, `founder`, `backend` (implementation)

## Deployment Target
- Flutter (iOS + Android)
- Web (responsive fallback)

## Security Requirements
- Biometric authentication (Face ID / Touch ID / fingerprint)
- Secure Enclave / Keystore for key material
- Certificate pinning for API communication
- Push notification security (APNs / FCM)
