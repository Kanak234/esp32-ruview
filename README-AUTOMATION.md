# RuView Release Engineering & Automation Guide

Official edge-first, privacy-preserving local deployment and management suite for **RuView** (`ruvnet/ruview`).

## Unified `ruview` Management CLI
```bash
./ruview doctor      # Run 14-point system doctor
./ruview test        # Execute automated unit/integration test suite & failure simulations
./ruview install     # Auto-install host dependencies (Rust, Python3, Mosquitto, esptool)
./ruview flash       # Auto-detect connected USB ESP32 hardware & flash firmware
./ruview provision   # Write WiFi credentials & target IP to ESP32 NVS
./ruview start       # Start Mosquitto MQTT & RuView local backend
./ruview stop        # Stop background RuView services
./ruview status      # Check live port & service status
./ruview update      # Update repository & model weights
./ruview uninstall   # Remove systemd services & local configuration
```

## System Verification & Failure Simulations
The automated test runner (`run_tests.sh` / `./ruview test`) covers:
1. **Dependency Check:** Python 3, Git, Cargo, esptool, Mosquitto.
2. **Hardware Inspector:** ESP32-S3 / ESP32-C6 USB serial port scanning & chip identification.
3. **Model Validation:** 4-bit quantized weight file validation (`ruvnet/wifi-densepose-pretrained`).
4. **HA MQTT Discovery:** Generates & validates 21 entity payloads (11 raw signal sensors + 10 semantic binary sensors).
5. **Failure Simulations:**
   - *Test A (Backend Stopped):* Detects backend port closure.
   - *Test B (MQTT Unavailable):* Identifies unreachable MQTT broker.
   - *Test C (ESP32 Disconnected):* Reports missing hardware node.
   - *Test D (No CSI Packets):* Distinguishes running backend from absent CSI traffic stream.
   - *Test E (Invalid WiFi Credentials):* Diagnostics without exposing WiFi password in logs.

## Security & Privacy Audit
- **Zero Cloud Leakage:** All sensing processing, model inference, and MQTT payloads run 100% locally.
- **Credential Protection:** Secrets stored in `.env` with strict `600` permissions.
- **Git Ignore Policy:** `.env`, `.pem`, `.key`, logs, and temporary binary files are excluded in `.gitignore`.

## Performance Metrics
- **Quantized Model Memory:** 8 KB int4 quantized weights.
- **Inference Latency:** Sub-millisecond CSI temporal embedding extraction.
- **Doppler Resolution:** Real-time 6–30 BPM respiration and 40–120 BPM heart-rate extraction.
