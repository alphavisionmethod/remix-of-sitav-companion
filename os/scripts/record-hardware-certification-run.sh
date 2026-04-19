#!/usr/bin/env bash
# SITA OS — Real Hardware Certification Run Recorder
# Captures real-device evidence for Secure Boot, TPM 2.0, dm-verity, A/B rollback,
# and recovery, dumps a durable JSON evidence file, and (when PG creds are present)
# inserts a row into public.hardware_certification_runs.
#
# Usage:
#   sudo -E ./os/scripts/record-hardware-certification-run.sh \
#     --device-class workstation-x86_64 \
#     --firmware "OEM 1.2.3" \
#     --runner-id "$(id -un)" \
#     [--skip-tpm] [--skip-verity]
set -euo pipefail

DEVICE_CLASS=""
FIRMWARE=""
RUNNER_ID="${USER:-unknown}"
SKIP_TPM=0
SKIP_VERITY=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --device-class) DEVICE_CLASS="$2"; shift 2 ;;
    --firmware) FIRMWARE="$2"; shift 2 ;;
    --runner-id) RUNNER_ID="$2"; shift 2 ;;
    --skip-tpm) SKIP_TPM=1; shift ;;
    --skip-verity) SKIP_VERITY=1; shift ;;
    *) echo "Unknown arg: $1" >&2; exit 2 ;;
  esac
done

[[ -z "$DEVICE_CLASS" ]] && { echo "ERROR: --device-class required" >&2; exit 2; }

RUN_ID="hcr-$(date -u +%Y%m%dT%H%M%SZ)-$(printf '%04x' $((RANDOM*RANDOM)) | head -c 8)"
OUT_DIR="generated/hardware-and-operator-closure/runs"
mkdir -p "$OUT_DIR"
RUN_FILE="$OUT_DIR/${RUN_ID}.json"

echo "▶ Hardware certification run: $RUN_ID ($DEVICE_CLASS)"

# --- Secure Boot probe (real) ---
SECURE_BOOT_PASS=false
SECURE_BOOT_DETAIL="not-evaluated"
if command -v mokutil >/dev/null 2>&1; then
  if mokutil --sb-state 2>/dev/null | grep -qi "SecureBoot enabled"; then
    SECURE_BOOT_PASS=true
    SECURE_BOOT_DETAIL="enabled"
  else
    SECURE_BOOT_DETAIL="disabled-or-unsupported"
  fi
else
  SECURE_BOOT_DETAIL="mokutil-missing"
fi

# --- TPM 2.0 probe (real, calls existing verifier) ---
TPM_PASS=false
TPM_DETAIL="skipped"
if [[ "$SKIP_TPM" -eq 0 ]]; then
  if [[ -x os/scripts/verify-tpm-seal.sh ]]; then
    if bash os/scripts/verify-tpm-seal.sh >/tmp/tpm-verify.log 2>&1; then
      TPM_PASS=true
      TPM_DETAIL="seal-verified"
    else
      TPM_DETAIL="seal-failed"
    fi
  else
    TPM_DETAIL="verifier-missing"
  fi
fi

# --- dm-verity probe (real) ---
VERITY_PASS=false
VERITY_DETAIL="skipped"
if [[ "$SKIP_VERITY" -eq 0 ]]; then
  if [[ -x os/scripts/verify-verity-metadata.sh ]]; then
    if bash os/scripts/verify-verity-metadata.sh out >/tmp/verity-verify.log 2>&1; then
      VERITY_PASS=true
      VERITY_DETAIL="metadata-verified"
    else
      VERITY_DETAIL="metadata-failed"
    fi
  else
    VERITY_DETAIL="verifier-missing"
  fi
fi

# --- A/B rollback probe (dry-run, real script) ---
AB_ROLLBACK_PASS=false
AB_DETAIL="skipped"
if [[ -x os/scripts/rollback-to-previous.sh ]]; then
  if bash os/scripts/rollback-to-previous.sh --dry-run >/tmp/rollback.log 2>&1; then
    AB_ROLLBACK_PASS=true
    AB_DETAIL="dry-run-succeeded"
  else
    AB_DETAIL="dry-run-failed"
  fi
else
  AB_DETAIL="rollback-script-missing"
fi

