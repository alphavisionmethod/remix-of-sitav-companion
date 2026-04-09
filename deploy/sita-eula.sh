#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# SITA OS — First-Login EULA Prompt
# Install: sudo cp sita-eula.sh /etc/profile.d/sita-eula.sh
# Shown once on first interactive login.
# ═══════════════════════════════════════════════════════════════

EULA_ACCEPTED_MARKER="/var/lib/sita/.eula-accepted"

if [ -f "$EULA_ACCEPTED_MARKER" ]; then
  return 0 2>/dev/null || exit 0
fi

if [ ! -t 0 ]; then
  return 0 2>/dev/null || exit 0
fi

cat << 'EULA'

═══════════════════════════════════════════════════════════════
  SITA OS — End User License Agreement
═══════════════════════════════════════════════════════════════

  By using SITA OS, you agree to the following terms:

  1. SITA OS is provided "as is" without warranty of any kind.
  2. You are responsible for the security and management of
     your deployment, including all data stored within.
  3. You retain full ownership and sovereignty over your data.
  4. SITA OS does not transmit telemetry or data externally
     unless explicitly configured by you.
  5. Updates are applied locally and do not require external
     connectivity unless pulling from a registry.

  For the full license, visit: https://sita.dev/license

═══════════════════════════════════════════════════════════════

EULA

read -rp "  Do you accept the terms? [y/N] " response
if [[ "$response" == [yY] ]]; then
  sudo mkdir -p /var/lib/sita
  sudo touch "$EULA_ACCEPTED_MARKER"
  echo ""
  echo "  ✅ License accepted. Welcome to SITA OS."
  echo ""
else
  echo ""
  echo "  ❌ License not accepted. Access denied."
  echo ""
  exit 1
fi
