/**
 * RuView WebSocket Manager
 * Provides auto-reconnecting WebSocket connection with exponential backoff.
 */

class RuViewWebSocketClient {
    constructor(wsUrl = 'ws://127.0.0.1:3001') {
        this.wsUrl = wsUrl;
        this.socket = null;
        this.reconnectAttempts = 0;
        this.maxReconnectDelay = 30000;
        this.listeners = [];
        this.isConnected = false;
    }

    setUrl(url) {
        this.wsUrl = url;
        if (this.socket) {
            this.socket.close();
        }
    }

    connect() {
        if (this.socket && (this.socket.readyState === WebSocket.CONNECTING || this.socket.readyState === WebSocket.OPEN)) {
            return;
        }

        try {
            this.socket = new WebSocket(this.wsUrl);
            
            this.socket.onopen = () => {
                this.isConnected = true;
                this.reconnectAttempts = 0;
                this.notifyState('CONNECTED');
            };

            this.socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.notifyMessage(data);
                } catch (e) {
                    // Plain text message handling
                    this.notifyMessage({ type: 'text', content: event.data });
                }
            };

            this.socket.onclose = () => {
                this.isConnected = false;
                this.notifyState('DISCONNECTED');
                this.scheduleReconnect();
            };

            this.socket.onerror = (error) => {
                this.isConnected = false;
                this.notifyState('ERROR');
            };
        } catch (e) {
            this.scheduleReconnect();
        }
    }

    scheduleReconnect() {
        this.reconnectAttempts++;
        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), this.maxReconnectDelay);
        this.notifyState(`RECONNECTING (${Math.round(delay/1000)}s)`);
        setTimeout(() => this.connect(), delay);
    }

    onStateChange(callback) {
        this.stateCallback = callback;
    }

    onMessage(callback) {
        this.listeners.push(callback);
    }

    notifyState(state) {
        if (this.stateCallback) this.stateCallback(state);
    }

    notifyMessage(msg) {
        this.listeners.forEach(cb => cb(msg));
    }
}

window.wsClient = new RuViewWebSocketClient();
