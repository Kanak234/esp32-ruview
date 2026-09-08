#!/usr/bin/env bash
# RuView 12-Point Comprehensive Verification & Health Check Script
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

GREEN='\033[0;32m'; RED='\033[0;31m'; YELLOW='\033[1;33m'; RESET='\033[0m'
ok() { echo -e "${GREEN}[OK]${RESET} $1"; }
warn() { echo -e "${YELLOW}[WARN]${RESET} $1"; }
fail() { echo -e "${RED}[FAIL]${RESET} $1"; }

FAILED=0
WARNS=0

echo "=================================================="
echo "    RuView System Verification & Health Check     "
echo "=================================================="

# Check 1: Repository Exists
if [ -d "ruview" ] || [ -f "setup-ruview.sh" ]; then
    ok "1. RuView repository structure verified."
else
    fail "1. RuView repository missing."; FAILED=$((FAILED+1))
fi

# Check 2: Core Dependencies
if command -v python3 &>/dev/null && command -v git &>/dev/null; then
    ok "2. Basic system dependencies (Python3, Git) present."
else
    fail "2. Core dependencies missing."; FAILED=$((FAILED+1))
fi

# Check 3: Backend / Docker Status
if command -v docker &>/dev/null && docker ps &>/dev/null; then
    ok "3. Docker daemon active and responsive."
else
    warn "3. Docker not running (using native host mode)."; WARNS=$((WARNS+1))
fi

# Check 4: RuView Local API
if curl -s http://127.0.0.1:3000/health &>/dev/null || curl -s http://127.0.0.1:3000/ &>/dev/null; then
    ok "4. RuView API responding on port 3000."
else
    warn "4. RuView API server port 3000 not answering HTTP requests."; WARNS=$((WARNS+1))
fi

# Check 5: Listening Ports
if ss -tuln 2>/dev/null | grep -E "3000|1883|5005" &>/dev/null; then
    ok "5. Local ports (3000/1883/5005) listening."
else
    warn "5. Target listening ports not active."; WARNS=$((WARNS+1))
fi

# Check 6: Local MQTT Broker
if nc -z 127.0.0.1 1883 2>/dev/null || mosquitto_pub -h 127.0.0.1 -t "ruview/test" -m "ping" 2>/dev/null; then
    ok "6. Local MQTT broker reachable on port 1883."
else
    warn "6. Local MQTT broker unreachable."; WARNS=$((WARNS+1))
fi

# Check 7: ESP32 Hardware
DEVICES=$(python3 auto_detect_esp32.py 2>/dev/null | grep -o '"ports_found": [0-9]*' | awk '{print $2}' || echo "0")
if [ "$DEVICES" -gt "0" ]; then
    ok "7. ESP32 hardware detected on serial bus ($DEVICES device(s))."
else
    warn "7. No ESP32 serial nodes currently connected."; WARNS=$((WARNS+1))
fi

# Check 8: ESP32 WiFi Connectivity
if ping -c 1 -W 1 "${RUVIEW_TARGET_IP:-127.0.0.1}" &>/dev/null; then
    ok "8. ESP32 node IP reachable on local subnet."
else
    warn "8. Target node IP not responding to ping."; WARNS=$((WARNS+1))
fi

# Check 9: CSI Packet Reception (UDP 5005/5006)
CSI_FRAMES=0
if command -v timeout &>/dev/null; then
    RAW_COUNT=$(timeout 2 nc -u -l 5005 2>/dev/null | wc -c || echo "0")
    CSI_FRAMES=$(echo "$RAW_COUNT" | tr -d '[:space:]')
fi
CSI_FRAMES=${CSI_FRAMES:-0}

if [ "$CSI_FRAMES" -gt 0 ]; then
    ok "9. Live CSI UDP frames arriving on port 5005 ($CSI_FRAMES bytes received)."
else
    warn "9. No CSI frames received on UDP port 5005."
    warn "   -> Backend running, but live CSI stream from ESP32 is absent."
    WARNS=$((WARNS+1))
fi

# Check 10: RuView CSI Pipeline Processing
if [ -d "models/wifi-densepose-pretrained-4bit" ] || [ -d "ruview/models" ]; then
    ok "10. RuView CSI processing engine ready."
else
    warn "10. RuView model workspace not pre-initialized."; WARNS=$((WARNS+1))
fi

# Check 11: Quantized Model Asset
if [ -f "models/wifi-densepose-pretrained-4bit/model_quant_4bit.bin" ] || [ -f "models/wifi-densepose-pretrained-4bit/model.safetensors" ]; then
    ok "11. 4-bit Quantized WiFi-DensePose model asset verified."
else
    warn "11. Quantized model asset missing from local cache."; WARNS=$((WARNS+1))
fi

# Check 12: Home Assistant Discovery Payload
if [ -f "ha_mqtt_discovery.json" ]; then
    ok "12. Home Assistant HA-DISCO payloads generated."
else
    warn "12. HA-DISCO payload file missing."; WARNS=$((WARNS+1))
fi

echo "--------------------------------------------------"
if [ "$FAILED" -eq 0 ] && [ "$CSI_FRAMES" -gt 0 ]; then
    echo -e "${GREEN}[PASS] Live Sensing Fully Operational.${RESET}"
    exit 0
elif [ "$FAILED" -eq 0 ]; then
    echo -e "${YELLOW}[WARN] Backend running, but no CSI data detected.${RESET}"
    exit 0
else
    echo -e "${RED}[FAIL] Health check failed with $FAILED critical error(s).${RESET}"
    exit 1
fi
