/**
 * RuView Spatial Data Adapter
 * Normalizes raw backend telemetry/CSI inference frames into a standardized Spatial Data Object.
 */

class SpatialDataAdapter {
    constructor() {
        this.nodes = [];
        this.targets = [];
        this.heatmapPoints = [];
    }

    normalize(rawData) {
        if (!rawData) return this.emptyState();

        // Extract or default node states
        const rawNodes = rawData.nodes || rawData.devices || [];
        this.nodes = rawNodes.map((n, idx) => ({
            id: n.id || `node-${idx + 1}`,
            name: n.name || `ESP32-S3-${String(idx + 1).padStart(2, '0')}`,
            x: n.x !== undefined ? n.x : (idx === 0 ? 0.15 : 0.85),
            y: n.y !== undefined ? n.y : (idx === 0 ? 0.15 : 0.85),
            status: n.status || 'ONLINE',
            rssi: n.rssi || -52,
            csiRate: n.csi_rate || 128
        }));

        // Extract target occupants
        const occupancy = rawData.occupancy !== undefined ? rawData.occupancy : (rawData.occupancy_count || 0);
        const rawTargets = rawData.targets || [];

        this.targets = [];
        for (let i = 0; i < occupancy; i++) {
            const raw = rawTargets[i] || {};
            this.targets.push({
                id: raw.id || `person-${i + 1}`,
                label: `Person #${i + 1}`,
                x: raw.x !== undefined ? raw.x : (0.4 + i * 0.2),
                y: raw.y !== undefined ? raw.y : (0.45 + i * 0.1),
                confidence: raw.confidence || 0.85,
                activity: rawData.activity || raw.activity || 'ACTIVE',
                movementTrail: raw.trail || []
            });
        }

        // CSI RF Heatmap activity intensity (0.0 to 1.0)
        const intensity = rawData.motion_energy ? Math.min(rawData.motion_energy / 100, 1.0) : 0.4;
        this.heatmapPoints = this.targets.map(t => ({
            x: t.x,
            y: t.y,
            intensity: intensity,
            radius: 0.25
        }));

        return {
            timestamp: Date.now(),
            nodes: this.nodes,
            targets: this.targets,
            heatmapPoints: this.heatmapPoints,
            occupancy: occupancy,
            csiActive: rawData.csi_active !== undefined ? rawData.csi_active : true
        };
    }

    emptyState() {
        return {
            timestamp: Date.now(),
            nodes: [],
            targets: [],
            heatmapPoints: [],
            occupancy: 0,
            csiActive: false
        };
    }
}

window.spatialAdapter = new SpatialDataAdapter();
