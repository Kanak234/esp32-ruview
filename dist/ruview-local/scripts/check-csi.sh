#!/usr/bin/env bash
# Live CSI UDP stream listener and verification script
set -euo pipefail

PORT="${1:-5005}"
echo "[+] Listening for live CSI UDP packets on port ${PORT}..."

if command -v timeout &>/dev/null && command -v nc &>/dev/null; then
    BYTES=$(timeout 3 nc -u -l "${PORT}" 2>/dev/null | wc -c || echo 0)
    BYTES=$(echo "$BYTES" | tr -d '[:space:]')
    BYTES=${BYTES:-0}

    if [ "$BYTES" -gt 0 ]; then
        echo "[PASS] Received ${BYTES} bytes of live CSI traffic on UDP port ${PORT}."
        exit 0
    else
        echo "[WARN] No CSI frames received on UDP port ${PORT}."
        echo "       Backend running, but live CSI stream from ESP32 node is absent."
        exit 1
    fi
else
    echo "[WARN] Required networking tools (nc/timeout) missing."
    exit 1
fi
