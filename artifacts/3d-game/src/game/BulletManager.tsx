import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { sharedState } from './gameState';
import { BULLET_SPEED, BULLET_LIFETIME, BULLET_RADIUS, BULLET_DAMAGE, BOT_BULLET_DAMAGE, RESPAWN_TIME, MAP_HALF } from './constants';

const MAX_VISIBLE = 60;
const _tempVec = new THREE.Vector3();

const playerBulletMat = new THREE.MeshBasicMaterial({ color: '#00ffaa' });
const botBulletMat = new THREE.MeshBasicMaterial({ color: '#ff4444' });
const playerTrailMat = new THREE.MeshBasicMaterial({ color: '#00ffaa', opacity: 0.25, transparent: true });
const botTrailMat = new THREE.MeshBasicMaterial({ color: '#ff4444', opacity: 0.25, transparent: true });
const bulletGeo = new THREE.SphereGeometry(0.08, 5, 4);
const trailGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.35, 4);

export default function BulletManager() {
  const groupRef = useRef<THREE.Group>(null!);
  const bulletMeshes = useRef<{ mesh: THREE.Mesh; trail: THREE.Mesh }[]>([]);
  const initialized = useRef(false);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    // Initialize pool once
    if (!initialized.current) {
      initialized.current = true;
      for (let i = 0; i < MAX_VISIBLE; i++) {
        const mesh = new THREE.Mesh(bulletGeo, playerBulletMat);
        mesh.visible = false;
        const trail = new THREE.Mesh(trailGeo, playerTrailMat);
        trail.visible = false;
        groupRef.current.add(mesh);
        groupRef.current.add(trail);
        bulletMeshes.current.push({ mesh, trail });
      }
    }

    if (!sharedState.matchRunning) {
      bulletMeshes.current.forEach(({ mesh, trail }) => {
        mesh.visible = false;
        trail.visible = false;
      });
      sharedState.bullets = [];
      return;
    }

    const now = Date.now();
    const bots = sharedState.bots;

    // Expire bullets
    sharedState.bullets = sharedState.bullets.filter(
      (b) => b.alive && now - b.spawnTime < BULLET_LIFETIME,
    );

    // Move and check collisions
    for (const bullet of sharedState.bullets) {
      if (!bullet.alive) continue;
      bullet.position.addScaledVector(bullet.direction, BULLET_SPEED * delta);

      if (Math.abs(bullet.position.x) > MAP_HALF || Math.abs(bullet.position.z) > MAP_HALF) {
        bullet.alive = false;
        continue;
      }

      if (bullet.ownerType === 'player') {
        for (const bot of bots) {
          if (!bot.isAlive) continue;
          _tempVec.copy(bot.position).sub(bullet.position);
          if (_tempVec.length() < BULLET_RADIUS) {
            bullet.alive = false;
            bot.health -= BULLET_DAMAGE;
            if (bot.health <= 0) {
              bot.health = 0;
              bot.isAlive = false;
              bot.respawnTimer = RESPAWN_TIME;
              sharedState.playerKills++;
            }
            break;
          }
        }
      } else if (bullet.ownerType === 'bot' && sharedState.playerAlive) {
        _tempVec.copy(sharedState.playerPos).sub(bullet.position);
        if (_tempVec.length() < BULLET_RADIUS) {
          bullet.alive = false;
          sharedState.playerHealth -= BOT_BULLET_DAMAGE;
          sharedState.lastHitFlash = Date.now();
          if (sharedState.playerHealth <= 0) {
            sharedState.playerHealth = 0;
            sharedState.playerAlive = false;
            sharedState.playerDeaths++;
            sharedState.playerRespawnTimer = RESPAWN_TIME;
            const shooter = bots.find((b) => b.id === bullet.ownerId);
            if (shooter) shooter.kills++;
          }
        }
      }
    }

    // Render active bullets
    const active = sharedState.bullets.filter((b) => b.alive);
    for (let i = 0; i < bulletMeshes.current.length; i++) {
      const slot = bulletMeshes.current[i];
      const bullet = active[i];
      if (bullet) {
        const isPlayer = bullet.ownerType === 'player';
        slot.mesh.material = isPlayer ? playerBulletMat : botBulletMat;
        slot.mesh.position.copy(bullet.position);
        slot.mesh.visible = true;

        slot.trail.material = isPlayer ? playerTrailMat : botTrailMat;
        slot.trail.position.copy(bullet.position);
        slot.trail.position.addScaledVector(bullet.direction, -0.2);
        slot.trail.quaternion.setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          bullet.direction.clone().normalize(),
        );
        slot.trail.visible = true;
      } else {
        slot.mesh.visible = false;
        slot.trail.visible = false;
      }
    }
  });

  return <group ref={groupRef} />;
}
