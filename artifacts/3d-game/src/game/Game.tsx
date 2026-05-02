import { Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { KeyboardControls } from '@react-three/drei';
import * as THREE from 'three';
import World from './World';
import LocalPlayer from './LocalPlayer';
import BotEntity from './BotEntity';
import BulletManager from './BulletManager';
import HUD from './HUD';
import EndScreen from './EndScreen';
import { sharedState, initQuickPlay } from './gameState';
import { useGameStore } from '../store/useGameStore';

const keyMap = [
  { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
  { name: 'back', keys: ['ArrowDown', 'KeyS'] },
  { name: 'left', keys: ['ArrowLeft', 'KeyA'] },
  { name: 'right', keys: ['ArrowRight', 'KeyD'] },
];

export default function Game() {
  const mode = useGameStore((s) => s.mode);
  const resetGame = useGameStore((s) => s.resetGame);
  const setMode = useGameStore((s) => s.setMode);

  useEffect(() => {
    initQuickPlay();
    resetGame();
    console.log('Game initialized: Quick Play with bots');
    return () => {
      sharedState.matchRunning = false;
      if (document.pointerLockElement) {
        document.exitPointerLock();
      }
    };
  }, [resetGame]);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', background: '#050a14', overflow: 'hidden' }}>
      <KeyboardControls map={keyMap}>
        <Canvas
          shadows
          camera={{ fov: 80, near: 0.05, far: 300 }}
          gl={{
            antialias: true,
            powerPreference: 'high-performance',
          }}
          style={{ width: '100%', height: '100%' }}
        >
          {/* Fog */}
          <fog attach="fog" args={['#050a14', 30, 80]} />

          {/* Ambient + directional light */}
          <ambientLight intensity={0.35} color="#1a2a4a" />
          <directionalLight
            position={[10, 20, 10]}
            intensity={1.2}
            color="#c8d8ff"
            castShadow
            shadow-mapSize={[1024, 1024]}
          />
          <directionalLight position={[-10, 10, -10]} intensity={0.4} color="#ff4444" />

          <Suspense fallback={null}>
            <World />
            <LocalPlayer />
            <BulletManager />

            {/* Render bots */}
            {sharedState.bots.map((bot) => (
              <BotEntity key={bot.id} bot={bot} />
            ))}
          </Suspense>
        </Canvas>
      </KeyboardControls>

      {/* HTML overlay */}
      <HUD />
      {mode === 'ended' && <EndScreen />}
    </div>
  );
}
