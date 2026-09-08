# RuView Frontend Architecture & User Interface Guide

## Overview
The RuView frontend dashboard is a single-page application (SPA) built with HTML5, CSS3, and Vanilla JavaScript. It communicates locally with the RuView backend via REST API (`http://127.0.0.1:3000`) and WebSocket (`ws://127.0.0.1:3001`).

## UI Sections
- **Live Spatial Map:** Real-time Canvas radar displaying node coordinates and motion target pings.
- **Waveform Charts:** Live subcarrier phase variance, SNR, heart rate (BPM), and respiration (RPM).
- **Home Assistant 21-Entity Grid:** Real-time entity state display.
- **Event Log Timeline:** Live session event feed.
- **System Doctor Modal:** Interactive modal rendering the 17-point health check matrix.
- **Demo / Live Toggle:** Toggle between live edge streaming and offline demonstration mode.
