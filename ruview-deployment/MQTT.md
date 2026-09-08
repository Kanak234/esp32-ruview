# RuView MQTT Protocol Specification

## Local Broker Configuration
- **Broker Host:** `127.0.0.1:1883`
- **Security:** Local-only binding (`127.0.0.1`). No cloud MQTT brokers allowed.

## Topic Schema
- `ruview/<node_id>/state` — Spatial state & activity (`occupancy`, `activity`).
- `ruview/<node_id>/vitals` — Vital sign telemetry (`heart_rate_bpm`, `respiration_rate_bpm`, `fall_risk`).
- `ruview/<node_id>/telemetry` — Raw CSI signals (`phase_variance`, `snr_db`, `frame_rate_fps`).
- `homeassistant/binary_sensor/<node_id>/<entity_key>/config` — Home Assistant MQTT Discovery configuration.
- `homeassistant/sensor/<node_id>/<entity_key>/config` — Home Assistant MQTT Discovery sensors.
