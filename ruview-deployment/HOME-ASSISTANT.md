# RuView Home Assistant Integration Guide

## 21 Entities Home Assistant Auto-Discovery
RuView automatically provisions 21 entities to local Home Assistant via MQTT Discovery:

### 11 Raw Signal Metrics (Sensors)
1. `sensor.ruview_occupancy_count`
2. `sensor.ruview_heart_rate`
3. `sensor.ruview_respiration_rate`
4. `sensor.ruview_phase_variance`
5. `sensor.ruview_amplitude_std`
6. `sensor.ruview_subcarrier_doppler`
7. `sensor.ruview_motion_energy`
8. `sensor.ruview_csi_rssi`
9. `sensor.ruview_snr_db`
10. `sensor.ruview_frame_rate_fps`
11. `sensor.ruview_mesh_latency_ms`

### 10 Semantic Inferred Activity States (Binary Sensors)
1. `binary_sensor.ruview_someone_sleeping`
2. `binary_sensor.ruview_possible_distress`
3. `binary_sensor.ruview_room_active`
4. `binary_sensor.ruview_elderly_inactivity_anomaly`
5. `binary_sensor.ruview_meeting_in_progress`
6. `binary_sensor.ruview_bathroom_occupied`
7. `binary_sensor.ruview_fall_risk_elevated`
8. `binary_sensor.ruview_bed_exit`
9. `binary_sensor.ruview_no_movement`
10. `binary_sensor.ruview_multi_room_transition`
