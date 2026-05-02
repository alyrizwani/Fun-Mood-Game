import { useEffect, useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { sharedState } from './gameState';
import { ScoreEntry } from './types';

interface GameData {
  health: number;
  ammo: number;
  kills: number;
  deaths: number;
  matchTimer: number;
  isAlive: boolean;
  isReloading: boolean;
  scores: ScoreEntry[];
  hitFlash: boolean;
}

export default function HUD() {
  const isPointerLocked = useGameStore((s) => s.isPointerLocked);
  const playerName = useGameStore((s) => s.playerName);

  const [data, setData] = useState<GameData>({
    health: 100,
    ammo: 30,
    kills: 0,
    deaths: 0,
    matchTimer: 120,
    isAlive: true,
    isReloading: false,
    scores: [],
    hitFlash: false,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const hitFlash = Date.now() - sharedState.lastHitFlash < 150;
      const scores: ScoreEntry[] = [
        {
          id: 'player',
          name: playerName,
          kills: sharedState.playerKills,
          deaths: sharedState.playerDeaths,
          color: '#00ff88',
        },
        ...sharedState.bots.map((b) => ({
          id: b.id,
          name: b.name,
          kills: b.kills,
          deaths: 0,
          color: b.color,
        })),
      ].sort((a, b) => b.kills - a.kills);

      setData({
        health: Math.round(sharedState.playerHealth),
        ammo: sharedState.playerAmmo,
        kills: sharedState.playerKills,
        deaths: sharedState.playerDeaths,
        matchTimer: Math.ceil(sharedState.matchTimer),
        isAlive: sharedState.playerAlive,
        isReloading: sharedState.playerIsReloading,
        scores,
        hitFlash,
      });
    }, 80);
    return () => clearInterval(interval);
  }, [playerName]);

  const { health, ammo, kills, deaths, matchTimer, isAlive, isReloading, scores, hitFlash } = data;
  const healthPct = health / 100;
  const healthColor = healthPct > 0.6 ? '#00ff88' : healthPct > 0.3 ? '#ffaa00' : '#ff3333';

  const minutes = Math.floor(matchTimer / 60);
  const seconds = matchTimer % 60;
  const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  const timeColor = matchTimer <= 30 ? '#ff3333' : '#ffffff';

  return (
    <div style={{
      position: 'absolute', inset: 0, pointerEvents: 'none',
      zIndex: 10, fontFamily: "'Courier New', monospace",
    }}>
      {/* Hit flash overlay */}
      {hitFlash && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(255, 0, 0, 0.28)',
          pointerEvents: 'none',
        }} />
      )}

      {/* Death overlay */}
      {!isAlive && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column',
          background: 'rgba(0,0,0,0.5)',
        }}>
          <div style={{
            fontSize: '36px', fontWeight: 'bold',
            color: '#ff3333', letterSpacing: '6px',
            textShadow: '0 0 20px #ff3333',
          }}>
            ELIMINATED
          </div>
          <div style={{ fontSize: '14px', color: '#aaa', marginTop: '8px' }}>
            Respawning...
          </div>
        </div>
      )}

      {/* Click to lock prompt */}
      {!isPointerLocked && isAlive && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.6)',
        }}>
          <div style={{
            textAlign: 'center',
            padding: '24px 40px',
            border: '1px solid #00ff88',
            borderRadius: '8px',
            background: 'rgba(0,20,10,0.9)',
          }}>
            <div style={{ fontSize: '22px', color: '#00ff88', fontWeight: 'bold', letterSpacing: '3px' }}>
              CLICK TO PLAY
            </div>
            <div style={{ fontSize: '12px', color: '#888', marginTop: '8px' }}>
              WASD move · Mouse aim · LMB shoot · R reload · ESC pause
            </div>
          </div>
        </div>
      )}

      {/* Crosshair */}
      {isPointerLocked && isAlive && (
        <div style={{
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
        }}>
          <div style={{ position: 'relative', width: '22px', height: '22px' }}>
            <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '2px', height: '7px', background: 'rgba(255,255,255,0.85)' }} />
            <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '2px', height: '7px', background: 'rgba(255,255,255,0.85)' }} />
            <div style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', height: '2px', width: '7px', background: 'rgba(255,255,255,0.85)' }} />
            <div style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', height: '2px', width: '7px', background: 'rgba(255,255,255,0.85)' }} />
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '3px', height: '3px', background: 'rgba(255,255,255,0.9)', borderRadius: '50%' }} />
          </div>
        </div>
      )}

      {/* Timer (top center) */}
      <div style={{
        position: 'absolute', top: '16px', left: '50%', transform: 'translateX(-50%)',
        background: 'rgba(0,0,0,0.75)', border: `1px solid ${timeColor}`,
        borderRadius: '6px', padding: '6px 18px',
        color: timeColor, fontSize: '22px', fontWeight: 'bold', letterSpacing: '2px',
      }}>
        {timeStr}
      </div>

      {/* Kills (top left) */}
      <div style={{
        position: 'absolute', top: '16px', left: '16px',
        background: 'rgba(0,0,0,0.75)', border: '1px solid #00ff8866',
        borderRadius: '6px', padding: '6px 14px',
        color: '#00ff88',
      }}>
        <span style={{ color: '#555', fontSize: '9px', letterSpacing: '2px' }}>KILLS </span>
        <span style={{ fontSize: '22px', fontWeight: 'bold' }}>{kills}</span>
      </div>

      {/* Scoreboard (top right) */}
      <div style={{
        position: 'absolute', top: '16px', right: '16px',
        background: 'rgba(0,0,0,0.75)', border: '1px solid #222',
        borderRadius: '6px', padding: '8px 12px', minWidth: '140px',
      }}>
        <div style={{ color: '#555', fontSize: '9px', letterSpacing: '2px', marginBottom: '5px' }}>SCOREBOARD</div>
        {scores.slice(0, 5).map((s, i) => (
          <div key={s.id} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            color: s.id === 'player' ? '#00ff88' : (s.color || '#ccc'),
            fontSize: '11px', marginBottom: '3px',
            fontWeight: s.id === 'player' ? 'bold' : 'normal',
          }}>
            <span>{i === 0 ? '👑 ' : `${i + 1}. `}{s.id === 'player' ? playerName : s.name}</span>
            <span style={{ color: '#fff', marginLeft: '10px' }}>{s.kills}</span>
          </div>
        ))}
      </div>

      {/* Health (bottom left) */}
      <div style={{
        position: 'absolute', bottom: '24px', left: '24px',
        background: 'rgba(0,0,0,0.8)', border: `1px solid ${healthColor}44`,
        borderRadius: '8px', padding: '10px 16px', minWidth: '160px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{ color: '#555', fontSize: '9px', letterSpacing: '2px' }}>HEALTH</span>
          <span style={{ color: healthColor, fontSize: '18px', fontWeight: 'bold' }}>{health}</span>
        </div>
        <div style={{ width: '100%', height: '6px', background: '#111', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{
            width: `${healthPct * 100}%`, height: '100%',
            background: `linear-gradient(90deg, ${healthColor}88, ${healthColor})`,
            borderRadius: '3px', transition: 'width 0.2s ease',
          }} />
        </div>
      </div>

      {/* Ammo (bottom right) */}
      <div style={{
        position: 'absolute', bottom: '24px', right: '24px',
        background: 'rgba(0,0,0,0.8)', border: '1px solid #2a4a6a',
        borderRadius: '8px', padding: '10px 16px', textAlign: 'right',
      }}>
        <div style={{ color: '#555', fontSize: '9px', letterSpacing: '2px', marginBottom: '4px' }}>
          {isReloading ? 'RELOADING...' : 'AMMO'}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', justifyContent: 'flex-end' }}>
          <span style={{ color: ammo <= 5 ? '#ff3333' : isReloading ? '#ffaa00' : '#ffffff', fontSize: '26px', fontWeight: 'bold' }}>
            {ammo}
          </span>
          <span style={{ color: '#444', fontSize: '14px' }}>/ 30</span>
        </div>
        {ammo === 0 && !isReloading && (
          <div style={{ color: '#ff9900', fontSize: '9px', letterSpacing: '2px', marginTop: '2px' }}>PRESS R</div>
        )}
      </div>
    </div>
  );
}
