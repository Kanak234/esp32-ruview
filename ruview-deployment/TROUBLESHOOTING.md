# RuView Troubleshooting Guide

## Diagnostic Commands
Run the system doctor to isolate system issues:
```bash
./ruview doctor
```

Run the automated test suite and failure simulations:
```bash
./ruview test
```

## Common Scenarios & Resolution

### 1. ESP32 Node Not Detected
* **Symptom:** `./ruview doctor` reports `ESP32 [WARN]` or `ports_found: 0`.
* **Fix:** Ensure USB-C cable supports data transfer (not charge-only). Check Linux permissions: `sudo usermod -a -G dialout $USER`.

### 2. Backend Running but No CSI Data
* **Symptom:** Doctor reports `CSI Input [WARN]` / `No CSI frames received on UDP port 5005`.
* **Fix:** Verify target node IP in `.env` (`RUVIEW_TARGET_IP`). Ensure ESP32 node is provisioned with server IP via `./ruview provision`.

### 3. MQTT Unreachable
* **Symptom:** `MQTT [WARN]` or Home Assistant entities inactive.
* **Fix:** Restart Mosquitto service: `sudo systemctl restart mosquitto` or `docker compose restart mqtt`.
