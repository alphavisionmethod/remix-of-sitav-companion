#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# SITA OS — Self-Signed Certificate Generator
# For air-gapped deployments without Let's Encrypt
# ═══════════════════════════════════════════════════════════════
set -euo pipefail

CERT_DIR="${1:-/opt/sita/certs}"
DOMAIN="${2:-sita.local}"
DAYS="${3:-365}"

mkdir -p "$CERT_DIR"

echo "[SITA TLS] Generating self-signed certificate for ${DOMAIN}..."

openssl req -x509 -nodes -days "$DAYS" \
  -newkey rsa:2048 \
  -keyout "${CERT_DIR}/sita.key" \
  -out "${CERT_DIR}/sita.crt" \
  -subj "/CN=${DOMAIN}/O=SITA OS/C=US" \
  -addext "subjectAltName=DNS:${DOMAIN},DNS:*.${DOMAIN},IP:127.0.0.1"

chmod 600 "${CERT_DIR}/sita.key"
chmod 644 "${CERT_DIR}/sita.crt"

echo "[SITA TLS] ✅ Certificate generated:"
echo "  Key:  ${CERT_DIR}/sita.key"
echo "  Cert: ${CERT_DIR}/sita.crt"
echo "  Valid: ${DAYS} days for ${DOMAIN}"
