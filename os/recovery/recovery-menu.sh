#!/usr/bin/env bash
# Compat alias → recovery-entry.sh
exec "$(dirname "$(readlink -f "$0")")/recovery-entry.sh" menu
