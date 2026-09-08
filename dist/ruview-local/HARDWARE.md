# RuView ESP32 Hardware Integration Guide

## Supported Nodes
- **ESP32-S3 ($9):** Recommended node target. Provides full 802.11 b/g/n Channel State Information (CSI) streaming over USB-C or WiFi UDP.
- **ESP32-C6 ($6-10):** Wi-Fi 6 (802.11ax) research node support with HE-LTF capture.

## Automated Inspection & Flashing
Run hardware detector:
```bash
bash scripts/detect-esp32.sh
```

Flash firmware automatically:
```bash
./ruview flash /dev/ttyUSB0 esp32s3
```

Provision WiFi credentials to node NVS:
```bash
./ruview provision /dev/ttyUSB0
```
