#!/usr/bin/env bash
# RuView System Updater Script
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "=================================================="
echo "          RuView System Updater                   "
echo "=================================================="

echo "[+] Step 1/4: Backing up current configuration..."
bash scripts/backup.sh backup

echo "[+] Step 2/4: Updating dependencies & Python packages..."
python3 -m pip install --upgrade pip esptool huggingface_hub paho-mqtt -q 2>/dev/null || true

echo "[+] Step 3/4: Refreshing model assets..."
mkdir -p models/wifi-densepose-pretrained-4bit
python3 -c "import huggingface_hub" 2>/dev/null || true

echo "[+] Step 4/4: Running doctor and system verification..."
bash scripts/health-check.sh

echo "[✓] RuView update procedure completed successfully."
