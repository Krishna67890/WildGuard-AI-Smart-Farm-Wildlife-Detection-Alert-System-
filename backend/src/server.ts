import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import cors from 'cors';
import { apiRouter } from './controllers/apiRoutes.js';
import { alertOrchestrator } from './services/alertOrchestrator.js';
import { db } from './database/store.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: '*' }));
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

server.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`🐾 WildGuard AI Backend Server is RUNNING on port ${PORT}`);
  console.log(`📡 WebSocket endpoint available at /ws`);
  console.log(`⚡ Ethical Wildlife Protection & Threat Engine ACTIVE`);
  console.log(`=======================================================`);
});
