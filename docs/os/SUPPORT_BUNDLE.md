# SITA OS — Support Bundle

> Phase 12 — Native Deployability
> Owner: Platform Support
> Generator: `os/scripts/generate-support-bundle.sh`
> Gate: `check-os-support-bundle-readiness`

The **Support Bundle** is the single artifact a SITA OS device produces when
something goes wrong. It contains everything the support and SRE teams need
to reproduce, diagnose, and remediate an incident — with secrets redacted
on-device before anything leaves the machine.

---

## 1. What it captures

| Section | Contents | Source |
|---|---|---|
| `meta/host.json` | hostname, kernel, uptime, SITA version, channel, slot, **active deployment profile** | `/etc/sita/{version,channel,slot}` + `/etc/sita/deployment-profile.json` |
| `meta/deployment-profile.json` | full active profile manifest (`user` or `operator`) | `/etc/sita/deployment-profile.json` |
| `meta/attestation.json` | latest TPM/measured-boot attestation | `/etc/sita/attestation.json` |
| `meta/verity-status.txt` | dm-verity status of `sita_root` | `veritysetup status` |
| `logs/journal-current-boot.log` | last 2 000 lines of the current boot | `journalctl -b` |
| `logs/journal-previous-boot.log` | last 2 000 lines of the previous boot | `journalctl -b -1` |
| `services/sita-*.{status,log}` | status + last 500 log lines per core unit | `systemctl` + `journalctl` |
| `state/etc-sita/` | full `/etc/sita` tree (post-redaction) | filesystem |
| `state/rollbacks/` | A/B rollback metadata | `/var/lib/sita/rollbacks` |
| `state/backup-{status,recent}.txt` | backup inventory snapshot | `/var/lib/sita/backups` |
| `diagnostics/` | output of all five collectors + boot-target + update-state + recovery-status | `/opt/sita/diagnostics/*.sh` |
| `crashes/` | crashd-collected coredumps + metadata | `/var/log/sita/crashes` |
| `state/native-state/` | service heartbeats, settingsd snapshot | `/var/lib/sita/state` |

The five canonical diagnostic collectors are run **fresh** during bundle
generation (best-effort) so the bundle reflects the system state at the
moment of capture, not stale snapshots.

---

## 2. Profile awareness (Part 2)

Every bundle records the active **deployment profile** in two places:

1. `meta/host.json` — `deploymentProfile` and `deploymentArtifact` fields.
2. `meta/deployment-profile.json` — full copy of the manifest.

This lets support immediately distinguish:

- `sita-os-user` issues (consumer install, calm shell, restricted operator surfaces)
- `sita-os-operator` issues (operator install, full admin plane, expanded diagnostics)

Without this, a bundle from a `user` device that tries to invoke an operator
workflow looks like a "missing route" bug instead of a (correct) profile gate.

---

## 3. Redaction

Before the tarball is sealed, the generator runs `sed` over every
`*.log`, `*.txt`, and `*.json` to replace:

| Pattern | Replaced with |
|---|---|
| JWTs (`eyJ...`) | `[REDACTED-JWT]` |
| Stripe live/test keys (`sk_live_…` / `sk_test_…`) | `[REDACTED-STRIPE]` |
| SITA license keys (`SITA-XXXX-YYYY`) | `[REDACTED-LICENSE]` |
| `password=`, `passphrase=`, `secret=`, `token=` | `…=[REDACTED]` |

LUKS keys never reach the bundle because they live in TPM-sealed slots,
not in any file we touch.

---

## 4. How to generate

### On the device (operator profile)

```bash
sudo bash /opt/sita/bin/generate-support-bundle.sh
# → /var/lib/sita/support/sita-support-<host>-<UTCstamp>.tar.zst
# → prints sha256 + size on stdout
```

### From the Admin shell (operator profile only)

`Admin → Support → Generate Bundle` triggers the same script over the
privileged IPC channel and surfaces the resulting path + sha256.

### From CI / smoke tests

```bash
bash os/scripts/generate-support-bundle.sh
# uses SITA_SUPPORT_DIR override for non-root environments
```

---

## 5. Where it goes

| Destination | Purpose |
|---|---|
| `/var/lib/sita/support/` | local cache (last 5 retained automatically) |
| Operator-uploaded to support endpoint | requires explicit operator confirmation; never auto-uploaded |
| Attached to incident in Admin Workflow → Support Diagnostics | links bundle sha256 to incident id |

The bundle is **never auto-exfiltrated**. Upload requires an operator
action, justification text, and is recorded in `admin_action_audit`.

---

## 6. Validation

The release-readiness suite enforces:

- The generator script exists and is executable.
- It captures the active deployment profile.
- Required diagnostic collectors are referenced.
- This document exists and is up to date.

Gate: `check-os-support-bundle-readiness` → emits
`generated/os-support-bundle-readiness-report.json`.

---

## 7. Related

- `docs/os/DEPLOYMENT_PROFILES.md` — what profiles encode
- `docs/os/USER_PROFILE_DEPLOYMENT.md` / `OPERATOR_PROFILE_DEPLOYMENT.md`
- `docs/admin/ADMIN_CONTROL_PLANE_GOLDEN_PATHS.md` — `Support Diagnostics` workflow
- `docs/os/VALIDATION_MATRIX.md` — full pre-release matrix
- `docs/os/SITA_OS_NATIVE_DEPLOYMENT_AUDIT.md` — deployment verdict
