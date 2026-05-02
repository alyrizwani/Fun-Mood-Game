// Procedural audio — all sounds synthesized via Web Audio API, no files needed
let _ctx: AudioContext | null = null;
let _masterGain: GainNode | null = null;

function ctx(): AudioContext {
  if (!_ctx) {
    _ctx = new AudioContext();
    _masterGain = _ctx.createGain();
    _masterGain.gain.value = 0.6;
    _masterGain.connect(_ctx.destination);
  }
  if (_ctx.state === 'suspended') _ctx.resume();
  return _ctx;
}

function out(): AudioNode {
  ctx();
  return _masterGain!;
}

function noise(ac: AudioContext, duration: number): AudioBufferSourceNode {
  const sampleRate = ac.sampleRate;
  const buffer = ac.createBuffer(1, sampleRate * duration, sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = ac.createBufferSource();
  src.buffer = buffer;
  return src;
}

// ── Gunshot ────────────────────────────────────────────────────────────
export function playShoot() {
  try {
    const ac = ctx();
    const t = ac.currentTime;

    // Body click (tone)
    const osc = ac.createOscillator();
    const oscGain = ac.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(55, t + 0.07);
    oscGain.gain.setValueAtTime(0.35, t);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
    osc.connect(oscGain);
    oscGain.connect(out());
    osc.start(t);
    osc.stop(t + 0.09);

    // Noise burst (air crack)
    const n = noise(ac, 0.1);
    const nGain = ac.createGain();
    const nFilter = ac.createBiquadFilter();
    nFilter.type = 'bandpass';
    nFilter.frequency.value = 2200;
    nFilter.Q.value = 0.8;
    nGain.gain.setValueAtTime(0.5, t);
    nGain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    n.connect(nFilter);
    nFilter.connect(nGain);
    nGain.connect(out());
    n.start(t);
  } catch { /* audio may not be available */ }
}

// ── Empty clip click ──────────────────────────────────────────────────
export function playEmpty() {
  try {
    const ac = ctx();
    const t = ac.currentTime;
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(600, t);
    g.gain.setValueAtTime(0.12, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    osc.connect(g);
    g.connect(out());
    osc.start(t);
    osc.stop(t + 0.05);
  } catch { /* */ }
}

// ── Reload ────────────────────────────────────────────────────────────
export function playReload() {
  try {
    const ac = ctx();
    const t = ac.currentTime;

    // Two mechanical clicks
    [0, 0.25].forEach((offset, i) => {
      const freq = i === 0 ? 380 : 480;
      const osc = ac.createOscillator();
      const g = ac.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t + offset);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.4, t + offset + 0.06);
      g.gain.setValueAtTime(0.18, t + offset);
      g.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.07);
      osc.connect(g);
      g.connect(out());
      osc.start(t + offset);
      osc.stop(t + offset + 0.08);
    });

    // Mag insert whoosh
    const n = noise(ac, 0.4);
    const nGain = ac.createGain();
    const nFilter = ac.createBiquadFilter();
    nFilter.type = 'lowpass';
    nFilter.frequency.value = 800;
    nGain.gain.setValueAtTime(0.0, t + 0.1);
    nGain.gain.linearRampToValueAtTime(0.12, t + 0.2);
    nGain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
    n.connect(nFilter);
    nFilter.connect(nGain);
    nGain.connect(out());
    n.start(t + 0.1);
  } catch { /* */ }
}

// ── Hit enemy (confirmation ping) ────────────────────────────────────
export function playHitEnemy() {
  try {
    const ac = ctx();
    const t = ac.currentTime;
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, t);
    osc.frequency.exponentialRampToValueAtTime(900, t + 0.06);
    g.gain.setValueAtTime(0.22, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
    osc.connect(g);
    g.connect(out());
    osc.start(t);
    osc.stop(t + 0.07);
  } catch { /* */ }
}

// ── Kill (elimination fanfare) ────────────────────────────────────────
export function playKill() {
  try {
    const ac = ctx();
    const t = ac.currentTime;
    const notes = [880, 1100, 1320];
    notes.forEach((freq, i) => {
      const osc = ac.createOscillator();
      const g = ac.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + i * 0.07);
      g.gain.setValueAtTime(0.2, t + i * 0.07);
      g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.07 + 0.18);
      osc.connect(g);
      g.connect(out());
      osc.start(t + i * 0.07);
      osc.stop(t + i * 0.07 + 0.2);
    });
  } catch { /* */ }
}

