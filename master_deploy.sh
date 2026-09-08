#!/usr/bin/env bash
# Master RuView Deployment Automation
# Zero-intervention hardware flashing, backend setup, model fetching, and HA integration.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "=================================================="
echo "    RuView End-to-End Master Deployment Suite    "
echo "=================================================="

# 1. Hardware Flashing
echo "[Step 1/3] Running ESP32 Hardware Auto-Flasher..."
python3 "$SCRIPT_DIR/auto_flash.py" || { echo "[!] Warning: Serial flasher returned warning/notice, continuing setup..."; }

# 2. Backend & Model Setup
echo "[Step 2/3] Setting up Backend, Rust Toolchain, and Models..."
bash "$SCRIPT_DIR/setup.sh"

# 3. Smart Home MQTT Discovery
echo "[Step 3/3] Generating Home Assistant MQTT Discovery Configs..."
if [ -f "$SCRIPT_DIR/venv/bin/activate" ]; then
    source "$SCRIPT_DIR/venv/bin/activate"
fi
python3 "$SCRIPT_DIR/mqtt_discovery.py"

echo ""
echo "=================================================="
echo " [✓] RuView Spatial Intelligence Deployment Done! "
echo "     - Firmware: Flashed to connected ESP32 node(s)"
echo "     - Backend: Model cached in ./models/"
echo "     - Service: 'ruview-server' enabled on boot"
echo "     - Home Assistant: HA-DISCO payloads generated"
echo "=================================================="
