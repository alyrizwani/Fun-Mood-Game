import { useEffect, useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { sharedState } from './gameState';
import { ScoreEntry } from './types';

export default function EndScreen() {
  const winner = useGameStore((s) => s.winner);
  const playerName = useGameStore((s) => s.playerName);
  const setMode = useGameStore((s) => s.setMode);
  const resetGame = useGameStore((s) => s.resetGame);

  const [show, setShow] = useState(false);

  // Snapshot scores at match end
  const [scores] = useState<ScoreEntry[]>(() => [
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
  ].sort((a, b) => b.kills - a.kills));

  useEffect(() => {
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
    const t = setTimeout(() => setShow(true), 100);
    return () => clearTimeout(t);
  }, []);

  const isPlayerWinner = winner === playerName;

  const handlePlayAgain = () => {
    resetGame();
    window.location.reload();
  };

  const handleMainMenu = () => {
    sharedState.matchRunning = false;
    resetGame();
    setMode('menu');
  };

  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.85)',
      zIndex: 100,
      fontFamily: "'Courier New', monospace",
      opacity: show ? 1 : 0,
      transition: 'opacity 0.5s ease',
    }}>
      <div style={{
        textAlign: 'center',
        padding: '40px 60px',
        border: `2px solid ${isPlayerWinner ? '#00ff88' : '#ff3333'}`,
        borderRadius: '12px',
        background: 'rgba(0,5,15,0.95)',
        boxShadow: `0 0 40px ${isPlayerWinner ? '#00ff8833' : '#ff333333'}`,
        minWidth: '380px',
      }}>
        <div style={{ fontSize: '11px', letterSpacing: '4px', color: '#666', marginBottom: '8px' }}>
          MATCH OVER
        </div>

        <div style={{
          fontSize: '40px', fontWeight: 'bold',
          color: isPlayerWinner ? '#00ff88' : '#ff3333',
          letterSpacing: '4px',
          textShadow: `0 0 20px ${isPlayerWinner ? '#00ff88' : '#ff3333'}`,
          marginBottom: '4px',
        }}>
          {isPlayerWinner ? 'VICTORY!' : 'DEFEAT'}
        </div>
        <div style={{ color: '#888', fontSize: '13px', marginBottom: '28px' }}>
          {isPlayerWinner ? 'You dominated the match!' : `${winner} won the match`}
        </div>

        {/* Final scoreboard */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid #222',
          borderRadius: '8px',
          overflow: 'hidden',
          marginBottom: '28px',
        }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 60px 60px',
            padding: '8px 16px',
            borderBottom: '1px solid #222',
            color: '#555', fontSize: '10px', letterSpacing: '2px',
          }}>
            <span>PLAYER</span>
            <span style={{ textAlign: 'center' }}>KILLS</span>
            <span style={{ textAlign: 'center' }}>DEATHS</span>
          </div>
          {scores.map((s, i) => (
            <div key={s.id} style={{
              display: 'grid', gridTemplateColumns: '1fr 60px 60px',
              padding: '10px 16px',
              background: s.id === 'player' ? 'rgba(0,255,136,0.05)' : 'transparent',
              borderBottom: i < scores.length - 1 ? '1px solid #111' : 'none',
            }}>
              <span style={{
                color: s.id === 'player' ? '#00ff88' : (s.color || '#aaa'),
                fontWeight: s.id === 'player' ? 'bold' : 'normal',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}>
                {i === 0 && <span style={{ color: '#ffd700', fontSize: '13px' }}>1.</span>}
                {i !== 0 && <span style={{ color: '#444', fontSize: '10px' }}>{i + 1}.</span>}
                {s.id === 'player' ? playerName : s.name}
              </span>
              <span style={{ textAlign: 'center', color: '#fff', fontWeight: 'bold' }}>{s.kills}</span>
              <span style={{ textAlign: 'center', color: '#666' }}>{s.deaths}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            onClick={handlePlayAgain}
            style={{
              padding: '12px 28px',
              background: '#00ff88', color: '#000',
              border: 'none', borderRadius: '6px',
              fontSize: '13px', fontWeight: 'bold', letterSpacing: '2px',
              cursor: 'pointer', fontFamily: "'Courier New', monospace",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#00cc66')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#00ff88')}
          >
            PLAY AGAIN
          </button>
          <button
            onClick={handleMainMenu}
            style={{
              padding: '12px 28px',
              background: 'transparent', color: '#888',
              border: '1px solid #333', borderRadius: '6px',
              fontSize: '13px', fontWeight: 'bold', letterSpacing: '2px',
              cursor: 'pointer', fontFamily: "'Courier New', monospace",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#888'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#888'; e.currentTarget.style.borderColor = '#333'; }}
          >
            MAIN MENU
          </button>
        </div>
      </div>
    </div>
  );
}
