import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage, Server } from 'http';
import { createRoom, joinRoom, leaveRoom, getRoom, broadcastToRoom } from './roomManager';
import { logger } from '../lib/logger';

interface Client {
  id: string;
  ws: WebSocket;
  roomCode: string | null;
  name: string;
}

const clients = new Map<string, Client>();

function genId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function attachWebSocketServer(server: Server) {
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
    const id = genId();
    const client: Client = { id, ws, roomCode: null, name: 'Player' };
    clients.set(id, client);
    logger.info({ id }, 'WS client connected');

    ws.send(JSON.stringify({ type: 'connected', playerId: id }));

    ws.on('message', (raw) => {
      let msg: Record<string, unknown>;
      try {
        msg = JSON.parse(raw.toString());
      } catch {
        return;
      }

      const type = msg.type as string;

      if (type === 'create_room') {
        const name = (msg.playerName as string) || 'Player';
        client.name = name;
        const room = createRoom(id, name, ws);
        client.roomCode = room.code;
        ws.send(JSON.stringify({
          type: 'room_created',
          roomCode: room.code,
          playerId: id,
          players: [{ id, name, isHost: true }],
        }));
        logger.info({ id, roomCode: room.code }, 'Room created');
        return;
      }

      if (type === 'join_room') {
        const code = (msg.roomCode as string)?.toUpperCase();
        const name = (msg.playerName as string) || 'Player';
        client.name = name;
        const room = joinRoom(code, id, name, ws);
        if (!room) {
          ws.send(JSON.stringify({ type: 'error', message: 'Room not found or full' }));
          return;
        }
        client.roomCode = code;
        const players = Array.from(room.players.values()).map((p) => ({
          id: p.id, name: p.name, isHost: p.isHost,
        }));
        ws.send(JSON.stringify({ type: 'room_joined', roomCode: code, playerId: id, players }));
        broadcastToRoom(room, { type: 'player_joined', player: { id, name, isHost: false } }, id);
        logger.info({ id, roomCode: code }, 'Player joined room');
        return;
      }

      if (type === 'start_match') {
        if (!client.roomCode) return;
        const room = getRoom(client.roomCode);
        if (!room) return;
        const host = Array.from(room.players.values()).find((p) => p.isHost);
        if (!host || host.id !== id) return;
        room.started = true;
        broadcastToRoom(room, { type: 'match_start' });
        logger.info({ roomCode: client.roomCode }, 'Match started');
        return;
      }

      if (type === 'player_update') {
        if (!client.roomCode) return;
        const room = getRoom(client.roomCode);
        if (!room) return;
        broadcastToRoom(room, { ...msg, playerId: id }, id);
        return;
      }

      if (type === 'shoot') {
        if (!client.roomCode) return;
        const room = getRoom(client.roomCode);
        if (!room) return;
        broadcastToRoom(room, { ...msg, playerId: id }, id);
        return;
      }

      if (type === 'player_hit') {
        if (!client.roomCode) return;
        const room = getRoom(client.roomCode);
        if (!room) return;
        broadcastToRoom(room, { ...msg, attackerId: id });
        return;
      }
    });

    ws.on('close', () => {
      if (client.roomCode) {
        const room = leaveRoom(client.roomCode, id);
        if (room) {
          broadcastToRoom(room, { type: 'player_left', playerId: id });
        }
      }
      clients.delete(id);
      logger.info({ id }, 'WS client disconnected');
    });

    ws.on('error', (err) => {
      logger.error({ id, err }, 'WS error');
    });
  });

  logger.info('WebSocket server attached at /ws');
  return wss;
}
