#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════
# SITA OS — Support Bundle Generator
#
# Produces a single tarball containing everything support needs to
# diagnose a stuck or failing SITA OS install.  Redacts known-secret
# patterns (LUKS keys, tokens) before archiving.
#
# Usage (on the device, as root or via sudo):
#   sudo bash /opt/sita/bin/generate-support-bundle.sh
#   → writes /var/lib/sita/support/sita-support-<host>-<ts>.tar.zst
# ═══════════════════════════════════════════════════════════════════════
set -euo pipefail

HOST="$(hostname)"
TS="$(date -u +%Y%m%dT%H%M%SZ)"
WORK="$(mktemp -d)"
DEST_DIR="${SITA_SUPPORT_DIR:-/var/lib/sita/support}"
mkdir -p "${DEST_DIR}"
ARCHIVE="${DEST_DIR}/sita-support-${HOST}-${TS}.tar.zst"

cd "${WORK}"
mkdir -p meta logs services state

# 1. metadata
cat > meta/host.json <<JSON
{
  "hostname": "${HOST}",
  "collectedAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "kernel": "$(uname -r)",
  "uptime": "$(uptime -p)",
  "sitaVersion": "$(cat /etc/sita/version 2>/dev/null || echo unknown)",
  "channel":     "$(cat /etc/sita/channel 2>/dev/null || echo unknown)",
  "slot":        "$(cat /etc/sita/slot    2>/dev/null || echo unknown)"
}
JSON

# 2. boot + service logs (last 2000 lines each)
journalctl -b -n 2000 --no-pager > logs/journal-current-boot.log    || true
journalctl -b -1 -n 2000 --no-pager > logs/journal-previous-boot.log || true
for unit in sita-firstboot sita-runtime sita-updated sita-recovery; do
  systemctl status "${unit}" --no-pager > "services/${unit}.status" 2>&1 || true
  journalctl -u "${unit}" -n 500 --no-pager > "services/${unit}.log" 2>&1 || true
done

# 3. state snapshots
cp -r /var/lib/sita/rollbacks  state/rollbacks   2>/dev/null || true
cp -r /etc/sita                state/etc-sita    2>/dev/null || true
cp /var/log/sita-firstboot.log state/            2>/dev/null || true
ls -la /boot/efi/loader/entries 2>/dev/null > state/boot-entries.txt || true

# 3a. Phase 3 — canonical native diagnostics + crash logs + recovery snapshot
mkdir -p diagnostics crashes
# Run all collectors fresh (best-effort; fall back to existing files)
for c in collect-boot-health collect-runtime-health collect-update-health collect-service-failures; do
  [[ -x "/opt/sita/diagnostics/${c}.sh" ]] && bash "/opt/sita/diagnostics/${c}.sh" >/dev/null 2>&1 || true
done
[[ -x /opt/sita/recovery/recovery-status.sh ]] && \
  bash /opt/sita/recovery/recovery-status.sh > diagnostics/recovery-status.txt 2>/dev/null || true
cp -r /var/lib/sita/diagnostics/. diagnostics/ 2>/dev/null || true
cp -r /var/log/sita/crashes/.     crashes/     2>/dev/null || true
cp -r /var/lib/sita/state/.       state/native-state/ 2>/dev/null || true

# 4. attestation + verity status
[[ -f /etc/sita/attestation.json ]] && cp /etc/sita/attestation.json meta/
veritysetup status sita_root 2>/dev/null > meta/verity-status.txt || true

# 5. redact obvious secrets
find . -type f \( -name '*.log' -o -name '*.txt' -o -name '*.json' \) -print0 \
  | xargs -0 sed -i -E \
      -e 's/(eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)/[REDACTED-JWT]/g' \
      -e 's/(sk_(live|test)_[A-Za-z0-9]{16,})/[REDACTED-STRIPE]/g' \
      -e 's/(SITA-[A-Z0-9]{4,}-[A-Z0-9]{4,})/[REDACTED-LICENSE]/g' \
      -e 's/(password|passphrase|secret|token)=[^[:space:]"]+/\1=[REDACTED]/gi' || true

tar --sort=name -cf - . | zstd -19 -T0 -o "${ARCHIVE}"
rm -rf "${WORK}"

SHA="$(sha256sum "${ARCHIVE}" | cut -d' ' -f1)"
echo "✅ support bundle: ${ARCHIVE}"
echo "   sha256: ${SHA}"
echo "   size:   $(numfmt --to=iec "$(stat -c %s "${ARCHIVE}")")"
