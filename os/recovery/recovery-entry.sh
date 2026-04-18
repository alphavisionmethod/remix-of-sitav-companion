#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════
# SITA OS — Recovery Entry (canonical operator entrypoint)
#
# Delegates to the canonical recovery TUI shipped in the image at
# /opt/sita/recovery/sita-recovery.sh (source: os/image-builder/recovery/).
# ═══════════════════════════════════════════════════════════════════════
set -euo pipefail

if [[ $EUID -ne 0 ]]; then
  echo "❌ recovery-entry.sh must run as root (sudo)" >&2
  exit 1
fi

CANONICAL="/opt/sita/recovery/sita-recovery.sh"
SOURCE_FALLBACK="$(dirname "$(readlink -f "$0")")/../image-builder/recovery/sita-recovery.sh"

if [[ -x "${CANONICAL}" ]]; then
  exec "${CANONICAL}" "${1:-menu}"
elif [[ -x "${SOURCE_FALLBACK}" ]]; then
  echo "ℹ  using source-tree recovery TUI (image not installed)" >&2
  exec bash "${SOURCE_FALLBACK}" "${1:-menu}"
else
  echo "❌ canonical recovery TUI not found at ${CANONICAL}" >&2
  echo "   build/install the SITA OS image first (sudo bash os/image-builder/build.sh)" >&2
  exit 2
fi
