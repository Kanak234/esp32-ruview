#!/usr/bin/env python3
"""
RuView Home Assistant MQTT Discovery Generator (HA-DISCO)
Publishes Home Assistant MQTT Discovery configurations for RuView Spatial Intelligence.
"""

import json
import os
import sys

def generate_ha_discovery_configs(node_id="ruview_node_01", base_topic="ruview"):
    """
    Generate Home Assistant MQTT Discovery topics and payloads.
    Provides binary sensors for occupancy/fall risk and sensors for vital signs.
    """
    device_info = {
        "identifiers": [f"ruview_{node_id}"],
        "name": f"RuView Spatial Sensor Node ({node_id})",
        "model": "WiFi CSI Sensing Node v2",
        "manufacturer": "ruvnet",
        "sw_version": "2.1.0"
    }

    configs = {}

    # 1. Spatial Occupancy Binary Sensor
    topic_occ = f"homeassistant/binary_sensor/{node_id}/occupancy/config"
    payload_occ = {
        "name": "Room Occupancy",
        "unique_id": f"{node_id}_occupancy",
        "state_topic": f"{base_topic}/{node_id}/state",
        "value_template": "{{ value_json.occupancy }}",
        "payload_on": "ON",
        "payload_off": "OFF",
        "device_class": "occupancy",
        "device": device_info
    }
    configs[topic_occ] = payload_occ

    # 2. Elevated Fall Risk Binary Sensor
    topic_fall = f"homeassistant/binary_sensor/{node_id}/fall_risk/config"
    payload_fall = {
        "name": "Fall Risk Alert",
        "unique_id": f"{node_id}_fall_risk",
        "state_topic": f"{base_topic}/{node_id}/vitals",
        "value_template": "{{ 'ON' if value_json.fall_risk == true else 'OFF' }}",
        "payload_on": "ON",
        "payload_off": "OFF",
        "device_class": "safety",
        "icon": "mdi:alert-octagon",
        "device": device_info
    }
    configs[topic_fall] = payload_fall

    # 3. Heart Rate Sensor (BPM)
    topic_hr = f"homeassistant/sensor/{node_id}/heart_rate/config"
    payload_hr = {
        "name": "Heart Rate",
        "unique_id": f"{node_id}_heart_rate",
        "state_topic": f"{base_topic}/{node_id}/vitals",
        "value_template": "{{ value_json.heart_rate_bpm }}",
        "unit_of_measurement": "bpm",
        "icon": "mdi:heart-pulse",
        "state_class": "measurement",
        "device": device_info
    }
    configs[topic_hr] = payload_hr

    # 4. Respiration Rate Sensor (BPM)
    topic_resp = f"homeassistant/sensor/{node_id}/respiration_rate/config"
    payload_resp = {
        "name": "Respiration Rate",
        "unique_id": f"{node_id}_respiration_rate",
        "state_topic": f"{base_topic}/{node_id}/vitals",
        "value_template": "{{ value_json.respiration_rate_bpm }}",
        "unit_of_measurement": "rpm",
        "icon": "mdi:lung",
        "state_class": "measurement",
        "device": device_info
    }
    configs[topic_resp] = payload_resp

    # 5. Inferred State Sensor (e.g., someone-sleeping, posture)
    topic_state = f"homeassistant/sensor/{node_id}/spatial_state/config"
    payload_state = {
        "name": "Spatial Activity State",
        "unique_id": f"{node_id}_spatial_state",
        "state_topic": f"{base_topic}/{node_id}/state",
        "value_template": "{{ value_json.activity }}",
        "icon": "mdi:human-bed",
        "device": device_info
    }
    configs[topic_state] = payload_state

    return configs

def main():
    configs = generate_ha_discovery_configs()
    output_file = os.path.join(os.path.dirname(__file__), "ha_mqtt_discovery.json")
    with open(output_file, "w") as f:
        json.dump(configs, f, indent=2)
    print(f"[✓] Generated HA-DISCO payloads for RuView node in '{output_file}'")

if __name__ == "__main__":
    main()
