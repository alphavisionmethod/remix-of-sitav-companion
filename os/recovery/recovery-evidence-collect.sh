#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════
# SITA OS — Recovery Boot Evidence Collector
#
# Captures real on-device evidence whenever the system enters recovery
# mode and POSTs it to the `recovery-evidence-ingest` edge function.
# Wired into `sita-recovery.service` via ExecStartPre so every real
# recovery boot — auto-fallback, operator-menu, boot-failure,
# first-boot — produces an append-only forensic record.
#
# Falls back gracefully when /var is read-only (writes to /tmp) and
# queues to /var/lib/sita/queue/recovery-evidence/ when offline.
# ═══════════════════════════════════════════════════════════════════════
set -uo pipefail

EVIDENCE_DIR="/var/lib/sita/diagnostics"
QUEUE_DIR="/var/lib/sita/queue/recovery-evidence"
INGEST_URL="${SITA_RECOVERY_INGEST_URL:-https://fctupowhcljejygjfpty.supabase.co/functions/v1/recovery-evidence-ingest}"
DEVICE_JWT_FILE="/etc/sita/device.jwt"
DEVICE_ID_FILE="/var/lib/sita/proof/device-id"

if ! mkdir -p "${EVIDENCE_DIR}" 2>/dev/null; then
  EVIDENCE_DIR="/tmp/sita-diagnostics"
  mkdir -p "${EVIDENCE_DIR}"
fi
mkdir -p "${QUEUE_DIR}" 2>/dev/null || QUEUE_DIR="/tmp/sita-recovery-queue"
mkdir -p "${QUEUE_DIR}"

# ── Detect recovery context ──────────────────────────────────────────
detect_reason() {
  if grep -q "sita.recovery=auto" /proc/cmdline 2>/dev/null; then
    echo "auto-fallback"; return
  fi
  if grep -q "sita.recovery=menu" /proc/cmdline 2>/dev/null; then
    echo "operator-menu"; return
  fi
  if grep -q "sita.firstboot=1" /proc/cmdline 2>/dev/null; then
    echo "first-boot"; return
  fi
  if [[ "${SITA_RECOVERY_REASON:-}" =~ ^(auto-fallback|operator-menu|boot-failure|first-boot|manual-test)$ ]]; then
    echo "${SITA_RECOVERY_REASON}"; return
  fi
  # Default when invoked from sita-recovery.target without explicit hint
  if systemctl is-active sita-recovery.target >/dev/null 2>&1; then
    echo "operator-menu"; return
  fi
  echo "boot-failure"
}

DEVICE_ID="$(cat "${DEVICE_ID_FILE}" 2>/dev/null || echo "unknown-$(hostname 2>/dev/null || echo host)")"
SLOT="$(cat /etc/sita/slot 2>/dev/null || echo unknown)"
[[ "${SLOT}" =~ ^(a|b)$ ]] || SLOT="unknown"
KERNEL="$(uname -r 2>/dev/null || echo unknown)"
REASON="$(detect_reason)"
COLLECTED_AT="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"

# ── Capture verity state ─────────────────────────────────────────────
VERITY_STATE="unknown"
if command -v veritysetup >/dev/null 2>&1; then
  if veritysetup status sita_root >/dev/null 2>&1; then
    VERITY_STATE="active"
  else
    VERITY_STATE="inactive"
  fi
fi

# ── Bless state (systemd-boot a/b health) ────────────────────────────
BLESS_STATE="unknown"
if command -v bootctl >/dev/null 2>&1; then
  BLESS_STATE="$(bootctl status 2>/dev/null | awk -F': ' '/Selected/{print $2; exit}' || echo unknown)"
  [[ -z "${BLESS_STATE}" ]] && BLESS_STATE="unknown"
fi

# ── Failed units (jsonb array) ───────────────────────────────────────
FAILED_UNITS="[]"
if command -v systemctl >/dev/null 2>&1; then
  mapfile -t _failed < <(systemctl --failed --no-legend --plain 2>/dev/null | awk '{print $1}' | head -20)
  if (( ${#_failed[@]} > 0 )); then
    FAILED_UNITS="$(printf '%s\n' "${_failed[@]}" | awk 'BEGIN{printf "["} {printf "%s\"%s\"", (NR>1?",":""), $0} END{printf "]"}')"
  fi
fi

# ── Shell crash count ────────────────────────────────────────────────
SHELL_CRASHES=0
if [[ -f /var/lib/sita/runtime/shell-crash-count ]]; then
  SHELL_CRASHES="$(cat /var/lib/sita/runtime/shell-crash-count 2>/dev/null || echo 0)"
fi

# ── TPM PCR snapshot (best-effort) ───────────────────────────────────
TPM_SNAPSHOT="{}"
if command -v tpm2_pcrread >/dev/null 2>&1; then
  if _pcrs=$(tpm2_pcrread sha256:0,2,4,7 2>/dev/null); then
    TPM_SNAPSHOT="$(printf '%s' "${_pcrs}" | awk '
      BEGIN{printf "{"; sep=""}
      /^[[:space:]]*[0-9]+/ {
        gsub(/[: ]/,"",$1);
        gsub(/0x/,"",$2);
        printf "%s\"pcr%s\":\"%s\"", sep, $1, $2;
        sep=","
      }
      END{printf "}"}')"
  fi
fi

# ── Build canonical payload (must match edge-function canonicalize) ─
PAYLOAD_FILE="${EVIDENCE_DIR}/recovery-mode-evidence.json"
cat > "${PAYLOAD_FILE}" <<JSON
{
  "device_id": "${DEVICE_ID}",
  "recovery_reason": "${REASON}",
  "slot": "${SLOT}",
  "kernel_version": "${KERNEL}",
  "verity_state": "${VERITY_STATE}",
  "bless_state": "${BLESS_STATE}",
  "failed_units": ${FAILED_UNITS},
  "shell_crash_count": ${SHELL_CRASHES},
  "tpm_pcr_snapshot": ${TPM_SNAPSHOT},
  "collected_at": "${COLLECTED_AT}"
}
JSON

# ── Compute evidence hash for local audit ────────────────────────────
if command -v sha256sum >/dev/null 2>&1; then
  EVIDENCE_HASH="$(sha256sum "${PAYLOAD_FILE}" | awk '{print $1}')"
  echo "${EVIDENCE_HASH}" > "${PAYLOAD_FILE}.sha256"
fi

# ── Best-effort POST; queue on failure ───────────────────────────────
post_evidence() {
  local jwt
  if [[ ! -r "${DEVICE_JWT_FILE}" ]]; then
    echo "ℹ  no device JWT — queueing evidence" >&2
    return 1
  fi
  jwt="$(cat "${DEVICE_JWT_FILE}")"
  curl --fail --silent --show-error --max-time 30 \
    -H "Authorization: Bearer ${jwt}" \
    -H "Content-Type: application/json" \
    --data-binary "@${PAYLOAD_FILE}" \
    "${INGEST_URL}" >/dev/null 2>&1
}

if post_evidence; then
  echo "✓ recovery evidence ingested (${REASON}, slot ${SLOT})"
else
  QF="${QUEUE_DIR}/$(date -u +%Y%m%dT%H%M%S)-${REASON}-${SLOT}.json"
  cp "${PAYLOAD_FILE}" "${QF}"
  echo "ℹ  recovery evidence queued at ${QF}"
fi

# Always succeed so we never block the recovery service
exit 0
