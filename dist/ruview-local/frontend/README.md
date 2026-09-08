# RuView Single-Page Frontend Dashboard

A modern, responsive, local-first single-page application (SPA) built with **HTML5, CSS3, and Vanilla JavaScript** for the RuView WiFi CSI Spatial Intelligence Platform.

## Features
- **No Third-Party Framework Overhead:** 100% Vanilla JS & CSS3 with zero npm/webpack dependencies.
- **Glassmorphism Aesthetic:** Sleek dark-mode interface with vibrant HSL accents and smooth micro-animations.
- **Real-Time Canvas Radar:** Interactive radar & spatial estimation canvas displaying ESP32 node positions and motion pings.
- **Waveform Canvas Charts:** Subcarrier phase variance, SNR, heart rate (BPM), and respiration rate (RPM).
- **Home Assistant 21-Entity View:** Visual status grid for all 11 raw signals & 10 semantic states.
- **Live WebSocket Auto-Reconnect:** Exponential backoff connection manager (`ws://127.0.0.1:3001`).
- **Live / Demo Mode:** Seamless toggle between live edge backend streaming and offline demonstration simulation.

## Architecture
```text
frontend/
├── index.html        # SPA Layout & Semantic HTML Structure
├── css/style.css     # CSS3 Glassmorphism System & Tokens
├── js/
│   ├── api.js        # REST Client for RuView Sensing Server
│   ├── websocket.js  # Reconnecting WebSocket Manager
│   ├── charts.js     # HTML5 Canvas Waveform & Radar Engine
│   ├── ui.js         # UI Tabs, Modals & Entity Renderer
│   └── app.js        # Main Application Controller
└── README.md         # Documentation
```
