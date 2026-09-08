# RuView Live 2D Digital Spatial Map

## Overview
The RuView Spatial Map provides a 2D interactive digital twin of the sensing environment using **WiFi Channel State Information (CSI)** RF perturbation probability estimates.

## Architectural Components
- `js/spatial_adapter.js`: Normalizes raw backend telemetry frames into structured Spatial Objects (`{ nodes, targets, heatmapPoints, occupancy }`).
- `js/spatial_renderer.js`: HTML5 Canvas 2D spatial renderer engine supporting zoom (0.5x to 3.0x), pan, radial gradient CSI heatmaps, vector markers (`👤`), 10-point movement trails (`· · · 👤`), room zones, and grid toggles.
- `js/calibration.js`: Local calibration UI (`MAP -> CALIBRATE`) allowing local configuration of room width, length, zones, and ESP32 node coordinates stored in `localStorage`.
- **Honesty Disclosure:** WiFi CSI spatial estimation represents radio environment probability inference, not an optical camera feed or photographic image.
