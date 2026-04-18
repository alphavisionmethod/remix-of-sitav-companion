# Runbook — QEMU boot validation failed

**Symptom:** `pnpm os:test:qemu` or
`scripts/architecture/checks/check-qemu-vm-readiness.ts` exits non-zero
in CI or locally.

## 1. Identify which stage failed

QEMU smoke-tests run in this order:

1. ISO is bootable (OVMF firmware loads, GRUB/systemd-boot appears)
2. Kernel boots to systemd
3. `multi-user.target` reached
4. `sita-firstboot.service` succeeded
5. `graphical.target` reached
6. `/run/sita/shell-ready` appears within 60s
7. `check-boot-target.sh` exits 0

The failure stage is in `generated/qemu-vm-readiness-report.json`.

## 2. Stage 1–3 failures (firmware / kernel / systemd)

```bash
# locally — capture serial console
qemu-system-x86_64 \
  -bios /usr/share/OVMF/OVMF_CODE.fd \
  -drive file=out/sita.img,format=raw \
  -m 4G -smp 2 \
  -serial stdio -display none
```

Common causes:
- Wrong OVMF version (need ≥ 202308)
- Image written with wrong sector alignment → re-run `os/scripts/build-img.sh`
- Secure Boot keys not enrolled in OVMF VARS

## 3. Stage 4 failure (first-boot)

See `runbooks/first-boot-failure.md`. The QEMU run captures
`/var/log/sita-firstboot.log` to the host via the 9p shared dir.

## 4. Stage 5–6 failure (shell)

```bash
# attach VNC to the running QEMU instance
qemu-system-x86_64 ... -vnc :1
vncviewer localhost:5901
```

Check inside the VM:
```bash
sudo sita-ops status
sudo sita-ops repair runtime-services
```

## 5. Stage 7 failure (boot target validator)

Inspect the JSON the validator wrote:

```bash
# from host, via 9p mount or scp out of QEMU
cat /var/lib/sita/diagnostics/boot-target.json
```

`failedUnits` and `missing` arrays tell you exactly which units to fix.

## 6. Local reproduction with verbose logging

```bash
SITA_QEMU_VERBOSE=1 pnpm os:test:qemu
# logs land in: out/qemu-smoke-<ts>/{serial.log,journal.log,boot-target.json}
```

## 7. CI re-run

If the failure looks like CI flake (timeouts under load), the workflow
allows a single re-run. After two failures, treat as real and bisect.

## Related

- `scripts/architecture/checks/check-qemu-vm-readiness.ts`
- `os/scripts/qemu-smoke.sh`
- `docs/os/VALIDATION_MATRIX.md`
