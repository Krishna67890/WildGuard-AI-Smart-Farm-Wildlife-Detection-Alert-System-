// =========================================================================
// WildGuard AI - Unified API & Real-Time WebSocket Transport
// =========================================================================

// Resolve backend base URL:
// 1. Explicit import.meta.env.VITE_BACKEND_URL
// 2. Backward-compatible import.meta.env.VITE_API_BASE_URL (stripping trailing /api)
// 3. Fallback to local network hostname or (import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000')
const resolveBackendUrl = (): string => {
  const envBackend = import.meta.env.VITE_BACKEND_URL;
  if (envBackend) {
    return envBackend.replace(/\/+$/, '');
  }

  const envApi = import.meta.env.VITE_API_BASE_URL;
  if (envApi) {
    return envApi.replace(/\/api\/?$/, '');
  }

  if (
    typeof window !== 'undefined' &&
    window.location.hostname &&
    window.location.hostname !== 'localhost' &&
    !window.location.hostname.includes('vercel.app')
  ) {
    const proto = window.location.protocol === 'https:' ? 'https' : 'http';
    return `${proto}://${window.location.hostname}:5000`;
  }

  return import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
};

// Resolve external AI detection service URL (port 8000 default):
// 1. Explicit import.meta.env.VITE_AI_URL or fallback to VITE_BACKEND_URL
// 2. Fallback to local network hostname or (import.meta.env.VITE_AI_URL || import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000')
const resolveAiUrl = (): string => {
  const envAi = import.meta.env.VITE_AI_URL;
  if (envAi) {
    return envAi.replace(/\/+$/, '');
  }

  if (
    typeof window !== 'undefined' &&
    window.location.hostname &&
    window.location.hostname !== 'localhost' &&
    !window.location.hostname.includes('vercel.app')
  ) {
    const proto = window.location.protocol === 'https:' ? 'https' : 'http';
    return `${proto}://${window.location.hostname}:8000`;
  }

  return import.meta.env.VITE_AI_URL || import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
};

export const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || resolveBackendUrl() || 'http://localhost:5000').replace(/\/+$/, '');
export const AI_URL = (import.meta.env.VITE_AI_URL || resolveAiUrl() || 'http://localhost:8000').replace(/\/+$/, '');

// Base URL for Express backend endpoints (e.g. https://tunnel.ngrok-free.app/api or http://localhost:5000/api)
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  `${BACKEND_URL}/api`;

// Derive WebSocket URL automatically from BACKEND_URL protocol (ws:// or wss://)
const resolveWsUrl = (): string => {
  if (import.meta.env.VITE_WS_URL) {
    return import.meta.env.VITE_WS_URL;
  }
  try {
    const parsed = new URL(BACKEND_URL);
    const wsProto = parsed.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${wsProto}//${parsed.host}/ws`;
  } catch {
    const fallbackBase = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
    try {
      const parsed = new URL(fallbackBase);
      const wsProto = parsed.protocol === 'https:' ? 'wss:' : 'ws:';
      return `${wsProto}//${parsed.host}/ws`;
    } catch {
      return 'ws://localhost:5000/ws';
    }
  }
};

export const WS_URL = resolveWsUrl();

export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        // Bypass ngrok free-tier warning page so API calls succeed through tunnels
        'ngrok-skip-browser-warning': 'true',
        ...options?.headers
      },
      ...options
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      console.error(
        `[FetchAPI] Backend unreachable at ${API_BASE_URL}. Ensure the server is running on port 5000 or the HTTPS tunnel is active.`
      );
    } else {
      console.error(`[FetchAPI] Error fetching ${endpoint}:`, error);
    }
    throw error;
  }
}

export class WebSocketClient {
  private socket: WebSocket | null = null;
  private listeners: Map<string, Array<(data: any) => void>> = new Map();
  private reconnectInterval = 3000;
  private shouldReconnect = true;

  constructor() {
    this.connect();
  }

  private connect() {
    try {
      this.socket = new WebSocket(WS_URL);

      this.socket.onopen = () => {
        console.log('[WebSocketClient] Connected to WildGuard AI Backend');
      };

      this.socket.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          const { type, data } = parsed;
          const callbacks = this.listeners.get(type) || [];
          callbacks.forEach(cb => cb(data));

          // Also trigger general message listeners
          const allCallbacks = this.listeners.get('*') || [];
          allCallbacks.forEach(cb => cb(parsed));
        } catch (err) {
          console.error('[WebSocketClient] Parse error:', err);
        }
      };

      this.socket.onclose = () => {
        if (this.shouldReconnect) {
          setTimeout(() => this.connect(), this.reconnectInterval);
        }
      };

      this.socket.onerror = (err) => {
        console.warn('[WebSocketClient] Socket encountered an error:', err);
        this.socket?.close();
      };
    } catch (e) {
      console.warn('[WebSocketClient] Connection failed:', e);
      if (this.shouldReconnect) {
        setTimeout(() => this.connect(), this.reconnectInterval);
      }
    }
  }

  public on(event: string, callback: (data: any) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
    return () => this.off(event, callback);
  }

  public off(event: string, callback: (data: any) => void) {
    const callbacks = this.listeners.get(event) || [];
    this.listeners.set(event, callbacks.filter(cb => cb !== callback));
  }

  public disconnect() {
    this.shouldReconnect = false;
    this.socket?.close();
  }
}

export const wsClient = new WebSocketClient();
