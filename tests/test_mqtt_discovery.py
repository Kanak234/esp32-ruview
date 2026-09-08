import pytest
from mqtt_discovery import generate_ha_discovery_configs

def test_generate_ha_discovery_configs():
    node_id = "test_node_01"
    configs = generate_ha_discovery_configs(node_id=node_id, base_topic="test_ruview")
    
    assert len(configs) >= 4
    
    # Check binary sensor for occupancy
    occ_topic = f"homeassistant/binary_sensor/{node_id}/occupancy/config"
    assert occ_topic in configs
    occ_payload = configs[occ_topic]
    assert occ_payload["device_class"] == "occupancy"
    assert occ_payload["unique_id"] == f"{node_id}_occupancy"
    assert occ_payload["device"]["identifiers"] == [f"ruview_{node_id}"]

    # Check fall risk sensor
    fall_topic = f"homeassistant/binary_sensor/{node_id}/fall_risk/config"
    assert fall_topic in configs
    fall_payload = configs[fall_topic]
    assert fall_payload["device_class"] == "safety"
    assert fall_payload["unique_id"] == f"{node_id}_fall_risk"

def test_heart_rate_sensor_config():
    node_id = "sensor_node_99"
    configs = generate_ha_discovery_configs(node_id=node_id, base_topic="ruview")
    hr_topic = f"homeassistant/sensor/{node_id}/heart_rate/config"
    assert hr_topic in configs
    hr_payload = configs[hr_topic]
    assert hr_payload["unique_id"] == f"{node_id}_heart_rate"
    assert "bpm" in hr_payload.get("unit_of_measurement", "").lower()
