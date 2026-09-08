#!/usr/bin/env python3
"""
RuView ESP32 Hardware, Port & Flash Inspector
Performs deep hardware validation on connected USB serial ESP32 nodes:
- Serial Port detection (/dev/ttyUSB*, /dev/ttyACM*, COM*)
- Chip Target Identification (ESP32-S3, ESP32-C6, ESP32)
- MAC Address extraction via esptool
- Flash Memory Size check via esptool
- Bootloader / DTR-RTS auto-reset check
"""

import sys
import os
import glob
import subprocess
import json

def get_serial_ports():
    ports = []
    if sys.platform.startswith('linux'):
        ports = glob.glob('/dev/ttyUSB*') + glob.glob('/dev/ttyACM*')
    elif sys.platform.startswith('darwin'):
        ports = glob.glob('/dev/cu.usbserial*') + glob.glob('/dev/cu.usbmodem*')
    elif sys.platform.startswith('win'):
        try:
            import serial.tools.list_ports
            ports = [p.device for p in serial.tools.list_ports.comports()]
        except ImportError:
            ports = [f"COM{i}" for i in range(1, 33)]
    return sorted(list(set(ports)))

def inspect_hardware(port):
    """Query chip type, MAC address, and flash size using esptool."""
    result = {
        "port": port,
        "permission_ok": os.access(port, os.R_OK | os.W_OK) if sys.platform.startswith('linux') else True,
        "chip": "unknown",
        "mac": "unknown",
        "flash_size": "unknown",
        "bootloader_ready": False,
        "raw_output": ""
    }

    # 1. Detect Chip Type & Flash ID
    try:
        cmd = [sys.executable, "-m", "esptool", "--port", port, "flash_id"]
        res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=8)
        out = res.stdout + "\n" + res.stderr
        result["raw_output"] = out

        if "ESP32-S3" in out:
            result["chip"] = "esp32s3"
        elif "ESP32-C6" in out:
            result["chip"] = "esp32c6"
        elif "ESP32" in out:
            result["chip"] = "esp32"

        # Parse Flash Size
        for line in out.splitlines():
            if "Detected flash size:" in line:
                result["flash_size"] = line.split(":")[-1].strip()
            if "MAC:" in line:
                result["mac"] = line.split("MAC:")[-1].strip()

        result["bootloader_ready"] = res.returncode == 0
    except Exception as e:
        result["raw_output"] = str(e)

    # 2. Extract MAC Address if missing
    if result["mac"] == "unknown" and result["bootloader_ready"]:
        try:
            cmd = [sys.executable, "-m", "esptool", "--port", port, "read_mac"]
            res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=8)
            for line in res.stdout.splitlines():
                if "MAC:" in line:
                    result["mac"] = line.split("MAC:")[-1].strip()
        except Exception:
            pass

    return result

def main():
    ports = get_serial_ports()
    devices = []
    for port in ports:
        devices.append(inspect_hardware(port))

    output = {
        "ports_found": len(ports),
        "devices": devices
    }
    print(json.dumps(output, indent=2))

if __name__ == "__main__":
    main()
