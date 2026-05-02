import { create } from 'zustand';
import { GameMode } from '../game/types';

interface UIGameState {
  mode: GameMode;
  playerName: string;
  roomCode: string;
  isHost: boolean;
  isPointerLocked: boolean;
  hitFlash: boolean;
  winner: string | null;

  setMode: (mode: GameMode) => void;
  setPlayerName: (name: string) => void;
  setRoomCode: (code: string) => void;
  setIsHost: (isHost: boolean) => void;
  setPointerLocked: (locked: boolean) => void;
  setHitFlash: (flash: boolean) => void;
  setWinner: (winner: string | null) => void;
  resetGame: () => void;
}

export const useGameStore = create<UIGameState>((set) => ({
  mode: 'menu',
  playerName: 'PLAYER',
  roomCode: '',
  isHost: false,
  isPointerLocked: false,
  hitFlash: false,
  winner: null,

  setMode: (mode) => set({ mode }),
  setPlayerName: (name) => set({ playerName: name }),
  setRoomCode: (code) => set({ roomCode: code }),
  setIsHost: (isHost) => set({ isHost }),
  setPointerLocked: (locked) => set({ isPointerLocked: locked }),
  setHitFlash: (flash) => set({ hitFlash: flash }),
  setWinner: (winner) => set({ winner }),
  resetGame: () => set({ winner: null, hitFlash: false }),
}));
