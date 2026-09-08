/**
 * RuView Canvas Chart & Spatial Radar Engine
 * Lightweight, dependency-free rendering engine for CSI waveforms & spatial maps.
 */

class RuViewChartsEngine {
    constructor() {
        this.historySize = 50;
        this.datasets = {
            phase: new Array(this.historySize).fill(0),
            snr: new Array(this.historySize).fill(0),
            resp: new Array(this.historySize).fill(0),
            heart: new Array(this.historySize).fill(0)
        };
    }

    pushData(key, value) {
        if (this.datasets[key]) {
            this.datasets[key].push(value);
            if (this.datasets[key].length > this.historySize) {
                this.datasets[key].shift();
            }
        }
    }

    drawWaveform(canvasId, dataKey, strokeColor, label) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        const data = this.datasets[dataKey];

        ctx.clearRect(0, 0, width, height);

        // Draw Grid Lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        for (let x = 0; x < width; x += 40) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }

        // Draw Line
        if (data.length < 2) return;
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 2;
        ctx.beginPath();

        const min = Math.min(...data, 0);
        const max = Math.max(...data, 100);
        const range = (max - min) || 1;

        data.forEach((val, i) => {
            const x = (i / (this.historySize - 1)) * width;
            const normalizedY = (val - min) / range;
            const y = height - (normalizedY * (height - 30) + 15);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.stroke();

        // Label Overlay
        ctx.fillStyle = 'rgba(240, 244, 248, 0.6)';
        ctx.font = '11px Inter, sans-serif';
        ctx.fillText(label, 10, 20);
    }

    drawSpatialRadar(canvasId, presenceCount = 0, activity = 'IDLE') {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        const cx = width / 2;
        const cy = height / 2;

        ctx.clearRect(0, 0, width, height);

        // Draw Concentric Radar Rings
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.15)';
        ctx.lineWidth = 1;
        [40, 80, 120, 160].forEach(r => {
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.stroke();
        });

        // Draw Axis Lines
        ctx.beginPath();
        ctx.moveTo(cx, 10); ctx.lineTo(cx, height - 10);
        ctx.moveTo(10, cy); ctx.lineTo(width - 10, cy);
        ctx.stroke();

        // ESP32 Sensor Nodes Representations
        const nodeCoords = [
            { x: cx - 110, y: cy - 70, label: 'ESP32-Node-1' },
            { x: cx + 110, y: cy + 70, label: 'ESP32-Node-2' }
        ];

        nodeCoords.forEach(n => {
            ctx.fillStyle = '#8B5CF6';
            ctx.beginPath();
            ctx.arc(n.x, n.y, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#8A99AD';
            ctx.font = '10px Inter, sans-serif';
            ctx.fillText(n.label, n.x - 25, n.y - 10);
        });

        // Draw Detected Target Pings if Presence > 0
        if (presenceCount > 0) {
            const targets = [
                { x: cx + 25, y: cy - 30 },
                { x: cx - 40, y: cy + 40 }
            ].slice(0, presenceCount);

            targets.forEach(t => {
                ctx.fillStyle = activity === 'ACTIVE' ? '#EF4444' : '#10B981';
                ctx.beginPath();
                ctx.arc(t.x, t.y, 10, 0, Math.PI * 2);
                ctx.fill();

                // Glow Ring
                ctx.strokeStyle = activity === 'ACTIVE' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.4)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(t.x, t.y, 18, 0, Math.PI * 2);
                ctx.stroke();
            });
        }
    }
}

window.chartsEngine = new RuViewChartsEngine();
