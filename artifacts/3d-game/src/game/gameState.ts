import * as THREE from 'three';
import { BotData, BulletData, SPAWN_POINTS } from './types';
import {
  BOT_HEALTH,
  BOT_NAMES,
  BOT_COLORS,
  MATCH_DURATION,
  MAX_AMMO,
  PLAYER_HEALTH,
} from './constants';

function makeBotData(index: number): BotData {
  const si = Math.floor(Math.random() * SPAWN_POINTS.length);
  const sp = SPAWN_POINTS[si];
  return {
    id: `bot-${index}`,
    name: BOT_NAMES[index % BOT_NAMES.length],
    color: BOT_COLORS[index % BOT_COLORS.length],
    position: new THREE.Vector3(sp[0], 0.9, sp[2]),
    yaw: Math.random() * Math.PI * 2,
    health: BOT_HEALTH,
    maxHealth: BOT_HEALTH,
    isAlive: true,
    kills: 0,
    aiState: 'patrol' as const,
    patrolTarget: new THREE.Vector3(
      (Math.random() - 0.5) * 40,
      0.9,
      (Math.random() - 0.5) * 40,
    ),
    patrolTimer: 0,
    shootCooldown: 0,
    respawnTimer: 0,
  };
}

export const sharedState = {
  playerPos: new THREE.Vector3(0, 0.9, 0),
  playerYaw: 0,
  playerPitch: 0,
  playerHealth: PLAYER_HEALTH,
  playerAlive: true,
  playerRespawnTimer: 0,
  playerAmmo: MAX_AMMO,
  playerKills: 0,
  playerDeaths: 0,
  playerIsReloading: false,
  playerReloadTimer: 0,
  matchTimer: MATCH_DURATION,
  matchRunning: false,
  bullets: [] as BulletData[],
  bots: [] as BotData[],
  isPointerLocked: false,
  lastHitFlash: 0,
};

export function initBots(count: number) {
  sharedState.bots = Array.from({ length: count }, (_, i) => makeBotData(i));
}

export function initQuickPlay() {
  const sp = SPAWN_POINTS[0];
  sharedState.playerPos.set(sp[0], 0.9, sp[2]);
  sharedState.playerYaw = 0;
  sharedState.playerPitch = 0;
  sharedState.playerHealth = PLAYER_HEALTH;
  sharedState.playerAlive = true;
  sharedState.playerRespawnTimer = 0;
  sharedState.playerAmmo = MAX_AMMO;
  sharedState.playerKills = 0;
  sharedState.playerDeaths = 0;
  sharedState.playerIsReloading = false;
  sharedState.playerReloadTimer = 0;
  sharedState.matchTimer = MATCH_DURATION;
  sharedState.matchRunning = true;
  sharedState.bullets = [];
  sharedState.lastHitFlash = 0;
  initBots(4);
}

let _bulletIdCounter = 0;
export function nextBulletId() {
  return `bullet-${++_bulletIdCounter}`;
}
