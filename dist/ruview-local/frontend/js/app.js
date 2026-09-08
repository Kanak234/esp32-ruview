/**
 * RuView Main Application Controller
 * Coordinates REST API polling, WebSocket feeds, 2D Spatial Map Renderer, and Demo Mode.
 */

class RuViewApp {
    constructor() {
        this.isDemoMode = false;
        this.demoInterval = null;
        this.init();
    }

    init() {
        this.initSpatialRenderer();
        this.bindMapControls();
        this.bindModeToggle();
        this.startDataLoop();
        this.connectWebSocket();
    }

    initSpatialRenderer() {
        if (window.spatialRenderer2D) {
            window.renderer = new window.spatialRenderer2D('spatial-canvas');
            // Render initial state
            const initialData = window.spatialAdapter ? window.spatialAdapter.normalize({}) : null;
            if (initialData) window.renderer.render(initialData);
        }
    }

    bindMapControls() {
        const btnIn = document.getElementById('btn-zoom-in');
        const btnOut = document.getElementById('btn-zoom-out');
        const btnReset = document.getElementById('btn-reset-view');
        const btnFS = document.getElementById('btn-fullscreen');

        if (btnIn && window.renderer) btnIn.addEventListener('click', () => window.renderer.zoomIn());
        if (btnOut && window.renderer) btnOut.addEventListener('click', () => window.renderer.zoomOut());
        if (btnReset && window.renderer) btnReset.addEventListener('click', () => window.renderer.resetView());
        if (btnFS) {
            btnFS.addEventListener('click', () => {
                const container = document.getElementById('map-canvas-container');
                if (container) {
                    if (!document.fullscreenElement) container.requestFullscreen().catch(() => {});
                    else document.exitFullscreen().catch(() => {});
                }
            });
        }

        // Layer Visibility Toggles
        const layers = ['nodes', 'heatmap', 'people', 'trails', 'zones', 'grid'];
        layers.forEach(layer => {
            const chk = document.getElementById(`chk-layer-${layer}`);
            if (chk) {
                chk.addEventListener('change', (e) => {
                    if (window.renderer) window.renderer.setLayerVisibility(layer, e.target.checked);
                });
            }
        });
    }

    bindModeToggle() {
        const btnLive = document.getElementById('btn-mode-live');
        const btnDemo = document.getElementById('btn-mode-demo');

        btnLive.addEventListener('click', () => {
            btnLive.classList.add('active');
            btnDemo.classList.remove('active');
            this.isDemoMode = false;
            if (this.demoInterval) clearInterval(this.demoInterval);
            if (window.uiController) window.uiController.addTimelineEvent('Switched to LIVE MODE');
        });

        btnDemo.addEventListener('click', () => {
            btnDemo.classList.add('active');
            btnLive.classList.remove('active');
            this.isDemoMode = true;
            this.startDemoSimulation();
            if (window.uiController) window.uiController.addTimelineEvent('Switched to DEMO SIMULATION MODE');
        });
    }

    async startDataLoop() {
        setInterval(async () => {
            if (this.isDemoMode) return;

            const status = await window.apiClient.getSystemStatus();
            const dot = document.getElementById('global-status-dot');
            const label = document.getElementById('global-status-label');

            if (status.online) {
                dot.className = 'status-indicator online';
                label.textContent = 'LIVE SYSTEM';
            } else {
                dot.className = 'status-indicator offline';
                label.textContent = 'BACKEND DISCONNECTED';
            }
        }, 3000);
    }

    connectWebSocket() {
        window.wsClient.onStateChange(state => {
            const logBox = document.getElementById('log-console-box');
            if (logBox) {
                logBox.textContent += `\n[WEBSOCKET] State: ${state}`;
                logBox.scrollTop = logBox.scrollHeight;
            }
        });

        window.wsClient.onMessage(msg => {
            if (this.isDemoMode) return;
            this.handleLiveTelemetry(msg);
        });

        window.wsClient.connect();
    }

    handleLiveTelemetry(msg) {
        // Normalize raw payload via Spatial Data Adapter
        const spatialObj = window.spatialAdapter ? window.spatialAdapter.normalize(msg) : msg;

        if (spatialObj.occupancy !== undefined) {
            document.getElementById('val-occupancy').textContent = spatialObj.occupancy;
        }

        // Render 2D Spatial Map
        if (window.renderer) {
            window.renderer.render(spatialObj);
        }
    }

    startDemoSimulation() {
        if (this.demoInterval) clearInterval(this.demoInterval);

        let simTargetX = 0.4;
        let simTargetY = 0.45;

        this.demoInterval = setInterval(() => {
            if (!this.isDemoMode) return;

            // Simulate walking path
            simTargetX += (Math.random() - 0.5) * 0.05;
            simTargetY += (Math.random() - 0.5) * 0.05;
            simTargetX = Math.max(0.15, Math.min(0.85, simTargetX));
            simTargetY = Math.max(0.15, Math.min(0.85, simTargetY));

            const rawSim = {
                occupancy: 1,
                targets: [
                    { id: 'sim-person-1', label: 'Simulated Occupant', x: simTargetX, y: simTargetY, confidence: 0.88, activity: 'ACTIVE' }
                ],
                motion_energy: 45 + Math.floor(Math.random() * 20),
                heart_rate_bpm: 72 + Math.floor(Math.random() * 8),
                respiration_rate_bpm: 16 + Math.floor(Math.random() * 4)
            };

            const spatialObj = window.spatialAdapter.normalize(rawSim);

            document.getElementById('val-occupancy').textContent = spatialObj.occupancy;
            document.getElementById('val-heartrate').textContent = rawSim.heart_rate_bpm;
            document.getElementById('val-breathing').textContent = rawSim.respiration_rate_bpm;
            document.getElementById('val-nodes-count').textContent = '4 (Configured)';
            document.getElementById('val-csi-rate').textContent = '128 pkt/s (Simulated)';

            if (window.renderer) {
                window.renderer.render(spatialObj);
            }
        }, 800);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.app = new RuViewApp();
});
