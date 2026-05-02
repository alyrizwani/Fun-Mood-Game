import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { BotData } from './types';
import { sharedState, nextBulletId } from './gameState';
import {
  BOT_SPEED,
  BOT_SHOOT_RANGE,
  BOT_CHASE_RANGE,
  BOT_SHOOT_COOLDOWN,
  BOT_SPREAD,
  MAP_HALF,
  RESPAWN_TIME,
  BOT_HEALTH,
} from './constants';
import { BulletData, SPAWN_POINTS } from './types';

interface BotEntityProps {
  bot: BotData;
}

const _toPlayer = new THREE.Vector3();
const _patrolDir = new THREE.Vector3();

function getRandomPatrolTarget(): THREE.Vector3 {
  return new THREE.Vector3(
    (Math.random() - 0.5) * (MAP_HALF * 2 - 4),
    0.9,
    (Math.random() - 0.5) * (MAP_HALF * 2 - 4),
  );
}

export default function BotEntity({ bot }: BotEntityProps) {
  const meshRef = useRef<THREE.Group>(null!);
  const healthBarRef = useRef<HTMLDivElement>(null);
  const nameTagRef = useRef<HTMLDivElement>(null);

  const bodyColor = useMemo(() => new THREE.Color(bot.color), [bot.color]);
  const darkColor = useMemo(() => {
    const c = new THREE.Color(bot.color);
    c.multiplyScalar(0.5);
    return c;
  }, [bot.color]);

  useFrame((_, delta) => {
    if (!sharedState.matchRunning) return;
    if (!meshRef.current) return;

    // Respawn
    if (!bot.isAlive) {
      meshRef.current.visible = false;
      bot.respawnTimer -= delta;
      if (bot.respawnTimer <= 0) {
        const sp = SPAWN_POINTS[Math.floor(Math.random() * SPAWN_POINTS.length)];
        bot.position.set(sp[0], 0.9, sp[2]);
        bot.health = BOT_HEALTH;
        bot.isAlive = true;
        bot.aiState = 'patrol';
        bot.shootCooldown = 1;
      }
      return;
    }

    meshRef.current.visible = true;

    // Update health bar DOM directly (no React re-render needed)
    if (healthBarRef.current) {
      const pct = Math.max(0, bot.health / BOT_HEALTH);
      healthBarRef.current.style.width = `${pct * 100}%`;
      healthBarRef.current.style.background =
        pct > 0.5 ? '#00ff44' : pct > 0.25 ? '#ffaa00' : '#ff3333';
    }

    // Shoot cooldown
    if (bot.shootCooldown > 0) bot.shootCooldown -= delta;

    // Get distance to player
    _toPlayer.copy(sharedState.playerPos).sub(bot.position);
    const distToPlayer = _toPlayer.length();

    // AI state machine
    if (sharedState.playerAlive) {
      if (distToPlayer < BOT_SHOOT_RANGE) {
        bot.aiState = 'attack';
      } else if (distToPlayer < BOT_CHASE_RANGE) {
        bot.aiState = 'chase';
      } else {
        if (bot.aiState === 'attack' || bot.aiState === 'chase') {
          bot.aiState = 'patrol';
          bot.patrolTarget = getRandomPatrolTarget();
        }
      }
    } else {
      bot.aiState = 'patrol';
    }

    // Patrol timer
    bot.patrolTimer -= delta;
    if (bot.patrolTimer <= 0) {
      bot.patrolTarget = getRandomPatrolTarget();
      bot.patrolTimer = 3 + Math.random() * 4;
    }

    // Movement
    if (bot.aiState === 'patrol') {
      _patrolDir.copy(bot.patrolTarget).sub(bot.position);
      _patrolDir.y = 0;
      const patrolDist = _patrolDir.length();
      if (patrolDist < 1.5) {
        bot.patrolTarget = getRandomPatrolTarget();
        bot.patrolTimer = 3 + Math.random() * 4;
      } else {
        _patrolDir.normalize();
        bot.position.addScaledVector(_patrolDir, BOT_SPEED * delta);
        bot.yaw = Math.atan2(-_patrolDir.x, -_patrolDir.z);
      }
    } else if (bot.aiState === 'chase') {
      _toPlayer.normalize();
      bot.position.addScaledVector(_toPlayer, BOT_SPEED * 1.3 * delta);
      bot.yaw = Math.atan2(-_toPlayer.x, -_toPlayer.z);
    } else if (bot.aiState === 'attack') {
      _toPlayer.normalize();
      bot.yaw = Math.atan2(-_toPlayer.x, -_toPlayer.z);

      if (bot.shootCooldown <= 0 && sharedState.playerAlive) {
        bot.shootCooldown = BOT_SHOOT_COOLDOWN + (Math.random() - 0.5) * 0.4;
        const dir = _toPlayer.clone();
        dir.x += (Math.random() - 0.5) * BOT_SPREAD * 2;
        dir.z += (Math.random() - 0.5) * BOT_SPREAD * 2;
        dir.y += (Math.random() - 0.5) * BOT_SPREAD;
        dir.normalize();

        const bulletPos = bot.position.clone().addScaledVector(dir, 1.0);
        const bullet: BulletData = {
          id: nextBulletId(),
          position: bulletPos,
          direction: dir,
          ownerId: bot.id,
          ownerType: 'bot',
          spawnTime: Date.now(),
          alive: true,
        };
        sharedState.bullets.push(bullet);
      }
    }

    // Clamp to map
    bot.position.x = Math.max(-MAP_HALF + 0.5, Math.min(MAP_HALF - 0.5, bot.position.x));
    bot.position.z = Math.max(-MAP_HALF + 0.5, Math.min(MAP_HALF - 0.5, bot.position.z));

    // Update mesh transform
    meshRef.current.position.copy(bot.position);
    meshRef.current.rotation.y = bot.yaw;
  });

  return (
    <group ref={meshRef} position={[bot.position.x, bot.position.y, bot.position.z]}>
      {/* Body */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[0.55, 0.9, 0.3]} />
        <meshStandardMaterial color={bodyColor} roughness={0.6} emissive={bodyColor} emissiveIntensity={0.1} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.65, 0]} castShadow>
        <boxGeometry args={[0.38, 0.35, 0.35]} />
        <meshStandardMaterial color={bodyColor} roughness={0.6} emissive={bodyColor} emissiveIntensity={0.15} />
      </mesh>
      {/* Visor glow */}
      <mesh position={[0, 0.67, 0.175]}>
        <boxGeometry args={[0.28, 0.12, 0.02]} />
        <meshStandardMaterial color="#00ccff" emissive="#00ccff" emissiveIntensity={0.8} />
      </mesh>
      {/* Gun */}
      <mesh position={[0.35, -0.05, 0.2]}>
        <boxGeometry args={[0.08, 0.08, 0.4]} />
        <meshStandardMaterial color={darkColor} roughness={0.8} />
      </mesh>
      {/* Left leg */}
      <mesh position={[-0.15, -0.65, 0]} castShadow>
        <boxGeometry args={[0.2, 0.5, 0.25]} />
        <meshStandardMaterial color={darkColor} roughness={0.8} />
      </mesh>
      {/* Right leg */}
      <mesh position={[0.15, -0.65, 0]} castShadow>
        <boxGeometry args={[0.2, 0.5, 0.25]} />
        <meshStandardMaterial color={darkColor} roughness={0.8} />
      </mesh>

      {/* Name tag + health bar — updated imperatively via ref */}
      <Html position={[0, 1.3, 0]} center distanceFactor={12} occlude={false}>
        <div
          ref={nameTagRef}
          style={{
            background: 'rgba(0,0,0,0.75)',
            border: `1px solid ${bot.color}`,
            borderRadius: '4px',
            padding: '2px 6px',
            color: 'white',
            fontSize: '10px',
            fontFamily: 'monospace',
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          <div style={{ color: bot.color }}>{bot.name}</div>
          <div style={{
            width: '60px', height: '4px',
            background: '#333', borderRadius: '2px', marginTop: '2px',
          }}>
            <div
              ref={healthBarRef}
              style={{
                width: '100%', height: '100%',
                background: '#00ff44',
                borderRadius: '2px',
              }}
            />
          </div>
        </div>
      </Html>
    </group>
  );
}
