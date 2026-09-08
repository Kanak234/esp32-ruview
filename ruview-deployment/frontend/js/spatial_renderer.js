/**
 * RuView 2D Digital Spatial Map Renderer Engine
 * HTML5 Canvas 2D spatial visualization with zoom, pan, heatmap, node positioning, and room zones.
 */

class SpatialRenderer2D {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');

        // View Transform State
        this.scale = 1.0;
        this.panX = 0;
        this.panY = 0;
        this.isDragging = false;
        this.dragStart = { x: 0, y: 0 };

        // Layer Visibility Toggles
        this.layers = {
            nodes: true,
            heatmap: true,
            people: true,
            trails: true,
            zones: true,
            grid: true
        };

        // Bounded Target Movement History (Trails)
        this.targetTrails = new Map();

        // Default Room Calibration Configuration
        this.calibration = this.loadCalibration();

        this.initEvents();
    }

    loadCalibration() {
        const saved = localStorage.getItem('ruview_map_calibration');
        if (saved) {
            try { return JSON.parse(saved); } catch (e) {}
        }
        return {
            roomWidthMeters: 6.0,
            roomHeightMeters: 4.0,
            zones: [
                { id: 'zone-living', name: 'Living Room', x: 0.05, y: 0.05, w: 0.55, h: 0.9, color: 'rgba(59, 130, 246, 0.08)' },
                { id: 'zone-bedroom', name: 'Bedroom', x: 0.62, y: 0.05, w: 0.33, h: 0.45, color: 'rgba(139, 92, 246, 0.08)' },
                { id: 'zone-kitchen', name: 'Kitchen', x: 0.62, y: 0.52, w: 0.33, h: 0.43, color: 'rgba(16, 185, 129, 0.08)' }
            ],
            nodes: [
                { id: 'node-1', name: 'ESP32-S3-01', x: 0.1, y: 0.1 },
                { id: 'node-2', name: 'ESP32-S3-02', x: 0.9, y: 0.1 },
                { id: 'node-3', name: 'ESP32-S3-03', x: 0.1, y: 0.9 },
                { id: 'node-4', name: 'ESP32-S3-04', x: 0.9, y: 0.9 }
            ]
        };
    }

    saveCalibration(config) {
        this.calibration = config;
        localStorage.setItem('ruview_map_calibration', JSON.stringify(config));
    }

    initEvents() {
        this.canvas.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.dragStart = { x: e.clientX - this.panX, y: e.clientY - this.panY };
        });

        window.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                this.panX = e.clientX - this.dragStart.x;
                this.panY = e.clientY - this.dragStart.y;
                this.requestRender();
            }
        });

        window.addEventListener('mouseup', () => { this.isDragging = false; });

        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
            this.scale = Math.min(Math.max(this.scale * zoomFactor, 0.5), 3.0);
            this.requestRender();
        }, { passive: false });
    }

    zoomIn() { this.scale = Math.min(this.scale * 1.2, 3.0); this.requestRender(); }
    zoomOut() { this.scale = Math.max(this.scale / 1.2, 0.5); this.requestRender(); }
    resetView() { this.scale = 1.0; this.panX = 0; this.panY = 0; this.requestRender(); }

    setLayerVisibility(layerKey, isVisible) {
        if (this.layers[layerKey] !== undefined) {
            this.layers[layerKey] = isVisible;
            this.requestRender();
        }
    }

    render(spatialData) {
        if (!this.canvas || !this.ctx) return;
        this.lastSpatialData = spatialData;
        const width = this.canvas.width;
        const height = this.canvas.height;

        this.ctx.clearRect(0, 0, width, height);
        this.ctx.save();

        // Apply Pan & Zoom Transformations
        this.ctx.translate(this.panX, this.panY);
        this.ctx.scale(this.scale, this.scale);

        // 1. Grid Background
        if (this.layers.grid) this.drawGrid(width, height);

        // 2. Room Zones
        if (this.layers.zones) this.drawZones(width, height);

        // 3. CSI RF Activity Heatmap
        if (this.layers.heatmap && spatialData && spatialData.heatmapPoints) {
            this.drawHeatmap(spatialData.heatmapPoints, width, height);
        }

        // 4. Movement Trails
        if (this.layers.trails && spatialData && spatialData.targets) {
            this.drawMovementTrails(spatialData.targets, width, height);
        }

        // 5. ESP32 Sensing Nodes
        if (this.layers.nodes) this.drawNodes(spatialData ? spatialData.nodes : [], width, height);

        // 6. Person Occupant Markers
        if (this.layers.people && spatialData && spatialData.targets) {
            this.drawPeople(spatialData.targets, width, height);
        }

        this.ctx.restore();
    }

    requestRender() {
        if (this.lastSpatialData) {
            requestAnimationFrame(() => this.render(this.lastSpatialData));
        }
    }

    drawGrid(w, h) {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
        this.ctx.lineWidth = 1;
        const step = 40;
        for (let x = 0; x < w; x += step) {
            this.ctx.beginPath(); this.ctx.moveTo(x, 0); this.ctx.lineTo(x, h); this.ctx.stroke();
        }
        for (let y = 0; y < h; y += step) {
            this.ctx.beginPath(); this.ctx.moveTo(0, y); this.ctx.lineTo(w, y); this.ctx.stroke();
        }
    }

    drawZones(w, h) {
        this.calibration.zones.forEach(z => {
            const zx = z.x * w;
            const zy = z.y * h;
            const zw = z.w * w;
            const zh = z.h * h;

            this.ctx.fillStyle = z.color || 'rgba(59, 130, 246, 0.05)';
            this.ctx.fillRect(zx, zy, zw, zh);

            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(zx, zy, zw, zh);

            this.ctx.fillStyle = 'rgba(240, 244, 248, 0.5)';
            this.ctx.font = '11px Inter, sans-serif';
            this.ctx.fillText(z.name, zx + 10, zy + 20);
        });
    }

    drawHeatmap(points, w, h) {
        points.forEach(pt => {
            const cx = pt.x * w;
            const cy = pt.y * h;
            const radius = (pt.radius || 0.25) * Math.min(w, h);

            const gradient = this.ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
            gradient.addColorStop(0, `rgba(239, 68, 68, ${pt.intensity * 0.4})`);
            gradient.addColorStop(0.5, `rgba(245, 158, 11, ${pt.intensity * 0.2})`);
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    drawMovementTrails(targets, w, h) {
        targets.forEach(t => {
            let history = this.targetTrails.get(t.id) || [];
            history.push({ x: t.x * w, y: t.y * h, t: Date.now() });

            // Keep trail to last 10 points
            if (history.length > 10) history.shift();
            this.targetTrails.set(t.id, history);

            if (history.length > 1) {
                this.ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                history.forEach((pt, idx) => {
                    if (idx === 0) this.ctx.moveTo(pt.x, pt.y);
                    else this.ctx.lineTo(pt.x, pt.y);
                });
                this.ctx.stroke();
            }
        });
    }

    drawNodes(liveNodes, w, h) {
        const nodesToDraw = this.calibration.nodes;

        nodesToDraw.forEach(n => {
            const nx = n.x * w;
            const ny = n.y * h;

            // Draw ESP32 Sensor Node Base
            this.ctx.fillStyle = '#8B5CF6';
            this.ctx.beginPath();
            this.ctx.arc(nx, ny, 8, 0, Math.PI * 2);
            this.ctx.fill();

            // Antenna Pulse Ring
            this.ctx.strokeStyle = 'rgba(139, 92, 246, 0.4)';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(nx, ny, 16, 0, Math.PI * 2);
            this.ctx.stroke();

            // Node Label
            this.ctx.fillStyle = '#F0F4F8';
            this.ctx.font = 'bold 10px Inter, sans-serif';
            this.ctx.fillText(`📡 ${n.name}`, nx - 30, ny - 12);
        });
    }

    drawPeople(targets, w, h) {
        targets.forEach(t => {
            const px = t.x * w;
            const py = t.y * h;

            // Target Outer Pulse
            this.ctx.strokeStyle = t.activity === 'ACTIVE' ? 'rgba(239, 68, 68, 0.6)' : 'rgba(16, 185, 129, 0.6)';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.arc(px, py, 14, 0, Math.PI * 2);
            this.ctx.stroke();

            // Target Center Vector Marker
            this.ctx.fillStyle = t.activity === 'ACTIVE' ? '#EF4444' : '#10B981';
            this.ctx.beginPath();
            this.ctx.arc(px, py, 7, 0, Math.PI * 2);
            this.ctx.fill();

            // Target Label Card
            this.ctx.fillStyle = 'rgba(20, 25, 35, 0.85)';
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            this.ctx.lineWidth = 1;
            this.ctx.fillRect(px - 35, py + 12, 70, 22);
            this.ctx.strokeRect(px - 35, py + 12, 70, 22);

            this.ctx.fillStyle = '#F0F4F8';
            this.ctx.font = '10px Inter, sans-serif';
            this.ctx.fillText(`👤 ${t.label}`, px - 30, py + 26);
        });
    }
}

window.spatialRenderer2D = SpatialRenderer2D;
