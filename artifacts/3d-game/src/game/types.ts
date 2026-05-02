import * as THREE from 'three';

export type Vec3 = [number, number, number];

export type GameMode = 'menu' | 'lobby' | 'playing' | 'ended';

export type BotAIState = 'patrol' | 'chase' | 'attack';

export interface BotData {
  id: string;
  name: string;
  color: string;
  position: THREE.Vector3;
  yaw: number;
  health: number;
  maxHealth: number;
  isAlive: boolean;
  kills: number;
  aiState: BotAIState;
  patrolTarget: THREE.Vector3;
  patrolTimer: number;
  shootCooldown: number;
  respawnTimer: number;
  mesh?: THREE.Object3D;
}

export interface BulletData {
  id: string;
  position: THREE.Vector3;
  direction: THREE.Vector3;
  ownerId: string;
  ownerType: 'player' | 'bot';
  spawnTime: number;
  alive: boolean;
}

export interface ScoreEntry {
  id: string;
  name: string;
  kills: number;
  deaths: number;
  color?: string;
}

export interface LobbyPlayer {
  id: string;
  name: string;
  isHost: boolean;
}

export const SPAWN_POINTS: Vec3[] = [
  [0, 0, 0],
  [10, 0, 10],
  [-10, 0, 10],
  [10, 0, -10],
  [-10, 0, -10],
  [18, 0, 0],
  [-18, 0, 0],
  [0, 0, 18],
  [0, 0, -18],
];

export function randomSpawn(): THREE.Vector3 {
  const sp = SPAWN_POINTS[Math.floor(Math.random() * SPAWN_POINTS.length)];
  return new THREE.Vector3(sp[0], 0.9, sp[2]);
}