// ── Player hit (grunt/impact) ─────────────────────────────────────────
export function playPlayerHit() {
  try {
    const ac = ctx();
    const t = ac.currentTime;

    const n = noise(ac, 0.15);
    const nGain = ac.createGain();
    const nFilter = ac.createBiquadFilter();
    nFilter.type = 'lowpass';
    nFilter.frequency.value = 600;
    nGain.gain.setValueAtTime(0.35, t);
    nGain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    n.connect(nFilter);
    nFilter.connect(nGain);
    nGain.connect(out());
    n.start(t);

    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(50, t + 0.1);
    g.gain.setValueAtTime(0.25, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    osc.connect(g);
    g.connect(out());
    osc.start(t);
    osc.stop(t + 0.12);
  } catch { /* */ }
}

// ── Player death ──────────────────────────────────────────────────────
export function playPlayerDeath() {
  try {
    const ac = ctx();
    const t = ac.currentTime;

    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.5);
    g.gain.setValueAtTime(0.4, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
    osc.connect(g);
    g.connect(out());
    osc.start(t);
    osc.stop(t + 0.6);

    // Low rumble
    const n = noise(ac, 0.5);
    const nGain = ac.createGain();
    const nFilter = ac.createBiquadFilter();
    nFilter.type = 'lowpass';
    nFilter.frequency.value = 200;
    nGain.gain.setValueAtTime(0.5, t);
    nGain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
    n.connect(nFilter);
    nFilter.connect(nGain);
    nGain.connect(out());
    n.start(t);
  } catch { /* */ }
}

// ── Player respawn ────────────────────────────────────────────────────
export function playRespawn() {
  try {
    const ac = ctx();
    const t = ac.currentTime;
    const notes = [440, 550, 660, 880];
    notes.forEach((freq, i) => {
      const osc = ac.createOscillator();
      const g = ac.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + i * 0.06);
      g.gain.setValueAtTime(0.15, t + i * 0.06);
      g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.06 + 0.12);
      osc.connect(g);
      g.connect(out());
      osc.start(t + i * 0.06);
      osc.stop(t + i * 0.06 + 0.15);
    });
  } catch { /* */ }
}

// ── Match start ────────────────────────────────────────────────────────
export function playMatchStart() {
  try {
    const ac = ctx();
    const t = ac.currentTime;
    // 3… 2… 1… GO
    [0, 0.5, 1.0].forEach((offset) => {
      const osc = ac.createOscillator();
      const g = ac.createGain();
      osc.type = 'square';
      osc.frequency.value = 660;
      g.gain.setValueAtTime(0.15, t + offset);
      g.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.12);
      osc.connect(g);
      g.connect(out());
      osc.start(t + offset);
      osc.stop(t + offset + 0.15);
    });
    // GO!
    const osc2 = ac.createOscillator();
    const g2 = ac.createGain();
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(880, t + 1.5);
    osc2.frequency.setValueAtTime(1100, t + 1.6);
    g2.gain.setValueAtTime(0.22, t + 1.5);
    g2.gain.exponentialRampToValueAtTime(0.001, t + 1.8);
    osc2.connect(g2);
    g2.connect(out());
    osc2.start(t + 1.5);
    osc2.stop(t + 1.9);
  } catch { /* */ }
}

// ── Match end ─────────────────────────────────────────────────────────
export function playMatchEnd() {
  try {
    const ac = ctx();
    const t = ac.currentTime;
    const notes = [660, 550, 440, 330];
    notes.forEach((freq, i) => {
      const osc = ac.createOscillator();
      const g = ac.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + i * 0.15);
      g.gain.setValueAtTime(0.2, t + i * 0.15);
      g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.15 + 0.25);
      osc.connect(g);
      g.connect(out());
      osc.start(t + i * 0.15);
      osc.stop(t + i * 0.15 + 0.3);
    });
  } catch { /* */ }
}

// ── Bot eliminated (short squawk) ─────────────────────────────────────
export function playBotDeath() {
  try {
    const ac = ctx();
    const t = ac.currentTime;
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(400, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.2);
    g.gain.setValueAtTime(0.18, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
    osc.connect(g);
    g.connect(out());
    osc.start(t);
    osc.stop(t + 0.22);
  } catch { /* */ }
}

// ── Low health warning beep ───────────────────────────────────────────
let _lowHealthTimer = 0;
export function tickLowHealthBeep(now: number) {
  if (now - _lowHealthTimer < 1200) return;
  _lowHealthTimer = now;
  try {
    const ac = ctx();
    const t = ac.currentTime;
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = 'sine';
    osc.frequency.value = 440;
    g.gain.setValueAtTime(0.18, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    osc.connect(g);
    g.connect(out());
    osc.start(t);
    osc.stop(t + 0.14);
  } catch { /* */ }
}
