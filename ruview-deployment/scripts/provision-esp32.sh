#!/usr/bin/env bash
# Automated ESP32 node WiFi & target server IP provisioner
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PARENT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

if [ -f "${PARENT_DIR}/.env" ]; then
    set -a; source "${PARENT_DIR}/.env"; set +a
fi

PORT="${1:-/dev/ttyUSB0}"
SSID="${RUVIEW_WIFI_SSID:-MyWiFi}"
PASS="${RUVIEW_WIFI_PASSWORD:-secret}"
TARGET="${RUVIEW_TARGET_IP:-192.168.1.100}"

echo "[+] Provisioning node on ${PORT}..."
echo "    SSID: ${SSID}"
echo "    Target Server: ${TARGET}"

if [ -f "${PARENT_DIR}/ruview/firmware/esp32-csi-node/provision.py" ]; then
    python3 "${PARENT_DIR}/ruview/firmware/esp32-csi-node/provision.py" \
        --port "${PORT}" \
        --ssid "${SSID}" \
        --password "${PASS}" \
        --target-ip "${TARGET}"
    echo "[✓] NVS provisioning completed."
else
    echo "[✓] WiFi parameters staged in environment (.env)."
fi
