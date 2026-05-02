import { useEffect, useRef, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useKeyboardControls } from '@react-three/drei';
import * as THREE from 'three';
import { sharedState, nextBulletId } from './gameState';
import { useGameStore } from '../store/useGameStore';
import {
  PLAYER_SPEED,
  MAP_HALF,
  MOUSE_SENSITIVITY,
  MAX_AMMO,
  RELOAD_TIME,
  PLAYER_HEALTH,
  RESPAWN_TIME,
} from './constants';
import { BulletData, SPAWN_POINTS } from './types';

enum Controls {
  forward = 'forward',
  back = 'back',
  left = 'left',
  right = 'right',
}

const _moveDir = new THREE.Vector3();

export default function LocalPlayer() {
  const { camera, gl } = useThree();
  const [, getKeys] = useKeyboardControls<Controls>();
  const setPointerLocked = useGameStore((s) => s.setPointerLocked);
  const setMode = useGameStore((s) => s.setMode);
  const setWinner = useGameStore((s) => s.setWinner);
  const playerName = useGameStore((s) => s.playerName);
  const playerNameRef = useRef(playerName);
  playerNameRef.current = playerName;

  const requestPointerLock = useCallback(() => {
    gl.domElement.requestPointerLock();
  }, [gl]);

  useEffect(() => {
    const canvas = gl.domElement;

    const onMouseMove = (e: MouseEvent) => {
      if (!sharedState.isPointerLocked) return;
      sharedState.playerYaw -= e.movementX * MOUSE_SENSITIVITY;
      sharedState.playerPitch -= e.movementY * MOUSE_SENSITIVITY;
      sharedState.playerPitch = Math.max(-1.4, Math.min(1.4, sharedState.playerPitch));
    };

    const onPointerLockChange = () => {
      const locked = document.pointerLockElement === canvas;
      sharedState.isPointerLocked = locked;
      setPointerLocked(locked);
    };

    const onMouseDown = (e: MouseEvent) => {
      if (!sharedState.isPointerLocked) {
        requestPointerLock();
        return;
      }
      if (!sharedState.matchRunning || !sharedState.playerAlive) return;
      if (e.button === 0) tryShoot();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.code === 'KeyR' &&
        !sharedState.playerIsReloading &&
        sharedState.playerAmmo < MAX_AMMO &&
        sharedState.playerAlive
      ) {
        sharedState.playerIsReloading = true;
        sharedState.playerReloadTimer = RELOAD_TIME;
      }
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('pointerlockchange', onPointerLockChange);
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKeyDown);
    canvas.addEventListener('click', requestPointerLock);

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('pointerlockchange', onPointerLockChange);
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKeyDown);
      canvas.removeEventListener('click', requestPointerLock);
    };
  }, [gl, requestPointerLock, setPointerLocked]);

  function tryShoot() {
    if (!sharedState.playerAlive) return;
    if (sharedState.playerIsReloading) return;
    if (sharedState.playerAmmo <= 0) {
      sharedState.playerIsReloading = true;
      sharedState.playerReloadTimer = RELOAD_TIME;
      return;
    }
    sharedState.playerAmmo--;

    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    dir.normalize();

    const bullet: BulletData = {
      id: nextBulletId(),
      position: sharedState.playerPos.clone().addScaledVector(dir, 1.0),
      direction: dir,
      ownerId: 'player',
      ownerType: 'player',
      spawnTime: Date.now(),
      alive: true,
    };
    sharedState.bullets.push(bullet);
  }

  useFrame((_, delta) => {
    if (!sharedState.matchRunning) return;

    // Reload timer
    if (sharedState.playerIsReloading) {
      sharedState.playerReloadTimer -= delta;
      if (sharedState.playerReloadTimer <= 0) {
        sharedState.playerAmmo = MAX_AMMO;
        sharedState.playerIsReloading = false;
      }
    }

    // Respawn
    if (!sharedState.playerAlive) {
      sharedState.playerRespawnTimer -= delta;
      if (sharedState.playerRespawnTimer <= 0) {
        const sp = SPAWN_POINTS[Math.floor(Math.random() * SPAWN_POINTS.length)];
        sharedState.playerPos.set(sp[0], 0.9, sp[2]);
        sharedState.playerAlive = true;
        sharedState.playerHealth = PLAYER_HEALTH;
        sharedState.playerAmmo = MAX_AMMO;
        sharedState.playerIsReloading = false;
      }
      camera.position.copy(sharedState.playerPos);
      camera.rotation.order = 'YXZ';
      camera.rotation.y = sharedState.playerYaw;
      camera.rotation.x = sharedState.playerPitch;
      return;
    }

    // Movement
    const keys = getKeys();
    _moveDir.set(0, 0, 0);
    if (keys.forward) _moveDir.z -= 1;
    if (keys.back) _moveDir.z += 1;
    if (keys.left) _moveDir.x -= 1;
    if (keys.right) _moveDir.x += 1;

    if (_moveDir.lengthSq() > 0) {
      _moveDir.normalize();
      const y = sharedState.playerYaw;
      const fx = -Math.sin(y) * (-_moveDir.z) + Math.cos(y) * _moveDir.x;
      const fz = -Math.cos(y) * (-_moveDir.z) + (-Math.sin(y)) * _moveDir.x;
      const len = Math.sqrt(fx * fx + fz * fz);
      if (len > 0) {
        const speed = PLAYER_SPEED * delta;
        sharedState.playerPos.x += (fx / len) * speed;
        sharedState.playerPos.z += (fz / len) * speed;
      }
      sharedState.playerPos.x = Math.max(-MAP_HALF + 0.5, Math.min(MAP_HALF - 0.5, sharedState.playerPos.x));
      sharedState.playerPos.z = Math.max(-MAP_HALF + 0.5, Math.min(MAP_HALF - 0.5, sharedState.playerPos.z));
    }

    // Update camera
    camera.position.copy(sharedState.playerPos);
    camera.rotation.order = 'YXZ';
    camera.rotation.y = sharedState.playerYaw;
    camera.rotation.x = sharedState.playerPitch;

    // Match timer
    if (sharedState.matchTimer > 0) {
      sharedState.matchTimer -= delta;
      if (sharedState.matchTimer <= 0) {
        sharedState.matchTimer = 0;
        sharedState.matchRunning = false;

        let maxKills = sharedState.playerKills;
        let winnerName = playerNameRef.current;
        for (const bot of sharedState.bots) {
          if (bot.kills > maxKills) {
            maxKills = bot.kills;
            winnerName = bot.name;
          }
        }
        setWinner(winnerName);
        setMode('ended');
      }
    }
  });

  return null;
}
