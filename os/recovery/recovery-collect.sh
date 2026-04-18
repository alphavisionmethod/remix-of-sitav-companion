#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════
# SITA OS — Recovery: Collect Support Bundle
#
# Wrapper that runs recovery-status (snapshot) and the canonical
# support-bundle generator. Designed to work even when /var is read-only
# (recovery mode): it falls back to /tmp.
# ═══════════════════════════════════════════════════════════════════════
set -uo pipefail

if [[ $EUID -ne 0 ]]; then
  echo "❌ recovery-collect.sh must run as root (sudo)" >&2
  exit 1
fi

HERE="$(dirname "$(readlink -f "$0")")"
ROOT="$(readlink -f "${HERE}/..")"

# 1. snapshot status into the bundle work area
"${HERE}/recovery-status.sh" || true

# 2. canonical bundle
GEN="/opt/sita/bin/generate-support-bundle.sh"
[[ -x "${GEN}" ]] || GEN="${ROOT}/scripts/generate-support-bundle.sh"

if [[ ! -x "${GEN}" && ! -f "${GEN}" ]]; then
  echo "❌ canonical generator not found" >&2
  exit 2
fi

if ! touch /var/lib/sita/.write-test 2>/dev/null; then
  export SITA_SUPPORT_DIR="/tmp/sita-support"
  mkdir -p "${SITA_SUPPORT_DIR}"
  echo "ℹ  /var is read-only — writing to ${SITA_SUPPORT_DIR}"
else
  rm -f /var/lib/sita/.write-test
fi

bash "${GEN}"
