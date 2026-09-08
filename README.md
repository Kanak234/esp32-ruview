# RuView ESP32 — IoT Automation & Home Assistant Platform

[![CI](https://github.com/Kanak234/esp32-ruview/actions/workflows/ci.yml/badge.svg)](https://github.com/Kanak234/esp32-ruview/actions/workflows/ci.yml)
[![Repository Guard](https://github.com/Kanak234/esp32-ruview/actions/workflows/repository-guard.yml/badge.svg)](https://github.com/Kanak234/esp32-ruview/actions/workflows/repository-guard.yml)

A platform for ESP32 serial detection, automated firmware flashing, Wi-Fi CSI sensing orchestration, and Home Assistant MQTT Discovery.

## Features

- **Auto Detection**: `auto_detect_esp32.py` identifies connected ESP32 / CH340 / CP2102 USB-to-UART bridges.
- **Flashing Pipeline**: `auto_flash.py` manages esptool flashing with safety checks.
- **Home Assistant Integration**: `mqtt_discovery.py` generates native MQTT Discovery configurations for Home Assistant (occupancy sensors, fall risk detection, heart rate telemetry).
- **Containerization**: `docker-compose.yml` for local Mosquitto MQTT broker and RuView backend service.

## Verification & Testing

```bash
pytest tests/ -v
```
