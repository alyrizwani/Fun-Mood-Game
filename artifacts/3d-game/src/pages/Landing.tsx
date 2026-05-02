import { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { sharedState, initQuickPlay } from '../game/gameState';

export default function Landing() {
  const setMode = useGameStore((s) => s.setMode);
  const setPlayerName = useGameStore((s) => s.setPlayerName);
  const setRoomCode = useGameStore((s) => s.setRoomCode);
  const setIsHost = useGameStore((s) => s.setIsHost);
  const playerName = useGameStore((s) => s.playerName);

  const [localName, setLocalName] = useState(playerName);
  const [joinCode, setJoinCode] = useState('');
  const [activePanel, setActivePanel] = useState<'none' | 'join'>('none');
  const [error, setError] = useState('');

  function handleQuickPlay() {
    if (!localName.trim()) return;
    setPlayerName(localName.trim().toUpperCase());
    initQuickPlay();
    setMode('playing');
  }

  function handleCreateRoom() {
    if (!localName.trim()) return;
    setPlayerName(localName.trim().toUpperCase());
    const code = Math.random().toString(36).substring(2, 7).toUpperCase();
    setRoomCode(code);
    setIsHost(true);
    setMode('lobby');
  }

  function handleJoinRoom() {
    if (!localName.trim()) return;
    if (!joinCode.trim() || joinCode.trim().length < 4) {
      setError('Enter a valid room code');
      return;
    }
    setPlayerName(localName.trim().toUpperCase());
    setRoomCode(joinCode.trim().toUpperCase());
    setIsHost(false);
    setMode('lobby');
  }

  return (
    <div style={{
      width: '100vw', height: '100vh',
      background: '#050a14',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Courier New', monospace",
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Background grid effect */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `
          linear-gradient(rgba(0,100,255,0.05) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,100,255,0.05) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
        pointerEvents: 'none',
      }} />

      {/* Vignette */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.8) 100%)',
        pointerEvents: 'none',
      }} />

      {/* Scan line effect */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', textAlign: 'center', maxWidth: '440px', width: '100%', padding: '0 20px' }}>
        {/* Logo */}
        <div style={{ marginBottom: '8px' }}>
          <div style={{
            fontSize: '52px', fontWeight: 'bold',
            color: '#00ff88', letterSpacing: '6px',
            textShadow: '0 0 30px #00ff8888, 0 0 60px #00ff8844',
            lineHeight: 1,
          }}>
            DEADZONE
          </div>
          <div style={{ fontSize: '12px', letterSpacing: '8px', color: '#3a6a5a', marginTop: '4px' }}>
            3D TACTICAL SHOOTER
          </div>
        </div>

        {/* Divider */}
        <div style={{
          height: '1px', background: 'linear-gradient(90deg, transparent, #00ff8866, transparent)',
          margin: '24px 0',
        }} />

        {/* Name input */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '10px', color: '#555', letterSpacing: '2px', marginBottom: '6px', textAlign: 'left' }}>
            CALLSIGN
          </div>
          <input
            value={localName}
            onChange={(e) => setLocalName(e.target.value.toUpperCase().slice(0, 12))}
            maxLength={12}
            placeholder="ENTER YOUR NAME"
            style={{
              width: '100%', padding: '10px 14px',
              background: 'rgba(0,255,136,0.05)',
              border: '1px solid #1a4a3a',
              borderRadius: '6px',
              color: '#00ff88', fontSize: '15px',
              fontFamily: "'Courier New', monospace",
              letterSpacing: '2px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
            onFocus={(e) => e.target.style.borderColor = '#00ff88'}
            onBlur={(e) => e.target.style.borderColor = '#1a4a3a'}
          />
        </div>

        {/* Quick Play button */}
        <button
          onClick={handleQuickPlay}
          disabled={!localName.trim()}
          style={{
            width: '100%', padding: '16px',
            background: localName.trim() ? 'linear-gradient(135deg, #00cc66, #00ff88)' : '#0a2a1a',
            color: localName.trim() ? '#000' : '#3a5a4a',
            border: 'none', borderRadius: '8px',
            fontSize: '16px', fontWeight: 'bold',
            letterSpacing: '4px', cursor: localName.trim() ? 'pointer' : 'not-allowed',
            fontFamily: "'Courier New', monospace",
            marginBottom: '12px',
            transition: 'all 0.2s',
            boxShadow: localName.trim() ? '0 0 20px rgba(0,255,136,0.3)' : 'none',
          }}
          onMouseEnter={(e) => { if (localName.trim()) e.currentTarget.style.transform = 'scale(1.02)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
          ⚡ QUICK PLAY
        </button>

        {/* Room buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
          <button
            onClick={handleCreateRoom}
            disabled={!localName.trim()}
            style={{
              padding: '14px 10px',
              background: 'transparent',
              color: localName.trim() ? '#3a9aff' : '#1a3a5a',
              border: `1px solid ${localName.trim() ? '#1a4a8a' : '#0a1a2a'}`,
              borderRadius: '8px',
              fontSize: '12px', fontWeight: 'bold',
              letterSpacing: '2px', cursor: localName.trim() ? 'pointer' : 'not-allowed',
              fontFamily: "'Courier New', monospace",
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => { if (localName.trim()) { e.currentTarget.style.background = 'rgba(58,154,255,0.1)'; e.currentTarget.style.borderColor = '#3a9aff'; } }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = localName.trim() ? '#1a4a8a' : '#0a1a2a'; }}
          >
            🏠 CREATE ROOM
          </button>

          <button
            onClick={() => setActivePanel(activePanel === 'join' ? 'none' : 'join')}
            disabled={!localName.trim()}
            style={{
              padding: '14px 10px',
              background: activePanel === 'join' ? 'rgba(58,154,255,0.1)' : 'transparent',
              color: localName.trim() ? '#3a9aff' : '#1a3a5a',
              border: `1px solid ${activePanel === 'join' ? '#3a9aff' : localName.trim() ? '#1a4a8a' : '#0a1a2a'}`,
              borderRadius: '8px',
              fontSize: '12px', fontWeight: 'bold',
              letterSpacing: '2px', cursor: localName.trim() ? 'pointer' : 'not-allowed',
              fontFamily: "'Courier New', monospace",
              transition: 'all 0.2s',
            }}
          >
            🔑 JOIN ROOM
          </button>
        </div>

        {/* Join room input */}
        {activePanel === 'join' && (
          <div style={{ marginBottom: '12px' }}>
            {error && <div style={{ color: '#ff3333', fontSize: '11px', marginBottom: '6px' }}>{error}</div>}
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                value={joinCode}
                onChange={(e) => { setJoinCode(e.target.value.toUpperCase()); setError(''); }}
                placeholder="ROOM CODE"
                maxLength={8}
                style={{
                  flex: 1, padding: '10px 14px',
                  background: 'rgba(58,154,255,0.05)',
                  border: '1px solid #1a3a6a',
                  borderRadius: '6px',
                  color: '#3a9aff', fontSize: '14px',
                  fontFamily: "'Courier New', monospace",
                  letterSpacing: '3px',
                  outline: 'none',
                }}
                onFocus={(e) => e.target.style.borderColor = '#3a9aff'}
                onBlur={(e) => e.target.style.borderColor = '#1a3a6a'}
                onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
              />
              <button
                onClick={handleJoinRoom}
                style={{
                  padding: '10px 18px',
                  background: '#1a3a6a',
                  color: '#3a9aff',
                  border: '1px solid #3a9aff',
                  borderRadius: '6px',
                  fontSize: '12px', fontWeight: 'bold',
                  cursor: 'pointer', fontFamily: "'Courier New', monospace",
                  letterSpacing: '1px',
                }}
              >
                JOIN
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ color: '#2a3a3a', fontSize: '10px', marginTop: '20px' }}>
          WASD · MOUSE AIM · LMB SHOOT · R RELOAD
        </div>
      </div>
    </div>
  );
}
