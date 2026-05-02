# DEADZONE — 3D Tactical Shooter

A web-based multiplayer first-person shooter built with React, Three.js, and WebSockets. Play against bots or invite friends to a private room.

## How to Play

### Controls
| Key / Input | Action |
|---|---|
| `W A S D` | Move |
| Mouse | Aim |
| Left Click | Shoot |
| `R` | Reload |
| `Esc` | Release mouse |

### Game Modes
- **Quick Play** — Drop straight into a match against bots. First to the most kills when the 2-minute timer runs out wins.
- **Create Room** — Host a private match and share the room code with friends.
- **Join Room** — Enter a room code to join a friend's match.

## Features

- **3D first-person perspective** with pointer-lock mouse look
- **Realistic bullet physics** — bullets travel at speed and stop on contact with any solid surface
- **Full cover system** — hide behind crates, metal barriers, pillars, and corner towers; bullets won't pass through
- **Bot AI** — bots chase, patrol, and shoot at the player with tuned spread and cooldown so they're challenging but beatable
- **HUD** — live health bar, ammo counter, kill/death scoreboard, and match timer
- **Respawn system** — die and respawn at a random spawn point after 3 seconds
- **End screen** — shows the winner and final scoreboard at match end
- **Procedural audio** — every action has a synthesized sound effect (no audio files required)

## Sound Effects

| Event | Sound |
|---|---|
| Shoot | Sharp crack + air burst |
| Empty clip | Dry click |
| Reload | Mechanical clicks + mag insert |
| Hit an enemy | High-pitched ping |
| Kill confirmed | 3-note rising fanfare |
| Taking damage | Bass thud |
| Player death | Falling tone + rumble |
| Respawn | 4-note chime |
| Match start | 3-2-1 countdown + GO tone |
| Match end | 4-note descending melody |
| Low health | Periodic warning beep |

## Arena Layout

- **Central raised platform** with neon green ring — high ground advantage
- **4 corner towers** — strong defensive positions
- **4 inner pillars** — close-range cover near the center
- **4 mid-axis metal barriers** — splits each lane, good for peeking
- **8 low concrete barriers** — prone cover along the outer ring
- **Scattered crate clusters** in every corner quadrant
- Neon-lit border walls and atmospheric colored point lighting throughout

## Tech Stack

| Layer | Technology |
|---|---|
| 3D rendering | Three.js via React Three Fiber |
| UI | React 19 + Vite |
| State | Zustand (UI) + shared mutable object (per-frame game state) |
| Multiplayer | WebSockets (Express + ws) |
| Audio | Web Audio API (procedural synthesis) |
| Collision | Sub-stepped AABB checks on all cover geometry |

## Development

```bash
# Install dependencies
pnpm install

# Start the game client
pnpm --filter @workspace/3d-game run dev

# Start the API / WebSocket server
pnpm --filter @workspace/api-server run dev
```
