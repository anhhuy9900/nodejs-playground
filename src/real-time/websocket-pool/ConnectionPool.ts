import { WebSocket } from 'ws';
import { EventEmitter } from 'events';

interface Connection {
  id: string;
  socket: WebSocket;
  lastActivity: number;
  metadata: Record<string, any>;
}

export class WebSocketConnectionPool extends EventEmitter {
  private connections = new Map<string, Connection>();
  private rooms = new Map<string, Set<string>>();

  constructor(private maxIdleTime: number = 300000) {
    super();
    this.startCleanupInterval();
  }

  addConnection(id: string, socket: WebSocket, metadata: Record<string, any> = {}): void {
    const connection: Connection = {
      id,
      socket,
      lastActivity: Date.now(),
      metadata,
    };

    this.connections.set(id, connection);

    socket.on('message', (data) => {
      connection.lastActivity = Date.now();
      this.emit('message', { id, data: data.toString() });
    });

    socket.on('close', () => {
      this.removeConnection(id);
    });

    this.emit('connection:added', { id, total: this.connections.size });
  }

  removeConnection(id: string): void {
    const connection = this.connections.get(id);
    if (connection) {
      connection.socket.close();
      this.connections.delete(id);

      for (const [room, members] of this.rooms.entries()) {
        members.delete(id);
        if (members.size === 0) {
          this.rooms.delete(room);
        }
      }

      this.emit('connection:removed', { id, total: this.connections.size });
    }
  }

  joinRoom(connectionId: string, room: string): void {
    if (!this.rooms.has(room)) {
      this.rooms.set(room, new Set());
    }
    this.rooms.get(room)!.add(connectionId);
  }

  leaveRoom(connectionId: string, room: string): void {
    const members = this.rooms.get(room);
    if (members) {
      members.delete(connectionId);
      if (members.size === 0) {
        this.rooms.delete(room);
      }
    }
  }

  broadcast(message: any, excludeId?: string): void {
    const payload = JSON.stringify(message);
    for (const [id, connection] of this.connections.entries()) {
      if (id !== excludeId && connection.socket.readyState === WebSocket.OPEN) {
        connection.socket.send(payload);
      }
    }
  }

  broadcastToRoom(room: string, message: any): void {
    const members = this.rooms.get(room);
    if (!members) return;

    const payload = JSON.stringify(message);
    for (const id of members) {
      const connection = this.connections.get(id);
      if (connection && connection.socket.readyState === WebSocket.OPEN) {
        connection.socket.send(payload);
      }
    }
  }

  sendToConnection(id: string, message: any): boolean {
    const connection = this.connections.get(id);
    if (connection && connection.socket.readyState === WebSocket.OPEN) {
      connection.socket.send(JSON.stringify(message));
      return true;
    }
    return false;
  }

  private startCleanupInterval(): void {
    setInterval(() => {
      const now = Date.now();
      for (const [id, connection] of this.connections.entries()) {
        if (now - connection.lastActivity > this.maxIdleTime) {
          console.log(`🧹 Removing idle connection: ${id}`);
          this.removeConnection(id);
        }
      }
    }, 60000);
  }

  getStats() {
    return {
      totalConnections: this.connections.size,
      totalRooms: this.rooms.size,
      rooms: Array.from(this.rooms.entries()).map(([room, members]) => ({
        room,
        members: members.size,
      })),
    };
  }
}
