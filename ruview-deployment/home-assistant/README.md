# RuView Home Assistant Integration Guide

RuView integrates with Home Assistant via local **MQTT Discovery (HA-DISCO)** over 21 entities:
- **11 Raw CSI Signal Metrics:** Occupancy Count, Heart Rate, Respiration Rate, Phase Variance, Amplitude StdDev, Doppler Shift, Motion Energy, CSI RSSI, SNR, Packet Rate, Mesh Sync Latency.
- **10 Semantic Inferred States:** `someone_sleeping`, `possible_distress`, `room_active`, `elderly_inactivity_anomaly`, `meeting_in_progress`, `bathroom_occupied`, `fall_risk_elevated`, `bed_exit`, `no_movement`, `multi_room_transition`.

## Auto-Discovery Configuration
Running `./ruview start` or `python3 ../mqtt_ha_disco.py` generates `ha_mqtt_discovery.json` and publishes entity configurations to `homeassistant/binary_sensor/#` and `homeassistant/sensor/#`.

Entities populate automatically in Home Assistant without manual YAML configuration.
