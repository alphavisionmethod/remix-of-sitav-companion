#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════
# SITA OS — Safe Mode launcher
#
# Boots into a stripped-down session: no extensions, no advisors, no
# background workers. Only the OS shell + diagnostic console.
# ═══════════════════════════════════════════════════════════════════════
set -euo pipefail

export SITA_SAFE_MODE=1
export SITA_DISABLE_EXTENSIONS=1
export SITA_DISABLE_ADVISORS=1
export SITA_DISABLE_BACKGROUND_WORKERS=1
export ELECTRON_DISABLE_GPU_COMPOSITING=1
export ELECTRON_DISABLE_HARDWARE_ACCELERATION=1

# Mark the boot as safe-mode for diagnostics
mkdir -p /var/lib/sita/state
echo "$(date -Iseconds)" > /var/lib/sita/state/safe-mode.activated

# Run shell with reduced privileges
exec /usr/bin/sita-shell --safe-mode --no-extensions
