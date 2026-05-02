import { useGameStore } from './store/useGameStore';
import Landing from './pages/Landing';
import Lobby from './pages/Lobby';
import Game from './game/Game';

export default function App() {
  const mode = useGameStore((s) => s.mode);

  if (mode === 'menu') return <Landing />;
  if (mode === 'lobby') return <Lobby />;
  if (mode === 'playing' || mode === 'ended') return <Game />;
  return <Landing />;
}
