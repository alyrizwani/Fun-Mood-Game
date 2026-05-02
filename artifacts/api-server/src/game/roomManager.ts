export interface RoomPlayer {
  id: string;
  name: string;
  isHost: boolean;
  ws: unknown;
}

export interface Room {
  code: string;
  players: Map<string, RoomPlayer>;
  started: boolean;
  createdAt: number;
}

const rooms = new Map<string, Room>();

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function createRoom(hostId: string, hostName: string, ws: unknown): Room {
  let code = generateCode();
  while (rooms.has(code)) code = generateCode();

  const room: Room = {
    code,
    players: new Map(),
    started: false,
    createdAt: Date.now(),
  };

  room.players.set(hostId, { id: hostId, name: hostName, isHost: true, ws });
  rooms.set(code, room);
  return room;
}

export function joinRoom(code: string, playerId: string, playerName: string, ws: unknown): Room | null {
  const room = rooms.get(code.toUpperCase());
  if (!room) return null;
  if (room.started) return null;
  if (room.players.size >= 8) return null;
  room.players.set(playerId, { id: playerId, name: playerName, isHost: false, ws });
  return room;
}

export function leaveRoom(code: string, playerId: string): Room | null {
  const room = rooms.get(code);
  if (!room) return null;
  room.players.delete(playerId);
  if (room.players.size === 0) {
    rooms.delete(code);
    return null;
  }
  // Transfer host if the host left
  const wasHost = !Array.from(room.players.values()).some((p) => p.isHost);
  if (wasHost && room.players.size > 0) {
    const first = room.players.values().next().value;
    if (first) first.isHost = true;
  }
  return room;
}

export function getRoom(code: string): Room | undefined {
  return rooms.get(code);
}

export function broadcastToRoom(room: Room, msg: object, excludeId?: string) {
  const data = JSON.stringify(msg);
  for (const [id, player] of room.players) {
    if (id === excludeId) continue;
    try {
      (player.ws as { send: (d: string) => void }).send(data);
    } catch {
      // ignore disconnected
    }
  }
}

// Clean up stale rooms (older than 2 hours)
setInterval(() => {
  const now = Date.now();
  for (const [code, room] of rooms) {
    if (now - room.createdAt > 7200000) {
      rooms.delete(code);
    }
  }
}, 60000);