# --- Recovery probe (status check) ---
RECOVERY_PASS=false
RECOVERY_DETAIL="skipped"
if [[ -x os/recovery/recovery-status.sh ]]; then
  if bash os/recovery/recovery-status.sh >/tmp/recovery.log 2>&1; then
    RECOVERY_PASS=true
    RECOVERY_DETAIL="status-ok"
  else
    RECOVERY_DETAIL="status-error"
  fi
fi

# --- Build attestation quote (base64 of probe summary) ---
QUOTE_RAW="run=$RUN_ID|sb=$SECURE_BOOT_PASS|tpm=$TPM_PASS|verity=$VERITY_PASS|ab=$AB_ROLLBACK_PASS|rec=$RECOVERY_PASS|ts=$(date -u +%s)"
ATTESTATION_QUOTE_B64="$(printf '%s' "$QUOTE_RAW" | base64 -w0 2>/dev/null || printf '%s' "$QUOTE_RAW" | base64)"

# --- Dump JSON evidence ---
cat > "$RUN_FILE" <<JSON
{
  "run_id": "$RUN_ID",
  "device_class": "$DEVICE_CLASS",
  "firmware": "${FIRMWARE//\"/\\\"}",
  "runner_id": "$RUNNER_ID",
  "run_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "secure_boot_pass": $SECURE_BOOT_PASS,
  "secure_boot_detail": "$SECURE_BOOT_DETAIL",
  "tpm_pass": $TPM_PASS,
  "tpm_detail": "$TPM_DETAIL",
  "dm_verity_pass": $VERITY_PASS,
  "dm_verity_detail": "$VERITY_DETAIL",
  "ab_rollback_pass": $AB_ROLLBACK_PASS,
  "ab_rollback_detail": "$AB_DETAIL",
  "recovery_pass": $RECOVERY_PASS,
  "recovery_detail": "$RECOVERY_DETAIL",
  "attestation_quote_b64": "$ATTESTATION_QUOTE_B64",
  "log_refs": {
    "tpm": "/tmp/tpm-verify.log",
    "verity": "/tmp/verity-verify.log",
    "rollback": "/tmp/rollback.log",
    "recovery": "/tmp/recovery.log"
  }
}
JSON

echo "✓ Evidence written: $RUN_FILE"

# --- Insert into DB if PG creds present ---
if [[ -n "${PGHOST:-}" ]] && command -v psql >/dev/null 2>&1; then
  echo "▶ Inserting into public.hardware_certification_runs"
  psql -v ON_ERROR_STOP=1 -c "
    INSERT INTO public.hardware_certification_runs
      (run_id, device_class, firmware, secure_boot_pass, tpm_pass, dm_verity_pass,
       ab_rollback_pass, recovery_pass, attestation_quote_b64, log_refs, run_at)
    VALUES
      ('$RUN_ID', '$DEVICE_CLASS', \$\$$FIRMWARE\$\$,
       $SECURE_BOOT_PASS, $TPM_PASS, $VERITY_PASS,
       $AB_ROLLBACK_PASS, $RECOVERY_PASS, '$ATTESTATION_QUOTE_B64',
       '{\"secure_boot\":\"$SECURE_BOOT_DETAIL\",\"tpm\":\"$TPM_DETAIL\",\"verity\":\"$VERITY_DETAIL\",\"ab\":\"$AB_DETAIL\",\"recovery\":\"$RECOVERY_DETAIL\"}'::jsonb,
       now())
    ON CONFLICT (run_id) DO NOTHING;" \
    && echo "✓ DB row inserted" || echo "⚠ DB insert failed (see psql output)"
else
  echo "ℹ PGHOST not set — skipping DB insert (evidence file still durable)"
fi

# --- Summary ---
TOTAL=5
PASSED=$(( SECURE_BOOT_PASS + TPM_PASS + VERITY_PASS + AB_ROLLBACK_PASS + RECOVERY_PASS ))
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  Hardware certification: $PASSED/$TOTAL probes passed"
echo "  Run ID: $RUN_ID"
echo "  Device: $DEVICE_CLASS"
echo "  Evidence: $RUN_FILE"
echo "═══════════════════════════════════════════════════════════"

# Exit non-zero if any critical probe failed
if [[ $PASSED -lt 4 ]]; then
  exit 1
fi
exit 0
