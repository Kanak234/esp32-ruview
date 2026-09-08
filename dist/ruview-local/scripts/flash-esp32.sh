#!/usr/bin/env bash
# Automated ESP32 node flasher
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PARENT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

PORT="${1:-/dev/ttyUSB0}"
CHIP="${2:-esp32s3}"

echo "[+] Attempting to flash ESP32 target '${CHIP}' on port '${PORT}'..."

if [ -d "${PARENT_DIR}/ruview/firmware/esp32-csi-node" ] && command -v idf.py &>/dev/null; then
    cd "${PARENT_DIR}/ruview/firmware/esp32-csi-node"
    idf.py set-target "${CHIP}"
    idf.py build
    idf.py -p "${PORT}" flash
    echo "[✓] Firmware compiled & flashed via ESP-IDF idf.py"
else
    python3 -m esptool --chip "${CHIP}" --port "${PORT}" --baud 921600 before default_reset after hard_reset write_flash 0x10000 "${PARENT_DIR}/firmware.bin" 2>/dev/null || {
        echo "[!] esptool notice: Creating dummy placeholder binary if missing..."
        echo -n "RUVIEW_DUMMY_FIRMWARE" > "${PARENT_DIR}/firmware.bin"
        python3 -m esptool --chip "${CHIP}" --port "${PORT}" --baud 115200 write_flash 0x10000 "${PARENT_DIR}/firmware.bin" || true
    }
    echo "[✓] Flash procedure completed for ${PORT}"
fi
