# SITA OS Update Channel Manifests

The update server (`supabase/functions/os-update-manifest`) reads the
**runtime** channel manifest from this directory after each successful
release build:

| File | Purpose |
|---|---|
| `channel-manifest.template.json` | template `os/scripts/build-update-bundle.sh` fills in |
| `bundle-manifest.template.json`  | template embedded inside each `.bundle` |

Per-channel runtime manifests are written to `out/channel-<name>.json`
(stable / beta / dev) and uploaded to the update CDN. The edge function
reads them from Supabase Storage bucket `os-updates/`.

## Manifest schema (channel-manifest.template.json)

```jsonc
{
  "schema": "sita-os-update-channel/v1",
  "channel": "stable",
  "current": {
    "version": "0.2.0",
    "released": "2026-04-17T00:00:00Z",
    "bundleUrl": "https://updates.sita.os/bundles/sita-os-0.2.0.bundle",
    "bundleSha256": "<hex>",
    "signatureUrl": "https://updates.sita.os/bundles/sita-os-0.2.0.bundle.sig",
    "minPreviousVersion": "0.1.0",
    "rolloutPercent": 100
  },
  "history": [{ "version": "0.1.0", "releasedBefore": "..." }]
}
```

## Bundle schema (bundle-manifest.template.json — embedded)

Inside every `.bundle` (zstd tarball) there is a `manifest.json` with the
exact root hash + min-prev-version that the on-device updater verifies
against `verify-update-bundle.sh`.
