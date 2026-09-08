/**
 * RuView REST API Client
 * Interfaces directly with local RuView Sensing Backend endpoints.
 */

class RuViewApiClient {
    constructor(baseUrl = 'http://127.0.0.1:3000') {
        this.baseUrl = baseUrl;
    }

    setBaseUrl(url) {
        this.baseUrl = url;
    }

    async getSystemStatus() {
        try {
            const res = await fetch(`${this.baseUrl}/api/v1/status`, { timeout: 3000 });
            if (!res.ok) throw new Error(`HTTP error ${res.status}`);
            return await res.json();
        } catch (e) {
            // Fallback check on root / or /health
            try {
                const res = await fetch(`${this.baseUrl}/health`, { timeout: 2000 });
                if (res.ok) return await res.json();
            } catch (_) {}
            return { online: false, error: e.message };
        }
    }

    async getConnectedNodes() {
        try {
            const res = await fetch(`${this.baseUrl}/api/v1/nodes`);
            if (!res.ok) return [];
            return await res.json();
        } catch (e) {
            return [];
        }
    }

    async getTelemetry() {
        try {
            const res = await fetch(`${this.baseUrl}/api/v1/telemetry`);
            if (!res.ok) return null;
            return await res.json();
        } catch (e) {
            return null;
        }
    }

    async setDedupFactor(factor) {
        try {
            const res = await fetch(`${this.baseUrl}/api/v1/config/dedup-factor`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dedup_factor: parseFloat(factor) })
            });
            return res.ok;
        } catch (e) {
            return false;
        }
    }
}

window.apiClient = new RuViewApiClient();
