# RuView Local Sensing Platform Architecture

## Network Topology & Hardware Layout

```text
                     Internet
                        │
                        ▼
                   Main Router
                        │
       ┌────────────────┴────────────────┐
       │                                 │
   Ethernet                         2.4 GHz Wi-Fi
       │                                 │
       ▼                                 ▼
Ubuntu/RuView Host PC              ESP32 CSI Nodes
(192.168.1.100)               (ESP32-S3 / ESP32-C6)
       │                                 │
       │   CSI UDP Packet Stream (5005)  │
       └────────────────◄────────────────┘
       │
       ├── Sensing Backend & 4-bit Model Inference
       ├── REST API (HTTP 3000) & WebSocket (WS 3001)
       ├── Local MQTT Broker (127.0.0.1:1883)
       ├── Home Assistant Integration (HA-DISCO 21 Entities)
       └── HTML5 2D Digital Spatial Map Dashboard
```

## Network Component Roles

1. **Main Router:** Acts as local network gateway and DHCP server. Provides 2.4 GHz Wi-Fi for ESP32 nodes and Ethernet switching for the Ubuntu host PC.
2. **Ubuntu Host PC (Ethernet Connection):** Connected via high-speed wired Ethernet to the router LAN. Listens for live CSI UDP traffic on port 5005 (`RUVIEW_TARGET_IP`). Runs the RuView sensing engine, 4-bit model inference, REST/WS server, MQTT broker, and web dashboard.
3. **ESP32 CSI Nodes (2.4 GHz Wi-Fi Connection):** Connected wirelessly to the 2.4 GHz Wi-Fi AP. Provisioned with router SSID/password and host IP (`RUVIEW_TARGET_IP`). Capture RF wave perturbations and stream CSI raw frames to the host PC over UDP port 5005.

## Security & Privacy Policy
- **100% Local-First:** All sensing, processing, model inference, and Home Assistant discovery occur entirely within your local home network. Zero external cloud APIs or remote tracking.
