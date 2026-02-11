import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import { WebSocketConnectionPool } from './ConnectionPool';

const app = express();
const pool = new WebSocketConnectionPool(300000);

pool.on('connection:added', (stats) => {
  console.log('✅ Connection added:', stats);
});

pool.on('connection:removed', (stats) => {
  console.log('❌ Connection removed:', stats);
});

pool.on('message', ({ id, data }) => {
  try {
    const message = JSON.parse(data);

    if (message.type === 'join-room') {
      pool.joinRoom(id, message.room);
      pool.broadcastToRoom(message.room, {
        type: 'user-joined',
        userId: id,
      });
    } else if (message.type === 'leave-room') {
      pool.leaveRoom(id, message.room);
    } else if (message.type === 'message') {
      pool.broadcastToRoom(message.room, {
        type: 'message',
        userId: id,
        content: message.content,
      });
    }
  } catch (error: any) {
    console.error('❌ Message parse error:', error.message);
  }
});

app.get('/stats', (req, res) => {
  res.json(pool.getStats());
});

const server = app.listen(3005, () => {
  console.log('🚀 HTTP server on http://localhost:3005');
});

const wss = new WebSocketServer({ server });

wss.on('connection', (socket: WebSocket) => {
  const connectionId = Math.random().toString(36).substring(7);
  pool.addConnection(connectionId, socket, { connectedAt: new Date() });
});

console.log('🚀 WebSocket server ready on ws://localhost:3005');
