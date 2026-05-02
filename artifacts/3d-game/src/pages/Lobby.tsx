import { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { initQuickPlay } from '../game/gameState';

export default function Lobby() {
  const playerName = useGameStore((s) => s.playerName);
  const roomCode = useGameStore((s) => s.roomCode);
  const isHost = useGameStore((s) => s.isHost);
  const setMode = useGameStore((s) => s.setMode);
  const resetGame = useGameStore((s) => s.resetGame);

  const [copied, setCopied] = useState(false);
  const [botCount, setBotCount] = useState(3);

  const copyCode = () => {
    navigator.clipboard.writeText(roomCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleStartGame = () => {
    initQuickPlay();
    resetGame();
    setMode('playing');
  };

  const handleBack = () => {
    setMode('menu');
  };

  return (
    <div style={{
      width: '100vw', height: '100vh',
      background: '#050a14',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Courier New', monospace",
      position: 'relative',
    }}>
      {/* Background grid */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `
          linear-gradient(rgba(0,100,255,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,100,255,0.04) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
        pointerEvents: 'none',
      }} />

      <div style={{
        position: 'relative', width: '420px',
        padding: '36px',
        background: 'rgba(0,5,15,0.95)',
        border: '1px solid #1a3a6a',
        borderRadius: '12px',
        boxShadow: '0 0 40px rgba(0,100,255,0.1)',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontSize: '11px', letterSpacing: '4px', color: '#555', marginBottom: '6px' }}>
            {isHost ? 'HOSTING' : 'JOINED'}
          </div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#3a9aff', letterSpacing: '3px' }}>
            LOBBY
          </div>
        </div>

        {/* Room code */}
        <div style={{
          background: 'rgba(58,154,255,0.08)',
          border: '1px solid #1a4a8a',
          borderRadius: '8px',
          padding: '14px 20px',
          marginBottom: '20px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '10px', color: '#555', letterSpacing: '3px', marginBottom: '8px' }}>
            ROOM CODE
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
            <span style={{ fontSize: '30px', fontWeight: 'bold', color: '#00ff88', letterSpacing: '8px' }}>
              {roomCode}
            </span>
            <button
              onClick={copyCode}
              style={{
                padding: '6px 12px',
                background: copied ? '#00cc66' : '#1a3a6a',
                color: copied ? '#000' : '#3a9aff',
                border: '1px solid',
                borderColor: copied ? '#00ff88' : '#3a9aff',
                borderRadius: '4px',
                fontSize: '10px',
                cursor: 'pointer',
                fontFamily: "'Courier New', monospace",
                letterSpacing: '1px',
                transition: 'all 0.2s',
              }}
            >
              {copied ? '✓ COPIED' : 'COPY'}
            </button>
          </div>
          <div style={{ fontSize: '10px', color: '#3a5a6a', marginTop: '8px' }}>
            Share this code with friends to invite them
          </div>
        </div>

        {/* Players */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '10px', color: '#555', letterSpacing: '2px', marginBottom: '10px' }}>
            PLAYERS (1/{isHost ? '8' : '8'})
          </div>
          <div style={{
            background: 'rgba(0,255,136,0.05)',
            border: '1px solid #1a3a2a',
            borderRadius: '6px',
            padding: '12px 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00ff88', boxShadow: '0 0 6px #00ff88' }} />
              <span style={{ color: '#00ff88', fontWeight: 'bold', letterSpacing: '1px' }}>{playerName}</span>
            </div>
            {isHost && (
              <span style={{ fontSize: '9px', letterSpacing: '2px', color: '#ffd700', background: 'rgba(255,215,0,0.1)', padding: '2px 8px', borderRadius: '3px', border: '1px solid #ffd700' }}>
                HOST
              </span>
            )}
          </div>

          {/* Waiting for players placeholder */}
          {[1, 2].map((i) => (
            <div key={i} style={{
              border: '1px dashed #1a2a3a',
              borderRadius: '6px',
              padding: '12px 16px',
              marginTop: '6px',
              display: 'flex', alignItems: 'center', gap: '10px',
              opacity: 0.4,
            }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#333' }} />
              <span style={{ color: '#333', fontSize: '12px' }}>Waiting for player...</span>
            </div>
          ))}
        </div>

        {/* Bot fill option */}
        {isHost && (
          <div style={{
            background: 'rgba(255,200,0,0.05)',
            border: '1px solid #2a2a0a',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '20px',
          }}>
            <div style={{ fontSize: '10px', color: '#888', letterSpacing: '2px', marginBottom: '10px' }}>
              BOT FILL
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setBotCount(n)}
                  style={{
                    width: '32px', height: '32px',
                    background: botCount === n ? '#ffaa00' : 'transparent',
                    color: botCount === n ? '#000' : '#888',
                    border: `1px solid ${botCount === n ? '#ffaa00' : '#333'}`,
                    borderRadius: '4px',
                    fontSize: '13px', fontWeight: 'bold',
                    cursor: 'pointer',
                    fontFamily: "'Courier New', monospace",
                    transition: 'all 0.15s',
                  }}
                >
                  {n}
                </button>
              ))}
              <span style={{ color: '#555', fontSize: '11px' }}>bots</span>
            </div>
          </div>
        )}

        {/* Action buttons */}
        {isHost ? (
          <button
            onClick={handleStartGame}
            style={{
              width: '100%', padding: '14px',
              background: 'linear-gradient(135deg, #00cc66, #00ff88)',
              color: '#000', border: 'none',
              borderRadius: '8px', fontSize: '14px',
              fontWeight: 'bold', letterSpacing: '4px',
              cursor: 'pointer', fontFamily: "'Courier New', monospace",
              marginBottom: '10px',
              boxShadow: '0 0 20px rgba(0,255,136,0.3)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            ▶ START MATCH
          </button>
        ) : (
          <div style={{
            textAlign: 'center', color: '#555',
            fontSize: '13px', padding: '14px',
            marginBottom: '10px',
            background: 'rgba(255,255,255,0.02)',
            borderRadius: '8px', border: '1px solid #111',
          }}>
            Waiting for host to start...
          </div>
        )}

        <button
          onClick={handleBack}
          style={{
            width: '100%', padding: '10px',
            background: 'transparent', color: '#555',
            border: '1px solid #222', borderRadius: '8px',
            fontSize: '12px', letterSpacing: '2px',
            cursor: 'pointer', fontFamily: "'Courier New', monospace",
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#888'; e.currentTarget.style.borderColor = '#444'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#555'; e.currentTarget.style.borderColor = '#222'; }}
        >
          ← BACK
        </button>
      </div>
    </div>
  );
}
