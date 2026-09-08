# RuView One-Command Production Installation Guide

## Quick Start
To install and provision the entire RuView spatial intelligence platform in one step:

```bash
cd ruview-deployment
./install-ruview.sh
```

## Step-by-Step Installation Lifecycle
1. **Host Environment Inspection:** Checks Linux/macOS OS, CPU architecture (`x86_64` or `aarch64`), RAM, and disk space.
2. **Toolchain Dependency Resolution:** Auto-installs Python 3, `esptool`, `pyserial`, `huggingface_hub`, `paho-mqtt`, Rust (`cargo`), and Mosquitto MQTT broker.
3. **ESP32 Hardware Auto-Detection:** Scans serial ports (`/dev/ttyUSB*`, `/dev/ttyACM*`, `COM*`), queries chip targets (`ESP32-S3` / `ESP32-C6`), extracts MAC addresses, and verifies flash memory size.
4. **Model Asset Pre-fetching:** Pre-fetches the 4-bit quantized WiFi-DensePose pretrained weights from Hugging Face (`ruvnet/wifi-densepose-pretrained`) into `models/wifi-densepose-pretrained-4bit/`.
5. **Home Assistant HA-DISCO Provisioning:** Generates discovery configurations for 21 entities (11 raw signal metrics + 10 semantic activity states).
6. **Systemd Service Setup:** Installs `/etc/systemd/system/ruview.service` with automatic restart and journald logging.
7. **17-Point System Health Doctor:** Runs comprehensive verification across all 17 system components.
