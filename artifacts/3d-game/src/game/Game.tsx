import { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { KeyboardControls } from '@react-three/drei';
import World from './World';
import LocalPlayer from './LocalPlayer';
import BotEntity from './BotEntity';
import BulletManager from './BulletManager';
import HUD from './HUD';
import EndScreen from './EndScreen';
import { sharedState } from './gameState';
import { useGameStore } from '../store/useGameStore';
import { BotData } from './types';
import { playMatchStart } from './soundManager';

const keyMap = [
  { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
  { name: 'back', keys: ['ArrowDown', 'KeyS'] },
  { name: 'left', keys: ['ArrowLeft', 'KeyA'] },
  { name: 'right', keys: ['ArrowRight', 'KeyD'] },
];

export default function Game() {
  const mode = useGameStore((s) => s.mode);
  const resetGame = useGameStore((s) => s.resetGame);

  // Snapshot the bot list once on mount — BotEntity + BulletManager must
  // share the exact same object references. Never call initQuickPlay here.
  const [bots] = useState<BotData[]>(() => sharedState.bots);

  useEffect(() => {
    sharedState.matchRunning = true;
    resetGame();
    playMatchStart();

    return () => {
      sharedState.matchRunning = false;
      if (document.pointerLockElement) document.exitPointerLock();
    };
  }, [resetGame]);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', background: '#050a14', overflow: 'hidden' }}>
      <KeyboardControls map={keyMap}>
        <Canvas
          shadows
          camera={{ fov: 80, near: 0.05, far: 300 }}
          gl={{ antialias: true, powerPreference: 'high-performance' }}
          style={{ width: '100%', height: '100%' }}
        >
          <fog attach="fog" args={['#050a14', 28, 75]} />
          <ambientLight intensity={0.25} color="#1a2a4a" />
          <directionalLight
            position={[8, 18, 8]}
            intensity={1.0}
            color="#c0d0ff"
            castShadow
            shadow-mapSize={[1024, 1024]}
            shadow-camera-near={0.5}
            shadow-camera-far={80}
            shadow-camera-left={-30}
            shadow-camera-right={30}
            shadow-camera-top={30}
            shadow-camera-bottom={-30}
          />
          <directionalLight position={[-8, 8, -8]} intensity={0.3} color="#ff3322" />

          <Suspense fallback={null}>
            <World />
            <LocalPlayer />
            <BulletManager />
            {bots.map((bot) => (
              <BotEntity key={bot.id} bot={bot} />
            ))}
          </Suspense>
        </Canvas>
      </KeyboardControls>

      <HUD />
      {mode === 'ended' && <EndScreen />}
    </div>
  );
}
