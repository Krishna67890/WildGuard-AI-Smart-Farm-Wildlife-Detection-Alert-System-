import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import cors from 'cors';
import { apiRouter } from './controllers/apiRoutes.js';
import { alertOrchestrator } from './services/alertOrchestrator.js';
import { db } from './database/store.js';

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

// Explicitly allowed production/staging origins
const ALLOWED_ORIGINS = [
  'https://wildguard-ai-beta.vercel.app',
  process.env.FRONTEND_URL,
  process.env.CORS_ORIGIN
].filter(Boolean) as string[];

// Configure CORS to allow requests from Vercel deployments, HTTPS tunnels, and local network devices
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g. mobile native clients, curl, Postman, IoT nodes)
    if (!origin) return callback(null, true);

    // Explicitly allow WildGuard AI Beta Vercel deployment
    if (origin === 'https://wildguard-ai-beta.vercel.app' || ALLOWED_ORIGINS.includes(origin)) {
      return callback(null, true);
    }

    // Allow all Vercel deployments (*.vercel.app)
    if (/^https?:\/\/.*\.vercel\.app$/.test(origin)) {
      return callback(null, true);
    }

    // Allow localhost, loopback, and local network IP ranges
    if (
      /^https?:\/\/localhost(:\d+)?$/.test(origin) ||
      /^https?:\/\/127\.0\.0\.1(:\d+)?$/.test(origin) ||
      /^https?:\/\/192\.168\.\d+\.\d+(:\d+)?$/.test(origin) ||
      /^https?:\/\/10\.\d+\.\d+\.\d+(:\d+)?$/.test(origin) ||
      /^https?:\/\/172\.(1[6-9]|2\d|3[01])\.\d+\.\d+(:\d+)?$/.test(origin)
    ) {
      return callback(null, true);
    }

    // Allow public HTTPS tunnel services (ngrok, localtunnel, Cloudflare tunnel)
    if (
      /^https?:\/\/.*\.ngrok(-free)?\.app$/.test(origin) ||
      /^https?:\/\/.*\.loca\.lt$/.test(origin) ||
      /^https?:\/\/.*\.trycloudflare\.com$/.test(origin)
    ) {
      return callback(null, true);
    }

    // Allow explicitly defined FRONTEND_URL or CORS_ORIGIN
    if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) {
      return callback(null, true);
    }
    if (process.env.CORS_ORIGIN && origin === process.env.CORS_ORIGIN) {
      return callback(null, true);
    }

    // Disallow unverified external origins to make origin restrictions effective
    console.warn(`[CORS] Blocked request from unauthorized origin: ${origin}`);
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'ngrok-skip-browser-warning',
    'bypass-tunnel-reminder'
  ]
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static assets or snapshots
app.use('/snapshots', express.static('public/snapshots'));

// Mount API routes
app.use('/api', apiRouter);

// Root route
app.get('/', (req, res) => {
  res.json({
    project: 'WildGuard AI – Intelligent Wildlife Harm & Intrusion Detection System',
    status: 'OPERATIONAL',
    version: '1.0.0',
    documentation: '/api/health'
  });
});

const server = http.createServer(app);

// Setup WebSocket Server for Real-Time Event Dispatch
const wss = new WebSocketServer({ server, path: '/ws' });

const connectedClients = new Set<WebSocket>();

wss.on('connection', (ws: WebSocket) => {
  connectedClients.add(ws);
  console.log(`[WebSocket] Client connected. Total active clients: ${connectedClients.size}`);

  // Send initial state
  ws.send(JSON.stringify({
    type: 'CONNECTION_ESTABLISHED',
    data: {
      activeAlarms: db.incidents.filter(i => i.status === 'ACTIVE' && (i.threatLevel === 'CRITICAL' || i.threatLevel === 'HIGH')),
      onlineCameras: db.cameras.filter(c => c.status === 'ONLINE').length
    }
  }));

  ws.on('close', () => {
    connectedClients.delete(ws);
    console.log(`[WebSocket] Client disconnected. Remaining: ${connectedClients.size}`);
  });
});

// Broadcast helper
function broadcastEvent(eventType: string, payload: any) {
  const message = JSON.stringify({ type: eventType, data: payload, timestamp: new Date().toISOString() });
  connectedClients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// Wire orchestrator to broadcast
alertOrchestrator.setBroadcastListener((event, data) => {
  broadcastEvent(event, data);
});

// Periodic background heartbeat / simulated wildlife activity
setInterval(() => {
  // Update camera heartbeats
  db.cameras.forEach(c => {
    c.lastHeartbeat = new Date().toISOString();
  });
  // Broadcast a heartbeat to keep client WebSocket alive
  broadcastEvent('SYSTEM_HEARTBEAT', {
    timestamp: new Date().toISOString(),
    activeAlarms: db.incidents.filter(i => i.status === 'ACTIVE' && i.threatLevel === 'CRITICAL').length
  });
}, 10000);

// Explicitly bind HTTP & WebSocket server to HOST (0.0.0.0 default) for LAN and remote tunnel access
server.listen(Number(PORT), HOST, () => {
  console.log(`=======================================================`);
  console.log(`🐾 WildGuard AI Backend Server is RUNNING on http://${HOST}:${PORT}`);
  console.log(`📡 WebSocket endpoint available at /ws`);
  console.log(`🌐 Bound to ${HOST} (Accessible via Local Network & Remote Tunnels)`);
  console.log(`🔒 Allowed CORS Origin: https://wildguard-ai-beta.vercel.app`);
  console.log(`⚡ Ethical Wildlife Protection & Threat Engine ACTIVE`);
  console.log(`=======================================================`);
});
