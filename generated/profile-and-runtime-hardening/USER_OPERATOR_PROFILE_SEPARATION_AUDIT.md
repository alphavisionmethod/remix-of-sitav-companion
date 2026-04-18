# User vs Operator Profile Separation Audit (Phase A)
Generated: 2026-04-18T12:22:03.293Z
## Manifest Alignment
- App-plane-map entries: **19**
- User profile allowedApps: **9**
- Operator profile allowedApps: **12**
- Manifest mismatches: **2**
### Mismatches
- `search` — declared user-profile but missing from user.profile.json allowedApps
- `search` — declared operator-profile but missing from operator.profile.json allowedApps
## Shared Component Plane Pollution
- Shared files importing admin-only modules (excluding allowlisted `sita/admin`): **0**
_none — shared layer is clean_
See `profile-separation-map.json` for full detail.
