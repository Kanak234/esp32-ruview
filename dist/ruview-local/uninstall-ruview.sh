#!/usr/bin/env bash
# RuView Clean Uninstaller Script
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "=================================================="
echo "          RuView System Uninstaller               "
echo "=================================================="

if [ "${1:-}" != "--yes" ]; then
    read -p "Are you sure you want to uninstall RuView services and configuration? (y/N): " CONFIRM
    if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
        echo "Uninstall cancelled."
        exit 0
    fi
fi

echo "[+] Stopping systemd services..."
if [ "$(uname -s)" == "Linux" ]; then
    sudo systemctl stop ruview.service 2>/dev/null || true
    sudo systemctl disable ruview.service 2>/dev/null || true
    sudo rm -f /etc/systemd/system/ruview.service
    sudo systemctl daemon-reload 2>/dev/null || true
fi

echo "[+] Stopping Docker containers..."
if command -v docker &>/dev/null && [ -f "docker-compose.yml" ]; then
    docker compose down 2>/dev/null || true
fi

echo "[+] Removing local configuration and temporary files..."
rm -f .env ha_mqtt_discovery.json firmware.bin

echo "[✓] RuView uninstallation complete."
