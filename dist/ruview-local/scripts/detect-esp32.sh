#!/usr/bin/env bash
# Hardware auto-detector script for ESP32 USB serial nodes
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PARENT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

python3 - << 'EOF'
import sys, os, glob, subprocess, json

def get_ports():
    if sys.platform.startswith('linux'):
        return glob.glob('/dev/ttyUSB*') + glob.glob('/dev/ttyACM*')
    elif sys.platform.startswith('darwin'):
        return glob.glob('/dev/cu.usbserial*') + glob.glob('/dev/cu.usbmodem*')
    return []

ports = get_ports()
devices = []
for p in ports:
    chip = "unknown"
    mac = "unknown"
    flash = "unknown"
    try:
        res = subprocess.run([sys.executable, "-m", "esptool", "--port", p, "flash_id"], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=5)
        out = res.stdout + res.stderr
        if "ESP32-S3" in out: chip = "esp32s3"
        elif "ESP32-C6" in out: chip = "esp32c6"
        elif "ESP32" in out: chip = "esp32"
        for line in out.splitlines():
            if "Detected flash size:" in line: flash = line.split(":")[-1].strip()
            if "MAC:" in line: mac = line.split("MAC:")[-1].strip()
    except Exception as e:
        pass
    devices.append({"port": p, "chip": chip, "mac": mac, "flash_size": flash})

print(json.dumps({"ports_found": len(devices), "devices": devices}, indent=2))
EOF
