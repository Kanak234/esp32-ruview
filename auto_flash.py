#!/usr/bin/env python3
"""
RuView ESP32 Hardware Automation Flasher
Auto-detects ESP32 devices on serial ports and flashes firmware via esptool.
"""

import sys
import os
import subprocess
import glob
import time

def find_esp32_ports():
    """Detect potential ESP32 serial ports on Linux/macOS/Windows."""
    ports = []
    if sys.platform.startswith('linux'):
        ports = glob.glob('/dev/ttyUSB*') + glob.glob('/dev/ttyACM*')
    elif sys.platform.startswith('darwin'):
        ports = glob.glob('/dev/cu.usbserial*') + glob.glob('/dev/cu.usbmodem*')
    elif sys.platform.startswith('win'):
        import serial.tools.list_ports
        ports = [port.device for port in serial.tools.list_ports.comports()]
    return ports

def check_esptool():
    """Check if esptool.py is installed and available."""
    try:
        subprocess.run([sys.executable, "-m", "esptool", "version"], check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        return False

def flash_node(port, firmware_bin, chip="esp32"):
    """Flash firmware binary to target ESP32 node with error handling."""
    print(f"[+] Attempting to flash ESP32 on port {port}...")
    cmd = [
        sys.executable, "-m", "esptool",
        "--chip", chip,
        "--port", port,
        "--baud", "921600",
        "before", "default_reset",
        "after", "hard_reset",
        "write_flash", "-z",
        "0x10000", firmware_bin
    ]
    
    try:
        result = subprocess.run(cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        print(f"[✓] Successfully flashed node on {port}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"[✗] Failed to flash node on {port}:\n{e.stderr}")
        return False

def main():
    print("==================================================")
    print("       RuView ESP32 Auto-Flashing Tool            ")
    print("==================================================")

    if not check_esptool():
        print("[!] esptool not found. Installing esptool...")
        subprocess.run([sys.executable, "-m", "pip", "install", "esptool", "pyserial"], check=True)

    firmware_path = os.path.join(os.path.dirname(__file__), "firmware.bin")
    if not os.path.exists(firmware_path):
        print(f"[!] Warning: '{firmware_path}' not found.")
        print("[!] Creating dummy pre-compiled placeholder binary for initialization tests...")
        with open(firmware_path, "wb") as f:
            f.write(b"\x00" * 1024)

    ports = find_esp32_ports()
    if not ports:
        print("[✗] Error: No connected ESP32 serial devices detected!")
        print("    Ensure your ESP32 is plugged in via USB and drivers (CP210x/CH340) are installed.")
        sys.exit(1)

    print(f"[+] Found {len(ports)} candidate serial port(s): {', '.join(ports)}")
    
    success_count = 0
    for port in ports:
        if flash_node(port, firmware_path):
            success_count += 1

    print(f"\n[+] Flashing complete. Successfully updated {success_count}/{len(ports)} nodes.")

if __name__ == "__main__":
    main()
