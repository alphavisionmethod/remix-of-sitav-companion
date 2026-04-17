# SITA OS — Update & Rollback Strategy

**Model:** A/B slot, atomic, image-based. **One** strategy, no parallel mechanism.

## Components

| File | Role |
|---|---|
| `os/scripts/build-update-bundle.sh` | packages new ISO into `.bundle` + signs |
| `os/scripts/verify-update-bundle.sh` | sha256 + signature + min-prev-version checks |
| `os/scripts/rollback-to-previous.sh` | flips A↔B and reboots |
| `os/image-builder/services/sita-updated*` | systemd timer + agent (already shipped) |
| `os/update/channel-manifest.template.json` | template that build script fills in |
| `supabase/functions/os-update-manifest` | edge fn that serves channel manifests |

## Channels

`stable` · `beta` · `dev` — selected at install time, written to
`/etc/sita/channel`. Agent only fetches its own channel.

## Apply flow

```
sita-updated.timer ─► sita-updated --check
                        ├─ GET https://updates.sita.os/channel/<channel>.json
                        ├─ if newer: download .bundle + .sig
                        ├─ verify-update-bundle.sh
                        ├─ extract to inactive slot (A or B)
                        ├─ write loader entry sita-<inactive>.conf
                        ├─ set default in loader.conf
                        └─ schedule reboot (or wait for next idle window)
```

## Boot health + auto-rollback

systemd-bless-boot tracks successful boots. If the new slot fails to reach
`graphical.target` twice in a row, `rollback-to-previous.sh` runs
automatically (configured in the recovery target).

## Receipts

- `out/sita-os-<v>.bundle.manifest.json` — provenance of the bundle
- `out/channel-<channel>.json` — the manifest published to the update server
- `/var/lib/sita/rollbacks/*.json` — every rollback event
