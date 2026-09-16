const API_HOST = window.location.hostname || 'localhost';
const API_BASE_URL = `http://${API_HOST}:5000/api`;
const WS_URL = `ws://${API_HOST}:5000/ws`;

export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
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
      console.error(`[FetchAPI] Backend unreachable at ${API_BASE_URL}. Ensure the server is running on port 5000.`);
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
