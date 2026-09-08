#!/usr/bin/env python3
"""
RuView Home Assistant MQTT Discovery Payload Generator (HA-DISCO)
Publishes Home Assistant MQTT Discovery topics for 21 entities:
- 11 Raw CSI Signal Metrics
- 10 Semantic Inferred States
"""

import json
import os
import sys

def build_ha_discovery_payloads(node_id="ruview_node_01", base_topic="ruview"):
    device = {
        "identifiers": [f"ruview_{node_id}"],
        "name": f"RuView Spatial Node ({node_id})",
        "model": "WiFi CSI Sensing Node v2",
        "manufacturer": "ruvnet",
        "sw_version": "2.1.0"
    }

    payloads = {}

    # 10 Inferred Semantic States (Binary Sensors & Sensors)
    semantic_states = [
        ("someone_sleeping", "Someone Sleeping", "occupancy", "mdi:bed-clock"),
        ("possible_distress", "Possible Distress Alert", "safety", "mdi:alert-decagram"),
        ("room_active", "Room Activity", "motion", "mdi:human-run"),
        ("elderly_inactivity_anomaly", "Inactivity Anomaly", "problem", "mdi:clock-alert"),
        ("meeting_in_progress", "Meeting In Progress", "occupancy", "mdi:account-group"),
        ("bathroom_occupied", "Bathroom Occupied", "occupancy", "mdi:toilet"),
        ("fall_risk_elevated", "Fall Risk Elevated", "safety", "mdi:account-alert"),
        ("bed_exit", "Bed Exit Event", "occupancy", "mdi:bed-empty"),
        ("no_movement", "No Movement State", "occupancy", "mdi:human-handsdown"),
        ("multi_room_transition", "Multi-Room Transition", "motion", "mdi:walk")
    ]

    for key, name, dev_class, icon in semantic_states:
        topic = f"homeassistant/binary_sensor/{node_id}/{key}/config"
        payloads[topic] = {
            "name": name,
            "unique_id": f"{node_id}_{key}",
            "state_topic": f"{base_topic}/{node_id}/state",
            "value_template": f"{{{{ 'ON' if value_json.semantic_states.{key} == true else 'OFF' }}}}",
            "payload_on": "ON",
            "payload_off": "OFF",
            "device_class": dev_class,
            "icon": icon,
            "device": device
        }

    # 11 Raw Signal Metrics (Sensors)
    raw_signals = [
        ("occupancy_count", "Occupancy Count", "count", "mdi:account-multiple", "measurement"),
        ("heart_rate_bpm", "Heart Rate", "bpm", "mdi:heart-pulse", "measurement"),
        ("respiration_rate_bpm", "Respiration Rate", "rpm", "mdi:lung", "measurement"),
        ("phase_variance", "Phase Variance", "rad²", "mdi:wave", "measurement"),
        ("amplitude_std", "Amplitude StdDev", "dB", "mdi:chart-bell-curve", "measurement"),
        ("subcarrier_doppler", "Doppler Shift", "Hz", "mdi:speedometer", "measurement"),
        ("motion_energy", "Motion Band Energy", "J", "mdi:lightning-bolt", "measurement"),
        ("csi_rssi", "CSI Packet RSSI", "dBm", "mdi:wifi-strength-3", "measurement"),
        ("snr_db", "Signal-to-Noise Ratio", "dB", "mdi:wifi-check", "measurement"),
        ("frame_rate_fps", "CSI Packet Rate", "fps", "mdi:refresh", "measurement"),
        ("mesh_latency_ms", "Mesh Sync Latency", "ms", "mdi:timer-outline", "measurement")
    ]

    for key, name, unit, icon, state_class in raw_signals:
        topic = f"homeassistant/sensor/{node_id}/{key}/config"
        payloads[topic] = {
            "name": name,
            "unique_id": f"{node_id}_{key}",
            "state_topic": f"{base_topic}/{node_id}/telemetry",
            "value_template": f"{{{{ value_json.{key} }}}}",
            "unit_of_measurement": unit,
            "icon": icon,
            "state_class": state_class,
            "device": device
        }

    return payloads

def main():
    payloads = build_ha_discovery_payloads()
    out_file = os.path.join(os.path.dirname(__file__), "ha_mqtt_discovery.json")
    with open(out_file, "w") as f:
        json.dump(payloads, f, indent=2)
    print(f"[✓] Generated HA-DISCO configuration for 21 RuView entities -> '{out_file}'")

if __name__ == "__main__":
    main()
